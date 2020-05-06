import React from 'react'
import styled from 'styled-components'
// import emojiKeywords from 'emojis-keywords'
// import emojiList from 'emojis-list'
import SuggestionsPlugin from './slate-suggestions/index'
import { blocks } from './elements/index'

const Mention = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-content: center;
  white-space: nowrap;

  img {
    display: block;
    margin-right: 10px;
    width: 24px;
    height: 24px;
    object-fit: contain;
    object-position: center;
    flex-grow: 0;
    flex-shrink: 0;
  }

  span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

function getInput(value, regex = /([\w]*)/) {
  if (!value.startText) {
    return null
  }
  const startOffset = value.selection.start.offset
  const textBefore = value.startText.text.slice(0, startOffset)
  const result = regex.exec(textBefore)
  return result === null ? null : result[1]
}

const getHCards = async () => {
  const res = await fetch('https://indieweb-directory.glitch.me/api/hcards')
  const cards = await res.json()
  return cards
}

const getMentionSuggestions = async () => {
  const hCards = await getHCards()
  const users = hCards.map((hCard, i) => ({
    hCard,
    key: `hcard-${i}`,
    value: `${hCard.properties.name[0]} ${hCard.properties.url[0]}`,
    suggestion: (
      <MentionPreview
        name={hCard.properties.name[0]}
        photo={hCard.properties.photo[0]}
      />
    ),
  }))
  return users
}

const MentionPreview = ({ name, photo }) => (
  <Mention>
    <img width={24} height={24} src={photo} />
    <span>{name}</span>
  </Mention>
)

const mentionsPlugin = SuggestionsPlugin({
  trigger: '@',
  capture: /@([\w]*)/,
  suggestions: async (search) => {
    const users = await getMentionSuggestions()
    return search
      ? users.filter((user) =>
          user.value.toLowerCase().includes(search.toLowerCase())
        )
      : users
  },
  onEnter: (suggestion, editor) => {
    const value = editor.value
    const inputValue = getInput(value, /@([\w]*)/)

    // Delete the captured value, including the `@` symbol
    editor.deleteBackward(inputValue ? inputValue.length + 1 : 1)

    return editor
      .insertInline({
        object: 'inline',
        type: 'mention',
        data: {
          hCard: suggestion.hCard,
        },
      })
      .moveToStartOfNextText()
      .focus()
  },
})

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
//         index.start = spaceIndex + 1
//       } else {
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
  if (blocks.hasOwnProperty(blockKey) && blocks[blockKey].showIcon) {
    const block = blocks[blockKey]
    blockSuggestions.push({
      key: blockKey,
      value: block.name,
      keywords: block.keywords,
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
  suggestions: (search) =>
    search
      ? blockSuggestions.filter((block) => {
          if (!block.keywords) {
            return false
          }
          return block.keywords.find((keyword) =>
            keyword.toLowerCase().includes(search.toLowerCase())
          )
        })
      : blockSuggestions,
  startOfParagraph: true,
  onEnter: (suggestion, editor) => {
    const block = blocks[suggestion.key]
    const { anchorText } = editor.value
    editor.deleteBackward(anchorText.text.length)
    editor.unwrapBlock(block.name)
    return block.onButtonClick(editor)
  },
})

export default [blockPlugin, mentionsPlugin]
