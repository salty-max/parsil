import { InputType, InputTypes } from '@parsil/input-types'
import {
  Err,
  isError,
  isOk,
  Ok,
  Parser,
  ParserState,
  ResultType,
  updateError,
  updateResult,
  updateState,
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

export type { Err, InputType, Ok, ParserState, ResultType }

export {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
  InputTypes,
  isError,
  isOk,
  Parser,
  updateError,
  updateResult,
  updateState,
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
