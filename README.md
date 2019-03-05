
<p align="center"><img src="https://ipic.vizards.cc/2018-02-14-125437.jpg" width="100" alt="UESTC"/></p>
<h1 align="center">UESTC-API</h1>

> 👉 [https://uestc.ml](https://uestc.ml)

[![node (tag)](https://img.shields.io/node/v/egg.svg?style=flat-square)](https://nodejs.org) [![](https://img.shields.io/travis/Vizards/uestc-api.svg?style=flat-square)](https://travis-ci.org/Vizards/uestc-api) [![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/vizards/uestc-api.svg?style=flat-square)](https://hub.docker.com/r/vizards/uestc-api) [![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/vizards/uestc-api.svg?style=flat-square)](https://hub.docker.com/r/vizards/uestc-api/builds) [![](https://img.shields.io/codecov/c/github/Vizards/uestc-api.svg?style=flat-square)](https://codecov.io/gh/Vizards/uestc-api) [![Dependency Status](https://img.shields.io/david/Vizards/uestc-api.svg?style=flat-square)](https://david-dm.org/Vizards/uestc-api) [![](https://img.shields.io/badge/license-GPL-blue.svg?style=flat-square)](https://github.com/Vizards/uestc-api/blob/dev/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/Vizards/uestc-api/pulls) [![%e2%9d%a4](https://img.shields.io/badge/made%20with-%e2%9d%a4-ff69b4.svg?style=flat-square)](https://github.com/Vizards/uestc-api)

## 介绍

UESTC-API 是电子科技大学部分网站功能的集成 API 接口，仅支持查询本科生数据

## 功能

> 以下功能尚未完全接口化。3、4 中的功能均以 302 跳转到相关网页的方式完成（已经过处理使其支持 HTTPS 和移动端视图）
> 
> 如果您有兴趣完善，欢迎 [Pull Request](https://github.com/Vizards/uestc-api/pulls)


1. 教务系统
    - [x] 统一身份认证系统登录/退出
    - [x] 按学期获取课程表信息
    - [x] 按学期获取考试安排信息
    - [x] 按学期获取课程成绩信息
    - [x] 获取所有课程成绩信息
    - [x] 获取成绩统计信息
    - [x] 获取平时成绩信息
    - [x] 获取和设置用户个人信息
    - [ ] 评教

2. 后勤综合服务
    - [x] 获取一卡通信息
    - [ ] 一卡通挂失
    - [x] 获取一卡通和电费账单
    - [x] 获取宿舍电费信息

3. 校园实用工具
    - [x] 校园班车查询
    - [x] 空闲教室查询
    - [x] 当日课程查询
    - [x] 全校课程查询
    - [x] 教师信息查询
    
4. 公告与信息
    - [x] 学校办公室联系方式
    - [x] 教务服务指南
    - [x] 教学管理公告
    - [x] 教研教改公告
    - [x] 实践交流公告
    - [x] 教学新闻
    
5. 开发者服务
    - [x] 获取账户教务系统网站 cookies
    - [x] 获取账户一卡通网站 cookies

## 文档

- API 接口文档： [GitHub Wiki](https://github.com/Vizards/uestc-api/wiki)

- 开发者接口文档：[开发者 - GitHub Wiki](https://github.com/Vizards/uestc-api/wiki/%E5%BC%80%E5%8F%91%E8%80%85)

- Egg 框架文档：[egg - 为企业级框架和应用而生](https://eggjs.org)

## 部署

UESTC-API 现已提供 Docker 版本，但仍可灵活选择多种部署方式

详见：[部署 - GitHub Wiki](https://github.com/Vizards/uestc-api/wiki/%E9%83%A8%E7%BD%B2)

## 开发

在开始之前，请确认您的电子科技大学本科统一身份认证系统账户已完成初始设置

#### 安装

项目框架为 [Egg](https://eggjs.org)，`node` 版本需要高于 `v8.0.0`

```bash
$ git clone && npm install
```


#### 安装全局依赖

- [MongoDB](https://docs.mongodb.com/)

- ~~[GraphicsMagick](http://www.graphicsmagick.org/)：用于处理验证码~~

- ~~[Tesseract 3.01+](https://github.com/tesseract-ocr/tesseract)：用于识别验证码~~

#### 开发环境运行

**设置 `config.default.js` 和 `config.unittest.js` 中的密码、Key 等**

```bash
$ npm run dev
```

> 参数说明

参数 | 是否必须 | 说明
:---: | :---: | :---:
`APP_KEY` | 是 | 自定义
`JWT_SECRET` | 是 | 自定义，生成 `jwt-token` 的密钥
`YOUR_STU_NUM`<br/>`YOUR_STU_PASS` | 否（单元测试必须）| 学号<br/>密码
`YOUR_ROOM_ID` | 否（单元测试必须）| 宿舍房间号
`ALINODE_APPID`<br/>`ALINODE_SECRET` | 是 | 阿里云 Node.js 性能平台<br/>`APPID`<br/>`SECRET`<br/>（需自行注册）
`PROXY` | 否 | HTTP(S) 代理服务器地址和端口 <br> 格式 `http(s)://url:port`

或者可以将参数设置为环境变量，然后运行：

**Linux, MacOS(Bash)**

```bash
APP_KEY=xxx JWT_SECRET=xxx YOUR_STU_NUM=xxx  YOUR_STU_PASS=xxx YOUR_ROOM_ID=xxx ALINODE_APPID=xxx ALINODE_SECRET=xxx PROXY=xxx npm run dev
```

**Windows(cmd.exe)**

```bash
set APP_KEY=xxx && set JWT_SECRET=xxx && set YOUR_STU_NUM=xxx && set YOUR_STU_PASS=xxx && set YOUR_ROOM_ID=xxx && set ALINODE_APPID=xxx && set ALINODE_SECRET=xxx && set PROXY=xxx && npm run dev
```

**Windows(Powershell)**

```bash
($env:APP_KEY=xxx) -and ($env:JWT_SECRET=xxx) -and ($env:YOUR_STU_NUM=xxx) -and ($env:YOUR_STU_PASS=xxx) -and ($env:YOUR_ROOM_ID=xxx) -and ($env:ALINODE_APPID=xxx) -and ($env:ALINODE_SECRET=xxx) -and ($env:PROXY=xxx) -and npm run dev
```

浏览器打开 `http://127.0.0.1:7001` 页面出现项目主页即为运行成功

#### 单元测试

单元测试受源站网络影响，如遇单元测试无法通过，请先确认 **[教务系统](http://portal.uestc.edu.cn)**、**[一卡通](http://ecard.uestc.edu.cn)**、**成电微教务（微信订阅号）** 是否可以正常使用

```bash
$ npm run test
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

## 合作产品

如果您的产品或服务接入了 UESTC-API，可通过 [New Issue](https://github.com/Vizards/uestc-api/issue) 或 [Pull Request](https://github.com/Vizards/uestc-api/pulls) 展示在此处

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <img width="60px" src="https://ipic.vizards.cc/2018-04-14-171713.png" alt="UESTC" width="60px"">
      </td>
      <td align="left" valign="middle">
        <a href="https://github.com/Vizards/uestc-react-native-ios" target="_blank">电子科技大学（UESTC）iOS 客户端</a>
      </td>
    </tr>
<tr>
      <td align="center" valign="middle">
        <img width="50px" src="https://raw.githubusercontent.com/Febers/iUESTC/master/picture/app_icon.png" alt="UESTC" width="60px">
      </td>
      <td align="left" valign="middle">
        <a href="https://github.com/Febers/iUESTC" target="_blank">iUESTC - 电子科技大学 Android 客户端</a>
      </td>
    </tr>
  </tbody>
</table>

## 许可协议

[GPL-3.0](https://github.com/Vizards/uestc-api/blob/dev/LICENSE)







