<template>
  <view class="container">
    <view class="header">
      <text class="header-title">基因检测报告</text>
    </view>

  <view class="content">
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
          <button class="detail-btn" @click="viewDetail">查看详情1</button>
        </view>

        <!-- #ifdef MP -->
        <view class="btn-container" style="margin-top: 20rpx;">
          <van-button type="primary" block @click="viewDetail">Vant 按钮（小程序）</van-button>
        </view>
        <!-- #s -->
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'

onLoad(async () => {
  const res = await uni.request({
    url: 'http://localhost:8080/user',
    method: 'POST',
    data: {},
    header: { 'Content-Type': 'application/json' }
  })
  console.log('>>>>res', res)
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
