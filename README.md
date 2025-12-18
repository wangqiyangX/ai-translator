# AI Translator

A powerful AI translation tool that supports text and document translation using your own AI provider.

<a href="https://www.producthunt.com/products/ai-translator-5?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-ai-translator-84009c33-8e08-4901-b9d0-376d38b9ff1e" target="_blank" rel="noopener noreferrer"><img alt="AI Translator - Translate your text and document use your ai provider. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1034736&amp;theme=light&amp;t=1766042489547"></a>

## ✨ Features

- 🌍 **Multi-language Support** - Supports multiple languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, and more
- 📝 **Text Translation** - Quickly translate text content
- 📄 **Document Translation** - Upload and translate document files
- 🔑 **Custom API** - Use your own OpenAI API key or custom API endpoint
- 🎨 **Theme Toggle** - Light/dark theme support
- 🚀 **Vercel AI Gateway** - Option to use Vercel AI Gateway (no API key required)
- 💻 **Modern UI** - Beautiful interface built with shadcn/ui
- 📱 **Responsive Design** - Perfect adaptation for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **AI SDK**: Vercel AI SDK
- **File Handling**: react-dropzone

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-translator
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🚀 Usage

### Text Translation

1. Enter the text you want to translate in the text input box
2. Select source and target languages
3. (Optional) Configure API key and model in settings
4. Click the translate button

### Document Translation

1. Switch to the "Document Translation" tab
2. Drag and drop a file to the upload area or click to select a file
3. Select source and target languages
4. Click the translate button
5. Download the result after translation is complete

### API Configuration

#### Using Custom API Key

1. Click the settings button
2. Enter your OpenAI API key
3. (Optional) Configure a custom API endpoint (base URL)
4. Select the model to use (e.g., gpt-4o-mini, gpt-4o, etc.)
5. Click "Test Connection" to verify the configuration

#### Using Vercel AI Gateway

If no API key is provided, the app will use Vercel AI Gateway (if configured).

## 🔧 Environment Variables (Optional)

If you need to configure default settings using environment variables, create a `.env.local` file:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 📝 Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🌐 Supported Languages

- English
- Spanish
- French
- German
- Italian
- Portuguese
- Russian
- Japanese
- Korean
- Chinese
- Arabic
- Hindi

## 📄 License

This project is private.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📧 Contact

For questions or suggestions, please contact us via GitHub Issues.

---

[中文文档](README.zh.md) | [English](README.md)
