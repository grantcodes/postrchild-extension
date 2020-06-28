import { createStore, action } from 'easy-peasy'
import suggestModel from './models/suggest'
import publishPost from './actions/publish-post'
import setPostProperties from './actions/set-post-properties'

// Create a store with an initial value.
export default createStore({
  loading: false,
  suggestType: null,
  suggestIndex: 0,
  suggestSelection: null,
  target: null,
  contacts: [],
  post: {
    type: ['h-entry'],
    properties: {
      name: [''],
      content: [{ html: '' }],
      photo: [],
      'mp-slug': [],
      summary: [],
      featured: [],
      photo: [],
      'in-reply-to': [],
      'mp-syndicate-to': [],
      visibility: [],
      'post-status': [],
    },
  },
  suggest: suggestModel,
  setLoading: action((state, loading) => {
    state.loading = loading
  }),
  setContacts: action((state, contacts) => {
    state.contacts = contacts
  }),
  setPostProperties,
  publishPost,
})
