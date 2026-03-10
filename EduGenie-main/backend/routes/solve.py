from flask import Blueprint, request, jsonify
from ai_service import generate_answer

solve_bp = Blueprint('solve_bp', __name__)


@solve_bp.route('/api/solve', methods=['POST'])
def solve_problem():
	try:
		data = request.get_json()
		if not data or 'problem' not in data:
			return jsonify({'success': False, 'error': 'problem field is required.'}), 400

		problem = data['problem']
		prompt = f"Solve the following problem:\n\n{problem}"
		solution = generate_answer(prompt)

		return jsonify({'success': True, 'data': solution})
	except Exception:
		return jsonify({'success': False, 'error': 'Failed to solve problem.'}), 500
