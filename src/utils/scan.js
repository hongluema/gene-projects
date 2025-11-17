// 扫码相关工具函数

/**
 * 扫描二维码
 * @returns {Promise<string>} 扫描结果
 */
export function scanQRCode() {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType: ['qrCode'],
      success: (res) => {
        console.log('[Scan] QR Code result:', res.result)
        resolve(res.result)
      },
      fail: (err) => {
        console.error('[Scan] QR Code fail:', err)
        reject(err)
      }
    })
  })
}

/**
 * 扫描条形码
 * @returns {Promise<string>} 扫描结果
 */
export function scanBarCode() {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      scanType: ['barCode'],
      success: (res) => {
        console.log('[Scan] Bar Code result:', res.result)
        resolve(res.result)
      },
      fail: (err) => {
        console.error('[Scan] Bar Code fail:', err)
        reject(err)
      }
    })
  })
}

/**
 * 扫描任意码（二维码或条形码）
 * @returns {Promise<string>} 扫描结果
 */
export function scanAnyCode() {
  return new Promise((resolve, reject) => {
    uni.scanCode({
      success: (res) => {
        console.log('[Scan] Any Code result:', res.result)
        resolve(res.result)
      },
      fail: (err) => {
        console.error('[Scan] Any Code fail:', err)
        reject(err)
      }
    })
  })
}

/**
 * 解析项目二维码内容
 * @param {string} qrCodeData - 二维码内容
 * @returns {Object} { projectId, institutionId }
 */
export function parseProjectQRCode(qrCodeData) {
  console.log('>>>>qrCodeData', qrCodeData);
  try {
    // 假设二维码格式为 JSON: {"projectId":"xxx","institutionId":"yyy"}
    // 或者是 URL 格式: https://xxx.com?projectId=xxx&institutionId=yyy
    
    if (qrCodeData.startsWith('{')) {
      // JSON 格式
      const data = JSON.parse(qrCodeData)
      return {
        projectId: data.program_id || '',
        institutionId: data.org_id || ''
      }
    } else if (qrCodeData.includes('?')) {
      // URL 格式
      const url = new URL(qrCodeData)
      return {
        projectId: url.searchParams.get('program_id') || '',
        institutionId: url.searchParams.get('org_id') || ''
      }
    } else {
      // 简单格式: projectId_institutionId
      const parts = qrCodeData.split('_')
      return {
        projectId: parts[0] || '',
        institutionId: parts[1] || ''
      }
    }
  } catch (err) {
    console.error('[Scan] Parse QR Code fail:', err)
    return { projectId: '', institutionId: '' }
  }
}

