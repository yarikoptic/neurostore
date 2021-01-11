import os
from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from flask_dance.consumer.storage.sqla import SQLAlchemyStorage
from flask_dance.contrib.github import make_github_blueprint
from flask_cors import CORS

import connexion
from connexion.resolver import MethodViewResolver

from .database import init_db
from .models import User, Role, OAuth


app = connexion.FlaskApp(__name__, specification_dir="openapi/", debug=True)

flask_app = app.app
flask_app.config.from_object(os.environ["APP_SETTINGS"])
db = init_db(flask_app)

options = {"swagger_ui": True}
app.add_api(
    "api.yaml",
    options=options,
    arguments={"title": "NeuroStore API"},
    resolver=MethodViewResolver("api"),
    strict_validation=True,
    validate_responses=True,
)

# Enable CORS
cors = CORS(flask_app, expose_headers="X-Total-Count")

# Flask-Security
user_datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(flask_app, user_datastore)

# Flask-Dance (OAuth)
from . import oauth

flask_app.secret_key = flask_app.config["DANCE_SECRET_KEY"]
blueprint = make_github_blueprint(
    client_id=flask_app.config["GITHUB_CLIENT_ID"],
    client_secret=flask_app.config["GITHUB_CLIENT_SECRET"],
)
flask_app.register_blueprint(blueprint, url_prefix="/login")
blueprint.storage = SQLAlchemyStorage(OAuth, db.session)

# # GraphQL API
# from flask_graphql import GraphQLView
# from .schemas.graphql import graphql_schema
# app.add_url_rule('/graphql', view_func=GraphQLView.as_view(
#                  'graphql',schema=graphql_schema, graphiql=True,
#                  context_value={'session': db.session}))

# # Bind routes
# from .resources import bind_resources

# bind_resources(app)
