"""Main Flask application entry point."""

import os
import logging
from flask import Flask, render_template
from flask_cors import CORS

from routes.ask import ask_bp
from routes.explain import explain_bp
from routes.quiz import quiz_bp
from routes.summarize import summarize_bp
from routes.solve import solve_bp


def create_app() -> Flask:
    # Absolute paths for frontend folders
    base_dir = os.path.abspath(os.path.dirname(__file__))
    template_dir = os.path.join(base_dir, "..", "frontend", "templates")
    static_dir = os.path.join(base_dir, "..", "frontend", "static")

    app = Flask(
        __name__,
        template_folder=template_dir,
        static_folder=static_dir
    )

    # Enable CORS
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.INFO)

    # Register API blueprints
    app.register_blueprint(ask_bp)
    app.register_blueprint(explain_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(summarize_bp)
    app.register_blueprint(solve_bp)

    # Serve frontend
    @app.route("/")
    def home():
        return render_template("index.html")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
