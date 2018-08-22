export interface Monad {
    map: Function;
    chain: Function;
    join: Function;
    inspect(): string;
    ap: Function;
}

export interface TruthMonad extends Monad {
    concat: Function;
    head: Function;
    tail: Function;
    isEmpty: Function;
    or: () => boolean;
    and: () => boolean;
    xor: () => boolean;
    nor: () => boolean;
}

export interface DecisionMonad extends Monad {
    concat: Function;
    head: Function;
    tail: Function;
    isEmpty: Function;
    run: Function;
}


// [cond, result]
export interface TupleConditionalTableRow extends Array<boolean | any> {
    0: boolean;
    1: any;
}

// [cond, fn]
export interface TupleConditionalFnTableRow extends Array<boolean | Function | any> {
    0: boolean;
    1: Function;
    2: any;
}

export interface TupleConditionalFnTable extends Array<TupleConditionalFnTableRow>{}
export interface TupleConditionalTable extends Array<TupleConditionalTableRow>{}

export type DecisionTable = TupleConditionalFnTableRow[] | TupleConditionalTableRow[]
export type ConditionalRow = TupleConditionalFnTableRow | TupleConditionalTableRow
export type RunType = 'first' | 'last' | number | 'any'

export interface MonadConstructor {
    of: Function
}

export interface DecisionMonadConstructor extends MonadConstructor {
    of: (x: any) => DecisionMonad
}

export interface TruthMonadConstructor extends MonadConstructor {
    of: (x: any) => TruthMonad
}

//TruthMonadConstructor


// Tuple Conditional Table has an array of rows with two items: the condition (true/false) and the return result
// e.g. [myConditional, theResult]
// similar to pattern at https://github.com/rgeraldporter/if-alternatives#alternatives-4 but without functions

/*
Conditional tables

TABLE STRUCTURES

tuple table

[cond, result]
[cond, result]
[cond, result]
[cond, result]

tuple fn expression table

[cond, fn]
[cond, fn]
[cond, fn]
[cond, fn]

tuple fn table

[cond, fn, param]
[cond, fn, param]
[cond, fn, param]
[cond, fn, param]

truth table  with  decision table

[$$AND([cond, cond, cond]), result]
[$$OR([cond, cond]), result ]
[$$XOR([cond, cond]), result]
[$$AND([cond, cond, cond, cond, cond]), result]

Truth.of(conditions)
    .or()
    .and()
    .xor()
    .nor()


Truth.of([user.hasName(), user.hasPhoto(), user.canVote()])
    .and() // emit "true" if all true


CONDITIONAL HANDLING

first-true => .find
any-true => .some
table-results => .map
... etc


- first
- all
- last
- n

*/