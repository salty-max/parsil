import { sequenceOf } from './sequence-of'
import { str } from './str'

const parser = sequenceOf([str('hello'), str('world')])

console.log(parser.run('helloworld'))
