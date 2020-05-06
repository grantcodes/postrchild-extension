import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  display: block;
  margin: auto;

  path {
    fill: ${(props) => props.theme.colors.main};
  }
`

const Spinner = (props) => (
  <Container {...props}>
    <svg
      x="0"
      y="0"
      width="30"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
      enableBackground="new 0 0 50 50"
      viewBox="0 0 50 50"
    >
      <path d="M43.935 25.145c0-10.318-8.364-18.683-18.683-18.683-10.318 0-18.683 8.365-18.683 18.683h4.068c0-8.071 6.543-14.615 14.615-14.615s14.615 6.543 14.615 14.615h4.068z">
        <animateTransform
          attributeName="transform"
          attributeType="xml"
          dur="0.6s"
          from="0 25 25"
          repeatCount="indefinite"
          to="360 25 25"
          type="rotate"
        ></animateTransform>
      </path>
    </svg>
  </Container>
)

export default Spinner
