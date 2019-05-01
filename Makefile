# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.
#
# These "commands" assume some packages in addition to what's installed with
# setup.py have been installed -- that is, mocha-headless-chrome, jshint, and
# flake8. See the Travis-CI configuration file (.travis.yml) for examples of
# how to install these extra utilities.

.PHONY: test pytest jstest stylecheck style

JSLOCS = rankratioviz/support_files/js/*.js rankratioviz/support_files/main.js rankratioviz/tests/web_tests/tests/*.js rankratioviz/tests/web_tests/setup.js
HTMLCSSLOCS = rankratioviz/support_files/index.html rankratioviz/tests/web_tests/index.html rankratioviz/support_files/rankratioviz.css

test: pytest jstest

# The -B in the invocation of python prevents this from creating pycache
# miscellany.
# And -s prevents output capturing (letting us see the results of print
# statements sprinkled throughout the code, which helps with debugging).
pytest:
	@# Use of -f per https://unix.stackexchange.com/a/68096
	rm -rf rankratioviz/tests/output/*
	python3 -B -m pytest rankratioviz/tests -s --cov rankratioviz

jstest:
	nyc instrument rankratioviz/support_files/js/ rankratioviz/tests/web_tests/instrumented_js/
	mocha-headless-chrome -f rankratioviz/tests/web_tests/index.html -c js_coverage.json

# Assumes this is being run from the root directory of the rankratioviz repo
# (since that's where the .jshintrc is located).
stylecheck:
	flake8 rankratioviz/ setup.py
	black --check -l 79 rankratioviz/ setup.py
	jshint $(JSLOCS)
	prettier --check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)

# If we'd want to do any automatic python code formatting (e.g. with black), we
# could do that here
style:
	black -l 79 rankratioviz/ setup.py
	@# To be extra safe, do a dry run of prettier and check that it hasn't
	@# changed the code's abstract syntax tree (AST). (Black does this sort of
	@# thing by default.)
	prettier --debug-check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)
	prettier --write --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)
