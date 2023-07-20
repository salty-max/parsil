# Parsil

[![Build Status](https://github.com/salty-max/parsil/workflows/CI/badge.svg)](https://github.com/salty-max/parsil/actions)
[![npm Version](https://img.shields.io/npm/v/parsil.svg?style=flat-square)](https://www.npmjs.com/package/parsil)
[![License](https://img.shields.io/npm/l/parsil.svg?style=flat-square)](https://github.com/salty-max/parsil/blob/master/LICENSE)

## Description

Parsil is a lightweight and flexible parser combinators library for JavaScript and TypeScript. It provides a set of composable parsers that allow you to build complex parsing logic with ease.

Key Features:

- Composable parsers for building complex parsing logic
- Support for error handling and error reporting
- Extensive library of predefined parsers for common parsing tasks
- Flexible and expressive API for defining custom parsers
- Well-documented and easy to use

## Table of contents

- [Parsil](#parsil)
  - [Description](#description)
  - [Table of contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [API](#api)
    - [Methods](#methods)
      - [.run](#run)
      - [.fork](#fork)
      - [.map](#map)
      - [.chain](#chain)
      - [.errorMap](#errormap)
    - [Functions](#functions)
      - [anyChar](#anychar)
      - [bit](#bit)
      - [between](#between)
      - [char](#char)
      - [choice](#choice)
      - [coroutine](#coroutine)
      - [digit](#digit)
      - [digits](#digits)
      - [fail](#fail)
      - [int](#int)
      - [letter](#letter)
      - [letters](#letters)
      - [many](#many)
      - [manyOne](#manyone)
      - [one](#one)
      - [optionalWhitespace](#optionalwhitespace)
      - [possibly](#possibly)
      - [rawString](#rawstring)
      - [recursive](#recursive)
      - [regex](#regex)
      - [sepBy](#sepby)
      - [sepByOne](#sepbyone)
      - [sequenceOf](#sequenceof)
      - [succeed](#succeed)
      - [str](#str)
      - [uint](#uint)
      - [whitespace](#whitespace)
      - [zero](#zero)

## Installation

Install Parsil using npm:

```bash
npm install parsil
```

## Usage
```javascript
import P from 'your-library-name';

// Define parsers
const digitParser = P.digits();
const letterParser = P.letters();
const wordParser = P.manyOne(letterParser);

// Parse input
const input = 'Hello123';
const result = wordParser.parse(input);

if (result.isSuccess) {
  console.log('Parsing succeeded:', result.value);
} else {
  console.error('Parsing failed:', result.error);
}

```

## API

### Methods

#### .run

`.run` starts the parsing process on an input, (which may be a `string`, [`TypedArray`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray), [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer), or [`DataView`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)), initializes the state, and returns the result of parsing the input using the parser.

**Example**

```JavaScript
str('hello').run('hello')
// -> {
//      isError: false,
//      result: "hello",
//      index: 5
//    }
```


#### .fork

Takes an input to parse, and two functions to handle the results of parsing:
  - an error function that is called when parsing fails
  - a success function that is called when parsing is successful.
    
The fork method will run the parser on the input and, depending on the outcome, call the appropriate function.

**Example**

```JavaScript
str('hello').fork(
  'hello',
  (errorMsg, parsingState) => {
    console.log(errorMsg);
    console.log(parsingState);
    return "goodbye"
  },
  (result, parsingState) => {
    console.log(parsingState);
    return result;
  }
);
// [console.log] Object {isError: false, error: null, target: "hello", index: 5, …}
// -> "hello"

str('hello').fork(
  'farewell',
  (errorMsg, parsingState) => {
    console.log(errorMsg);
    console.log(parsingState);
    return "goodbye"
  },
  (result, parsingState) => {
    console.log(parsingState);
    return result;
  }
);
// [console.log] ParseError @ index 0 -> str: Expecting string 'hello', got 'farew...'
// [console.log] Object {isError: true, error: "ParseError @ index 0 -> str: Expecting string 'hello',…", target: "farewell", index: 0, …}
// "goodbye"
```
#### .map

`.map` transforms the parser into a new parser that applies a function to the result of the original parser.

**Example**

```JavaScript
const newParser = letters.map(x => ({
  matchType: 'string',
  value: x
});

newParser.run('hello world')
// -> {
//      isError: false,
//      result: {
//        matchType: "string",
//        value: "hello"
//      },
//      index: 5,
//    }
```
#### .chain

`.chain` transforms the parser into a new parser by applying a function to the result of the original parser.

This function should return a new Parser that can be used to parse the next input.

This is used for cases where the result of a parser is needed to decide what to parse next.

**Example**

```JavaScript

const lettersThenSpace = sequenceOf([
  letters,
  char(' ')
]).map(x => x[0]);

const newParser = lettersThenSpace.chain(matchedValue => {
  switch (matchedValue) {
    case 'number': return digits;

    case 'string': return letters;

    case 'bracketed': return sequenceOf([
      char('('),
      letters,
      char(')')
    ]).map(values => values[1]);

    default: return fail('Unrecognised input type');
  }
});
```
#### .errorMap

`.errorMap` is like [.map](#map) but it transforms the error value. The function passed to `.errorMap` gets an object the _current error message_ (`error`) and the _index_ (`index`) that parsing stopped at.

**Example**

```JavaScript
const newParser = letters.errorMap(({error, index}) => `Old message was: [${error}] @ index ${index}`);

newParser.run('1234')
// -> {
//      isError: true,
//      error: "Old message was: [ParseError @ index 0 -> letters: Expecting letters] @ index 0",
//      index: 0,
//    }
```

### Functions

#### anyChar

`anyChar` matches **exactly one** utf-8 character.

**Example**

```JavaScript
anyChar.run('a')
// -> {
//      isError: false,
//      result: "a",
//      index: 1,
//    }

anyChar.run('😉')
// -> {
//      isError: false,
//      result: "😉",
//      index: 4,
//    }
```

#### bit
`bit` parses a bit at index from a Dataview

**Example**

```javascript
const parser = bit
const data = new Uint8Array([42]).buffer
parser.run(new Dataview(data))
// -> {
//      isError: false,
//      result: 0,
//      index: 1,
//    }
```

#### between

`between` takes 3 parsers, a _left_ parser, a _right_ parser, and a _value_ parser, returning a new parser that matches a value matched by the _value_ parser, between values matched by the _left_ parser and the _right_ parser.

This parser can easily be partially applied with `char ('(')` and `char (')')` to create a `betweenRoundBrackets` parser, for example.

**Example**

```JavaScript
const newParser = between (char ('<')) (char ('>')) (letters);

newParser.run('<hello>')
// -> {
//      isError: false,
//      result: "hello",
//      index: 7,
//    }

const betweenRoundBrackets = between (char ('(')) (char (')'));

betweenRoundBrackets (many (letters)).run('(hello world)')
// -> {
//      isError: true,
//      error: "ParseError @ index 6 -> between: Expecting character ')', got ' '",
//      index: 6,
//    }
```

#### char

`char` takes a character and returns a parser that matches that character **exactly one** time.

**Example**

```JavaScript
char ('h').run('hello')
// -> {
//      isError: false,
//      result: "h",
//      index: 1,
//    }
```

#### choice

`choice` is a parser combinator that tries each parser in a given list of parsers, in order,
until one succeeds.

If a parser succeeds, it consumes the relevant input and returns the result.

If no parser succeeds, `choice` fails with an error message.

**Example**

```JavaScript
const newParser = choice ([
  digit,
  char ('!'),
  str ('hello'),
  str ('pineapple')
])

newParser.run('hello world')
// -> {
//      isError: false,
//      result: "hello",
//      index: 5,
//    }
```

#### coroutine

`coroutine` is a parser that allows for advanced control flow and composition of parsers.

**Example**
```javascript
const parserFn: ParserFn<number> = (yield) => {
  const x = yield(parserA);
  const y = yield(parserB);
  return x + y;
};
 *
const coroutineParser = coroutine(parserFn);
coroutineParser.run(input);
```

#### digit

`digit` is a parser that matches **exactly one** numerical digit `/[0-9]/`.

**Example**

```JavaScript
digit.run('99 bottles of beer on the wall')
// -> {
//      isError: false,
//      result: "9",
//      index: 1,
//    }
```

#### digits

`digits` matches **one or more** numerical digit `/[0-9]/`.

**Example**

```JavaScript
digits.run('99 bottles of beer on the wall')
// -> {
//      isError: false,
//      result: "99",
//      index: 2,
//    }
```

#### fail

`fail` takes an _error message_ string and returns a parser that always fails with the provided _error message_.

**Example**

```JavaScript
fail('Nope').run('hello world')
// -> {
//      isError: true,
//      error: "Nope",
//      index: 0,
//    }
```

#### int
`int` reads the next `n` bits from the input and interprets them as an signed integer.

**Example**

```javascript
const parser = int(8)
const input = new Uint8Array([-42])
const result = parser.run(new DataView(input.buffer))
// -> {
//      isError: false,
//      result: -42,
//      index: 8,
//    }
```  

#### letter

`letter` is a parser that matches **exactly one** alphabetical letter `/[a-zA-Z]/`.

**Example**

```JavaScript
letter.run('hello world')
// -> {
//      isError: false,
//      result: "h",
//      index: 1,
//    }
```

#### letters

`letters` matches **one or more** alphabetical letter `/[a-zA-Z]/`.

**Example**

```JavaScript
letters.run('hello world')
// -> {
//      isError: false,
//      result: "hello",
//      index: 5,
//    }
```

#### many

`many` is a parser combinator that applies a given parser zero or more times.

It collects the results of each successful parse into an array, and stops when the parser can no longer match the input.

It doesn't fail when the parser doesn't match the input at all; instead, it returns an empty array.

**Example**

```JavaScript
const newParser = many (str ('abc'))

newParser.run('abcabcabcabc')
// -> {
//      isError: false,
//      result: [ "abc", "abc", "abc", "abc" ],
//      index: 12,
//    }

newParser.run('')
// -> {
//      isError: false,
//      result: [],
//      index: 0,
//    }

newParser.run('12345')
// -> {
//      isError: false,
//      result: [],
//      index: 0,
//    }
```

#### manyOne

`manyOne` is similar to `many`, but it requires the input parser to match the input at least once.

**Example**

```JavaScript
const newParser = many1 (str ('abc'))

newParser.run('abcabcabcabc')
// -> {
//      isError: false,
//      result: [ "abc", "abc", "abc", "abc" ],
//      index: 12,
//    }

newParser.run('')
// -> {
//   isError: true,
//   error: "ParseError @ index 0 -> manyOne: Expected to match at least one value",
//   index: 0,
//   data: null
// }

newParser.run('12345')
// -> {
//   isError: true,
//   error: "ParseError @ index 0 -> manyOne: Expected to match at least one value",
//   index: 0,
//   data: null
// }
```

#### one
`one` parses bit at index from a Dataview and expects it to be 1

**Example**

```javascript
const parser = one
const data = new Uint8Array([234]).buffer
parser.run(new Dataview(data))
// -> {
//      isError: false,
//      result: 1,
//      index: 1,
//    }
const data = new Uint8Array([42]).buffer
parser.run(new Dataview(data))
// -> {
//      isError: true,
//      error: "ParseError @ index 0 -> one: Expected 1 but got 0",
//      index: 0,
//    }
```

#### optionalWhitespace

`optionalWhitespace` is a parser that matches **zero or more** whitespace characters.

**Example**

```JavaScript
const newParser = sequenceOf ([
  str ('hello'),
  optionalWhitespace,
  str ('world')
]);

newParser.run('hello           world')
// -> {
//      isError: false,
//      result: [ "hello", "           ", "world" ],
//      index: 21,
//    }

newParser.run('helloworld')
// -> {
//      isError: false,
//      result: [ "hello", "", "world" ],
//      index: 10,
//    }
```

#### possibly

`possibly` takes an _attempt_ parser and returns a new parser which tries to match using the _attempt_ parser. If it is unsuccessful, it returns a null value and does not "consume" any input.

**Example**

```JavaScript
const newParser = sequenceOf ([
  possibly (str ('Not Here')),
  str ('Yep I am here')
]);

newParser.run('Yep I am here')
// -> {
//      isError: false,
//      result: [ null, "Yep I am here" ],
//      index: 13,
//    }
```

#### rawString

`rawString` matches a string of characters exactly as provided.

Each character in the input string is converted to its corresponding ASCII code and a parser is created for each ASCII code.

The resulting parsers are chained together using sequenceOf to ensure they are parsed in order.

The parser succeeds if all characters are matched in the input and fails otherwise.

**Example**
```javascript
const parser = rawString('Hello')
parser.run('Hello')
// -> {
//      isError: false,
//      result: [72, 101, 108, 108, 111],
//      index: 40,
//    }
parser.run('World')
// -> {
//      isError: true,
//      error: "ParseError -> rawString: Expected character H, but got W",
//      index: 8,
//    }
```

#### recursive

`recursive` takes a function that returns a parser (a thunk), and returns that same parser. This is needed in order to create _recursive parsers_ because JavaScript is an **eager** language.

In the following example both the `value` parser and the `matchArray` parser are defined in terms of each other, so one must be one **must** be defined using `recursive`.

**Example**

```JavaScript
const value = recursiveParser (() => choice ([
  matchNum,
  matchStr,
  matchArray
]));

const betweenSquareBrackets = between (char ('[')) (char (']'));
const commaSeparated = sepBy (char (','));
const spaceSeparated = sepBy (char (' '));

const matchNum = digits;
const matchStr = letters;
const matchArray = betweenSquareBrackets (commaSeparated (value));

spaceSeparated(value).run('abc 123 [42,def] 45')
// -> {
//      isError: false,
//      result: [ "abc", "123", [ "42", "def" ], "45" ],
//      index: 29,
//    }
```

#### regex

`regex` takes a RegExp and returns a parser that matches **as many characters** as the RegExp matches.

**Example**

```JavaScript
regex(/^[hH][aeiou].{2}o/).run('hello world')
// -> {
//      isError: false,
//      result: "hello",
//      index: 5,
//    }
```

#### sepBy

`sepBy` takes two parsers - a _separator_ parser and a _value_ parser - and returns a new parser that matches **zero or more** values from the _value_ parser that are separated by values of the _separator_ parser. Because it will match zero or more values, this parser will _fail_ if a _value_ is followed by a _separator_ but NOT another _value_. If there's no _value_, the result will be an empty array, not failure.

**Example**

```JavaScript
const newParser = sepBy (char (',')) (letters)

newParser.run('some,comma,separated,words')
// -> {
//      isError: false,
//      result: [ "some", "comma", "separated", "words" ],
//      index: 26,
//    }

newParser.run('')
// -> {
//      isError: false,
//      result: [],
//      index: 0,
//    }

newParser.run('12345')
// -> {
//      isError: false,
//      result: [],
//      index: 0,
//    }
```

#### sepByOne

`sepByOne` is the same as `sepBy`, except that it matches **one or more** occurence.

**Example**

```JavaScript
const newParser = sepByOne(char (','))(letters)

newParser.run('some,comma,separated,words')
// -> {
//      isError: false,
//      result: [ "some", "comma", "separated", "words" ],
//      index: 26,
//    }

newParser.run('1,2,3')
// -> {
//      isError: true,
//      error: "ParseError @ index0 -> sepByOne: Expected to match at least one separated value",
//      index: 0,
//    }
```

#### sequenceOf

`sequenceOf` is a parser combinator that accepts an array of parsers and applies them
in sequence to the input. If all parsers succeed, it returns an array
of their results. 

If any parser fails, it fails immediately
and returns the error state of that parser.

**Example**

```JavaScript
const newParser = sequenceOf ([
  str ('he'),
  letters,
  char (' '),
  str ('world'),
])

newParser.run('hello world')
// -> {
//      isError: false,
//      result: [ "he", "llo", " ", "world" ],
//      index: 11,
//    }
```

#### succeed

`succeed` is a parser combinator that always succeeds and produces a constant value. It ignores the input state and returns the specified value as the result.

**Example**

```javascript
const parser = succeed(42);
parser.run("hello world");
// Returns:
// {
//   isError: false,
//   result: 42,
//   index: 0
// }
```

#### str

`str` tries to match a given string against its input.

**Example**

```JavaScript
str('hello').run('hello world')
// -> {
//      isError: false,
//      result: "hello",
//      index: 5,
//    }
```

#### uint
`uint` reads the next `n` bits from the input and interprets them as an unsigned integer.

**Example**

```javascript
const parser = uint(8)
const input = new Uint8Array([42])
const result = parser.run(new DataView(input.buffer))
// -> {
//      isError: false,
//      result: 42,
//      index: 8,
//    }
```

#### whitespace

`whitespace` is a parser that matches **one or more** whitespace characters.

**Example**

```JavaScript
const newParser = sequenceOf ([
  str ('hello'),
  whitespace,
  str ('world')
]);

newParser.run('hello           world')
// -> {
//      isError: false,
//      result: [ "hello", "           ", "world" ],
//      index: 21,
//    }

newParser.run('helloworld')
// -> {
//      isError: true,
//      error: "ParseError 'many1' (position 5): Expecting to match at least one value",
//      index: 5,
//    }
```

#### zero
`zero` parses bit at index from a Dataview and expects it to be 0

**Example**

```javascript
const parser = zero
const data = new Uint8Array([42]).buffer
parser.run(new Dataview(data))
// -> {
//      isError: false,
//      result: 0,
//      index: 1,
//    }
const data = new Uint8Array([234]).buffer
parser.run(new Dataview(data))
// -> {
//      isError: true,
//      error: "ParseError @ index 0 -> zero: Expected 0 but got 1",
//      index: 0,
//    }
```