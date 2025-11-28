<template>
  <view class="container">
    <view class="form">
      <van-cell-group>
      <van-field
        label="身份证号"
        placeholder="请输入身份证号"
        :value="form.id_number"
        @change="onChange('id_number', $event)"
        clearable
      />
      <van-field
        label="姓名"
        placeholder="请输入姓名"
        :value="form.name"
        @change="onChange('name', $event)"
        clearable
      />

      <view class="picker-row">
        <text class="picker-label">性别</text>
        <picker mode="selector" :range="genderOptions" range-key="label" @change="onGenderChange">
          <view class="picker-value">{{ genderLabel }}</view>
        </picker>
      </view>

      <van-field
        label="年龄"
        type="number"
        placeholder="请输入年龄"
        :value="form.age"
        @change="onChange('age', $event)"
        clearable
      />

      <van-field
        label="手机号"
        type="number"
        disabled
        placeholder="请输入手机号"
        :value="form.phone"
      />
    </van-cell-group>
      <view class="actions">
        <van-button type="primary" block @click="onSubmit">保存</van-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { USE_MOCK, API } from '@/config'
import { mockUpdateUser } from '@/mock/api'
import { useAuth } from '@/composables/useAuth'

const form = reactive({
  id_number: '',
  name: '',
  gender: '',
  age: '',
  phone: ''
})

const { userId, phone, markProfileComplete } = useAuth()

const genderOptions = [
  { label: '男', value: '男' },
  { label: '女', value: '女' }
]

const genderLabel = computed(() => {
  const g = genderOptions.find((x) => x.value === form.gender)
  return g ? g.label : '请选择性别'
})

const onGenderChange = (e) => {
  const idx = Number(e?.detail?.value ?? -1)
  if (idx >= 0 && idx < genderOptions.length) {
    form.gender = genderOptions[idx].value
  }
}

const onChange = (key, e) => {
  const v = e?.detail?.value ?? e?.detail ?? e?.target?.value ?? ''
  form[key] = v
}

const isMobile = (s) => /^1[3-9]\d{9}$/.test(String(s).trim())
const isIdCard = (s) => /^(\d{15}|\d{17}[\dXx])$/.test(String(s).trim())

const onSubmit = async () => {
  console.log('>>>form', form);
  if (!form.id_number) return uni.showToast({ title: '请输入身份证号', icon: 'none' })
  if (!isIdCard(form.id_number)) return uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
  if (!form.name) return uni.showToast({ title: '请输入姓名', icon: 'none' })
  if (!form.gender) return uni.showToast({ title: '请选择性别', icon: 'none' })
  if ((form.age == null || form.age === '') || (!/^\d{1,3}$/.test(String(form.age).trim()))) return uni.showToast({ title: '年龄需为1-3位数字', icon: 'none' })
  if (form.phone && !isMobile(form.phone)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  if (!userId.value) return uni.showToast({ title: '缺少userId，请重新登录', icon: 'none' })
  const { id_number, name, gender, age, phone } = form;
  const userData = {
    userId: userId.value,
    phone,
    name,
    id_number,
    gender,
    age,
  };
  try {
    await uni.request({
      url: API.updateUser,
      method: 'POST',
      data: { ...userData, user_id: userId.value},
    })
    // 保存到本地缓存
    try { uni.setStorageSync(STORAGE_KEY_USER_INFO, { ...userData})} catch {}
    
    // 标记信息已完善
    markProfileComplete(userData)
    
    uni.showToast({ title: '保存成功', icon: 'success' })
    
    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (e) {
    console.error('[Profile] submit error:', e)
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

onLoad(async () => {
  // // 加载缓存的表单数据
  try {
    const res = await uni.request({
      url: API.getUserInfo,
      method: 'GET',
      data: { user_id: userId.value},
    })
    console.log('>>>>res', res);
    const userInfo = res.data.data;
    if (userInfo) {
      form.id_number = userInfo.id_number || ''
      form.name = userInfo.name || ''
      form.gender = userInfo.gender || ''
      form.age = userInfo.age || ''
      form.phone = userInfo.phone || ''
    }
  } catch {}
  
  // 如果手机号为空，自动填充登录时的手机号
  if (!form.phone && phone.value) {
    form.phone = phone.value
    console.log('[Profile] 自动填充登录手机号:', phone.value)
  }
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.form {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.picker-label {
  color: #323233;
  font-size: 28rpx;
}
.picker-value {
  color: #969799;
  font-size: 28rpx;
}
.actions {
  padding: 24rpx 32rpx 40rpx;
}
</style>
