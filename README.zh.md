# AI Translator

一个功能强大的 AI 翻译工具，支持文本、文档和图片翻译，使用最终用户自己的 API 密钥。

<a href="https://www.producthunt.com/products/ai-translator-5?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-ai-translator-84009c33-8e08-4901-b9d0-376d38b9ff1e" target="_blank" rel="noopener noreferrer"><img alt="AI Translator - Translate your text and document use your ai provider. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1034736&amp;theme=light&amp;t=1766042489547"></a>

## ✨ 功能特性

- 🌍 **多语言支持** - 支持英语、西班牙语、法语、德语、意大利语、葡萄牙语、俄语、日语、韩语、中文、阿拉伯语、印地语等多种语言
- 📝 **文本翻译** - 支持自动翻译，并可在输入停顿后自动检测源语言
- 📄 **文档翻译** - 支持上传文档翻译，且可在翻译前编辑原始内容
- 🖼️ **图片翻译** - 从图片中提取文字并翻译
- 🔑 **自带 API Key** - 由用户配置自己的 API Key 与可选自定义兼容端点（Base URL）
- 📊 **Token 使用统计** - 展示输入/输出/总量/请求次数，并持久化到本地存储
- 🛡️ **API 安全加固** - `/api/*` 必须提供 API Key，并带有按 IP + API Key 的限流
- 🎨 **主题切换** - 支持亮色/暗色主题
- 💻 **现代化UI** - 基于shadcn/ui构建的美观界面
- 📱 **响应式设计** - 完美适配各种设备

## 🛠️ 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **UI组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS
- **AI SDK**: Vercel AI SDK
- **状态管理**: Zustand
- **文件处理**: react-dropzone

## 🧱 架构说明

- **分层 UI**：主页面负责编排，各功能拆分为模块组件（`SettingsDialog`、`LanguageControls`、`TextTab`、`DocumentTab`、`ImageTab`、`ApiStatusCard`）
- **集中状态管理**：按职责拆分 Zustand Store：
  - `useTranslatorSettingsStore`：语言选择、API 配置、设置弹窗状态
  - `useTranslatorRuntimeStore`：翻译运行态、API 可用性状态、Token 统计
- **API 路由层**：`/api/*` 负责翻译、语种检测、安全校验与限流

## 📦 安装

1. 克隆仓库：
```bash
git clone <repository-url>
cd ai-translator
```

2. 安装依赖：
```bash
pnpm install
```

3. 运行开发服务器：
```bash
pnpm dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000)

## 🚀 使用方法

### 文本翻译

1. 在文本输入框中输入要翻译的文本
2. 在设置中配置 API Key 和模型
3. 输入停顿后可自动检测源语言
4. 若检测后与目标语言冲突，会自动调整目标语言避免同语种互译
5. （可选）使用输出模式与自定义 Prompt 控制翻译风格

### 文档翻译

1. 切换到"文档翻译"标签页
2. 拖拽文件到上传区域或点击选择文件
3. （可选）在左侧编辑待翻译内容
4. 选择源语言和目标语言
5. 点击翻译按钮
6. 翻译完成后可下载结果

### 图片翻译

1. 切换到“图片”标签页
2. 上传一张图片
3. 点击图片与结果面板中间的箭头按钮触发翻译
4. 在右侧查看翻译结果

### API配置

#### 使用自定义 API Key

1. 点击设置按钮
2. 输入您的OpenAI API密钥
3. （可选）配置自定义API端点（base URL）
4. 选择要使用的模型（如 gpt-4o-mini, gpt-4o 等）
5. （可选）配置高级设置：
   - 输出模式：`Translation Only` / `Bilingual`
   - 自定义 Prompt：附加翻译要求
   - 自动检测源语言：开/关

说明：翻译与语种检测请求均需要 API Key。

## 🔧 环境变量（可选）

如果需要使用环境变量配置默认设置，可以创建 `.env.local` 文件：

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📝 脚本命令

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行ESLint检查
- `pnpm typecheck` - 运行 TypeScript 类型检查

## 🔐 安全说明

- 所有 `/api/*` 路由都要求请求中提供 API Key。
- 内置按 IP 与 API Key 的双维度限流。
- API Key 与 Token 统计保存在浏览器本地 `localStorage`。

## 🔒 隐私与页脚声明

页面底部 Footer 已包含：
- 隐私声明（API Key 本地存储 + 请求经应用 API 路由转发）
- 版权声明
- 技术栈说明
- 对模型生态与开源项目的致谢

## 🌐 支持的语言

- 英语 (English)
- 西班牙语 (Spanish)
- 法语 (French)
- 德语 (German)
- 意大利语 (Italian)
- 葡萄牙语 (Portuguese)
- 俄语 (Russian)
- 日语 (Japanese)
- 韩语 (Korean)
- 中文 (Chinese)
- 阿拉伯语 (Arabic)
- 印地语 (Hindi)

## 📄 许可证

本项目采用 MIT 开源协议。详见 [LICENSE](LICENSE)。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

[English](README.md) | [中文文档](README.zh.md)
