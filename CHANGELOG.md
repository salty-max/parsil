# parsil

## 3.0.0

### Major Changes

- fb7d385: **Breaking: error model overhaul.** Primitive parsers now emit a structured `ParseError` object instead of a `ParseError @ index N -> X: msg` string. `Parser<T, E>` defaults to `Parser<T, E = ParseError>`.

  ```ts
  type ParseError = {
    parser: string // 'char', 'str', 'regex', 'keyword', ...
    index: number
    message: string
    expected?: string
    actual?: string
    context?: string[] // outer-first, populated by `inContext`
  }
  ```

  ### What's new
  - `ParseError` type, `formatParseError(e)` display helper, and `parseError(parser, index, msg, extras?)` factory exported from the package root.
  - `errorMap` callback receives the structured `ParseError` directly — branch on `error.parser` / `error.expected` / `error.actual` without regex-ing a string.
  - New `inContext(label, p)` combinator that wraps a parser and pushes `label` onto the failure's `error.context` array on failure (outer-first). Complementary to `label(name, p)` (in #20): `inContext` wraps and preserves the inner error; `label` replaces. The display formatter renders context as `[outer > inner]` brackets.
  - `choice` aggregates `expected` from each failing branch and reports them as `"Expected one of: a | b | c"`. It also surfaces the **furthest-progress** branch — the one that consumed the most input before failing — in the composite message.

  ### Migrating consumers

  If you were treating `error` as a string:

  ```ts
  // Before
  const num = P.digits
    .map(Number)
    .errorMap(({ error }) => `Bad number: ${error}`)

  // After (option 1 — keep the string flow)
  const num = P.digits
    .map(Number)
    .errorMap(({ error }) => `Bad number: ${P.formatParseError(error)}`)

  // After (option 2 — read structured fields)
  const num = P.digits.map(Number).errorMap(({ error, index }) => ({
    code: 'EXPECTED_NUMBER',
    parser: error.parser, // 'digits'
    expected: error.expected, // '[0-9]+'
    message: 'Expected a number',
    at: index,
  }))
  ```

  If you were custom-typing `Parser<T, MyError>`, nothing changes — your `errorMap` chain still produces `MyError`.

  ### Doc updates
  - README: rewritten Error handling section covering `ParseError`, `errorMap`, `inContext`, `choice`'s expected-set + furthest-progress, the always-backtracks model, the coroutine throw caveat, and the English-only policy.
  - New combinator `inContext` listed in the README API table.

  ### Notes
  - The runtime cost of structured errors over strings is negligible: an extra object allocation on the failure path. Successful parses are unaffected.
  - Custom parsers that you wrote against `Parser<T, E = string>` and that emit raw strings via `updateError(state, 'msg')` will produce a string in the `error` field; your downstream code may need to migrate. The recommended path is to use `parseError(parser, index, msg, extras?)` so your parser slots into the same display + introspection machinery as the built-ins.

- c1a16c5: **BREAKING:** Tighten the `StateTransformerFn` boundary. The last `any` in parsil's public type surface is gone — input states now carry typed `unknown` for the result slot and a generic `E` for the error slot.

  ```ts
  // Before
  type StateTransformerFn<T, E = ParseError> = (
    state: ParserState<any, any>
  ) => ParserState<T, E>

  // After
  type StateTransformerFn<T, E = ParseError> = (
    state: ParserState<unknown, E>
  ) => ParserState<T, E>
  ```

  Why this is breaking: any consumer that passed a parser into a context expecting `ParserState<any, any>` (notably TS code that relied on `any`'s structural-everything assignability) will see a type error. In practice this is rare — the only consumers that hit it are those writing their own state transformers by hand, which is itself unusual.

  **New helper:** `forward<E>(state: ParserState<unknown, E>): ParserState<never, E>` centralizes the cast every parser does in its early-exit branch:

  ```ts
  new Parser((state) => {
    if (state.isError) return forward(state) // was: return state
    // ... rest of the parser
  })
  ```

  `never` for the result slot lets the forward branch unify with any successful return type without needing a parser-specific annotation.

  **Other strictness improvements landed in the same pass:**
  - `updateError` now returns `ParserState<never, E2>` (not `ParserState<T, E2>`) — failure narrows the result slot to `never`, mirroring the model that a failed parser cannot have produced a value.
  - Curried separation combinators (`sepBy`, `sepEndBy`, `endBy`) defer their `V` generic to the second curried call so call-site inference flows cleanly without explicit annotation: `sepBy(comma)(letters)` now yields `Parser<string[], ParseError>` instead of `Parser<unknown[], ParseError>`.
  - `position`'s `index` parser is typed `Parser<number, ParseError>` (not `Parser<number, never>`) so it composes via `then` / `chain` with the rest of the library.
  - `sequenceOf` and `choice` carry `E` generically through their array constraints — `Parser<unknown, E>[]` instead of `Parser<unknown, unknown>[]`.
  - Tests are now part of the typecheck pipeline (`tsconfig.tests.json` + `bun run typecheck`), so type-level regressions in tests fail CI instead of silently slipping through.
  - `tests/parser/types.spec.ts` carries an `IsAny<T>` compile-time assertion that breaks if `any` reappears at the `StateTransformerFn` boundary.

  Public exports added: `forward`, `StateTransformerFn` (the type was internal before).

### Minor Changes

- b472ac7: Add byte-level binary parsers under `parsers/binary/`. Removes the boilerplate of composing endianness by hand on top of `uint(n)` / `int(n)` (the bit-level primitives in `parsers/bit/`).

  **Byte primitives**:
  - `anyByte` — single unsigned byte
  - `bytes(n)` — exactly `n` raw bytes as a fresh `Uint8Array`

  **Endianness-aware fixed-width**:
  - `uint16BE` / `uint16LE` / `uint32BE` / `uint32LE`
  - `int16BE` / `int16LE` / `int32BE` / `int32LE` (two-complement)
  - `floatBE` / `floatLE` (32-bit IEEE 754)
  - `doubleBE` / `doubleLE` (64-bit IEEE 754)

  All read directly from the underlying `DataView` via the native `getUint16(offset, littleEndian)` / `getFloat64(...)` family — no bit-level reassembly. EOI surfaces a structured `ParseError` with `parser: '<name>'`.

  ```ts
  const buf = new Uint8Array([0x12, 0x34])
  uint16BE.run(new DataView(buf.buffer)) // 0x1234
  uint16LE.run(new DataView(buf.buffer)) // 0x3412
  ```

- d695e3b: Add char-level primitives that GTX (and any DSL grammar) needs: `satisfy`, `oneOf`, `noneOf`, plus the canned char classes `alphaNum`, `hexDigit`, `octDigit`, `upper`, `lower`.

  ```ts
  import { satisfy, oneOf, noneOf, alphaNum, hexDigit } from 'parsil'

  // Foundation: arbitrary predicate-based char match.
  satisfy((c) => c === c.toUpperCase(), 'uppercase letter').run('Hello')
  // result: 'H'

  // Set membership.
  const op = oneOf('+-*/') // '+' | '-' | '*' | '/'
  const notDelim = noneOf(',;\n')

  // Standard classes.
  alphaNum.run('5x') // result: '5'
  hexDigit.run('Ax') // result: 'A'
  ```

  `satisfy` is the foundation; the others compose on top of it. All emit structured `ParseError` with descriptive `expected` strings (`'one of \"+-*/\"'`, `'hex digit'`, etc.) so consumers can branch or display without regex.

- 000f94f: Refactor `everythingUntil` and `everyCharUntil` onto a shared internal driver, lock down their byte-vs-char semantics with an explicit test matrix, and unify them under a single `mode`-based entry point.

  **Internal driver**

  The two parsers were previously composed (`everyCharUntil` mapped on top of `everythingUntil`), conflating byte-level collection with char-level intent. Both now share a `collectUntil(name, step, sentinel)` driver and contribute their own per-iteration step:
  - byte step — yields `number[]`, exposing raw bytes (including UTF-8 continuation bytes) regardless of input shape.
  - char step — advances by full UTF-8 codepoint width, yields a `string` of complete characters.

  **Public API: `mode` option**

  `everythingUntil` now accepts an optional second argument:

  ```ts
  everythingUntil<T>(parser: Parser<T>, mode?: 'bytes'): Parser<number[]>
  everythingUntil<T>(parser: Parser<T>, mode: 'chars'): Parser<string>
  ```

  - `'bytes'` (default) — original semantics; returns raw byte values.
  - `'chars'` — UTF-8 aware; returns the consumed prefix as a string.

  `everyCharUntil(p)` is preserved as a thin alias for `everythingUntil(p, 'chars')` and is now marked `@deprecated`. It may be removed in a future major.

  **Behavior table now backed by tests**

  | Input shape                           | `mode: 'bytes'` (default)               | `mode: 'chars'`                           |
  | ------------------------------------- | --------------------------------------- | ----------------------------------------- |
  | `string` (ASCII)                      | `number[]` of byte values               | `string`                                  |
  | `string` (multi-byte UTF-8)           | `number[]` including continuation bytes | `string` of complete chars                |
  | `ArrayBuffer / TypedArray / DataView` | `number[]` of byte values               | UTF-8 decoded `string` (lossy if invalid) |

  The 4 existing `tests/parsers/everything-until/` tests pass unchanged.

- 2148682: Add language ergonomics helpers under `parsers/lang/`. Centralizes common building blocks that every DSL grammar (Gero asm, GTX, future hand-rolls) ends up writing.

  **Literals**:
  - `identifier` — `[A-Za-z_][A-Za-z0-9_]*`
  - `stringLit(quote?)` — quoted string with conventional backslash escapes (default quote: `"`; pass `'` for single-quoted)
  - `intLit` — optional sign + digits, yields `number`
  - `floatLit` — optional sign + digits + optional fraction + optional exponent (at least one of fraction/exponent must be present)
  - `signed(p)` — wrap a number parser to optionally accept a leading `+`/`-` sign

  **Error-shaping**:
  - `label(name, p)` — **replaces** the inner error with `Expected <name>`. Drops noise.
  - `expect(p, msg)` — replaces `error.message` while keeping `parser` identity. Lighter touch than `label`.

  **Composition**:
  - `tag(value)(p)` — replace the result with a constant
  - `apply(p1, p2, ..., fn)` — run 2 to 5 parsers in sequence and combine via `fn(...)`. Shorthand for `sequenceOf([...]).map(...)`.

  ```ts
  const assign = apply(
    identifier,
    tok(char('=')),
    intLit,
    (name, _, value) => ({
      name,
      value,
    })
  )
  assign.run('age = 42') // { name: 'age', value: 42 }
  ```

  `label` is the wrap-style complement of `inContext` (from #24): `inContext` keeps the inner error and adds scope; `label` drops the inner and emits a single `Expected <name>`.

- 4d651db: Add lexeme helpers for free-form language grammars: `tok`, `lexeme`, and `keyword`.
  - `tok(p)` runs `p` and then consumes any trailing whitespace. Use it to wrap every "lexed" token in a grammar so whitespace handling is consistent and not duplicated at every `sequenceOf` site. `lexeme` is provided as a Megaparsec-style alias.
  - `keyword(word, opts?)` matches an exact string but fails if the byte right after the match is a word character (letter, digit, underscore). Prevents partial-prefix matches like `keyword('let').run('letter')` from accidentally consuming part of an identifier. Pass `{ caseSensitive: false }` to match case-insensitively against ASCII.

  ```ts
  const lparen = tok(char('('))
  const word = tok(letters)
  sequenceOf([word, lparen, word]).run('foo  ( bar') // ['foo', '(', 'bar']

  keyword('let').run('let x') // 'let'
  keyword('let').run('letter') // fails (word-boundary check)
  keyword('Let', { caseSensitive: false }).run('let x') // 'let'
  ```

- bf74e9e: Add `chainl1` and `chainr1` combinators for operator-precedence parsing.

  `chainl1(operand, op)` parses one or more operands separated by `op` and folds left-to-right — use for left-associative binary operators (subtraction, division, function application). `chainr1` is the right-fold variant for right-associative operators (exponentiation, cons).

  `op` is a parser yielding the binary function combining two operand results (`Parser<(left: T, right: T) => T>`). A trailing operator without a following operand is treated as a parse error, not a soft cut.

  ```ts
  const num = digits.map(Number)
  const sub = char('-').map(() => (a, b) => a - b)
  chainl1(num, sub).run('1-2-3') // (1 - 2) - 3 = -4

  const pow = char('^').map(() => (a, b) => a ** b)
  chainr1(num, pow).run('2^3^2') // 2 ^ (3 ^ 2) = 512
  ```

- 2f97df2: Add `recoverAt(p, sync)` for compiler-style multi-error parsing.

  Try `p`. If it succeeds, yield `{ ok: true, value }`. If it fails, skip input character-by-character until a non-consuming match of `sync` would succeed (or end-of-input is reached), then yield `{ ok: false, error, index }`. The envelope **always succeeds** at the outer level — surrounding parsers keep going.

  ```ts
  import { char, recoverAt, sepBy, str } from 'parsil'

  const stmt = recoverAt(parseStatement, char(';'))
  const program = sepBy(char(';'))(stmt)

  const result = program.run('a; INVALID; b; c')
  // result.result is an array of RecoveryResult<T>:
  //   [{ ok: true, value: ... }, { ok: false, error, index }, ..., ...]
  ```

  Pairs naturally with the structured `ParseError` shape from #24: collected failures carry full `parser` / `expected` / `actual` / `context` info. Use `formatParseError` to render each into a string for diagnostics, or branch on `error.parser` for tooling.

  Edge cases handled: failure at end-of-input doesn't infinite-loop; a sync match at the failure position consumes nothing; sync never found before EOI cleanly walks to EOI.

- 21fc7c8: Add separation and repetition variants under `parsers/sep-by/` and `parsers/many/`. Closes the standard Parsec-style coverage that `sepBy`/`sepByOne` left open.

  **Separation**:
  - `sepEndBy(sep)(value)` — zero or more values separated by `sep`, with an optional trailing `sep`. Matches JSON-with-trailing-comma, TOML lists, etc.
  - `sepEndByOne(sep)(value)` — one-or-more variant of `sepEndBy`. Fails on empty input.
  - `endBy(sep)(value)` — zero or more values, each terminated by `sep` (separator-as-terminator, e.g. C statement lists with mandatory `;`).
  - `endByOne(sep)(value)` — one-or-more variant of `endBy`.

  **Bounded repetition**:
  - `atLeast(n)(p)` — succeeds with `>= n` matches; fails below.
  - `atMost(n)(p)` — succeeds with `<= n` matches; always succeeds (stops consuming after `n`).
  - `repeatBetween(min, max)(p)` — succeeds with a count in `[min, max]`; fails below `min`.

  **Aliases**:
  - `many1` re-exported as an alias for `manyOne` for Parsec compatibility.

  ```ts
  // Trailing comma allowed
  sepEndBy(char(','))(digits).run('1,2,3,') // ['1', '2', '3']

  // Each statement must end with a semicolon
  endBy(char(';'))(stmt).run('a;b;c;') // [a, b, c]

  // At least 2 digits, at most 4
  repeatBetween(2, 4)(digit).run('12345') // ['1','2','3','4']
  ```

- fb24aa9: Add three quality-of-life utility helpers under `parsers/util/`. Closes the gap of small things consumers were hand-rolling on top of parsil.

  **`linecol(input, index)`** — pure function

  Convert a byte offset into a 1-based `{ line, col }` pair. Recognises `\n`, `\r\n`, and `\r` line endings (CRLF counted as one break). Useful for surfacing parsil errors in editor-style diagnostics.

  ```ts
  linecol('foo\nbar\nbaz', 9) // { line: 3, col: 2 }
  ```

  **`tap(fn)(p)`** — observe successes

  Curried side-effect helper: run `fn(value, state)` on every successful parse and forward the result unchanged. `fn` is **never** invoked on failure, so it's safe to use for tracing or metrics without affecting parser semantics.

  ```ts
  const traced = tap<number>((n, { index }) => console.log(n, '@', index))(
    intLit
  )
  ```

  **`debugLog(label, p)`** — env-gated trace logging

  Wrap a parser with enter/exit logging. Silent by default; activated via the `PARSIL_DEBUG` env var:
  - `PARSIL_DEBUG='*'` — log all wrapped parsers
  - `PARSIL_DEBUG='ident'` — log only `ident`
  - `PARSIL_DEBUG='expr*'` — log labels starting with `expr`
  - `PARSIL_DEBUG='a,b'` — comma-separated list

  Output is a one-line-per-event format with `enter`, `ok`, `fail` markers — left in code without flooding production logs.

### Patch Changes

- e62f1f1: Fix `bit` reading out-of-bounds bytes when the input runs out mid-bit-stream. The end-of-input branch built an error state but did not return it, so the parser fell through to `dataView.getUint8(byteOffset)` with `byteOffset >= byteLength`. Reading past the end now correctly returns a `ParseError @ index N -> bit: Unexpected end of input`.
- 7731bec: Fix `char` reporting `@ index 0` literally in error messages instead of the actual position. Sequences like `sequenceOf([str('hello '), char('!')])` now correctly report the index where the mismatch occurred (e.g. `index 6` for input `'hello world'`) rather than `index 0`.
- 1f22bca: `coroutine` no longer leaks raw `Error` instances out of `parser.run(...)`. Two changes:
  - A non-Parser argument to `run(...)` inside a coroutine body (e.g. `run(42)` or `run(undefined)`) now produces a parse failure with a `ParseError @ index N -> coroutine: 'run' must be called with a Parser, got ...` message, instead of throwing a raw `Error` past the result envelope.
  - Any other thrown value in the coroutine body that isn't a `ParserState` (typically a programming bug — a thrown `Error`, a string, etc.) is converted into a parse failure with `ParseError @ index N -> coroutine: <message>`. Parser-failure envelopes thrown by sub-parsers are still re-surfaced as failures unchanged.

  Net result: `parser.run(...)` always returns a `ResultType<T, E>` for `coroutine`-built parsers, matching the rest of parsil's contract.

  JSDoc also updated: the previous example used `yield` as a parameter name (a JS reserved word — wouldn't compile), and didn't show `run` as the convention. Renamed to `run` with a working example.

- c0b0402: Fix `everythingUntil` (and by extension `everyCharUntil`) silently dropping bytes with value `0x00` from binary inputs. The implementation gated the `results.push(val)` on `if (val)`, which is falsy for zero. Binary formats commonly contain null bytes (length-prefixed strings, padding, separators) and would lose them. The guard is removed; every byte is now collected verbatim.
- a5076f8: Tighten `optionalWhitespace` return type from `Parser<string | null>` to `Parser<string>`. The implementation always mapped `null` to `''`, so the `null` branch of the type was unreachable. Consumers that previously narrowed against `null` can drop that check; the value is always a string.
- 9342fbf: Bump Node engine floor to `>=22` and Bun to `>=1.3`. Add test coverage reporting.

  **Engine bump**

  Node 20 enters maintenance later this year; 22 has been the LTS since October 2024. Bumping in v3.0.0 means the breaking-engine cost lands in the same release as the API breaks (#29) — no separate dot-release just for engines. Updated `package.json` `engines`, `release.yml` Node setup step (used by `npm publish`), and the README **Engines** line so the published constraints, the publish workflow, and the docs all agree.

  **Coverage**
  - `bun run test:coverage` produces a text summary in the console and an `lcov.info` file under `coverage/` (suitable for Codecov, IDE coverage gutters, etc.).
  - A `coverage` job in `ci.yml` runs the script on every push and uploads the lcov as a 30-day artifact.
  - `coverage/` added to `.gitignore`.
  - No threshold gate yet — we establish a baseline and gate in a follow-up once the v3.0.0 cycle has settled.

- 907b237: Internal type tightening: replace structural `any` with `unknown`/`never` at API boundaries.
  - `Parser<T, E = any>` and `StateTransformerFn<T, E = any>` now default to `E = string`, which matches parsil's de facto error convention. Consumers that use a structured error type override it explicitly.
  - `fail<E>(error)` now returns `Parser<never, E>` (was `Parser<any, E>`) — accurately reflects that `fail` never produces a result.
  - `choice` and `sequenceOf` constraints tightened: parser arrays accept `Parser<unknown, unknown>` instead of `Parser<any, any>`. Variance-equivalent in this position.
  - `sequenceOf`'s internal accumulator typed as `unknown[]` instead of `any[]`. The single remaining cast (`results as ResultTuple`) is required because TypeScript cannot derive the tuple-mapped result type from a heterogeneous loop; documented inline.
  - Removed two `as any` casts (`position.ts`, `parser.ts:withSpan`) by narrowing more precisely where possible.

  The `state: ParserState<any, any>` parameter on `StateTransformerFn` is **kept** intentionally — tightening it to `unknown` cascades into ~25 cast sites in user-facing parsers. The boundary `any` is documented inline.

  No runtime behavior changes. Type-level changes are subtle and most consumers won't notice; if your code relied on the old `Parser<T, any>` default, set `E` explicitly.

- 0553af9: Pre-3.0.0 audit polish.

  **Fixes**
  - **Published `.d.ts` files now resolve their imports.** Previous releases shipped declaration files containing unresolved `@parsil/*` path aliases — consumers' typecheckers failed to resolve them and surfaced phantom errors. The build now post-processes `tsc` output via `tsc-alias` so every import in `dist/**/*.d.ts` is a relative path. Pre-existing bug from 2.x; fixed before tagging 3.0.
  - **Infinite-loop guard on `many` / `sepBy` / `sepEndBy` / `endBy` / `chainl1` / `chainr1`.** When the inner parser(s) succeeded without consuming input (e.g. `many(possibly(p))`, `many(succeed(x))`, `sepBy(succeed(','))(possibly(p))`), these combinators looped forever. Each one now detects no-progress per iteration and emits a clean `ParseError` with a diagnostic message (`'<combinator>: ... succeeded without consuming input — infinite loop guard'`) instead of hanging. `manyOne`, `sepByOne`, `sepEndByOne`, `endByOne`, and `atLeast` inherit the guard transparently because they delegate to the base combinators.
  - **`bit/uint(n)` and `bit/int(n)` error message off-by-one.** The check rejected `n > 32` but the message said `'must be less than 32'`, suggesting `n = 32` was forbidden when it actually wasn't. Message now says `'less than or equal to 32'`. Spec coverage extended to pin the boundary contract.
  - **`bit/rawString` now throws on non-ASCII input at construction time.** `rawString` reads one byte per char via `uint(8)`; `c.charCodeAt(0)` for U+0080+ returns the UTF-16 code unit rather than the actual UTF-8 byte sequence, silently producing wrong matches. The construction-time validator surfaces this loudly instead of failing at runtime with confusing "byte mismatch" errors.
  - **`recursive<T, E>`'s default error type is now `ParseError`** (was the legacy `string`). All other parsers were defaulted to `ParseError` in #24's error-model overhaul; this brings `recursive` in line.
  - **`createParserState` now respects `byteOffset` and `byteLength` on TypedArray inputs.** Previously, passing a sliced/offset typed array (e.g. `new Uint8Array(buffer, 8, 4)`, very common from Node `Buffer`, `fs.readSync`, network frame slicing) made the parser see the entire underlying buffer instead of just the slice. The fix passes both `byteOffset` and `byteLength` to the new `DataView`. As a defensive companion, the `STRING` path also pins the view explicitly to `byteLength` since some `TextEncoder` implementations are allowed to over-allocate the underlying buffer.
  - **`Parser.lookahead()` method now restores the cursor on failure too.** The standalone `lookAhead` parser already did this; the method form leaked the inner parser's advance through the failure branch, which broke the "lookahead never advances" contract. Both branches now honor it.
  - **`recoverAt` no longer constructs its success state via a hand-rolled literal with a `null as ParseError` placeholder.** Internal cleanup, no behavior change — the recovery envelope produced is identical.

  **Internal**
  - `.map` and `.chain` early-exit branches now use the `forward()` helper added in #29, matching the convention every parser primitive follows.
  - Binary spec files split 1-per-primitive (was grouped BE/LE pairs), matching the codebase convention of one spec file per parser export.
  - Specs added for `expect` and `succeed`, the two parsers that were shipping without coverage. Regression specs added for the no-progress and ASCII guards above.
  - README count and bundle-size claims updated to reality (100+ parsers, ~24 KB minified). `StateTransformerFn` documented in the `Building custom parsers` section.

## 2.2.0

### Minor Changes

- Add source position utilities and span helpers:
  - New `index` parser returns current byte offset without consuming input.
  - New `Parser.withSpan()` returns `{ value, start, end }` for any parser.
  - New `Parser.spanMap()` maps `(value, { start, end })` to custom node shapes.

  These features make it straightforward to attach precise ranges to AST nodes for LSP/editors.

## 2.1.1

### Patch Changes

- Allows custom error type for coroutine

## 2.1.0

### Minor Changes

- Add .skip / .then / .between / .lookahead methods to the parser
