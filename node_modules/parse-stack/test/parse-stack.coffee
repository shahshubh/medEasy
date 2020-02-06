###
Copyright 2013 Simon Lydell

This file is part of parse-stack.

parse-stack is free software: you can redistribute it and/or modify it under the terms of the GNU
Lesser General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

parse-stack is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
General Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with parse-stack. If
not, see <http://www.gnu.org/licenses/>.
###

{assert, throws, equal} = require "./common"

parseStack = require "../src/parse-stack"


toString = -> if @message then "#{@name}: #{@message}" else @name


describe "parseStack", ->

	it "is a function", ->
		assert typeof parseStack is "function"


	it "requires an object as argument", ->
		assert throws -> parseStack()
		assert throws -> parseStack(null)

		assert not throws -> parseStack({stack: "@:0"})


	it "returns null unless the passed object has a `stack` property, which is a string", ->
		assert parseStack({})                 is null
		assert parseStack({stack: undefined}) is null
		assert parseStack({stack: null})      is null
		assert parseStack({stack: 1})         is null
		assert parseStack({stack: [1, 2]})    is null
		assert parseStack({stack: {}})        is null

		assert parseStack({stack: "@:0"}) isnt null


	it "throws an error for invalid strings", ->
		assert throws Error("shouldn't parse"), -> parseStack({stack: "shouldn't parse"})


	it """returns an array of objects with the `name`, `filepath`, `lineNumber` and `columnNumber`
	   properties""", ->
		stack = parseStack({stack: "@:0"})
		assert stack.length is 1
		assert stack[0].hasOwnProperty("name")
		assert stack[0].hasOwnProperty("filepath")
		assert stack[0].hasOwnProperty("lineNumber")
		assert stack[0].hasOwnProperty("columnNumber")
		assert Object.keys(stack[0]).length is 4


describe "the at format", ->

	it """starts with some spaces, followed by the word 'at' and contains at least a line number and
	   column number""", ->
		for spaces in [" ", "  ", "    "]
			stack = parseStack({stack: "#{spaces}at :0:1"})
			assert stack.length is 1
			{name, filepath, lineNumber, columnNumber} = stack[0]
			assert name is undefined
			assert filepath is undefined
			assert lineNumber is 0
			assert columnNumber is 1


	it "may also contain a file path", ->
		stack = parseStack
			stack: "    at scheme://user:pass@domain:80/path?query=string#fragment_id:0:1"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is undefined
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is 1


	it "may also contain a function name", ->
		stack = parseStack({stack: "    at functionName (:0:1)"})
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is undefined
		assert lineNumber is 0
		assert columnNumber is 1


	it "handles all of the above at once", ->
		stack = parseStack
			stack: "    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is 1

	it "handles an eval", ->
		stack = parseStack
			stack: "    at eval (native)"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "eval"
		assert filepath is "native"
		assert lineNumber is undefined
		assert columnNumber is undefined

	it "handles a complex eval", ->
		stack = parseStack
			stack: "    at eval (eval at <anonymous> (http://localhost/random/test/js/jquery-1.11.0.js:339:22), <anonymous>:3:1)"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "eval"
		assert filepath is "eval at <anonymous> (http://localhost/random/test/js/jquery-1.11.0.js:339:22), <anonymous>"
		assert lineNumber is 3
		assert columnNumber is 1

	it "parses a nice example", ->
		stack = parseStack
			stack: """
				Error: test
				  at assert (c:\\test.js:22:9)
				  at c:\\test.js:84:6
				  at $ (c:\\test.js:75:3)
				  at Object.<anonymous> (c:\\test.js:84:1)
				  at Object.<anonymous> (c:\\test.js:1:1)
				  at Module._compile (module.js:456:26)
			"""
			name: "Error"
			message: "test"
			toString: toString
		assert stack.length is 6
		assert equal stack, [
			{name: "assert",             filepath: "c:\\test.js", lineNumber: 22,  columnNumber: 9}
			{name: undefined,            filepath: "c:\\test.js", lineNumber: 84,  columnNumber: 6}
			{name: "$",                  filepath: "c:\\test.js", lineNumber: 75,  columnNumber: 3}
			{name: "Object.<anonymous>", filepath: "c:\\test.js", lineNumber: 84,  columnNumber: 1}
			{name: "Object.<anonymous>", filepath: "c:\\test.js", lineNumber: 1,   columnNumber: 1}
			{name: "Module._compile",    filepath: "module.js",   lineNumber: 456, columnNumber: 26}
			]


describe "the @ format", ->

	it "contains the '@' symbol and then at least a line number", ->
		stack = parseStack({stack: "@:0"})
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is undefined
		assert filepath is undefined
		assert lineNumber is 0
		assert columnNumber is undefined


	it "may also contain a file path", ->
		stack = parseStack
			stack: "@scheme://user:pass@domain:80/path?query=string#fragment_id:0"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is undefined
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is undefined


	it "may also contain a function name", ->
		stack = parseStack({stack: "functionName@:0"})
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is undefined
		assert lineNumber is 0
		assert columnNumber is undefined


	it "handles all of the above at once", ->
		stack = parseStack
			stack: "functionName@scheme://user:pass@domain:80/path?query=string#fragment_id:0"
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is undefined


	it "parses a nice example", ->
		stack = parseStack
			stack: """
				assert@c:\\test.js:22
				@c:\\test.js:84
				$@c:\\test.js:75
				Object.<anonymous>@c:\\test.js:84
				Object.<anonymous>@c:\\test.js:1
				Module._compile@module.js:456
			"""
		assert stack.length is 6
		assert equal stack, [
			{name: "assert",             filepath: "c:\\test.js", lineNumber: 22,  columnNumber: undefined}
			{name: undefined,            filepath: "c:\\test.js", lineNumber: 84,  columnNumber: undefined}
			{name: "$",                  filepath: "c:\\test.js", lineNumber: 75,  columnNumber: undefined}
			{name: "Object.<anonymous>", filepath: "c:\\test.js", lineNumber: 84,  columnNumber: undefined}
			{name: "Object.<anonymous>", filepath: "c:\\test.js", lineNumber: 1,   columnNumber: undefined}
			{name: "Module._compile",    filepath: "module.js",   lineNumber: 456, columnNumber: undefined}
			]


describe "any format", ->

	it "cannot contain invalid lines", ->
		stackString = """
			fn@http://example.com/script/fn.js:29
			invalid line
			@http://example.com/script/fn.js:34
			"""
		assert throws Error("stack line 2"), -> parseStack({stack: stackString})


	it "cannot mix formats", ->
		stackString = """
			fn@http://example.com/script/fn.js:29
			  at fn (http://example.com/script/fn.js:29:4)
			"""
		assert throws Error("stack line 2|  at fn (http://example.com/script/fn.js:29:4)"),
			-> parseStack({stack: stackString})


	it "can use either of \\r\\n, \\r and \\n as newline characters", ->
		stack = parseStack({stack: "@:0\r\n@:0\r@:0\n@:0"})
		assert stack.length is 4
		for {name, filepath, lineNumber, columnNumber} in stack
			assert name is undefined
			assert filepath is undefined
			assert lineNumber is 0
			assert columnNumber is undefined


	it "can contain blank lines", ->
		stack = parseStack
			stack: """

				@:0


				@:0

				"""
		assert stack.length is 2
		for {name, filepath, lineNumber, columnNumber} in stack
			assert name is undefined
			assert filepath is undefined
			assert lineNumber is 0
			assert columnNumber is undefined


	it "may start with 'ErrorType: message'", ->
		stack = parseStack
			stack: """
				AssertionError
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				"""
			name: "AssertionError"
			toString: toString
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is 1

		stack = parseStack
			stack: """
				AssertionError: assert(false);
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				"""
			name: "AssertionError"
			message: "assert(false);"
			toString: toString
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "functionName"
		assert filepath is "scheme://user:pass@domain:80/path?query=string#fragment_id"
		assert lineNumber is 0
		assert columnNumber is 1

		stack = parseStack
			stack: """
				(Almost) anything is allowed as `name`!: The same is true for messages.
				The following line shouldn't be confused as a stack line:
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				    at realStackLine (filepath:0:1)
				"""
			name: "(Almost) anything is allowed as `name`!"
			message: """
				The same is true for messages.
				The following line shouldn't be confused as a stack line:
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				"""
			toString: toString
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "realStackLine"
		assert filepath is "filepath"
		assert lineNumber is 0
		assert columnNumber is 1

		stack = parseStack
			stack: """
				Newlines \r\n works \r without \n trouble: The \r\n same \r is \n true for messages.
				The following line shouldn't be confused as a stack line:
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				    at realStackLine (filepath:0:1)
				"""
			name: "Newlines \r\n works \r without \n trouble"
			message: """
				The \r\n same \r is \n true for messages.
				The following line shouldn't be confused as a stack line:
				    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
				"""
			toString: toString
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "realStackLine"
		assert filepath is "filepath"
		assert lineNumber is 0
		assert columnNumber is 1

		error = new Error """
			The \r\n same \r is \n true for messages.
			The following line shouldn't be confused as a stack line:
			    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
			"""
		error.stack = """
			Error: The \r\n same \r is \n true for messages.
			The following line shouldn't be confused as a stack line:
			    at functionName (scheme://user:pass@domain:80/path?query=string#fragment_id:0:1)
			    at realStackLine (filepath:0:1)
			"""
		stack = parseStack(error)
		assert stack.length is 1
		{name, filepath, lineNumber, columnNumber} = stack[0]
		assert name is "realStackLine"
		assert filepath is "filepath"
		assert lineNumber is 0
		assert columnNumber is 1
