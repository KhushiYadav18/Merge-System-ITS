export const API_BASE_URL = 'https://merge-system-its-production.up.railway.app/api'

export const ACCESS_TOKEN_KEY = 'adaptive_access_token'
export const REFRESH_TOKEN_KEY = 'adaptive_refresh_token'
export const USER_KEY = 'adaptive_user'

export const SESSION_STATUS = {
	COMPLETED: 'completed',
	EXITED_MIDWAY: 'exited_midway',
}

export const CHAPTER_IDS = [
	'grade6_fractions',
	'grade7_fractions_decimals',
	'grade7_linear_equations',
	'grade8_algebra_basics',
	'grade8_geometry_intro',
]

export function createBasePayload(chapterId, studentId) {
	return {
		student_id: studentId || 'STD-DEMO-01',
		session_id: `sess-${Date.now()}`,
		chapter_id: chapterId,
		timestamp: new Date().toISOString(),
		session_status: SESSION_STATUS.COMPLETED,
		correct_answers: 6,
		wrong_answers: 4,
		questions_attempted: 10,
		total_questions: 10,
		retry_count: 1,
		hints_used: 1,
		total_hints_embedded: 5,
		time_spent_seconds: 1300,
		topic_completion_ratio: 0.8,
	}
}

export const PREBUILT_CASES = [
	{
		key: 'guessing',
		label: 'Guessing Case',
		description: 'Very fast completion with low accuracy.',
		values: {
			correct_answers: 2,
			wrong_answers: 8,
			questions_attempted: 10,
			total_questions: 10,
			retry_count: 0,
			hints_used: 0,
			total_hints_embedded: 6,
			time_spent_seconds: 280,
			topic_completion_ratio: 0.45,
			session_status: SESSION_STATUS.COMPLETED,
		},
	},
	{
		key: 'high_hints',
		label: 'High Hints Case',
		description: 'Good score but heavy hint usage.',
		values: {
			correct_answers: 8,
			wrong_answers: 2,
			questions_attempted: 10,
			total_questions: 10,
			retry_count: 1,
			hints_used: 6,
			total_hints_embedded: 8,
			time_spent_seconds: 1400,
			topic_completion_ratio: 0.9,
			session_status: SESSION_STATUS.COMPLETED,
		},
	},
	{
		key: 'high_retry',
		label: 'High Retry Case',
		description: 'Repeated attempts with unstable outcomes.',
		values: {
			correct_answers: 4,
			wrong_answers: 6,
			questions_attempted: 10,
			total_questions: 10,
			retry_count: 9,
			hints_used: 2,
			total_hints_embedded: 6,
			time_spent_seconds: 2100,
			topic_completion_ratio: 0.65,
			session_status: SESSION_STATUS.COMPLETED,
		},
	},
	{
		key: 'strong',
		label: 'Strong Student Case',
		description: 'High accuracy, low hints, low retry.',
		values: {
			correct_answers: 9,
			wrong_answers: 1,
			questions_attempted: 10,
			total_questions: 10,
			retry_count: 1,
			hints_used: 1,
			total_hints_embedded: 8,
			time_spent_seconds: 1450,
			topic_completion_ratio: 0.95,
			session_status: SESSION_STATUS.COMPLETED,
		},
	},
	{
		key: 'weak',
		label: 'Weak Student Case (Exited Midway)',
		description: 'Low accuracy with many hints and retries (partial attempt).',
		values: {
			correct_answers: 2,
			wrong_answers: 6,
			questions_attempted: 8,
			total_questions: 10,
			retry_count: 7,
			hints_used: 7,
			total_hints_embedded: 8,
			time_spent_seconds: 2500,
			topic_completion_ratio: 0.38,
			session_status: SESSION_STATUS.EXITED_MIDWAY,
		},
	},
]
