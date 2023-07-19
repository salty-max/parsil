import { Parser } from '../../parser/parser'
import { regex } from '../regex'

const digitsRegex = /^[0-9]+/

export const digits: Parser<string> = regex(digitsRegex).errorMap(
  ({ index }) => `ParseError (position: ${index}): Expected digits`
)
