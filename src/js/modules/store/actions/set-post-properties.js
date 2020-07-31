import { action } from 'easy-peasy'

const setPostProperties = action((state, properties) => {
  const newProperties = { ...state.post.properties, ...properties }
  state.post.properties = newProperties
})

export default setPostProperties
