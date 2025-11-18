import { ref } from 'vue'

// ========== 单例状态（所有页面共享） ==========
const userId = ref('')
const token = ref('')
const isLogin = ref(false)
const isProfileComplete = ref(false)
const phone = ref('')

const STORAGE_KEY_USER_INFO = 'USER_INFO'
const STORAGE_KEY_USER_ID = 'USER_ID'
const STORAGE_KEY_USER_PHONE = 'USER_PHONE'
const STORAGE_KEY_PROFILE_COMPLETED = 'PROFILE_COMPLETED'

// 是否已初始化标识
let hasInitialized = false

/**
 * 登录状态管理（单例模式）
 * 所有页面共享同一份状态
 */
export function useAuth() {

  /**
   * 初始化：从本地恢复登录态（只初始化一次）
   */
  const initAuth = () => {
    // 如果已经初始化过，直接返回
    if (hasInitialized) {
      console.log('[Auth] already initialized, skip')
      return
    }

    console.log('[Auth] initAuth start')
    try {
      const cachedToken = uni.getStorageSync(STORAGE_KEY_TOKEN)
      const cachedUserId = uni.getStorageSync(STORAGE_KEY_USER_ID)
      const cachedPhone = uni.getStorageSync(STORAGE_KEY_PHONE)
      const profileCompleted = uni.getStorageSync(STORAGE_KEY_PROFILE_COMPLETED)

      if (cachedToken && cachedUserId) {
        token.value = cachedToken
        userId.value = cachedUserId
        phone.value = cachedPhone || ''
        isLogin.value = true
        isProfileComplete.value = !!profileCompleted
        console.log('[Auth] initAuth success', {
          userId: userId.value,
          isLogin: isLogin.value,
          isProfileComplete: isProfileComplete.value
        })
      } else {
        console.log('[Auth] initAuth no cached token')
      }

      hasInitialized = true
    } catch (err) {
      console.warn('[Auth] initAuth error', err)
    }
  }

  /**
   * 保存登录信息
   */
  const saveLoginInfo = (data) => {
    console.log('[Auth] saveLoginInfo', data)
    userId.value = data.user_id
    phone.value = data.phone || ''
    isLogin.value = true
    isProfileComplete.value = data.isProfileComplete || false

    try {
      uni.setStorageSync(STORAGE_KEY_USER_ID, userId.value)
      uni.setStorageSync(STORAGE_KEY_USER_PHONE, phone.value)
      uni.setStorageSync(STORAGE_KEY_USER_INFO, { ...data })
      if (isProfileComplete.value) {
        uni.setStorageSync(STORAGE_KEY_PROFILE_COMPLETED, true)
      }
    } catch (err) {
      console.warn('[Auth] saveLoginInfo storage error', err)
    }
  }

  /**
   * 标记信息已完善
   */
  const markProfileComplete = () => {
    console.log('[Auth] markProfileComplete')
    isProfileComplete.value = true
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
    try {
      uni.removeStorageSync(STORAGE_KEY_TOKEN)
      uni.removeStorageSync(STORAGE_KEY_USER_ID)
      uni.removeStorageSync(STORAGE_KEY_PHONE)
      uni.removeStorageSync(STORAGE_KEY_PROFILE_COMPLETED)
      uni.removeStorageSync('USER_PROFILE_FORM') // 清除个人信息缓存
    } catch (err) {
      console.warn('[Auth] logout error', err)
    }

    token.value = ''
    userId.value = ''
    phone.value = ''
    isLogin.value = false
    isProfileComplete.value = false
    hasInitialized = false  // 重置初始化标识

    uni.showToast({ title: '已退出登录', icon: 'success' })
    
    // 跳转到登录页
    setTimeout(() => {
      uni.reLaunch({ url: '/pages/login/login' })
    }, 500)
  }

  /**
   * 检查登录态（用于需要登录的页面）
   * 自动初始化登录状态
   */
  const checkAuth = () => {
    // 如果还没初始化，先初始化
    if (!hasInitialized) {
      initAuth()
    }

    if (!isLogin.value || !token.value) {
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
   * 自动初始化登录状态
   */
  const checkProfile = () => {
    // 如果还没初始化，先初始化
    if (!hasInitialized) {
      initAuth()
    }

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
    isLogin,
    isProfileComplete,
    // actions
    initAuth,
    saveLoginInfo,
    markProfileComplete,
    logout,
    checkAuth,
    checkProfile,
    getAuthHeader
  }
}

