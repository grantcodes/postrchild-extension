import React from 'react'
// import emojiKeywords from 'emojis-keywords'
// import emojiList from 'emojis-list'
import SuggestionsPlugin from './slate-suggestions/index'
import { blocks } from './elements/index'

// const users = [
//   {
//     key: 'jon-snow',
//     value: '@Jon Snow',
//     suggestion: '@Jon Snow', // Can be string or react component
//   },
// ]

// const mentionsPlugin = SuggestionsPlugin({
//   trigger: '@',
//   capture: /@([\w]*)/,
//   suggestions: users,
//   onEnter: (suggestion, editor) => {
//     // Modify your state up to your use-cases
//     return null
//   },
// })

// This sort of works but it is really slow and shows all color variations and stuff. Want to make something smarter
// const emoji = emojiList.map((icon, i) => ({
//   key: emojiKeywords[i],
//   value: emojiKeywords[i],
//   suggestion: icon,
// }))

// const emojiPlugin = SuggestionsPlugin({
//   trigger: ':',
//   capture: /:([\w]*)/,
//   suggestions: emoji,
//   onEnter: (suggestion, editor) => {
//     const { anchorText, selection } = editor.value
//     const { offset } = selection.anchor

//     const text = anchorText.text

//     let index = { start: offset - 1, end: offset }

//     if (text[offset - 1] !== ':') {
//       const spaceIndex = text.substring(0, index.end).lastIndexOf(' ')
//       if (spaceIndex > -1) {
//         console.log('setting index to ', spaceIndex)
//         index.start = spaceIndex + 1
//       } else {
//         console.log('setting index to 0')
//         index.start = 0
//       }
//     }

//     const newText = `${text.substring(0, index.start)}${suggestion.suggestion} `

//     return editor
//       .deleteBackward(offset)
//       .insertText(newText)
//       .focus()
//   },
// })

const blockSuggestions = []
for (const blockKey in blocks) {
  if (blocks.hasOwnProperty(blockKey) && blocks[blockKey].icon) {
    const block = blocks[blockKey]
    blockSuggestions.push({
      key: blockKey,
      value: block.name,
      suggestion: (
        <span>
          {block.icon} {block.name}
        </span>
      ),
    })
  }
}

const blockPlugin = SuggestionsPlugin({
  trigger: '/',
  capture: /\/([\w]*)/,
  suggestions: blockSuggestions,
  startOfParagraph: true,
  onEnter: (suggestion, editor) => {
    const block = blocks[suggestion.key]
    const { anchorText } = editor.value
    // TODO: Delete current block
    editor.deleteBackward(anchorText.text.length)
    editor.unwrapBlock(block.name)
    return block.onButtonClick(editor)
  },
})

export default [blockPlugin]
