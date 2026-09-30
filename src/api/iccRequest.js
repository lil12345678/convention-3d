import axios from 'axios'
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus'
// import store from '@/store'
// import { getToken } from '@/utils/auth'
import { tansParams } from '@/utils/commonFunc.js'
import cache from '@/utils/cache' // 恢复必要的依赖（根据项目实际情况决定是否启用）

const errorCode = {
  400: '请求参数错误',
  401: '认证失败，无法访问系统资源',
  403: '当前操作没有权限',
  404: '访问资源不存在',
  405: '请求方法不允许（如GET/POST类型错误）',
  408: '请求超时',
  409: '资源冲突（如版本号不一致）',
  415: '不支持的媒体类型',
  500: '服务器内部错误',
  502: '网关错误（上游服务器无响应）',
  503: '服务不可用（服务器暂时维护或过载）',
  504: '网关超时（上游服务器响应超时）',
  default: '系统未知错误，请反馈给管理员',
}

axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 超时
  timeout: 5 * 60 * 1000,
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    // 是否需要设置 token
    const isToken = (config.headers || {}).isToken === false
    // 是否需要防止数据重复提交
    const isRepeatSubmit = (config.headers || {}).repeatSubmit === false

    const ICC_TOKEN = localStorage.getItem('ICC_TOKEN')
    if (ICC_TOKEN && !isToken) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    // get请求映射params参数
    if (config.method === 'get' && config.params) {
      let url = config.url + '?' + tansParams(config.params)
      url = url.slice(0, -1)
      config.params = {}
      config.url = url
    }
    if (!isRepeatSubmit && (config.method === 'post' || config.method === 'put')) {
      const requestObj = {
        url: config.url,
        data: typeof config.data === 'object' ? JSON.stringify(config.data) : config.data,
        time: new Date().getTime(),
      }
      // const localObj = cache.local.getJSON('localObj')
      // if (localObj === undefined || localObj === null || localObj === '') {
      //   cache.local.setJSON('localObj', requestObj)
      // } else {
      //   const s_url = localObj.url // 请求地址
      //   const s_data = localObj.data // 请求数据
      //   const s_time = localObj.time // 请求时间
      //   const interval = service.defaults.timeout // 间隔时间(ms)，小于此时间视为重复提交
      //   if (
      //     s_data === requestObj.data &&
      //     requestObj.time - s_time < interval &&
      //     s_url === requestObj.url
      //   ) {
      //     const message = '数据正在处理，请勿重复提交'
      //     console.warn(`[${s_url}]: ` + message + '89898')
      //     return Promise.reject(new Error(message))
      //   } else {
      //     cache.local.setJSON('localObj', requestObj)
      //   }
      // }
    }
    return config
  },
  (error) => {
    console.log(error)
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (res) => {
    // 未设置状态码则默认成功状态
    const code = res.status || 200
    // 获取错误信息
    const msg = errorCode[code] || res.data.msg || errorCode['default']
    // 二进制数据则直接返回
    if (res.request.responseType === 'blob' || res.request.responseType === 'arraybuffer') {
      return res.data
    }
    if (code === 401) {
      return Promise.reject(msg ? msg : '无效的会话，或者会话已过期。')
    } else if (code === 500) {
      ElMessage.error(msg)
      return Promise.reject(new Error(msg))
    } else if (code !== 200) {
      ElNotification.error({ title: '错误提示', message: msg })
      return Promise.reject('error')
    } else {
      return res.data
    }
  },
  (error) => {
    console.log('err' + error)
    let { message } = error
    if (message == 'Network Error') {
      message = '后端接口连接异常'
    } else if (message.includes('timeout')) {
      message = '系统接口请求超时'
    } else if (message.includes('Request failed with status code')) {
      message = '系统接口' + message.substr(message.length - 3) + '异常'
    }
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
