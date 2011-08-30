
(function() {
  var fs = require('fs')
  var path = require('path')
  var Lexer = require('../../lib/cli/lexer')
  var Compiler = require('../../lib/cli/compiler')
  var compiler

  beforeEach(function() {
    compiler = new Compiler(new Lexer())
  })

  describe('#compile', function() {

    it('should compile a system test string', function() {
      var str = '<!-- SLIDE bullets {transition: fade, date: January 30} -->\n<h1>Header</h1>'
      var obj = [{master: 'bullets', html: '<h1>Header</h1>', transition: 'fade', date: 'January 30'}]
      var converted = compiler.compile(str)
      expect(converted).toEqual(obj)
      expect(converted[0].transition).toEqual('fade')
    })

  })

  describe('#compileOptions', function() {
    it('should compile a comment block into an object', function() {
      var simp_str = '<!-- SLIDE image -->'
      var full_str = '<!-- SLIDE bullets {transition: fade, date: January 30} -->'
      var simp_obj = {master: 'image', html: ''}
      var full_obj = {master: 'bullets', html: '', transition: 'fade', date: 'January 30'}
      var simp_converted = compiler.compileOptions(simp_str)
      var full_converted = compiler.compileOptions(full_str)

      expect(simp_converted).toEqual(simp_obj)
      expect(full_converted).toEqual(full_obj)
      expect(simp_converted.master).toEqual('image')
      expect(full_converted.master).toEqual('bullets')
    })

  })

  describe('#compileExtras', function() {
    it('should compile a string of extra options into a native object', function() {
      var ops_str = '{transition: fade, date: January 30}'
      var ops_obj = {transition: 'fade', date: 'January 30'}
      var converted = compiler.compileExtras(ops_str)

      expect(converted).toEqual(ops_obj)
      expect(converted.transition).toEqual('fade')
    })
  })

}())


