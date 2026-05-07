---
'parsil': minor
---

Add `chainl1` and `chainr1` combinators for operator-precedence parsing.

`chainl1(operand, op)` parses one or more operands separated by `op` and folds left-to-right — use for left-associative binary operators (subtraction, division, function application). `chainr1` is the right-fold variant for right-associative operators (exponentiation, cons).

`op` is a parser yielding the binary function combining two operand results (`Parser<(left: T, right: T) => T>`). A trailing operator without a following operand is treated as a parse error, not a soft cut.

```ts
const num = digits.map(Number)
const sub = char('-').map(() => (a, b) => a - b)
chainl1(num, sub).run('1-2-3') // (1 - 2) - 3 = -4

const pow = char('^').map(() => (a, b) => a ** b)
chainr1(num, pow).run('2^3^2') // 2 ^ (3 ^ 2) = 512
```
