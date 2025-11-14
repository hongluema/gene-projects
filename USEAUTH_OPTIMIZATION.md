# useAuth 优化说明 - 单例模式

## 🤔 为什么需要改为单例模式？

### 之前的问题（非单例）

```javascript
// ❌ 错误的实现方式
export function useAuth() {
  const userId = ref('')      // 每次调用创建新实例
  const token = ref('')       // 每次调用创建新实例
  const isLogin = ref(false)  // 每次调用创建新实例
  // ...
}
```

**问题演示：**

```javascript
// App.vue 中
const { initAuth } = useAuth()  // 创建实例 A
initAuth()  // 修改实例 A 的状态: isLogin.value = true

// sample-entry/index.vue 中
const { checkAuth } = useAuth()  // ⚠️ 创建了新的实例 B
checkAuth()  // 检查实例 B 的状态: isLogin.value 还是 false（初始值）
```

**结果：** 状态无法在不同页面间共享！

---

## ✅ 单例模式的解决方案

### 新的实现方式

```javascript
// ✅ 正确的实现方式（单例模式）

// 将 ref 提取到函数外部，所有调用共享同一个实例
const userId = ref('')
const token = ref('')
const isLogin = ref(false)
// ...
let hasInitialized = false  // 初始化标识

export function useAuth() {
  // 只返回方法，不创建新的 ref
  const initAuth = () => {
    if (hasInitialized) return  // 只初始化一次
    // 从 Storage 读取
    // ...
    hasInitialized = true
  }
  
  return {
    userId,    // 共享的 ref
    token,     // 共享的 ref
    isLogin,   // 共享的 ref
    initAuth,
    // ...
  }
}
```

**优势演示：**

```javascript
// App.vue 中
const { initAuth, isLogin } = useAuth()  // 获取共享状态
initAuth()  // 修改共享状态: isLogin.value = true

// sample-entry/index.vue 中
const { checkAuth, isLogin } = useAuth()  // 获取同一个共享状态
console.log(isLogin.value)  // ✅ true（已经登录了）
checkAuth()  // ✅ 检查通过
```

---

## 🚀 进一步优化：自动初始化

### 问题

即使用了单例模式，还需要在每个页面手动调用 `initAuth()`：

```javascript
// ❌ 繁琐的方式
onLoad(() => {
  initAuth()      // 手动初始化
  checkAuth()     // 检查登录
})
```

### 解决方案

让 `checkAuth()` 和 `checkProfile()` 自动初始化：

```javascript
const checkAuth = () => {
  // ✅ 自动初始化
  if (!hasInitialized) {
    initAuth()
  }
  
  if (!isLogin.value || !token.value) {
    // 跳转登录页
    return false
  }
  return true
}
```

**现在使用更简单：**

```javascript
// ✅ 简洁的方式
onLoad(() => {
  // 直接检查，会自动初始化
  if (!checkAuth()) {
    return
  }
  // 继续执行
})
```

---

## 📊 性能对比

### 之前（非单例 + 手动初始化）

```
App.vue:            initAuth() → 读取 Storage 1 次
sample-entry:       initAuth() → 读取 Storage 2 次
report-list:        initAuth() → 读取 Storage 3 次
profile:            initAuth() → 读取 Storage 4 次
```

**问题：**
- ❌ 重复读取 Storage（性能浪费）
- ❌ 状态不共享（每个页面独立状态）
- ❌ 代码冗余（每个页面都要调用）

### 现在（单例 + 自动初始化）

```
第一次调用 checkAuth():  initAuth() → 读取 Storage 1 次
后续调用 checkAuth():    直接使用缓存状态 ✅
```

**优势：**
- ✅ 只读取一次 Storage（性能提升）
- ✅ 状态全局共享（所有页面同步）
- ✅ 代码简洁（自动初始化）

---

## 📝 使用指南

### 1. 不需要登录的页面

```javascript
// 如：首页、关于页面等
import { useAuth } from '@/composables/useAuth'

const { isLogin } = useAuth()

// 可以读取状态，但不强制登录
onLoad(() => {
  if (isLogin.value) {
    console.log('已登录')
  } else {
    console.log('未登录')
  }
})
```

### 2. 需要登录的页面

```javascript
// 如：样本录入、报告列表等
import { useAuth } from '@/composables/useAuth'

const { checkAuth } = useAuth()

onLoad(() => {
  // 自动初始化 + 检查登录
  if (!checkAuth()) {
    return  // 未登录会自动跳转登录页
  }
  
  // 已登录，继续执行
  loadData()
})
```

### 3. 需要完善信息的页面

```javascript
import { useAuth } from '@/composables/useAuth'

const { checkProfile } = useAuth()

onLoad(() => {
  // 自动初始化 + 检查登录 + 检查信息
  if (!checkProfile()) {
    return  // 未完善会自动跳转个人信息页
  }
  
  // 已完善，继续执行
  submitForm()
})
```

### 4. 获取用户信息

```javascript
import { useAuth } from '@/composables/useAuth'

const { userId, phone, isLogin, isProfileComplete } = useAuth()

// 直接使用，状态是响应式的
console.log('用户ID:', userId.value)
console.log('手机号:', phone.value)
```

### 5. 退出登录

```javascript
import { useAuth } from '@/composables/useAuth'

const { logout } = useAuth()

const handleLogout = () => {
  logout()  // 清除状态 + 跳转登录页
}
```

---

## 🔍 技术细节

### 单例实现原理

```javascript
// 模块级变量（所有导入共享）
const userId = ref('')
const isLogin = ref(false)
let hasInitialized = false

export function useAuth() {
  // 每次调用返回同一个 ref 的引用
  return {
    userId,      // 引用同一个对象
    isLogin,     // 引用同一个对象
    // ...
  }
}
```

### 为什么可行？

- ES Module 的模块是**单例**的
- 第一次 `import` 时执行模块代码，创建状态
- 后续 `import` 只是获取已创建的模块导出

### 与 Vuex/Pinia 的对比

| 特性 | useAuth (单例) | Vuex/Pinia |
|-----|---------------|-----------|
| 复杂度 | 简单 | 较复杂 |
| 文件大小 | 小 (~200行) | 需要额外依赖 |
| 性能 | 优秀 | 优秀 |
| 适用场景 | 简单状态管理 | 复杂应用状态 |
| 学习成本 | 低 | 中 |

---

## ⚠️ 注意事项

### 1. 状态持久化

单例状态只在应用运行期间存在，**刷新应用会丢失**。

解决方案：
- ✅ 使用 `uni.setStorageSync` 持久化
- ✅ `initAuth()` 从 Storage 恢复

### 2. 多实例问题

如果错误地在模块内创建 ref：

```javascript
// ❌ 错误
export function useAuth() {
  const isLogin = ref(false)  // 每次创建新实例
  return { isLogin }
}
```

应该在模块外创建：

```javascript
// ✅ 正确
const isLogin = ref(false)  // 只创建一次
export function useAuth() {
  return { isLogin }
}
```

### 3. 服务端渲染（SSR）

单例在 SSR 中可能有问题（状态会在多个请求间共享）。

- uni-app 小程序：✅ 无 SSR，可以安全使用
- uni-app H5：✅ 客户端渲染，可以使用
- Nuxt/Next.js：⚠️ 需要改用 Pinia 等支持 SSR 的方案

---

## 🎯 总结

### 核心改进

1. **单例模式** → 状态全局共享
2. **自动初始化** → 简化使用
3. **只初始化一次** → 性能提升

### 使用原则

- ✅ 不需要登录：读取 `isLogin`
- ✅ 需要登录：调用 `checkAuth()`
- ✅ 需要完善信息：调用 `checkProfile()`
- ✅ 获取用户信息：直接读取 `userId`、`phone` 等
- ✅ 退出登录：调用 `logout()`

### 代码质量

- 📦 更少的代码（页面不需要手动 initAuth）
- ⚡ 更好的性能（Storage 只读一次）
- 🔒 更安全的状态（全局统一管理）
- 💡 更简单的使用（自动初始化）

---

**最后更新：** 2025-11-14  
**版本：** v2.0.0（单例优化版）

