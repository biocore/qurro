# These "commands" assume some packages in addition to what's installed with
# setup.py have been installed -- that is, mocha-headless-chrome, nyc, jshint,
# and prettier. These also assume that the dev requirements have been
# installed.
# See the Travis-CI configuration file (.travis.yml) for examples of
# how to install these extra utilities.

.PHONY: test pytest jstest stylecheck style

JSLOCS = qurro/support_files/js/*.js qurro/support_files/main.js qurro/tests/web_tests/tests/*.js qurro/tests/web_tests/setup.js
HTMLCSSLOCS = qurro/support_files/index.html qurro/tests/web_tests/index.html qurro/support_files/qurro.css docs/*.html docs/css/*.css

test: pytest jstest

# The -B in the invocation of python prevents this from creating pycache
# miscellany.
# And -s prevents output capturing (letting us see the results of print
# statements sprinkled throughout the code, which helps with debugging).
pytest:
	@# Use of -f per https://unix.stackexchange.com/a/68096
	rm -rf docs/demos/*
	python3 -B -m pytest qurro/tests -s --cov qurro

jstest:
	@# Re-update specs for JS tests by running qurro/_json_utils.py as a script
	python3 qurro/_json_utils.py
	nyc instrument qurro/support_files/js/ qurro/tests/web_tests/instrumented_js/
	mocha-headless-chrome -f qurro/tests/web_tests/index.html -c js_coverage.json

# Assumes this is being run from the root directory of the qurro repo
# (since that's where the .jshintrc is located).
stylecheck:
	flake8 qurro/ setup.py
	black --check -l 79 qurro/ setup.py
	jshint $(JSLOCS)
	prettier --check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)

# If we'd want to do any automatic python code formatting (e.g. with black), we
# could do that here
style:
	black -l 79 qurro/ setup.py
	@# To be extra safe, do a dry run of prettier and check that it hasn't
	@# changed the code's abstract syntax tree (AST). (Black does this sort of
	@# thing by default.)
	prettier --debug-check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)
	prettier --write --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)
