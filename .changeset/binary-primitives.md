---
'parsil': minor
---

Add byte-level binary parsers under `parsers/binary/`. Removes the boilerplate of composing endianness by hand on top of `uint(n)` / `int(n)` (the bit-level primitives in `parsers/bit/`).

**Byte primitives**:

- `anyByte` — single unsigned byte
- `bytes(n)` — exactly `n` raw bytes as a fresh `Uint8Array`

**Endianness-aware fixed-width**:

- `uint16BE` / `uint16LE` / `uint32BE` / `uint32LE`
- `int16BE` / `int16LE` / `int32BE` / `int32LE` (two-complement)
- `floatBE` / `floatLE` (32-bit IEEE 754)
- `doubleBE` / `doubleLE` (64-bit IEEE 754)

All read directly from the underlying `DataView` via the native `getUint16(offset, littleEndian)` / `getFloat64(...)` family — no bit-level reassembly. EOI surfaces a structured `ParseError` with `parser: '<name>'`.

```ts
const buf = new Uint8Array([0x12, 0x34])
uint16BE.run(new DataView(buf.buffer)) // 0x1234
uint16LE.run(new DataView(buf.buffer)) // 0x3412
```
