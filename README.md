# Parsil

[![Build Status](https://github.com/salty-max/parsil/workflows/CI/badge.svg)](https://github.com/salty-max/parsil/actions)
[![npm Version](https://img.shields.io/npm/v/parsil.svg?style=flat-square)](https://www.npmjs.com/package/parsil)
[![License](https://img.shields.io/npm/l/parsil.svg?style=flat-square)](https://github.com/salty-max/parsil/blob/main/LICENSE)

A lightweight, dependency-free parser-combinator library for JavaScript and TypeScript. Compose tiny parsers into language and protocol parsers that run in **Node**, **Bun**, and modern **browsers**.

```ts
import * as P from 'parsil'

const greeting = P.sequenceOf([P.str('hello'), P.char(' '), P.letters])
greeting.run('hello world')
// { isError: false, result: ['hello', ' ', 'world'], index: 11 }
```

---

## Key features

- **40+ parsers and combinators** for character, string, regex, position, repetition, separation, recursion, and binary input.
- **Great TypeScript inference**: `sequenceOf([str('x'), digits])` infers `Parser<[string, string]>`.
- **UTF-8 aware** character parsers; `withSpan` / `spanMap` carry start/end byte offsets through the parse for AST tooling.
- **String _and_ binary inputs**: `string`, `ArrayBuffer`, `TypedArray`, `DataView` all work; bit- and byte-level primitives ship in the box.
- **Two-layer error model**: primitive parsers emit a structured `ParseError` (with `parser`/`index`/`message`/`expected`/`actual`/`context` fields); consumers reshape them with `errorMap` at meaningful boundaries.
- **Zero runtime dependencies.** ESM-only, ~12 KB minified.

### What parsil **isn't**

- A grammar generator (PEG.js, nearley) — there is no grammar file format. You write parsers in TypeScript.
- A lexer/tokenizer toolkit by default — characters are the granularity. (Lexeme/keyword helpers ship as combinators.)
- An AST utility library — call sites build their own AST shape; parsil supplies positions and combinators, not opinions.

---

## Install

```bash
# npm
npm i parsil

# bun
bun add parsil
```

> **ESM-only** since v2.0.0. If you use CommonJS, use a dynamic import:
>
> ```js
> const P = await import('parsil')
> ```

**Engines**: Node ≥ 20, Bun ≥ 1.1.

---

## Mental model

A parser in parsil is a function from one `ParserState` to the next. State carries a cursor (`index`), the input (`dataView`), and either a successful result or an error.

```ts
// Conceptual shape — you don't write these by hand.
type ParserState<T, E> = {
  dataView: DataView // input
  index: number // cursor (byte offset)
  isError: boolean
  result: T // valid when isError === false
  error: E // valid when isError === true
}
```

When you call `parser.run(input)`, parsil wraps the input in a state, runs the parser, and returns a **result envelope**:

```ts
type ResultType<T, E> = Ok<T> | Err<E>

type Ok<T> = { isError: false; result: T; index: number }
type Err<E> = { isError: true; error: E; index: number }
```

You **never throw** for parse failures. Failure is a value. This is what makes `lookahead`, backtracking, and combinators like `choice` work cleanly.

### Composition

Combinators take parsers and return new parsers:

```ts
import * as P from 'parsil'

const word = P.letters // Parser<string>
const intLit = P.digits.map(Number) // Parser<number>
const pair = P.sequenceOf([word, P.char('='), intLit]) // Parser<[string, string, number]>
```

Most parsers also have **methods** for fluent composition:

```ts
const intLit = P.digits
  .map(Number)
  .errorMap(({ index }) => `Expected an integer at ${index}`)
```

### The two-layer error model

Primitive parsers emit a structured `ParseError` object (`{ parser, index, message, expected?, actual?, context? }`). Branch on `error.parser` for machine handling, run through `formatParseError(error)` for the conventional display string, or reshape into your own type at boundaries with `errorMap`:

```ts
const number = P.digits.map(Number).errorMap(({ error, index }) => ({
  code: 'EXPECTED_NUMBER',
  message: 'Expected a number',
  parser: error.parser, // 'digits'
  at: index,
}))
```

The result is now `Parser<number, { code: string; message: string; parser: string; at: number }>` — the `E` type parameter tracks the error shape through the rest of the pipeline.

---

## Quick start

### A tiny arithmetic parser

```ts
import * as P from 'parsil'

const num = P.digits.map(Number)
const add = P.char('+').map(() => (a: number, b: number) => a + b)
const sub = P.char('-').map(() => (a: number, b: number) => a - b)
const mul = P.char('*').map(() => (a: number, b: number) => a * b)

// term = num (* num)*       — '*' binds tighter
const term = P.chainl1(num, mul)

// expr = term ((+|-) term)* — left-associative
const expr = P.chainl1(term, P.choice([add, sub]))

expr.run('2+3*4-1')
// { isError: false, result: 13, index: 7 }
// (2 + (3 * 4) - 1)
```

### A binary header (excerpt)

```ts
import * as P from 'parsil'

const tag = (type: string) => (value: unknown) => ({ type, value })

const ipv4Header = P.sequenceOf([
  P.uint(4).map(tag('Version')),
  P.uint(4).map(tag('IHL')),
  P.uint(6).map(tag('DSCP')),
  P.uint(2).map(tag('ECN')),
  P.uint(16).map(tag('Total Length')),
])

ipv4Header.run(new DataView(buffer)) // returns the tagged tuple
```

---

## API

### Methods on `Parser<T, E>`

```ts
class Parser<T, E = ParseError> {
  run(input: InputType): ResultType<T, E>
  fork<F>(input, onError, onSuccess): F
  map<U>(fn: (value: T) => U): Parser<U, E>
  chain<U>(fn: (value: T) => Parser<U, E>): Parser<U, E>
  errorMap<E2>(fn: (info: { error: E; index: number }) => E2): Parser<T, E2>
  skip<U>(other: Parser<U, E>): Parser<T, E>
  then<U>(other: Parser<U, E>): Parser<U, E>
  between<L, R>(left: Parser<L, E>, right: Parser<R, E>): Parser<T, E>
  lookahead(): Parser<T, E>
  withSpan(): Parser<{ value: T; start: number; end: number }, E>
  spanMap<U>(
    build: (value: T, loc: { start: number; end: number }) => U
  ): Parser<U, E>
}
```

| Method      | Description                                                                            |
| ----------- | -------------------------------------------------------------------------------------- |
| `run`       | Execute the parser against an input. Returns `Ok<T>` or `Err<E>`.                      |
| `fork`      | Same as `run` but takes success/error callbacks.                                       |
| `map`       | Transform the success value.                                                           |
| `chain`     | Build a follow-up parser from the success value (monadic bind).                        |
| `errorMap`  | Transform the error value (typically wrap a primitive string into a structured error). |
| `skip`      | Run `other` after `this`, keep `this`'s result, discard `other`'s.                     |
| `then`      | Run `other` after `this`, keep `other`'s result, discard `this`'s.                     |
| `between`   | Shorthand for `left.then(this).skip(right)`.                                           |
| `lookahead` | Run `this` without advancing the cursor.                                               |
| `withSpan`  | Wrap the result with `{ value, start, end }` byte offsets.                             |
| `spanMap`   | Like `withSpan`, but build a custom node from `(value, loc)`.                          |

### Type guards

```ts
isOk<T, E>(result: ResultType<T, E>): result is Ok<T>
isError<T, E>(result: ResultType<T, E>): result is Err<E>
```

### Char primitives

| Parser             | Type                                  | Description                                                                            |
| ------------------ | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `char(c)`          | `(c: string) => Parser<string>`       | Match a single UTF-8 char exactly.                                                     |
| `anyChar`          | `Parser<string>`                      | Match any single UTF-8 char. Fails at end of input.                                    |
| `anyCharExcept(p)` | `<T>(p: Parser<T>) => Parser<string>` | Match any char that does **not** start a match for `p`.                                |
| `str(s)`           | `(s: string) => Parser<string>`       | Match an exact string.                                                                 |
| `regex(re)`        | `(re: RegExp) => Parser<string>`      | Match against a regex anchored at the current position. The regex must start with `^`. |

```ts
char('@').run('@home') // result: '@', index: 1
str('hello').run('hello world') // result: 'hello', index: 5
regex(/^[a-z]+/).run('abc123') // result: 'abc', index: 3
```

### Char classes

| Parser               | Type             | Description                                                                    |
| -------------------- | ---------------- | ------------------------------------------------------------------------------ |
| `digit`              | `Parser<string>` | Single `[0-9]`.                                                                |
| `digits`             | `Parser<string>` | One or more `[0-9]`.                                                           |
| `letter`             | `Parser<string>` | Single `[A-Za-z]`.                                                             |
| `letters`            | `Parser<string>` | One or more `[A-Za-z]`.                                                        |
| `whitespace`         | `Parser<string>` | One or more whitespace chars (`\s+`).                                          |
| `optionalWhitespace` | `Parser<string>` | Zero or more whitespace chars; always succeeds with a (possibly empty) string. |

### Position parsers

| Parser         | Type                    | Description                                        |
| -------------- | ----------------------- | -------------------------------------------------- |
| `index`        | `Parser<number, never>` | Current byte offset. Doesn't consume.              |
| `peek`         | `Parser<number>`        | Next byte's value without consuming. Fails at EOI. |
| `startOfInput` | `Parser<null, string>`  | Asserts the cursor is at byte 0.                   |
| `endOfInput`   | `Parser<null, string>`  | Asserts the cursor is past the last byte.          |

### Lexeme helpers

For free-form languages where tokens are separated by whitespace, and where keywords must not match partial prefixes of identifiers.

| Parser       | Type                                                                | Description                                                                                 |
| ------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `tok(p)`     | `<T, E>(p: Parser<T, E>) => Parser<T, E>`                           | Run `p`, then consume any trailing whitespace. Yields `p`'s result.                         |
| `lexeme(p)`  | `<T, E>(p: Parser<T, E>) => Parser<T, E>`                           | Alias of `tok` (Megaparsec naming).                                                         |
| `keyword(s)` | `(s: string, opts?: { caseSensitive?: boolean }) => Parser<string>` | Match an exact string but fail if the next char is a word char (letter, digit, underscore). |

```ts
import * as P from 'parsil'

const lparen = P.tok(P.char('('))
const word = P.tok(P.letters)
P.sequenceOf([word, lparen, word]).run('foo  ( bar')
// result: ['foo', '(', 'bar']

P.keyword('let').run('let x') // result: 'let'
P.keyword('let').run('letter') // fails (boundary check)
P.keyword('Let', { caseSensitive: false }).run('let x') // result: 'let'
```

### Combinators

| Combinator                      | Description                                                              |
| ------------------------------- | ------------------------------------------------------------------------ |
| `sequenceOf(parsers)`           | Run parsers in order; succeed with a tuple of results.                   |
| `choice(parsers)`               | Try each in order; succeed with the first match.                         |
| `many(p)`                       | Zero or more matches of `p`. Always succeeds (possibly with `[]`).       |
| `manyOne(p)`                    | One or more matches of `p`. Fails if zero matches.                       |
| `exactly(n)(p)`                 | Exactly `n` matches of `p`. Curried.                                     |
| `between(left, right)(content)` | Parse `content` enclosed by `left` and `right`. Curried.                 |
| `sepBy(sep)(value)`             | Zero or more `value` separated by `sep`. Curried.                        |
| `sepByOne(sep)(value)`          | One or more `value` separated by `sep`. Curried.                         |
| `chainl1(operand, op)`          | One or more operands separated by `op`, **left-associative** fold.       |
| `chainr1(operand, op)`          | One or more operands separated by `op`, **right-associative** fold.      |
| `possibly(p)`                   | Optional: succeeds with `null` if `p` fails.                             |
| `lookAhead(p)`                  | Run `p` without advancing the cursor.                                    |
| `recursive(thunk)`              | Defer parser construction; lets you define mutually recursive parsers.   |
| `coroutine(fn)`                 | Write a parser as a procedural function that `run`s sub-parsers in turn. |
| `everythingUntil(p)`            | Collect raw bytes until `p` would succeed; returns `number[]`.           |
| `everyCharUntil(p)`             | Collect chars until `p` would succeed; returns the decoded string.       |
| `inContext(label, p)`           | Wrap `p` so its failure carries `label` on `error.context`.              |

```ts
import * as P from 'parsil'

P.sequenceOf([P.str('hello'), P.char(' '), P.letters]).run('hello world')
// result: ['hello', ' ', 'world']

P.choice([P.str('yes'), P.str('no')]).run('yes')
// result: 'yes'

P.many(P.digit).run('123abc')
// result: ['1', '2', '3']

P.sepBy(P.char(','))(P.digits).run('1,2,3')
// result: ['1', '2', '3']

P.between(P.char('('), P.char(')'))(P.letters).run('(abc)')
// result: 'abc'
```

### Constants

| Parser           | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `succeed(value)` | Always succeeds with `value`, doesn't consume input. |
| `fail(error)`    | Always fails with `error`, doesn't consume input.    |

### Binary helpers

| Parser         | Type                              | Description                                           |
| -------------- | --------------------------------- | ----------------------------------------------------- |
| `bit`          | `Parser<number>`                  | Read a single bit (0 or 1).                           |
| `zero`         | `Parser<number>`                  | Assert the next bit is 0.                             |
| `one`          | `Parser<number>`                  | Assert the next bit is 1.                             |
| `uint(n)`      | `(n: number) => Parser<number>`   | Read `n` bits as an unsigned integer. `1 ≤ n ≤ 32`.   |
| `int(n)`       | `(n: number) => Parser<number>`   | Read `n` bits as a signed integer (two's complement). |
| `rawString(s)` | `(s: string) => Parser<number[]>` | Match the exact ASCII byte sequence of `s`.           |

### Building custom parsers

If you need to drop below the combinator layer (e.g., to optimize a hot path or implement a primitive), parsil exposes the state-update helpers:

```ts
updateState<T, E, T2>(state: ParserState<T, E>, index: number, result: T2): ParserState<T2, E>
updateResult<T, E, T2>(state: ParserState<T, E>, result: T2): ParserState<T2, E>
updateError<T, E, E2>(state: ParserState<T, E>, error: E2): ParserState<T, E2>
```

You construct a parser from a state-transformer function:

```ts
new Parser((state) => {
  if (state.isError) return state
  // ... your transformation
  return updateState(state, newIndex, newResult)
})
```

### UTF-8 utilities

`getString`, `getNextCharWidth`, `getUtf8Char`, `getCharacterLength`, `encoder`, `decoder` are exported from `parsil` for parsers that need byte-level UTF-8 awareness. Most consumers don't need these; they're documented for completeness.

### Input types

`Parser.run` accepts `string`, `ArrayBuffer`, `DataView`, or any numeric `TypedArray`. The `isTypedArray(x)` predicate and the `InputType` / `InputTypes` types are exported alongside for advanced cases (e.g. writing a parser-runner wrapper that needs to dispatch on input shape).

---

## Recipes

### Operator precedence

`chainl1` / `chainr1` express precedence cleanly. Layer one chain per precedence level:

```ts
import * as P from 'parsil'

const num = P.digits.map(Number)
const op = (ch: string, fn: (a: number, b: number) => number) =>
  P.char(ch).map(() => fn)

const pow = op('^', (a, b) => a ** b)
const mul = op('*', (a, b) => a * b)
const div = op('/', (a, b) => a / b)
const add = op('+', (a, b) => a + b)
const sub = op('-', (a, b) => a - b)

// Right-associative: 2^3^2 = 2 ^ (3 ^ 2) = 512
const factor = P.chainr1(num, pow)
// Left-associative
const term = P.chainl1(factor, P.choice([mul, div]))
const expr = P.chainl1(term, P.choice([add, sub]))

expr.run('2+3*2^3') // 2 + (3 * (2 ^ 3)) = 26
```

### AST nodes with byte spans

`spanMap` attaches start/end byte offsets to whatever shape you want:

```ts
import * as P from 'parsil'

type IdentNode = {
  kind: 'Ident'
  name: string
  loc: { start: number; end: number }
}

const identifier: P.Parser<IdentNode> = P.regex(
  /^[A-Za-z_][A-Za-z0-9_]*/
).spanMap((name, loc) => ({ kind: 'Ident', name, loc }))

identifier.run('foo123!')
// {
//   isError: false,
//   result: { kind: 'Ident', name: 'foo123', loc: { start: 0, end: 6 } },
//   index: 6,
// }
```

Editors can convert byte offsets to `(line, col)` after the parse runs.

### Whitespace at lexeme boundary

Use `tok` (or its alias `lexeme`) to consume trailing whitespace after every token, so your grammar doesn't repeat the pattern:

```ts
import * as P from 'parsil'

const lparen = P.tok(P.char('('))
const rparen = P.tok(P.char(')'))
const word = P.tok(P.letters)
const comma = P.tok(P.char(','))

const callish = P.sequenceOf([word, lparen, P.sepBy(comma)(word), rparen])

callish.run('foo ( a , b , c )') // ['foo', '(', ['a', 'b', 'c'], ')']
```

For language keywords, use `keyword` instead of `str` to enforce a word boundary:

```ts
import * as P from 'parsil'

P.keyword('let').run('let x = 1') // 'let'
P.keyword('let').run('letter') // fails — would be a partial-prefix match
```

### Recursive structures

Use `recursive` to break the chicken-and-egg of a parser referencing itself:

```ts
import * as P from 'parsil'

type JsonValue = string | number | JsonValue[]

const value: P.Parser<JsonValue> = P.recursive(() =>
  P.choice([number, string, array])
)
const number = P.digits.map(Number)
const string = P.between(P.char('"'), P.char('"'))(P.regex(/^[^"]*/))
const array = P.between(P.char('['), P.char(']'))(P.sepBy(P.char(','))(value))

value.run('[1,2,["a","b"],3]')
// result: [1, 2, ['a', 'b'], 3]
```

### Imperative style with `coroutine`

When a grammar branches on intermediate results, `coroutine` reads top-to-bottom instead of nesting `chain` calls sideways:

```ts
import * as P from 'parsil'

const keyValue = P.coroutine((run) => {
  const key = run(P.letters)
  run(P.char('='))
  const value = run(P.digits.map(Number))
  return { [key]: value }
})

keyValue.run('age=42') // { age: 42 }
```

### Binary protocol

Mix bit and byte primitives:

```ts
import * as P from 'parsil'

// First nibble = type, second nibble = length, then `length` bytes payload.
const message = P.coroutine((run) => {
  const type = run(P.uint(4))
  const length = run(P.uint(4))
  const payload = run(P.exactly(length)(P.uint(8)))
  return { type, length, payload }
})

const buf = new Uint8Array([0x35, 0x10, 0x20, 0x30, 0x40, 0x50])
message.run(new DataView(buf.buffer))
// { type: 3, length: 5, payload: [0x10, 0x20, 0x30, 0x40, 0x50] }
```

---

## Error handling

Primitive parsers emit a structured `ParseError` object, not a string:

```ts
type ParseError = {
  parser: string // 'char', 'str', 'regex', 'keyword', ...
  index: number
  message: string
  expected?: string // what the parser was looking for, when known
  actual?: string // what was at the position, when known
  context?: string[] // outer-first stack from `inContext` wrappers
}
```

Branch on `error.parser` for machine-readable handling, or run the result through `formatParseError(error)` to get the conventional `ParseError [outer > inner] @ index N -> <parser>: <message>` display string:

```ts
import * as P from 'parsil'

const r = P.char('!').run('?')
if (r.isError) {
  console.log(r.error.parser) // 'char'
  console.log(r.error.expected) // '!'
  console.log(r.error.actual) // '?'
  console.log(P.formatParseError(r.error))
  // ParseError @ index 0 -> char: Expected '!', but got '?'
}
```

Use `fork` if you prefer callbacks over a result envelope:

```ts
P.str('hello').fork(
  'hello world',
  (error, _state) => console.error(P.formatParseError(error)),
  (result, _state) => console.log('matched', result)
)
```

### Two-layer mapping

Map primitive errors into your own shape at meaningful boundaries — typically once per "token" — with `errorMap`:

```ts
const number = P.digits.map(Number).errorMap(({ error, index }) => ({
  code: 'EXPECTED_NUMBER' as const,
  message: 'Expected a number',
  parser: error.parser,
  at: index,
}))
```

The `E` type parameter tracks the error shape through the rest of the pipeline (`Parser<number, { code: 'EXPECTED_NUMBER'; ... }>`). Inside a chain, errors propagate unchanged — you only need to map at the boundary where end users will see them.

### Adding context with `inContext`

Wrap a parser with a context label that gets pushed onto `error.context` if it fails. Useful for surfacing **where** in the grammar the failure happened:

```ts
const argList = P.inContext('argument list', P.sepBy(comma)(arg))
const fnCall = P.inContext(
  'function call',
  P.sequenceOf([ident, lparen, argList, rparen])
)

fnCall.run('foo(a, !, c)')
// On failure: error.context === ['function call', 'argument list']
// formatParseError adds '[function call > argument list]' to the display
```

Outer labels appear first in the array (and the formatter renders them with `>` separators).

`inContext` complements `label(name, p)` (in #20): `inContext` **wraps** (preserves the inner error and adds scope), `label` **replaces** (drops the inner and emits a single "expected `<name>`"). Use `inContext` to keep diagnostics; use `label` when the inner error is noise.

### Furthest-progress in `choice`

When all branches of a `choice` fail, the branch that consumed the most input is heuristically the one the user intended. `choice` automatically reports that branch's failure (along with the aggregated `expected` set):

```ts
P.choice([P.sequenceOf([P.str('he'), P.str('llo!')]), P.str('xy')]).run('hello')
// error.parser   = 'choice'
// error.expected = 'hello! | xy'  (each branch's expected, joined)
// error.message  = 'Expected one of: hello! | xy; furthest branch failed
//                   at index 2: Tried to match 'llo!', but got unexpected end of input'
```

### Always backtracks

parsil has no `try` / `cut` / commit primitive. Every alternative in `choice` is a full backtrack — if a branch fails after consuming input, `choice` rewinds to where that branch started before trying the next one. This keeps the model simple at the cost of some Megaparsec-style fine-grained control. If you need commit-on-progress semantics for a specific grammar, raise an issue describing the case.

### `coroutine` is the one place we throw internally

`coroutine` uses `throw`/`catch` as a control-flow primitive: a sub-parser failure throws the failure state back to the coroutine wrapper, which packages it as a normal parse failure. A genuine programming error in the coroutine body (a thrown `Error`, a misuse of `run`) is also caught and surfaced as a `ParseError`. The "never throw" rule applies to the **public** parser surface — `parser.run(...)` always returns a `ResultType<T, E>` — not to internal mechanics scoped to a single combinator.

### English-only error messages

Primitive `ParseError.message` strings are English-only. Localized messages are the consumer's responsibility — apply `errorMap` at boundary parsers (one per token, typically) to translate or replace. We don't plan to localize at the primitive level: the surface area would explode and the right level of localization is application-specific.

---

## Source positions and spans

`index`, `withSpan`, and `spanMap` make positions first-class without forcing every parser to carry them.

```ts
import * as P from 'parsil'

// Read current offset (non-consuming).
P.index.run('hello') // result: 0, index: 0

// Attach start/end offsets to any parser.
P.str('hello').withSpan().run('hello!')
// result: { value: 'hello', start: 0, end: 5 }, index: 5

// Project value + span into a custom node.
P.str('XY')
  .spanMap((value, loc) => ({ kind: 'tok', value, loc }))
  .run('XY!')
// result: { kind: 'tok', value: 'XY', loc: { start: 0, end: 2 } }, index: 2
```

Offsets are byte-based. Convert to line/col yourself when surfacing them in editors.

---

## Contributing

PRs welcome. Parsil is a tight, opinionated codebase — the conventions below are enforced by hooks, lint, and a CI gate so contributions stay consistent.

### Local quality gates

Run before pushing. The pre-commit hook also runs them automatically on staged files.

```bash
bun install
bun run lint        # ESLint with --max-warnings 0; custom rule forbids relative imports in src/
bun run typecheck
bun test
bun run knip:check  # dead code + unused deps
bun run build       # ESM bundle + .d.ts
```

### Branching

Branch from `main`. One issue → one branch → one PR.

```
feat/<short>      new combinator or public API
fix/<short>       bug fix
chore/<short>     tooling, deps, build, infra
docs/<short>      docs-only change
refactor/<short>  internal restructuring with no behavior change
```

### Commit convention

[Conventional Commits](https://www.conventionalcommits.org/) with a strict, mandatory scope. The `commit-msg` hook runs `commitlint`. Allowed scopes:

- `parser` — the `Parser` class, `ParserState`, result envelope.
- `parsers/<name>` — a specific combinator under `src/parsers/<name>/`. The list is auto-generated from the filesystem; create the directory and the scope is enabled.
- `util` — `src/util/*` (UTF-8 helpers).
- `deps` — dependency bumps.
- `tooling` — husky, commitlint, lint-staged, knip, ESLint, prettier, build scripts.
- `ci` — `.github/workflows/*` and the release pipeline.
- `docs` — JSDoc, README, in-source documentation.
- `meta` — top-level repo files (LICENSE, `.gitignore`, root configs).

See [`commitlint.config.mjs`](./commitlint.config.mjs) for the exhaustive list.

### Changesets

Every PR that introduces a user-visible change lands with a changeset file under `.changeset/`. The CI gate `changeset-check` enforces this on PR titles.

**Add a changeset** for: `feat`, `fix`, `perf`, breaking `refactor`, anything that affects the published API or runtime behavior consumers will notice.

**Skip the changeset** for: `chore`, `docs`, `test`, internal-only `refactor`, `ci`, `build`, `style`. End-users don't care about these in a CHANGELOG.

```bash
bun changeset           # interactive: pick patch/minor/major, write summary
# Edits a file at .changeset/<random-name>.md — commit it with the rest of the PR.
```

When in doubt, add one. They're cheap and easy to delete.

### Path alias in `src/`

Inside `src/`, every cross-directory import uses the `@parsil/*` alias mapped to `./src/*`. Relative imports (`./`, `../`) are forbidden by a custom ESLint rule that **autofixes** violations.

```ts
// Good
import { Parser, updateResult } from '@parsil/parser'
import { many } from '@parsil/parsers/many'

// Bad — autofix flips this to '@parsil/parser'
import { Parser } from '../../parser'
```

Tests under `tests/` import the public surface as `import { ... } from '@parsil'` (the package root alias), the same way an end-user would.

### Tests

`bun test` runs everything. Tests mirror `src/`: `src/parsers/<name>/<file>.ts` ↔ `tests/parsers/<name>/<file>.spec.ts`. Every parser spec covers at minimum:

- Happy path
- One concrete failure (wrong input or wrong type)
- Edge cases: empty input, end of input

Use `assertIsOk` / `assertIsError` from `tests/util/test-util.ts` to keep specs concise.

### Self-review before declaring done

Before requesting review on a PR, walk this short checklist:

1. **Re-read the issue's acceptance criteria line by line.** Tick each one or note explicitly why it's deferred.
2. **Run all gates** locally (`lint`, `typecheck`, `test`, `knip:check`, `build`). The pre-commit hook is good but not a substitute for an end-to-end pass.
3. **Doc propagation.** New public export → add it to the relevant section of this README and write its JSDoc. The doc check is "would a reader of the README know my export exists?".
4. **Changeset** added at the right level for `feat`/`fix`/`perf`/breaking.
5. **No leftover scaffolding**: `console.log`, commented-out code, unused imports, `// TODO` without a linked issue.
6. **Diff scope** matches what the issue says it should — drive-by refactors go in their own PR.

Green tests are necessary, **not sufficient**. Issues list explicit acceptance criteria beyond CI; skipping them is the failure mode this checklist guards against.

---

## License

MIT © [Maxime Blanc](https://github.com/salty-max)

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) — driven by changesets accumulated on `main` and consumed at release time.
