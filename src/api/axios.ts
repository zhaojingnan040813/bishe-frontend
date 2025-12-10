import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 统一错误处理
    let errorMessage = '请求失败，请稍后重试'

    if (error.response) {
      // 服务器返回错误响应
      const { status, data } = error.response

      if (data?.error?.message) {
        errorMessage = data.error.message
      } else {
        switch (status) {
          case 400:
            errorMessage = '请求参数错误'
            break
          case 404:
            errorMessage = '请求的资源不存在'
            break
          case 422:
            errorMessage = '数据验证失败'
            break
          case 500:
            errorMessage = '服务器内部错误'
            break
          case 502:
            errorMessage = 'AI接口调用失败'
            break
          case 503:
            errorMessage = '服务暂时不可用'
            break
          case 504:
            errorMessage = 'AI接口超时'
            break
          default:
            errorMessage = `请求失败 (${status})`
        }
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '网络连接失败，请检查网络'
    } else {
      // 请求配置出错
      errorMessage = error.message || '请求配置错误'
    }

    // 显示错误提示（可以集成UI库的通知组件）
    console.error('API Error:', errorMessage)

    // 将错误信息附加到error对象
    error.userMessage = errorMessage

    return Promise.reject(error)
  }
)

export default apiClient
