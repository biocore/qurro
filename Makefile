# You can modify this if you want to change the port number
PORT = 8000

# Based on MetagenomeScope's testing functionality
test:
	python3 -B -m pytest
	rm tests/output/*
run:
	@echo "When this gets running, open your browser to localhost:$(PORT) to view the visualization."
	python3 -m http.server $(PORT)
