import { ref } from 'vue'

export function useWxAuth() {
  const isAuthorized = ref(false)
  const avatarUrl = ref('')
  const nickName = ref('')
  const openId = ref('')
  const loginCode = ref('')
  const showAuthDialog = ref(false)

  const STORAGE_KEY_PROFILE = 'WX_USER_PROFILE'
  const STORAGE_KEY_OPENID = 'WX_OPEN_ID'

  const restoreProfile = () => {
    try {
      const cached: any = uni.getStorageSync(STORAGE_KEY_PROFILE)
      if (cached) {
        isAuthorized.value = true
        avatarUrl.value = cached.avatarUrl || ''
        nickName.value = cached.nickName || ''
      }
    } catch {}
  }

  const loginWeixin = () => {
    // #ifdef MP-WEIXIN
    uni.login({
      provider: 'weixin',
      success: (res) => {
        loginCode.value = res.code || ''
        try {
          const cachedOpenId = uni.getStorageSync(STORAGE_KEY_OPENID)
          if (cachedOpenId) openId.value = cachedOpenId
        } catch {}

        // 交换 openId（需要后端实现 /api/getOpenid, 返回 { openId } 或 { openid }）
        if (loginCode.value) {
          uni.request({
            url: '/api/wxapp/login',
            method: 'POST',
            data: { code: loginCode.value },
            header: { 'Content-Type': 'application/json' },
            success: (r: any) => {
              // 后端返回处理结果
              console.log('登录成功:', r.data);
              // 假设后端返回 { openId: 'xxx' }
              openId.value = r.data.openId || ''
              try {
                uni.setStorageSync(STORAGE_KEY_OPENID, openId.value);
                uni.setStorageSync('user_token', r.data.token);
              } catch { }
            },
            fail: (err) => {
              console.warn('交换 openId 失败', err)
            }
          })
        }
      },
      fail: (err) => {
        console.warn('微信登录失败', err)
      }
    })
    // #endif
  }

  const openAuthDialog = () => { showAuthDialog.value = true }
  const closeAuthDialog = () => { showAuthDialog.value = false }

  const onAuthConfirm = (payload: { avatarUrl: string; nickName: string }) => {
    avatarUrl.value = payload.avatarUrl
    nickName.value = payload.nickName
    if (!nickName.value) {
      uni.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }
    if (!avatarUrl.value) {
      uni.showToast({ title: '请选择头像', icon: 'none' })
      return
    }
    try {
      uni.setStorageSync(STORAGE_KEY_PROFILE, { avatarUrl: avatarUrl.value, nickName: nickName.value })
    } catch {}
    isAuthorized.value = true
    showAuthDialog.value = false
    uni.showToast({ title: '已保存', icon: 'success' })
  }

  const initWxAuth = () => {
    // #ifdef MP-WEIXIN
    loginWeixin()
    restoreProfile()
    if (!isAuthorized.value) showAuthDialog.value = true
    // #endif
  }

  return {
    // state
    isAuthorized,
    avatarUrl,
    nickName,
    openId,
    loginCode,
    showAuthDialog,
    // actions
    initWxAuth,
    loginWeixin,
    openAuthDialog,
    closeAuthDialog,
    onAuthConfirm,
  }
}

