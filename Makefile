# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.
#
# These "commands" assume some packages in addition to what's installed with
# setup.py have been installed -- that is, mocha-headless-chrome, jshint, and
# flake8. See the Travis-CI configuration file (.travis.yml) for examples of
# how to install these extra utilities.

.PHONY: test stylecheck

# The test target was based on MetagenomeScope's testing functionality.
# The -B in the invocation of python prevents this from creating pycache
# miscellany.
# And -s prevents output capturing (letting us see the results of print
# statements sprinkled throughout the code, which helps with debugging).
test:
	# Use of -f per https://unix.stackexchange.com/a/68096
	rm -rf rankratioviz/tests/output/*
	python3 -B -m pytest rankratioviz/tests -s --cov=rankratioviz
	mocha-headless-chrome -f rankratioviz/tests/web_tests/index.html

# Assumes this is being run from the root directory of the rankratioviz repo
# (since that's where the .jshintrc is located).
stylecheck:
	flake8 rankratioviz/ setup.py
	jshint rankratioviz/support_files/js/ rankratioviz/tests/web_tests/tests/ rankratioviz/tests/web_tests/setup.js
