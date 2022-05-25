
import nodePath from 'path'
import NeuPack from 'neupack'

const SLASH = nodePath.sep
const EXT_REGEX = /(\.[a-z0-9-]+)?(\.[a-z0-9-]+)$/i
const DOTFILE_PATTERN = /^\./
const FILE_PATTERN = /([^/\\.]*)(\.[a-z0-9-]+)?(\.[a-z0-9-]+)$/i
const FILE_REGEX_SUBEXT = new RegExp(`([^${SLASH}.]*)(\\.[a-z0-9-]+)(\\.[a-z0-9-]+)$`, 'i')
const FILE_REGEX_EXT = new RegExp(`([^${SLASH}.]*)(\\.[a-z0-9-]+)$`, 'i')
const FILE_REGEX_NOEXT = new RegExp(`([^${SLASH}]*)$`, 'i')
const LAST_SLASH = new RegExp(`${SLASH}$`)
const FIRST_SLASH = new RegExp(`^${SLASH}`)
const ANY_SLASH = new RegExp(`${SLASH}`)

// FileOperative
export default class FO {
  static isDot (path) {
    if (ANY_SLASH.test(path)) {
      const arr = path.split(SLASH)
      const lastIndex = arr.length - 1
      return DOTFILE_PATTERN.test(arr[lastIndex])
    } else {
      return DOTFILE_PATTERN.test(path)
    }
  }

  static ensureLastSlash (input) {
    if (LAST_SLASH.test(input)) return input
    return input + SLASH
  }

  static removeFirstSlash (input) {
    if (FIRST_SLASH.test(input)) return input.replace(FIRST_SLASH, '')
    return input
  }

  static join (...args) {
    const { length } = args
    const lastIndex = length - 1
    const paths = NeuPack.map(args, (el, i) => {
      if (i === lastIndex) return FO.removeFirstSlash(el)
      if (i === 0) return FO.ensureLastSlash(el)
      return FO.ensureLastSlash(FO.removeFirstSlash(el))
    })
    return paths.join('')
  }

  static extname (input) {
    if (FO.isDot(input)) return null
    const matches = input.match(EXT_REGEX) || []
    return matches[2] || null
  }

  static ext (input) {
    if (FO.isDot(input)) return { subname: null, name: null }
    const matches = input.match(EXT_REGEX)
    return {
      subext: matches && matches[2] ? matches[1] : null,
      ext: matches && matches[1] ? matches[2] : null
    }
  }

  static filename (input) {
    const matches = input.match(FILE_PATTERN)
    return matches
  }

  static file (path) {
    if (ANY_SLASH.test(path)) {
      const paths = path.split(SLASH)
      const lastIndex = paths.length - 1
      const file = paths[lastIndex]
      return file
    } else {
      return path
    }
  }

  static stats (path) {
    const file = FO.file(path)
    const isDot = FO.isDot(file)
    if (FILE_REGEX_SUBEXT.test(file)) {
      const matches = file.match(FILE_REGEX_SUBEXT)
      return {
        isDot,
        path: path,
        name: matches[1] || null,
        ext: matches[3] || null,
        subext: matches[2] || null
      }
    }
    if (FILE_REGEX_EXT.test(file)) {
      const matches = file.match(FILE_REGEX_EXT)
      return {
        isDot,
        path: path,
        name: matches[1] || null,
        ext: matches[2] || null,
        subext: null
      }
    }
    const matches = file.match(FILE_REGEX_NOEXT)
    return {
      isDot,
      path: path,
      name: matches[1] || null,
      ext: null,
      subext: null
    }
  }
}
