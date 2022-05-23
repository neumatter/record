
# Record

Module for scanning file directories. Can configure automatic routes with middleware.

<br />

# Table of Contents
1. [ Install ](#install) <br />
2. [ Usage ](#examples) <br />

<br />

<a name="install"></a>
## Install

```console
npm i @neumatter/record 
```

<br />

<a name="examples"></a>
## Usage


### Scan Directory:

```js
import Record from '@neumatter/record'
import nodePath from 'path'

const record = await Record.build({
  path: nodePath.resolve('./')
})

// Returns 
const NeuRecord = {
  path: '/Users/dev/example',
  basepath: '/',
  name: '',
  previous: null,
  files: [
    {
      path: '/Users/dev/example/session.js',
      basepath: '/',
      container: 'routes',
      isDot: false,
      name: 'session',
      ext: '.js',
      subext: null,
      customName: null
    },
    {
      path: '/Users/dev/example/nextdir/index.js',
      basepath: '/nextdir',
      container: 'nextdir',
      isDot: false,
      name: 'index',
      ext: '.js',
      subext: null,
      customName: ''
    }
  ],
  middleware: [],
  subrecords: [],
  map: {
    profile: {
      path: '/Users/dev/example/nextdir',
      name: 'profile',
      files: ['Array'],
      subrecords: {}
    }
  },
  cwd: '/Users/dev/example'
}
```


### Methods of Result:

```js
import Record from '@neumatter/record'
import nodePath from 'path'

const record = await Record.build({
  path: nodePath.resolve('./')
})

// returns Array<modules>
const modules = await record.importModules('default')

// imports Array<module.default> and calls the callback on each module
await record.autoRoutes((router) => {
  const { path, module, middleware } = router
  if (middleware) {
    app.use(path, middleware, module)
  } else {
    app.use(path, module)
  }
})
```


### Options:

```js
import Record from '@neumatter/record'

// default options
const record = await Record.build({
  path: process.cwd(),
  basepath: '/',
  name: '',
  middleware: false,
  ignore: [
    '.git',
    'node_modules'
  ],
  allow: [
    '.js',
    '.mjs',
    '.cjs'
  ],
  ignoreDots: true,
  mergeFiles: true,
  replacer: [
    {
      key: 'index',
      value: ''
    }
  ]
})
```
