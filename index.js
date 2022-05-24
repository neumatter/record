
import fsp from 'fs/promises'
import NeuPack from 'neupack'
import Spec from './lib/spec.js'

const defaultAllow = ['.js', '.mjs', '.cjs']
const defaultIgnore = ['.git', 'node_modules']
const defaultReplacer = [{ key: 'index', value: '' }]

export default class NeuRecord {
  #ignoreDots
  #mergeFiles
  #ignore
  #allow
  #replacer
  #useMiddleware
  constructor ({
    ignore = null,
    allow = null,
    replacer = null,
    ignoreDots = true,
    mergeFiles = true,
    middleware = false,
    path = process.cwd(),
    basepath = '/',
    name = '',
    previous = null
  }) {
    if (ignore) defaultIgnore.push(...ignore)
    if (allow) defaultAllow.push(...allow)
    if (replacer) defaultReplacer.push(...replacer)
    this.#ignoreDots = ignoreDots
    this.#mergeFiles = mergeFiles
    this.#ignore = defaultIgnore
    this.#allow = defaultAllow
    this.#replacer = defaultReplacer
    this.#useMiddleware = middleware
    this.path = path
    this.basepath = basepath
    this.name = name
    this.previous = previous
    this.files = []
    if (this.#useMiddleware) this.middleware = []
    this.subrecords = []
    this.map = new NeuPack({ id: 'name' })
    this.cwd = process.cwd()
  }

  shouldIgnore (input) {
    if (this.#ignoreDots) {
      return this.#ignoreDots
        ? input.match(/^\./) || this.#ignore.includes(input)
        : this.#ignore.includes(input)
    }
  }

  async #step (spec) {
    if (this.shouldIgnore(spec.name)) return 'ignore'
    if (await spec.isRecord()) return 'record'
    if (spec.ext && this.#allow.includes(spec.ext)) return 'file'
    return 'ignore'
  }

  async isRecord (input) {
    return (await fsp.stat(input)).isDirectory()
  }

  async find (callback) {
    const output = []
    const search = async (record) => {
      await NeuPack.all(record.files, async (spec) => {
        if (callback(spec)) return output.push(spec)
        return null
      })
      await NeuPack.all(record.subrecords, search)
    }
    await search(this)
    return output
  }

  async importModules (exp, callback) {
    const output = []
    await NeuPack.all(this.files, async spec => {
      const module = exp ? await spec.import(exp) : await spec.import()
      const result = callback ? callback(module, spec) : module
      output.push(result)
    })
    return output
  }

  async readdir () {
    const specs = await fsp.readdir(this.path)

    await NeuPack.all(specs, async specname => {
      const spec = new Spec({
        name: specname,
        path: this.path,
        basepath: this.basepath,
        replacers: this.#replacer
      })
      const nextStep = await this.#step(spec)
      if (nextStep === 'record') {
        this.subrecords.push(spec)
      } else if (nextStep === 'file') {
        if (this.#useMiddleware && spec.name === '_middleware') {
          this.middleware.push(spec)
        } else {
          this.files.push(spec)
          return spec
        }
      }
    })
  }

  async traverse () {
    const specs = await fsp.readdir(this.path)

    await NeuPack.all(specs, async specname => {
      const spec = new Spec({
        name: specname,
        path: this.path,
        basepath: this.basepath,
        replacers: this.#replacer
      })
      const nextStep = await this.#step(spec)
      if (nextStep === 'record') {
        const record = await NeuRecord.build({
          path: spec.path,
          name: spec.name,
          basepath: spec.toRoutePath(),
          previous: this.name,
          middleware: this.#useMiddleware
        })
        if (record.files.length || record.subrecords.length) {
          this.map.post({
            path: record.path,
            name: record.name,
            files: record.files,
            subrecords: record.map
          })
          if (this.#useMiddleware) {
            this.middleware.push(...record.middleware)
          }
          return (
            this.#mergeFiles
              ? this.files.push(...record.files)
              : this.subrecords.push(record)
          )
        }
      } else if (nextStep === 'file') {
        if (this.#useMiddleware && spec.name === '_middleware') {
          this.middleware.push(spec)
        } else {
          this.files.push(spec)
          return spec
        }
      }
    })
  }

  static async build (options) {
    if (!options) {
      const cwd = process.cwd()
      const specs = await fsp.readdir(cwd)
      if (specs.includes('record.config.js')) {
        const spec = new Spec({
          name: 'record.config.js',
          path: cwd
        })
        options = await spec.import('default')
      } else {
        throw new Error('No options were supplied to NeuRecord directly or through a config file in cwd.')
      }
    }
    const record = new NeuRecord(options)
    await record.traverse()
    return record
  }

  static async readdir (options) {
    const record = new NeuRecord(options)
    await record.readdir()
    return record
  }

  async autoRoutes (callback) {
    const routers = await NeuPack.all(this.files, async spec => {
      const module = await spec.import('default')
      const result = { path: spec.toRoutePath(), module, middleware: null }
      if (this.#useMiddleware && this.middleware.length) {
        await NeuPack.all(this.middleware, async middleware => {
          const testMw = new RegExp(middleware.path.replace('/_middleware.js', ''))
          if (testMw.test(spec.path)) {
            const mw = await middleware.import('default')
            result.middleware = mw
          }
        })
      }
      return result
    })
    NeuPack.each(routers, router => {
      callback(router)
    })
  }
}
