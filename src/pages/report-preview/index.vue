<template>
  <view class="report-preview-page">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">正在加载报告...</text>
    </view>

    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <text class="error-icon">❌</text>
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="loadPdf">重试</button>
    </view>

    <!-- #ifdef H5 || APP-PLUS -->
    <!-- PDF 预览容器（H5 和 App 使用 renderjs） -->
    <view v-else class="pdf-viewer-container">
      <scroll-view
        scroll-y
        class="pdf-scroll-view"
        @scroll="onScroll"
      >
        <view
          id="pdf-canvas-container"
          class="pdf-canvas-container"
          :change:pdfUrl="renderPdf.urlChanged"
          :pdfUrl="pdfUrl"
        ></view>
      </scroll-view>

      <!-- 页码指示器 -->
      <view v-if="totalPages > 0" class="page-indicator">
        {{ currentPage }} / {{ totalPages }}
      </view>
    </view>
    <!-- #endif -->

    <!-- #ifdef MP -->
    <!-- 小程序提示（小程序不支持 renderjs） -->
    <view v-else class="tips-container">
      <text class="tips-icon">📄</text>
      <text class="tips-text">准备打开PDF报告</text>
      <text class="tips-hint">正在自动打开，请稍候...</text>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { API } from '@/config'

const reportId = ref('')
const reportName = ref('')
const pdfUrl = ref('')
const loading = ref(false)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref(0)

onLoad((options) => {
  reportId.value = options.reportId || ''
  reportName.value = decodeURIComponent(options.reportName || '')

  // 设置导航栏标题
  if (reportName.value) {
    uni.setNavigationBarTitle({
      title: reportName.value
    })
  }

  // 自动加载PDF
  loadPdf()
})

// 加载PDF
const loadPdf = async () => {
  if (!reportId.value) {
    error.value = '报告ID不能为空'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const url = `${API.getReportPdf}?pk=375766785955336192`
    console.log('[ReportPreview] Loading PDF from:', url)

    pdfUrl.value = url

    // #ifdef MP
    // 小程序中自动打开系统查看器
    await openPdfWithSystem()
    // #endif

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

// 使用系统查看器打开 PDF（小程序专用）
const openPdfWithSystem = async () => {
  if (!pdfUrl.value) return

  try {
    uni.showLoading({
      title: '加载中...',
      mask: true
    })

    // 下载PDF文件
    const res = await new Promise((resolve, reject) => {
      uni.downloadFile({
        url: pdfUrl.value,
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.tempFilePath)
          } else {
            reject(new Error(`下载失败，状态码：${res.statusCode}`))
          }
        },
        fail: (err) => {
          reject(new Error(err.errMsg || '下载失败'))
        }
      })
    })

    uni.hideLoading()

    // 使用系统查看器打开
    uni.openDocument({
      filePath: res,
      fileType: 'pdf',
      showMenu: true,
      success: () => {
        loading.value = false
      },
      fail: (err) => {
        error.value = err.errMsg || '打开文件失败'
        loading.value = false
      }
    })

  } catch (err) {
    uni.hideLoading()
    console.error('[ReportPreview] Open PDF error:', err)
    error.value = err.message || '打开PDF失败'
    loading.value = false
  }
}

// 滚动事件
const onScroll = (e) => {
  // 可以在这里处理滚动事件
}

// 更新总页数（由 renderjs 调用）
const updateTotalPages = (data) => {
  totalPages.value = data.total
}

// 显示错误（由 renderjs 调用）
const showError = (data) => {
  error.value = data.message
  loading.value = false
}
</script>

<!-- #ifdef H5 || APP-PLUS -->
<script module="renderPdf" lang="renderjs">
let pdfDoc = null
let currentLoadedUrl = null

export default {
  mounted() {
    // 动态加载 PDF.js
    this.loadPdfJs()
  },

  methods: {
    // 加载 PDF.js 库
    loadPdfJs() {
      if (window.pdfjsLib) {
        console.log('PDF.js already loaded')
        return
      }

      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        console.log('PDF.js loaded successfully')
      }
      script.onerror = () => {
        console.error('Failed to load PDF.js')
        this.$ownerInstance.callMethod('showError', { message: '加载PDF库失败' })
      }
      document.head.appendChild(script)
    },

    // 监听 pdfUrl 变化
    urlChanged(newVal, oldVal, ownerInstance, instance) {
      if (newVal && newVal !== currentLoadedUrl) {
        currentLoadedUrl = newVal
        this.loadAndRenderPdf(newVal, ownerInstance)
      }
    },

    // 加载并渲染PDF
    async loadAndRenderPdf(url, ownerInstance) {
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (window.pdfjsLib) {
                clearInterval(checkInterval)
                resolve()
              }
            }, 100)
          })
        }

        console.log('Loading PDF from:', url)

        // 加载PDF文档
        const loadingTask = window.pdfjsLib.getDocument({
          url: url,
          withCredentials: false,
        })

        pdfDoc = await loadingTask.promise
        const numPages = pdfDoc.numPages

        console.log('PDF loaded, pages:', numPages)

        // 通知 Vue 更新总页数
        ownerInstance.callMethod('updateTotalPages', { total: numPages })

        // 获取容器
        const container = document.getElementById('pdf-canvas-container')
        if (!container) {
          console.error('Container not found')
          return
        }
        container.innerHTML = ''

        // 渲染所有页面
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
          await this.renderPage(pageNum, container)
        }

      } catch (err) {
        console.error('Load PDF error:', err)
        ownerInstance.callMethod('showError', { message: err.message || '加载PDF失败' })
      }
    },

    // 渲染单个页面
    async renderPage(pageNum, container) {
      try {
        const page = await pdfDoc.getPage(pageNum)

        // 计算合适的缩放比例
        const viewport = page.getViewport({ scale: 1 })
        const containerWidth = container.clientWidth || window.innerWidth
        const scale = (containerWidth / viewport.width) * 0.95
        const scaledViewport = page.getViewport({ scale: scale })

        // 创建canvas
        const canvas = document.createElement('canvas')
        canvas.className = 'pdf-page'
        canvas.style.display = 'block'
        canvas.style.margin = '10px auto'
        canvas.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'

        const context = canvas.getContext('2d')
        canvas.height = scaledViewport.height
        canvas.width = scaledViewport.width

        // 渲染PDF页面到canvas
        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        }

        await page.render(renderContext).promise
        container.appendChild(canvas)

      } catch (err) {
        console.error('Render page error:', err)
      }
    }
  }
}
</script>
<!-- #endif -->

<style scoped>
.report-preview-page {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  position: relative;
}

.loading-container,
.error-container,
.tips-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 40rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.error-icon,
.tips-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.error-text,
.tips-text {
  font-size: 32rpx;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
  font-weight: bold;
}

.tips-hint {
  font-size: 26rpx;
  color: #999;
  margin-bottom: 40rpx;
  text-align: center;
}

.retry-btn,
.open-btn {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 28rpx;
  border-radius: 50rpx;
  border: none;
}

.pdf-viewer-container {
  width: 100%;
  height: 100vh;
  position: relative;
}

.pdf-scroll-view {
  width: 100%;
  height: 100%;
  background: #525659;
}

.pdf-canvas-container {
  width: 100%;
  min-height: 100%;
  padding: 20rpx 0;
}

.page-indicator {
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
</style>