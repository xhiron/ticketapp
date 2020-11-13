import Axios from "axios"
import { useState } from "react"

export default ({ url, method, body, onSuccess }) => {
  const [errors, setErrors] = useState(null)
  const doRequest = async (props = {}) => {
    try {
      setErrors(null)
      const response = await Axios[method](url, {
        ...body,
        ...props,
      })
      if (onSuccess) {
        onSuccess(response.data)
      }
      return response.data
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {err.response.data.error.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      )
    }
  }
  return { doRequest, errors }
}
