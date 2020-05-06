import { useState, useEffect } from 'react'
import micropub from '../../../../modules/micropub'
import notification from '../../../../modules/notification'

const useMicropubUpload = (file = null) => {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    const upload = async () => {
      try {
        setUploading(true)
        console.log('Posting to media endpoint')
        // const fileUrl = await micropub.postMedia(file)
        // TODO: Rotate image based on exif
        const fileUrl = URL.createObjectURL(file)
        setUrl(fileUrl)
      } catch (err) {
        notification({ message: 'Error uploading file' })
        console.error('Error uploading file', err)
      }
      setUploading(false)
    }

    if (file) {
      upload()
    }
  }, [file])

  return { uploading, url }
}

export default useMicropubUpload
