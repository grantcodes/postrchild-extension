import { useState } from 'react'
import micropub from '../modules/micropub'
import notification from '../modules/notification'

const usePostNodeMedia = ({ node, editor }) => {
  const [url, setUrl] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const file = node.data.get('file')
  if (file && !url && !uploading) {
    setUploading(true)
    micropub
      .postMedia(file)
      .then((fileUrl) => {
        setUploading(false)
        let data = node.data.toJS()
        delete data.file
        data.src = fileUrl
        editor.setNodeByKey(node.key, { data })
        setUrl(fileUrl)
      })
      .catch((err) => {
        setUploading(false)
        console.error('[Error uploading file]', err)
        notification({ message: 'Error uploading file' })
        setError(err)
      })
  }

  return { uploading, url, error }
}

export default usePostNodeMedia
