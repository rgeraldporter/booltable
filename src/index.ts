import {
    TruthMonad,
    Monad,
    TupleConditionalFnTable,
    TupleConditionalTable,
    TupleConditionalFnTableRow,
    TupleConditionalTableRow,
    DecisionTable,
    DecisionMonad,
    ConditionalRow,
    DecisionMonadConstructor,
    TruthMonadConstructor,
    RunType,
    BoolTable,
    BoolTableMonad,
    TupleBoolTableRow,
    BoolTableMonadConstructor
} from './types';

import { Maybe } from 'simple-maybe';

const noop = () => {};

const truthOr = (x: Array<boolean>): boolean =>
    Array.isArray(x) && x.length ? x.some((a: boolean) => a) : false;

const truthAnd = (x: Array<boolean>): boolean =>
    Array.isArray(x) && x.length ? x.every((a: boolean) => a) : false;

const truthXor = (x: Array<boolean>): boolean =>
    Array.isArray(x) && x.length ? new Set(x).size > 1 : false;

const truthNor = (x: Array<boolean>): boolean =>
    Array.isArray(x) && x.length ? x.every((a: boolean) => !a) : false;

const Truth = (x: Array<boolean>): TruthMonad => ({
    map: (f: Function): TruthMonad => Truth(f(x)),
    chain: (f: Function): any => f(x),
    ap: (y: Monad): Monad => y.map(x),
    inspect: (): string => `Truth(${x})`,
    join: (): boolean | Array<boolean> => x,
    emit: (): boolean | Array<boolean> => x,
    concat: (o: TruthMonad): TruthMonad =>
        o.chain((r: any): TruthMonad => Truth((x as Array<boolean>).concat(r))),
    head: (): boolean | Array<boolean> =>
        Array.isArray(x) && x.length ? x[0] : [],
    tail: (): boolean | Array<boolean> =>
        Array.isArray(x) && x.length ? x[x.length - 1] : [],
    isEmpty: (): Boolean => Boolean(!Array.isArray(x) || x.length === 0),
    or: (): boolean => truthOr(x),
    and: (): boolean => truthAnd(x),
    nor: (): boolean => truthNor(x),
    xor: (): boolean => truthXor(x),
    forkOr: (f: Function, g: Function): any => (truthOr(x) ? g() : f()),
    forkOrL: (f: Function): any => (truthOr(x) ? noop() : f() ),
    forkOrR: (f: Function): any => (truthOr(x) ? f() : noop() ),
    forkAnd: (f: Function, g: Function): any => (truthAnd(x) ? g() : f()),
    forkAndL: (f: Function): any => (truthAnd(x) ? noop() : f()),
    forkAndR: (f: Function): any => (truthAnd(x) ? f() : noop()),
    forkXor: (f: Function, g: Function): any => (truthXor(x) ? g() : f()),
    forkXorL: (f: Function): any => (truthXor(x) ? noop() : f()),
    forkXorR: (f: Function): any => (truthXor(x) ? f() : noop()),
    forkNor: (f: Function, g: Function): any => (truthNor(x) ? g() : f()),
    forkNorL: (f: Function): any => (truthNor(x) ? noop() : f()),
    forkNorR: (f: Function): any => (truthNor(x) ? f() : noop())
});

const truthTypeError = (x: any): TruthMonad => {
    console.error(
        'Decision must be passed parameters that adhere to the documented type. Value that was passed:',
        x
    );
    return Truth([false]);
};

// @todo make much stricter; more of a sniff test right now
const TruthOf = (x: Array<boolean>): TruthMonad =>
    Array.isArray(x) ? Truth(x) : truthTypeError(x);

const exportTruth: TruthMonadConstructor = {
    of: TruthOf
};

const xFnTableFirst = (x: TupleConditionalFnTable): Monad =>
    Maybe.of(x.find((y: TupleConditionalFnTableRow) => y[0])).map(
        (y: TupleConditionalFnTableRow) => y[1](y[2])
    );

const xFnTableLast = (x: TupleConditionalFnTable): Monad =>
    Maybe.of(
        x
            .slice()
            .reverse()
            .find((y: TupleConditionalFnTableRow) => y[0])
    ).map((y: TupleConditionalFnTableRow) => y[1](y[2]));

const xFnTableAny = (x: TupleConditionalFnTable): Monad =>
    Maybe.of(x.filter((y: TupleConditionalFnTableRow) => y[0])).map(
        (y: TupleConditionalFnTable) =>
            y.map((z: TupleConditionalFnTableRow) => z[1](z[2]))
    );

const xFnTableN = (n: number) => (x: TupleConditionalFnTable): Monad =>
    Maybe.of(x.filter((y: TupleConditionalFnTableRow) => y[0]))
        .map((y: TupleConditionalFnTable) => y.slice(0, n))
        .map((y: TupleConditionalFnTable) =>
            y.map((z: TupleConditionalFnTableRow) => z[1](z[2]))
        );

const xTableFirst = (x: TupleConditionalTable): Monad =>
    Maybe.of(x.find((y: TupleConditionalTableRow) => y[0])).map(
        (y: TupleConditionalTableRow) => y[1]
    );

const xTableLast = (x: TupleConditionalTable): Monad =>
    Maybe.of(
        x
            .slice()
            .reverse()
            .find((y: TupleConditionalTableRow) => y[0])
    ).map((y: TupleConditionalTableRow) => y[1]);

const xTableAny = (x: TupleConditionalFnTable): Monad =>
    Maybe.of(x.filter((y: TupleConditionalFnTableRow) => y[0])).map(
        (y: TupleConditionalFnTable) =>
            y.map((z: TupleConditionalFnTableRow) => z[1])
    );

const xTableN = (n: number) => (x: TupleConditionalFnTable): Monad =>
    Maybe.of(x.filter((y: TupleConditionalFnTableRow) => y[0]))
        .map((y: TupleConditionalFnTable) => y.slice(0, n))
        .map((y: TupleConditionalFnTable) =>
            y.map((z: TupleConditionalFnTableRow) => z[1])
        );

const decide = (t: RunType, x: DecisionTable) => {
    // decide which strategy to use
    const condTable = [
        [x[0].length === 3 && t === 'first', xFnTableFirst],
        [x[0].length === 3 && t === 'last', xFnTableLast],
        [x[0].length === 3 && t === 'any', xFnTableAny],
        [x[0].length === 3 && typeof t === 'number', xFnTableN(t as number)],
        [t === 'first', xTableFirst],
        [t === 'last', xTableLast],
        [t === 'any', xTableAny],
        [isFinite(t as number), xTableN(t as number)]
    ];

    const finder = condTable.find((y: ConditionalRow) => y[0]);

    return Maybe.of(finder).fork(
        (): void => console.error('condition table is broken'),
        (y: TupleConditionalTableRow): any => y[1](x)
    );
};

const Decision = (x: DecisionTable): DecisionMonad => ({
    map: (f: Function): DecisionMonad => Decision(f(x)),
    chain: (f: Function): any => f(x),
    ap: (y: Monad): Monad => y.map(x),
    inspect: (): string => `Decision(${x})`,
    join: (): DecisionTable => x,
    emit: (): DecisionTable => x,
    concat: (o: DecisionMonad): DecisionMonad =>
        o.chain(
            (r: DecisionMonad): DecisionMonad =>
                Decision((x as Array<any>).concat(r)) // @todo should be x as DecisionTable, no?
        ),
    head: (): DecisionTable => x[0],
    tail: (): DecisionTable => x[x.length - 1],
    isEmpty: (): Boolean => Boolean(x.length === 0),
    run: (t: RunType = 'first'): any => decide(t, x)
});

const decisionTypeError = (x: any): DecisionMonad => {
    console.error(
        'Decision must be passed parameters that adhere to the documented type. Value that was passed:',
        x
    );

    return Decision([[true, null]]);
};

// @todo make much stricter; more of a sniff test right now
const DecisionOf = (x: DecisionTable): DecisionMonad =>
    Array.isArray(x) &&
    Array.isArray(x[0]) &&
    x[0].length > 1 &&
    x[0].length < 4
        ? Decision(x)
        : decisionTypeError(x);

const exportDecision: DecisionMonadConstructor = {
    of: DecisionOf
};

const findIfCond = (a: string, x: BoolTable) =>
    x.find((y: TupleBoolTableRow) => (y[0] === a ? true : false));

const queryBTFn = (x: BoolTable) => (a: string): Boolean =>
    Maybe.of(findIfCond(a, x))
        .map((y: TupleBoolTableRow) => y.slice(-1).pop())
        .fork(
            _ => {
                console.warn('`if` condition not found: ', a);
                return false;
            },
            y => Boolean(y)
        );

const BoolTable = (x: BoolTable): BoolTableMonad => ({
    map: (f: Function): BoolTableMonad => BoolTable(f(x)),
    chain: (f: Function): any => f(x),
    ap: (y: Monad): Monad => y.map(x),
    inspect: (): string => `BoolTable(${x})`,
    join: (): BoolTable => x,
    emit: (): BoolTable => x,
    concat: (o: BoolTableMonad): BoolTableMonad =>
        o.chain(
            (r: any): BoolTableMonad => BoolTable((x as BoolTable).concat(r))
        ),
    head: (): TupleBoolTableRow | Array<void> =>
        Array.isArray(x) && x.length ? x[0] : [],
    tail: (): TupleBoolTableRow | Array<void> =>
        Array.isArray(x) && x.length ? x[x.length - 1] : [],
    isEmpty: (): Boolean => Boolean(!Array.isArray(x) || x.length === 0),
    q: queryBTFn(x),
    query: queryBTFn(x)
});

const boolTableTypeError = (x: any): BoolTableMonad => {
    console.error(
        'BoolTable must be passed parameters that adhere to the documented type. Value that was passed:',
        x
    );

    return BoolTable([['there was a BoolTable type error', true]]);
};

// @todo make much stricter; more of a sniff test right now
const BoolTableOf = (x: BoolTable): BoolTableMonad =>
    Array.isArray(x) && Array.isArray(x[0]) && x[0].length === 2
        ? BoolTable(x)
        : boolTableTypeError(x);

const exportBoolTable: BoolTableMonadConstructor = {
    of: BoolTableOf
};

export {
    exportDecision as Decision,
    exportTruth as Truth,
    exportBoolTable as BoolTable
};
