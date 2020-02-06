###
Copyright 2013 Simon Lydell

This file is part of throws.

throws is free software: you can redistribute it and/or modify it under the terms of the GNU Lesser
General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

throws is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser General
Public License for more details.

You should have received a copy of the GNU Lesser General Public License along with throws. If not,
see <http://www.gnu.org/licenses/>.
###

assert = require "yaba"
throws = require "throws"
equals = require "equals"

throws.messageHolder = assert

equal = (actual, expected)->
	assert.actual   = actual
	assert.expected = expected
	equals(actual, expected)

beforeEach ->
	assert.runs = 0

module.exports = {assert, throws, equal}
