
const TRAILING_SLASH = /\/$/
const FIRST_SLASH = /^\//
const PARAM_PATTERN = /\/:[a-zA-Z0-9]+/g

export default class RouteSystem {
  static hasFirstSlash (input) {
    return FIRST_SLASH.test(input)
  }

  static hasTrailingSlash (input) {
    return TRAILING_SLASH.test(input)
  }

  static ensureFirstSlash (input) {
    if (RouteSystem.hasFirstSlash(input)) return input
    return `/${input}`
  }

  static ensureTrailingSlash (input) {
    if (RouteSystem.hasTrailingSlash(input)) return input
    return `${input}/`
  }

  static removeFirstSlash (input) {
    if (!RouteSystem.hasFirstSlash(input)) return input
    return input.replace(FIRST_SLASH, '')
  }

  static removeTrailingSlash (input) {
    return input.replace(TRAILING_SLASH, '')
  }

  static toBasename (input) {
    const slashes = input.match(/\//g)
    if (slashes.length >= 2) {
      const basename = RouteSystem.removeFirstSlash(input).split('/')[0]
      return `/${basename}`
    } else {
      const basename = RouteSystem.removeFirstSlash(input)
      return `/${basename}`
    }
  }

  static toRegex (url) {
    let u = url === '/' ? '^(?:(\\?[^#]+))?/?$' : '^' + url + '(?:(\\?[^#]+))?/?$'
    let hasParam = false
    if (PARAM_PATTERN.test(url)) {
      hasParam = true
      const urlArray = url.match(PARAM_PATTERN)
      urlArray.forEach(p => {
        const param = p.replace('/:', '')
        u = u.replace(p, `(?:/(?<${param}>[^/#\\?]+?))`)
      })
    } else {
      hasParam = false
    }
    return {
      regexp: new RegExp(u, 'i'),
      params: hasParam
    }
  }
}
