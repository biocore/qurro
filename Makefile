# These "commands" assume some packages in addition to what's installed with
# setup.py have been installed -- that is, mocha-headless-chrome, nyc, jshint,
# prettier, and nbconvert. These also assume that the dev requirements have
# been installed.
#
# See the Travis-CI configuration file (.travis.yml) for examples of
# how to install these extra utilities.

.PHONY: test pytest jstest stylecheck style

JSLOCS = qurro/support_files/js/*.js qurro/support_files/main.js qurro/tests/web_tests/tests/*.js qurro/tests/web_tests/*.js
HTMLCSSLOCS = qurro/support_files/index.html qurro/tests/web_tests/index.html qurro/support_files/qurro.css docs/*.html docs/css/*.css

test: pytest jstest

# The -B in the invocation of python prevents this from creating pycache
# miscellany.
pytest:
	python3 -B -m pytest qurro/tests --cov qurro

# Ignore test files (and functions) that have q2 in the name
# This way, we can run non-QIIME2-specific tests outside of a QIIME 2 conda
# environment. (For some reason, -k "not q2" wasn't working, even though the
# docs said that it should consider file names... well, this seems to work.)
# https://stackoverflow.com/questions/11117062/how-to-tell-py-test-to-skip-certain-directories#comment113260122_41940247
pytest_standalone:
	python3 -B -m pytest qurro/tests --cov qurro --ignore-glob "*q2*"

jstest:
	@# Re-update specs for JS tests by running update_js_test_jsons.py
	python3 qurro/tests/update_js_test_jsons.py
	nyc instrument qurro/support_files/js/ qurro/tests/web_tests/instrumented_js/
	mocha-headless-chrome -f qurro/tests/web_tests/index.html -c js_coverage.json

# Assumes this is being run from the root directory of the qurro repo
# (since that's where the .jshintrc is located).
stylecheck:
	flake8 --ignore=E203,W503 qurro/ setup.py
	black --check -l 79 qurro/ setup.py
	jshint $(JSLOCS)
	prettier --check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)

style:
	black -l 79 qurro/ setup.py
	@# To be extra safe, do a dry run of prettier and check that it hasn't
	@# changed the code's abstract syntax tree (AST). (Black does this sort of
	@# thing by default.)
	prettier --debug-check --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)
	prettier --write --tab-width 4 $(JSLOCS) $(HTMLCSSLOCS)

# Runs all of the example Jupyter Notebooks. Manually rerunning notebooks is a
# pain, so this makes life a bit easier.
# NOTE: This requires that you have nbconvert installed!
notebooks:
	@# See https://nbconvert.readthedocs.io/en/latest/usage.html#notebook-and-preprocessors
	@# for reference.
	@# The timeout=None thing is used to allow us to run long processes (e.g.
	@# Songbird) from within notebooks without Jupyter timing out.
	jupyter nbconvert --execute --ExecutePreprocessor.timeout=None --to notebook --inplace example_notebooks/*/*.ipynb
