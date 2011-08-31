
(function() {
  var fs = require('fs')
  var path = require('path')
  var input = path.join(process.cwd(), 'test/fixtures/exhibit.json')
  var output = path.join(process.cwd(), 'test/fixtures/output.json')
  var Exhibitor = require('../../lib/cli/exhibitor')
  var exhibitor

  beforeEach(function() {
    exhibitor = new Exhibitor(input, output, true)
  })

  describe('#constructor', function() {
    it('should resolve the input file', function() {
      expect(exhibitor.input).toEqual(input)
    })

    it('should resolve the output file', function() {
      expect(exhibitor.output).toEqual(output)
    })

    it('should resolve the input directories correct path', function() {
      expect(exhibitor.input_dir).toEqual(path.join(process.cwd(), 'test/fixtures'))
    })
  })

  describe('#render', function() {
    it('should render the input file of json to a converted output json file of slides', function() {
      runs(function() {
        exhibitor.render()
      })

      waits(100)

      runs(function() {
        var contents = JSON.parse(fs.readFileSync(output, 'utf8'))
        expect(contents.length).toBeGreaterThan(1)
        expect(contents[0].master).toBe('title')
        expect(contents[1].html).toContain('<h1>')
        expect(contents[3].date).toBeDefined()
      })
    })
  })

  describe('#readInput', function() {
    it('should read in the input file as a json object', function() {
      var json = exhibitor.readInput()
      expect(json.transition).toEqual('slide')
      expect(json.sections.length).toBeGreaterThan(1)
    })
  })

  describe('#convertToHTML', function() {
    it('should convert a simple string of markdown to html', function() {
      var html = '<h1>Hello World</h1>\n'
      var mkd = '# Hello World'
      expect(exhibitor.convertToHTML(mkd)).toEqual(html)
    })
  })

  describe('#writeOutput', function() {
    it('should write out a simple json file', function() {
      var json = '{"transition":"slide"}'
      runs(function() {
        exhibitor.writeOutput(json)
      })
      waits(100)
      runs(function() {
        var contents = fs.readFileSync(output, 'utf8')
        expect(contents).toEqual(json)
      })
    })
  })

}());

