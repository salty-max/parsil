import { debugLog, digits, str } from '@parsil'
import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'

const PREV_DEBUG = process.env.PARSIL_DEBUG

describe('debugLog', () => {
  let logSpy: ReturnType<typeof spyOn<Console, 'log'>>

  beforeEach(() => {
    logSpy = spyOn(console, 'log').mockImplementation(() => undefined)
  })

  afterEach(() => {
    logSpy.mockRestore()
    if (PREV_DEBUG === undefined) {
      delete process.env.PARSIL_DEBUG
    } else {
      process.env.PARSIL_DEBUG = PREV_DEBUG
    }
  })

  it('is silent when PARSIL_DEBUG is unset', () => {
    delete process.env.PARSIL_DEBUG
    const wrapped = debugLog('digits', digits)
    wrapped.run('42')
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('logs enter + ok on success when label matches', () => {
    process.env.PARSIL_DEBUG = '*'
    const wrapped = debugLog('digits', digits)
    wrapped.run('42')

    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy.mock.calls[0][0]).toContain('enter digits @ index 0')
    expect(logSpy.mock.calls[1][0]).toContain('ok    digits @ index 2')
  })

  it('logs enter + fail on failure when label matches', () => {
    process.env.PARSIL_DEBUG = '*'
    const wrapped = debugLog('digits', digits)
    wrapped.run('abc')

    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(logSpy.mock.calls[1][0]).toContain('fail  digits')
  })

  it('respects exact-match patterns', () => {
    process.env.PARSIL_DEBUG = 'digits'

    debugLog('digits', digits).run('42')
    debugLog('letters', str('foo')).run('foo')

    const labels = logSpy.mock.calls.map((c) => String(c[0]))
    expect(labels.some((l) => l.includes('digits'))).toBe(true)
    expect(labels.some((l) => l.includes('letters'))).toBe(false)
  })

  it('respects suffix-wildcard patterns', () => {
    process.env.PARSIL_DEBUG = 'expr*'

    debugLog('expression', digits).run('1')
    debugLog('digits', digits).run('1')

    const labels = logSpy.mock.calls.map((c) => String(c[0]))
    expect(labels.some((l) => l.includes('expression'))).toBe(true)
    expect(labels.some((l) => l.includes('digits @'))).toBe(false)
  })

  it('respects comma-separated patterns', () => {
    process.env.PARSIL_DEBUG = 'a,b'

    debugLog('a', digits).run('1')
    debugLog('b', digits).run('2')
    debugLog('c', digits).run('3')

    const labels = logSpy.mock.calls.map((c) => String(c[0]))
    expect(labels.some((l) => l.includes('a @'))).toBe(true)
    expect(labels.some((l) => l.includes('b @'))).toBe(true)
    expect(labels.some((l) => l.includes('c @'))).toBe(false)
  })

  it('forwards the parser result transparently', () => {
    process.env.PARSIL_DEBUG = '*'
    const wrapped = debugLog('digits', digits)
    const r = wrapped.run('42')
    expect(r.isError).toBe(false)
    if (!r.isError) expect(r.result).toBe('42')
  })
})
