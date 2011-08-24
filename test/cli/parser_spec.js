
(function() {

  var fs = require('fs')
  var path = require('path')
  var Parser = require('../../lib/cli/parser')
  var file = path.join(process.cwd(), 'test/fixtures/exhibit.json')
  var dir = path.dirname(file)
  var parser
  var data

  beforeEach(function() {
    data = JSON.parse(fs.readFileSync(file, 'utf8'))
    parser = new Parser(data, dir)
  })

  describe('#constructor', function() {

    it('should have config data the same as data', function() {
      expect(parser.config).toEqual(data)
    })

    it('should have a starting lookup directory', function() {
      expect(parser.config_dir).toEqual(dir)
    })

    it('should match the include pattern', function() {
      var matching1 = '<!-- SLIDE @include final -->'
      var matching2 = '<!-- SLIDE @include -->'
      var pattern = parser.include_pattern

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).toBeTruthy()
    })

    it('should not match the include pattern', function() {
      var notmatch1 = '<!-- SLIDE -->'
      var notmatch2 = '<!-- @include -->'
      var notmatch3 = '<!-- this is a normal comment -->'
      var pattern = parser.include_pattern

      expect(notmatch1.match(pattern)).not.toBeTruthy()
      expect(notmatch2.match(pattern)).not.toBeTruthy()
      expect(notmatch3.match(pattern)).not.toBeTruthy()
    })

    it('should find a comment block', function() {
      var matching1 = '<!-- SLIDE @include final -->'
      var matching2 = '<!-- SLIDE @include -->'
      var matching3 = '<!-- slide @include -->'
      var pattern = parser.comment_pattern

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).toBeTruthy()
      expect(matching3.match(pattern)).toBeTruthy()
    })

    it('should find the first space pattern', function() {
      var desc = '<!-- SLIDE @include final -->'
      var stripped = desc.replace(parser.comment_pattern, '')
      var space_index = stripped.search(parser.first_space_pattern)
      var name = stripped.substr(space_index + 1)
      expect(name).toEqual('final');
    })

    it('should find the first space pattern with an underscore', function() {
      var desc = '<!-- SLIDE @include final_mkd -->'
      var stripped = desc.replace(parser.comment_pattern, '')
      var space_index = stripped.search(parser.first_space_pattern)
      var name = stripped.substr(space_index + 1)
      expect(name).toEqual('final_mkd');
    })
  })

  describe('#compile', function() {
    it('should compile a bunch of files and return markdown formatted text', function() {
      var buffer = parser.concat([{"section":"cover"}, {"section":"README"}])
      expect(buffer).toContain('# Bullet Points')
      expect(buffer).toContain('# exhibitor')
    })
  })

  describe('#concat', function() {
    it('should concat sections together and find the first section', function() {
      var buffer = parser.concat([{"section":"cover"}, {"section":"README"}])
      expect(buffer).toContain('# Bullet Points')
    })

    it('should concat sections together and find the second section', function() {
      var buffer = parser.concat([{"section":"cover"}, {"section":"README"}])
      expect(buffer).toContain('# exhibitor')
    })
  })

  describe('#render', function() {
    it('should render the contents of a file to a temporary buffer', function() {
      var buffer = parser.readFile('README')
      var contents = parser.render(buffer)
      expect(parser.tmp_buffer).toContain('# exhibitor')
    })
  })

  describe('#included', function() {
    it('should have included the file one level deep', function() {
      var contents = parser.included('cover')
      expect(contents).toContain('# Include')
    })

    it('should have included the nested file', function() {
      var contents = parser.included('cover')
      expect(contents).toContain('# Nested include')
    })
  })

  describe('#analyze', function() {
    it('should just return a snippet of markdown', function() {
      var snippet = '# Hi there'
      expect(parser.analyze(snippet)).toEqual(snippet)
    })

    it('should return a normal comment as a comment', function() {
      var snippet = '<!-- Comment -->'
      expect(parser.analyze(snippet)).toEqual(snippet)
    })

    it('should parse the include README file', function() {
      var desc = '<!-- SLIDE @include README -->'
      expect(parser.analyze(desc)).toContain('# exhibitor')
    })
  })

  describe('#readFile', function() {
    it('should read the read the readme file as a section', function() {
      var contents = parser.readFile('README')
      expect(contents).toContain('# exhibitor')
    })

    it('should toss an error if it cannot find the file', function() {
      expect(function() {
        parser.readFile('missingfile')
      }).toThrow()
    })
  })

  describe('#findFile', function() {
    it('should find a file in the fixtures directory', function() {
      var file = parser.findFile(process.cwd(), 'cover')
      var contents = fs.readFileSync(file, 'utf8')
      expect(contents).toContain('# Normal Markdown')
    })

    it('should find the README.md file at the top level directory', function() {
      var file = parser.findFile(process.cwd(), 'README')
      var contents = fs.readFileSync(file, 'utf8')
      expect(contents).toContain('# exhibitor')
    })
  })

  describe('#getIncludeName', function() {
    it('should pull out the file name from an include block', function() {
      var desc = '<!-- SLIDE @include final -->'
      expect(parser.getIncludeName(desc)).toEqual('final')
    })
  })

  describe('#notify', function() {
    it('should contain an error description', function() {
      expect(parser.notify('section')).toContain('File: section not found!')
    })
  })

}());

