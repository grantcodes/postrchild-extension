import isHotkey from 'is-hotkey'

/**
 * Get the block type for a series of auto-markdown shortcut `chars`.
 *
 * @param {String} chars
 * @return {String} block
 */

const getSpaceType = chars => {
  switch (chars) {
    case '*':
    case '-':
    case '+':
      return 'unordered-list'
    case '1':
    case '1.':
      return 'ordered-list'
    case '>':
      return 'block-quote'
    case '#':
      return 'heading-one'
    case '##':
      return 'heading-two'
    case '###':
      return 'heading-three'
    case '####':
      return 'heading-four'
    case '#####':
      return 'heading-five'
    case '######':
      return 'heading-six'
    case '```':
      return 'code-block'
    case '---':
      return 'hr'
    default:
      return null
  }
}

/**
 * On space, if it was after an auto-markdown shortcut, convert the current
 * node into the shortcut's corresponding type.
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Function} next
 */

const onSpace = (event, editor, next) => {
  const { value } = editor
  const { selection } = value
  if (selection.isExpanded) return next()

  const { startBlock } = value
  const { start } = selection
  const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '')
  const type = getSpaceType(chars)
  if (!type) return next()
  if (
    (type === 'unordered-list' || type === 'ordered-list') &&
    startBlock.type == 'list-item'
  ) {
    return next()
  }
  event.preventDefault()

  // Special handling for lists and hr
  if (type === 'hr') {
    editor
      .moveFocusToStartOfNode(startBlock)
      .delete()
      .setBlocks('hr')
      .moveToEndOfBlock()
      .insertBlock('paragraph')
    return next()
  } else if (type === 'ordered-list') {
    editor.setBlocks('list-item')
    editor.wrapBlock('ordered-list')
  } else if (type === 'unordered-list') {
    editor.setBlocks('list-item')
    editor.wrapBlock('unordered-list')
  } else {
    editor.setBlocks(type)
  }

  return editor.moveFocusToStartOfNode(startBlock).delete()
}

/**
 * On backspace, if at the start of a non-paragraph, convert it back into a
 * paragraph node.
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Function} next
 */

const onBackspace = (event, editor, next) => {
  const { value } = editor
  const { selection } = value
  if (selection.isExpanded) return next()
  if (selection.start.offset != 0) return next()

  const { startBlock } = value
  if (startBlock.type == 'paragraph') return next()

  event.preventDefault()
  editor.setBlocks('paragraph')

  if (startBlock.type == 'list-item') {
    editor.unwrapBlock('ordered-list')
    editor.unwrapBlock('unordered-list')
  }
}

/**
 * On return, if at the end of a node type that should not be extended,
 * create a new paragraph below it.
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Function} next
 */

const onEnter = (event, editor, next) => {
  const { value } = editor
  const { selection } = value
  const { start, end, isExpanded } = selection

  if (isExpanded) return next()

  const { startBlock } = value

  if (startBlock.type === 'list-item' && startBlock.text === '') {
    // The user hit enter on an empty list item so want to escape from the list
    return editor
      .moveToEndOfBlock()
      .unwrapBlock('ordered-list')
      .unwrapBlock('unordered-list')
      .setBlocks('paragraph')
  }

  if (start.offset == 0 && startBlock.text.length == 0)
    return onBackspace(event, editor, next)

  if (end.offset != startBlock.text.length) return next()

  if (
    startBlock.type != 'heading-one' &&
    startBlock.type != 'heading-two' &&
    startBlock.type != 'heading-three' &&
    startBlock.type != 'heading-four' &&
    startBlock.type != 'heading-five' &&
    startBlock.type != 'heading-six' &&
    startBlock.type != 'blockquote' &&
    startBlock.type != 'code-block'
  ) {
    return next()
  }

  event.preventDefault()
  editor.splitBlock().setBlocks('paragraph')
}

/**
 * On key down, check for our specific key shortcuts.
 *
 * @param {Event} event
 * @param {Editor} editor
 * @param {Function} next
 */
const keyHandler = (event, editor, next) => {
  if (isHotkey('mod+b', event)) {
    return editor.toggleMark('bold')
  } else if (isHotkey('mod+i', event)) {
    return editor.toggleMark('italic')
  } else if (isHotkey('mod+u', event)) {
    return editor.toggleMark('underlined')
  } else if (isHotkey('mod+`', event)) {
    return editor.toggleMark('code')
  }

  switch (event.key) {
    case ' ':
      return onSpace(event, editor, next)
    case 'Backspace':
      return onBackspace(event, editor, next)
    case 'Enter':
      return onEnter(event, editor, next)
    // This is hard when there is also ``` for code blocks
    // case '`': {
    //   console.log('start code')
    //   return next()
    // }
    // Handle ** = bold
    default:
      return next()
  }
}

export default keyHandler
