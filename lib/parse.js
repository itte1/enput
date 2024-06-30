import path from 'node:path'
import pico from 'picocolors'

import { parseSchema } from './parse_schema.js'

export function parse(fileText, fileName) { // : { key: string, value: string, schema: Schema }[]
  let text = fileText.replace(/\r?\n|\r/g , "\n")
  let pointer = 0

  return getEnv()

  function getEnv() {
    let env = []
    while (next() < text.length) {
      let keyValue = getRecord()
      if (keyValue) {
        env.push(keyValue)
      }
    }
    return env
  }

  function getRecord() {
    let { comment, originalComment } = getComment()
    let schema = parseSchema(comment.trim())
    skip()
    let startPointer = pointer
    let key = getKey()
    let startLine = (text.substring(0, pointer).match('\n') || []).length

    skip()
    if (text[pointer] !== '=' || !key) {
      console.warn(pico.yellow(path.resolve(fileName) + ':' + startLine + ' ' + 'Ignored line'))
      skipLine()
      return undefined
    }
    pointer++
    skipSpace()
    let originalKey = text.substring(startPointer, pointer)
    let { value, quart } = getValue()
    skipLine()
    let endLine = (text.substring(0, pointer).match('\n') || []).length
    return { key, value, quart, startLine, endLine, originalComment, originalKey, comment, schema }
  }

  function getComment() {
    let comment = ''
    let startPointer = pointer
    while(text[next()] === '#') { 
      skip()
      while (text[pointer] === '#') {
        pointer++
      }
      let index = text.indexOf('\n', pointer)
      if (index > 0) {
        comment += text.substring(pointer, index).trim() + '\n'
        pointer = index
      } else {
        pointer = text.length
      }
      skipLine()
    }
    return { comment: comment.trim(), originalComment: text.substring(startPointer, pointer) }
  }

  function getKey() {
    let start = pointer
    while (pointer < text.length && /^[a-zA-Z0-9_\-]$/.test(text[pointer])) {
      pointer++
    }
    return text.substring(start, pointer)
  }

  function getValue() {
    if (text[pointer] === '"' || text[pointer] === "'" || text[pointer] === "`") {
      let quart = text[pointer]
      pointer++
      let start = pointer
      while (pointer < text.length && (text[pointer] !== quart || text[pointer - 1] === "\\")) {
        if (text[pointer] === quart && text[pointer - 1] !== "\\" && restIsEmpty()) {
          break
        }
        pointer++
      }
      let end = pointer
      if (text[pointer] === quart) {
        pointer++
      } else {
        start--
      }
      return { value: text.substring(start, end), quart }
    } else {
      let start = pointer
      while (pointer < text.length && text[pointer] !== '\n') {
        pointer++
      }
      return { value: text.substring(start, pointer).trim() }
    }
  }

  function next() {
    for (let i = pointer; i < text.length; i++) {
      if (/^\S$/.test(text[i])) {
        return i
      }
    }
    return text.length
  }

  function skip() {
    pointer = next()
  }

  function skipSpace() {
    while (pointer < text.length && text[pointer] !== '\n') {
      if (/^\S$/.test(text[pointer])) {
        return
      }
      pointer++
    }
  }

  function skipLine() {
    let index = text.indexOf('\n', pointer)
    if (index > 0) {
      pointer = index + 1
    } else {
      pointer = text.length
    }
  }

  function restIsEmpty() {
    for (let i = pointer; i < text.length && text[i] !== '\n'; i++) {
      if (/^\S$/.test(text[i])) {
        return false
      }
    }
    return true
  }
}