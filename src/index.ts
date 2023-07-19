import { choice } from './parsers/choice'
import { digits } from './parsers/digits'
import { letters } from './parsers/letters'
import { many } from './parsers/many'

const parser = many(choice([digits, letters]))

console.log(parser.run('123abc'))
