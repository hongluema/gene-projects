<template>
  <view class="login-page">
    <!-- 顶部装饰 -->
    <view class="login-header">
      <view class="header-bg"></view>
      <view class="header-content">
        <text class="app-name">翱锐健康</text>
      </view>
    </view>

    <!-- 登录表单 -->
    <view class="login-form">
      <view class="form-title">
        <text class="title-text">手机号登录</text>
      </view>

      <!-- 手机号输入 -->
      <view class="form-item">
        <view class="item-label">
          <!-- <text class="label-icon">📱</text> -->
          <text class="label-text">手机号</text>
        </view>
        <input
          class="item-input"
          type="number"
          maxlength="11"
          v-model="form.phone"
          placeholder="请输入手机号"
          placeholder-class="input-placeholder"
        />
      </view>

      <!-- 验证码输入 -->
      <view class="form-item">
        <view class="item-label">
          <!-- <text class="label-icon">🔐</text> -->
          <text class="label-text">验证码</text>
        </view>
        <view class="code-input-wrapper">
          <input
            class="item-input code-input"
            type="number"
            maxlength="6"
            v-model="form.code"
            placeholder="请输入验证码"
            placeholder-class="input-placeholder"
          />
          <view 
            class="code-btn" 
            :class="{ 'code-btn-disabled': countdown > 0 || !isPhoneValid }"
            @click="handleSendCode"
          >
            <text class="code-btn-text">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </text>
          </view>
        </view>
      </view>

      <!-- 登录按钮 -->
      <view class="form-actions">
        <view 
          class="login-btn" 
          :class="{ 'login-btn-disabled': !canLogin }"
          @click="handleLogin"
        >
          <text class="login-btn-text">{{ isLoading ? '登录中...' : '登录' }}</text>
        </view>
      </view>

      <!-- 微信授权登录 -->
      <!-- #ifdef MP-WEIXIN -->
      <view class="wx-login-section">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>
        <button 
          class="wx-login-btn" 
          open-type="getPhoneNumber"
          @getphonenumber="handleWxPhoneAuth"
          :disabled="isWxLoading"
        >
          <!-- <text class="wx-login-icon">📱</text> -->
          <text class="wx-login-text">{{ isWxLoading ? '授权中...' : '微信一键登录' }}</text>
        </button>
      </view>
      <!-- #endif -->

      <!-- 协议提示 -->
      <view class="agreement">
        <text class="agreement-text">登录即表示同意</text>
        <text class="agreement-link">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { API } from '@/config'
import { useAuth } from '@/composables/useAuth'

const form = ref({
  phone: '',
  code: ''
})

const countdown = ref(0)
const isLoading = ref(false)
const isWxLoading = ref(false) // 微信授权登录加载状态
const codeSent = ref(false) // 标记是否已发送验证码

const { saveLoginInfo } = useAuth()

// 手机号格式校验
const isPhoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(form.value.phone)
})

// 是否可以登录
const canLogin = computed(() => {
  return isPhoneValid.value && form.value.code.length === 6 && codeSent.value && !isLoading.value
})

// 倒计时定时器
let timer = null

// 监听手机号变化，重置验证码状态
watch(() => form.value.phone, () => {
  codeSent.value = false
  form.value.code = ''
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  countdown.value = 0
})

// 发送验证码
const handleSendCode = async () => {
  // 防止重复点击
  if (countdown.value > 0) {
    return
  }

  // 校验手机号
  if (!isPhoneValid.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  try {
    // 调用发送验证码接口
    const res = await uni.request({
        url: API.sendCodeByPhone,
        method: 'POST',
        data: { phone: form.value.phone },
        header: { 'Content-Type': 'application/json' }
      })
      
    if (res.data && res.data.status_code === 200) {
      uni.showToast({
        title: res.data.message || '验证码已发送',
        icon: 'success'
      })
      // 标记已发送验证码
      codeSent.value = true
    } else {
      throw new Error(res.data?.message || '发送失败')
    }
    console.log('>>>>countdown', countdown.value);
    // 启动倒计时
    countdown.value = 120
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        timer = null
      }
    }, 1000)

  } catch (err) {
    console.error('[Login] sendCode error:', err)
    uni.showToast({
      title: err.message || '发送失败，请稍后重试',
      icon: 'none'
    })
  }
}

// 登录
const handleLogin = async () => {
  if (!canLogin.value) {
    return
  }

  // 校验手机号
  if (!isPhoneValid.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return
  }

  // 校验验证码
  if (!form.value.code || form.value.code.length !== 6) {
    uni.showToast({
      title: '请输入6位验证码',
      icon: 'none'
    })
    return
  }

  // 检查是否发送过验证码
  if (!codeSent.value) {
    uni.showToast({
      title: '请先获取验证码',
      icon: 'none'
    })
    return
  }

  isLoading.value = true

  try {
    let result
    let userInfo;
    // 调用登录接口 sendCodeByPhone
    // result = await mockLoginByPhone(form.value.phone, form.value.code);
    result = await uni.request({
      url: API.verifyCodeByPhone,
      method: 'POST',
      data: {
        phone: form.value.phone,
        code: form.value.code
      },
      header: { 'Content-Type': 'application/json' }
    });
    console.log('>>>>sms result', result);
    if (!result.data || !result.data.data) {
      isLoading.value = false
      uni.showToast({
        title: '验证码错误',
        icon: 'fail'
      })
      return;
    }
    const resData = await uni.request({
      url: API.createByPhone,
      method: 'POST',
      data: {
        phone: form.value.phone
      },
      header: { 'Content-Type': 'application/json' }
    });
    console.log('>>>>resData', resData);
    userInfo = resData.data.data;

    console.log('[Login] login success:', userInfo)
    // uni.setStorageSync(STORAGE_KEY_PROFILE_COMPLETED, !!userInfo.id_number);
    // 保存登录信息
    saveLoginInfo({
      userId: userInfo.user_id,
      phone: result.phone || form.value.phone
    })

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 根据是否完善信息跳转
    setTimeout(() => {
      if (userInfo.id_number) {
        // 已完善信息，跳转首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // 未完善信息，跳转完善信息页
        uni.redirectTo({
          url: '/pages/profile/profile'
        })
      }
    }, 500)

  } catch (err) {
    console.error('[Login] login error:', err)
    uni.showToast({
      title: err.errMsg || '登录失败，请稍后重试',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 微信手机号授权登录
const handleWxPhoneAuth = async (e) => {
  console.log('[Login] wx phone auth:', e)
  
  // 用户拒绝授权
  if (e.detail.errMsg && e.detail.errMsg.includes('deny')) {
    uni.showToast({
      title: '需要授权手机号才能登录',
      icon: 'none'
    })
    return
  }

  // 获取手机号授权 code（新版本微信小程序只返回 code，不返回 encryptedData 和 iv）
  const { code } = e.detail
  
  if (!code) {
    uni.showToast({
      title: '获取手机号失败，请重试',
      icon: 'none'
    })
    return
  }

  isWxLoading.value = true

  try {
    // 先获取微信登录 code（用于换取 openId）
    const wxLoginRes = await new Promise((resolve, reject) => {
      uni.login({
        provider: 'weixin',
        success: resolve,
        fail: reject
      })
    })

    if (!wxLoginRes.code) {
      throw new Error('获取微信登录凭证失败')
    }

    // 方案1: 使用专门的微信手机号登录接口（推荐）
    // 后端应该处理：1. 用 wxLoginRes.code 换取 openId 2. 用 phoneCode 解密手机号 3. 创建/登录用户
    // try {
    //   const loginRes = await uni.request({
    //     url: API.wxPhoneLogin,
    //     method: 'POST',
    //     data: {
    //       code: wxLoginRes.code, // 微信登录 code，用于换取 openId
    //       phoneCode: code, // 手机号授权 code，用于解密手机号
    //     },
    //     header: { 'Content-Type': 'application/json' }
    //   })

    //   if (loginRes.data && loginRes.data.status_code === 200 && loginRes.data.data) {
    //     const userInfo = loginRes.data.data
    //     console.log('[Login] wx phone login success:', userInfo)

    //     // 保存登录信息
    //     saveLoginInfo({
    //       userId: userInfo.user_id,
    //       phone: userInfo.phone || loginRes.data.phone
    //     })

    //     uni.showToast({
    //       title: '登录成功',
    //       icon: 'success'
    //     })

    //     // 根据是否完善信息跳转
    //     setTimeout(() => {
    //       if (userInfo.id_number) {
    //         uni.switchTab({
    //           url: '/pages/index/index'
    //         })
    //       } else {
    //         uni.redirectTo({
    //           url: '/pages/profile/profile'
    //         })
    //       }
    //     }, 500)
    //     return
    //   }
    // } catch (apiErr) {
    //   console.warn('[Login] wxPhoneLogin API not available, try decrypt phone:', apiErr)
    // }

    // 方案2: 如果后端没有专门的登录接口，先解密手机号，然后使用 createByPhone
    const decryptRes = await uni.request({
      url: API.wxDecryptPhone,
      method: 'POST',
      data: {
        code: wxLoginRes.code,
        phoneCode: code,
      },
      header: { 'Content-Type': 'application/json' }
    })
    console.log('>>>>decryptRes', decryptRes);
    if (!decryptRes.data.data || !decryptRes.data.data.phone) {
      throw new Error('获取手机号失败')
    }

    const phone = decryptRes.data.data.phone
    console.log('[Login] wx phone decrypted:', phone)

    // 使用手机号创建/登录用户
    const resData = await uni.request({
      url: API.createByPhone,
      method: 'POST',
      data: {
        phone: phone
      },
      header: { 'Content-Type': 'application/json' }
    })

    if (!resData.data || !resData.data.data) {
      throw new Error('登录失败')
    }

    const userInfo = resData.data.data
    console.log('[Login] wx login success:', userInfo)

    // 保存登录信息
    saveLoginInfo({
      userId: userInfo.user_id,
      phone: phone
    })

    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })

    // 根据是否完善信息跳转
    setTimeout(() => {
      if (userInfo.id_number) {
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        uni.redirectTo({
          url: '/pages/profile/profile'
        })
      }
    }, 500)

  } catch (err) {
    console.error('[Login] wx phone auth error:', err)
    uni.showToast({
      title: err.message || '微信授权登录失败，请使用手机号登录',
      icon: 'none',
      duration: 2000
    })
  } finally {
    isWxLoading.value = false
  }
}

// 页面卸载时清除定时器
onUnload(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<script>
import { onUnload } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'

export default {
  // 登录页加载时的处理
  async onLoad(options) {
    const { initAuth, isLogin, userId } = useAuth()
    
    // 检查是否是退出登录后的跳转（通过 options 参数判断）
    // 如果是退出登录跳转过来的，不执行任何初始化，直接显示登录页
    if (options && options.from === 'logout') {
      console.log('[Login] from logout, skip initAuth')
      return
    }
    
    // 先检查本地是否有 userId，如果没有则不需要初始化
    const localUserId = uni.getStorageSync('USER_ID')
    if (!localUserId) {
      console.log('[Login] no local userId, skip initAuth')
      return
    }
    
    // 检查登录时间戳是否存在，如果不存在说明已退出登录
    const loginTimestamp = uni.getStorageSync('LOGIN_TIMESTAMP')
    if (!loginTimestamp) {
      console.log('[Login] no login timestamp, user logged out')
      return
    }
    
    // 如果有本地 userId 和登录时间戳，才尝试初始化
    await initAuth()
    
    // 初始化后再次检查登录状态（确保状态和存储一致）
    const currentUserId = uni.getStorageSync('USER_ID')
    if (isLogin.value && userId.value && currentUserId === userId.value) {
      console.log('[Login] already logged in, redirect to home')
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.login-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600rpx;
  height: 600rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
}

.app-name {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.app-slogan {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.login-form {
  position: relative;
  margin: -45rpx 40rpx 40rpx;
  padding: 40rpx 40rpx 40rpx;
  background: #fff;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.form-title {
  display: flex;
  flex-direction: column;
  margin-bottom: 16rpx;
}

.title-text {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.title-desc {
  font-size: 26rpx;
  color: #999;
}

.form-item {
  margin-bottom: 40rpx;
}

.item-label {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.label-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.label-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.item-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: #f6f7f9;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
  box-sizing: border-box;
}

.input-placeholder {
  color: #c8c9cc;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.code-btn {
  flex-shrink: 0;
  height: 88rpx;
  padding: 0 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.code-btn-disabled {
  background: #e5e5e5;
  opacity: 0.6;
}

.code-btn-text {
  font-size: 26rpx;
  color: #fff;
  white-space: nowrap;
}

.code-btn-disabled .code-btn-text {
  color: #999;
}

.mock-tip {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  background: #fff9e6;
  border-radius: 12rpx;
  margin-bottom: 40rpx;
  border-left: 6rpx solid #faad14;
}

.tip-icon {
  font-size: 32rpx;
  margin-right: 12rpx;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  color: #d48806;
  line-height: 1.6;
}

.form-actions {
  margin-top: 60rpx;
}

.login-btn {
  height: 96rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.login-btn-disabled {
  background: #e5e5e5;
  opacity: 0.6;
  box-shadow: none;
}

.login-btn-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}

.login-btn-disabled .login-btn-text {
  color: #999;
}

.agreement {
  margin-top: 40rpx;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  line-height: 1.6;
}

.agreement-link {
  color: #667eea;
}

/* 微信授权登录样式 */
.wx-login-section {
  margin-top: 40rpx;
}

.divider {
  display: flex;
  align-items: center;
  margin: 40rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e5e5e5;
}

.divider-text {
  margin: 0 24rpx;
  font-size: 24rpx;
  color: #999;
}

.wx-login-btn {
  width: 100%;
  height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #07c160;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.3);
}

.wx-login-btn::after {
  border: none;
}

.wx-login-btn[disabled] {
  background: #e5e5e5;
  opacity: 0.6;
  box-shadow: none;
}

.wx-login-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.wx-login-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
}
</style>

