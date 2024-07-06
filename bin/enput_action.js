import fs from 'node:fs'
import enquirer from 'enquirer'
import pico from 'picocolors'

import { parse } from '../lib/parse.js'
import { deparse } from '../lib/deparse.js'
import { generatePrompts } from './utils/generate_prompts.js'

let { prompt } = enquirer

export async function enputAction(args, options) {
  let isForce = !!options.force
  let isUpdate = !!options.update
  let schemaFileName = options.schema
  let envFileName = options.env
  if (options.mode) {
    schemaFileName = schemaFileName.replace('.env', '.env.' + options.mode)
    envFileName = envFileName.replace('.env', '.env.' + options.mode)
  }

  // Read files

  let schemaFileText
  try {
    schemaFileText = fs.readFileSync(schemaFileName).toString()
  } catch (error) {
    console.error(pico.red(error.message))
    process.exit(1)
  }

  let envFileText = ''
  let isExist = false
  try {
    envFileText = fs.readFileSync(envFileName).toString()
    isExist = true
  } catch (_) {}

  // Parse files

  let schemaRecords = parse(schemaFileText, schemaFileName)
  let envRecords = parse(envFileText, envFileName)

  // Find target records

  let diffRecords = schemaRecords.filter(record => !envRecords.some(r => r.key === record.key))
  let isUpdateRecords = []

  let targetRecords = diffRecords
  if (args.length) {
    targetRecords = []
    for (let arg of args) {
      let filterMatch = arg.match(/^([a-zA-Z0-9_\-]+)$/)
      if (filterMatch) {
        let key = filterMatch[1]
        let schemaRecord = schemaRecords.find(record => record.key === key)
        let envRecord = envRecords.find(record => record.key === key)
        if (!schemaRecord) {
          if (!isForce) {
            console.error(pico.red('Non-existent environment variable "' + key + '"'))
            process.exit(1)
          }
          schemaRecord = { key, value:'', schema: { message: '' } }
        }
        targetRecords.push({
          ...schemaRecord,
          value: envRecord ? envRecord.value : schemaRecord.value,
          schema: { ...schemaRecord.schema, copy: false }
        })
        continue
      }
      let setMatch = arg.match(/^([a-zA-Z0-9_\-]+)=(.*)$/)
      if (setMatch) {
        let key = setMatch[1]
        let value = setMatch[2]
        console.log('value:', value)
        let schemaRecord = schemaRecords.find(record => record.key === key)
        if (!schemaRecord) {
          if (!isForce) {
            console.error(pico.red('Non-existent environment variable "' + key + '"'))
            process.exit(1)
          }
          schemaRecord = { key, value:'', schema: { message: '' } }
        }
        targetRecords.push({
          ...schemaRecord,
          value,
          schema: { ...schemaRecord.schema, copy: true }
        })
        continue
      }
      console.error(pico.red('Invalid argument "' + arg + '"'))
      process.exit(1)
    }
  }

  // Generate prompts

  let prompts = generatePrompts(targetRecords, isForce)

  // Output informations

  if (!prompts.length && isExist) {
    console.info('\n' + pico.bold(envFileName) + pico.green(' file is up to date.') + '\n')
    return
  }

  let skips = prompts.filter(prompt => prompt.skip)
  let inputs= prompts.filter(prompt => !prompt.skip)

  console.info('')
  console.info('       ' + pico.dim('Enput'))
  console.info('')
  if (isExist) {
    console.info('Generate : ' + pico.bold(envFileName))
  } else {
    console.info('Update   : ' + pico.bold(envFileName))
  }
  console.info('Base     : ' + schemaFileName)
  skips.length  && console.info('Skip     : ' + skips.length)
  inputs.length && console.info('Input    : ' + inputs.length)
  console.info('')

  // Input prompts

  let inputedRecords = []
  if (prompts.length) {
    if (inputs.length && inputs[0].header) {
      inputs[0].header = inputs[0].header.slice(1)
    }
    
    try {
      const response = await prompt(prompts)

      Object.keys(response).forEach(key => {
        let record = targetRecords.find(record => record.key === key)
        inputedRecords.push({ ...record, value: response[key] })
      })
    } catch(_) {
      console.error('\n' + pico.red('cancelled.') + '\n')
      process.exit(1)
    }

    if (inputs.length) {
      console.info('')
    }
  }

  // Merge old env and inputed env

  let newRecords = [...envRecords]
  for (let inputedRecord of inputedRecords) {
    let index = newRecords.findIndex(record => record.key === inputedRecord.key)
    if (index >= 0) {
      newRecords.splice(index, 1, inputedRecord)
    } else {
      newRecords.push(inputedRecord)
    }
  }

  // sort

  let schemaLastLine = schemaRecords.length ? schemaRecords[schemaRecords.length - 1].endLine : 1
  newRecords.sort((aNewRecord, bNewRecord) => {
    let aSchemaRecord = schemaRecords.find(record => record.key === aNewRecord.key) || { startLine: 0 }
    let bSchemaRecord = schemaRecords.find(record => record.key === bNewRecord.key) || { startLine: 0 }
    return (aSchemaRecord ? aSchemaRecord.startLine : (schemaLastLine + aSchemaRecord.startLine)) - (bSchemaRecord ? bSchemaRecord.startLine : (schemaLastLine + bSchemaRecord.startLine))
  })

  // Deparse env file

  let spaceMap = new Map(schemaRecords.map((record, i) => [record.key, schemaRecords[i + 1] ? schemaRecords[i + 1].startLine - record.endLine : 1]))
  let newText = newRecords.map(record => deparse(record) + '\n'.repeat(spaceMap.get(record.key) || 1)).join('')

  // Write env file
  fs.writeFileSync(envFileName, newText)

  if (isExist) {
    console.info(pico.bold(envFileName) + pico.green(' file is updated!'))
  } else {
    console.info(pico.bold(envFileName) + pico.green(' file is generated!'))
  }
  console.info('')
}