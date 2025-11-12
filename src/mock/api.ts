// Lightweight mock API for local development

export function mockWxLogin(code: string): Promise<{ openId: string }> {
  const openId = `mock_openid_${code || Math.random().toString(36).slice(2, 10)}`
  return new Promise((resolve) => setTimeout(() => resolve({ openId }), 200))
}

export function mockSaveUser(payload: {
  openId: string
  nickname: string
  avatar: string
}): Promise<{ success: boolean }> {
  console.log('[MOCK] saveUser', payload)
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
}

export function mockUpdateUser(payload: {
  openId: string
  idCard: string
  name?: string
  gender?: 'male' | 'female' | ''
  age?: string
  mobile?: string
}): Promise<{ success: boolean }> {
  console.log('[MOCK] updateUser', payload)
  return new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
}
