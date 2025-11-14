# 手机验证码登录功能说明

## 📋 功能概述

本项目已实现完整的**手机验证码登录**流程，替代了原有的微信授权登录方式。

## 🔄 登录流程

### 完整流程图

```
用户打开应用
    ↓
进入登录页面
    ↓
输入手机号 → 获取验证码
    ↓
输入验证码 → 点击登录
    ↓
验证成功 → 后端创建用户记录
    ↓
返回 userId + token
    ↓
判断是否完善信息
    ├─ 未完善 → 跳转个人信息完善页
    └─ 已完善 → 进入首页
```

## 📁 文件结构

### 新增文件

1. **`src/composables/useAuth.js`** - 登录状态管理
   - 统一管理登录态（userId, token, phone）
   - 提供登录、退出、检查登录等方法
   - 本地存储管理

2. **`src/pages/login/login.vue`** - 登录页面
   - 手机号输入
   - 验证码获取（60秒倒计时）
   - 登录处理

3. **`LOGIN_GUIDE.md`** - 本文档

### 修改文件

1. **`src/config.js`** - 添加登录相关 API
   - `sendSmsCode` - 发送验证码
   - `loginByPhone` - 手机验证码登录
   - `checkProfile` - 检查信息是否完善

2. **`src/mock/api.js`** - 添加 Mock 接口
   - `mockSendSmsCode()` - 模拟发送验证码
   - `mockLoginByPhone()` - 模拟登录

3. **`src/pages.json`** - 添加登录页路由

4. **`src/App.vue`** - 应用启动时初始化登录状态

5. **`src/pages/profile/profile.vue`** - 使用新的 useAuth

6. **`src/pages/mine/mine.vue`** - 改用手机号登录方式

7. **`src/pages/index/index.vue`** - 移除微信登录

8. **`src/pages/sample-entry/index.vue`** - 添加登录检查

9. **`src/pages/report-list/index.vue`** - 添加登录检查

## 🚀 使用说明

### 开发模式（Mock）

项目默认开启 Mock 模式（`src/config.js` 中 `USE_MOCK = true`）

**登录测试：**
1. 输入任意手机号（格式正确即可，如：13800138000）
2. 点击"获取验证码"
3. 输入任意 6 位数字验证码（如：123456）
4. 点击登录

**Mock 特性：**
- 任何格式正确的手机号都可以登录
- 任何 6 位数字验证码都会验证通过
- 首次登录会提示完善信息
- 再次登录会自动识别为已完善信息

### 生产模式

修改 `src/config.js`：
```javascript
export const USE_MOCK = false
export const API_BASE = 'https://your-api-domain.com'
```

## 🔑 核心 API

### useAuth Composable

```javascript
import { useAuth } from '@/composables/useAuth'

const {
  // 状态
  userId,              // 用户ID
  token,               // 登录令牌
  phone,               // 手机号
  isLogin,             // 是否已登录
  isProfileComplete,   // 是否完善信息
  
  // 方法
  initAuth,            // 初始化（从本地恢复登录态）
  saveLoginInfo,       // 保存登录信息
  markProfileComplete, // 标记信息已完善
  logout,              // 退出登录
  checkAuth,           // 检查登录态（用于路由守卫）
  checkProfile,        // 检查是否完善信息
  getAuthHeader        // 获取请求头（包含 token）
} = useAuth()
```

### 路由守卫使用

在需要登录的页面中：

```javascript
import { useAuth } from '@/composables/useAuth'

const { checkAuth } = useAuth()

onLoad(() => {
  // 检查登录态，未登录会自动跳转到登录页
  if (!checkAuth()) {
    return
  }
  
  // 已登录，继续执行页面逻辑
  // ...
})
```

### API 请求使用

```javascript
import { useAuth } from '@/composables/useAuth'

const { getAuthHeader } = useAuth()

// 发起需要认证的请求
uni.request({
  url: API.updateUser,
  method: 'POST',
  data: { /* ... */ },
  header: getAuthHeader() // 自动添加 Authorization: Bearer token
})
```

## 📊 后端接口约定

### 1. 发送验证码

```
POST /api/auth/send-code
Content-Type: application/json

Request:
{
  "phone": "13800138000"
}

Response:
{
  "success": true,
  "message": "验证码已发送"
}
```

### 2. 手机验证码登录

```
POST /api/auth/login
Content-Type: application/json

Request:
{
  "phone": "13800138000",
  "code": "123456"
}

Response:
{
  "success": true,
  "userId": "USER_12345",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "phone": "13800138000",
  "isProfileComplete": false,  // 是否已完善信息
  "message": "登录成功"
}
```

### 3. 更新用户信息

```
POST /api/user/update
Content-Type: application/json
Authorization: Bearer {token}

Request:
{
  "userId": "USER_12345",
  "name": "张三",
  "idCard": "110101199001011234",
  "gender": "male",
  "age": "34",
  "mobile": "13800138000"
}

Response:
{
  "success": true,
  "message": "保存成功"
}
```

## 📝 本地存储键

| 键名 | 说明 | 类型 |
|-----|------|------|
| `USER_TOKEN` | 用户令牌 | String |
| `USER_ID` | 用户ID | String |
| `USER_PHONE` | 手机号 | String |
| `PROFILE_COMPLETED` | 是否完善信息 | Boolean |
| `USER_PROFILE_FORM` | 个人信息表单缓存 | Object |

## 🔐 安全建议

1. **Token 管理**
   - Token 应设置合理的过期时间
   - 后端应验证 Token 的有效性
   - 敏感操作需要二次验证

2. **验证码**
   - 限制发送频率（如：60秒/次）
   - 设置验证码有效期（如：5分钟）
   - 验证后立即失效
   - 限制验证次数（如：5次）

3. **数据传输**
   - 生产环境必须使用 HTTPS
   - 敏感数据需加密传输

## 🎯 功能特性

✅ 手机验证码登录  
✅ 60秒倒计时  
✅ 登录态持久化  
✅ 自动路由守卫  
✅ Token 自动携带  
✅ 个人信息完善引导  
✅ Mock 模式开发调试  
✅ 退出登录  
✅ 登录检查提示

## 🐛 调试建议

1. **查看登录流程日志**
   - 打开小程序调试器
   - 搜索 `[Auth]` 或 `[Login]` 关键词

2. **清除本地登录态**
   ```javascript
   // 在控制台执行
   uni.clearStorage()
   ```

3. **查看存储数据**
   - 微信开发者工具 → Storage 面板
   - 查看 `USER_TOKEN`、`USER_ID` 等键值

## 📞 常见问题

### Q1: 如何跳过登录直接进入首页（开发调试）？

A: 可以在 `src/pages/login/login.vue` 的 `onLoad` 方法中注释掉自动跳转的代码。

### Q2: 如何修改验证码倒计时时长？

A: 修改 `src/pages/login/login.vue` 中的 `countdown.value = 60` 为你需要的秒数。

### Q3: 如何强制用户完善信息后才能使用其他功能？

A: 在需要的页面中使用 `checkProfile()` 方法：
```javascript
const { checkProfile } = useAuth()

onLoad(() => {
  if (!checkProfile()) {
    return // 会自动跳转到个人信息页
  }
  // 继续执行
})
```

### Q4: 如何切换到真实后端？

A: 修改 `src/config.js`：
```javascript
export const USE_MOCK = false
export const API_BASE = 'https://your-api-domain.com'
```

## 🔄 迁移说明

如果你的项目之前使用了微信登录，现在已完全迁移到手机验证码登录：

**已移除的依赖：**
- ❌ `useWxAuth` composable（改用 `useAuth`）
- ❌ 微信 openId（改用 userId）
- ❌ 微信头像和昵称（改用手机号显示）

**需要注意：**
- 所有使用 `openId` 的地方已改为 `userId`
- 所有使用 `useWxAuth` 的地方已改为 `useAuth`
- `UserAuthDialog.vue` 组件已不再使用

## 📈 后续优化建议

1. **找回密码功能**
2. **手机号换绑**
3. **Token 自动刷新**
4. **生物识别登录（指纹/面容）**
5. **第三方登录（微信/支付宝）**
6. **登录日志记录**

---

**开发时间：** 2025-11-14  
**版本：** v1.0.0

