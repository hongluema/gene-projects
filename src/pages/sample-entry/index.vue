<template>
  <view class="sample-entry-page">
    <!-- 顶部标题 -->
    <view class="page-header">
      <text class="page-title">样本信息录入</text>
    </view>

    <view class="form-container">
      <!-- 项目信息卡片 -->
      <view class="card project-card">
        <view class="card-title">
          <text class="title-icon">📋</text>
          <text>项目信息</text>
        </view>
        <view class="project-info">
          <!-- 未加载项目信息时显示 -->
          <view v-if="!projectInfo.projectId" class="input-options">
            <view class="option-buttons">
              <button class="option-btn primary" @click="handleScanProject">
                <text class="btn-icon">📷</text>
                扫描二维码
              </button>
              <button class="option-btn secondary" @click="showProjectInput = true">
                <text class="btn-icon">✏️</text>
                手动输入
              </button>
            </view>
            
            <!-- 下拉选择项目 -->
            <view v-if="showProjectInput" class="manual-input-area">
              <view class="input-row">
                <text class="input-label">选择项目</text>
                <picker mode="selector" :range="projectOptions" range-key="label" @change="onProjectChange">
                  <view class="input-field">{{ selectedProjectLabel }}</view>
                </picker>
              </view>
              <view class="input-row">
                <text class="input-label">选择机构</text>
                <picker mode="selector" :range="institutionOptions" range-key="label" @change="onInstitutionChange">
                  <view class="input-field">{{ selectedInstitutionLabel }}</view>
                </picker>
              </view>
              <button class="confirm-btn" @click="loadProjectManually">确认</button>
            </view>
          </view>
          
          <!-- 已加载项目信息 -->
          <view v-else class="info-rows">
            <view class="info-row">
              <text class="label">项目名称：</text>
              <text class="value">{{ projectInfo.projectName }}</text>
            </view>
            <view class="info-row">
              <text class="label">检测机构：</text>
              <text class="value">{{ projectInfo.institutionName }}</text>
            </view>
            <view class="info-row">
              <text class="label">项目描述：</text>
              <text class="value desc">{{ projectInfo.description }}</text>
            </view>
            <button class="reset-btn" @click="resetProject">重新选择</button>
          </view>
        </view>
      </view>

      <!-- 身份信息表单 -->
      <view class="card">
        <view class="card-title">
          <text class="title-icon">👤</text>
          <text>身份信息</text>
          <button class="scan-mini-btn" @click="showIdCardOptions">
            <text class="mini-icon">📷</text>
            快速识别
          </button>
        </view>
        <view class="form-group">
          <view class="form-item">
            <text class="form-label required">姓名</text>
            <input 
              class="form-input" 
              v-model="formData.name" 
              placeholder="请输入姓名"
              placeholder-class="input-placeholder"
            />
          </view>
          <view class="form-item">
            <text class="form-label required">身份证号</text>
            <input 
              class="form-input" 
              v-model="formData.id_number" 
              placeholder="请输入身份证号"
              placeholder-class="input-placeholder"
              maxlength="18"
              @blur="onIdCardBlur"
            />
          </view>
          <view class="form-item">
            <text class="form-label required">性别</text>
            <view class="gender-group">
              <view 
                class="gender-btn" 
                :class="{ active: formData.gender === '男' }"
                @click="formData.gender = '男'"
              >
                <text>男</text>
              </view>
              <view 
                class="gender-btn" 
                :class="{ active: formData.gender === '女' }"
                @click="formData.gender = '女'"
              >
                <text>女</text>
              </view>
            </view>
          </view>
          <view class="form-item">
            <text class="form-label">年龄</text>
            <input 
              class="form-input" 
              v-model="formData.age" 
              type="number"
              placeholder="请输入年龄"
              placeholder-class="input-placeholder"
            />
          </view>
        </view>
      </view>

      <!-- 联系信息 -->
      <view class="card">
        <view class="card-title">
          <text class="title-icon">📞</text>
          <text>联系方式</text>
        </view>
        <view class="form-group">
          <view class="form-item">
            <text class="form-label required">手机号</text>
            <input 
              class="form-input" 
              v-model="formData.phone" 
              type="number"
              placeholder="请输入手机号"
              placeholder-class="input-placeholder"
              maxlength="11"
            />
          </view>
        </view>
      </view>

      <!-- 样本信息 -->
      <view class="card">
        <view class="card-title">
          <text class="title-icon">🧪</text>
          <text>样本信息</text>
        </view>
        <view class="sample-info">
          <!-- 未录入样本ID -->
          <view v-if="!formData.sampleId" class="input-options">
            <view class="option-buttons">
              <button class="option-btn primary" @click="handleScanSample">
                <text class="btn-icon">📷</text>
                扫描条形码
              </button>
              <button class="option-btn secondary" @click="showSampleInput = true">
                <text class="btn-icon">✏️</text>
                手动输入
              </button>
            </view>
            
            <!-- 手动输入样本ID -->
            <view v-if="showSampleInput" class="manual-input-area">
              <view class="input-row">
                <text class="input-label">样本编号</text>
                <input 
                  class="input-field" 
                  v-model="manualSampleId"
                  placeholder="请输入样本编号"
                />
              </view>
              <button class="confirm-btn" @click="confirmManualSample">确认</button>
            </view>
          </view>
          
          <!-- 已录入样本ID -->
          <view v-else class="sample-result">
            <view class="result-content">
              <text class="sample-label">样本编号</text>
              <text class="sample-id">{{ formData.sampleId }}</text>
            </view>
            <button class="rescan-btn" @click="resetSample">重新录入</button>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-area">
        <button class="submit-btn" @click="handleSubmit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交样本信息' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { scanQRCode, scanBarCode, parseProjectQRCode } from '@/utils/scan'
import { validatePhone, validateIdCard, validateName, parseIdCard } from '@/utils/validator'
import { USE_MOCK, API, API_BASE } from '@/config'
import { mockSubmitSample, mockOcrIdCard } from '@/mock/api'
import { post, get } from '@/utils/request'
import { useAuth } from '@/composables/useAuth'
import dayjs from 'dayjs'

// 登录检查
// const { checkAuth } = useAuth()

const {
  checkAuth,
  initAuth,
  userInfo,
} = useAuth()

// 项目信息
const projectInfo = ref({
  projectId: '',
  projectName: '',
  institutionId: '',
  institutionName: '',
  description: ''
})

// 表单数据
const formData = ref({
  name: '',
  id_number: '',
  gender: '',
  age: '',
  phone: '',
  sampleId: ''
})

const submitting = ref(false)
const showProjectInput = ref(false)
const showSampleInput = ref(false)
const manualProjectId = ref('')
const manualInstitutionId = ref('')
const manualSampleId = ref('')

// 项目下拉选项
const projectOptions = ref([])
const selectedProjectIndex = ref(-1)
const selectedProjectLabel = computed(() => {
  const idx = selectedProjectIndex.value
  if (idx >= 0 && idx < projectOptions.value.length) return projectOptions.value[idx].label
  return '请选择项目'
})

const onProjectChange = (e) => {
  const idx = Number(e?.detail?.value ?? -1)
  if (idx >= 0 && idx < projectOptions.value.length) {
    selectedProjectIndex.value = idx
    manualProjectId.value = projectOptions.value[idx].value
  }
}

// 机构下拉选项
const institutionOptions = ref([])
const selectedInstitutionIndex = ref(-1)
const selectedInstitutionLabel = computed(() => {
  const idx = selectedInstitutionIndex.value
  if (idx >= 0 && idx < institutionOptions.value.length) return institutionOptions.value[idx].label
  return '请选择机构'
})

const onInstitutionChange = (e) => {
  const idx = Number(e?.detail?.value ?? -1)
  if (idx >= 0 && idx < institutionOptions.value.length) {
    selectedInstitutionIndex.value = idx
    manualInstitutionId.value = institutionOptions.value[idx].value
  }
}

// 加载项目列表（供下拉选择）
const projectsFetched = ref(false)
const fetchProjects = async () => {
  try {
    uni.showLoading({ title: '加载项目...' })
    console.log('>>>>res projects');
    const res = await uni.request({
      url: `${API_BASE}/api/projects`,
      method: 'GET',
    })
    console.log('>>>>res projects', res);
    let list = res.data.data?.list || [];
    projectOptions.value = (list || []).map((item) => ({
      label: item?.name,
      value: item?.id
    })).filter(x => x.value)
    console.log('>>>>projectOptions', res);
    projectsFetched.value = true
  } catch (err) {
    console.error('[SampleEntry] Fetch projects fail:', err)
    uni.showToast({ title: '加载项目列表失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 加载机构列表（供下拉选择）
const institutionsFetched = ref(false)
const fetchInstitutions = async () => {
  try {
    uni.showLoading({ title: '加载机构...' })
    // const res = await get('http://localhost:8002/api/institutions')
    // const res = await uni.request({
    //   url: `${API_BASE}/api/institutions`,
    //   method: 'GET',
    // })
    // console.log('>>>>res institutions', res);
    let list = [{name: '测试机构', id: '213399541418954752'}];
    institutionOptions.value = (list || []).map((item) => ({
      label: item?.name,
      value: item?.id
    })).filter(x => x.value)
    // console.log('>>>>institutionOptions', res);
    institutionsFetched.value = true
  } catch (err) {
    console.error('[SampleEntry] Fetch institutions fail:', err)
    uni.showToast({ title: '加载机构列表失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

watch(showProjectInput, (val) => {
  if (val && !projectsFetched.value) fetchProjects()
  if (val && !institutionsFetched.value) fetchInstitutions()
})

// 页面加载时检查是否有二维码参数
onLoad(async (options) => {
  await initAuth();
  console.log('[SampleEntry] onLoad options:', options)

  // 登录检查（会自动初始化）
  if (!checkAuth()) {
    return
  }

  // 先加载项目和机构列表，用于回显
  await Promise.all([fetchProjects(), fetchInstitutions()])

  if (options.qrCode) {
    // 从二维码进入
    const qrData = decodeURIComponent(options.qrCode)
    loadProjectFromQRCode(qrData)
  } else if (options.projectId) {
    // 直接传入项目ID
    loadProject(options.projectId, options.institutionId || '')
  }
})

// 扫描项目二维码
const handleScanProject = async () => {
  try {
    const result = await scanQRCode()
    await loadProjectFromQRCode(result)
  } catch (err) {
    console.error('[SampleEntry] Scan project fail:', err)
    // 用户取消扫码不提示错误
  }
}

// 从二维码加载项目信息
const loadProjectFromQRCode = async (qrData) => {
  const data = await parseProjectQRCode(qrData)
  console.log('>>>program_id', data);
  if (!data.projectId) {
    uni.showToast({ title: '无效的项目二维码', icon: 'none' })
    return
  }
  await loadProject(data.projectId, data.institutionId)
}

// 手动输入项目ID并加载
const loadProjectManually = async () => {
  if (!manualProjectId.value) {
    uni.showToast({ title: '请选择项目', icon: 'none' })
    return
  }

  // 直接使用用户选择的数据
  const selectedProject = projectOptions.value[selectedProjectIndex.value]
  const selectedInstitution = institutionOptions.value[selectedInstitutionIndex.value]

  projectInfo.value.projectId = manualProjectId.value
  projectInfo.value.projectName = selectedProject?.label || ''
  projectInfo.value.institutionId = manualInstitutionId.value
  projectInfo.value.institutionName = selectedInstitution?.label || ''
  projectInfo.value.description = '' // 手动选择时没有描述信息

  showProjectInput.value = false
  uni.showToast({ title: '项目信息已加载', icon: 'success' })
}

// 加载项目信息
const loadProject = async (projectId, institutionId) => {
  uni.showLoading({ title: '加载中...' })
  try {
    // 直接从已加载的列表中查找项目信息
    const projectInList = projectOptions.value.find(p => p.value == projectId)
    if (!projectInList) {
      uni.showToast({ title: '未找到对应的项目', icon: 'none' })
      return
    }

    projectInfo.value.projectId = projectId
    projectInfo.value.projectName = projectInList.label
    projectInfo.value.description = '' // 列表中没有描述信息

    // 从已加载的列表中查找机构信息
    if (institutionId) {
      const institutionInList = institutionOptions.value.find(inst => inst.value == institutionId)
      if (institutionInList) {
        projectInfo.value.institutionId = institutionId
        projectInfo.value.institutionName = institutionInList.label
      }
    }

    showProjectInput.value = false
    uni.showToast({ title: '项目信息已加载', icon: 'success' })
  } catch (err) {
    console.error('[SampleEntry] Load project fail:', err)
    uni.showToast({ title: '加载项目信息失败', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 重置项目信息
const resetProject = () => {
  projectInfo.value = {
    projectId: '',
    projectName: '',
    institutionId: '',
    institutionName: '',
    description: ''
  }
  manualProjectId.value = ''
  showProjectInput.value = false
}

// 显示身份证识别选项
const showIdCardOptions = () => {
  uni.showActionSheet({
    itemList: ['拍照识别身份证', '从相册选择'],
    success: (res) => {
      if (res.tapIndex === 0) {
        chooseIdCardImage('camera')
      } else if (res.tapIndex === 1) {
        chooseIdCardImage('album')
      }
    }
  })
}

// 选择身份证图片
const chooseIdCardImage = (sourceType) => {
  uni.chooseImage({
    count: 1,
    sourceType: [sourceType],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0]
      performIdCardOCR(tempFilePath)
    }
  })
}

// 执行身份证OCR识别
const performIdCardOCR = async (imagePath) => {
  uni.showLoading({ title: '识别中...' })
  
  try {
    let ocrData
    if (USE_MOCK) {
      const res = await mockOcrIdCard(imagePath)
      ocrData = res.data
    } else {
      // 实际项目中需要先上传图片，然后调用OCR接口
      const res = await post(API.ocrIdCard, { image: imagePath })
      ocrData = res.data
    }

    formData.value.name = ocrData.name
    formData.value.id_number = ocrData.idCard
    formData.value.gender = ocrData.gender
    
    // 从身份证号解析年龄
    const parsed = parseIdCard(ocrData.idCard)
    if (parsed) {
      formData.value.age = parsed.age
      formData.value.gender = parsed.gender
    }

    uni.showToast({ title: '识别成功', icon: 'success' })
  } catch (err) {
    console.error('[SampleEntry] OCR fail:', err)
    uni.showToast({ title: 'OCR识别失败，请手动填写', icon: 'none' })
  } finally {
    uni.hideLoading()
  }
}

// 身份证号失焦时自动解析
const onIdCardBlur = () => {
  if (validateIdCard(formData.value.id_number)) {
    const parsed = parseIdCard(formData.value.id_number)
    if (parsed) {
      // 只在未填写时自动填充
      if (!formData.value.gender) {
        formData.value.gender = parsed.gender
      }
      if (!formData.value.age) {
        formData.value.age = parsed.age
      }
    }
  }
}

// 扫描样本条形码
const handleScanSample = async () => {
  try {
    const result = await scanBarCode()
    formData.value.sampleId = result
    showSampleInput.value = false
    uni.showToast({ title: '样本条形码已识别', icon: 'success' })
  } catch (err) {
    console.error('[SampleEntry] Scan sample fail:', err)
    // 用户取消扫码不提示错误
  }
}

// 确认手动输入的样本ID
const confirmManualSample = () => {
  if (!manualSampleId.value) {
    uni.showToast({ title: '请输入样本编号', icon: 'none' })
    return
  }
  formData.value.sampleId = manualSampleId.value
  showSampleInput.value = false
  uni.showToast({ title: '样本编号已录入', icon: 'success' })
}

// 重置样本信息
const resetSample = () => {
  formData.value.sampleId = ''
  manualSampleId.value = ''
  showSampleInput.value = false
}

// 表单验证
const validateForm = () => {
  if (!projectInfo.value.projectId) {
    uni.showToast({ title: '请先加载项目信息', icon: 'none' })
    return false
  }

  if (!validateName(formData.value.name)) {
    uni.showToast({ title: '请输入正确的姓名', icon: 'none' })
    return false
  }

  if (!validateIdCard(formData.value.id_number)) {
    uni.showToast({ title: '请输入正确的身份证号', icon: 'none' })
    return false
  }

  if (!formData.value.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return false
  }

  if (!validatePhone(formData.value.phone)) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' })
    return false
  }

  if (!formData.value.sampleId) {
    uni.showToast({ title: '请录入样本编号', icon: 'none' })
    return false
  }

  return true
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) return
  
  submitting.value = true
  uni.showLoading({ title: '提交中...' })

  try {
    const submitData = {
      customer: {
        // program_id: projectInfo.value.projectId,
        name: formData.value.name,
        id_number: formData.value.id_number,
        gender: formData.value.gender,
        age: formData.value.age,
        phone: formData.value.phone,
        user_id: userInfo.value.user_id,
        // sample_id: formData.value.sampleId
      },
      org_id: projectInfo.value.institutionId,
      samples: [{
        programs: [projectInfo.value.projectId],
        other_code: formData.value.sampleId,
        receive_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        send_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        s_type_id: '1',
      }]
    };
    

    let result
    result = await uni.request({
      url: `${API_BASE}/api/sample/create`,
      method: 'POST',
      data: submitData,
    })
    // if (USE_MOCK) {
    //   result = await mockSubmitSample(submitData)
    // } else {
    //   result = await uni.request({
    //     url: `${API_BASE}/api/samples`,
    //     method: 'POST',
    //     data: submitData,
    //   })
    // }

    uni.hideLoading()
    console.log('>>>>result', result);
    if (result.data.status_code === 200) {
      // 跳转到成功页面
      uni.redirectTo({
        url: `/pages/sample-success/index?sampleId=${result.data.data.other_code_list[0]}`
      })
    } else {
      uni.showToast({ title: '提交失败', icon: 'none' })
    }
  } catch (err) {
    console.error('[SampleEntry] Submit fail:', err)
    uni.hideLoading()
    uni.showToast({ title: '提交失败，请重试', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.sample-entry-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 40rpx;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 40rpx;
  text-align: center;
}

.page-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.form-container {
  padding: 20rpx 30rpx;
}

.card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx;
  position: relative;
}

.title-icon {
  font-size: 36rpx;
  margin-right: 12rpx;
}

.scan-mini-btn {
  position: absolute;
  right: 0;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
  background: #667eea;
  color: #fff;
  border-radius: 30rpx;
  border: none;
}

.mini-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.project-info,
.sample-info {
  padding: 20rpx 0;
}

.input-options {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.option-buttons {
  display: flex;
  gap: 20rpx;
}

.option-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  /* padding: 32rpx 20rpx; */
  border-radius: 16rpx;
  border: none;
  font-size: 28rpx;
}

.option-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.option-btn.secondary {
  background: #f5f7fa;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.btn-icon {
  font-size: 40rpx;
  height: 60rpx;
}

.manual-input-area {
  padding: 24rpx;
  background: #f5f7fa;
  border-radius: 12rpx;
}

.input-row {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.input-label {
  font-size: 26rpx;
  color: #666;
}

.input-field {
  padding: 20rpx;
  background: #fff;
  border-radius: 8rpx;
  font-size: 28rpx;
  border: 2rpx solid #e8e8e8;
}

.confirm-btn {
  width: 100%;
  padding: 12rpx;
  background: #667eea;
  color: #fff;
  font-size: 28rpx;
  border-radius: 8rpx;
  border: none;
}

.info-rows {
  padding: 10rpx 0;
}

.info-row {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-size: 28rpx;
  color: #666;
  width: 180rpx;
  flex-shrink: 0;
}

.info-row .value {
  font-size: 28rpx;
  color: #333;
  flex: 1;
}

.info-row .value.desc {
  color: #999;
}

.reset-btn {
  width: 100%;
  margin-top: 20rpx;
  padding: 8rpx;
  background: #f5f7fa;
  color: #666;
  font-size: 26rpx;
  border-radius: 8rpx;
  border: none;
}

.form-group {
  padding: 10rpx 0;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  font-size: 28rpx;
  color: #333;
  width: 160rpx;
  flex-shrink: 0;
}

.form-label.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 4rpx;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  padding: 12rpx 20rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
}

.input-placeholder {
  color: #bbb;
}

.gender-group {
  flex: 1;
  display: flex;
  gap: 20rpx;
}

.gender-btn {
  flex: 1;
  text-align: center;
  padding: 16rpx;
  background: #f5f7fa;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  border: 2rpx solid transparent;
}

.gender-btn.active {
  background: #e6f0ff;
  color: #667eea;
  border-color: #667eea;
}

.sample-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx;
  background: #f0f9ff;
  border-radius: 12rpx;
  border: 2rpx solid #91d5ff;
}

.result-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.sample-label {
  font-size: 24rpx;
  color: #1890ff;
}

.sample-id {
  font-size: 32rpx;
  color: #1890ff;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

.rescan-btn {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  background: #fff;
  color: #1890ff;
  border: 1rpx solid #1890ff;
  border-radius: 30rpx;
}

.submit-area {
  margin-top: 40rpx;
  padding: 0 30rpx;
}

.submit-btn {
  width: 100%;
  padding: 12rpx;
  font-size: 32rpx;
  font-weight: bold;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50rpx;
  border: none;
}

.submit-btn[disabled] {
  opacity: 0.6;
}
</style>
