from flask import Blueprint, request, jsonify
from ai_service import summarize_text

summarize_bp = Blueprint("summarize_bp", __name__)


@summarize_bp.route("/api/summarize", methods=["POST"])
def summarize():
    try:
        data = request.get_json()

        if not data or "text" not in data:
            return jsonify({
                "success": False,
                "error": "text field is required."
            }), 400

        summary = summarize_text(data["text"])

        return jsonify({
            "success": True,
            "data": summary
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
