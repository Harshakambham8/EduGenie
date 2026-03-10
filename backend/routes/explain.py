from flask import Blueprint, request, jsonify
from ai_service import explain_topic

explain_bp = Blueprint("explain_bp", __name__)

@explain_bp.route("/api/explain", methods=["POST"])
def explain():
    try:
        data = request.get_json()

        if not data or "topic" not in data or "level" not in data:
            return jsonify({
                "success": False,
                "error": "Topic and level are required."
            }), 400

        topic = data["topic"]
        level = data["level"]

        explanation = explain_topic(topic, level)

        return jsonify({
            "success": True,
            "data": explanation
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
