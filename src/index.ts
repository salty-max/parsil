import { char } from './parsers/char'
import { digits } from './parsers/digits'
import { between } from './parsers/between'
import { sepBy } from './parsers/sep-by'

const betweenSquareBrackets = between(char('['), char(']'))
const commaSeparated = sepBy(char(','))

const parser = betweenSquareBrackets(commaSeparated(digits))

console.log(parser.run('[1,2,3,4,5]'))
