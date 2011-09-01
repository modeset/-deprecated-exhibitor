
(function() {
  var Lexer = require('../../lib/cli/lexer')
  var lexer

  beforeEach(function() {
    lexer = new Lexer()
  })

  describe('#patterns', function() {
    it('should find a comment block', function() {
      var matching1 = '<!-- SLIDE @include final -->'
      var matching2 = '<!-- SLIDE @include -->'
      var matching3 = '<!-- slide @include -->'
      var pattern = lexer.comment

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).toBeTruthy()
      expect(matching3.match(pattern)).toBeTruthy()
    })

    it('should find the options pattern', function() {
      var matching1 = '<!-- SLIDE bullets {transition: fade}'
      var matching2 = '<!-- SLIDE image -->'
      var matching3 = '<!-- image -->'
      var matching4 = '<!-- SECTION name -->'
      var pattern = lexer.options

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).toBeTruthy()
      expect(matching3.match(pattern)).not.toBeTruthy()
      expect(matching4.match(pattern)).not.toBeTruthy()
    })

    it('should find the section pattern', function() {
      var matching1 = '<!-- SECTION name -->'
      var matching2 = '<!-- SLIDE bullets {transition: fade}'
      var matching3 = '<!-- SLIDE image -->'
      var pattern = lexer.section

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).not.toBeTruthy()
      expect(matching3.match(pattern)).not.toBeTruthy()
    })

    it('should match the include pattern', function() {
      var matching1 = '<!-- SLIDE @include final -->'
      var matching2 = '<!-- SLIDE @include -->'
      var pattern = lexer.include

      expect(matching1.match(pattern)).toBeTruthy()
      expect(matching2.match(pattern)).toBeTruthy()
    })

    it('should not match the include pattern', function() {
      var notmatch1 = '<!-- SLIDE -->'
      var notmatch2 = '<!-- @include -->'
      var notmatch3 = '<!-- this is a normal comment -->'
      var pattern = lexer.include

      expect(notmatch1.match(pattern)).not.toBeTruthy()
      expect(notmatch2.match(pattern)).not.toBeTruthy()
      expect(notmatch3.match(pattern)).not.toBeTruthy()
    })

    it('should find just the property from a section comment', function() {
      var match1 = '<!-- SECTION cover -->'
      var pattern = lexer.section_label

      expect(match1.match(pattern)).toBeTruthy()
      expect(match1.replace(pattern, '')).toEqual('cover')
    })

    it('should find the first space pattern', function() {
      var desc = '<!-- SLIDE @include final -->'
      var stripped = desc.replace(lexer.comment, '')
      var space_index = stripped.search(lexer.firstspace)
      var name = stripped.substr(space_index + 1)
      expect(name).toEqual('final');
    })

    it('should find the first space pattern with an underscore', function() {
      var desc = '<!-- SLIDE @include final_mkd -->'
      var stripped = desc.replace(lexer.comment, '')
      var space_index = stripped.search(lexer.firstspace)
      var name = stripped.substr(space_index + 1)
      expect(name).toEqual('final_mkd');
    })

    it('should find brackets in a string', function() {
      var faux_str = '{transition:fade}'
      var faux_obj = 'transition:fade'
      expect(faux_str.replace(lexer.brackets, '')).toEqual(faux_obj)
    })

    it('should find colons in a string with a space', function() {
      var faux_str1 = 'transition:fade'
      var faux_str2 = 'transition: fade'
      var faux_obj = 'transition:fade'
      expect(faux_str1.replace(lexer.colons, ':')).toEqual(faux_obj)
      expect(faux_str2.replace(lexer.colons, ':')).toEqual(faux_obj)
    })

    it('should find commas in a string with a space', function() {
      var faux_str1 = 'transition:fade,date:january'
      var faux_str2 = 'transition:fade, date:january'
      var faux_obj = 'transition:fade,date:january'
      expect(faux_str1.replace(lexer.commas, ',')).toEqual(faux_obj)
      expect(faux_str2.replace(lexer.commas, ',')).toEqual(faux_obj)
    })
  })

}())

