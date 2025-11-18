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
export const STORAGE_KEY_PROFILE_COMPLETED = 'PROFILE_COMPLETED'

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
  const initAuth = async () => {
    try {
      if (!userId.value) {
        uni.getStorageSync(STORAGE_KEY_USER_ID)
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
    } catch {}
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
      uni.setStorageSync(STORAGE_KEY_USER_ID, userId.value)
      uni.setStorageSync(STORAGE_KEY_USER_PHONE, phone.value)
      // uni.setStorageSync(STORAGE_KEY_USER_INFO, { ...data })
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
