# koishi-plugin-wulijonc-help

[![npm](https://img.shields.io/npm/v/koishi-plugin-wulijonc-help?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-wulijonc-help)

一个轻量的 Koishi 插件，用于发送自定义的帮助图片/文字。支持配置多条命令，每条命令可独立绑定不同的图片和文字。

## 功能

- 自定义命令名称，用户在聊天中发送即可触发
- 支持**云端 URL**（推荐）和**本地文件路径**两种图片来源
- 支持纯图片、纯文字、图文混合三种回复模式
- 支持配置**多条命令**，互不干扰
- Koishi 控制台自动生成配置界面，无需手动编辑配置文件

## 安装

在 Koishi 控制台的「插件市场」中搜索 `wulijonc-help` 安装，或通过命令行：

```bash
npm install koishi-plugin-wulijonc-help
```

## 配置

在 Koishi 控制台的「插件配置」中找到 `wulijonc-help`，点击即可看到可视化配置界面。

### 配置项说明

插件的配置是一个**命令列表**，每条命令包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `command` | string | 是 | 命令名称（用户在聊天中输入的触发词） |
| `description` | string | 否 | 命令描述，显示在 help 列表中（默认：`自定义回复`） |
| `imageUrl` | string | 否 | 图片 URL（推荐，零内存开销） |
| `imagePath` | string | 否 | 本地图片路径（每次触发时读取，不常驻内存） |
| `message` | string | 否 | 附带的文字消息 |

> `imageUrl` 和 `imagePath` 二选一。如果同时填写，优先使用 `imageUrl`。

### 配置示例

```yaml
commands:
  - command: help-img
    description: 发送帮助图片
    imageUrl: 'https://your-image-host.com/help.png'
    message: ''
  - command: menu
    description: 查看菜单
    imagePath: 'data/assets/menu.png'
    message: '以下是功能菜单：'
  - command: notice
    description: 查看公告
    message: '当前没有新公告。'
```

## 图片来源建议

| 方案 | 适用场景 | 内存开销 |
|------|----------|----------|
| 云端 URL（图床/本地图床） | 推荐，尤其是 Docker 部署 | 零 |
| 本地文件路径 | 图片与 Koishi 在同一文件系统 | 仅在发送时临时占用 |

## 许可证

MIT
