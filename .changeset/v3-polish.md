---
'parsil': patch
---

Pre-3.0.0 audit polish.

**Fixes**

- **Published `.d.ts` files now resolve their imports.** Previous releases shipped declaration files containing unresolved `@parsil/*` path aliases — consumers' typecheckers failed to resolve them and surfaced phantom errors. The build now post-processes `tsc` output via `tsc-alias` so every import in `dist/**/*.d.ts` is a relative path. Pre-existing bug from 2.x; fixed before tagging 3.0.
- **Infinite-loop guard on `many` / `sepBy` / `sepEndBy` / `endBy` / `chainl1` / `chainr1`.** When the inner parser(s) succeeded without consuming input (e.g. `many(possibly(p))`, `many(succeed(x))`, `sepBy(succeed(','))(possibly(p))`), these combinators looped forever. Each one now detects no-progress per iteration and emits a clean `ParseError` with a diagnostic message (`'<combinator>: ... succeeded without consuming input — infinite loop guard'`) instead of hanging. `manyOne`, `sepByOne`, `sepEndByOne`, `endByOne`, and `atLeast` inherit the guard transparently because they delegate to the base combinators.
- **`bit/uint(n)` and `bit/int(n)` error message off-by-one.** The check rejected `n > 32` but the message said `'must be less than 32'`, suggesting `n = 32` was forbidden when it actually wasn't. Message now says `'less than or equal to 32'`. Spec coverage extended to pin the boundary contract.
- **`bit/rawString` now throws on non-ASCII input at construction time.** `rawString` reads one byte per char via `uint(8)`; `c.charCodeAt(0)` for U+0080+ returns the UTF-16 code unit rather than the actual UTF-8 byte sequence, silently producing wrong matches. The construction-time validator surfaces this loudly instead of failing at runtime with confusing "byte mismatch" errors.
- **`recursive<T, E>`'s default error type is now `ParseError`** (was the legacy `string`). All other parsers were defaulted to `ParseError` in #24's error-model overhaul; this brings `recursive` in line.
- **`recoverAt` no longer constructs its success state via a hand-rolled literal with a `null as ParseError` placeholder.** Internal cleanup, no behavior change — the recovery envelope produced is identical.

**Internal**

- `.map` and `.chain` early-exit branches now use the `forward()` helper added in #29, matching the convention every parser primitive follows.
- Binary spec files split 1-per-primitive (was grouped BE/LE pairs), matching the codebase convention of one spec file per parser export.
- Specs added for `expect` and `succeed`, the two parsers that were shipping without coverage. Regression specs added for the no-progress and ASCII guards above.
- README count and bundle-size claims updated to reality (100+ parsers, ~24 KB minified). `StateTransformerFn` documented in the `Building custom parsers` section.
