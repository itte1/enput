export function deparse(record) {
  let valueText
  if (record.quart) {
    valueText = record.quart + record.value + record.quart
  } else {
    if (requireQuart(record.value)) {
      valueText = '"' + record.value + '"'
    } else {
      valueText = record.value
    }
  }

  return record.originalComment + record.originalKey + valueText
}

function requireQuart(value) {
  return value.includes('\n') || value.includes('\\n')
}