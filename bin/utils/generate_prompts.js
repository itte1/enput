import { z } from 'zod';
import pico from 'picocolors'

export function generatePrompts(records, isForce = false) {
  return records.map(record => {
    let skip = record.schema.copy
    let header = record.schema.message ? '\n' + record.schema.message + '\n' : undefined
    let footer = ''
    let initial = record.value || undefined
    let name = record.key
    let message = record.key

    let typeProps = (() => {
      switch (record.schema.type) {
        case 'number':
        case 'int': return { type: 'numeral' }
        case 'boolean': return { type: 'toggle', enabled: 'true', disabled: 'false' }
        case 'secret': return { type: 'password' }
        case 'select': {
          if ('options' in record.schema) {
            return { type: 'select', choices: record.schema.options.map(option => ({ name: option, value: option })), multiple: record.schema.multiple }
          } else {
            if (record.schema.multiple) {
              return { type: 'list' }
            } else {
              return { type: 'text' }
            }
          }
        }
        case 'list': return { type: 'list' }
        case 'string':
        case 'email':
        case 'url':
        case 'ip':
        case 'date':
        case 'datetime':
        default:
          return { type: 'text' }
      }
    })()
    if (skip) {
      typeProps = { type: 'text' }
    }

    let schema = (() => {
      switch (record.schema.type) {
        case 'number': return z.number()
        case 'int': return z.number().int()
        case 'boolean': return z.boolean()
        case 'email': return z.string().email()
        case 'url': return z.string().url()
        case 'ip': return z.string().ip()
        case 'date': return z.string().date()
        case 'datetime': return z.string().datetime()
        case 'select': {
          if (record.schema.multiple) {
            return z.array(z.string())
          } else {
            return z.string()
          }
        }
        case 'secret':
        case 'list':
        case 'string':
        default:
          return z.string()
      }
    })()
    if ('min' in record.schema) {
      schema = schema.min(record.schema.min)
    }
    if ('max' in record.schema) {
      schema = schema.max(record.schema.max)
    }
    if ('length' in record.schema) {
      schema = schema.length(record.schema.length)
    }
    if ('pattern' in record.schema) {
      schema = schema.regex(new RegExp(record.schema.pattern))
    }

    return {
      header, footer, skip, initial, name, message,
      ...typeProps,
      validate: value => {
        if (isForce) {
          return true
        }
        let { success } = schema.safeParse(value)
        return success
      },
      result: value => {
        switch (typeof value) {
          case 'boolean': return value ? 'true' : 'false'
          case 'number': return value.toString()
          case 'string': return value
          case 'object': return value.join(',')
          default:
            console.error(pico.red('This value cannot be a string.'))
            process.exit(1)
        }
      }
    }
  })
}