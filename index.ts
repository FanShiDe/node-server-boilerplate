import addAlias from './addAlias'

if (process.env.NODE_ENV !== 'development') {
  addAlias()
}

// tslint:disable-next-line: no-var-requires
require('./src/app/app')
