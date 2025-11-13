<template>
  <view class="success-page">
    <view class="success-content">
      <!-- 成功图标 -->
      <view class="success-icon">
        <text class="icon-text">✓</text>
      </view>

      <!-- 成功提示 -->
      <view class="success-title">提交成功！</view>
      <view class="success-desc">样本信息已成功录入系统</view>

      <!-- 样本信息卡片 -->
      <view class="sample-card">
        <view class="card-row highlight">
          <text class="row-label">样本编号</text>
          <text class="row-value">{{ sampleId }}</text>
        </view>
        <view class="card-row">
          <text class="row-label">录入时间</text>
          <text class="row-value">{{ submitTime }}</text>
        </view>
      </view>

      <!-- 提示信息 -->
      <view class="tips-box">
        <view class="tips-title">📌 温馨提示</view>
        <view class="tips-content">
          <text class="tip-item">• 请妥善保管样本编号</text>
          <text class="tip-item">• 可使用手机号或身份证号查询报告</text>
          <text class="tip-item">• 报告生成后会通知您</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-btns">
        <button class="btn btn-primary" @click="goToReportQuery">
          查询报告
        </button>
        <button class="btn btn-secondary" @click="continueEntry">
          继续录入
        </button>
        <button class="btn btn-text" @click="goToHome">
          返回首页
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const sampleId = ref('')
const submitTime = ref('')

onLoad((options) => {
  sampleId.value = options.sampleId || ''
  
  // 获取当前时间
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  submitTime.value = `${year}-${month}-${day} ${hours}:${minutes}`
})

// 查询报告
const goToReportQuery = () => {
  uni.navigateTo({
    url: '/pages/report-query/index'
  })
}

// 继续录入
const continueEntry = () => {
  uni.redirectTo({
    url: '/pages/sample-entry/index'
  })
}

// 返回首页
const goToHome = () => {
  uni.switchTab({
    url: '/pages/index/index'
  })
}
</script>

<style scoped>
.success-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.success-content {
  width: 100%;
  max-width: 680rpx;
}

.success-icon {
  width: 160rpx;
  height: 160rpx;
  margin: 0 auto 40rpx;
  background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(82, 196, 26, 0.3);
}

.icon-text {
  font-size: 100rpx;
  font-weight: bold;
  color: #fff;
}

.success-title {
  text-align: center;
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.success-desc {
  text-align: center;
  font-size: 28rpx;
  color: #999;
  margin-bottom: 60rpx;
}

.sample-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.card-row:last-child {
  border-bottom: none;
}

.card-row.highlight {
  background: #f0f9ff;
  margin: -10rpx -15rpx 10rpx;
  padding: 20rpx 15rpx;
  border-radius: 12rpx;
  border-bottom: none;
}

.row-label {
  font-size: 28rpx;
  color: #666;
}

.card-row.highlight .row-label {
  color: #1890ff;
  font-weight: bold;
}

.row-value {
  font-size: 28rpx;
  color: #333;
}

.card-row.highlight .row-value {
  color: #1890ff;
  font-size: 32rpx;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.tips-box {
  background: #fffbe6;
  border: 2rpx solid #ffe58f;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 40rpx;
}

.tips-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #faad14;
  margin-bottom: 16rpx;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tip-item {
  font-size: 26rpx;
  color: #8c8c8c;
  line-height: 1.6;
}

.action-btns {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.btn {
  width: 100%;
  padding: 28rpx;
  font-size: 30rpx;
  border-radius: 50rpx;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.btn-secondary {
  background: #fff;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.btn-text {
  background: transparent;
  color: #999;
  font-size: 28rpx;
}
</style>

