
UNDERSCORE = node_modules/backbone/node_modules/underscore/underscore.js
BACKBONE = node_modules/backbone/backbone.js
INTERFACE_SRC_DIR = lib/interface
INTERFACE_SPECS_DIR = test/interface
SPECS_DIR = $(INTERFACE_SPECS_DIR)/specs

test:
	@node test/cli/cli.js

specs:
	@jasmine-dom --runner test/interface/index.html --format nice

build_libs:
	cat $(UNDERSCORE) > lib/app.js
	cat $(BACKBONE) >> lib/app.js
	cat $(INTERFACE_SRC_DIR)/config/namespace.js >> lib/app.js
	cp lib/app.js examples/javascripts/exhibitor.js

build_specs:
	cat $(SPECS_DIR)/namespace_spec.js > $(INTERFACE_SPECS_DIR)/specs.js

exhibitor:
	@node bin/exhibitor.js convert test/fixtures/exhibit.json test/fixtures/output.json

.PHONY: test exhibitor specs build_specs build_libs

