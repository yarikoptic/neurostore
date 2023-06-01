import pathlib

import connexion
from flask import abort, request, jsonify, current_app
from flask.views import MethodView

# from sqlalchemy.ext.associationproxy import ColumnAssociationProxyInstance
from marshmallow.exceptions import ValidationError
import sqlalchemy.sql.expression as sae
from sqlalchemy import func
from webargs.flaskparser import parser
from webargs import fields

from ..database import db
from ..models.analysis import (  # noqa E401
    Studyset,
    Annotation,
    MetaAnalysis,
    Specification,
    StudysetReference,
    AnnotationReference,
    MetaAnalysisResult,
    NeurovaultCollection,
    NeurovaultFile,
    NeurostoreStudy,
    NeurostoreAnalysis,
    Project,
)
from ..models.auth import User

from ..schemas import (  # noqa E401
    MetaAnalysisSchema,
    AnnotationSchema,
    StudysetSchema,
    SpecificationSchema,
    AnnotationReferenceSchema,
    StudysetReferenceSchema,
    MetaAnalysisResultSchema,
    NeurovaultCollectionSchema,
    NeurovaultFileSchema,
    NeurostoreStudySchema,
    ProjectSchema,
)
from .singular import singularize


def get_current_user():
    user = connexion.context.get("user")
    if user:
        return User.query.filter_by(external_id=connexion.context["user"]).first()
    return None


def view_maker(cls):
    proc_name = cls.__name__.removesuffix("View").removesuffix("Resource")
    basename = singularize(proc_name, custom={"MetaAnalyses": "MetaAnalysis"})

    class ClassView(cls):
        _model = globals()[basename]
        _schema = globals()[basename + "Schema"]

    ClassView.__name__ = cls.__name__

    return ClassView


class BaseView(MethodView):
    _model = None
    _nested = {}

    @classmethod
    def _external_request(cls, data, record, id):
        return False

    @classmethod
    def update_or_create(cls, data, id=None, commit=True):
        # Store all models so we can atomically update in one commit
        to_commit = []

        current_user = get_current_user()
        if not current_user:
            # user signed up with auth0, but has not made any queries yet...
            # should have endpoint to "create user" after sign on with auth0
            current_user = User(external_id=connexion.context["user"])
            db.session.add(current_user)
            db.session.commit()

        id = id or data.get("id", None)  # want to handle case of {"id": "asdfasf"}

        only_ids = set(data.keys()) - set(["id"]) == set()

        if id is None:
            record = cls._model()
            record.user = current_user
        else:
            record = cls._model.query.filter_by(id=id).first()
            if record is None and cls._model in (
                StudysetReference,
                AnnotationReference,
            ):
                record = cls._model(id=id)
                to_commit.append(record)
            elif record is None:
                abort(422)
            elif not only_ids and record.user_id != current_user.external_id:
                abort(403)
            elif only_ids:
                to_commit.append(record)

                if commit:
                    db.session.add_all(to_commit)
                    db.session.commit()

                return record

        # check if external request updated the data already
        committed = cls._external_request(data, record, id)

        # Update all non-nested attributes
        if not committed:
            for k, v in data.items():
                if k not in cls._nested and k not in ["id", "user"]:
                    setattr(record, k, v)

            to_commit.append(record)

        # Update nested attributes recursively
        for field, res_name in cls._nested.items():
            ResCls = globals()[res_name]
            if data.get(field) is not None:
                if isinstance(data.get(field), list):
                    nested = [
                        ResCls.update_or_create(rec, commit=False)
                        for rec in data.get(field)
                    ]
                    to_commit.extend(nested)
                else:
                    nested = ResCls.update_or_create(data.get(field), commit=False)
                    to_commit.append(nested)

                setattr(record, field, nested)

        if commit:
            db.session.add_all(to_commit)
            db.session.commit()

        return record


class ObjectView(BaseView):
    def get(self, id):
        id = id.replace("\x00", "\uFFFD")
        record = self._model.query.filter_by(id=id).first_or_404()
        args = parser.parse(self._user_args, request, location="query")

        return self.__class__._schema(context={"nested": args.get("nested")}).dump(
            record
        )

    def put(self, id):
        id = id.replace("\x00", "\uFFFD")
        request_data = self.insert_data(id, request.json)
        try:
            data = self.__class__._schema().load(request_data)
        except ValidationError as e:
            abort(422, description=f"input does not conform to specification: {str(e)}")

        with db.session.no_autoflush:
            record = self.__class__.update_or_create(data, id)

        return self.__class__._schema().dump(record)

    def delete(self, id):
        id = id.replace("\x00", "\uFFFD")
        record = self.__class__._model.query.filter_by(id=id).first()

        current_user = get_current_user()
        if record.user_id != current_user.external_id:
            abort(
                403,
                description=(
                    f"user {current_user.external_id} cannot change "
                    f"record owned by {record.user_id}."
                ),
            )
        else:
            db.session.delete(record)

        db.session.commit()

        return 204

    def insert_data(self, id, data):
        return data


LIST_USER_ARGS = {
    "search": fields.String(missing=None),
    "sort": fields.String(missing="created_at"),
    "page": fields.Int(missing=1),
    "desc": fields.Boolean(missing=True),
    "page_size": fields.Int(missing=20, validate=lambda val: val < 100),
    "source_id": fields.String(missing=None),
    "source": fields.String(missing=None),
    "unique": fields.Boolean(missing=False),
    "nested": fields.Boolean(missing=False),
    "user_id": fields.String(missing=None),
    "dataset_id": fields.String(missing=None),
    "export": fields.Boolean(missing=False),
    "data_type": fields.String(missing=None),
}


class ListView(BaseView):
    _only = None
    _search_fields = []
    _multi_search = None

    def __init__(self):
        # Initialize expected arguments based on class attributes
        self._fulltext_fields = self._multi_search or self._search_fields
        self._user_args = {
            **LIST_USER_ARGS,
            **{f: fields.Str() for f in self._fulltext_fields},
        }

    def search(self):
        # Parse arguments using webargs
        args = parser.parse(self._user_args, request, location="query")

        m = self._model  # for brevity
        q = m.query

        # Search
        s = args["search"]

        # query items that are owned by a user_id
        if args.get("user_id"):
            q = q.filter(m.user_id == args.get("user_id"))

        # query items that are public and/or you own them
        if hasattr(m, "public"):
            current_user = get_current_user()
            q = q.filter(sae.or_(m.public == True, m.user == current_user))  # noqa E712

        # query annotations for a specific dataset
        if args.get("dataset_id"):
            q = q.filter(m.dataset_id == args.get("dataset_id"))

        # For multi-column search, default to using search fields
        if s is not None and self._fulltext_fields:
            search_expr = [
                getattr(m, field).ilike(f"%{s}%") for field in self._fulltext_fields
            ]
            q = q.filter(sae.or_(*search_expr))

        # Alternatively (or in addition), search on individual fields.
        for field in self._search_fields:
            s = args.get(field, None)
            if s is not None:
                q = q.filter(getattr(m, field).ilike(f"%{s}%"))

        # Sort
        sort_col = args["sort"]
        desc = False if sort_col != "created_at" else args["desc"]
        desc = {False: "asc", True: "desc"}[desc]

        attr = getattr(m, sort_col)

        # Case-insensitive sorting
        if sort_col != "created_at":
            attr = func.lower(attr)

        # TODO: if the sort field is proxied, bad stuff happens. In theory
        # the next two lines should address this by joining the proxied model,
        # but weird things are happening. look into this as time allows.
        # if isinstance(attr, ColumnAssociationProxyInstance):
        #     q = q.join(*attr.attr)
        q = q.order_by(getattr(attr, desc)())

        records = q.paginate(
            page=args["page"], per_page=args["page_size"], error_out=False
        ).items
        # check if results should be nested
        nested = True if args.get("nested") else False
        content = self.__class__._schema(
            only=self._only, many=True, context={"nested": nested}
        ).dump(records)
        response = {
            "metadata": {},
            "results": content,
        }
        return jsonify(response), 200

    def post(self):
        # TODO: check to make sure current user hasn't already created a
        # record with most/all of the same details (e.g., DOI for studies)

        # Parse arguments using webargs
        # args = parser.parse(self._user_args, request, location="query")

        try:
            data = parser.parse(self.__class__._schema, request)
        except ValidationError as e:
            abort(422, description=f"input does not conform to specification: {str(e)}")

        with db.session.no_autoflush:
            record = self.__class__.update_or_create(data)
        return self.__class__._schema().dump(record)


# Individual resource views


@view_maker
class MetaAnalysesView(ObjectView, ListView):
    _search_fields = ("name", "description")
    _nested = {
        "studyset": "StudysetsView",
        "annotation": "AnnotationsView",
        "results": "MetaAnalysisResultsView",
    }

    def post(self):
        try:
            data = parser.parse(self.__class__._schema, request)
        except ValidationError as e:
            abort(422, description=f"input does not conform to specification: {str(e)}")

        with db.session.no_autoflush:
            record = self.__class__.update_or_create(data)
            # create neurostore study
            ns_analysis = NeurostoreAnalysis(
                meta_analysis=record, neurostore_study=record.project.neurostore_study
            )
            db.session.add(ns_analysis)
            db.session.commit()
        return self.__class__._schema().dump(record)


@view_maker
class AnnotationsView(ObjectView, ListView):
    _nested = {
        "annotation_reference": "AnnotationReferencesResource",
        "studyset": "StudysetsView",
    }


@view_maker
class StudysetsView(ObjectView, ListView):
    _nested = {"studyset_reference": "StudysetReferencesResource"}


@view_maker
class SpecificationsView(ObjectView, ListView):
    pass


@view_maker
class StudysetReferencesResource(ObjectView):
    pass


@view_maker
class AnnotationReferencesResource(ObjectView):
    pass


@view_maker
class MetaAnalysisResultsView(ObjectView, ListView):
    _nested = {
        "neurovault_collection": "NeurovaultCollectionsView",
        "specification_snapshot": "SpecificationsView",
        "studyset_snapshot": "StudysetsView",
        "annotation_snapshot": "AnnotationsView",
    }

    def post(self):
        try:
            data = parser.parse(self.__class__._schema, request)
        except ValidationError as e:
            abort(422, description=f"input does not conform to specification: {str(e)}")

        with db.session.no_autoflush:
            # add snapshots to cached_studyset/annotation (if not already set)
            meta = MetaAnalysis.query.filter_by(id=data["meta_analysis_id"]).one()
            if meta.studyset.snapshot is None or meta.annotation.snapshot is None:
                meta.studyset.snapshot = data.pop("studyset_snapshot", None)
                meta.annotation.snapshot = data.pop("annotation_snapshot", None)
                db.session.add(meta)
            record = self.__class__.update_or_create(data)
            # create neurovault collection
            nv_collection = NeurovaultCollection(result=record)
            create_neurovault_collection(nv_collection)
            db.session.add(nv_collection)
            db.session.commit()
        return self.__class__._schema().dump(record)

    def put(self, id):
        from functools import partial
        from .tasks import file_upload_neurovault
        from celery import group

        result = self._model.query.filter_by(id=id).one()

        if request.files:
            stat_maps = request.files.getlist("statistical_maps")
            cluster_tables = request.files.getlist("cluster_tables")
            diagnostic_tables = request.files.getlist("diagnostic_tables")
            (
                records,
                stat_map_fnames,
                cluster_table_fnames,
                diagnostic_table_fnames,
            ) = parse_upload_files(result, stat_maps, cluster_tables, diagnostic_tables)

            # parse the first diagnostic table if it exists (for now)
            # most cases there should only be one diagnostic table
            if len(diagnostic_table_fnames) > 0:
                with open(diagnostic_table_fnames[0], "r") as dt:
                    tsv_data = dt.read()
                    result.diagnostic_table = tsv_data
                records.append(result)

            db.session.add_all(records)
            db.session.commit()

            # upload the individual statistical maps
            nv_upload_tasks = []
            for fpath, record in stat_map_fnames.items():
                nv_upload_tasks.append(file_upload_neurovault.s(str(fpath), record.id))

            nv_upload_group = group(nv_upload_tasks)
            nv_upload_results = nv_upload_group.apply_async()

            # get the neurostore analysis
            if result.meta_analysis.neurostore_analysis:
                ns_analysis = result.meta_analysis.neurostore_analysis
            else:
                ns_analysis = NeurostoreAnalysis(
                    neurostore_study=result.meta_analysis.project.neurostore_study,
                    meta_analysis=result.meta_analysis,
                )

            # when the images are uploaded, put the data on neurostore
            def celery_ns_analysis(output, ns_analysis, cluster_table, nv_collection):
                return create_or_update_neurostore_analysis(
                    ns_analysis, cluster_table, nv_collection
                )

            # callback for creating analysis after neurovault uploads
            cb_ns_analysis = partial(
                celery_ns_analysis,
                ns_analysis=ns_analysis,
                cluster_table=cluster_table_fnames[0] if cluster_table_fnames else None,
                nv_collection=result.neurovault_collection,
            )
            nv_upload_results.then(cb_ns_analysis)

        return self.__class__._schema().dump(result)


@view_maker
class NeurovaultCollectionsView(ObjectView, ListView):
    _nested = {"files": "NeurovaultFilesView"}


@view_maker
class NeurovaultFilesView(ObjectView, ListView):
    pass


@view_maker
class NeurostoreStudiesView(ObjectView, ListView):
    pass


@view_maker
class ProjectsView(ObjectView, ListView):
    _nested = {
        "meta_analyses": "MetaAnalysesView",
    }

    def post(self):
        try:
            data = parser.parse(self.__class__._schema, request)
        except ValidationError as e:
            abort(422, description=f"input does not conform to specification: {str(e)}")

        with db.session.no_autoflush:
            record = self.__class__.update_or_create(data)
            # create neurostore study
            ns_study = NeurostoreStudy(project=record)
            db.session.add(ns_study)
            db.session.commit()
            create_or_update_neurostore_study(ns_study)
            db.session.add(ns_study)
            db.session.commit()
        return self.__class__._schema().dump(record)


def create_neurovault_collection(nv_collection):
    import flask
    from pynv import Client
    from datetime import datetime
    from flask import current_app as app

    meta_analysis = nv_collection.result.meta_analysis

    collection_name = " : ".join(
        [meta_analysis.name, datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")]
    )

    url = f"{flask.request.host_url.rstrip('/')}/meta-analyses/{meta_analysis.id}"
    try:
        api = Client(access_token=app.config["NEUROVAULT_ACCESS_TOKEN"])
        collection = api.create_collection(
            collection_name,
            description=meta_analysis.description,
            full_dataset_url=url,
        )

        nv_collection.collection_id = collection["id"]

    except Exception:
        abort(
            422,
            f"Error creating collection named: {collection_name}, "
            "perhaps one with that name already exists?",
        )

    return nv_collection


def create_or_update_neurostore_study(ns_study):
    from flask import request
    from auth0.v3.authentication.get_token import GetToken
    from .neurostore import neurostore_session

    access_token = request.headers.get("Authorization")
    # use the client to authenticate if user credentials were not used
    if not access_token:
        domain = current_app.config["AUTH0_BASE_URL"].lstrip("https://")
        g_token = GetToken(domain)
        token_resp = g_token.client_credentials(
            client_id=current_app.config["AUTH0_CLIENT_ID"],
            client_secret=current_app.config["AUTH0_CLIENT_SECRET"],
            audience=current_app.config["AUTH0_API_AUDIENCE"],
        )
        access_token = " ".join([token_resp["token_type"], token_resp["access_token"]])

    ns_ses = neurostore_session(access_token)

    study_data = {
        "name": getattr(ns_study.project, "name", "Untitled"),
        "description": getattr(ns_study.project, "description", None),
        "level": "meta",
    }

    try:
        if ns_study.neurostore_id:
            ns_ses.put(f"/api/studies/{ns_study.neurostore_id}", json=study_data)
        else:
            ns_study_res = ns_ses.post("/api/studies/", json=study_data)
            ns_study.neurostore_id = ns_study_res.json()["id"]
    except Exception as exception:  # noqa: E722
        ns_study.traceback = str(exception)
        ns_study.status = "FAILED"

    return ns_study


def create_or_update_neurostore_analysis(ns_analysis, cluster_table, nv_collection):
    from flask import request, current_app
    from auth0.v3.authentication.get_token import GetToken
    import pandas as pd
    from .neurostore import neurostore_session

    # get access token from user if it exists
    access_token = request.headers.get("Authorization")

    # use the client to authenticate if user credentials were not used
    if not access_token:
        domain = current_app.config["AUTH0_BASE_URL"].lstrip("https://")
        g_token = GetToken(domain)
        token_resp = g_token.client_credentials(
            client_id=current_app.config["AUTH0_CLIENT_ID"],
            client_secret=current_app.config["AUTH0_CLIENT_SECRET"],
            audience=current_app.config["AUTH0_API_AUDIENCE"],
        )
        access_token = " ".join([token_resp["token_type"], token_resp["access_token"]])

    ns_ses = neurostore_session(access_token)

    # get the study(project) the (meta)analysis is associated with
    analysis_data = {
        "name": ns_analysis.meta_analysis.name or "Untitled",
        "study": ns_analysis.neurostore_study_id,
    }

    # parse the cluster table to get coordinates
    points = []
    if cluster_table:
        cluster_df = pd.read_csv(cluster_table, sep="\t")
        point_idx = 0
        for _, row in cluster_df.iterrows():
            point = {
                "coordinates": [row.X, row.Y, row.Z],
                "kind": "center of mass",  # make this dynamic
                "space": "MNI",  # make this dynamic
                "values": [
                    {
                        "kind": "Z",
                        "value": row["Peak Stat"],
                    }
                ],
                "order": point_idx
            }
            if not pd.isna(row["Cluster Size (mm3)"]):
                point["subpeak"] = True
                point["cluster_size"] = row["Cluster Size (mm3)"]
            else:
                point["subpeak"] = False
            points.append(point)
            point_idx += 1
    # reference the uploaded images on neurovault to associate images
    images = []
    for nv_file in nv_collection.files:
        image = {
            "url": nv_file.url,
            "filename": nv_file.filename,
            "space": nv_file.space,
            "value_type": nv_file.value_type,
        }
        images.append(image)

    if points:
        analysis_data["points"] = points
    if images:
        analysis_data["images"] = images

    try:
        # if the analysis already exists, update it
        if ns_analysis.neurostore_id:
            ns_analysis_res = ns_ses.put(
                f"/api/analyses/{ns_analysis.neurostore_id}", json=analysis_data
            )
        else:
            # create a new analysis
            ns_analysis_res = ns_ses.post("/api/analyses/", json=analysis_data)

<<<<<<< HEAD
        if ns_analysis_res.status_code != 200:
            ns_analysis.status = "FAILED"
            ns_analysis.traceback = ns_analysis.json()
        else:
            ns_analysis.neurostore_id = ns_analysis_res.json()["id"]
            ns_analysis.status = "OK"
=======
        ns_analysis.neurostore_id = ns_analysis_res.json()["id"]

        ns_analysis.status = "OK"
>>>>>>> acb3f15ff0e4d1fe7137cbf195f30ff609e41a15
    except Exception as exception:  # noqa: E722
        ns_analysis.traceback = str(exception)
        ns_analysis.status = "FAILED"

    db.session.add(ns_analysis)
    db.session.commit()

    return ns_analysis


def parse_upload_files(result, stat_maps, cluster_tables, diagnostic_tables):
    records = []
    file_dir = pathlib.Path(current_app.config["FILE_DIR"], result.id)
    file_dir.mkdir(parents=True, exist_ok=True)

    # save data to upload to neurovault
    stat_map_fnames = {}
    for m in stat_maps:
        m_path = file_dir / m.filename
        m.save(m_path)
        stat_map_fnames[m_path] = NeurovaultFile()

    # save data to upload to neurostore
    cluster_table_fnames = []
    for c in cluster_tables:
        c_path = file_dir / c.filename
        c.save(c_path)
        cluster_table_fnames.append(c_path)

    # save data for presenting diagnostics
    diagnostic_table_fnames = []
    for d in diagnostic_tables:
        d_path = file_dir / d.filename
        d.save(d_path)
        diagnostic_table_fnames.append(d_path)

    # get the collection_id (or create collection)
    if result.neurovault_collection:
        nv_collection = result.neurovault_collection
    else:
        nv_collection = NeurovaultCollection(result=result)
        create_neurovault_collection(nv_collection)
        # append the collection to be committed
        records.append(nv_collection)

    # append the existing NeurovaultFiles to be committed
    for record in stat_map_fnames.values():
        record.neurovault_collection = nv_collection
        records.append(record)

    return records, stat_map_fnames, cluster_table_fnames, diagnostic_table_fnames
