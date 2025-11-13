<template>
  <view class="container">
    <view class="form">
      <van-cell-group>
      <van-field
        label="身份证号"
        placeholder="请输入身份证号"
        :value="form.idCard"
        @change="onChange('idCard', $event)"
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
        placeholder="请输入手机号"
        :value="form.mobile"
        @change="onChange('mobile', $event)"
        clearable
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
import { useWxAuth } from '@/composables/useWxAuth'

const form = reactive({
  idCard: '',
  name: '',
  gender: '',
  age: '',
  mobile: ''
})

const { openId } = useWxAuth()

const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
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
  if (!form.idCard) return uni.showToast({ title: '请输入身份证号', icon: 'none' })
  if (!isIdCard(form.idCard)) return uni.showToast({ title: '身份证号格式不正确', icon: 'none' })
  if (form.age && !/^\d{1,3}$/.test(String(form.age))) return uni.showToast({ title: '年龄需为数字', icon: 'none' })
  if (form.mobile && !isMobile(form.mobile)) return uni.showToast({ title: '手机号格式不正确', icon: 'none' })
  if (!openId.value) return uni.showToast({ title: '缺少openId，请返回“我的”页授权', icon: 'none' })

  try {
    if (USE_MOCK) {
      await mockUpdateUser({ openId: openId.value, ...form })
    } else {
      await uni.request({
        url: API.updateUser,
        method: 'POST',
        data: { openId: openId.value, ...form },
        header: { 'Content-Type': 'application/json' }
      })
    }
    try { uni.setStorageSync('USER_PROFILE_FORM', { ...form }) } catch {}
    uni.showToast({ title: '保存成功', icon: 'success' })
    setTimeout(() => {
      uni.navigateBack()
    }, 300)
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

onLoad(() => {
  try {
    const cache = uni.getStorageSync('USER_PROFILE_FORM')
    if (cache) {
      form.idCard = cache.idCard || ''
      form.name = cache.name || ''
      form.gender = cache.gender || ''
      form.age = cache.age || ''
      form.mobile = cache.mobile || ''
    }
  } catch {}
})
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}
.form {
  margin: 20rpx;
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
