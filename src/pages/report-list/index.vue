<template>
  <view class="report-list-page">
    <!-- 顶部 -->
    <view class="page-header">
      <text class="page-title">我的报告</text>
      <text class="page-desc">共 {{ reportList.length }} 份报告</text>
    </view>

    <view class="list-container">
      <!-- 报告列表 -->
      <view v-if="reportList.length > 0" class="report-list">
        <view 
          v-for="item in reportList" 
          :key="item.id"
          class="report-item"
          @click="viewReport(item)"
        >
          <!-- 状态标签 -->
          <view class="status-badge" :class="getStatusClass(item.status)">
            {{ item.statusText }}
          </view>

          <!-- 报告信息 -->
          <view class="report-info">
            <view class="info-row main">
              <text class="project-name">{{ item.projectName }}</text>
            </view>
            <view class="info-row">
              <text class="label">样本编号：</text>
              <text class="value">{{ item.sampleId }}</text>
            </view>
            <view class="info-row">
              <text class="label">检测机构：</text>
              <text class="value">{{ item.institutionName }}</text>
            </view>
            <view class="info-row">
              <text class="label">采样时间：</text>
              <text class="value">{{ item.createTime }}</text>
            </view>
            <view v-if="item.completeTime" class="info-row">
              <text class="label">完成时间：</text>
              <text class="value">{{ item.completeTime }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="report-actions">
            <button 
              v-if="item.status === 'completed' && item.hasPdf" 
              class="action-btn primary"
              @click.stop="viewReportDetail(item)"
            >
              查看报告
            </button>
            <button 
              v-else-if="item.status === 'testing'" 
              class="action-btn disabled"
              disabled
            >
              检测中...
            </button>
            <button 
              v-else 
              class="action-btn secondary"
            >
              等待检测
            </button>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无报告记录</text>
        <button class="empty-btn" @click="goToEntry">
          去录入样本
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'

// 登录检查
const { checkAuth } = useAuth()

const reportList = ref([])

onLoad((options) => {
  // 登录检查（会自动初始化）
  if (!checkAuth()) {
    return
  }
  
  if (options.data) {
    try {
      reportList.value = JSON.parse(decodeURIComponent(options.data))
    } catch (err) {
      console.error('[ReportList] Parse data fail:', err)
    }
  }
})

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'completed': 'status-success',
    'testing': 'status-process',
    'pending': 'status-default'
  }
  return classMap[status] || 'status-default'
}

// 查看报告详情
const viewReportDetail = (item) => {
  uni.navigateTo({
    url: `/pages/report-detail/index?reportId=${item.id}`
  })
}

// 查看报告（包含未完成的也能点击查看状态）
const viewReport = (item) => {
  if (item.status === 'completed' && item.hasPdf) {
    viewReportDetail(item)
  } else {
    uni.showToast({ 
      title: item.status === 'testing' ? '报告检测中，请耐心等待' : '报告尚未开始检测',
      icon: 'none',
      duration: 2000
    })
  }
}

// 去录入样本
const goToEntry = () => {
  uni.navigateTo({
    url: '/pages/sample-entry/index'
  })
}
</script>

<style scoped>
.report-list-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12rpx;
}

.page-desc {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.list-container {
  padding: 30rpx;
}

.report-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.report-item {
  position: relative;
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.status-badge {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: bold;
}

.status-success {
  background: #f0f9ff;
  color: #52c41a;
}

.status-process {
  background: #e6f0ff;
  color: #1890ff;
}

.status-default {
  background: #fafafa;
  color: #999;
}

.report-info {
  padding-right: 120rpx;
}

.info-row {
  display: flex;
  align-items: flex-start;
  padding: 8rpx 0;
}

.info-row.main {
  padding-bottom: 16rpx;
  margin-bottom: 12rpx;
  border-bottom: 1px solid #f0f0f0;
}

.project-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.label {
  font-size: 26rpx;
  color: #999;
  width: 160rpx;
  flex-shrink: 0;
}

.value {
  flex: 1;
  font-size: 26rpx;
  color: #666;
  word-break: break-all;
}

.report-actions {
  margin-top: 24rpx;
  padding-top: 20rpx;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 20rpx;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.action-btn.secondary {
  background: #f5f7fa;
  color: #999;
}

.action-btn.disabled {
  background: #f5f7fa;
  color: #bbb;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 50rpx;
}

.empty-btn {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}
</style>

