<template>
  <view class="scan-page">
    <camera
      id="idcard-camera"
      class="camera"
      device-position="back"
      flash="off"
      @error="onCameraError"
    >
      <!-- 扫描框 -->
      <view class="scan-frame">
        <view class="frame-border">
          <view class="corner corner-tl"></view>
          <view class="corner corner-tr"></view>
          <view class="corner corner-bl"></view>
          <view class="corner corner-br"></view>
        </view>
        <text class="scan-tip">请将身份证放入框内</text>
      </view>
    </camera>
    
    <!-- 底部操作栏 -->
    <view class="action-bar">
      <button class="action-btn cancel-btn" @click="handleCancel">取消</button>
      <button class="action-btn scan-btn" @click="handleScan">识别</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { useOCR } from '@/composables/useOCR'

const { performIdCardOCR } = useOCR()

let cameraContext = null
const scanning = ref(false)

const autoParseAge = ref(true)
const side = ref('face')

onLoad((options) => {
  // 获取传递的参数
  console.log('[IdCardScan] Options:', options)
  autoParseAge.value = options.autoParseAge !== 'false'
  side.value = options.side || 'face'
  
  // 创建camera上下文
  cameraContext = uni.createCameraContext('idcard-camera')
})

onUnload(() => {
  cameraContext = null
})

// 相机错误处理
const onCameraError = (err) => {
  console.error('[IdCardScan] Camera error:', err)
  uni.showToast({ title: '相机启动失败', icon: 'none' })
  setTimeout(() => {
    uni.navigateBack()
  }, 1500)
}

// 取消扫描
const handleCancel = () => {
  uni.navigateBack()
}

// 执行扫描识别
const handleScan = () => {
  if (scanning.value) return
  
  scanning.value = true
  uni.showLoading({ title: '正在识别...' })
  
  // 从camera组件拍照
  cameraContext.takePhoto({
    quality: 'high',
    success: (res) => {
      console.log('[IdCardScan] Take photo success:', res.tempImagePath)
      
      // 调用OCR识别
      performIdCardOCR(res.tempImagePath, {
        onSuccess: (ocrData) => {
          scanning.value = false
          uni.hideLoading()
          
          // 通过事件总线传递结果
          uni.$emit('idcard-ocr-success', ocrData)
          
          uni.showToast({ title: '识别成功', icon: 'success' })
          
          setTimeout(() => {
            uni.navigateBack()
          }, 500)
        },
        onError: (err) => {
          scanning.value = false
          uni.hideLoading()
          console.error('[IdCardScan] OCR error:', err)
          
          // 通过事件总线传递错误
          uni.$emit('idcard-ocr-error', err)
        },
        autoParseAge: autoParseAge.value,
        side: side.value
      })
    },
    fail: (err) => {
      scanning.value = false
      uni.hideLoading()
      console.error('[IdCardScan] Take photo fail:', err)
      uni.showToast({ title: '拍照失败，请重试', icon: 'none' })
    }
  })
}

</script>

<style scoped>
.scan-page {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000;
}

.camera {
  width: 100%;
  height: 100%;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600rpx;
  height: 380rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.frame-border {
  width: 100%;
  height: 100%;
  position: relative;
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  border-radius: 8rpx;
}

.corner {
  position: absolute;
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #00ff00;
}

.corner-tl {
  top: -4rpx;
  left: -4rpx;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 8rpx;
}

.corner-tr {
  top: -4rpx;
  right: -4rpx;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 8rpx;
}

.corner-bl {
  bottom: -4rpx;
  left: -4rpx;
  border-right: none;
  border-top: none;
  border-bottom-left-radius: 8rpx;
}

.corner-br {
  bottom: -4rpx;
  right: -4rpx;
  border-left: none;
  border-top: none;
  border-bottom-right-radius: 8rpx;
}

.scan-tip {
  position: absolute;
  bottom: -80rpx;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 28rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}

.action-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
}

.action-btn {
  flex: 1;
  margin: 0 20rpx;
  padding: 24rpx;
  font-size: 32rpx;
  border-radius: 50rpx;
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

.scan-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: bold;
}

.scan-btn:active {
  opacity: 0.8;
}
</style>

