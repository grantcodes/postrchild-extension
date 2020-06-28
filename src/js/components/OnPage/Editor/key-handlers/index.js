import onEnter from './enter'
import onBackspace from './backspace'
import onSpace from './space'
import shortcutHandler from './shortcuts'
import autoSuggest, { hoc } from './autosuggest'

/**
 * On key down, check for our specific key shortcuts.
 *
 * @param {Event} event
 */
const keyHandler = ({ editor }) => (event) => {
  shortcutHandler({ editor, event })
  autoSuggest({ event, editor })
}

const withShortcuts = (editor) => {
  editor = hoc(editor)
  editor = onSpace(editor)
  editor = onBackspace(editor)
  editor = onEnter(editor)

  return editor
}

export { withShortcuts, keyHandler }
