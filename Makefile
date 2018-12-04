# NOTE: If you installed this via conda, you should activate the environment
# created (via something like "source activate rrv") before using this.

.PHONY: test run

# You can modify this if you want to change the port number
PORT = 8000

# Based on MetagenomeScope's testing functionality
test:
	python3 -B -m pytest
	rm -r rankratioviz/tests/output/*
run:
	@echo "Visualizing the JSON files located in the viewer/ directory."
	@echo "Open your browser to localhost:$(PORT)/viewer to view the visualization."
	@python3 -m http.server $(PORT)
