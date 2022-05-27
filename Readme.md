
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


### Build Record:

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

### Read Directory:

```js
import Record from '@neumatter/record'

const record = await Record.readdir({
  path: process.cwd(),
  allow: ['.json']
})

// Returns
const NeuRecord = {
  path: '/Users/dev/neujs/tests/basic',
  basepath: '/',
  name: '',
  previous: null,
  files: NeuPack {
    keys: [ '/basic/json', '/basic/neu', '/basic/record' ],
    data: {
      '/basic/json': [Spec],
      '/basic/neu': [Spec],
      '/basic/record': [Spec]
    },
    id: 'pathName'
  },
  subrecords: NeuPack {
    keys: [ '/public', '/schemas', '/server' ],
    data: {
      '/public': [NeuRecord],
      '/schemas': [NeuRecord],
      '/server': [NeuRecord]
    },
    id: 'pathName'
  },
  map: NeuPack { keys: [], data: {}, id: 'path' },
  cwd: '/Users/dev/neujs/tests/basic'
}
```


### Methods of Build:

```js
import Record from '@neumatter/record'
import nodePath from 'path'

const record = await Record.build({
  path: nodePath.resolve('./')
})

// returns Array<modules>
const modules = await record.importModules('default')

// NeuRecord.files.all: loop through files Async
await record.files.all(async spec => {
  const specModule = await spec.import('default')
  // do something with <specModule>
})

// NeuRecord.files.each: loop through files Sync
record.files.each(spec => {
  const specModule = spec.import('default')
  spec.import('default')
    .then(specModule => {
    // do something with <specModule>
    })
    .catch(err => {
      // error
    })
})

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
