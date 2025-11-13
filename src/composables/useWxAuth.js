import { ref } from 'vue'
import { USE_MOCK, API } from '@/config'
import { mockWxLogin, mockSaveUser } from '@/mock/api'

export function useWxAuth() {
  const isAuthorized = ref(false)
  const avatarUrl = ref('')
  const nickName = ref('')
  const openId = ref('')
  const loginCode = ref('')
  const showAuthDialog = ref(false)
  const phoneNumber = ref('')

  const STORAGE_KEY_PROFILE = 'WX_USER_PROFILE'
  const STORAGE_KEY_OPENID = 'WX_OPEN_ID'
  const STORAGE_KEY_PHONE = 'WX_PHONE'

  const restoreProfile = () => {
    console.log('[WxAuth] restoreProfile start')
    try {
      const cached = uni.getStorageSync(STORAGE_KEY_PROFILE)
      if (cached) {
        isAuthorized.value = true
        avatarUrl.value = cached.avatarUrl || ''
        nickName.value = cached.nickName || ''
        console.log('[WxAuth] restoreProfile done', cached)
      }
      const cachedPhone = uni.getStorageSync(STORAGE_KEY_PHONE)
      if (cachedPhone) {
        phoneNumber.value = cachedPhone
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

        // 交换 openId（后端或 Mock）
        if (loginCode.value) {
          if (USE_MOCK) {
            mockWxLogin(loginCode.value).then(({ openId: oid }) => {
              openId.value = oid
              try { uni.setStorageSync(STORAGE_KEY_OPENID, openId.value) } catch {}
              console.log('[WxAuth][MOCK] get openId success:', oid)
            })
          } else {
            console.log('[WxAuth] request /api/wx/login')
            uni.request({
              url: API.wxLogin,
              method: 'POST',
              data: { code: loginCode.value },
              header: { 'Content-Type': 'application/json' },
              success: (r) => {
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
    // #ifdef MP-WEIXIN
    if (!loginCode.value || !openId.value) {
      console.log('[WxAuth] re-login in openAuthDialog')
      loginWeixin()
    }
    // #endif
    showAuthDialog.value = true
  }

  const closeAuthDialog = () => { 
    showAuthDialog.value = false 
  }

  const onAuthConfirm = async (payload) => {
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
      uni.setStorageSync(STORAGE_KEY_PROFILE, { 
        avatarUrl: avatarUrl.value, 
        nickName: nickName.value 
      })
    } catch {}
    isAuthorized.value = true
    showAuthDialog.value = false
    uni.showToast({ title: '已保存', icon: 'success' })

    // 同步到后端（或 Mock）
    try {
      if (!openId.value) {
        console.warn('[WxAuth] skip server sync, missing openId')
        return
      }
      if (USE_MOCK) {
        await mockSaveUser({ 
          openId: openId.value, 
          nickname: nickName.value, 
          avatar: avatarUrl.value 
        })
        console.log('[WxAuth][MOCK] synced profile to server with openId:', openId.value)
      } else {
        await uni.request({
          url: API.saveUser,
          method: 'POST',
          data: {
            openId: openId.value,
            nickname: nickName.value,
            avatar: avatarUrl.value,
          },
          header: { 'Content-Type': 'application/json' },
        })
        console.log('[WxAuth] synced profile to server with openId:', openId.value)
      }
    } catch (err) {
      console.warn('[WxAuth] sync profile fail', err)
    }
  }

  const bindPhone = (phone) => {
    phoneNumber.value = phone
    try {
      uni.setStorageSync(STORAGE_KEY_PHONE, phone)
    } catch {}
    uni.showToast({ title: '绑定成功', icon: 'success' })
  }

  const initWxAuth = () => {
    // #ifdef MP-WEIXIN
    console.log('[WxAuth] initWxAuth')
    loginWeixin()
    restoreProfile()
    // #endif
  }

  const clearProfile = () => {
    console.log('[WxAuth] clearProfile')
    try {
      uni.removeStorageSync(STORAGE_KEY_PROFILE)
      uni.removeStorageSync(STORAGE_KEY_OPENID)
      uni.removeStorageSync(STORAGE_KEY_PHONE)
    } catch {}
    isAuthorized.value = false
    avatarUrl.value = ''
    nickName.value = ''
    openId.value = ''
    loginCode.value = ''
    phoneNumber.value = ''
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
    phoneNumber,
    // actions
    initWxAuth,
    loginWeixin,
    openAuthDialog,
    closeAuthDialog,
    onAuthConfirm,
    bindPhone,
    clearProfile,
  }
}

