# AI Translator

A powerful AI translation tool for text, document, and image translation using the end user's own API key.

<a href="https://www.producthunt.com/products/ai-translator-5?embed=true&amp;utm_source=badge-featured&amp;utm_medium=badge&amp;utm_campaign=badge-ai-translator-84009c33-8e08-4901-b9d0-376d38b9ff1e" target="_blank" rel="noopener noreferrer"><img alt="AI Translator - Translate your text and document use your ai provider. | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1034736&amp;theme=light&amp;t=1766042489547"></a>

## ✨ Features

- 🌍 **Multi-language Support** - Supports multiple languages including English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, and more
- 📝 **Text Translation** - Auto-translate text with source language auto-detection
- 📄 **Document Translation** - Upload and translate document files, with editable source content before translation
- 🖼️ **Image Translation** - Extract and translate text from images
- 🔑 **Bring Your Own API Key** - Users configure their own API key and optional custom API-compatible base URL
- 📊 **Token Usage Tracking** - Session token usage stats (input/output/total/requests), persisted in local storage
- 🛡️ **API Hardening** - API key required for `/api/*` plus per-IP and per-key rate limits
- 🎨 **Theme Toggle** - Light/dark theme support
- 💻 **Modern UI** - Beautiful interface built with shadcn/ui
- 📱 **Responsive Design** - Perfect adaptation for all devices

## 🛠️ Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **UI Components**: shadcn/ui (Radix UI)
- **Styling**: Tailwind CSS
- **AI SDK**: Vercel AI SDK
- **State Management**: Zustand
- **File Handling**: react-dropzone

## 🧱 Architecture

- **Layered UI**: Main page orchestrates feature modules (`SettingsDialog`, `LanguageControls`, `TextTab`, `DocumentTab`, `ImageTab`, `ApiStatusCard`)
- **Centralized State**: Zustand stores split by concern:
  - `useTranslatorSettingsStore`: language selection, API config, settings dialog state
  - `useTranslatorRuntimeStore`: translation runtime states, API availability status, token usage stats
- **API Routes**: `/api/*` endpoints handle translation, language detection, security guards, and rate limiting

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
2. Configure your API key and model in settings
3. Source language can be auto-detected after typing pauses
4. Target language is auto-adjusted if it conflicts with detected source language
5. (Optional) Use Output Mode and Custom Prompt for style/control

### Document Translation

1. Switch to the "Document Translation" tab
2. Drag and drop a file to the upload area or click to select a file
3. (Optional) Edit source content in the left panel
4. Select source and target languages
5. Click the translate button
6. Download the result after translation is complete

### Image Translation

1. Switch to the "Image" tab
2. Upload one image
3. Click the arrow button between preview and result panels
4. View translated text in the right panel

### API Configuration

#### Bring Your Own API Key

1. Click the settings button
2. Enter your OpenAI API key
3. (Optional) Configure a custom API endpoint (base URL)
4. Select the model to use (e.g., gpt-4o-mini, gpt-4o, etc.)
5. (Optional) Set:
   - Output Mode: `Translation Only` / `Bilingual`
   - Custom Prompt: extra translation instructions
   - Auto Detect Source Language: on/off

Note: API key is required for translation and language detection requests.

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
- `pnpm typecheck` - Run TypeScript type checking

## 🔐 Security Notes

- All `/api/*` routes require an API key in request payload.
- Built-in rate limiting is applied per IP and per API key.
- API key and token stats are stored in browser `localStorage` on the client side.

## 🔒 Privacy & Footer Notice

The app footer includes:
- Privacy notice (API key local storage + request forwarding through app API routes)
- Copyright notice
- Tech stack summary
- Acknowledgements to model ecosystems and open-source projects

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

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📧 Contact

For questions or suggestions, please contact us via GitHub Issues.

---

[中文文档](README.zh.md) | [English](README.md)
