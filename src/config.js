export const USE_MOCK = true
export const API_BASE = 'http://localhost:8002'

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
  ocrIdCard: `${API_BASE}/api/ocr/idcard`,
  
  // 报告相关
  queryReportByPhone: `${API_BASE}/api/report/query-by-phone`,
  queryReportByIdCard: `${API_BASE}/api/report/query-by-idcard`,
  getReportList: `${API_BASE}/api/report/list`,
  getReportPdf: `${API_BASE}/api/report/pdf`,
}

