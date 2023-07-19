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
} from './parser'
import {
  between,
  anyChar,
  char,
  choice,
  digits,
  fail,
  letters,
  many,
  manyOne,
  recursive,
  regex,
  sepBy,
  sepByOne,
  sequenceOf,
  str,
} from './parsers'
import {
  decoder,
  encoder,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
} from './util'

export type { ParserState, ResultType, Err, Ok, InputType }

const P = {
  between,
  anyChar,
  char,
  choice,
  digits,
  fail,
  letters,
  many,
  manyOne,
  recursive,
  regex,
  sepBy,
  sepByOne,
  sequenceOf,
  str,
}

export default P
export {
  encoder,
  decoder,
  Parser,
  updateError,
  updateState,
  updateResult,
  InputTypes,
  getCharacterLength,
  getNextCharWidth,
  getString,
  getUtf8Char,
}
