
test:
	@node test/cli.js

lexer:
	@node bin/exhibitor.js convert examples/config.json examples/exhibit.json

.PHONY: test lexer

