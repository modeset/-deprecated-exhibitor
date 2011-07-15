<!-- SLIDE title -->
# Normal Markdown
Some body copy...

Some more copy

<hr />

<!-- SLIDE bullets {transition: fade, date: 07.12.2011} -->
# Bullet Points

* first point
* second point
* third point

Below are some tests utilizing the features from the redcarpet gem.

:hardwrap
double space 1  
no space
end of line


:autolink
http://www.google.com/

:tables

aaa | bbbb
-----|------
hello|sailor

:strikethrough

this is ~~striked text~~


~~~ruby
fenced code with squigglies
require 'redcarpet'
markdown = Redcarpet.new("Hello World!")
puts markdown.to_html
~~~

:lax_htmlblock
this is <a href="#">native link tag of html</a> in a paragraph

:no_intraemphasis
foo_bar_baz

:space_header
#no space after the pound symbol means no header
