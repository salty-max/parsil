---
'parsil': patch
---

Fix `everythingUntil` (and by extension `everyCharUntil`) silently dropping bytes with value `0x00` from binary inputs. The implementation gated the `results.push(val)` on `if (val)`, which is falsy for zero. Binary formats commonly contain null bytes (length-prefixed strings, padding, separators) and would lose them. The guard is removed; every byte is now collected verbatim.
