# 四级慢慢学 · 电脑版与安卓版源码

从基础单词开始备考英语四级的个人学习工具，当前源码对应 v1.1.0。

[下载电脑版 ZIP / 安卓 APK](https://github.com/3013790010xrg-wq/cet4-slow-study-desktop-android/releases/tag/v1.1.0) · [下载完整源码压缩包](https://github.com/3013790010xrg-wq/cet4-slow-study-desktop-android/releases/download/v1.1.0/cet4-slow-study-source-v1.1.0.zip)

本仓库存放电脑版和安卓工程，不部署网站。原线上站点仍由独立仓库维护。

## 目录

| 路径 | 内容 |
| --- | --- |
| `source-app/` | 电脑版 HTML、CSS、JavaScript、词库、练习、模拟卷和写作改错 |
| `android/` | Capacitor Android 原生工程、图标和 Gradle Wrapper |
| `web-src/` | 安卓阅读器、音频播放器、图标和应用网页资源 |
| `scripts/prepare-web.cjs` | 从电脑版源码生成安卓所用的 `www/` |
| `scripts/restore-media.ps1` | 从已发布电脑版下载包恢复试卷和音频 |
| `package.json` / `package-lock.json` | 构建命令和锁定的依赖版本 |

## 运行电脑版

打开 `source-app/index.html` 即可，无需安装 Node.js。建议使用 Chrome 或 Edge。词汇、练习、写作和模拟卷可直接使用。

要使用本地试卷 PDF 和听力 MP3，先恢复资料。Windows 在项目根目录运行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-media.ps1
```

脚本会下载已发布的电脑版 ZIP，校验 SHA-256，只恢复 `source-app/历年试卷/`。如果已下载 ZIP，可指定本地文件：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/restore-media.ps1 -ArchivePath "D:\Downloads\cet4-slow-study-desktop-v1.1.0.zip"
```

其他系统可以手动解压该 ZIP，将 `四级学习包/历年试卷/` 复制到源码的 `source-app/历年试卷/`。完整资料包含 30 份 PDF 和 8 份 MP3；来源说明见包内文档。2026 年 6 月听力仍需从资料来源网页收听。

## 构建安卓 APK

准备 Node.js 22 或更新版本、JDK 21、Android Studio / Android SDK 36。安装依赖和 Gradle 首次构建需要联网。

恢复上述资料后，在项目根目录执行：

```text
npm ci
npm run sync
```

随后用 Android Studio 打开 `android/` 构建，或在 Windows 运行：

```powershell
cd android
.\gradlew.bat assembleDebug
```

macOS / Linux 可运行 `sh gradlew assembleDebug`。构建输出为 `android/app/build/outputs/apk/debug/app-debug.apk`。最低支持 Android 7.0；当前 versionCode 为 2，versionName 为 1.1.0。

`npm run sync` 会生成网页资源及 Capacitor 配置。本机 `local.properties`、构建输出、依赖缓存和签名密钥不在源码中。自己构建的 APK 使用自己电脑的签名，无法直接覆盖采用不同签名的已发布 APK。

Windows 若出现 Java `Unable to establish loopback connection`，可使用已存在的短路径设置 `JAVA_TOOL_OPTIONS=-Djdk.net.unixdomain.tmpdir=C:\Temp` 后重试。

## 修改入口

- `source-app/app.js`：学习流程、进度与自动考试倒计时。
- `source-app/data.js`、`extra-data.js`、`mock-data.js`：词汇、练习和模拟卷。
- `source-app/grader.js`：离线写作改错与练习估分。
- `source-app/style.css`：界面样式。

修改后再次运行 `npm run sync`，再构建安卓包。倒计时按北京时间每天更新，考试结束后切换下一场；未正式公布的日期标为“预计”，已公布日期表需按官方公告维护。

学习进度保存在设备本地。写作评分是规则估分，不是官方成绩。第三方试卷资料与依赖保留各自的来源和权利说明。

## 源码版本说明

仓库 `main` 包含本次补充的源码。v1.1.0 发布时的 Git 标签仅含下载说明，因此请使用上方明确命名的源码 ZIP，或下载当前 `main` 分支；既有安装包未被修改。
