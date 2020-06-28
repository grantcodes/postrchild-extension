import isHotkey from 'is-hotkey'
import { toggleMark } from '../helpers'

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

/**
 * On key down, check for our specific key shortcuts.
 *
 * @param {Event} event
 */
const shortcutHandler = ({ editor, event }) => {
  for (const hotkey in HOTKEYS) {
    if (isHotkey(hotkey, event)) {
      event.preventDefault()
      const mark = HOTKEYS[hotkey]
      return toggleMark(editor, mark)
    }
  }

  if (
    editor.postrChild &&
    editor.postrChild.submit &&
    isHotkey('ctrl+enter', event)
  ) {
    event.preventDefault()
    editor.postrChild.submit()
  }
}

export { HOTKEYS }
export default shortcutHandler
