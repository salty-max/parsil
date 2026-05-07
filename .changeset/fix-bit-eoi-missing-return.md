---
'parsil': patch
---

Fix `bit` reading out-of-bounds bytes when the input runs out mid-bit-stream. The end-of-input branch built an error state but did not return it, so the parser fell through to `dataView.getUint8(byteOffset)` with `byteOffset >= byteLength`. Reading past the end now correctly returns a `ParseError @ index N -> bit: Unexpected end of input`.
