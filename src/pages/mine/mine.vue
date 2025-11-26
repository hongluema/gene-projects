<template>
  <view class="mine-page">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="user-info-card">
        <image v-if="userInfo.gender === 'male'" class="user-avatar" src="/static/male-avatar.png" mode="aspectFill" />
        <image v-else class="user-avatar" src="/static/female-avatar.png" mode="aspectFill" />
        <view class="user-details">
          <text class="user-name">{{ userInfo.phone ? userInfo.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') : '未登录' }}</text>
          <text class="user-name">{{ userInfo.name }}</text>
        </view>
        <view v-if="!userInfo.phone" class="auth-btn" @click="goToLogin">
          <text class="auth-text">登录</text>
        </view>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-stats">
      <view class="stat-item" @click="goToReportQuery(reportList)">
        <text class="stat-number">{{ reportList.length }}</text>
        <text class="stat-label">我的报告</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goToReportQuery(progressingReportList)">
        <text class="stat-number">{{ progressingReportList.length }}</text>
        <text class="stat-label">检测中</text>
      </view>
      <view class="stat-divider"></view>
      <view class="stat-item" @click="goToReportQuery(progressedReportList)">
        <text class="stat-number">{{ progressedReportList.length }}</text>
        <text class="stat-label">已完成</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @click="goToProfile">
          <view class="menu-left">
            <text class="menu-icon">👤</text>
            <text class="menu-text">个人信息</text>
          </view>
          <view class="menu-right">
            <text class="menu-value">{{ userInfo.id_number ? '已完善' : '未完善' }}</text>
            <text class="menu-arrow">→</text>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="goToReportQuery(reportList.value)">
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

      <view v-if="isLogin" class="menu-group">
        <view class="menu-item danger" @click="handleLogout">
          <view class="menu-left">
            <text class="menu-icon">🚪</text>
            <text class="menu-text">退出登录</text>
          </view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useAuth } from '@/composables/useAuth'
import { API } from '@/config'

const {
  isLogin,
  initAuth,
  userInfo,
  logout
} = useAuth()
const reportList = ref([])
const progressingReportList = ref([])
const progressedReportList = ref([])

onLoad(() => {
  console.log('>>>>mine init');
  initAuth();
  fetchReportList();
})

onShow(() => {
  // 每次显示时刷新状态
  initAuth()
})

// 跳转到登录页
const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}

// 跳转到个人信息页
const goToProfile = () => {
  if (!isLogin.value) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      goToLogin()
    }, 500)
    return
  }
  uni.navigateTo({
    url: '/pages/profile/profile'
  })
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '确认退出',
    content: '退出后将清除本地登录信息，确定要退出吗？',
    success: (res) => {
      if (res.confirm) {
        logout()
      }
    }
  })
}

// 获取报告列表
const fetchReportList = async () => {

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
        const reportResData = res.data.data || [];
        reportList.value = reportResData;
        progressingReportList.value = reportResData.filter(item => item.process === 'progressing');
        progressedReportList.value = reportResData.filter(item => item.process === 'progressed');
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
  }
}
  
// 跳转到报告查询
const goToReportQuery = (data) => {
  console.log('>>>>data', data);
  uni.navigateTo({
    url: `/pages/report-list/index?data=${encodeURIComponent(JSON.stringify(data))}`
  })
}


// 跳转到样本录入
const goToSampleEntry = () => {
  uni.navigateTo({
    url: '/pages/sample-entry/index'
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

</style>
