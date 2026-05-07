import { parseError, Parser } from '@parsil/parser'
import { regex } from '@parsil/parsers/regex'

/**
 * Match a quoted string literal with conventional backslash escapes
 * (`\\"`, `\\\\`, `\\n`, `\\t`, `\\r`). Returns the unescaped contents
 * **without** the surrounding quotes.
 *
 * The default quote character is `"`. Pass `'` to match single-quoted
 * strings (with escape `\\'`).
 *
 * Multi-line strings are not supported — if the input crosses a newline
 * before a closing quote, the parser fails.
 *
 * @example
 * stringLit().run('"hello\\nworld" rest')   // result: 'hello\nworld'
 * stringLit("'").run("'it\\'s ok' rest")     // result: "it's ok"
 *
 * @param quote The quote character delimiting the string (default `"`).
 * @returns A parser that matches a quoted string and yields its decoded contents.
 */
export const stringLit = (quote: '"' | "'" = '"'): Parser<string> => {
  // Build a regex that matches: quote, then any of (escape | non-quote-non-backslash-non-newline)*, then quote.
  // We use the character class to exclude the quote and \ and newlines.
  const quoteEsc = quote === '"' ? '"' : "'"
  const re = new RegExp(
    `^${quoteEsc}((?:\\\\.|[^\\\\${quoteEsc}\\n\\r])*)${quoteEsc}`
  )

  return regex(re)
    .map((raw) => {
      // raw includes the quotes; re-extract the inner via a slice and decode escapes.
      const inner = raw.slice(1, -1)
      return inner.replace(/\\(.)/g, (_, ch) => {
        switch (ch) {
          case 'n':
            return '\n'
          case 't':
            return '\t'
          case 'r':
            return '\r'
          case '\\':
            return '\\'
          case quote:
            return quote
          default:
            return ch
        }
      })
    })
    .errorMap(({ index }) =>
      parseError(
        'stringLit',
        index,
        `Expected a ${quote === '"' ? 'double' : 'single'}-quoted string literal`,
        { expected: `${quote}...${quote}` }
      )
    )
}
