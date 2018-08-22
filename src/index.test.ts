import { Maybe } from 'simple-maybe';
import { Decision, Truth } from './index';
import {
    DecisionTable,
    DecisionMonad,
    TupleConditionalTableRow,
    TupleConditionalTable,
    TruthMonad
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
        const myBadCond2 = Decision.of([
            [false],
            [true]
        ]);

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
            Truth.of(
                n.concat([false])
            );

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

        // 3. m = Decision.of(a); m.chain(f).chain(g) ==== m.chain(x => f(x).chain(g))
        const associativity1 = Decision.of(a)
            .chain(g)
            .chain(f);
        const associativity2 = Decision.of(a).chain((x: Array<boolean>) =>
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
});