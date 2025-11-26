<template>
  <view class="about-page">
    <!-- Logo区域 -->
    <view class="logo-section">
      <image class="logo-img" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">翱锐健康</text>
      <text class="app-version">v1.0.0</text>
    </view>

    <!-- 服务介绍 -->
    <view class="section-card">
      <view class="card-title">
        <text class="title-icon">📖</text>
        <text>公司介绍</text>
      </view>
      <view class="card-content">
        <text class="content-text">
          自2018年成立以来，翱锐生物专注于消化系统肿瘤液体活检技术研发，始终以科技服务大众健康为使命，围绕癌症高危人群需求，开发精准、便捷的肿瘤早筛早诊产品。公司科研团队结合多组学检测与人工智能算法，通过检测血液中特定的DNA甲基化和蛋白标志物，建立了高性能的消化道肿瘤早筛技术体系。基于“ctDNA甲基化+蛋白标志物”的qPCR与化学发光双平台，翱锐生物已推出肝癌、胃癌、食管癌、肠癌、胰腺癌等多个单癌种及多癌种联合筛查产品。
        </text>
      </view>
    </view>

    <!-- 功能特点 -->
    <view class="section-card">
      <view class="card-title">
        <text class="title-icon">✨</text>
        <text>功能特点</text>
      </view>
      <view class="features-list">
        <view class="feature-item">
          <text class="feature-icon">🔍</text>
          <view class="feature-info">
            <text class="feature-name">便捷录入</text>
            <text class="feature-desc">扫码快速录入样本信息</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🧬</text>
          <view class="feature-info">
            <text class="feature-name">专业检测</text>
            <text class="feature-desc">权威机构专业检测分析</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">📊</text>
          <view class="feature-info">
            <text class="feature-name">在线查询</text>
            <text class="feature-desc">随时查看检测报告结果</text>
          </view>
        </view>
        <view class="feature-item">
          <text class="feature-icon">🔒</text>
          <view class="feature-info">
            <text class="feature-name">隐私保护</text>
            <text class="feature-desc">严格保护个人信息安全</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="section-card">
      <view class="card-title">
        <text class="title-icon">📞</text>
        <text>联系我们</text>
      </view>
      <view class="contact-list">
        <view class="contact-item" @click="callPhone">
          <text class="contact-icon">☎️</text>
          <view class="contact-info">
            <text class="contact-label">客服电话</text>
            <text class="contact-value">400-888-8888</text>
          </view>
          <text class="contact-arrow">→</text>
        </view>
        <view class="contact-item">
          <text class="contact-icon">⏰</text>
          <view class="contact-info">
            <text class="contact-label">服务时间</text>
            <text class="contact-value">周一至周五 9:00-18:00</text>
          </view>
        </view>
        <view class="contact-item">
          <text class="contact-icon">📧</text>
          <view class="contact-info">
            <text class="contact-label">邮箱地址</text>
            <text class="contact-value">service@example.com</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 法律信息 -->
    <view class="section-card">
      <view class="card-title">
        <text class="title-icon">📜</text>
        <text>法律信息</text>
      </view>
      <view class="legal-links">
        <text class="legal-link" @click="viewAgreement('privacy')">隐私政策</text>
        <text class="legal-divider">|</text>
        <text class="legal-link" @click="viewAgreement('terms')">用户协议</text>
      </view>
    </view>

    <!-- 版权信息 -->
    <view class="copyright">
      <text class="copyright-text">© 2024 翱锐健康</text>
      <text class="copyright-text">All Rights Reserved</text>
    </view>
  </view>
</template>

<script setup>
// 拨打电话
const callPhone = () => {
  uni.makePhoneCall({
    phoneNumber: '4008888888'
  })
}

// 查看协议
const viewAgreement = (type) => {
  const titleMap = {
    privacy: '隐私政策',
    terms: '用户协议'
  }
  
  uni.showModal({
    title: titleMap[type],
    content: '此处应显示协议内容，实际项目中可跳转到协议页面或打开Web页面。',
    showCancel: false
  })
}
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40rpx 30rpx;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  background: #fff;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06);
}

.logo-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  margin-bottom: 24rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 12rpx;
}

.app-version {
  font-size: 24rpx;
  color: #999;
}

.section-card {
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

.card-content {
  padding: 10rpx 0;
}

.content-text {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.feature-icon {
  font-size: 48rpx;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.feature-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.feature-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}

.feature-desc {
  font-size: 24rpx;
  color: #999;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.contact-label {
  font-size: 24rpx;
  color: #999;
}

.contact-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.contact-arrow {
  font-size: 32rpx;
  color: #ccc;
}

.legal-links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20rpx;
  padding: 10rpx 0;
}

.legal-link {
  font-size: 26rpx;
  color: #667eea;
}

.legal-divider {
  font-size: 26rpx;
  color: #d9d9d9;
}

.copyright {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 40rpx 0 20rpx;
}

.copyright-text {
  font-size: 24rpx;
  color: #bbb;
}
</style>

