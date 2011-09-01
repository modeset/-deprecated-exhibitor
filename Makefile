
test:
	@node test/cli/cli.js

exhibitor:
	@node bin/exhibitor.js convert test/fixtures/exhibit.json test/fixtures/output.json

.PHONY: test exhibitor

