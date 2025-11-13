export const USE_MOCK = true

export const API_BASE = 'http://localhost:8000'

export const API = {
  // 用户相关
  wxLogin: `${API_BASE}/api/wx/login`,
  saveUser: `${API_BASE}/api/user/save`,
  updateUser: `${API_BASE}/api/user/update`,
  bindPhone: `${API_BASE}/api/user/bind-phone`,
  getUserInfo: `${API_BASE}/api/user/info`,
  
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

