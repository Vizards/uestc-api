
<p align="center"><img src="https://o9sapbwjn.qnssl.com/2018-02-14-125437.jpg" width="100" alt="UESTC"/></p>
<h1 align="center">UESTC-API</h1>

> 👉 [https://uestc.ga](https://uestc.ga)

[![node (tag)](https://img.shields.io/node/v/egg.svg?style=flat-square)](https://nodejs.org) [![](https://img.shields.io/travis/Vizards/uestc-api.svg?style=flat-square)](https://travis-ci.org/Vizards/uestc-api) [![](https://img.shields.io/codecov/c/github/Vizards/uestc-api.svg?style=flat-square)](https://codecov.io/gh/Vizards/uestc-api) [![Dependency Status](https://img.shields.io/david/Vizards/uestc-api.svg?style=flat-square)](https://david-dm.org/Vizards/uestc-api) [![](https://img.shields.io/badge/license-GPL-blue.svg?style=flat-square)](https://github.com/Vizards/uestc-api/blob/master/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Vizards/uestc-api/pulls) [![%e2%9d%a4](https://img.shields.io/badge/made%20with-%e2%9d%a4-ff69b4.svg?style=flat-square)](https://github.com/Vizards/uestc-api)

## 介绍

UESTC-API 是电子科技大学部分网站功能的集成 API 接口，仅支持查询本科生数据

## 功能

1. 教务系统
    - [x] 统一身份认证系统登录/退出
    - [x] 按学期获取课程表信息
    - [x] 按学期获取考试安排信息
    - [x] 按学期获取课程成绩信息
    - [x] 获取所有课程成绩信息
    - [x] 获取成绩统计信息
    - [x] 获取平时成绩信息
    - [ ] 评教

2. 后勤综合服务
    - [x] 绑定喜付账户
    - [x] 获取一卡通信息
    - [x] 获取最近 30 天账单
    - [x] 获取宿舍电费信息
    - [x] 监控宿舍电费与一卡通余额，余额预警推送
    - [x] 获取班车 / 公交信息

3. 教务处
    - [x] 教务处学生公告
    - [x] 学校部门信息
    - [x] 学院地址 & 联系方式

## 文档

- API 接口文档： [GitHub Wiki](https://github.com/Vizards/uestc-api/wiki)

- Egg 框架文档：[egg - 为企业级框架和应用而生](https://eggjs.org)


## 快速开始

在开始之前，需要：

1. 已完成初始设置的电子科技大学本科统一身份认证系统账户

2. 已完成学生认证和一卡通、电费房间号绑定的喜付账户

#### 安装

项目框架为 [Egg](https://eggjs.org)，`node` 版本需要高于 `v8.0.0`

```bash
$ git clone && npm install
```


#### 安装全局依赖

- [MongoDB](https://docs.mongodb.com/)

- [GraphicsMagick](http://www.graphicsmagick.org/)：用于处理验证码

- [Tesseract 3.01+](https://github.com/tesseract-ocr/tesseract)：用于识别验证码

#### 开发环境运行

**将 `config.default.js` 和 `config.unittest.js` 中的密码、Key 等替换成自己的**

```bash
$ npm run dev
```

或者可以将参数设置为环境变量，然后运行：

```bash
$ APP_KEY=xxx JWT_SECRET=xxx YOUR_STU_NUM=xxx  YOUR_STU_PASS=xxx YOUR_XIFU_ACCOUNT=xxx YOUR_XIFU_PASS=xxx YOUR_ROOM_ID=xxx ALINODE_APPID=xxx ALINODE_SECRET=xxx PROXY=YOUR_HTTP_PROXY_URL npm run dev
```

> 参数说明

参数 | 是否必须 | 说明
:---: | :---: | :---:
`APP_KEY` | 是 | 自定义
`JWT_SECRET` | 是 | 自定义，生成 `jwt-token` 的密钥
`YOUR_STU_NUM`<br/>`YOUR_STU_PASS` | 否（单元测试必须）| 学号<br/>密码
`YOUR_XIFU_ACCOUNT`<br/>`YOUR_XIFU_PASS`<br/>`YOUR_ROOM_ID` | 否（单元测试必须）| 喜付账户<br/>喜付密码<br/>宿舍房间号
`ALINODE_APPID`<br/>`ALINODE_SECRET` | 是 | 阿里云 Node.js 性能平台<br/>`APPID`<br/>`SECRET`<br/>（需自行注册）
`PROXY` | 否 | HTTP(S) 代理服务器地址和端口 <br> 格式 `http(s)://url:port`


浏览器打开 `http://127.0.0.1:7001` 页面出现项目主页即为运行成功

#### 单元测试

单元测试受源站网络影响，如遇单元测试无法通过，请先确认 **[教务系统](http://portal.uestc.edu.cn)**、**[清水河畔](http://bbs.uestc.edu.cn)**、**喜付 APP**、**成电微教务（微信订阅号）** 是否可以正常使用

```bash
$ npm test
```

目前只完成了 `Controller` 层简单的单元测试，如果您有兴趣完善，欢迎 [Pull Request](https://github.com/Vizards/uestc-api/pulls)

#### 覆盖率测试

```bash
$ npm run cov
```

#### 代码风格检查（ESLint）

```bash
$ npm run lint
```

#### 检查依赖更新

请先删除 `package-lock.json` 或 `yarn.lock` 文件

```bash
$ npm run autod
```

参考：[autod](https://www.npmjs.com/package/autod) 

## 许可协议

[GPL-3.0](https://github.com/Vizards/uestc-api/blob/master/LICENSE)







