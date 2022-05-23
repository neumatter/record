
import NeuPack from "neupack"

declare module 'code-batch'

declare interface Replacer {
  key: string,
  value: any
}

declare interface SpecOptions {
  name?: string
  path?: string
  basepath?: string
  replacers?: Array<Replacer>
}

declare class Spec {
  constructor (options: SpecOptions): Spec
  path: string
  basepath: string
  container: string
  isDot: boolean
  name: string
  ext: string
  subext: string
  customName: string

  async import: (label?: string) => Promise<any>
  async isRecord: () => Promise<boolean>
  toRoutePath: () => string
}

declare interface NeuRecordOptions {
  ignore?: Array<string>,
  allow?: Array<string>,
  replacer?: Array<Replacer>,
  ignoreDots?: boolean,
  mergeFiles?: boolean,
  middleware?: boolean,
  path?: string,
  basepath?: string,
  name?: string,
  previous?: string
}

declare interface AutoRoutesResult {
  path: string
  module: any
  middleware: any
}

declare class NeuRecord {
  constructor (options: NeuRecordOptions): NeuRecord

  private #ignoreDots: boolean
  private #mergeFiles: boolean
  private #ignore: Array<string>
  private #allow: Array<string>
  private #replacer: Array<Replacer>
  private #useMiddleware: boolean
  path: string
  basepath: string
  name: string
  previous: string
  files: Array<Spec>
  middleware?: Array<Spec>
  subrecords: Array<NeuRecord>
  map: NeuPack
  cwd: string

  shouldIgnore: (input: Spec) => boolean
  private #step: (spec: Spec) => Promise<'ignore' | 'record' | 'file'>
  isRecord: (input: string) => Promise<boolean>
  find: (callback: (spec: Spec) => any) => Promise<Array<Spec>>
  importModules: (exp?: string, callback?: (module: any, spec: Spec) => any) => Promise<Array<any>>
  traverse: () => Promise<void>
  static build: (options: NeuRecordOptions) => Promise<NeuRecord>
  autoRoutes: (callback: (result: AutoRoutesResult) => any) => Promise<void>
}

export = NeuRecord