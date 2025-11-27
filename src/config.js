export const USE_MOCK = true
// TODO: 测试环境
export const API_BASE = 'http://localhost:8002'
// TODO: 生产环境
// export const API_BASE = 'https://app.oriomics.cn'

// 阿里云OCR配置
export const ALIYUN_OCR = {
  accessKeyId: 'LTAI5t6w5whKfqBscfnYFJ6n', // 请配置您的AccessKeyId 
  accessKeySecret: 'RgOkODZuCap6ne35AZOiOdrqTk31ZC', // 请配置您的AccessKeySecret
  endpoint: 'https://ocr.cn-shanghai.aliyuncs.com',
  apiVersion: '2019-12-30',
  region_id: 'cn-shanghai',
  action: 'RecognizeIdCard',
}

export const API = {
  // 认证相关
  sendSmsCode: `${API_BASE}/api/auth/send-code`,      // 发送短信验证码
  loginByPhone: `${API_BASE}/api/user/login`,         // 手机验证码登录
  createByPhone: `${API_BASE}/api/users/create`,         // 创建用户
  
  // 用户相关
  wxLogin: `${API_BASE}/api/wx/login`,
  saveUser: `${API_BASE}/api/user/save`,
  updateUser: `${API_BASE}/api/users/update`,
  bindPhone: `${API_BASE}/api/user/bind-phone`,
  getUserInfo: `${API_BASE}/api/users/info`,
  checkProfile: `${API_BASE}/api/user/check-profile`, // 检查信息是否完善
  
  // 项目相关
  getProject: `${API_BASE}/api/project`,
  getInstitution: `${API_BASE}/api/institution`,
  
  // 样本相关
  submitSample: `${API_BASE}/api/sample/submit`,
  ocrIdCard: `${API_BASE}/api/ocr/id-card/recognize`,
  getSamplesByPhone: `${API_BASE}/api/samples/phone`,  // 根据手机号获取样本
  queryReportByIdCard: `${API_BASE}/api/samples/id-number`,  // 根据手机号获取样本
  getSamplesByUserId: `${API_BASE}/api/samples/user_id`,       // 根据用户ID获取样本
  getSamplesByMy: `${API_BASE}/api/samples/query/my`,       // 查询我的报告
  
  // 报告相关
  getReportList: `${API_BASE}/api/report/list`,
  getReportPdf: `${API_BASE}/api/report/pdf/local`,
}

