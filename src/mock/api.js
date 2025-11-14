// Lightweight mock API for local development

// ========== 认证相关 ==========

/**
 * 发送短信验证码
 */
export function mockSendSmsCode(phone) {
  console.log('[MOCK] sendSmsCode', phone)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      message: '验证码已发送（Mock：验证码为 123456）'
    }), 500)
  })
}

/**
 * 手机验证码登录
 */
export function mockLoginByPhone(phone, code) {
  console.log('[MOCK] loginByPhone', phone, code)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Mock 验证码校验（任何验证码都通过，实际环境需要后端校验）
      if (!code || code.length !== 6) {
        reject(new Error('验证码格式错误'))
        return
      }

      // 模拟返回用户信息
      const userId = `USER_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`
      const token = `TOKEN_${Math.random().toString(36).slice(2)}`
      
      // 模拟：首次登录未完善信息，再次登录已完善
      const isFirstLogin = !uni.getStorageSync(`LOGIN_HISTORY_${phone}`)
      if (isFirstLogin) {
        uni.setStorageSync(`LOGIN_HISTORY_${phone}`, true)
      }

      resolve({
        success: true,
        userId,
        token,
        phone,
        isProfileComplete: !isFirstLogin, // 首次登录为 false，再次登录为 true
        message: '登录成功'
      })
    }, 800)
  })
}

// ========== 微信相关（保留） ==========

export function mockWxLogin(code) {
  const openId = `mock_openid_${code || Math.random().toString(36).slice(2, 10)}`
  return new Promise((resolve) => setTimeout(() => resolve({ openId }), 200))
}

export function mockSaveUser(payload) {
  console.log('[MOCK] saveUser', payload)
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
}

export function mockUpdateUser(payload) {
  console.log('[MOCK] updateUser', payload)
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
}

export function mockGetProject(projectId) {
  console.log('[MOCK] getProject', projectId)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      data: {
        id: projectId,
        name: 'MTHFR基因检测项目',
        institutionId: 'inst_001',
        description: '叶酸代谢能力基因检测',
        createTime: '2024-01-15'
      }
    }), 300)
  })
}

export function mockGetInstitution(institutionId) {
  console.log('[MOCK] getInstitution', institutionId)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      data: {
        id: institutionId,
        name: 'XX医学检验所',
        address: '北京市朝阳区XX路XX号',
        phone: '400-888-8888',
        license: '京卫检字[2024]001号'
      }
    }), 300)
  })
}

export function mockSubmitSample(payload) {
  console.log('[MOCK] submitSample', payload)
  const sampleId = `SAMPLE_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      sampleId,
      message: '样本信息提交成功'
    }), 500)
  })
}

export function mockOcrIdCard(imagePath) {
  console.log('[MOCK] ocrIdCard', imagePath)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      data: {
        name: '张三',
        idCard: '110101199001011234',
        gender: '男',
        birth: '1990-01-01',
        address: '北京市东城区XX街道XX号'
      }
    }), 800)
  })
}

export function mockQueryReport(params) {
  console.log('[MOCK] queryReport', params)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      data: [
        {
          id: 'RPT_001',
          sampleId: 'SAMPLE_20240315_A1B2',
          projectName: 'MTHFR基因检测',
          institutionName: 'XX医学检验所',
          status: 'completed',
          statusText: '已完成',
          createTime: '2024-03-15 10:30:00',
          completeTime: '2024-03-20 14:20:00',
          hasPdf: true
        },
        {
          id: 'RPT_002',
          sampleId: 'SAMPLE_20240310_C3D4',
          projectName: '血常规检测',
          institutionName: 'XX医学检验所',
          status: 'testing',
          statusText: '检测中',
          createTime: '2024-03-10 09:15:00',
          completeTime: null,
          hasPdf: false
        }
      ]
    }), 600)
  })
}

export function mockGetReportPdf(reportId) {
  console.log('[MOCK] getReportPdf', reportId)
  return new Promise((resolve) => {
    setTimeout(() => resolve({
      success: true,
      pdfUrl: 'https://example.com/mock-report.pdf'
    }), 400)
  })
}

