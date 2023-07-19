import { fail } from './parsers/fail'
import { char } from './parsers/char'
import { choice } from './parsers/choice'
import { digits } from './parsers/digits'
import { letters } from './parsers/letters'
import { sequenceOf } from './parsers/sequence-of'

// const stringResult = { type: 'string', value: 'hello' }
// const numberResult = { type: 'number', value: 42 }
// const dicerollResult = { type: 'diceroll', value: [2, 6] }

const stringParser = letters.map((res) => ({ type: 'string', value: res }))
const numberParser = digits.map((res) => ({
  type: 'number',
  value: Number(res),
}))
const dicerollParser = sequenceOf([
  digits,
  choice([char('d'), char('D')]),
  digits,
]).map(([n, _, s]) => ({
  type: 'diceroll',
  value: [Number(n), Number(s)],
}))

const parser = sequenceOf([letters, char(':')])
  .map(([type]) => type)
  .chain((type) => {
    switch (type) {
      case 'string':
        return stringParser
      case 'number':
        return numberParser
      case 'diceroll':
        return dicerollParser
      default:
        return fail('Not a valid type')
    }
  })

console.log(parser.run('diceroll:2d6'))
