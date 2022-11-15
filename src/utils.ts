import { pipe } from "fp-ts/function"
import * as A from "fp-ts/Array"

/* Imported inline from fp-ts-std */

/**
 * Merge two records together. For merging many identical records, instead
 * consider defining a semigroup.
 *
 * @example
 * import { merge } from 'fp-ts-std/Struct'
 *
 * assert.deepStrictEqual(merge({ a: 1, b: 2 })({ b: 'two', c: true }), { a: 1, b: 'two', c: true })
 *
 * @since 0.14.0
 */
export const merge =
  <A>(x: A) =>
  <B>(y: B): A & B => ({ ...x, ...y })

/**
 * Pick a set of keys from a `Record`. The value-level equivalent of the `Pick`
 * type.
 *
 * @example
 * import { pick } from 'fp-ts-std/Struct'
 * import { pipe } from 'fp-ts/function'
 *
 * const picked = pipe(
 *   { a: 1, b: 'two', c: [true] },
 *   pick(['a', 'c'])
 * )
 *
 * assert.deepStrictEqual(picked, { a: 1, c: [true] })
 *
 * @since 0.14.0
 */
export const pick =
  <A, K extends keyof A>(ks: Array<K>) =>
  (x: A): Pick<A, K> =>
    // I don't believe there's any reasonable way to model this sort of
    // transformation in the type system without an assertion - at least here
    // it's in a single reused place.
    pipe(
      ks,
      A.reduce({} as Pick<A, K>, (ys, k) => merge(ys)(k in x ? { [k]: x[k] } : {}))
    )
