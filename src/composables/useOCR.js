import { API } from '@/config'
import { post } from '@/utils/request'
import { parseIdCard } from '@/utils/validator'

/**
 * OCR识别功能 Composable
 * 提供身份证OCR识别相关功能
 */
export function useOCR() {
  /**
   * 读取文件并转换为base64
   * @param {string} filePath - 文件路径
   * @returns {Promise<string>} base64字符串
   */
  const getFileBase64 = (filePath) => {
    return new Promise((resolve, reject) => {
      uni.getFileSystemManager().readFile({
        filePath: filePath,
        encoding: 'base64',
        success: (res) => {
          resolve(res.data)
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 调用阿里云OCR API识别身份证
   * @param {string} imagePath - 图片路径
   * @param {string} side - 身份证面（face: 正面, back: 背面），默认 'face'
   * @returns {Promise<Object>} OCR识别结果
   */
  const recognizeIdCard = async (imagePath, side = 'face') => {
    try {
      // 1. 读取图片文件并转换为base64
      const base64Data = await getFileBase64(imagePath)
      
      // 2. 调用后端阿里云OCR API
      const res = await post(API.ocrIdCard, { 
        'image_base64': base64Data,
        side: side
      })
      
      return parseOCRResult(res)
    } catch (err) {
      console.error('[OCR] Recognize error:', err)
      throw err
    }
  }

  /**
   * 解析OCR返回结果
   * @param {Object} ocrResult - OCR API返回的原始结果
   * @returns {Object} 解析后的结果 { name, id_number, gender, birth, address }
   */
  const parseOCRResult = (ocrResult) => {
    // 根据阿里云OCR API返回格式解析
    // 身份证识别API返回格式示例：
    // {
    //   Data: {
    //     Name: "姓名",
    //     IdNumber: "身份证号",
    //     Gender: "性别",
    //     BirthDate: "出生日期",
    //     Address: "地址"
    //   }
    // }
    
    if (ocrResult.Data) {
      const data = ocrResult.Data
      return {
        name: data.Name || '',
        id_number: data.IdNumber || data.id_number || '',
        gender: data.Gender || '',
        birth: data.BirthDate || data.birth || '',
        address: data.Address || data.address || ''
      }
    }
    
    // 如果格式不同，尝试其他解析方式
    if (ocrResult.name || ocrResult.id_number || ocrResult.idCard) {
      return {
        name: ocrResult.name || '',
        id_number: ocrResult.id_number || ocrResult.idCard || '',
        gender: ocrResult.gender || '',
        birth: ocrResult.birth || '',
        address: ocrResult.address || ''
      }
    }
    
    throw new Error('OCR结果格式不正确')
  }

  /**
   * 执行身份证OCR识别（完整流程）
   * @param {string} imagePath - 图片路径
   * @param {Object} options - 选项
   * @param {Function} options.onSuccess - 成功回调，参数为 { name, id_number, gender, age, birth, address }
   * @param {Function} options.onError - 失败回调，参数为错误对象
   * @param {boolean} options.autoParseAge - 是否自动从身份证号解析年龄，默认 true
   * @param {string} options.side - 身份证面（face: 正面, back: 背面），默认 'face'
   * @returns {Promise<Object>} OCR识别结果
   */
  const performIdCardOCR = async (imagePath, options = {}) => {
    const {
      onSuccess,
      onError,
      autoParseAge = true,
      side = 'face'
    } = options

    uni.showLoading({ title: '识别中...' })
    
    try {
      // 调用OCR识别
      const ocrData = await recognizeIdCard(imagePath, side)
      
      // 从身份证号解析年龄和性别
      let result = { ...ocrData }
      if (autoParseAge && ocrData.id_number) {
        const parsed = parseIdCard(ocrData.id_number)
        if (parsed) {
          result.age = parsed.age
          // 如果OCR没有识别出性别，使用解析的性别
          if (!result.gender) {
            result.gender = parsed.gender
          }
        }
      }

      uni.hideLoading()
      uni.showToast({ title: '识别成功', icon: 'success' })
      
      // 调用成功回调
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (err) {
      uni.hideLoading()
      console.error('[OCR] Perform fail:', err)
      uni.showToast({ title: 'OCR识别失败，请手动填写', icon: 'none' })
      
      // 调用失败回调
      if (onError) {
        onError(err)
      }
      
      throw err
    }
  }

  /**
   * 实时扫描识别身份证（使用camera组件）
   * @param {Object} options - 选项
   * @param {Function} options.onSuccess - 成功回调，参数为OCR结果
   * @param {Function} options.onError - 失败回调
   * @param {boolean} options.autoParseAge - 是否自动解析年龄
   * @param {string} options.side - 身份证面
   */
  const scanIdCardRealTime = (options = {}) => {
    // 监听识别成功事件（一次性监听）
    if (options.onSuccess) {
      const successHandler = (ocrData) => {
        options.onSuccess(ocrData)
        uni.$off('idcard-ocr-success', successHandler)
      }
      uni.$on('idcard-ocr-success', successHandler)
    }
    
    // 监听识别失败事件（一次性监听）
    if (options.onError) {
      const errorHandler = (err) => {
        options.onError(err)
        uni.$off('idcard-ocr-error', errorHandler)
      }
      uni.$on('idcard-ocr-error', errorHandler)
    }
    
    // 跳转到实时扫描页面
    uni.navigateTo({
      url: `/pages/idcard-scan/index?autoParseAge=${options.autoParseAge !== false}&side=${options.side || 'face'}`,
      fail: (err) => {
        console.error('[OCR] Navigate to scan page fail:', err)
        // 如果扫描页面不存在，降级为拍照识别
        uni.showToast({ title: '扫描功能暂不可用，使用拍照识别', icon: 'none' })
        setTimeout(() => {
          chooseIdCardImage('camera', options)
        }, 1500)
      }
    })
  }

  /**
   * 显示身份证识别选项（实时扫描/拍照/相册）
   * @param {Object} options - 选项
   * @param {Function} options.onSuccess - 成功回调，参数为OCR结果
   * @param {Function} options.onError - 失败回调
   * @param {boolean} options.autoParseAge - 是否自动解析年龄
   * @param {string} options.side - 身份证面
   * @param {boolean} options.enableRealTimeScan - 是否启用实时扫描，默认 true
   */
  const showIdCardOptions = (options = {}) => {
    const { enableRealTimeScan = true } = options
    
    const itemList = enableRealTimeScan 
      ? ['实时扫描识别', '拍照识别身份证', '从相册选择']
      : ['拍照识别身份证', '从相册选择']
    
    uni.showActionSheet({
      itemList: itemList,
      success: (res) => {
        if (enableRealTimeScan) {
          if (res.tapIndex === 0) {
            // 实时扫描识别
            scanIdCardRealTime(options)
          } else if (res.tapIndex === 1) {
            // 拍照识别
            chooseIdCardImage('camera', options)
          } else if (res.tapIndex === 2) {
            // 从相册选择
            chooseIdCardImage('album', options)
          }
        } else {
          if (res.tapIndex === 0) {
            chooseIdCardImage('camera', options)
          } else if (res.tapIndex === 1) {
            chooseIdCardImage('album', options)
          }
        }
      }
    })
  }

  /**
   * 选择身份证图片
   * @param {string} sourceType - 图片来源 'camera' | 'album'
   * @param {Object} options - 选项，同 performIdCardOCR
   */
  const chooseIdCardImage = (sourceType, options = {}) => {
    uni.chooseImage({
      count: 1,
      sourceType: [sourceType],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        performIdCardOCR(tempFilePath, options)
      },
      fail: (err) => {
        console.error('[OCR] Choose image fail:', err)
        if (options.onError) {
          options.onError(err)
        }
      }
    })
  }

  return {
    // 核心方法
    recognizeIdCard,
    parseOCRResult,
    getFileBase64,
    
    // 便捷方法
    performIdCardOCR,
    showIdCardOptions,
    chooseIdCardImage,
    scanIdCardRealTime
  }
}

