import { ref } from 'vue'
import { API } from '@/config'

// ========== 单例状态（所有页面共享） ==========
const userId = ref('')
const token = ref('')
const isLogin = ref(false)
const isProfileComplete = ref(false)
const phone = ref('')
const userInfo = ref({});

const STORAGE_KEY_USER_INFO = 'USER_INFO'
const STORAGE_KEY_USER_ID = 'USER_ID'
const STORAGE_KEY_USER_PHONE = 'USER_PHONE'
const STORAGE_KEY_LOGIN_TIMESTAMP = 'LOGIN_TIMESTAMP' // 登录时间戳
export const STORAGE_KEY_PROFILE_COMPLETED = 'PROFILE_COMPLETED'

// 登录有效期：30天（毫秒）
const LOGIN_EXPIRE_TIME = 30 * 24 * 60 * 60 * 1000

// 是否已初始化标识
let hasInitialized = false

/**
 * 登录状态管理（单例模式）
 * 所有页面共享同一份状态
 */
export function useAuth() {

  /**
   * 检查登录是否过期
   */
  const isLoginExpired = () => {
    try {
      const loginTimestamp = uni.getStorageSync(STORAGE_KEY_LOGIN_TIMESTAMP)
      if (!loginTimestamp) {
        return true // 没有登录时间戳，视为过期
      }
      const now = Date.now()
      const elapsed = now - loginTimestamp
      return elapsed > LOGIN_EXPIRE_TIME
    } catch (err) {
      console.warn('[Auth] isLoginExpired error', err)
      return true // 出错时视为过期
    }
  }

  /**
   * 清除登录信息（内部方法）
   */
  const clearLoginInfo = () => {
    try {
      uni.removeStorageSync(STORAGE_KEY_TOKEN)
      uni.removeStorageSync(STORAGE_KEY_USER_ID)
      uni.removeStorageSync(STORAGE_KEY_USER_PHONE)
      uni.removeStorageSync(STORAGE_KEY_LOGIN_TIMESTAMP)
      uni.removeStorageSync(STORAGE_KEY_PROFILE_COMPLETED)
    } catch (err) {
      console.warn('[Auth] clearLoginInfo error', err)
    }
    token.value = ''
    userId.value = ''
    phone.value = ''
    isLogin.value = false
    isProfileComplete.value = false
    userInfo.value = {}
    hasInitialized = false
  }

  /**
   * 初始化：从本地恢复登录态（只初始化一次）
   */
  const initAuth = async () => {
    try {
      // 检查登录是否过期
      if (isLoginExpired()) {
        console.log('[Auth] login expired, clearing login info')
        clearLoginInfo()
        return
      }

      if (!userId.value) {
        userId.value = uni.getStorageSync(STORAGE_KEY_USER_ID)
      }
      
      // 如果本地没有 userId，说明未登录
      if (!userId.value) {
        return
      }

      const res = await uni.request({
        url: API.getUserInfo,
        method: 'GET',
        data: { user_id: userId.value},
      })
      console.log('>>>>res', res);
      const info = res.data.data;
      userInfo.value = { ...info };
      isLogin.value = true;
    } catch (err) {
      console.error('[Auth] initAuth error', err)
      // 如果获取用户信息失败，清除登录信息
      clearLoginInfo()
    }
  }

  /**
   * 保存登录信息
   */
  const saveLoginInfo = (data) => {
    console.log('[Auth] saveLoginInfo', data)
    userId.value = data.userId
    phone.value = data.phone || ''
    isLogin.value = true
    isProfileComplete.value = data.isProfileComplete || false;
    // userInfo.value = { ...data }
    try {
      const loginTimestamp = Date.now() // 保存当前时间戳
      uni.setStorageSync(STORAGE_KEY_USER_ID, userId.value)
      uni.setStorageSync(STORAGE_KEY_USER_PHONE, phone.value)
      uni.setStorageSync(STORAGE_KEY_LOGIN_TIMESTAMP, loginTimestamp) // 保存登录时间戳
      // uni.setStorageSync(STORAGE_KEY_USER_INFO, { ...data })
      console.log('[Auth] login timestamp saved:', loginTimestamp)
    } catch (err) {
      console.warn('[Auth] saveLoginInfo storage error', err)
    }
  }

  /**
   * 标记信息已完善
   */
  const markProfileComplete = (userData) => {
    console.log('[Auth] markProfileComplete')
    isProfileComplete.value = true
    uni.setStorageSync(STORAGE_KEY_USER_INFO, { ...userData })
    userInfo.value = { ...userData };
    try {
      uni.setStorageSync(STORAGE_KEY_PROFILE_COMPLETED, true)
    } catch (err) {
      console.warn('[Auth] markProfileComplete error', err)
    }
  }

  /**
   * 退出登录
   */
  const logout = () => {
    console.log('[Auth] logout')
    clearLoginInfo()
    
    try {
      uni.removeStorageSync('USER_PROFILE_FORM') // 清除个人信息缓存
    } catch (err) {
      console.warn('[Auth] logout error', err)
    }

    uni.showToast({ title: '已退出登录', icon: 'success' })
    
    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 500)
  }

  /**
   * 检查登录态（用于需要登录的页面）
   * 注意：此函数是同步的，但 initAuth 是异步的
   * 建议在页面 onLoad 中先 await initAuth()，然后再调用 checkAuth()
   */
  const checkAuth = () => {
    // 先检查登录是否过期
    if (isLoginExpired()) {
      console.log('[Auth] checkAuth failed: login expired, redirect to login')
      clearLoginInfo()
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/login' })
      }, 500)
      return false
    }

    if (!userId.value) {
      console.log('[Auth] checkAuth failed, redirect to login')
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/login' })
      }, 500)
      return false
    }
    return true
  }

  /**
   * 检查是否完善信息
   * 注意：此函数是同步的，但 initAuth 是异步的
   * 建议在页面 onLoad 中先 await initAuth()，然后再调用 checkProfile()
   */
  const checkProfile = () => {
    if (!isProfileComplete.value) {
      console.log('[Auth] checkProfile failed, redirect to profile')
      uni.showToast({
        title: '请先完善个人信息',
        icon: 'none'
      })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/profile/profile' })
      }, 500)
      return false
    }
    return true
  }

  /**
   * 获取请求头（用于 API 调用）
   */
  const getAuthHeader = () => {
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }

  return {
    // state
    userId,
    token,
    phone,
    userInfo,
    isLogin,
    isProfileComplete,
    initAuth,
    saveLoginInfo,
    markProfileComplete,
    logout,
    checkAuth,
    checkProfile,
    getAuthHeader
  }
}
