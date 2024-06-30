import { describe, it } from 'node:test'
import assert from 'node:assert'
import { parse as dotenvParse } from 'dotenv'
import { parse } from './parse.js'

describe('parse function', () => {
  it('no data', () => {
    let text = ``
    let env = parse(text)
    assert.strictEqual(env.length, 0)
  })

  it('undefined', () => {
    let text = `KEY=`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'UKEY')?.value, obj['UKEY'])
  })

  it('empty value', () => {
    let text = `KEY=`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('plane text', () => {
    let text = `KEY=text`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('underbar key', () => {
    let text = `KEY_UNDERBAR=text`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY_UNDERBAR')?.value, obj['KEY_UNDERBAR'])
  })

  it('hyphen key', () => {
    let text = `KEY-HYPHEN=text`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY-HYPHEN')?.value, obj['KEY-HYPHEN'])
  })

  it('lowercase key', () => {
    let text = `key_lowercase=text`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'key_lowercase')?.value, obj['key_lowercase'])
  })

  it('has space', () => {
    let text = `  KEY  =  text`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('single quart', () => {
    let text = `KEY='text'`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('single quart: escape new line', () => {
    let text = `KEY='text\nnew line'`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('single quart: new line', () => {
    let text = `KEY='text
new line'`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('double quart', () => {
    let text = `KEY="text"`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

  it('back dash', () => {
    let text = `KEY="text"`
    let obj = dotenvParse(text)
    let env = parse(text)
    assert.strictEqual(env.find(r => r.key === 'KEY')?.value, obj['KEY'])
  })

})