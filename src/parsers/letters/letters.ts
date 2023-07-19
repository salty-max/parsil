import { Parser } from '../../parser/parser'
import { regex } from '../regex'

const lettersRegex = /^[A-Za-z]+/

export const letters: Parser<string> = regex(lettersRegex).errorMap(
  ({ index }) => `ParseError (position: ${index}): Expected letters`
)
