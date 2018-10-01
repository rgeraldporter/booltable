# BoolTable

[![Build Status](https://travis-ci.com/rgeraldporter/booltable.svg?branch=master)](https://travis-ci.com/rgeraldporter/booltable)

BoolTable is an expressive alternative for complex and incongruous if/else conditional structures in Javascript. It allows one to build logical branches not unlike truth tables and decision tables.

It exposes three APIs: `Truth`, `Decision`, and `BoolTable`.

## Summary of APIs

### `Truth`

This API is akin to a [truth table](https://en.wikipedia.org/wiki/Truth_table) row, which allows one to specify any number of statements that may be true or false, and apply a boolean operator to the collection to achieve a result.

For example:

-   a table row of three items: `[true, true, true]` would return `true` for an `AND` operator, `false` for a `NOR` operator, etc;
-   a table row with `[true, false]` would return `false` for `AND`, and `true` for `XOR`, `true` for `OR`, etc

### `Decision`

This API is akin to a [decision table](https://en.wikipedia.org/wiki/Decision_table), which allows one to specify an action when certain conditions evaluate as `true`. One can use `Truth` in concert to allow for complex and specific decisions.

This can be used to indicate a list of actions that are triggered upon a complex set of conditions.

### `BoolTable`

This API allows one to construct a more expressive conditions in the `Decision` table, for better logging and observability, and to avoid the necessity of adding comments explaining each complex evaluation.

This allows for more meaningful use of `Decision`, especially when used with a complex set of conditions.

### Bringing them together

Each of these are designed to be used together to avoid deeply nested `if`/`else`/`switch`/etc statements.

## Example: Thermostat

A simple example to start with that most people can relate to is how a thermostat works.

If a thermostat is set to "heat", it will turn on a furnace when below the threshold temperature. It will turn off when the temperature goes above the threshold, plus one.

If a thermostat is set to "cool", it will turn on air conditioning when below a threshold temperature. It will turn off when the temperature goes below the threshold, minus one.

Let's visualize first in a decision table:

| mode          | status        | temperature                        | action to take               |
| ------------- | ------------- | ---------------------------------- | ---------------------------- |
| set to "heat" | currently off | thermometer is below threshold     | turn the furnace on          |
| set to "heat" | currently on  | thermometer is above threshold + 1 | turn the furnace off         |
| set to "cool" | currently off | thermometer is above threshold     | turn the air conditioning on |
| set to "cool" | curr          |

### Unoptomized `Decision`

```js
const turnOnFurnace = () => console.log('Turning on the furnace');
const turnOffFurnace = () => console.log('Turning off the furnace');
const turnOnAirConditioning = () =>
    console.log('Turning on the air conditioning');
const turnOffAirConditioning = () =>
    console.log('Turning off the air conditioning');
const nothingHappening = () => console.log('Nothing happening');

const thermostat = conditions =>
    Decision.of([
        [
            conditions.mode === 'heat' &&
                conditions.operating === 0 &&
                conditions.thermometer < conditions.thresholdTemp,
            turnOnFurnace
        ],
        [
            conditions.mode === 'heat' &&
                conditions.operating === 1 &&
                conditions.thermometer > conditions.thresholdTemp + 1,
            turnOffFurnace
        ],
        [
            conditions.mode === 'cool' &&
                conditions.operating === 0 &&
                conditions.thermometer > conditions.thresholdTemp,
            turnOnAirConditioning
        ],
        [
            conditions.mode === 'cool' &&
                conditions.operating === 1 &&
                conditions.thermometer < conditions.thresholdtemp - 1,
            turnOffAirConditioning
        ],
        // a default response if no action is necessary
        [true, nothingHappening]
    ]);

// example conditions, this will turn off the furnace:

// get our action function
const actionFn = thermostat({
    mode: 'heat',
    operating: 1,
    thermometer: 21,
    thresholdTemp: 19
})
    .run()
    .join();

// console:
// > Turning off the furnace
actionFn();
```

While this works, the boolean statements make this code more fragile than it needs to be. Let's group our conditions with `Truth`.

## Adding `Truth`

```js
const thermostat2 = conditions =>
    Decision.of([
        [
            Truth.of([
                conditions.mode === 'heat',
                conditions.operating === 0,
                conditions.thermometer < conditions.thresholdTemp
            ]).and(),
            turnOnFurnace
        ],
        [
            Truth.of([
                conditions.mode === 'heat',
                conditions.operating === 1,
                conditions.thermometer > conditions.thresholdTemp + 1
            ]).and(),
            turnOffFurnace
        ],
        [
            Truth.of([
                conditions.mode === 'cool',
                conditions.operating === 0,
                conditions.thermometer > conditions.thresholdTemp
            ]).and(),
            turnOnAirConditioning
        ],
        [
            Truth.of([
                conditions.mode === 'cool',
                conditions.operating === 1,
                conditions.thermometer < conditions.thresholdtemp - 1
            ]).and(),
            turnOffAirConditioning
        ],
        [true, nothingHappening]
    ]);

// get our action function
const actionFn2 = thermostat({
    mode: 'cool',
    operating: 0,
    thermometer: 24,
    thresholdTemp: 22
})
    .run()
    .join();

// console:
// > Turning on the air conditioning
actionFn2();
```

This is better as one does not need to follow a list of items followed by `&&`, but it is still a bit lengthy.

Let's make it more expressive, using `Truth` in a clearer way.

## Returning `Truth` via constant function expression

```js
const itIsGettingCold = conditions =>
    Truth.of([
        conditions.mode === 'heat',
        conditions.operating === 0,
        conditions.thermometer < conditions.thresholdTemp
    ]).and();

const itIsWarmEnough = conditions =>
    Truth.of([
        conditions.mode === 'heat',
        conditions.operating === 1,
        conditions.thermometer > conditions.thresholdTemp + 1
    ]).and();

const itIsGettingHot = conditions =>
    Truth.of([
        conditions.mode === 'cool',
        conditions.operating === 0,
        conditions.thermometer > conditions.thresholdTemp
    ]).and();

const itIsCoolEnough = conditions =>
    Truth.of([
        conditions.mode === 'cool',
        conditions.operating === 1,
        conditions.thermometer < conditions.thresholdtemp - 1
    ]).and();

const thermostat3 = conditions =>
    Decision.of([
        [itIsGettingCold(conditions), turnOnFurnace],
        [itIsWarmEnough(conditions), turnOffFurnace],
        [itIsGettingHot(conditions), turnOnAirConditioning],
        [itIsCoolEnough(conditions), turnOffAirConditioning],
        [true, nothingHappening]
    ]);

// get our action function
const actionFn3 = thermostat({
    mode: 'cool',
    operating: 0,
    thermometer: 22,
    thresholdTemp: 22
})
    .run()
    .join();

// console:
// > Nothing happening
actionFn3();
```

This is much more expressive, and readable for any developer who returns to the code in the future.

But what if we have a lot of options, and doing a camel-case `const` for every single option is beginning to look odd?

This is where `BoolTable` can help with adopting the expressivity of a unit test.

## Using a `BoolTable`

```js
const bt = conditions =>
    BoolTable.of([
        [
            `It's getting too cold in here`,
            Truth.of([
                conditions.mode === 'heat',
                conditions.operating === 0,
                conditions.thermometer < conditions.thresholdTemp
            ]).and()
        ],
        [
            `It's warm enough now`,
            Truth.of([
                conditions.mode === 'heat',
                conditions.operating === 1,
                conditions.thermometer > conditions.thresholdTemp + 1
            ]).and()
        ],
        [
            `It's getting too hot in here`,
            Truth.of([
                conditions.mode === 'cool',
                conditions.operating === 0,
                conditions.thermometer > conditions.thresholdTemp
            ]).and()
        ],
        [
            `It's cool enough now`,
            Truth.of([
                conditions.mode === 'cool',
                conditions.operating === 1,
                conditions.thermometer < conditions.thresholdTemp - 1
            ]).and()
        ]
    ]);

const thermostat4 = table =>
    Decision.of([
        [table.q(`It's getting too cold in here`), turnOnFurnace],
        [table.q(`It's warm enough now`), turnOffFurnace],
        [table.q(`It's getting too hot in here`), turnOnAirConditioning],
        [table.q(`It's cool enough now`), turnOffAirConditioning],
        [true, nothingHappening]
    ]);

const condTable = bt({
    mode: 'cool',
    operating: 1,
    thermometer: 21,
    thresholdTemp: 23
});

// get our action function
const actionFn4 = thermostat4(condTable)
    .run()
    .join();

// console:
// > Turning off the air conditioning
actionFn4();
```

While this is slightly more code, it is more expressive and can reduce the need for comments in the code.

## Old examples

This are here so that there is something documenting more complex usage: other Boolean operators, returning all value results in `Decision` rather than just the first, passing values into an action function.

These will be removed when new examples cover these kinds of cases.

```js
import { Truth, Decision, BoolTable } from 'booltable';

// simplest: [Condition, Result]
const makeDecision = x =>
    Decision.of([
        [x > 1, 2],
        [x === 1, 3],
        [x === 0, 3.5],
        [(!x, 4)],
        // default, always true
        [true, 10]
    ]);

// result1 === 2;
// uses default 'first', meaning first true result returns
const result1 = makeDecision(2)
    .run()
    .join();

// result2 === [3.5, 4, 10];
// 'any' means any conditions are true, returns array of results
const result2 = makeDecision(0)
    .run('any')
    .join();

// result3 === 10
// 'last' means last true result returns
const result3 = makeDecision(101)
    .run('last')
    .join();

// result4 === [3.5, 4];
// '2' means first two true conditions -- this can be given number
const result4 = makeDecision(0)
    .run(2)
    .join();

const data = {
    aa: 1,
    bb: true,
    cc: [0],
    dd: { test: 'a' },
    ee: false
};

const conditions = ([a, b, c]) => Truth.of([a, b, c]);

// result5 === true
// .or() means apply "OR" to these conditions, since data.aa is greater than 0, this returns true
// OR means at least one is true
const result5 = conditions([
    data.aa > 0,
    data.bb === true,
    data.cc.length
]).or();

// result6 === false
// .xor() means apply "XOR" to these conditions, since all items are true, this would return false
// XOR means at least one is true and at least one is false
const result6 = conditions([
    data.aa > 0,
    data.bb === true,
    data.cc.length
]).or();

// result7 === false
// .nor() means apply "NOR" to these conditions, since all items are true, this would return false
// NOR means all are false
const result7 = conditions([
    data.aa > 0,
    data.bb === true,
    data.cc.length
]).nor();

// result8 === true
// .and() means apply "AND" to these conditions, since all items are true, this would return true
// AND means all are true
const result8 = conditions([
    data.aa > 0,
    data.bb === true,
    data.cc.length
]).nor();

// these can be combined!
const makeDecision2 = x =>
    Decision.of([
        [Truth.of([x > 1, x < 0]).or(), 2], // is greater than 1 or less than 0
        [Truth.of([x !== 0, typeof x === 'string']).nor(), 3], // is not 0 and not a string
        // default, always true
        [true, 10]
    ]);

// ... and so on
```

## Truth Table

This is an example of how `Truth` can be used like a truth table, using the methods provided.

```js
const a = 2;
const b = 3;
const c = 15;
const d = 150;

const logic1 = Truth.of([a > 11, b === 2, !c, d - 1 >= 100]);
const logic2 = Truth.of([a < b, b !== 4, c > a, d < 1000]);
const logic3 = Truth.of([a < b, b === 4, c === a, d > 1000]);
```

| const  | I      | II      | III     | IV             | .and() | .or() | .nor() | .xor() |
| ------ | ------ | ------- | ------- | -------------- | ------ | ----- | ------ | ------ |
| logic1 | a > 11 | b === 2 | !c      | (d - 1) >= 100 | false  | true  | false  | true   |
| logic2 | a < b  | b !== 4 | c > a   | d < 1000       | true   | true  | false  | false  |
| logic3 | a < b  | b === 4 | c === a | d > 1000       | false  | false | true   | false  |

Better yet, this can be also created using a more expressive API, `BoolTable`.

```js
const tt = BoolTable.of([
    ['is logic1 true with and?', logic1.and()],
    ['is logic2 true with and?', logic2.and()],
    ['is logic3 true with xor?', logic3.xor()]
]);

// false
tt.q('is logic1 true with and?');

// true
tt.q('is logic2 true with and?');

// false
tt.q('is logic3 true with xor?');
```

## Decision Table

This is an example of how `Decision` can be like a decision table.

```js
const makeDecision = x =>
    Decision.of([
        [x > 1, warn('reading is too high')],
        [x === 1, notice('things look good')],
        [x === 0, warn('reading is zero')],
        [x === undefined, error('no reading found')],
        // default, always true
        [true, error('reading is out of range')]
    ]);
```

| condition 1     | action                           |
| --------------- | -------------------------------- |
| x > 1           | warn('reading is too high')      |
| x === 1         | notice('things look good')       |
| !x              | warn('reading is zero')          |
| x === 0         | warn('reading is zero')          |
| x === undefined | error('no reading found')        |
| default         | error('reading is out of range') |

Of course, this is _very_ basic. One can the use `Truth` in combination to identify multiple conditions.

```js
// we use ([x, y, z]) so the fns are still memoizable even though there are multiple params
const cond1 = ([x, y, z]) => Truth.of([x > 1, y > 1, z > 1]).and();
const cond2 = ([x, y, z]) => Truth.of([x > 1, y < 1, z < 1]).and();
const cond3 = ([x, y, z]) => Truth.of([x < 1, y < 1, z < 1]).and();

const makeDecision = ([x, y, z]) =>
    Decision.of([
        [cond1([x, y, z]), warn('all readings high')],
        [cond2([x, y, z]), warn('x is high')],
        [cond3([x, y, z]), notice('all readings in normal range')]
    ]);

makeDecison([1.25, 0.5, 0.1]).run();
// result runs `warn('x is high')`
```

Note that one could also write the above with three items in each row:

```js
const makeDecisionExpanded = ([x, y, z]) =>
    Decision.of([
        // condition(s), fn, argument
        [cond1([x, y, z]), warn, 'all readings high'],
        [cond2([x, y, z]), warn, 'x is high'],
        [cond3([x, y, z]), notice, 'all readings in normal range']
    ]);
```

Better yet, let's add some expressivity:

```js
const bt = ([x, y, z]) =>
    BoolTable.of([
        ['are all the readings high?', cond1([x, y, z])],
        ['is x high?', cond2([x, y, z])],
        ['are things normal?', cond3([x, y, z])]
    ]);

const makeDecisionExpanded = (
    vals // vals === Array [x, y, z], more readable and still memoizable
) =>
    Decision.of([
        // condition(s), fn, argument
        // are/is interchangable
        [bt(vals).q('are all the readings high?'), warn, 'all readings high'],
        [bt(vals).q('is x high?'), warn, 'x is high'],
        [
            bt(vals).q('are things normal?'),
            notice,
            'all readings in normal range'
        ]
    ]);
```

All these result in a decision table like this:

| condition 1 | condition 2 | condition 3 | action (AND)                           |
| ----------- | ----------- | ----------- | -------------------------------------- |
| x > 1       | y > 1       | z > 1       | warn('all readings high')              |
| x > 1       | y < 1       | z < 1       | warn('x is high')                      |
| x < 1       | y < 1       | z < 1       | notice('all readings in normal range') |

This is a very basic example of a decision table, and is only using `.and()` in the calculation of true/false. One could have much more complex logic.

## Truth as ternary

You can also use `Truth` for a ternary condtion, using one of the various `fork*` functions:

`forkOr`, `forkAnd`, `forkXor`, `forkNor` -- each take two functions as parameters, the first being the `false` condition, the second being the `true` condition.

```js
// second function is the one that will run here
Truth.of([true, true, true]).forkAnd(
    () => console.error('false path'),
    () => console.log('true path')
);

// first function will run here
Truth.of([false, true]).forkNor(
    () => console.log('false path'),
    () => console.error('true path')
);
```

## More examples: unit tests

Some more examples can be lifted from the unit tests.

## Early days yet...

This just got started. More documentation coming soon!

## Development

Source is written in TypeScript. Run tests via `npm run test`.

## MIT License

Copyright 2018 Robert Gerald Porter <mailto:rob@weeverapps.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
