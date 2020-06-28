import { useState, useEffect } from 'react'
import micropub from '../../../../modules/micropub'
import notification from '../../../../modules/notification'
import logger from '../../../../modules/logger'

const useMicropubUpload = (file = null) => {
  const [status, setStatus] = useState(null)
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!status && file) {
      logger.log('Posting to media endpoint')
      setStatus('uploading')
      // Use file as url while uploading
      // TODO: Rotate image based on exif
      const fileUrl = URL.createObjectURL(file)
      setUrl(fileUrl)
      micropub
        .postMedia(file)
        .then((createdUrl) => {
          logger.log('Upload successful', createdUrl)
          if (createdUrl) {
            setUrl(createdUrl)
          }
        })
        .catch((err) => {
          logger.error('Error uploading file', err)
          notification({ message: 'Error uploading file' })
        })
        .finally(() => {
          setStatus('done')
        })
    }
  }, [file])

  return { uploading: status === 'uploading', url }
}

export default useMicropubUpload
