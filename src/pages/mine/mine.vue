<template>
  <view class="container">
    <view class="header">
      <view class="avatar">
        <image class="avatar-img" src="/static/avatar.png" mode="aspectFill" />
      </view>
      <view class="user-info">
        <text class="username">用户名</text>
        <text class="user-id">ID: 123456789</text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item">
        <text class="menu-text">个人信息</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">检测历史</text>
        <text class="arrow">></text>
      </view>
      <view class="menu-item">
        <text class="menu-text">设置</text>
        <text class="arrow">></text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
</script>

<style scoped>
.container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #ffffff;
  padding: 40rpx 30rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  overflow: hidden;
  margin-right: 30rpx;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.user-id {
  font-size: 28rpx;
  color: #999999;
}

.menu-list {
  margin-top: 20rpx;
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 32rpx;
  color: #333333;
}

.arrow {
  font-size: 32rpx;
  color: #999999;
}
</style>