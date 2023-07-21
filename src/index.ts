import { InputType, InputTypes } from './input-types'
import {
  Err,
  Ok,
  Parser,
  ParserState,
  ResultType,
  updateError,
  updateResult,
  updateState,
  isOk,
  isError,
} from './parser'
export * from './parsers'
import {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from './util'

export type { ParserState, ResultType, Err, Ok, InputType }

export {
  encoder,
  decoder,
  Parser,
  isOk,
  isError,
  updateError,
  updateState,
  updateResult,
  InputTypes,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
}
