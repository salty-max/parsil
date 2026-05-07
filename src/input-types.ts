export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array

export type InputType = string | ArrayBuffer | DataView | TypedArray

/**
 * Test whether a value is one of the supported numeric `TypedArray`
 * shapes. Used by the parser entry point to decide how to wrap binary
 * input into a `DataView`.
 *
 * @param x The candidate value.
 * @returns `true` if `x` is a numeric typed array; `false` otherwise.
 */
export const isTypedArray = (x: unknown) =>
  x instanceof Uint8Array ||
  x instanceof Uint8ClampedArray ||
  x instanceof Int8Array ||
  x instanceof Uint16Array ||
  x instanceof Int16Array ||
  x instanceof Uint32Array ||
  x instanceof Int32Array ||
  x instanceof Float32Array ||
  x instanceof Float64Array

export enum InputTypes {
  STRING = 'string',
  ARRAY_BUFFER = 'arrayBuffer',
  TYPED_ARRAY = 'typedArray',
  DATA_VIEW = 'dataView',
}
