<template>
  <view class="home-page">
    <!-- 顶部Banner -->
    <view class="banner-section">
      <view class="banner-content">
        <text class="banner-title">采样检测查询平台</text>
        <text class="banner-desc">便捷、专业、安全的检测服务</text>
      </view>
    </view>

    <!-- 快速入口 -->
    <view class="quick-entry-section">
      <!-- <view class="section-title">
        <text class="title-text">快速入口</text>
      </view> -->
      
      <view class="entry-grid">
        <!-- 扫码录入 -->
        <view class="entry-item primary" @click="goToSampleEntry">
          <view class="item-icon-wrap">
            <text class="item-icon">📝</text>
          </view>
          <text class="item-name">扫码录入</text>
          <text class="item-desc">扫描二维码录入样本</text>
        </view>

        <!-- 报告查询 -->
        <view class="entry-item success" @click="goToReportQuery">
          <view class="item-icon-wrap">
            <text class="item-icon">🔍</text>
          </view>
          <text class="item-name">报告查询</text>
          <text class="item-desc">查看检测报告</text>
        </view>
      </view>
    </view>

    <!-- 功能模块 -->
    <view class="features-section">
      <view class="section-title">
        <text class="title-text">更多功能</text>
      </view>

      <view class="feature-list">
        <!-- 我的报告 -->
        <view class="feature-item" @click="goToMyReports">
          <view class="feature-left">
            <text class="feature-icon">📊</text>
            <view class="feature-info">
              <text class="feature-name">我的报告</text>
              <text class="feature-desc">查看历史检测报告</text>
            </view>
          </view>
          <text class="feature-arrow">→</text>
        </view>

        <!-- 关于我们 -->
        <view class="feature-item" @click="goToAbout">
          <view class="feature-left">
            <text class="feature-icon">ℹ️</text>
            <view class="feature-info">
              <text class="feature-name">关于我们</text>
              <text class="feature-desc">了解平台信息</text>
            </view>
          </view>
          <text class="feature-arrow">→</text>
        </view>

        <!-- 联系客服 -->
        <view class="feature-item" @click="contactService">
          <view class="feature-left">
            <text class="feature-icon">📞</text>
            <view class="feature-info">
              <text class="feature-name">联系客服</text>
              <text class="feature-desc">客服热线：400-888-8888</text>
            </view>
          </view>
          <text class="feature-arrow">→</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'

const { initAuth } = useAuth()

onLoad(() => {
  // 初始化登录状态
  initAuth()
})

// 跳转到样本录入（扫码）
const goToSampleEntry = async () => {
  uni.navigateTo({
    url: '/pages/sample-entry/index'
  })
}

// 跳转到报告查询
const goToReportQuery = () => {
  uni.navigateTo({
    url: '/pages/report-query/index'
  })
}

// 跳转到我的报告
const goToMyReports = () => {
  uni.navigateTo({
    url: '/pages/report-query/index'
  })
}

// 跳转到关于我们
const goToAbout = () => {
  uni.navigateTo({
    url: '/pages/about/index'
  })
}

// 跳转到个人中心
const goToMine = () => {
  uni.switchTab({
    url: '/pages/mine/mine'
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
.home-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.banner-section {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  overflow: hidden;
}

.banner-content {
  position: relative;
  z-index: 2;
}

.banner-title {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
}

.banner-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
}

.banner-bg {
  position: absolute;
  right: 40rpx;
  bottom: 20rpx;
  width: 200rpx;
  height: 200rpx;
  opacity: 0.2;
  z-index: 1;
}

.quick-entry-section {
  margin-top: -40rpx;
  padding: 0 30rpx;
  position: relative;
  z-index: 3;
}

.section-title {
  padding: 0 10rpx 20rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.entry-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 20rpx;
  background: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.entry-item.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.entry-item.success {
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
}

.item-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.item-icon {
  font-size: 56rpx;
}

.item-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 8rpx;
}

.item-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
}

.features-section {
  margin-top: 40rpx;
  padding: 0 30rpx;
}

.feature-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.feature-icon {
  font-size: 44rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.feature-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
}

.feature-arrow {
  font-size: 36rpx;
  color: #ccc;
}
</style>
