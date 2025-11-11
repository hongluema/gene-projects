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
    console.log('[WxAuth] restoreProfile start')
    try {
      const cached: any = uni.getStorageSync(STORAGE_KEY_PROFILE)
      if (cached) {
        isAuthorized.value = true
        avatarUrl.value = cached.avatarUrl || ''
        nickName.value = cached.nickName || ''
        console.log('[WxAuth] restoreProfile done', cached)
      }
    } catch {}
  }

  const loginWeixin = () => {
    // #ifdef MP-WEIXIN
    console.log('[WxAuth] login start')
    uni.login({
      provider: 'weixin',
      success: (res) => {
        console.log('[WxAuth] login success code:', res.code)
        loginCode.value = res.code || ''
        try {
          const cachedOpenId = uni.getStorageSync(STORAGE_KEY_OPENID)
          if (cachedOpenId) openId.value = cachedOpenId
        } catch {}

        // 交换 openId（需要后端实现 /api/getOpenid, 返回 { openId } 或 { openid }）
        if (loginCode.value) {
          console.log('[WxAuth] request /api/wx/login')
          uni.request({
            url: 'http://localhost:8000/api/wx/login',
            method: 'POST',
            data: { code: loginCode.value },
            header: { 'Content-Type': 'application/json' },
            success: (r: any) => {
              const oid = (r.data && (r.data.openId || r.data.openid)) || ''
              if (oid) {
                openId.value = oid
                try { uni.setStorageSync(STORAGE_KEY_OPENID, openId.value) } catch {}
                console.log('[WxAuth] get openId success:', oid)
              }
            },
            fail: (err) => {
              console.warn('[WxAuth] get openId fail', err)
            }
          })
        }
      },
      fail: (err) => {
        console.warn('[WxAuth] login fail', err)
      }
    })
    // #endif
  }

  const openAuthDialog = () => {
    console.log('[WxAuth] openAuthDialog click')
    // 确保点击时也进行一次登录尝试，避免某些场景 onLoad 未触发或登录未完成
    // #ifdef MP-WEIXIN
    if (!loginCode.value || !openId.value) {
      console.log('[WxAuth] re-login in openAuthDialog')
      loginWeixin()
    }
    // 主动尝试拉取用户头像昵称（需用户同意）
    if (typeof uni.getUserProfile === 'function') {
      uni.getUserProfile({
        desc: '用于完善会员资料',
        success: (res: any) => {
          const info = res?.userInfo || {}
          if (info.avatarUrl) avatarUrl.value = info.avatarUrl
          if (info.nickName) nickName.value = info.nickName
          console.log('[WxAuth] getUserProfile ok', info)
        },
        fail: (err: any) => {
          console.warn('[WxAuth] getUserProfile fail', err)
        }
      })
    }
    // #endif
    showAuthDialog.value = true
  }
  const closeAuthDialog = () => { showAuthDialog.value = false }

  const onAuthConfirm = (payload: { avatarUrl: string; nickName: string }) => {
    console.log('[WxAuth] onAuthConfirm payload', payload)
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
    console.log('[WxAuth] initWxAuth')
    loginWeixin()
    restoreProfile()
    if (!isAuthorized.value) showAuthDialog.value = true
    // #endif
  }

  const clearProfile = () => {
    console.log('[WxAuth] clearProfile')
    try {
      uni.removeStorageSync(STORAGE_KEY_PROFILE)
      uni.removeStorageSync(STORAGE_KEY_OPENID)
    } catch {}
    isAuthorized.value = false
    avatarUrl.value = ''
    nickName.value = ''
    openId.value = ''
    loginCode.value = ''
    uni.showToast({ title: '已清除', icon: 'success' })
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
    clearProfile,
  }
}
