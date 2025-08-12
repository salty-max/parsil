
# Parsil

[![Build Status](https://github.com/salty-max/parsil/workflows/CI/badge.svg)](https://github.com/salty-max/parsil/actions)
[![npm Version](https://img.shields.io/npm/v/parsil.svg?style=flat-square)](https://www.npmjs.com/package/parsil)
[![License](https://img.shields.io/npm/l/parsil.svg?style=flat-square)](https://github.com/salty-max/parsil/blob/main/LICENSE)

A lightweight parser‑combinator library for JavaScript/TypeScript. Compose small, pure parsers into powerful language parsers that run in **Node**, **Bun**, and modern **browsers**.

---

## Key features

* **Combinators** for building complex grammars from tiny pieces
* Great **TypeScript** inference
* **UTF‑8 aware** character parsers
* Works on **string** and **binary** inputs (`TypedArray`/`ArrayBuffer`/`DataView`)
* Helpful error messages and ergonomics (`run`, `fork`, `map`, `chain`, `errorMap`)

---

## Install

```bash
# npm
npm i parsil

# bun
bun add parsil
```

> **ESM‑only** as of v2.0.0. If you use CommonJS, dynamically import:
>
> ```js
> const P = await import('parsil');
> ```

---

## Quick start

```ts
import * as P from 'parsil';
// or: import P from 'parsil'; // default namespace export

// Parse one or more letters, then digits
const wordThenNumber = P.sequenceOf([P.letters, P.digits]);

const ok = wordThenNumber.run('hello123');
// { isError: false, result: ['hello', '123'], index: 8 }

const fail = wordThenNumber.run('123');
// { isError: true, error: "ParseError ...", index: 0 }
```

### Binary example: IPv4 header (excerpt)

```ts
import * as P from 'parsil';

const tag = (type: string) => (value: unknown) => ({ type, value });

const packetHeader = P.sequenceOf([
  P.uint(4).map(tag('Version')),
  P.uint(4).map(tag('IHL')),
  P.uint(6).map(tag('DSCP')),
  P.uint(2).map(tag('ECN')),
  P.uint(16).map(tag('Total Length')),
]);

// run against a DataView/ArrayBuffer
```

---

## Breaking changes in **v2.0.0**

* **ESM‑only** distribution. The CommonJS entry has been removed. Use `import` (or dynamic import in CJS).
* **Engines**: Node **≥ 20** (Bun ≥ 1.1).
* **Character parsers** (`anyChar`, `anyCharExcept`, etc.) return **string** values (not code points) and have updated TS types.

---

## API (overview)

Parsil exposes a `Parser<T>` type and a set of combinators. Everything below is available as a **named export** and also through the **default namespace**.

### Methods on `Parser<T>`

* **`.run(input)`** → `{ isError, result?, error?, index }`
* **`.fork(input, onError, onSuccess)`** → call either callback
* **`.map(fn)`** → `Parser<U>`
* **`.chain(fn)`** → `Parser<U>`
* **`.errorMap(fn)`** → map error details

### Core primitives

* **`str(text)`** – match a string
* **`char(c)`** – match a single UTF‑8 char exactly
* **`regex(re)`** – match via JS RegExp (anchored at current position)
* **`digit`/`digits`**, **`letter`/`letters`**, **`whitespace`/`optionalWhitespace`**
* **`anyChar`**, **`anyCharExcept(p)`**

### Combinators

* **`sequenceOf([p1, p2, ...])`** – run in order, collect results
* **`choice([p1, p2, ...])`** – try in order until one succeeds
* **`many(p)`** / **`manyOne(p)`** – zero or more / one or more
* **`exactly(n)(p)`** – repeat parser `n` times
* **`between(left, right)(value)`** – parse `value` between `left` and `right`
* **`sepBy(sep)(value)`** / **`sepByOne(sep)(value)`** – separated lists
* **`possibly(p)`** – optional (returns `null` when absent)
* **`lookAhead(p)`**, **`peek`**, **`startOfInput`**, **`endOfInput`**
* **`recursive(thunk)`** – define mutually recursive parsers
* **`succeed(x)`** / **`fail(msg)`** – constant success/failure

### Binary helpers

* **`uint(n)`** – read the next **n bits** as an unsigned integer
* **`int(n)`** – read the next **n bits** as a signed integer
* Utilities: `getString`, `getUtf8Char`, `getNextCharWidth`, `getCharacterLength`

> Full examples live in the [`examples/`](./examples) directory: simple expression parser, IPv4 header, etc.

---

## Error handling

Use `.fork` if you want callbacks instead of returned objects:

```ts
P.str('hello').fork(
  'hello',
  (error, state) => console.error(error, state),
  (result, state) => console.log(result, state)
);
```

---

## Contributing

* Run tests: `bun test`
* Lint: `bun run lint`
* Build: `bun run build`

PRs welcome! Please add tests for new combinators.

---

## License

MIT © [Maxime Blanc](https://github.com/salty-max)

---

## Changelog

### v2.0.0 (BREAKING)

* **ESM-only** distribution. CommonJS entry removed. Use `import` (or dynamic `import()` in CJS).
* **Engines**: Node **≥ 20**, Bun **≥ 1.1**.
* **Character parsers** (`anyChar`, `anyCharExcept`, etc.) now return **string** values; types updated accordingly.
* Build & DX: moved to **Bun** for tests/build; CI updated; tests relocated out of `src/`.
* Added **default namespace export** so `import P from "parsil"` works alongside named exports.

### v1.6.0

* New parsers: [`everythingUntil`](#everythinguntil), [`everyCharUntil`](#everycharuntil).

### v1.5.0

* New parser: [`anyCharExcept`](#anycharexcept).

### v1.4.0

* New parsers: [`lookAhead`](#lookahead), [`startOfInput`](#startofinput), [`endOfInput`](#endofinput).

### v1.3.0

* Improved type inference in `choice`, `sequenceOf`, and `exactly` using TS variadic tuple types.

### v1.2.0

* New parsers: [`exactly`](#exactly), [`peek`](#peek).

### v1.1.0

* New parsers: [`coroutine`](#coroutine), [`digit`](#digit), [`letter`](#letter), [`possibly`](#possibly), [`optionalWhitespace`](#optionalwhitespace), [`whitespace`](#whitespace).
`
