import { Parser } from '../../parser'

/**
 * Creates a parser that recursively evaluates a given parser.
 *
 * This is used to handle recursive grammars, where a rule can reference itself.
 * To prevent an infinite loop, the parser is wrapped in a function (`parserThunk`)
 * that is only evaluated when needed.
 *
 * @param parserThunk - A function that returns the parser to evaluate.
 * @returns A parser that evaluates `parserThunk` when it is run.
 *
 * @template T - The result type of the parser.
 * @template E - The type of the error message, typically `string`.
 */
export const recursive = <T, E>(
  parserThunk: () => Parser<T, E>
): Parser<T, E> =>
  new Parser((state) => {
    return parserThunk().p(state)
  })
