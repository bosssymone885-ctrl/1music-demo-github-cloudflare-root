# Music Player Motion Demo

一个基于 React、TypeScript 和 Vite 构建的移动端音乐播放器交互 Demo，包含：

- 首页横向音乐卡片与专辑区域
- 可切换的音乐分类筛选栏
- 带弹性形变的底部 Tab 动画
- 自下而上进入的全屏播放页
- 播放页与评论页过渡动画
- 两套歌曲播放页和评论页内容

## 本地运行

要求：Node.js 20 或更高版本。

```bash
npm ci
npm run dev
```

浏览器打开终端显示的本地地址。

## 生产构建

```bash
npm ci
npm run build
```

构建结果位于 `dist/`。

## 上传到 GitHub

在项目根目录执行：

```bash
git init
git add .
git commit -m "Initial music demo"
git branch -M main
git remote add origin https://github.com/YOUR_ACCOUNT/YOUR_REPOSITORY.git
git push -u origin main
```

请将示例中的 GitHub 用户名和仓库名替换为你的实际信息。

## 使用 Cloudflare Pages 部署

1. 登录 Cloudflare Dashboard。
2. 打开 **Workers & Pages**，选择 **Create application**。
3. 选择 **Pages** 和 **Connect to Git**。
4. 连接并选择刚刚上传的 GitHub 仓库。
5. 使用以下构建设置：

| 设置 | 值 |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `/` 或留空 |
| Node.js version | `20` 或更高 |

6. 点击 **Save and Deploy**。

项目已包含 `public/_redirects`，Cloudflare Pages 构建时会将其复制到 `dist/`，刷新页面时仍会正确返回应用入口。

## 项目结构

```text
.
├── index.html
├── package.json
├── package-lock.json
├── public/
├── src/
├── tsconfig.json
└── vite.config.ts
```
