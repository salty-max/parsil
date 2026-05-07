---
'parsil': patch
---

Fix `char` reporting `@ index 0` literally in error messages instead of the actual position. Sequences like `sequenceOf([str('hello '), char('!')])` now correctly report the index where the mismatch occurred (e.g. `index 6` for input `'hello world'`) rather than `index 0`.
