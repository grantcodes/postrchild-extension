import a from './a'
import mention from './mention'

// Mention before a so that the recognizer is run first.
export default [mention, a]
