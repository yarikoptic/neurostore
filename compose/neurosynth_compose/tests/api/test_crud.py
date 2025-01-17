import pytest
from marshmallow import fields
from ...models import User, Studyset, Annotation, Specification, MetaAnalysis, Project
from ...schemas import (
    StudysetSchema,
    AnnotationSchema,
    SpecificationSchema,
    MetaAnalysisSchema,
    ProjectSchema,
)
from ...schemas.analysis import StringOrNested


@pytest.mark.parametrize(
    "endpoint,model,schema",
    [
        ("studysets", Studyset, StudysetSchema),
        ("annotations", Annotation, AnnotationSchema),
        ("specifications", Specification, SpecificationSchema),
        ("meta-analyses", MetaAnalysis, MetaAnalysisSchema),
        ("projects", Project, ProjectSchema),
    ],
)
def test_create(auth_client, user_data, endpoint, model, schema):
    user = User.query.filter_by(name="user1").first()
    examples = model.query.filter_by(user=user).all()
    for example in examples:
        payload = schema().dump(example)
        if "id" in payload:
            del payload["id"]
        if "studyset" in payload:
            del payload["studyset"]
            payload["cached_studyset_id"] = example.studyset.id
        if "annotation" in payload:
            del payload["annotation"]
            payload["cached_annotation_id"] = example.annotation.id
        if "run_key" in payload:
            del payload["run_key"]
        if "url" in payload:
            del payload["url"]
        if "neurostore_url" in payload:
            del payload["neurostore_url"]
        if "neurostore_study" in payload:
            del payload["neurostore_study"]

        if isinstance(example, MetaAnalysis):
            del payload["neurostore_analysis"]
            del payload["cached_annotation"]
            del payload["cached_studyset"]

        if isinstance(example, Project):
            del payload["meta_analyses"]

        resp = auth_client.post(f"/api/{endpoint}", data=payload)

        assert resp.status_code == 200
        sf = schema().fields
        # do not check keys if they are nested (difficult to generally check)
        d_key_sf = {(sf[k].data_key if sf[k].data_key else k): v for k, v in sf.items()}
        for k, v in payload.items():
            if not isinstance(
                d_key_sf.get(k),
                (StringOrNested, fields.Nested),
            ):
                assert v == resp.json[k]


@pytest.mark.parametrize(
    "endpoint,model,schema",
    [
        ("studysets", Studyset, StudysetSchema),
        ("annotations", Annotation, AnnotationSchema),
        ("specifications", Specification, SpecificationSchema),
        ("meta-analyses", MetaAnalysis, MetaAnalysisSchema),
        ("projects", Project, ProjectSchema),
    ],
)
def test_read(auth_client, user_data, endpoint, model, schema):
    user = User.query.filter_by(name="user1").first()
    if hasattr(model, "public"):
        query = (model.user == user) | (model.public == True)  # noqa E712
    else:
        query = True
    expected_results = model.query.filter(query).all()

    resp = auth_client.get(f"/api/{endpoint}")

    assert resp.status_code == 200
    assert len(expected_results) == len(resp.json["results"])

    query_ids = set([res.id for res in expected_results])
    resp_ids = set([res["id"] for res in resp.json["results"]])
    assert query_ids == resp_ids

    # view one item
    one = auth_client.get(f"/api/{endpoint}/{list(resp_ids)[0]}")
    assert one.status_code == 200


@pytest.mark.parametrize(
    "endpoint,model,schema,update",
    [
        ("studysets", Studyset, StudysetSchema, {"snapshot": {"fake": "stuff"}}),
        ("annotations", Annotation, AnnotationSchema, {"snapshot": {"fake": "stuff"}}),
        ("specifications", Specification, SpecificationSchema, {"type": "NEW"}),
        ("meta-analyses", MetaAnalysis, MetaAnalysisSchema, {"name": "my meta"}),
        ("projects", Project, ProjectSchema, {"name": "my project"}),
    ],
)
def test_update(auth_client, db, session, user_data, endpoint, model, schema, update):
    user = User.query.filter_by(name="user1").first()
    record = model.query.filter_by(user=user).first()

    resp = auth_client.put(f"/api/{endpoint}/{record.id}", data=update)

    assert resp.status_code == 200

    k, v = list(update.items())[0]
    assert resp.json[k] == getattr(record, k) == v


# @pytest.mark.parametrize(
#     "endpoint,model,schema",
#     [
#         ("studysets", Studyset, StudysetSchema),
#         ("annotations", Annotation, AnnotationSchema),
#         ("studies", Study, StudySchema),
#         ("analyses", Analysis, AnalysisSchema),
#         ("conditions", Condition, ConditionSchema),
#         ("images", Image, ImageSchema),
#         ("points", Point, PointSchema),
#     ]
# )
# def test_delete(auth_client, mock_auth, user_data, endpoint, model, schema, session):
#     user = User.query.filter_by(name="user1").first()
#     record = model.query.filter_by(user=user).first()
#     r_id = record.id

#     resp = auth_client.delete(f"/api/{endpoint}/{r_id}")

#     assert resp.status_code == 200

#     assert model.query.filter_by(id=r_id).first() is None
