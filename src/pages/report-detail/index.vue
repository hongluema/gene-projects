<template>
  <view class="report-detail-page">
    <!-- 顶部导航 -->
    <view class="page-header">
      <text class="page-title">检测报告</text>
    </view>

    <view class="detail-container">
      <!-- 报告结果 -->
      <view class="info-card" v-if="isProgressed">
        <view class="card-title">
          <text class="title-icon">📄</text>
          <text>报告结果</text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="item-label">Z值</text>
            <text class="item-value">{{ formatNumber(mongoInfo.p_Z) }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">阴阳性</text>
            <text class="item-value">{{ mongoInfo.result }}</text>
          </view>
          <view v-if="mongoInfo.result === '阳性'">
            <view class="info-item">
              <text class="item-label">癌症溯源</text>
              <text class="item-value">{{ mongoInfo.top1_cancer }}</text>
            </view>
            <!-- <view class="info-item" style="border-bottom: 1px solid #f0f0f0;">
              <text class="item-label">proba</text>
              <text class="item-value">{{ mongoInfo.top1_proba }}</text>
            </view> -->
          </view>
          
          <view class="info-item">
            <text class="item-label">报告时间</text>
            <text class="item-value">{{ mongoInfo.report_date }}</text>
          </view>
        </view>
      </view>

       <!-- PDF预览区域 -->
       <view class="pdf-card" v-if="isProgressed">
        <view class="card-title">
          <text class="title-icon">📋</text>
          <text>报告详情</text>
        </view>
        
        <!-- 小程序中预览PDF较为复杂，这里提供下载按钮 -->
        <!-- <view class="pdf-preview">
          <view class="preview-placeholder">
            <text class="placeholder-icon">📑</text>
            <text class="placeholder-text">点击下方预览按钮查看完整报告</text>
          </view>
        </view> -->

        <!-- 操作按钮 -->
        <view class="pdf-actions">
          <button class="action-btn preview-btn" @click="previewPdf">
            <text class="btn-icon">👁️</text>
            <text>预览报告</text>
          </button>
          <button class="action-btn download-btn" @click="downloadPdf">
            <text class="btn-icon">⬇️</text>
            <text>下载报告</text>
          </button>
        </view>
      </view>

      <!-- 检测单基本信息 -->
      <view class="info-card">
        <view class="card-title">
          <text class="title-icon">📄</text>
          <text>检测单信息</text>
        </view>
        <view class="info-list">
          <view class="info-item">
            <text class="item-label">姓名</text>
            <text class="item-value">{{ reportInfo.name }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">身份证号</text>
            <text class="item-value">{{ reportInfo.id_number }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">性别</text>
            <text class="item-value">{{ reportInfo.gender }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">年龄</text>
            <text class="item-value">{{ reportInfo.age }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">联系方式</text>
            <text class="item-value">{{ reportInfo.phone }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">检测项目</text>
            <text class="item-value">{{ reportInfo.program_name }}</text>
          </view>
          <view class="info-item">
            <text class="item-label">检测机构</text>
            <text class="item-value">{{ reportInfo.org_name || '--'}}</text>
          </view>
          <view class="info-item">
            <text class="item-label">血管编号</text>
            <text class="item-value">{{ reportInfo.code || '--' }}</text>
          </view>
        </view>
      </view>

     

      <!-- 温馨提示 -->
      <view class="tips-card">
        <view class="tips-title">
          <text class="tips-icon">💡</text>
          <text>温馨提示</text>
        </view>
        <view class="tips-content">
          <text class="tip-item">• 本报告仅对本次送检样本负责</text>
          <text class="tip-item">• 请妥善保存报告，如有疑问请咨询专业医师</text>
          <text class="tip-item">• 报告解读需结合临床检查和医生诊断</text>
        </view>
      </view>

      <!-- 联系客服 -->
      <view class="contact-card">
        <button class="contact-btn" @click="contactService">
          <text class="contact-icon">📞</text>
          <text>联系客服</text>
        </button>
        <view v-if="isMyEntry">
          <button v-if="applyStatus === 'pending'" class="contact-btn delete-btn" disabled>
            <text class="contact-icon">🗑️</text>
            <text>已申请作废</text>
          </button>
          <button v-if="!isProgressed && applyStatus === ''" class="contact-btn delete-btn" @click="deleteReport">
            <text class="contact-icon">🗑️</text>
            <text>作废</text>
          </button>
        </view>
        
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { API } from '@/config'
import { previewFile, downloadFile } from '@/utils/request'
import { useAuth } from '@/composables/useAuth'

const {
  userInfo,
} = useAuth()

const reportInfo = ref({})
const mongoInfo = ref({})
const pdfUrl = ref('')
const loading = ref(false)
const error = ref('')
const isProgressed = ref(false);
const applyStatus = ref('');
const isMyEntry = ref(''); // 是不是我录入的
const downloading = ref(false);

// 格式化数字，保留两位小数
const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return value
  }
  const num = Number(value)
  if (isNaN(num)) {
    return value
  }
  // 如果是整数，直接返回；如果有小数，保留两位小数
  return num % 1 === 0 ? num.toString() : num.toFixed(2)
}

onLoad((options) => {
  reportInfo.value = JSON.parse(decodeURIComponent(options.data));
  console.log('>>>>>reportInfo', reportInfo.value, options.process);
  isProgressed.value = options.process === 'progressed'
  // reportId.value = options.reportId || ''
  // reportName.value = options.reportName || ''
  // loadReportPdf()
  loadPdf()
  loadMongoInfo();
  isMyEntry.value = userInfo.value.user_id === reportInfo.value.user_id;
})

onShow(() => {
  console.log('>>>>show');
  getSampleApplyInfo();
})

const getSampleApplyInfo = async () => {
  const res = await uni.request({
    url: API.getApplyInfo,
    method: 'GET',
    data: {
      sample_id: reportInfo.value.sample_id || ''
    }
  })
  console.log('>>>>res apply', res);
  if (res.data.status_code === 200) {
    applyStatus.value = res.data.data.status
  }
}

// 
const loadMongoInfo = async () => {
  const res = await uni.request({
      url: API.getMongoInfoByMongoId,
      method: 'GET',
      data: {
        mongoid: reportInfo.value.mongoid || ''
      }
  })
  console.log('>>>>>res', res);
  mongoInfo.value = res.data.data;
  console.log('>>>>>mongoInfo', mongoInfo.value);
}

// 预览PDF
const previewPdf = () => {
  if (!reportInfo.value.sample_data_id) {
    uni.showToast({ title: '报告ID获取失败', icon: 'none' })
    return
  }
  // TODO: 新的方法 - 开始
  if (downloading.value) return

  downloading.value = true
  previewFile(pdfUrl.value).then(filePath => {
    downloading.value = false
    uni.openDocument({
      filePath: filePath,
      fileType: 'pdf',
      showMenu: true,
      fail: (err) => {
        console.error('[ReportDetail] Open PDF fail:', err)
      }
    })
  }).catch(err => {
    downloading.value = false
    console.error('[ReportDetail] Preview fail:', err)
    uni.showToast({ title: '预览失败', icon: 'none' })
  })
  // 新的方法 - 结束
  return;

  uni.navigateTo({
    url: `/pages/report-preview/index?reportId=${reportInfo.value.sample_data_id}&reportName=${encodeURIComponent(reportInfo.value.sample_data_name || '')}`
  })
}

// 加载PDF
const loadPdf = async () => {
  if (!reportInfo.value.sample_data_id) {
    error.value = '报告ID不能为空'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const url = `${API.getReportPdf}?pk=${reportInfo.value.sample_data_id}`
    console.log('[ReportPreview] Loading PDF from:', url)

    pdfUrl.value = url

    // #ifndef MP
    // 非小程序环境，等待 renderjs 渲染
    loading.value = false
    // #endif

  } catch (err) {
    console.error('[ReportPreview] Load PDF fail:', err)
    error.value = err.message || '加载报告失败'
    loading.value = false
  }
}

// 下载PDF
const downloadPdf = () => {
  if (!pdfUrl.value) {
    uni.showToast({ title: 'PDF地址获取失败', icon: 'none' })
    return
  }

  if (downloading.value) return
  
  downloading.value = true
  uni.showLoading({ title: '下载中...' })

  downloadFile(pdfUrl.value).then(filePath => {
    downloading.value = false
    uni.hideLoading()
    
    uni.showModal({
      title: '下载成功',
      content: '报告已保存到本地，是否立即打开？',
      success: (res) => {
        if (res.confirm) {
          uni.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            showMenu: true,
            fail: (err) => {
              console.error('[ReportDetail] Open PDF fail:', err)
            }
          })
        }
      }
    })
  }).catch(err => {
    downloading.value = false
    uni.hideLoading()
    console.error('[ReportDetail] Download fail:', err)
    uni.showToast({ title: '下载失败', icon: 'none' })
  })
}
// 联系客服
const contactService = () => {
  uni.showModal({
    title: '联系客服',
    content: '客服电话：400-888-8888\n工作时间：周一至周五 9:00-18:00',
    showCancel: true,
    cancelText: '取消',
    confirmText: '拨打电话',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '4008888888'
        })
      }
    }
  })
}

// 申请作废
const deleteReport = () => {
  uni.showModal({
    title: '申请作废',
    content: '是否申请作废？作废后将无法再查看报告。',
    showCancel: true,
    cancelText: '取消',
    confirmText: '申请作废',
    success: async (res) => {
      if (res.confirm) {
        console.log('>>>>>deleteReport', reportInfo.value, userInfo);
        const res = await uni.request({
          url: API.createApply,
          method: 'POST',
          data: {
            apply_user_id: userInfo.value.user_id,
            apply_user_phone: userInfo.value.phone,
            sample_id: reportInfo.value.sample_id,
            type: 1,
          }
        })
        console.log('>>>>res', res);
        if (res.data.status_code === 200) {
          uni.showToast({ title: '申请成功', icon: 'none' })
          uni.navigateBack();
        }
      }
    }
  })
}
</script>

<style scoped>
.report-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32rpx 24rpx 24rpx;
  text-align: center;
}

.page-title {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
}

.detail-container {
  padding: 30rpx;
}

.info-card,
.pdf-card,
.tips-card,
.contact-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
}

.title-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 28rpx;
  color: #666;
}

.item-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  text-align: right;
  max-width: 400rpx;
  word-break: break-all;
}

.pdf-preview {
  margin-bottom: 24rpx;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  background: #f5f7fa;
  border-radius: 16rpx;
  border: 2rpx dashed #d9d9d9;
  cursor: pointer;
}

.preview-placeholder:active {
  opacity: 0.8;
}

.placeholder-icon {
  font-size: 100rpx;
  margin-bottom: 20rpx;
  opacity: 0.5;
}

.placeholder-text {
  font-size: 26rpx;
  color: #999;
}

.pdf-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  /* padding: 24rpx; */
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}

.preview-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.download-btn {
  background: #f5f7fa;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.btn-icon {
  font-size: 32rpx;
}

.tips-card {
  background: #fffbe6;
  border: 2rpx solid #ffe58f;
}

.tips-title {
  display: flex;
  align-items: center;
  font-size: 28rpx;
  font-weight: bold;
  color: #faad14;
  margin-bottom: 16rpx;
}

.tips-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
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

.contact-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  /* padding: 28rpx; */
  background: #fff;
  color: #667eea;
  font-size: 30rpx;
  font-weight: bold;
  border: 2rpx solid #667eea;
  border-radius: 50rpx;
}
.delete-btn {
  margin-top: 16rpx;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  /* padding: 28rpx; */
  background: #dd4545;
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  border: 2rpx solid #fff;
  border-radius: 50rpx;
}

.contact-icon {
  font-size: 36rpx;
}

.preview-modal {
  width: 100%;
  height: 100%;
  position: relative;
  background: #525659;
  display: flex;
  flex-direction: column;
}

.preview-modal-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 30rpx 40rpx;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.5);
}

.preview-modal-close {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #fff;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
}

.preview-modal-content-wrapper {
  width: 100%;
  height: 100%;
  padding-top: 100rpx;
  position: relative;
}

.preview-modal-content {
  width: 100%;
  height: calc(100vh - 100rpx);
  background: #525659;
}

.pdf-modal-canvas-container {
  width: 100%;
  min-height: 100%;
  padding: 20rpx 0;
}

.preview-page-indicator {
  position: fixed;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 24rpx;
  z-index: 1000;
}

.preview-modal-loading,
.preview-modal-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #fff;
}

.error-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.error-text {
  font-size: 32rpx;
  color: #fff;
  text-align: center;
}

.preview-web-view {
  width: 100%;
  height: 100%;
}
</style>

