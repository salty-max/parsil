import { letters } from './parsers/letters'
import { sequenceOf } from './parsers/sequence-of'
import { str } from './parsers/str'

const parser = sequenceOf([str('hello'), letters]).map((res) => ({
  value: res,
}))

console.log(parser.run('helloworld'))
