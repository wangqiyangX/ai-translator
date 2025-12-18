# AI Translator

一个功能强大的AI翻译工具，支持文本和文档翻译，使用您自己的AI提供商。

<a href="https://www.producthunt.com/products/ai-translator-5?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-ai-translator-84009c33-8e08-4901-b9d0-376d38b9ff1e" target="_blank" rel="noopener noreferrer"><img alt="AI Translator - Translate your text and document use your ai provider. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1034736&amp;theme=light&amp;t=1766042489547"></a>

## ✨ 功能特性

- 🌍 **多语言支持** - 支持英语、西班牙语、法语、德语、意大利语、葡萄牙语、俄语、日语、韩语、中文、阿拉伯语、印地语等多种语言
- 📝 **文本翻译** - 快速翻译文本内容
- 📄 **文档翻译** - 支持上传文档文件进行翻译
- 🔑 **自定义API** - 支持使用您自己的OpenAI API密钥或自定义API端点
- 🎨 **主题切换** - 支持亮色/暗色主题
- 🚀 **Vercel AI Gateway** - 可选择使用Vercel AI Gateway（无需API密钥）
- 💻 **现代化UI** - 基于shadcn/ui构建的美观界面
- 📱 **响应式设计** - 完美适配各种设备

## 🛠️ 技术栈

- **框架**: Next.js 16
- **语言**: TypeScript
- **UI组件**: shadcn/ui (Radix UI)
- **样式**: Tailwind CSS
- **AI SDK**: Vercel AI SDK
- **文件处理**: react-dropzone

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
2. 选择源语言和目标语言
3. （可选）在设置中配置API密钥和模型
4. 点击翻译按钮

### 文档翻译

1. 切换到"文档翻译"标签页
2. 拖拽文件到上传区域或点击选择文件
3. 选择源语言和目标语言
4. 点击翻译按钮
5. 翻译完成后可以下载结果

### API配置

#### 使用自定义API密钥

1. 点击设置按钮
2. 输入您的OpenAI API密钥
3. （可选）配置自定义API端点（base URL）
4. 选择要使用的模型（如 gpt-4o-mini, gpt-4o 等）
5. 点击"测试连接"验证配置

#### 使用Vercel AI Gateway

如果不提供API密钥，应用将使用Vercel AI Gateway（如果已配置）。

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

本项目为私有项目。

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题或建议，请通过GitHub Issues联系我们。

---

[English](README.md) | [中文文档](README.zh.md)

