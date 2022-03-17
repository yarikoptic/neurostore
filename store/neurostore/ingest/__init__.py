"""
Ingest and sync data from various sources (Neurosynth, NeuroVault, etc.).
"""
import os.path as op
import re
from pathlib import Path

import numpy as np
import pandas as pd
import requests
from scipy import sparse
from dateutil.parser import parse as parse_date
from neurostore.database import db
from neurostore.models import (
    Analysis,
    AnalysisConditions,
    AnnotationAnalysis,
    Annotation,
    Condition,
    Image,
    Point,
    Study,
    Dataset,
)
from neurostore.models.data import DatasetStudy, _check_type


def ingest_neurovault(verbose=False, limit=20):

    # Store existing studies for quick lookup
    all_studies = {s.doi: s for s in Study.query.filter(Study.doi.isnot(None)).all()}

    # create unknown condition if it does not exist
    unknown_condition = Condition.query.filter_by(
        name="UNKNOWN").first() or Condition(
            name="UNKNOWN",
            description="please update with better description"
        )

    def add_collection(data):
        if data["DOI"] in all_studies:
            print("Skipping {} (already exists)...".format(data["DOI"]))
            return
        collection_id = data.pop('id')
        s = Study(
            name=data.pop("name", None),
            description=data.pop("description", None),
            doi=data.pop("DOI", None),
            authors=data.pop("authors", None),
            publication=data.pop("journal_name", None),
            source_id=collection_id,
            metadata_=data,
            source="neurovault")

        space = data.get("coordinate_space", None)
        # Process images
        url = "https://neurovault.org/api/collections/{}/images/?format=json"
        image_url = url.format(collection_id)
        data = requests.get(image_url).json()
        analyses = {}
        images = []
        conditions = set()
        for img in data["results"]:
            aname = img["name"]
            if aname not in analyses:
                condition = img.get('cognitive_paradigm_cogatlas')
                analysis_kwargs = {
                    "name": aname,
                    "description": img['description'],
                    "study": s,
                }

                analysis = Analysis(**analysis_kwargs)
                if condition:
                    cond = next(
                        (
                            cond for cond in list(conditions) + Condition.query.all()
                            if cond.name == condition), Condition(name=condition)
                    )
                    conditions.add(cond)
                else:
                    cond = unknown_condition

                analysis.analysis_conditions.append(
                    AnalysisConditions(weight=1, condition=cond)
                )

                analyses[aname] = analysis
            else:
                analysis = analyses[aname]
            space = space or "Unknown" if img.get("not_mni", False) else "MNI"
            type_ = img.get("map_type", "Unknown")
            if re.match(r"\w\smap.*", type_):
                type_ = type_[0]
            image = Image(
                url=img["file"],
                space=space,
                value_type=type_,
                analysis=analysis,
                data=img,
                filename=op.basename(img["file"]),
                add_date=parse_date(img["add_date"]),
            )
            images.append(image)

        db.session.add_all([s] + list(analyses.values()) + images + list(conditions))
        db.session.commit()
        all_studies[s.name] = s
        return s

    url = "https://neurovault.org/api/collections.json"
    count = 0

    while True:
        data = requests.get(url).json()
        url = data["next"]
        studies = list(filter(None, [
            add_collection(c)
            for c in data["results"]
            if c["DOI"] is not None and c["number_of_images"]
        ]))
        db.session.add_all(studies)
        db.session.commit()
        count += len(studies)
        if (limit is not None and count >= int(limit)) or not url:
            break


def ingest_neurosynth(max_rows=None):

    coords_file = (
        Path(__file__).parent.parent / "data" / "data-neurosynth_version-7_coordinates.tsv.gz"
    )
    metadata_file = (
        Path(__file__).parent.parent / "data" / "data-neurosynth_version-7_metadata.tsv.gz"
    )

    feature_file = Path(__file__).parent.parent /\
        "data" /\
        "data-neurosynth_version-7_vocab-terms_source-abstract_type-tfidf_features.npz"

    vocab_file = Path(__file__).parent.parent /\
        "data" /\
        "data-neurosynth_version-7_vocab-terms_vocabulary.txt"

    coord_data = pd.read_table(coords_file, dtype={"id": str})
    coord_data = coord_data.set_index("id")
    metadata = pd.read_table(metadata_file, dtype={"id": str})
    metadata = metadata.set_index("id")
    # load annotations
    features = sparse.load_npz(feature_file).todense()
    vocabulary = np.loadtxt(vocab_file, dtype=str, delimiter="\t")
    annotations = pd.DataFrame(features, columns=vocabulary)

    if max_rows is not None:
        metadata = metadata.iloc[:max_rows]
        annotations = annotations.iloc[:max_rows]

    # create unkown condition if it does not exist
    unknown_condition = Condition.query.filter_by(
        name="UNKNOWN").first() or Condition(
            name="UNKNOWN",
            description="please update with better description"
        )
    # create dataset object
    d = Dataset(
        name="neurosynth",
        description="TODO",
        publication="Nature Methods",
        pmid="21706013",
        doi="10.1038/nmeth.1635",
        authors="Yarkoni T, Poldrack RA, Nichols TE, Van Essen DC, Wager TD",
        public=True
    )

    studies = []
    to_commit = []
    with db.session.no_autoflush:
        for (metadata_row, annotation_row) in zip(
            metadata.itertuples(), annotations.itertuples(index=False)
        ):
            id_ = metadata_row.Index
            study_coord_data = coord_data.loc[[id_]]
            md = {
                "year": int(metadata_row.year),
            }
            s = Study(
                name=metadata_row.title,
                authors=metadata_row.authors,
                year=metadata_row.year,
                publication=metadata_row.journal,
                metadata=md,
                pmid=id_,
                doi=metadata_row.doi,
                source="neurosynth",
                source_id=id_,
            )
            analyses = []
            points = []

            for t_id, df in study_coord_data.groupby("table_id"):
                a = Analysis(
                    name="UNKNOWN",
                    study=s,
                    analysis_conditions=[
                        AnalysisConditions(condition=unknown_condition, weight=1),
                    ],
                )
                analyses.append(a)
                for _, p in df.iterrows():
                    point = Point(
                        x=p["x"],
                        y=p["y"],
                        z=p["z"],
                        space=metadata_row.space,
                        kind="unknown",
                        analysis=a,
                    )
                    points.append(point)
            to_commit.extend(points)
            to_commit.extend(analyses)
            studies.append(s)

        # add studies to dataset
        d.studies = studies
        db.session.add(d)
        db.session.commit()

        # create annotation object
        annot = Annotation(
            name="neurosynth",
            source="neurostore",
            source_id=None,
            description="TODO",
            dataset=d,
        )

        # collect notes (single annotations) for each analysis
        notes = []
        for (metadata_row, annotation_row) in zip(
            metadata.itertuples(), annotations.itertuples(index=False)
        ):
            id_ = metadata_row.Index
            study_coord_data = coord_data.loc[[id_]]
            study = Study.query.filter_by(pmid=id_).one()
            dataset_study = DatasetStudy.query.filter_by(
                study_id=study.id, dataset_id=d.id
            ).one()

            for analysis in study.analyses:
                # add annotation
                notes.append(
                    AnnotationAnalysis(
                        note=annotation_row._asdict(),
                        analysis=analysis,
                        annotation=annot,
                        dataset_study=dataset_study,
                    )
                )

        # add notes to annotation
        annot.note_keys = {k: _check_type(v) for k, v in annotation_row._asdict().items()}
        annot.annotation_analyses = notes
        db.session.add(annot)
        db.session.commit()


def ingest_neuroquery(max_rows=None):

    coords_file = (
        Path(__file__).parent.parent / "data" / "data-neuroquery_version-1_coordinates.tsv.gz"
    )
    metadata_file = (
        Path(__file__).parent.parent / "data" / "data-neuroquery_version-1_metadata.tsv.gz"
    )

    coord_data = pd.read_table(coords_file, dtype={"id": str})
    coord_data = coord_data.set_index("id")
    metadata = pd.read_table(metadata_file, dtype={"id": str})
    metadata = metadata.set_index("id")

    if max_rows is not None:
        metadata = metadata.iloc[:max_rows]

    # create unkown condition if it does not exist
    unknown_condition = Condition.query.filter_by(
        name="UNKNOWN").first() or Condition(
            name="UNKNOWN",
            description="please update with better description"
        )

    for id_, metadata_row in metadata.iterrows():
        study_coord_data = coord_data.loc[[id_]]
        s = Study(
            name=metadata_row["title"],
            metadata=dict(),
            source="neuroquery",
            pmid=id_,
            source_id=id_,
        )
        analyses = []
        points = []

        for t_id, df in study_coord_data.groupby("table_id"):
            a = Analysis(
                name="UNKNOWN",
                study=s,
                analysis_conditions=[
                        AnalysisConditions(condition=unknown_condition, weight=1),
                    ],
                )
            analyses.append(a)
            for _, p in df.iterrows():
                point = Point(
                    x=p["x"],
                    y=p["y"],
                    z=p["z"],
                    space="MNI",
                    kind="unknown",
                    analysis=a,
                )
                points.append(point)

        db.session.add_all([s] + analyses + points)
        db.session.commit()

    # make a neuroquery dataset
    d = Dataset(
        name="neuroquery",
        description="TODO",
        publication="eLife",
        pmid="32129761",
        doi="10.7554/eLife.53385",
        public=True,
        studies=Study.query.filter_by(source="neuroquery").all(),
    )
    db.session.add(d)
    db.session.commit()


def ingest_cognitive_atlas(max_terms=None, resource="task"):
    url = f"https://www.cognitiveatlas.org/api/v-alpha/{resource}?format=json"
    cog_atlas_data = requests.get(url).json()
    if max_terms:
        cog_atlas_data = cog_atlas_data[:max_terms]
    conditions = []
    names = [c.name for c in Condition.query.all()]
    for task in cog_atlas_data:
        if task['name'] not in names:
            conditions.append(
                Condition(
                    name=task['name'],
                    description=task['definition_text'],
                )
            )
    db.session.add_all(conditions)
    db.session.commit()
