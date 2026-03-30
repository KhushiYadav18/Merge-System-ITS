from chapters.data import CHAPTERS


def safe_divide(numerator, denominator, default=0.0):
	if denominator == 0:
		return float(default)
	return float(numerator) / float(denominator)


def clamp(value, min_value=0.0, max_value=1.0):
	return max(min_value, min(float(value), max_value))


def get_chapter_metadata(chapter_id):
	return next((item for item in CHAPTERS if item["chapter_id"] == chapter_id), None)
