export interface Monad {
    map: Function;
    chain: Function;
    join: Function;
    emit: Function;
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
    forkOr: (f: Function, g: Function) => any;
    forkAnd: (f: Function, g: Function) => any;
    forkXor: (f: Function, g: Function) => any;
    forkNor: (f: Function, g: Function) => any;
    forkOrL: (f: Function) => any;
    forkOrR: (f: Function) => any;
    forkAndL: (f: Function) => any;
    forkAndR: (f: Function) => any;
    forkXorL: (f: Function) => any;
    forkXorR: (f: Function) => any;
    forkNorL: (f: Function) => any;
    forkNorR: (f: Function) => any;
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


export interface TupleBoolTableRow extends Array<boolean | string> {
    0: string,
    1: boolean
}

export type BoolTable = TupleBoolTableRow[];

export interface BoolTableMonad extends Monad {
    concat: Function;
    head: Function;
    tail: Function;
    isEmpty: Function;
    q: Function;
    query: Function;
}

export interface MonadConstructor {
    of: Function
}

export interface DecisionMonadConstructor extends MonadConstructor {
    of: (x: any) => DecisionMonad
}

export interface TruthMonadConstructor extends MonadConstructor {
    of: (x: any) => TruthMonad
}

export interface BoolTableMonadConstructor extends MonadConstructor {
    of: (x: any) => BoolTableMonad
}