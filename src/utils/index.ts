function returnPropertyEntry(arr: string[]): [string, string | undefined] {
  if (!Array.isArray(arr)) return ['', undefined]

  let propertyName = ''
  let propertyVal = undefined
  arr.forEach(function (val, index) {
    if (val.includes('name=')) {
      propertyName = arr[index].split('name=')[1]
      propertyVal = arr[index + 1]
    }
  })

  return [propertyName, propertyVal]
}

function returnFileEntry(arr: string[]): [string, string | undefined] {
  if (!Array.isArray(arr)) return ['', undefined]

  let fileName = ''
  let file = undefined
  arr.forEach(function (val, index) {
    if (val.includes('filename=')) {
      fileName = arr[index].split('filename=')[1]
    }
    if (val.toLowerCase().includes('content-type')) {
      file = arr[index + 1]
    }
  })
  return [fileName, file]
}

function isFile(part: string[]): boolean {
  if (!Array.isArray(part)) return false

  let filenameFound = false
  let contentTypeFound = false
  part.forEach(function (val, index) {
    if (val.includes('filename=')) {
      filenameFound = true
    }
    if (val.toLowerCase().includes('content-type')) {
      contentTypeFound = true
    }
  })
  part.forEach(function (val, index) {
    if (!val.length) {
      part.splice(index, 1)
    }
  })
  if (filenameFound && contentTypeFound) {
    return !!part
  } else {
    return false
  }
}

function isProperty(part: string[]): boolean {
  if (!Array.isArray(part)) return false

  let propertyNameFound = false
  let filenameFound = false
  part.forEach(function (val, index) {
    if (val.includes('name=')) {
      propertyNameFound = true
    }
  })
  part.forEach(function (val, index) {
    if (val.includes('filename=')) {
      filenameFound = true
    }
  })
  part.forEach(function (val, index) {
    if (!val.length) {
      part.splice(index, 1)
    }
  })
  if (propertyNameFound && !filenameFound) {
    return !!part
  } else {
    return false
  }
}

export { returnPropertyEntry, returnFileEntry, isFile, isProperty }
