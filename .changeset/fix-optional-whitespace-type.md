---
'parsil': patch
---

Tighten `optionalWhitespace` return type from `Parser<string | null>` to `Parser<string>`. The implementation always mapped `null` to `''`, so the `null` branch of the type was unreachable. Consumers that previously narrowed against `null` can drop that check; the value is always a string.
