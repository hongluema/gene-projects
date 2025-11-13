<template>
  <view class="mine-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-info-card">
        <image class="user-avatar" :src="avatarUrl || '/static/avatar.png'" mode="aspectFill" />
        <view class="user-details">
          <text class="user-name">{{ nickName || '未登录' }}</text>
          <text class="user-id">{{ openId || '未绑定账号' }}</text>
        </view>
        <!-- #ifdef MP-WEIXIN -->
        <view v-if="!isAuthorized" class="auth-btn" @click="openAuthDialog">
          <text class="auth-text">登录</text>
        </view>
        <!-- #endif -->
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-stats">
      <view class="stat-item" @click="goToReportQuery">
        <text class="stat-number">--</text>
        <text class="stat-label">我的报告</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">--</text>
        <text class="stat-label">检测中</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item">
        <text class="stat-number">--</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="handleBindPhone">
          <view class="menu-left">
            <text class="menu-icon">📱</text>
            <text class="menu-text">手机号绑定</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ phoneNumber || '未绑定' }}</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="goToReportQuery">
          <view class="menu-left">
            <text class="menu-icon">📊</text>
            <text class="menu-text">我的报告</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">→</text>
          </view>
        </view>
        
        <view class="menu-item" @click="goToSampleEntry">
          <view class="menu-left">
            <text class="menu-icon">📝</text>
            <text class="menu-text">样本录入</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="goToAbout">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-text">关于我们</text>
          </view>
          <view class="menu-right">
            <text class="menu-arrow">→</text>
          </view>
        </view>

        <view class="menu-item" @click="contactService">
          <view class="menu-left">
            <text class="menu-icon">📞</text>
            <text class="menu-text">联系客服</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">400-888-8888</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <view v-if="isAuthorized" class="menu-group">
        <view class="menu-item danger" @click="handleClearProfile">
          <view class="menu-left">
            <text class="menu-icon">🚪</text>
            <text class="menu-text">退出登录</text>
          </view>
        </view>
      </view>
      <!-- #endif -->
    </view>

    <!-- 手机号绑定弹窗 -->
    <view v-if="showPhoneDialog" class="dialog-mask" @click="showPhoneDialog = false">
      <view class="dialog-content" @click.stop="">
        <view class="dialog-header">
          <text class="dialog-title">绑定手机号</text>
          <text class="dialog-close" @click="showPhoneDialog = false">×</text>
        </view>
        <view class="dialog-body">
          <view class="input-group">
            <text class="input-label">手机号</text>
            <input 
              class="input-field" 
              v-model="phoneInput"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
            />
          </view>
          <view class="input-group">
            <text class="input-label">验证码</text>
            <view class="code-group">
              <input 
                class="input-field code-field" 
                v-model="codeInput"
                type="number"
                maxlength="6"
                placeholder="请输入验证码"
              />
              <button 
                class="send-code-btn" 
                :disabled="codeCountdown > 0"
                @click="sendVerifyCode"
              >
                {{ codeCountdown > 0 ? `${codeCountdown}秒` : '获取验证码' }}
              </button>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="dialog-btn cancel" @click="showPhoneDialog = false">取消</button>
          <button class="dialog-btn confirm" @click="confirmBindPhone">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import UserAuthDialog from '@/components/UserAuthDialog.vue'
import { useWxAuth } from '@/composables/useWxAuth'
import { validatePhone, validateCode } from '@/utils/validator'
import { scanQRCode } from '@/utils/scan'

const {
  isAuthorized,
  avatarUrl,
  nickName,
  openId,
  phoneNumber,
  showAuthDialog,
  initWxAuth,
  openAuthDialog,
  onAuthConfirm,
  bindPhone,
  clearProfile,
} = useWxAuth()

const showPhoneDialog = ref(false)
const phoneInput = ref('')
const codeInput = ref('')
const codeCountdown = ref(0)

onLoad(() => {
  // #ifdef MP-WEIXIN
  initWxAuth()
  // #endif
})

onShow(() => {
  // 每次显示时刷新手机号
})

const onUpdateAuthShow = (v) => {
  showAuthDialog.value = v
}

// 绑定手机号
const handleBindPhone = () => {
  if (phoneNumber.value) {
    uni.showModal({
      title: '提示',
      content: `当前已绑定手机号：${phoneNumber.value}，是否重新绑定？`,
      success: (res) => {
        if (res.confirm) {
          showPhoneDialog.value = true
          phoneInput.value = ''
          codeInput.value = ''
        }
      }
    })
  } else {
    showPhoneDialog.value = true
    phoneInput.value = ''
    codeInput.value = ''
  }
}

// 发送验证码
const sendVerifyCode = async () => {
  if (!validatePhone(phoneInput.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  // 模拟发送验证码
  uni.showLoading({ title: '发送中...' })
  await new Promise(resolve => setTimeout(resolve, 1000))
  uni.hideLoading()
  
  uni.showToast({ title: '验证码已发送', icon: 'success' })
  
  // 倒计时
  codeCountdown.value = 60
  const timer = setInterval(() => {
    codeCountdown.value--
    if (codeCountdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 确认绑定
const confirmBindPhone = () => {
  if (!validatePhone(phoneInput.value)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (!validateCode(codeInput.value)) {
    uni.showToast({ title: '请输入正确的验证码', icon: 'none' })
    return
  }

  // 执行绑定
  bindPhone(phoneInput.value)
  showPhoneDialog.value = false
}

// 清除资料
const handleClearProfile = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后将清除本地登录信息，确定要退出吗？',
    success: (res) => {
      if (res.confirm) {
        clearProfile()
      }
    }
  })
}

// 跳转到报告查询
const goToReportQuery = () => {
  uni.navigateTo({
    url: '/pages/report-query/index'
  })
}

// 跳转到样本录入
const goToSampleEntry = async () => {
  uni.navigateTo({
    url: `/pages/sample-entry/index?qrCode=${encodeURIComponent(result)}`
  })  
}

// 跳转到关于我们
const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}

// 联系客服
const contactService = () => {
  uni.makePhoneCall({
    phoneNumber: '4008888888'
  })
}
</script>

<style scoped>
.mine-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.user-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 30rpx 40rpx;
}

.user-info-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 24rpx;
}

.user-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: #fff;
  margin-right: 24rpx;
}

.user-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.auth-btn {
  padding: 16rpx 32rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50rpx;
}

.auth-text {
  font-size: 26rpx;
  color: #fff;
}

.quick-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: #fff;
  margin: -20rpx 30rpx 20rpx;
  border-radius: 20rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.stat-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
}

.stat-divider {
  width: 2rpx;
  height: 60rpx;
  background: #f0f0f0;
}

.menu-section {
  padding: 0 30rpx;
}

.menu-group {
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item.danger .menu-text {
  color: #ff4d4f;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
}

.menu-text {
  font-size: 30rpx;
  color: #333;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-value {
  font-size: 26rpx;
  color: #999;
}

.menu-arrow {
  font-size: 32rpx;
  color: #ccc;
}

/* 手机号绑定弹窗 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.dialog-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.dialog-close {
  font-size: 48rpx;
  color: #999;
  line-height: 1;
}

.dialog-body {
  padding: 30rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-group:last-child {
  margin-bottom: 0;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 16rpx;
}

.input-field {
  width: 100%;
  padding: 24rpx 20rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.code-group {
  display: flex;
  gap: 16rpx;
}

.code-field {
  flex: 1;
}

.send-code-btn {
  width: 180rpx;
  padding: 24rpx 20rpx;
  background: #667eea;
  color: #fff;
  font-size: 24rpx;
  border-radius: 12rpx;
  border: none;
}

.send-code-btn[disabled] {
  background: #d9d9d9;
  color: #999;
}

.dialog-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.dialog-btn {
  flex: 1;
  padding: 28rpx;
  font-size: 30rpx;
  border: none;
  background: transparent;
}

.dialog-btn.cancel {
  color: #999;
  border-right: 1px solid #f0f0f0;
}

.dialog-btn.confirm {
  color: #667eea;
  font-weight: bold;
}
</style>
