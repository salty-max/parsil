---
'parsil': minor
---

Add separation and repetition variants under `parsers/sep-by/` and `parsers/many/`. Closes the standard Parsec-style coverage that `sepBy`/`sepByOne` left open.

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
