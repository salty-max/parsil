/**
 * Add:                   (+ 40 2)
 * Subtract:              (- 44 2)
 * Multiply:              (* 6 7)
 * Divide:                (* 84 2)
 *
 * Nested calculations:   (+ 40 (- 10 (/ 16 2)))
 */

import P from '../dist/index.js'

const betweenParens = P.between(P.char('('), P.char(')'))

const numberParser = P.digits.map((x) => ({
  type: 'number',
  value: Number(x),
}))

const operatorParser = P.choice([
  P.char('+'),
  P.char('-'),
  P.char('*'),
  P.char('/'),
])

const expr = P.recursive(() => P.choice([numberParser, operationParser]))

const operationParser = betweenParens(
  P.sequenceOf([operatorParser, P.char(' '), expr, P.char(' '), expr])
).map((results) => ({
  type: 'operation',
  value: {
    op: results[0],
    a: results[2],
    b: results[4],
  },
}))

const evaluate = (node) => {
  switch (node.type) {
    case 'number':
      return node.value
    case 'operation': {
      switch (node.value.op) {
        case '+':
          return evaluate(node.value.a) + evaluate(node.value.b)
        case '-':
          return evaluate(node.value.a) - evaluate(node.value.b)
        case '*':
          return evaluate(node.value.a) * evaluate(node.value.b)
        case '/':
          return evaluate(node.value.a) / evaluate(node.value.b)
      }
    }
  }
}

const interpret = (program) => {
  const parseResult = expr.run(program)
  if (parseResult.isError) {
    throw new Error('Invalid program')
  }

  return evaluate(parseResult.result)
}

console.log(interpret('(+ 40 (- 10 (/ 16 2)))'))
