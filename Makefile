# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.

.PHONY: test

# The test target was based on MetagenomeScope's testing functionality.
# The -B in the invocation of python prevents this from creating pycache
# 	miscellany.
test:
	python3 -B -m pytest
	rm -r rankratioviz/tests/output/*
