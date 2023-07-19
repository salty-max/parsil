import { sequenceOf } from './sequence-of'
import { str } from './str'

const parser = sequenceOf([str('hello'), str('world')])
  .map((res) => ({
    value: res,
  }))
  .errorMap((_, index) => `Expected a greeting @ index ${index}`)

console.log(parser.run('hello world'))
