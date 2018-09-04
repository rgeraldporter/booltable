import { Maybe } from 'simple-maybe';
import { Decision, Truth, BoolTable } from './index';
import {
    DecisionTable,
    DecisionMonad,
    TupleConditionalTableRow,
    TupleConditionalTable,
    TruthMonad,
    BoolTableMonad,
    TupleBoolTableRow
} from './types';

describe('The Decision monad', () => {
    it('should satisfy the first monad law of left identity', () => {
        const a: DecisionTable = [[true, 1]];

        // more complex than usual as this is a typed monad; need a function that adheres to type restrictions
        const f = (n: TupleConditionalTable): DecisionMonad =>
            Decision.of(
                n.map(
                    (y: TupleConditionalTableRow): TupleConditionalTableRow => [
                        y[0],
                        y[1] + 1
                    ]
                )
            );

        // 1. unit = Decision; unit(x).chain(f) ==== f(x); Decision(x).chain(f) ==== f(x)
        const leftIdentity1 = Decision.of(a).chain(f);
        const leftIdentity2 = f(a);

        expect(leftIdentity1.join()).toEqual(leftIdentity2.join());

        const g = (n: TupleConditionalTable): DecisionMonad =>
            Decision.of(n.concat([true, 16]));

        // 1. unit = Decision; unit(x).chain(f) ==== f(x); Decision(x).chain(f)
        const leftIdentity3 = Decision.of(a).chain(g);
        const leftIdentity4 = g(a);

        expect(leftIdentity3.join()).toEqual(leftIdentity4.join());
    });

    it('should satisfy the second monad law of right identity', () => {
        const a: DecisionTable = [[true, 1]];

        const rightIdentity1 = Decision.of(a).chain(Decision.of);
        const rightIdentity2 = Decision.of(a);

        // 2. unit = Decision; m = Decision.of(a); m.chain(unit) ==== m;
        expect(rightIdentity1.join()).toEqual(rightIdentity2.join());
    });

    it('should satisfy the third monad law of associativity', () => {
        const a: DecisionTable = [[true, 1]];

        const g = (n: TupleConditionalTable): DecisionMonad =>
            Decision.of(n.concat([true, 16]));
        const f = (n: TupleConditionalTable): DecisionMonad =>
            Decision.of(n.concat([true, 18]));

        // 3. m = Decision.of(a); m.chain(f).chain(g) ==== m.chain(x => f(x).chain(g))
        const associativity1 = Decision.of(a)
            .chain(g)
            .chain(f);
        const associativity2 = Decision.of(a).chain((x: DecisionTable) =>
            g(x).chain(f)
        );

        expect(associativity1.join()).toEqual(associativity2.join());
    });

    it('should accept correctly formatted parameters and run each kind of decision', () => {
        const myCond: DecisionMonad = Decision.of([
            [false, 1],
            [false, 2],
            [true, 3],
            [true, 3.5],
            [true, 3.76],
            [false, 3.99],
            [true, 4]
        ]);

        expect(myCond.run().join()).toBe(3);
        expect(myCond.run('last').join()).toBe(4);
        expect(myCond.run('any').join()).toEqual([3, 3.5, 3.76, 4]);
        expect(myCond.run(2).join()).toEqual([3, 3.5]);
        expect(myCond.run(7).join()).toEqual([3, 3.5, 3.76, 4]);

        const timesThree = (x: number) => x * 3;

        const myFnCond: DecisionMonad = Decision.of([
            [false, (x: number) => x, 1],
            [false, (x: number) => x, 2],
            [true, (x: number) => x + 1, 2],
            [true, (x: number) => x * 2, 2],
            [false, (x: number) => x, 3],
            [true, timesThree, 3]
        ]);

        expect(myFnCond.run().join()).toBe(3);
        expect(myFnCond.run('last').join()).toBe(9);
        expect(myFnCond.run('any').join()).toEqual([3, 4, 9]);
        expect(myFnCond.run(2).join()).toEqual([3, 4]);
    });

    it('should not accept badly formatted parameters', () => {
        const mock = jest.spyOn(console, 'error');

        // @ts-ignore ignore because this is testing bad behaviour
        const myBadCond = Decision.of(false, 2);

        expect(console.error).toBeCalledWith(
            'Decision must be passed parameters that adhere to the documented type. Value that was passed:',
            false
        );

        mock.mockReset();
    });

    it('should not accept badly formatted parameters', () => {
        const mock = jest.spyOn(console, 'error');

        // @ts-ignore ignore because this is testing bad behaviour
        const myBadCond2 = Decision.of([[false], [true]]);

        expect(console.error).toBeCalledWith(
            'Decision must be passed parameters that adhere to the documented type. Value that was passed:',
            [[false], [true]]
        );

        mock.mockReset();
    });

    it('should operate with Truth monads', () => {
        const fullT = Truth.of([false, false, true]).xor();
        const partialT = Truth.of([false, false]);

        const myCond = Decision.of([
            [Truth.of([true, true, false]).and(), 1],
            [Truth.of([true]).and(), 2],
            [partialT.nor(), 3],
            [true, 4],
            [false, 19],
            [fullT, 23],
            [false, 55]
        ]);

        expect(myCond.run().join()).toBe(2);
        expect(myCond.run('last').join()).toBe(23);
        expect(myCond.run('any').join()).toEqual([2, 3, 4, 23]);
        expect(myCond.run(2).join()).toEqual([2, 3]);
    });
});

describe('The Truth monad', () => {
    it('should satisfy the first monad law of left identity', () => {
        const a: Array<boolean> = [true, false, true];

        // more complex than usual as this is a typed monad; need a function that adheres to type restrictions
        const f = (n: Array<boolean>): TruthMonad =>
            Truth.of(n.concat([false]));

        // 1. unit = Truth; unit(x).chain(f) ==== f(x); Truth(x).chain(f) ==== f(x)
        const leftIdentity1 = Truth.of(a).chain(f);
        const leftIdentity2 = f(a);

        expect(leftIdentity1.join()).toEqual(leftIdentity2.join());

        const g = (n: Array<boolean>): TruthMonad =>
            Truth.of(n.concat([true, false]));

        // 1. unit = Truth; unit(x).chain(f) ==== f(x); Truth(x).chain(f)
        const leftIdentity3 = Truth.of(a).chain(g);
        const leftIdentity4 = g(a);

        expect(leftIdentity3.join()).toEqual(leftIdentity4.join());
    });

    it('should satisfy the second monad law of right identity', () => {
        const a: Array<boolean> = [false];

        const rightIdentity1 = Truth.of(a).chain(Truth.of);
        const rightIdentity2 = Truth.of(a);

        // 2. unit = Truth; m = Truth.of(a); m.chain(unit) ==== m;
        expect(rightIdentity1.join()).toEqual(rightIdentity2.join());
    });

    it('should satisfy the third monad law of associativity', () => {
        const a: Array<boolean> = [false];

        const g = (n: Array<boolean>): TruthMonad =>
            Truth.of(n.concat([true, false]));
        const f = (n: Array<boolean>): TruthMonad =>
            Truth.of(n.concat([true, false, true, true]));

        // 3. m = Truth.of(a); m.chain(f).chain(g) ==== m.chain(x => f(x).chain(g))
        const associativity1 = Truth.of(a)
            .chain(g)
            .chain(f);
        const associativity2 = Truth.of(a).chain((x: Array<boolean>) =>
            g(x).chain(f)
        );

        expect(associativity1.join()).toEqual(associativity2.join());
    });

    it('should be able to handle the correct parameters, and process XOR, OR, AND, NOR', () => {
        const myBool = Truth.of([true, true, true, false]);

        expect(myBool.and()).toBe(false);
        expect(myBool.xor()).toBe(true);
        expect(myBool.or()).toBe(true);
        expect(myBool.nor()).toBe(false);
    });

    it('should be able to fork Left for false and Right for true in any given Fork variant', () => {
        const myBool1 = Truth.of([true, true, true, false]);
        const myBool2 = Truth.of([true, true, true]);
        const myBool3 = Truth.of([false]);

        myBool1.forkAnd(
            () => expect(true).toBe(true), // pass, right path
            () => expect(true).toBe(false) // fail, wrong path
        );

        myBool1.forkAndL(() => expect(true).toBe(true));
        myBool1.forkAndR(() => expect(true).toBe(false));

        myBool2.forkAnd(
            () => expect(true).toBe(false), // fail, wrong path
            () => expect(true).toBe(true) // pass, right path
        );

        myBool2.forkAndL(() => expect(true).toBe(false));
        myBool2.forkAndR(() => expect(true).toBe(true));

        myBool3.forkOr(
            () => expect(true).toBe(true), // pass, right path
            () => expect(true).toBe(false) // fail, wrong path
        );

        myBool3.forkOrL(() => expect(true).toBe(true));
        myBool3.forkOrR(() => expect(true).toBe(false));

        myBool2.forkOr(
            () => expect(true).toBe(false), // fail, wrong path
            () => expect(true).toBe(true) // pass, right path
        );

        myBool2.forkOrL(() => expect(true).toBe(false));
        myBool2.forkOrR(() => expect(true).toBe(true));

        myBool1.forkXor(
            () => expect(true).toBe(false), // fail, wrong path
            () => expect(true).toBe(true) // pass, right path
        );

        myBool1.forkXorL(() => expect(true).toBe(false));
        myBool1.forkXorR(() => expect(true).toBe(true));

        myBool2.forkXor(
            () => expect(true).toBe(true), // pass, right path
            () => expect(true).toBe(false) // fail, wrong path
        );

        myBool2.forkXorL(() => expect(true).toBe(true));
        myBool2.forkXorR(() => expect(true).toBe(false));

        myBool1.forkNor(
            () => expect(true).toBe(true), // pass, right path
            () => expect(true).toBe(false) // fail, wrong path
        );

        myBool1.forkNorL(() => expect(true).toBe(true));
        myBool1.forkNorR(() => expect(true).toBe(false));

        myBool3.forkNor(
            () => expect(true).toBe(false), // fail, wrong path
            () => expect(true).toBe(true) // pass, right path
        );

        myBool3.forkNorL(() => expect(true).toBe(false));
        myBool3.forkNorR(() => expect(true).toBe(true));
    });
});

describe('The BoolTable monad', () => {
    // @todo fix this test, needs to be type-appropriate
    xit('should satisfy the first monad law of left identity', () => {
        const a: TupleBoolTableRow = ['this', true];

        // more complex than usual as this is a typed monad; need a function that adheres to type restrictions
        const f = (n: TupleBoolTableRow): BoolTableMonad =>
            BoolTable.of(n.concat(['stuff', false]));

        // 1. unit = BoolTable; unit(x).chain(f) ==== f(x); BoolTable(x).chain(f) ==== f(x)
        const leftIdentity1 = BoolTable.of(a).chain(f);
        const leftIdentity2 = f(a);

        expect(leftIdentity1.join()).toEqual(leftIdentity2.join());

        const g = (n: TupleBoolTableRow): BoolTableMonad =>
            BoolTable.of(n.concat(['things', false]));

        // 1. unit = BoolTable; unit(x).chain(f) ==== f(x); BoolTable(x).chain(f)
        const leftIdentity3 = BoolTable.of(a).chain(g);
        const leftIdentity4 = g(a);

        expect(leftIdentity3.join()).toEqual(leftIdentity4.join());
    });

    it('should satisfy the second monad law of right identity', () => {
        const a: TupleBoolTableRow = ['that', false];

        const rightIdentity1 = BoolTable.of(a).chain(BoolTable.of);
        const rightIdentity2 = BoolTable.of(a);

        // 2. unit = BoolTable; m = BoolTable.of(a); m.chain(unit) ==== m;
        expect(rightIdentity1.join()).toEqual(rightIdentity2.join());
    });

    it('should satisfy the third monad law of associativity', () => {
        const a: TupleBoolTableRow = ['the other thing', false];

        const g = (n: TupleBoolTableRow): BoolTableMonad =>
            BoolTable.of(n.concat(['somesuch', false]));
        const f = (n: TupleBoolTableRow): BoolTableMonad =>
            BoolTable.of(n.concat(['thingiemajig', true]));

        // 3. m = BoolTable.of(a); m.chain(f).chain(g) ==== m.chain(x => f(x).chain(g))
        const associativity1 = BoolTable.of(a)
            .chain(g)
            .chain(f);
        const associativity2 = BoolTable.of(a).chain((x: TupleBoolTableRow) =>
            g(x).chain(f)
        );

        expect(associativity1.join()).toEqual(associativity2.join());
    });

    it('should be able to return the boolean value of the table row', () => {
        const tt = BoolTable.of([
            ['are these things true?', Truth.of([true]).and()],
            ['are these things false?', Truth.of([true]).xor()],
            ['are these also false?', Truth.of([false, false]).and()],
            ['are these also true?', Truth.of([true, false, true]).xor()],
            [
                'is that is also true as well?',
                Truth.of([false, false, false]).nor()
            ],
            ['is it true that we need only a Boolean?', true],
            ['are non-Boolean values returning as Boolean?', 1]
        ]);

        const shouldBeTrue = tt.q('are these things true?');
        const shouldBeFalse = tt.q('are these things false?');

        expect(shouldBeTrue).toBe(true);
        expect(shouldBeFalse).toBe(false);

        expect(tt.q('are these also false?')).toBe(false);
        expect(tt.q('are these also true?')).toBe(true);
        expect(tt.q('is that is also true as well?')).toBe(true);
        expect(tt.q('is it true that we need only a Boolean?')).toBe(true);
        expect(tt.q('are non-Boolean values returning as Boolean?')).toBe(true);
    });
});

/*
const tt = BoolTable.of([
    ['these things are true', Truth.of(true).and()],
    ['these things are false', Truth.of(true).xor()]
])

const myFnCond: DecisionMonad = Decision.of([
    [tt.if('these things are true'), (x: number) => x, 1],
    [false, (x: number) => x, 2],
    [true, (x: number) => x + 1, 2],
    [true, (x: number) => x * 2, 2],
    [false, (x: number) => x, 3],
    [true, timesThree, 3]
]);
*/
