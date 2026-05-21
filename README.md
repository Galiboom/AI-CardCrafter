# AI-CardCrafter 智能营销卡片生成器

AI-CardCrafter 是一个面向自媒体运营、跨境电商商家和独立开发者的全栈 AI 营销卡片生成系统。用户只需要输入自然语言卖点，系统就能通过流式 AI 生成文案，并实时渲染成可编辑、可导出的高颜值营销卡片。

这个项目重点展示三件事：前后端统一数据契约、SSE 流式渐进渲染体验，以及前端高分辨率图片导出能力。

## 核心功能

- 自然语言生成营销卡片文案
- 小红书爆款风、科技极客风、电商促销风三套视觉模板
- 标题、副标题、正文、标签、Emoji、渐变色实时双向编辑
- AI 生成期间卡片区域渐进式更新，文案像打字机一样出现
- 生成按钮 loading 锁定，避免重复请求
- IndexedDB 本地草稿自动暂存，刷新页面后可恢复
- 前端直接导出高清 PNG，适配 Retina 高分屏
- 后端支持 OpenAI 兼容接口；未配置 API Key 时自动使用 mock 流式数据，便于本地演示

## 技术栈

- 前端：React、TypeScript、Vite、Tailwind CSS、shadcn 风格 UI、Zustand、localForage、html-to-image
- 后端：Python、FastAPI、Pydantic、SQLite、httpx
- 通信：`text/event-stream`，使用字段级 patch 事件实现渐进渲染
- 数据契约：前端 TypeScript 类型与后端 Pydantic schema 保持一致

## 快速启动

启动前端：

```bash
cd frontend
npm install
npm run dev
```

启动后端：

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

浏览器打开：

```text
http://localhost:5173
```

健康检查：

```text
http://127.0.0.1:8000/api/health
```

## AI 配置

复制 `.env.example` 到 `backend/.env`，或在终端中设置环境变量：

```bash
OPENAI_API_KEY=your_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
APP_DATABASE_URL=sqlite:///./ai_card_crafter.db
```

如果 `OPENAI_API_KEY` 为空，后端会自动使用内置 mock 数据，并仍然通过 SSE 逐步输出字段，保证项目可以直接演示。

## CardPayload 数据契约

前端、后端和 AI 输出都围绕同一份卡片数据结构：

```ts
interface CardPayload {
  title: string
  subtitle?: string
  content: string
  tags: string[]
  themeColor: {
    from: string
    to: string
  }
  emojiIcon: string
}
```

## 项目结构

```text
AI-CardCrafter/
├─ frontend/        # Vite React 前端应用
├─ backend/         # FastAPI 后端服务
├─ .env.example     # AI 与数据库配置示例
└─ README.md        # 项目说明
```

## Git 提交规范

项目采用 Conventional Commits：

```bash
git commit -m "feat: design card payload schema and zustand store"
git commit -m "feat: implement openai compatible streaming card generation"
git commit -m "feat: add high dpi marketing card export"
```
