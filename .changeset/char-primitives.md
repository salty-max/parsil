---
'parsil': minor
---

Add char-level primitives that GTX (and any DSL grammar) needs: `satisfy`, `oneOf`, `noneOf`, plus the canned char classes `alphaNum`, `hexDigit`, `octDigit`, `upper`, `lower`.

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
