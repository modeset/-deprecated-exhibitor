
var path = require('path')
var fs = require('fs')
var Parser = require('../lib/cli/parser')

var file = path.join(process.cwd(), 'examples/config.json')
var data = JSON.parse(fs.readFileSync(file, 'utf8'))

var parser = new Parser(data, path.dirname(file))
parser.compile()

