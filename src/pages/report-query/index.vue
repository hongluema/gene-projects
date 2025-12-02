<template>
  <view class="query-page">
    <!-- 顶部 -->
    <view class="page-header">
      <text class="page-title">报告查询</text>
      <text class="page-desc">请选择查询方式</text>
    </view>

    <view class="query-container">
      <!-- Tab切换 -->
      <view class="tab-bar">
        <view 
          class="tab-item" 
          :class="{ active: queryType === 'phone' }"
          @click="queryType = 'phone'"
        >
          <text class="tab-icon">📱</text>
          <text>手机号查询</text>
        </view>
        <view 
          class="tab-item" 
          :class="{ active: queryType === 'idcard' }"
          @click="queryType = 'idcard'"
        >
          <text class="tab-icon">🪪</text>
          <text>身份证查询</text>
        </view>
      </view>

      <!-- 查询表单 -->
      <view class="query-form">
        <!-- 手机号查询 -->
        <view v-if="queryType === 'phone'" class="form-content">
          <view class="form-item">
            <text class="item-label">手机号</text>
            <input
              class="item-input"
              v-model="phoneForm.mobile"
              type="number"
              maxlength="11"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
            />
          </view>
          <!-- <view class="form-item">
            <text class="item-label">验证码</text>
            <view class="code-input-wrap">
              <input
                class="item-input code-input"
                v-model="phoneForm.code"
                type="number"
                maxlength="6"
                placeholder="请输入验证码"
                placeholder-class="input-placeholder"
              />
              <button
                class="send-code-btn"
                :disabled="codeSending || countdown > 0"
                @click="sendCode"
              >
                {{ countdown > 0 ? `${countdown}秒后重试` : '获取验证码' }}
              </button>
            </view>
          </view> 
          <button class="query-btn" @click="handlePhoneQuery" :disabled="querying">
            {{ querying ? '查询中...' : '查询报告' }}
          </button>
          -->
          <button class="query-btn" @click="handlePhoneQuery" >
            {{ '查询报告' }}
          </button>
        </view>

        <!-- 身份证查询 -->
        <view v-if="queryType === 'idcard'" class="form-content">
          <view class="form-item">
            <text class="item-label">身份证号</text>
            <input
              class="item-input"
              v-model="idCardForm.idCard"
              maxlength="18"
              placeholder="请输入身份证号"
              placeholder-class="input-placeholder"
            />
          </view>
          <view class="form-tip">
            <text class="tip-icon">ℹ️</text>
            <text class="tip-text">为保护隐私，请确认您是本人或经授权查询</text>
          </view>
          <button class="query-btn" @click="handleIdCardQuery" :disabled="querying">
            {{ querying ? '查询中...' : '查询报告' }}
          </button>
        </view>
      </view>

      <!-- 历史查询记录 -->
      <view v-if="filteredHistoryList.length > 0" class="history-section">
        <view class="section-title">
          <text>最近查询</text>
          <text class="clear-btn" @click="clearHistory">清除</text>
        </view>
        <view class="history-list">
          <view
            v-for="(item, index) in filteredHistoryList"
            :key="index"
            class="history-item"
            @click="quickQuery(item)"
          >
            <view class="history-info">
              <text class="history-type">{{ item.type === 'phone' ? '📱' : '🪪' }}</text>
              <text class="history-value">{{ maskSensitive(item.value, item.type) }}</text>
            </view>
            <text class="history-time">{{ item.time }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref, onMounted, computed } from 'vue'
import { validatePhone, validateIdCard, validateCode } from '@/utils/validator'
import { API } from '@/config'
import { useAuth } from '@/composables/useAuth'
import { get, post } from '@/utils/request'

const {
  initAuth,
  userInfo,
} = useAuth()

const queryType = ref('phone')
const querying = ref(false)
const codeSending = ref(false)
const countdown = ref(0)

const phoneForm = ref({
  mobile: '',
  code: ''
})

const idCardForm = ref({
  idCard: ''
})

const historyList = ref([])

// 页面加载时恢复查询历史
onMounted(() => {
  loadQueryHistory()
  initAuth();
})

// onLoad(() => {
//   console.log('>>>>mine init');
  
// })

// onShow(() => {
//   // 每次显示时刷新状态
//   initAuth()
// })

// 根据 queryType 过滤历史记录
const filteredHistoryList = computed(() => {
  return historyList.value.filter(item => item.type === queryType.value)
})




// 加载查询历史
const loadQueryHistory = () => {
  try {
    const history = uni.getStorageSync('QUERY_HISTORY') || []
    historyList.value = history.slice(0, 5) // 只显示最近5条
  } catch {}
}





// 保存查询历史
const saveQueryHistory = (type, value) => {
  const now = new Date()
  const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  
  const newRecord = { type, value, time: timeStr }
  
  // 去重
  const filtered = historyList.value.filter(item => 
    !(item.type === type && item.value === value)
  )
  
  historyList.value = [newRecord, ...filtered].slice(0, 5)
  
  try {
    uni.setStorageSync('QUERY_HISTORY', historyList.value)
  } catch {}
}

// 发送验证码
const sendCode = async () => {
  if (!validatePhone(phoneForm.value.mobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  codeSending.value = true
  
  try {
    // 实际项目中调用发送验证码接口
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    uni.showToast({ title: '验证码已发送', icon: 'success' })
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (err) {
    uni.showToast({ title: '发送失败', icon: 'none' })
  } finally {
    codeSending.value = false
  }
}

// 手机号查询
const handlePhoneQuery = async () => {
  if (!validatePhone(phoneForm.value.mobile)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return
  }

  if (!validateCode(phoneForm.value.code)) {
    uni.showToast({ title: '请输入正确的验证码', icon: 'none' })
    return
  }

  querying.value = true
  uni.showLoading({ title: '查询中...' })

  try {
    const result = await get(API.getSamplesByPhone, {
        phone: phoneForm.value.mobile,
      })
    console.log('>>>>>result phone', result);
    uni.hideLoading()

    if (result && result.length > 0) {
      saveQueryHistory('phone', phoneForm.value.mobile)
      // 我录入的报告 - 其他人的
      const myEntryOthersReport = result.filter(item => item.phone !== userInfo.value.phone);
      // 跳转到报告列表
      uni.navigateTo({
        url: `/pages/report-list/index?data=${encodeURIComponent(JSON.stringify(myEntryOthersReport))}`
      })
    } else {
      uni.showToast({ title: '未找到相关报告', icon: 'none' })
    }
  } catch (err) {
    console.error('[Query] Phone query fail:', err)
    uni.hideLoading()
    uni.showToast({ title: '查询失败', icon: 'none' })
  } finally {
    querying.value = false
  }
}

// 身份证查询
const handleIdCardQuery = async () => {
  if (!validateIdCard(idCardForm.value.idCard)) {
    uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
    return
  }

  querying.value = true
  uni.showLoading({ title: '查询中...' })

  try {
    const result = await get(API.queryReportByIdCard, {
      id_number: idCardForm.value.idCard
      })

    uni.hideLoading()

    if (result && result.length > 0) {
      saveQueryHistory('idcard', idCardForm.value.idCard)
      
      // 跳转到报告列表
      uni.navigateTo({
        url: `/pages/report-list/index?data=${encodeURIComponent(JSON.stringify(result))}`
      })
    } else {
      uni.showToast({ title: '未找到相关报告', icon: 'none' })
    }
  } catch (err) {
    console.error('[Query] IdCard query fail:', err)
    uni.hideLoading()
    uni.showToast({ title: '查询失败', icon: 'none' })
  } finally {
    querying.value = false
  }
}

// 快速查询（从历史记录）
const quickQuery = (item) => {
  if (item.type === 'phone') {
    queryType.value = 'phone'
    phoneForm.value.mobile = item.value
  } else {
    queryType.value = 'idcard'
    idCardForm.value.idCard = item.value
  }
}

// 清除历史
const clearHistory = () => {
  uni.showModal({
    title: '确认',
    content: '确定要清除查询历史吗？',
    success: (res) => {
      if (res.confirm) {
        historyList.value = []
        try {
          uni.removeStorageSync('QUERY_HISTORY')
        } catch {}
        uni.showToast({ title: '已清除', icon: 'success' })
      }
    }
  })
}

// 脱敏显示
const maskSensitive = (value, type) => {
  if (type === 'phone') {
    return value.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  } else {
    return value.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
  }
}
</script>

<style scoped>
.query-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 80rpx;
  text-align: center;
}

.page-title {
  display: block;
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  margin-bottom: 16rpx;
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

.query-form {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.item-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.item-input {
  padding: 24rpx 28rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #333;
}

.input-placeholder {
  color: #bbb;
}

.code-input-wrap {
  display: flex;
  gap: 16rpx;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  width: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #667eea;
  color: #fff;
  font-size: 26rpx;
  border-radius: 12rpx;
  border: none;
  white-space: nowrap;
}

.send-code-btn[disabled] {
  background: #d9d9d9;
  color: #999;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 16rpx 20rpx;
  background: #e6f0ff;
  border-radius: 12rpx;
}

.tip-icon {
  font-size: 28rpx;
}

.tip-text {
  flex: 1;
  font-size: 24rpx;
  color: #1890ff;
  line-height: 1.5;
}

.query-btn {
  margin-top: 20rpx;
  width: 300rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border-radius: 50rpx;
  border: none;
}

.query-btn[disabled] {
  opacity: 0.6;
}

.history-section {
  margin-top: 40rpx;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 10rpx 20rpx;
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
}

.clear-btn {
  font-size: 24rpx;
  color: #999;
  font-weight: normal;
}

.history-list {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.history-item:last-child {
  border-bottom: none;
}

.history-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.history-type {
  font-size: 32rpx;
}

.history-value {
  font-size: 28rpx;
  color: #333;
}

.history-time {
  font-size: 24rpx;
  color: #999;
}
</style>

