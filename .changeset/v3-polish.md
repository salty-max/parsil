---
'parsil': patch
---

Pre-3.0.0 audit polish — three consumer-visible fixes plus internal cleanup.

**Fixes**

- **Published `.d.ts` files now resolve their imports.** Previous releases shipped declaration files containing unresolved `@parsil/*` path aliases — consumers' typecheckers failed to resolve them and surfaced phantom errors. The build now post-processes `tsc` output via `tsc-alias` so every import in `dist/**/*.d.ts` is a relative path. Pre-existing bug from 2.x; fixed before tagging 3.0.
- **`recursive<T, E>`'s default error type is now `ParseError`** (was the legacy `string`). All other parsers were defaulted to `ParseError` in #24's error-model overhaul; this brings `recursive` in line.
- **`recoverAt` no longer constructs its success state via a hand-rolled literal with a `null as ParseError` placeholder.** Internal cleanup, no behavior change — the recovery envelope produced is identical.

**Internal**

- `.map` and `.chain` early-exit branches now use the `forward()` helper added in #29, matching the convention every parser primitive follows.
- Binary spec files split 1-per-primitive (was grouped BE/LE pairs), matching the codebase convention of one spec file per parser export.
- Specs added for `expect` and `succeed`, the two parsers that were shipping without coverage.
- README count and bundle-size claims updated to reality (100+ parsers, ~24 KB minified). `StateTransformerFn` documented in the `Building custom parsers` section.
