<template>
  <view class="container">
    <view class="header">
      <text class="header-title">基因检测报告</text>
    </view>

  <view class="content">
    <!-- #ifdef MP-WEIXIN -->
    <view class="user-card">
      <image class="avatar" :src="avatarUrl || '/static/avatar.png'" mode="aspectFill" />
      <view class="user-brief">
        <text class="username">{{ nickName || '未授权用户' }}</text>
        <text class="userid">ID：{{ openId || '未绑定' }}</text>
      </view>
      <view class="user-actions" v-if="!isAuthorized">
        <button class="mini-btn primary" @click="openAuthDialog">完善资料</button>
      </view>
    </view>

    <!-- 复用组件：用户资料弹窗 -->
    <UserAuthDialog
      :show="showAuthDialog"
      :avatar-url="avatarUrl"
      :nick-name="nickName"
      @update:show="onUpdateAuthShow"
      @confirm="onAuthConfirm"
    />
    <!-- #endif -->

    <view class="report-card">
        <view class="card-header">
          <image class="icon" src="/static/dna-icon.png" mode="aspectFit" />
          <text class="card-title">基因检测报告</text>
        </view>

        <view class="info-list">
          <view class="info-item">
            <text class="info-label">检测项目：</text>
            <text class="info-value">MTHFR基因检测</text>
          </view>
          <view class="info-item">
            <text class="info-label">检测时间：</text>
            <text class="info-value">2024年3月15日</text>
          </view>
          <view class="info-item">
            <text class="info-label">检测机构：</text>
            <text class="info-value">XX医学检验所</text>
          </view>
        </view>

        <view class="btn-container">
          <button class="detail-btn" @click="viewDetail">查看详情</button>
        </view>

        <!-- #ifdef MP -->
        <view class="btn-container" style="margin-top: 20rpx;">
          <van-button type="primary" block @click="viewDetail">Vant 按钮（小程序）</van-button>
        </view>
        <!-- #endif -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import UserAuthDialog from '@/components/UserAuthDialog.vue'
import { useWxAuth } from '@/composables/useWxAuth'

const {
  isAuthorized,
  avatarUrl,
  nickName,
  openId,
  loginCode,
  showAuthDialog,
  initWxAuth,
  openAuthDialog,
  onAuthConfirm,
} = useWxAuth()

const onUpdateAuthShow = (v: boolean) => {
  showAuthDialog.value = v
}

onLoad(async () => {
  initWxAuth()
  // 你原有的请求逻辑（可按需保留）
  try {
    const res = await uni.request({
      url: 'http://localhost:8000/users',
      method: 'POST',
      data: {
        nickname: 'walry',
        mobile: '12345678910',
        avatar: 'https://wx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTI9icicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicicic/132'
      },
      header: { 'Content-Type': 'application/json' }
    })
    console.log('>>>>res', res)
  } catch (e) {}
})
const viewDetail = () => {
  uni.showToast({
    title: '查看详情',
    icon: 'none'
  })
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #E8F4FF 0%, #F5F5F5 100%);
}

.header {
  padding: 40rpx 30rpx;
  background-color: transparent;
}

.header-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #333333;
}

.content {
  padding: 0 30rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.user-card .avatar {
  width: 96rpx;
  height: 96rpx;
  border-radius: 48rpx;
  margin-right: 20rpx;
}

.user-card .user-brief {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.user-card .username {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 6rpx;
}

.user-card .userid {
  font-size: 26rpx;
  color: #999;
}

.user-card .user-actions {
  margin-left: 12rpx;
}

.auth-modal {
  width: 640rpx;
  max-width: 680rpx;
  padding: 32rpx 28rpx 28rpx;
  box-sizing: border-box;
}

.auth-title {
  text-align: center;
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.auth-desc {
  margin-top: 12rpx;
  text-align: center;
  font-size: 26rpx;
  color: #888;
}

.auth-avatar {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.avatar-large {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #f6f7f9;
}

.auth-nickname {
  margin-top: 20rpx;
}

.auth-actions {
  margin-top: 24rpx;
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
}

.user-fill {
  display: flex;
  align-items: center;
  gap: 16rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 16rpx;
  margin: 16rpx 0 24rpx;
}

.nickname-input {
  flex: 1;
  height: 72rpx;
  padding: 0 16rpx;
  background: #f6f7f9;
  border-radius: 12rpx;
}

.mini-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
  color: #333;
}

.mini-btn.primary {
  background: #4A90E2;
  color: #fff;
}

.report-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 16rpx;
}

.card-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.info-list {
  margin-bottom: 40rpx;
}

.info-item {
  display: flex;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 30rpx;
  color: #666666;
  min-width: 180rpx;
}

.info-value {
  font-size: 30rpx;
  color: #333333;
  flex: 1;
}

.btn-container {
  display: flex;
  justify-content: center;
}

.detail-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
  color: #ffffff;
  font-size: 32rpx;
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-btn::after {
  border: none;
}
</style>
