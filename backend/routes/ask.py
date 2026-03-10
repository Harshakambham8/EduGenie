"""
Ask route - handles general question answering.
"""

from flask import Blueprint, request, jsonify
from ai_service import generate_answer

ask_bp = Blueprint("ask_bp", __name__)


@ask_bp.route("/api/ask", methods=["POST"])
def ask_question():
    try:
        data = request.get_json()

        if not data or "question" not in data:
            return jsonify({
                "success": False,
                "error": "Question is required."
            }), 400

        question = data["question"]

        answer = generate_answer(question)

        return jsonify({
            "success": True,
            "data": answer
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to generate answer."
        }), 500
