<template>
  <view class="report-list-page">
    <!-- 顶部 -->
    <view class="page-header">
      <text class="page-title">{{ getPageTitle() }}</text>
      <text class="page-desc">共 {{ reportList.length }} 份</text>
    </view>
    <view class="query-container" :class="{ 'no-tabs': true }">
    <!-- Tab切换 -->
      <view class="tab-bar" v-if="false">
        <view 
          class="tab-item" 
          :class="{ active: queryType === 'my' }"
          @click="queryType = 'my'"
        >
          <!-- <text class="tab-icon">📱</text> -->
          <text>我的报告</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: queryType === 'entry' }"
          @click="queryType = 'entry'"
        >
          <!-- <text class="tab-icon">🪪</text> -->
          <text>录入报告</text>
        </view>
      </view>

      <view class="list-container">
      <!-- 报告列表 -->
      <view v-if="reportList.length > 0" class="report-list">
        <view 
          v-for="item in reportList" 
          :key="item.id"
          class="report-item"
          @click="viewReportDetail(item, item.process)"
        >
          <!-- 状态标签 -->
          <view class="status-badge" :class="item.phone === userInfo.phone ? 'status-success' : 'status-process'">
            {{ getReportTypeLabel(item) }}
          </view>

          <!-- 报告信息 -->
          <view class="report-info">
            <view class="info-row main">
              <text class="project-name">{{ item.program_name }}</text>
            </view>
            <view class="info-row">
              <text class="label">检测人姓名：</text>
              <text class="value">{{ item.name }}</text>
            </view>
            <!-- <view class="info-row">
              <text class="label">检测机构：</text>
              <text class="value">{{ '测试机构' || item.org_id }}</text>
            </view> -->
            <view class="info-row">
              <text class="label">采样时间：</text>
              <text class="value">{{ formatDateTime(item.created_at) }}</text>
            </view>
            <view v-if="item.completeTime" class="info-row">
              <text class="label">完成时间：</text>
              <text class="value">{{ formatDateTime(item.completeTime) }}</text>
            </view>
          </view>

          <!-- 操作按钮 -->
          <view class="report-actions">
            <button 
              v-if="item.sample_data_name" 
              class="action-btn primary"
              @click.stop="viewReportDetail(item, item.process)"
            >
              查看报告
            </button>
            <button 
              v-else-if="item.process === 'progressing'" 
              class="action-btn disabled"
              @click.stop="viewReportDetail(item, item.process)"
            >
              {{ item.process === 'progressing' ? '检测中...' : '待送样' }}
            </button>
            <!-- <button 
              v-else 
              class="action-btn secondary"
            >
              等待检测
            </button> -->
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <!-- <text class="empty-icon">📋</text> -->
        <text class="empty-text">暂无报告记录</text>
        <button class="empty-btn" @click="goToEntry">
          去录入样本
        </button>
      </view>
    </view>
    </view>

    
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'
import { API } from '@/config'
import dayjs from 'dayjs'

// 登录检查
const { checkAuth, userInfo } = useAuth()

// 格式化日期时间
const formatDateTime = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

const queryType = ref('all'); // all: 全部, my: 我的, entry: 录入
const statusType = ref(''); // waiting: 待送样, progressing: 检测中, progressed: 已完成
const reportList = ref([])
const loading = ref(false)
const fromQuery = ref(false); // 从查询页面跳转过来 - 那边已经获取好数据了，这里不需要再获取了

onLoad((options) => {
  // 登录检查（会自动初始化）
  if (!checkAuth()) {
    return
  }

  if (options.type) {
    queryType.value = options.type;
  }

  if (options.status) {
    statusType.value = options.status;
  }

  if (options.data) {
    try {
      reportList.value = JSON.parse(decodeURIComponent(options.data));
      console.log('>>>>>reportList', reportList.value);
      fromQuery.value = true;
    } catch (err) {
      console.error('[ReportList] Parse data fail:', err)
    }
  } else {
    // 初始加载数据
    fetchReportList()
  }
})

// 监听 tab 切换
// watch(queryType, () => {
//   fetchReportList()
// })

// 获取报告列表
const fetchReportList = async () => {
  if (loading.value) return

  loading.value = true

  try {
    let url = API.getSamplesByMy;
    let params = { phone: userInfo.value.phone,  user_id: userInfo.value.user_id}

    // if (queryType.value === 'my') {
    //   // 我的报告 - 根据手机号查询
    //   url = API.getSamplesByPhone
    //   params = { phone: phone.value }
    // } else {
    //   // 录入报告 - 根据用户ID查询
    //   url = API.getSamplesByUserId
    //   params = { user_id: userId.value }
    // }

    console.log('[ReportList] Fetching data:', { url, params })

    const res = await uni.request({
      url,
      method: 'GET',
      data: params
    })

    console.log('[ReportList] Response:', res)

    if (res.statusCode === 200 && res.data) {
      // 根据实际接口返回的数据结构调整
      if (res.data.status_code === 200 || res.data.data) {
        let reportResult = [];
        if (queryType.value === 'my') {
          reportResult = res.data.data.filter(item => item.phone === userInfo.value.phone) || [];
        } else if (queryType.value === 'entry') {
          reportResult = res.data.data.filter(item => item.phone !== userInfo.value.phone) || [];
        } else {
          reportResult = res.data.data || [];
        }
        reportList.value = reportResult;
      } else {
        uni.showToast({
          title: res.data.message || '获取数据失败',
          icon: 'none'
        })
      }
    } else {
      throw new Error('请求失败')
    }
  } catch (err) {
    console.error('[ReportList] Fetch error:', err)
    uni.showToast({
      title: JSON.stringify(err),
      icon: 'none'
    })
    // 失败时清空列表
    reportList.value = []
  } finally {
    loading.value = false
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  const classMap = {
    'my' : 'status-success',
  }
  return classMap[status] || 'status-process'
}

// 获取页面标题
const getPageTitle = () => {
  if (statusType.value === 'waiting') {
    return '待送样'
  } else if (statusType.value === 'progressing') {
    return '检测中'
  } else if (statusType.value === 'progressed') {
    return '已完成'
  } else if (queryType.value === 'my') {
    return '我的报告'
  } else if (queryType.value === 'entry') {
    return '录入报告'
  } else {
    return '全部报告'
  }
}

// 获取报告类型标签
const getReportTypeLabel = (item) => {
  if (item.phone === userInfo.value.phone) {
    return '我的'
  }
  return '录入'
}

// 查看报告详情
const viewReportDetail = (item, process) => {
  uni.navigateTo({
    url: `/pages/report-detail/index?data=${encodeURIComponent(JSON.stringify(item))}&process=${process}`
  })
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
  padding: 60rpx 40rpx 50rpx;
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

.query-container {
  margin-top: -40rpx;
  padding: 0 30rpx 40rpx;
}

.query-container.no-tabs {
  margin-top: -20rpx;
  padding: 20rpx 0rpx 40rpx;
}

.tab-bar {
  display: flex;
  background: #fff;
  border-radius: 50rpx;
  padding: 8rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 46rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s;
}

.tab-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.tab-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
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
  padding: 12rpx;
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
  padding: 8rpx 50rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}
</style>

