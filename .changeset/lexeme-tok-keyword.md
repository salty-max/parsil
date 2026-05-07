---
'parsil': minor
---

Add lexeme helpers for free-form language grammars: `tok`, `lexeme`, and `keyword`.

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
