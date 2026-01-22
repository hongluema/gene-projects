# 采样检测查询小程序 - 项目说明

## 📋 项目概述

这是一个基于 uni-app 开发的采样检测查询小程序，主要用于基层医疗机构进行样本采集、信息录入和检测报告查询。项目采用 Vue 3 + JavaScript 开发。

## 🎯 核心业务流程

```
后台生成项目二维码
  ↓
用户扫码进入小程序
  ↓
填写个人信息（可OCR识别身份证）
  ↓
扫描样本条形码
  ↓
提交数据到后台
  ↓
用户查询检测报告
```

## 📁 项目结构

```
src/
├── pages/                      # 页面文件
│   ├── index/index.vue        # 首页（功能导航）
│   ├── mine/mine.vue          # 个人中心
│   ├── sample-entry/index.vue # 样本录入页
│   ├── sample-success/index.vue # 录入成功页
│   ├── report-query/index.vue  # 报告查询页
│   ├── report-list/index.vue   # 报告列表页
│   ├── report-detail/index.vue # 报告详情页
│   └── about/index.vue        # 关于我们
│
├── components/                 # 组件
│   └── UserAuthDialog.vue     # 用户授权弹窗
│
├── composables/               # 组合式函数
│   └── useWxAuth.js          # 微信授权逻辑
│
├── utils/                     # 工具函数
│   ├── scan.js               # 扫码相关
│   ├── request.js            # 网络请求封装
│   └── validator.js          # 表单验证
│
├── mock/                      # Mock数据
│   └── api.js                # Mock API
│
├── config.js                  # 配置文件
└── pages.json                # 页面路由配置
```

## 🚀 功能模块

### 1. 首页（pages/index/index.vue）

- **快速入口**
  - 扫码录入：扫描项目二维码进入样本录入
  - 报告查询：查询检测报告
- **功能导航**
  - 我的报告
  - 关于我们
  - 联系客服
- **用户信息卡片**（微信小程序）

### 2. 样本录入（pages/sample-entry/index.vue）

- **项目信息**
  - 扫描项目二维码自动加载项目和机构信息
- **身份信息录入**
  - 手动输入：姓名、身份证号、性别、年龄
  - OCR 识别：扫描身份证自动填充
- **联系方式**
  - 手机号（必填）
- **样本信息**
  - 扫描采血管条形码获取样本编号
- **表单验证与提交**

### 3. 样本录入成功（pages/sample-success/index.vue）

- 显示样本编号和录入时间
- 操作按钮：
  - 查询报告
  - 继续录入
  - 返回首页

### 4. 报告查询（pages/report-query/index.vue）

- **两种查询方式**
  - 手机号 + 验证码查询
  - 身份证号直接查询
- **查询历史记录**
  - 显示最近 5 条查询记录
  - 支持快速查询

### 5. 报告列表（pages/report-list/index.vue）

- 显示所有检测报告
- 报告状态：
  - 已完成（可查看）
  - 检测中
  - 等待检测
- 点击查看报告详情

### 6. 报告详情（pages/report-detail/index.vue）

- 报告基本信息展示
- PDF 预览和下载功能
- 温馨提示
- 联系客服

### 7. 个人中心（pages/mine/mine.vue）

- **用户信息**
  - 头像、昵称、OpenID
  - 微信授权登录
- **快捷统计**
  - 我的报告数量
  - 检测中数量
  - 已完成数量
- **功能菜单**
  - 手机号绑定
  - 我的报告
  - 样本录入
  - 关于我们
  - 联系客服
  - 退出登录

### 8. 关于我们（pages/about/index.vue）

- 服务介绍
- 功能特点
- 联系方式
- 法律信息

## 🔧 核心工具函数

### 扫码相关（utils/scan.js）

- `scanQRCode()` - 扫描二维码
- `scanBarCode()` - 扫描条形码
- `parseProjectQRCode()` - 解析项目二维码

### 网络请求（utils/request.js）

- `request()` - 基础请求封装
- `get()` - GET 请求
- `post()` - POST 请求
- `uploadFile()` - 文件上传
- `downloadFile()` - 文件下载

### 表单验证（utils/validator.js）

- `validatePhone()` - 验证手机号
- `validateIdCard()` - 验证身份证
- `validateName()` - 验证姓名
- `validateCode()` - 验证验证码
- `parseIdCard()` - 从身份证解析信息（性别、年龄、生日）

## 📝 配置说明

### config.js

```javascript
export const USE_MOCK = true; // 是否使用Mock数据（开发阶段）

export const API_BASE = "http://localhost:8002"; // API基础地址

export const API = {
  // 用户相关
  wxLogin: `${API_BASE}/api/wx/login`,
  saveUser: `${API_BASE}/api/user/save`,
  // ... 其他接口
};
```

### pages.json

- 配置了所有页面路由
- 设置了 TabBar（首页、个人中心）
- 配置了导航栏样式

## 🎨 UI 设计特点

1. **渐变色主题**

   - 主色：#667eea → #764ba2
   - 成功色：#52c41a → #73d13d

2. **圆角设计**

   - 统一使用 20rpx 圆角
   - 按钮使用 50rpx 圆角

3. **阴影效果**

   - `box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.06)`

4. **图标使用**
   - 使用 Emoji 作为图标，简洁直观

## 🔐 微信小程序授权

使用 `useWxAuth` composable 管理授权状态：

```javascript
const {
  isAuthorized, // 是否已授权
  avatarUrl, // 头像
  nickName, // 昵称
  openId, // OpenID
  phoneNumber, // 手机号
  initWxAuth, // 初始化
  bindPhone, // 绑定手机号
  clearProfile, // 清除资料
} = useWxAuth();
```

## 📱 扫码功能

### 项目二维码格式

支持三种格式：

1. JSON: `{"projectId":"xxx","institutionId":"yyy"}`
2. URL: `https://xxx.com?projectId=xxx&institutionId=yyy`
3. 简单: `projectId_institutionId`

### 样本条形码

直接返回样本唯一 ID

## 🚦 开发与调试

### 启动项目

```bash
# 安装依赖
npm install

# 微信小程序开发
npm run dev:mp-weixin
```

### Mock 模式

开发阶段设置 `config.js` 中 `USE_MOCK = true`，使用 Mock 数据

### 生产模式

上线前设置 `USE_MOCK = false`，并配置正确的 `API_BASE`

## 🔄 数据流

1. **样本录入流程**

   ```
   扫描项目二维码 → 获取项目信息 → 填写个人信息 →
   扫描样本条形码 → 提交数据 → 跳转成功页
   ```

2. **报告查询流程**
   ```
   输入查询条件 → 发送验证码（手机号方式）→
   提交查询 → 显示报告列表 → 查看详情
   ```

## ⚠️ 注意事项

1. **权限配置**

   - 需要配置扫码权限
   - 需要配置网络请求权限
   - 需要配置文件下载权限

2. **兼容性**

   - 微信小程序环境优先
   - 使用条件编译处理平台差异

3. **数据安全**

   - 身份证号等敏感信息需加密传输
   - 本地存储敏感信息需加密

4. **用户体验**
   - 所有网络请求添加 loading 提示
   - 表单提交前进行完整验证
   - 错误信息友好提示

## 📞 技术支持

如有问题，请联系：

- 客服电话：0571-28183061
- 邮箱：service@example.com

---

**开发日期**: 2024 年 11 月
**版本**: v1.0.0
