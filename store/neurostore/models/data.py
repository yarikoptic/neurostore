import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy import ForeignKeyConstraint
from sqlalchemy.ext.associationproxy import association_proxy

from sqlalchemy.ext.mutable import MutableDict
from sqlalchemy.orm import relationship, backref
from sqlalchemy.sql import func
import shortuuid

from .migration_types import TSVector
from ..database import db


def _check_type(x):
    """check annotation key type"""
    if isinstance(x, (int, float)):
        return "number"
    elif isinstance(x, str):
        return "string"
    elif isinstance(x, bool):
        return "boolean"
    elif x is None:
        return None
    else:
        return None


def generate_id():
    return shortuuid.ShortUUID().random(length=12)


class BaseMixin(object):
    id = db.Column(db.Text, primary_key=True, index=True, default=generate_id)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=func.now())

    # this _should_ work, but user sometimes is not properly committed,
    # look into as time permits
    # @declared_attr
    # def user_id(cls):
    #     return db.Column(db.Text, db.ForeignKey("users.id"))

    # @declared_attr.cascading
    # def user(cls):
    #     relationship("User", backref=cls.__tablename__, uselist=False)

    @property
    def IRI(self):
        return f"http://neurostore.org/api/{self.__tablename__}/{self.id}"


class Studyset(BaseMixin, db.Model):
    __tablename__ = "studysets"

    name = db.Column(db.String)
    description = db.Column(db.String)
    publication = db.Column(db.String)
    authors = db.Column(db.String)
    metadata_ = db.Column(JSONB)
    source = db.Column(db.String)
    source_id = db.Column(db.String)
    source_updated_at = db.Column(db.DateTime(timezone=True))
    doi = db.Column(db.String)
    pmid = db.Column(db.String)
    public = db.Column(db.Boolean, default=True)
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("studysets"))
    studies = relationship(
        "Study",
        cascade="all",
        secondary="studyset_studies",
        backref=backref("studysets", lazy="dynamic"),
    )
    annotations = relationship("Annotation", cascade="all, delete", backref="studyset")


class Annotation(BaseMixin, db.Model):
    __tablename__ = "annotations"
    name = db.Column(db.Text)
    description = db.Column(db.Text)
    source = db.Column(db.String)
    source_id = db.Column(db.String)
    source_updated_at = db.Column(db.DateTime(timezone=True))
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("annotations"))
    studyset_id = db.Column(db.Text, db.ForeignKey("studysets.id"))
    metadata_ = db.Column(JSONB)
    public = db.Column(db.Boolean, default=True)
    note_keys = db.Column(MutableDict.as_mutable(JSONB))
    annotation_analyses = relationship(
        "AnnotationAnalysis",
        backref=backref("annotation"),
        cascade="all, delete-orphan",
    )


class AnnotationAnalysis(db.Model):
    __tablename__ = "annotation_analyses"
    __table_args__ = (
        ForeignKeyConstraint(
            ("study_id", "studyset_id"),
            ("studyset_studies.study_id", "studyset_studies.studyset_id"),
            ondelete="CASCADE",
        ),
    )

    study_id = db.Column(db.Text, nullable=False)
    studyset_id = db.Column(db.Text, nullable=False)
    annotation_id = db.Column(
        db.Text, db.ForeignKey("annotations.id"), index=True, primary_key=True
    )
    analysis_id = db.Column(
        db.Text, db.ForeignKey("analyses.id"), index=True, primary_key=True
    )
    note = db.Column(MutableDict.as_mutable(JSONB))


class BaseStudy(BaseMixin, db.Model):
    __tablename__ = "base_studies"

    name = db.Column(db.String)
    description = db.Column(db.String)
    publication = db.Column(db.String, index=True)
    doi = db.Column(db.String, nullable=True, index=True)
    pmid = db.Column(db.String, nullable=True, index=True)
    authors = db.Column(db.String, index=True)
    year = db.Column(db.Integer, index=True)
    public = db.Column(db.Boolean, default=True)
    level = db.Column(db.String)
    metadata_ = db.Column(JSONB)
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"), index=True)
    __ts_vector__ = db.Column(
        TSVector(),
        db.Computed(
            "to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))",
            persisted=True,
        ),
    )

    user = relationship("User", backref=backref("base_studies"))
    # retrieve versions of same study
    versions = relationship("Study", backref=backref("base_study"))

    __table_args__ = (
        db.CheckConstraint(level.in_(["group", "meta"])),
        db.UniqueConstraint("doi", "pmid", name="doi_pmid"),
        sa.Index("ix_base_study___ts_vector__", __ts_vector__, postgresql_using="gin"),
    )


class Study(BaseMixin, db.Model):
    __tablename__ = "studies"

    name = db.Column(db.String)
    description = db.Column(db.String)
    publication = db.Column(db.String, index=True)
    doi = db.Column(db.String, index=True)
    pmid = db.Column(db.String, index=True)
    authors = db.Column(db.String, index=True)
    year = db.Column(db.Integer, index=True)
    public = db.Column(db.Boolean, default=True)
    level = db.Column(db.String)
    metadata_ = db.Column(JSONB)
    source = db.Column(db.String, index=True)
    source_id = db.Column(db.String, index=True)
    source_updated_at = db.Column(db.DateTime(timezone=True))
    base_study_id = db.Column(db.Text, db.ForeignKey("base_studies.id"))
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"), index=True)
    __ts_vector__ = db.Column(
        TSVector(),
        db.Computed(
            "to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))",
            persisted=True,
        ),
    )
    user = relationship("User", backref=backref("studies"))
    analyses = relationship(
        "Analysis",
        backref=backref("study"),
        cascade="all, delete, delete-orphan",
    )

    __table_args__ = (
        db.CheckConstraint(level.in_(["group", "meta"])),
        sa.Index("ix_study___ts_vector__", __ts_vector__, postgresql_using="gin"),
    )


class StudysetStudy(db.Model):
    __tablename__ = "studyset_studies"
    study_id = db.Column(
        db.ForeignKey("studies.id", ondelete="CASCADE"), index=True, primary_key=True
    )
    studyset_id = db.Column(
        db.ForeignKey("studysets.id", ondelete="CASCADE"), index=True, primary_key=True
    )
    study = relationship(
        "Study",
        backref=backref("studyset_studies"),
        viewonly=True,
    )
    studyset = relationship(
        "Studyset", backref=backref("studyset_studies"), viewonly=True
    )
    annotation_analyses = relationship(
        "AnnotationAnalysis",
        cascade="all, delete-orphan",
        backref=backref("studyset_study"),
    )


class Analysis(BaseMixin, db.Model):
    __tablename__ = "analyses"

    study_id = db.Column(db.Text, db.ForeignKey("studies.id", ondelete="CASCADE"))
    name = db.Column(db.String)
    description = db.Column(db.String)
    points = relationship(
        "Point",
        backref=backref("analysis"),
        cascade="all, delete-orphan",
    )
    images = relationship(
        "Image",
        backref=backref("analysis"),
        cascade="all, delete-orphan",
    )
    weights = association_proxy("analysis_conditions", "weight")
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("analyses"))
    analysis_conditions = relationship(
        "AnalysisConditions",
        backref=backref("analysis"),
        cascade="all, delete-orphan",
    )
    annotation_analyses = relationship(
        "AnnotationAnalysis",
        backref=backref("analysis"),
        cascade="all, delete-orphan",
    )


class Condition(BaseMixin, db.Model):
    __tablename__ = "conditions"

    name = db.Column(db.String)
    description = db.Column(db.String)
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("conditions"))
    analysis_conditions = relationship(
        "AnalysisConditions",
        backref=backref("condition"),
        cascade="all, delete",
    )


class AnalysisConditions(db.Model):
    __tablename__ = "analysis_conditions"
    weight = db.Column(db.Float)
    analysis_id = db.Column(
        db.Text, db.ForeignKey("analyses.id"), index=True, primary_key=True
    )
    condition_id = db.Column(
        db.Text, db.ForeignKey("conditions.id"), index=True, primary_key=True
    )


PointEntityMap = db.Table(
    "point_entities",
    db.Model.metadata,
    db.Column("point", db.Text, db.ForeignKey("points.id", ondelete="CASCADE")),
    db.Column("entity", db.Text, db.ForeignKey("entities.id", ondelete="CASCADE")),
)


ImageEntityMap = db.Table(
    "image_entities",
    db.Model.metadata,
    db.Column("image", db.Text, db.ForeignKey("images.id", ondelete="CASCADE")),
    db.Column("entity", db.Text, db.ForeignKey("entities.id", ondelete="CASCADE")),
)


# purpose of Entity: you have an image/coordinate, but you do not
# know what level of analysis it represents
# NOT USED CURRENTLY
class Entity(BaseMixin, db.Model):
    __tablename__ = "entities"

    # link to analysis
    analysis_id = db.Column(db.Text, db.ForeignKey("analyses.id", ondelete="CASCADE"))
    label = db.Column(db.String)  # bids-entity
    # constrained enumeration (bids-entity, run, session, subject, group, meta)
    level = db.Column(db.String)
    data = db.Column(JSONB)  # metadata (participants.tsv, or something else)
    analysis = relationship("Analysis", backref=backref("entities"))
    __table_args__ = (db.CheckConstraint(level.in_(["group", "meta"])),)


class Point(BaseMixin, db.Model):
    __tablename__ = "points"

    @property
    def coordinates(self):
        return [self.x, self.y, self.z]

    x = db.Column(db.Float)
    y = db.Column(db.Float)
    z = db.Column(db.Float)
    space = db.Column(db.String)
    kind = db.Column(db.String)
    image = db.Column(db.String)  # what does image represent
    label_id = db.Column(db.Float, default=None)
    analysis_id = db.Column(db.Text, db.ForeignKey("analyses.id", ondelete="CASCADE"))
    cluster_size = db.Column(db.Float)
    subpeak = db.Column(db.Boolean)
    order = db.Column(db.Integer)

    entities = relationship(
        "Entity", secondary=PointEntityMap, backref=backref("points")
    )
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("points"))


class Image(BaseMixin, db.Model):
    __tablename__ = "images"

    url = db.Column(db.String)
    filename = db.Column(db.String)
    space = db.Column(db.String)
    value_type = db.Column(db.String)
    analysis_id = db.Column(db.Text, db.ForeignKey("analyses.id", ondelete="CASCADE"))
    data = db.Column(JSONB)
    add_date = db.Column(db.DateTime(timezone=True))

    analysis_name = association_proxy("analysis", "name")
    entities = relationship(
        "Entity", secondary=ImageEntityMap, backref=backref("images")
    )
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("images"))


class PointValue(BaseMixin, db.Model):
    __tablename__ = "point_values"

    point_id = db.Column(db.Text, db.ForeignKey("points.id", ondelete="CASCADE"))
    kind = db.Column(db.String)
    value = db.Column(db.Float)
    point = relationship("Point", backref=backref("values"))
    user_id = db.Column(db.Text, db.ForeignKey("users.external_id"))
    user = relationship("User", backref=backref("point_values"))


from . import event_listeners  # noqa E402

del event_listeners
