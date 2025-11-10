<template>
  <!-- #ifdef MP-WEIXIN -->
  <van-dialog
    :show="show"
    use-slot
    show-cancel-button
    title="完善个人资料"
    @close="close"
    @cancel="close"
    @confirm="confirm"
  >
    <view class="auth-modal">
      <view class="auth-desc">为了提供更好的服务，请选择头像并填写昵称</view>
      <view class="auth-avatar">
        <image class="avatar-large" :src="localAvatar || '/static/avatar.png'" mode="aspectFill" />
        <button class="mini-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">选择头像</button>
      </view>
      <view class="auth-nickname">
        <van-field :value="localNick" placeholder="请输入昵称" @change="onFieldChange" clearable></van-field>
      </view>
    </view>
  </van-dialog>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ show: boolean; avatarUrl?: string; nickName?: string }>()
const emit = defineEmits<{
  (e: 'update:show', v: boolean): void
  (e: 'confirm', payload: { avatarUrl: string; nickName: string }): void
}>()

const localAvatar = ref(props.avatarUrl || '')
const localNick = ref(props.nickName || '')

watch(
  () => props.show,
  (v) => {
    if (v) {
      localAvatar.value = props.avatarUrl || ''
      localNick.value = props.nickName || ''
    }
  }
)

const onChooseAvatar = (e: any) => {
  const url = e?.detail?.avatarUrl || ''
  localAvatar.value = url
}

const onFieldChange = (e: any) => {
  localNick.value = e?.detail || e?.detail?.value || e?.target?.value || ''
}

const close = () => emit('update:show', false)

const confirm = () => {
  emit('confirm', { avatarUrl: localAvatar.value, nickName: localNick.value })
}
</script>

<style scoped>
.auth-modal {
  width: 640rpx;
  max-width: 680rpx;
  padding: 32rpx 28rpx 28rpx;
  box-sizing: border-box;
}

.auth-desc {
  text-align: center;
  font-size: 26rpx;
  color: #888;
}

.auth-avatar {
  margin-top: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.avatar-large {
  width: 128rpx;
  height: 128rpx;
  border-radius: 64rpx;
  background: #f6f7f9;
}

.auth-nickname {
  margin-top: 20rpx;
}

.mini-btn {
  height: 72rpx;
  line-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 12rpx;
  background: #f0f0f0;
  color: #333;
}
</style>

