import { Parser } from '@parsil/parser'
import { optionalWhitespace } from '@parsil/parsers/whitespace/optional-whitespace'

/**
 * Run `p` then consume any trailing whitespace. Use this to wrap every
 * "lexed" token in a free-form grammar so whitespace handling is
 * consistent and doesn't have to be repeated at every `sequenceOf`
 * site.
 *
 * The returned parser yields `p`'s result; trailing whitespace is
 * discarded. Use `lexeme` if you prefer the Megaparsec naming.
 *
 * @example
 * const lex = <T>(p: Parser<T>) => tok(p)
 * const lparen = lex(char('('))
 * const word = lex(letters)
 * sequenceOf([word, lparen, word]).run('foo ( bar)')
 * // result: ['foo', '(', 'bar']
 *
 * @param p The token parser whose result should be preserved.
 * @returns A parser that yields `p`'s result and consumes trailing whitespace.
 */
export const tok = <T, E>(p: Parser<T, E>): Parser<T, E> =>
  p.skip(optionalWhitespace as unknown as Parser<string, E>)

/**
 * Alias of {@link tok}. Megaparsec calls this combinator `lexeme`;
 * either name is fine — pick whichever reads better in your grammar.
 *
 * @param p The token parser whose result should be preserved.
 * @returns A parser that yields `p`'s result and consumes trailing whitespace.
 */
export const lexeme = <T, E>(p: Parser<T, E>): Parser<T, E> => tok(p)
