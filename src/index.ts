import { InputType, InputTypes } from '@parsil/input-types'
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
} from '@parsil/parser'
export * from '@parsil/parsers'
import * as Parsers from '@parsil/parsers'
import {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from '@parsil/util'

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

export default {
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
  ...Parsers,
}
