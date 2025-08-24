# parsil

## 2.2.0

### Minor Changes

- Add source position utilities and span helpers:
  - New `index` parser returns current byte offset without consuming input.
  - New `Parser.withSpan()` returns `{ value, start, end }` for any parser.
  - New `Parser.spanMap()` maps `(value, { start, end })` to custom node shapes.

  These features make it straightforward to attach precise ranges to AST nodes for LSP/editors.

## 2.1.1

### Patch Changes

- Allows custom error type for coroutine

## 2.1.0

### Minor Changes

- Add .skip / .then / .between / .lookahead methods to the parser
