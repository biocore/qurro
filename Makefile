# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.

.PHONY: test

# The test target was based on MetagenomeScope's testing functionality.
# The -B in the invocation of python prevents this from creating pycache
# miscellany.
# And -s prevents output capturing (letting us see the results of print
# statements sprinkled throughout the code, which helps with debugging).
test:
	# Use of -f per https://unix.stackexchange.com/a/68096
	rm -rf rankratioviz/tests/output/*
	python3 -B -m pytest -s
