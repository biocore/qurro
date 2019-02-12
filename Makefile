# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.

.PHONY: test run

# You can modify this if you want to change the port number
PORT = 8000

# The test target was based on MetagenomeScope's testing functionality.
# The -B in the invocation of python prevents this from creating pycache
# 	miscellany.
test:
	rm -r rankratioviz/tests/output/*
	python3 -B -m pytest
run:
	@echo "Visualizing the JSON files located in the viewer/ directory."
	@echo "Open your browser to localhost:$(PORT)/viewer to view the visualization."
	@python3 -m http.server $(PORT)
