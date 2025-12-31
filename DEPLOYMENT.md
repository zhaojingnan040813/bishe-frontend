# 🚀 Netlify 部署指南

## 📋 前置要求

- Git 仓库（GitHub/GitLab/Bitbucket）
- Netlify 账号
- Node.js 18+ 和 npm

---

## 🔧 部署配置说明

### ✅ 已完成的配置

1. **[netlify.toml](netlify.toml)** - Netlify 部署配置文件
   - 构建命令: `npm run build`
   - 输出目录: `dist`
   - API 代理: `/api/*` → 腾讯云后端

2. **[.env.production](.env.production)** - 生产环境变量
   - `VITE_API_BASE_URL=/api` (使用相对路径，通过 Netlify 代理)

---

## 📦 部署步骤

### 方式一：通过 Netlify 网站部署（推荐）

#### 1️⃣ 推送代码到 Git 仓库

```powershell
# 如果还没有初始化 Git
git init
git add .
git commit -m "feat: 配置 Netlify 部署"

# 连接到远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/yourusername/your-repo.git
git branch -M main
git push -u origin main
```

#### 2️⃣ 在 Netlify 创建新站点

1. 访问 [Netlify](https://app.netlify.com/)
2. 点击 **"Add new site"** → **"Import an existing project"**
3. 选择 Git 提供商（GitHub/GitLab/Bitbucket）
4. 授权并选择你的仓库

#### 3️⃣ 配置构建设置

Netlify 会自动检测到 `netlify.toml`，无需手动配置。如果需要手动配置：

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: 18 或更高

#### 4️⃣ 部署

点击 **"Deploy site"**，Netlify 会自动：

- 安装依赖 (`npm install`)
- 构建项目 (`npm run build`)
- 发布到 CDN

---

### 方式二：使用 Netlify CLI 部署

#### 1️⃣ 安装 Netlify CLI

```powershell
npm install -g netlify-cli
```

#### 2️⃣ 登录 Netlify

```powershell
netlify login
```

#### 3️⃣ 初始化项目

```powershell
# 在项目根目录执行
netlify init
```

按提示选择：

- **Create & configure a new site**
- 选择团队
- 输入站点名称（可选）
- 构建命令: `npm run build`
- 发布目录: `dist`

#### 4️⃣ 部署

```powershell
# 构建并部署到生产环境
netlify deploy --prod

# 或者先部署到预览环境测试
netlify deploy
```

---

## 🔍 验证部署

### 1. 检查站点状态

部署完成后，Netlify 会提供：

- **站点 URL**: `https://your-site-name.netlify.app`
- **部署预览**: 每次 Git 推送都会触发自动部署

### 2. 测试 API 连接

打开浏览器开发者工具，检查：

- ✅ API 请求路径应该是: `https://your-site-name.netlify.app/api/xxx`
- ✅ Netlify 会自动代理到: `https://zjn-backend-165954-5-1362504576.sh.run.tcloudbase.com/api/xxx`

### 3. 测试功能

- 药物数据库查询
- 相互作用检测
- AI 聊天功能
- 图谱可视化

---

## ⚙️ 高级配置

### 环境变量（在 Netlify Dashboard 配置）

如果需要覆盖 `.env.production` 中的配置：

1. 进入站点设置: **Site settings** → **Environment variables**
2. 添加变量（可选）:
   - `VITE_API_BASE_URL` = `/api`
   - `VITE_API_TIMEOUT` = `30000`

> **注意**: 环境变量以 `VITE_` 开头才能在前端访问

### 自定义域名

1. **Site settings** → **Domain management**
2. **Add custom domain**
3. 按照提示配置 DNS（添加 CNAME 或 A 记录）

### HTTPS 配置

Netlify 自动提供免费的 SSL 证书（Let's Encrypt），无需手动配置。

---

## 🐛 常见问题

### Q1: 部署后 API 请求失败（404/CORS 错误）

**原因**: 后端可能没有允许 Netlify 域名跨域访问

**解决方案**:

1. 联系后端开发者
2. 在后端 CORS 配置中添加 Netlify 域名:
   ```
   https://your-site-name.netlify.app
   或使用通配符: https://*.netlify.app
   ```

### Q2: 构建失败 - 找不到模块

**解决方案**:

```powershell
# 删除 node_modules 和 package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json

# 重新安装依赖
npm install

# 提交更新的 package-lock.json
git add package-lock.json
git commit -m "fix: 更新依赖锁文件"
git push
```

### Q3: 页面刷新后 404（仅在非 Hash 路由时）

**当前项目使用 Hash 路由，不会出现此问题**。如果未来改用 History 路由，需要在 `netlify.toml` 添加:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Q4: 环境变量没有生效

**检查清单**:

- ✅ 变量名以 `VITE_` 开头
- ✅ 修改环境变量后重新部署
- ✅ 在代码中使用 `import.meta.env.VITE_变量名` 访问

---

## 📊 部署后监控

### Netlify Dashboard

- **Deploys**: 查看部署历史和日志
- **Functions**: 如果使用 Netlify Functions（当前未使用）
- **Analytics**: 访问统计（需要付费计划）

### 实时日志

```powershell
# 查看实时部署日志
netlify watch

# 查看函数日志
netlify functions:log
```

---

## 🔄 持续集成/持续部署 (CI/CD)

配置完成后，每次推送到主分支都会自动触发部署：

```powershell
# 开发流程
git add .
git commit -m "feat: 新功能"
git push origin main
# Netlify 自动检测并部署 🚀
```

### 分支预览部署

Netlify 自动为每个分支和 Pull Request 创建预览部署：

- **主分支**: 自动部署到生产环境
- **其他分支**: 创建预览 URL（如 `deploy-preview-123--your-site.netlify.app`）

---

## 🎯 部署清单

在部署前确认：

- [x] `netlify.toml` 已创建
- [x] `.env.production` 配置正确（使用 `/api`）
- [x] 代码已推送到 Git 仓库
- [ ] 在 Netlify 创建并连接站点
- [ ] 通知后端开发者添加 Netlify 域名到 CORS 白名单
- [ ] 测试所有功能是否正常

---

## 📞 后端 CORS 配置参考

请将以下信息发送给后端开发者：

```
需要在后端添加 CORS 白名单：

开发环境：http://localhost:5173
生产环境：https://your-site-name.netlify.app (或自定义域名)

支持通配符：https://*.netlify.app
```

---

## 🎉 完成

部署成功后，你将获得：

- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 持续部署（Git 推送自动更新）
- ✅ 免费托管（慷慨的免费额度）
- ✅ 安全的 API 代理（后端地址不暴露）

**祝部署顺利！** 🚀
