import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'

// continued
export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      exports: 'named',
      sourcemap: true,
      strict: false
    }
  ],
  plugins: [
    typescript()
  ],
  external: [
    'react',
    'react-dom',
    '@mui/material/Box',
    '@mui/material/Backdrop',
    '@mui/material/Modal',
    '@mui/material/Fade',
    '@mui/material/Button',
    '@mui/material/TextField',
    '@mui/material/Typography',
    '@mui/material/Divider',
    '@mui/material/CircularProgress'
  ]
}