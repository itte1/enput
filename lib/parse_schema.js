import crypto from 'node:crypto'

let types = ['string', 'secret', 'email', 'url', 'date', 'datetime', 'ip', 'number', 'int', 'boolean', 'select', 'list']

export function parseSchema(comment) { // : { message: string, type?: string, length:  }
  let lines = comment.split('\n')
  let isEndMessage = false
  let schema = {}
  schema.message = ''
  
  lines.forEach(line => {
    let match = line.trim().match(/^@(type|min|max|length|pattern|regex|copy|options)(\s+(.+))?\s*$/)
    if (match) {
      let attr = match[1].toLowerCase()
      switch (attr) {
        case 'type': {
          schema.type = match[3].toLowerCase()
          if (!types.includes(schema.type)) {
            schema.type = undefined
          }
          break
        }
        case 'min':
        case 'max':
        case 'length': {
          let n = parseInt(match[3])
          if (!Number.isNaN(n)) {
            schema[attr] = n
          }
          break
        }
        case 'pattern': {
          if (match[3]) {
            schema.pattern = match[3]
          }
          break
        }
        case 'copy':
        case 'multiple': {
          schema[attr] = true
          break
        }
        case 'options': {
          schema[attr] = match[3].split(',').map(option => option.trim())
          break
        }
      }
      isEndMessage = true
    } else {
      if (!isEndMessage) {
        schema.message += line + '\n'
      }
    }
  })

  schema.message = schema.message.trim()

  let schemaForHash = { ...schema }
  delete schemaForHash.message
  delete schemaForHash.copy

  schema.hash = crypto.createHash('sha512').update(JSON.stringify(schemaForHash)).digest('base64')

  return schema
}