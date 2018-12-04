# Based on MetagenomeScope's testing functionality
test:
	python3 -B -m pytest
	rm tests/output/*
