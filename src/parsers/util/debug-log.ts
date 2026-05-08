import { formatParseError, Parser } from '@parsil/parser'

/**
 * Match a parser label against the `PARSIL_DEBUG` env-var pattern.
 *
 * Pattern syntax:
 * - `*` — match anything
 * - `foo` — exact match on the label
 * - `foo,bar` — comma-separated list (any item matches)
 * - `foo*` — suffix wildcard, matches any label starting with `foo`
 *
 * Empty / unset env => no match (silent default).
 *
 * @param label The label provided to {@link debugLog}.
 * @param pattern The current `PARSIL_DEBUG` env-var value.
 * @returns `true` if the label is selected by the pattern.
 */
const matchesPattern = (label: string, pattern: string): boolean => {
  if (pattern === '*') return true
  return pattern.split(',').some((part) => {
    const p = part.trim()
    if (p === '') return false
    if (p === '*') return true
    if (p.endsWith('*')) return label.startsWith(p.slice(0, -1))
    return label === p
  })
}

const isEnabled = (label: string): boolean => {
  const env = globalThis.process?.env?.PARSIL_DEBUG
  if (!env) return false
  return matchesPattern(label, env)
}

/**
 * Wrap a parser with enter/exit logging. Logs go to `console.log` and
 * are gated by the `PARSIL_DEBUG` env var so production parsers stay
 * quiet:
 *
 * ```bash
 * PARSIL_DEBUG='*'                # log every wrapped parser
 * PARSIL_DEBUG='ident'            # only the parser labelled 'ident'
 * PARSIL_DEBUG='ident,expr*'      # 'ident' plus anything starting with 'expr'
 * ```
 *
 * Output format:
 *
 * ```
 * [parsil:debug] enter <label> @ index N
 * [parsil:debug] ok    <label> @ index N => <result>
 * [parsil:debug] fail  <label> @ index N: <message>
 * ```
 *
 * @param label A short identifier shown in log lines and used for env matching.
 * @param p The parser to wrap.
 * @returns A parser equivalent to `p` whose execution may emit log lines.
 */
export const debugLog = <T, E>(label: string, p: Parser<T, E>): Parser<T, E> =>
  new Parser((state) => {
    const enabled = isEnabled(label)

    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`[parsil:debug] enter ${label} @ index ${state.index}`)
    }

    const next = p.p(state)

    if (enabled) {
      if (next.isError) {
        const msg =
          typeof next.error === 'string'
            ? next.error
            : formatParseError(
                next.error as Parameters<typeof formatParseError>[0]
              )
        // eslint-disable-next-line no-console
        console.log(
          `[parsil:debug] fail  ${label} @ index ${next.index}: ${msg}`
        )
      } else {
        let display: string
        try {
          display = JSON.stringify(next.result)
        } catch {
          display = String(next.result)
        }
        // eslint-disable-next-line no-console
        console.log(
          `[parsil:debug] ok    ${label} @ index ${next.index} => ${display}`
        )
      }
    }

    return next
  })
