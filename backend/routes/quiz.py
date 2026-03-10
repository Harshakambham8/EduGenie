from flask import Blueprint, request, jsonify
from ai_service import generate_quiz

quiz_bp = Blueprint('quiz_bp', __name__)


@quiz_bp.route('/api/quiz', methods=['POST'])
def create_quiz():
	try:
		data = request.get_json()
		if not data or 'topic' not in data or 'difficulty' not in data or 'num_questions' not in data:
			return jsonify({
				'success': False,
				'error': 'topic, difficulty and num_questions are required.'
			}), 400

		topic = data['topic']
		difficulty = data['difficulty']
		try:
			num_questions = int(data['num_questions'])
		except (ValueError, TypeError):
			return jsonify({'success': False, 'error': 'num_questions must be an integer.'}), 400

		quiz = generate_quiz(topic, difficulty, num_questions)

		return jsonify({'success': True, 'data': quiz})
	except Exception:
		return jsonify({'success': False, 'error': 'Failed to generate quiz.'}), 500
