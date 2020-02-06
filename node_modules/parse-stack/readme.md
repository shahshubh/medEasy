**DEPRECATED.** Use [error-stack-parser] instead.

[error-stack-parser]: https://github.com/stacktracejs/error-stack-parser


[![Build Status](https://travis-ci.org/lydell/parse-stack.png?branch=master)](https://travis-ci.org/lydell/parse-stack)

Overview
========

Cross-browser parsing of the [`stack` property][stack] of error objects.

What it does: Parse the `stack` property into name, file path, line number and column number (if
available). Cross-browser.

What it does not: Normalize names and file paths, or account for possible browser differences in
line and column counting.

Cross-browser, eh? Exactly _how_ cross-browser is it? See [support.md](support/support.md).

[stack]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/Stack


Usage
=====

```javascript
var stack
// Generally you don't need to try/catch.
try {
	stack = parseStack(errorObject)
} catch (error) {
	console.log("The format of the `stack` property is invalid or unrecognized by `parseStack`.")
}

if (stack === null) {
	console.log("The `stack` property is not supported.")
} else {
	stack.forEach(function (stackLine) {
		console.log(
			stackLine.name,
			stackLine.filepath,
			stackLine.lineNumber,
			stackLine.columnNumber
		)
	})
}
```


Installation
============

`npm install parse-stack` or `component install lydell/parse-stack`

CommonJS: `var parseStack = require("parse-stack")`

AMD and regular old browser globals: Use ./parse-stack.js


Tests
=====

Node.js: `npm test`

Browser: Open ./test/browser/index.html


License
=======

[LGPLv3](COPYING).
