import React from 'react'
import styled from 'styled-components'

const SuggestList = styled.ol`
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  background-color: ${(props) => props.theme.colors.background};
  font-size: 12px;
  max-height: 300px;
  width: 200px;
  max-width: 100vw;
  border-radius: 4px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: ${(props) => props.theme.colors.alt} transparent;
  /* border: 1px solid ${(props) => props.theme.colors.main}; */
  box-shadow: 0 0 4px rgba(0,0,0,.1);

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: ${(props) => props.theme.colors.alt};
    border-radius: 0 4px 4px 0;
  }

  &::-webkit-scrollbar-thumb {
    background-color: ${(props) => props.theme.colors.main};
    border-radius: 2px;
    /* border-radius: 0 4px 4px 0 ; */
  }
`

const SuggestItem = styled.li`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  overflow: hidden;
  padding: 0.5em 1em;
  text-overflow: ellipsis;
  line-height: 1.1;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  color: ${(props) =>
    props.selected ? props.theme.colors.background : props.theme.colors.text};
  background-color: ${(props) =>
    props.selected ? props.theme.colors.main : props.theme.colors.background};
  transition: color 0.1s, background-color 0.1s;
  cursor: pointer;

  &:last-child {
    border-bottom: none;
  }

  // TODO: Make hover style different to focus style
  &:hover {
    color: ${(props) => props.theme.colors.background};
    background-color: ${(props) => props.theme.colors.main};
  }
`

const SuggestIcon = styled.span`
  line-height: 1;
  display: block;
  text-align: center;
  margin-right: 8px;
  min-width: 16px;
`

const AutoSuggester = ({ suggestions, onSelect, selectedIndex }) => (
  <SuggestList>
    {suggestions.map((selection, i) => (
      <SuggestItem
        key={`suggest-item-${i}`}
        selected={selectedIndex === i}
        onClick={(e) => {
          // TODO: This doesn't work - I think because the main editor becomes unfocused on the click event.
          // e.stopPropagation()
          // e.nativeEvent.stopImmediatePropagation()
          // console.log('stopped propagation')
          // onSelect({ selection })
        }}
      >
        <SuggestIcon>{selection.icon}</SuggestIcon>
        <span>{selection.text}</span>
      </SuggestItem>
    ))}
  </SuggestList>
)

export default AutoSuggester
