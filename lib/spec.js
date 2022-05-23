
import fsp from 'fs/promises'
import is from '@neumatter/is'
import NeuPack from 'neupack'
import rs from './route-system.js'
import fo from './file-operative.js'

const replacer = (name, basepath, arr) => {
  let customName = null
  NeuPack.each(arr, ({ key, value }) => {
    if (key === name) {
      customName = is.function(value) ? value(name, basepath) : value
    }
  })
  return customName
}

export default class Spec {
  constructor ({ name = null, path = null, basepath = null, replacers = null }) {
    this.path = !name
      ? path
      : fo.join(path, name)
    this.basepath = basepath || '/'
    const stats = fo.stats(this.path)
    const rmatch = path.match(/([^/\\.]*)$/) || null
    this.container = rmatch && rmatch[1] ? rmatch[1] : null
    console.log(fo.stats(this.path))
    this.isDot = stats.isDot
    this.name = stats.name || name
    this.ext = stats.ext || null
    this.subext = stats.subext || null
    this.customName = replacers ? replacer(this.name, this.basepath, replacers) : null
  }

  async import (label) {
    return label ? (await import(this.path))[label] : await import(this.path)
  }

  async isRecord () {
    return (await fsp.stat(this.path)).isDirectory()
  }

  toRoutePath () {
    console.log(this.basepath)
    const customName = this.customName && is.string(this.customName)
      ? rs.ensureFirstSlash(this.customName)
      : this.customName || null
    if (this.name === 'index') {
      return this.basepath
    }
    return customName || rs.removeTrailingSlash(this.basepath) + '/' + this.name
  }
}
