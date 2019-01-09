import React from 'react'
import styled from 'styled-components'
import { theme } from '../../../Theme'

const Item = styled.li`
  display: block;
  padding: 0.3em 1em;
  cursor: pointer;
  border-bottom: 1px solid rgba(0, 0, 0, 0.07);

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background: ${theme.colors.blue};
    color: ${theme.colors.white};
  }
`

class SuggestionItem extends React.Component {
  onClick = e => {
    this.props.closePortal()
    const { editor, suggestion, appendSuggestion } = this.props
    appendSuggestion(suggestion, editor)
  }

  onMouseEnter = () => this.props.setSelectedIndex(this.props.index)

  render = () => (
    <Item
      className={
        this.props.index === this.props.selectedIndex ? 'selected' : undefined
      }
      onClick={this.onClick}
      onMouseEnter={this.onMouseEnter}
    >
      {this.props.suggestion.suggestion}
    </Item>
  )
}

export default SuggestionItem
