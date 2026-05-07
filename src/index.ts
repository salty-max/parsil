import { InputType, InputTypes } from '@parsil/input-types'
import {
  Err,
  formatParseError,
  isError,
  isOk,
  Ok,
  ParseError,
  parseError,
  Parser,
  ParserState,
  ResultType,
  updateError,
  updateResult,
  updateState,
} from '@parsil/parser'
import * as Parsers from '@parsil/parsers'
import {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from '@parsil/util'

export * from '@parsil/parsers'

export type { Err, InputType, Ok, ParseError, ParserState, ResultType }

export {
  decoder,
  encoder,
  formatParseError,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
  InputTypes,
  isError,
  isOk,
  parseError,
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
  formatParseError,
  parseError,
  InputTypes,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
  ...Parsers,
}
