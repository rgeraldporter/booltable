# BoolTable

[![Build Status](https://travis-ci.com/rgeraldporter/booltable.svg?branch=master)](https://travis-ci.com/rgeraldporter/booltable)

BoolTable is an expressive alternative for complex and incongruous if/else conditional structures in Javascript.

It exposes two APIs: `Truth` and `Decision`. These roughly match up to being truth tables and decision tables.

## Example

```js
import { Truth, Decision } from 'booltable';

// simplest: [Condition, Result]
const makeDecision = (x) => Decision.of([
    [x > 1, 2],
    [x === 1, 3],
    [x === 0, 3.5]
    [!x, 4],
    // default, always true
    [true, 10]
]);

// result1 === 2;
// uses default 'first', meaning first true result returns
const result1 = makeDecision(2).run().join();

// result2 === [3.5, 4, 10];
// 'any' means any conditions are true, returns array of results
const result2 = makeDecision(0).run('any').join();

// result3 === 10
// 'last' means last true result returns
const result3 = makeDecision(101).run('last').join();

// result4 === [3.5, 4];
// '2' means first two true conditions -- this can be given number
const result4 = makeDecision(0).run(2).join();

const data = {
    aa: 1,
    bb: true,
    cc: [0],
    dd: { test: 'a' },
    ee: false
};

const conditions = ([a, b, c]) => Truth.of([a, b, c]);

// .or() means apply "OR" to these conditions, since data.aa is greater than 0, this returns true
// OR means at least one is true
const result5 = conditions([data.aa > 0, data.bb === true, data.cc.length]).or();

// .xor() means apply "XOR" to these conditions, since all items are true, this would return false
// XOR means at least one is true and at least one is false
const result6 = conditions([data.aa > 0, data.bb === true, data.cc.length]).or();

// .nor() means apply "NOR" to these conditions, since all items are true, this would return false
// NOR means all are false
const result7 = conditions([data.aa > 0, data.bb === true, data.cc.length]).nor();

// .and() means apply "AND" to these conditions, since all items are true, this would return true
// AND means all are true
const result7 = conditions([data.aa > 0, data.bb === true, data.cc.length]).nor();

// these can be combined!
const makeDecision2 = (x) => Decision.of([
    [Truth.of([x > 1, x < 0]).or(), 2], // is greater than 1 or less than 0
    [Truth.of([x !== 0, typeof x === 'string']).nor(), 3], // is not 0 and not a string
    // default, always true
    [true, 10]
]);

// ... and so on

```

Some more examples can be lifted from the unit tests.

More info forthcoming soon!

## Development

Source is written in TypeScript. Run tests via `npm run test`.

## MIT License

Copyright 2018 Robert Gerald Porter <mailto:rob@weeverapps.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
