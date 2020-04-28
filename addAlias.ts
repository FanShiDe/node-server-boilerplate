import moduleAlias from 'module-alias'
import path from 'path'

export default () => {
  moduleAlias.addAliases({
    '@lib': path.join(__dirname, 'src/lib'),
    '@controller': path.join(__dirname, 'src/app/controller'),
    '@middleware': path.join(__dirname, 'src/app/middleware'),
    '@model': path.join(__dirname, 'src/app/model'),
    '@constants': path.join(__dirname, 'src/constants'),
  })
}
