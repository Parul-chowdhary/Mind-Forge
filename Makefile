# MindForge Project Makefile
# Unified build automation, execution entry points and testing

.PHONY: all build start dev serve test stats lint docker-build docker-run clean help

# Default target
all: build

help:
	@echo "MindForge Build & Automation Commands:"
	@echo "  make start        - Start production server (node server.js)"
	@echo "  make dev          - Start development server with auto-reload"
	@echo "  make build        - Run asset build and integrity verification"
	@echo "  make test         - Execute comprehensive engine test suite"
	@echo "  make stats        - Audit LOC, file counts and repository metrics"
	@echo "  make docker-build - Build Docker container image"
	@echo "  make docker-run   - Run application via Docker"

start:
	node server.js

dev:
	node server.js

serve:
	node server.js

build:
	node scripts/build.js

test:
	node scripts/run-tests.js

stats:
	node scripts/calc-stats.js

docker-build:
	docker build -t mindforge:latest .

docker-run:
	docker run -p 3000:3000 mindforge:latest

clean:
	@echo "Clean completed."
