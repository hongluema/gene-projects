export const USE_MOCK = true
// TODO: 测试环境
export const API_BASE = 'http://localhost:8006'
// TODO: 生产环境
// export const API_BASE = 'https://app.oriomics.cn'

export const API = {
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
  getMongoInfoByMongoId: `${API_BASE}/api/mongoInfo`, // 根据mongoid获取报告信息

  // 创建作废申请
  createApply: `${API_BASE}/api/applies/create`, // 作废申请
  getApplyInfo: `${API_BASE}/api/applies/info`, // 获取作废申请 

  sendCodeByPhone: `${API_BASE}/api/users/send-sms-code`, // 发送验证码
  verifyCodeByPhone: `${API_BASE}/api/users/verify-sms-code`, // 验证验证码
  
  // 微信相关
  wxPhoneLogin: `${API_BASE}/api/wx/phone-login`, // 微信手机号授权登录
  wxDecryptPhone: `${API_BASE}/api/wx/decrypt-phone`, // 解密微信手机号
}

