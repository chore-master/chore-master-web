import { StatusEnum } from '@module/utils/constants'

class APIAgent {
  constructor(apiHost) {
    this._apiHost = apiHost
  }

  async request(path, options, callbacks) {
    let res
    try {
      res = await fetch(`${this._apiHost}${path}`, options)
    } catch (error) {
      callbacks?.onError({ res, error })
      return
    }
    if (res.status >= 500) {
      callbacks?.onFail({
        res,
        status: StatusEnum.FAILED,
        message: res.statusText,
      })
      return
    }
    if (res.headers.get('Content-Type')?.includes('application/json')) {
      const { status, data, metadata } = await res.json()
      if (status !== StatusEnum.SUCCESS) {
        callbacks.onFail &&
          callbacks.onFail({
            res,
            status,
            message: data.message,
            data,
            metadata,
          })
      } else {
        callbacks.onSuccess &&
          (await callbacks.onSuccess({ res, data, metadata }))
      }
    } else {
      const blob = await res.blob()
      callbacks.onSuccess && (await callbacks.onSuccess({ res, blob }))
    }
    return res
  }

  async get(path, { params, ...callbacks }) {
    let query = ''
    if (params) {
      query = Object.keys(params)
        .filter((k) => params[k] !== undefined && params[k] !== null)
        .map((k) => {
          const escapedKey = encodeURIComponent(k)
          let value = params[k]
          if (Array.isArray(value)) {
            return value
              .map((v) => `${escapedKey}=${encodeURIComponent(v)}`)
              .join('&')
          } else if (typeof value === 'object') {
            value = JSON.stringify(value)
          }
          const escapedValue = encodeURIComponent(value)
          return `${escapedKey}=${escapedValue}`
        })
        .join('&')
      query = `?${query}`
    }
    const res = await this.request(
      path + query,
      {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        onError: (err) => {
          console.error(err)
          alert('Something wrong happened. Service may be unavailable now.')
        },
        ...callbacks,
      }
    )
    return res
  }

  async post(path, body, callbacks) {
    const isFormData = body instanceof FormData
    let headers = {}
    if (!isFormData) {
      body = JSON.stringify(body)
      headers['Content-Type'] = 'application/json'
    }

    const res = await this.request(
      path,
      {
        method: 'POST',
        credentials: 'include',
        headers,
        body,
      },
      {
        onError: (err) => {
          console.error(err)
          alert('Something wrong happened. Service may be unavailable now.')
        },
        ...callbacks,
      }
    )
    return res
  }

  async put(path, body, callbacks) {
    const res = await this.request(
      path,
      {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
      {
        onError: (err) => {
          console.error(err)
          alert('Something wrong happened. Service may be unavailable now.')
        },
        ...callbacks,
      }
    )
    return res
  }

  async patch(path, body, callbacks) {
    const isFormData = body instanceof FormData
    let headers = {}
    if (!isFormData) {
      body = JSON.stringify(body)
      headers['Content-Type'] = 'application/json'
    }
    const res = await this.request(
      path,
      {
        method: 'PATCH',
        credentials: 'include',
        headers,
        body,
      },
      {
        onError: (err) => {
          console.error(err)
          alert('Something wrong happened. Service may be unavailable now.')
        },
        ...callbacks,
      }
    )
    return res
  }

  async delete(path, callbacks) {
    const res = await this.request(
      path,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        onError: (err) => {
          console.error(err)
          alert('Something wrong happened. Service may be unavailable now.')
        },
        ...callbacks,
      }
    )
    return res
  }
}

export default APIAgent
