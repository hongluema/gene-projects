// 表单验证工具函数

/**
 * 验证手机号
 */
export function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证身份证号
 */
export function validateIdCard(idCard) {
  const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  return reg.test(idCard)
}

/**
 * 验证姓名
 */
export function validateName(name) {
  if (!name || name.length < 2) return false
  const reg = /^[\u4e00-\u9fa5·]{2,20}$/
  return reg.test(name)
}

/**
 * 验证验证码
 */
export function validateCode(code) {
  const reg = /^\d{4,6}$/
  return reg.test(code)
}

/**
 * 从身份证号解析信息
 */
export function parseIdCard(idCard) {
  if (!validateIdCard(idCard)) {
    return null
  }

  const year = idCard.length === 18 ? idCard.substr(6, 4) : '19' + idCard.substr(6, 2)
  const month = idCard.substr(idCard.length === 18 ? 10 : 8, 2)
  const day = idCard.substr(idCard.length === 18 ? 12 : 10, 2)
  const genderCode = idCard.substr(idCard.length === 18 ? 16 : 14, 1)
  
  const birth = `${year}-${month}-${day}`
  const gender = parseInt(genderCode) % 2 === 0 ? '女' : '男'
  
  // 计算年龄
  const birthDate = new Date(birth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return {
    birth,
    gender,
    age: age.toString()
  }
}

