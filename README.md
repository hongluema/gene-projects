微信默认头像和昵称原因与解决方案如下：

- 原因（微信平台策略调整）
  - 微信已不再向第三方小程序直接下发用户的真实头像与昵称。即便调用 getUserProfile，通常也只返回“默认头像 + 微信用户”之类的匿名信息。这是平台的隐私合
    规调整，属预期行为。
  - 正确做法是引导用户在你的小程序内“主动选择头像 + 填写昵称”，而不是读取其微信资料。这套能力叫“头像昵称填写能力”，通过 chooseAvatar 与 input
    type=nickname 实现。
- 我已为首页改成合规方案（仅小程序端显示）
  - 在页面顶部增加“用户卡片”，并在未授权状态下展示：
    - 选择头像：原生按钮 open-type="chooseAvatar"，回调里拿到 e.detail.avatarUrl。
    - 填写昵称：<input type="nickname">，拿到昵称并保存。
  - 保存后会本地缓存头像与昵称，并将卡片切换为已授权展示。openId 依然通过 uni.login 的 code 去你后端换取。
- 你可以直接运行并验证
  - 开发：npm run dev:mp-weixin
  - 首页顶部会显示“未授权用户/未绑定”。点击“选择头像”，再输入昵称，点“保存”，随即显示你选择的头像与昵称。

---

/api/getOpenid 的作用

- 核心用途
  - 使用微信登录返回的 code，在你的服务端调用微信官方接口 jscode2session，换取 openId 和 session_key（可选 unionid）。
- 典型场景
  - 用户身份标识：用 openId 作为小程序内用户唯一标识，创建/绑定你业务里的用户账号。
  - 会话安全：在服务端持有 session_key 来进行后续加密数据解密（如手机号等，走合规授权流程）。
  - 登录态建立：服务端根据 openId 创建/查找用户，签发你自己的 token，返回给小程序使用。
- 安全注意
  - 不要在小程序前端直接信任 openId。前端只上传 code，服务端向微信接口换取 openId 后再返回给前端或仅在服务端保存。
  - session_key 只应保存在服务端，不要下发给前端。

### 生成随机身份证号

```js
function generateIDCard() {
// 随机生成前 6 位（地区码，这里使用一些真实存在的地区码）
const areaCodes = [
'110101', // 北京市东城区
'310104', // 上海市徐汇区
'440103', // 广州市荔湾区
'440106', // 广州市天河区
'440305', // 深圳市南山区
'330102', // 杭州市上城区
'320105', // 南京市建邺区
'510104', // 成都市锦江区
'420102', // 武汉市江岸区
'430102' // 长沙市芙蓉区
];
const areaCode = areaCodes[Math.floor(Math.random() * areaCodes.length)];

// 随机生成 8 位出生日期（1980-2000 年）
const year = 1980 + Math.floor(Math.random() _ 21);
const month = String(Math.floor(Math.random() _ 12) + 1).padStart(2, '0');
const day = String(Math.floor(Math.random() \* 28) + 1).padStart(2, '0');
const birthDate = `${year}${month}${day}`;

// 随机生成 3 位顺序码
const sequenceCode = String(Math.floor(Math.random() \* 999) + 1).padStart(3, '0');

// 前 17 位
const first17 = areaCode + birthDate + sequenceCode;

// 计算校验码（第 18 位）
const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

let sum = 0;
for (let i = 0; i < 17; i++) {
sum += parseInt(first17.charAt(i)) \* weights[i];
}

const checkCode = checkCodes[sum % 11];

return first17 + checkCode;
}

// 生成示例
console.log(generateIDCard());
```
