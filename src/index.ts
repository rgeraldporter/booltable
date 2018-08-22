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
    RunType
} from './types';

import { Maybe } from 'simple-maybe';

const Truth = (x: Array<boolean>): TruthMonad => ({
    map: (f: Function): TruthMonad => Truth(f(x)),
    chain: (f: Function): any => f(x),
    ap: (y: Monad): Monad => y.map(x),
    inspect: (): string => `Truth(${x})`,
    join: (): boolean | Array<boolean> => x,
    concat: (o: TruthMonad): TruthMonad =>
        o.chain((r: any): TruthMonad => Truth((x as Array<boolean>).concat(r))),
    head: (): boolean | Array<boolean> =>
        Array.isArray(x) && x.length ? x[0] : [],
    tail: (): boolean | Array<boolean> =>
        Array.isArray(x) && x.length ? x[x.length - 1] : [],
    isEmpty: (): Boolean => Boolean(!Array.isArray(x) || x.length === 0),
    or: (): boolean =>
        Array.isArray(x) && x.length ? x.some((a: boolean) => a) : false,
    and: (): boolean =>
        Array.isArray(x) && x.length ? x.every((a: boolean) => a) : false,
    nor: (): boolean =>
        Array.isArray(x) && x.length ? x.every((a: boolean) => !a) : false,
    xor: (): boolean =>
        Array.isArray(x) && x.length ? new Set(x).size > 1 : false
});

const truthTypeError = (x: any): TruthMonad => {
    console.error(
        'Decision must be passed parameters that adhere to the documented type. Value that was passed:',
        x
    );
    return Truth([false]);
};

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

    // this will return data as Nothing() when processed
    return Decision([[true, null]]);
};

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

export { exportDecision as Decision, exportTruth as Truth };
