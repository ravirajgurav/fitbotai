# FitBot AI — Premium Gym Trainer Chatbot 🏋️‍♂️⚡

**FitBot AI** is an ultra-modern, conversational AI gym trainer chatbot designed specifically for college NLP assignments and fitness enthusiasts. Built with a sleek dark aesthetic, neon lime-green accents, and evidence-informed sports science principles, FitBot AI delivers personalized workout regimens, exercise form tutorials, and adaptive fitness advice in real time.

---

## 1. AI API Selection & Free-Tier Guide

For this project, **Google Gemini (Gemini 1.5 Flash)** is the selected and recommended AI model:

| Feature | Google Gemini 1.5 Flash (Recommended) | OpenAI GPT-4o-mini |
| :--- | :--- | :--- |
| **Cost** | **100% Free Tier Available** | Pay-as-you-go (Requires credit card) |
| **Credit Card Needed?** | ❌ **No credit card required** | ✅ Credit card required |
| **Rate Limits** | 15 Requests / Minute (RPM)<br>1,500 Requests / Day (RPD)<br>1,000,000 Tokens / Minute (TPM) | Paid token quota |
| **Context Window** | 1,000,000+ tokens | 128,000 tokens |
| **Latency** | Sub-second fast generation | Fast |

### How to Get Your Free Gemini API Key (Takes 30 Seconds)
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Sign in with your Google account.
3. Click **"Create API key"**.
4. Copy the API key and paste it into `fitbot-ai/backend/.env`:
   ```bash
   GEMINI_API_KEY=AIzaSy...
   ```

*(Note: OpenAI is also fully supported as an alternative by setting `OPENAI_API_KEY=sk-...` and `AI_PROVIDER=openai` in `.env`).*

---

## 2. Technology Stack

* **Frontend:**
  * React 18 + Vite
  * TypeScript
  * Tailwind CSS (Custom dark theme + neon lime palette `#c8f53c`)
  * Lucide React icons
  * Framer Motion (Micro-animations, smooth transitions)
  * React Markdown + Remark GFM (Tables, bold cues, bullet points)
* **Backend:**
  * Python 3.10+ / 3.14
  * FastAPI
  * Uvicorn ASGI server
  * HTTPX (Asynchronous HTTP client for AI API)
  * Pydantic v2 (Input validation & response schemas)
  * Python-dotenv (Secure environment configuration)

---

## 3. Project Architecture

```
fitbot-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx          # Branding, status indicator & New Chat
│   │   │   ├── WelcomeScreen.tsx   # Greeting & 4 quick prompt cards
│   │   │   ├── ChatWindow.tsx      # Conversation scroll view & message container
│   │   │   ├── ChatMessage.tsx     # Message bubbles, copy, retry & markdown
│   │   │   ├── ChatInput.tsx       # Multiline input, auto-expand, send button
│   │   │   ├── WorkoutCard.tsx     # Structured workout routine display
│   │   │   └── TypingIndicator.tsx # Pulsing neon thinking animation
│   │   ├── services/
│   │   │   └── chatApi.ts          # Backend API client & health checker
│   │   ├── App.tsx                 # Main layout & state orchestrator
│   │   ├── main.tsx                # React DOM entry
│   │   ├── types.ts                # TypeScript interfaces
│   │   └── index.css               # Tailwind & custom scrollbar styles
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts              # Proxy setup to FastAPI backend
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI app, CORS, error middleware
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── chat.py             # POST /api/chat and GET /api/health
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   └── ai_service.py       # Gemini & OpenAI API integration
│   │   └── prompts/
│   │       ├── __init__.py
│   │       └── gym_trainer.py      # Evidence-informed system prompt
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 4. Step-by-Step Installation & Setup

### Prerequisites
- Node.js 18+ (tested on Node 24)
- Python 3.10+ (tested on Python 3.14)

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd fitbot-ai/backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS/Linux:
   python3 -m venv .venv
   source .venv/bin/activate

   # On Windows:
   python -m venv .venv
   .venv\Scripts\activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure your `.env` file:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and insert your Gemini API Key:
   ```env
   AI_PROVIDER=gemini
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   GEMINI_MODEL=gemini-1.5-flash
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Backend will be live at: `http://127.0.0.1:8000`
   * Interactive API docs (Swagger): `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd fitbot-ai/frontend
   ```

2. Install npm packages:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and go to:
   ```
   http://localhost:5173
   ```

---

## 5. Chatbot Features & NLP Capabilities

1. **Context-Aware Multi-Turn Dialogues:**
   Maintains the conversation history during the active session. When you ask follow-up questions such as *"How many sets should I do for that?"* or *"Replace the barbell press with dumbbells"*, the model understands the context of previous exercises.

2. **Real Status Indicator:**
   The top header provides real-time feedback on backend connectivity:
   * 🟢 **Gemini 1.5 Flash Online** — Backend connected & API key verified.
   * 🟡 **No API Key** — Backend running, but waiting for API key in `.env`.
   * 🔴 **Backend Offline** — Server down; click indicator to retry connection.

3. **Curated Workout Prompts:**
   The welcome screen features 4 quick-start training categories:
   * 🏋️ **Chest Day:** *"Build my perfect chest workout."*
   * 🔥 **Back & Biceps:** *"Help me plan my pull-day session."*
   * ⚡ **Leg Day:** *"Give me a complete leg workout."*
   * 📖 **Exercise Guide:** *"Teach me how to perform an exercise."*

4. **Safety & Health Guardrails:**
   The backend prompt instructs the model to prioritize biomechanical form and progressive overload, while providing clear medical disclaimers if severe pain or joint injuries are mentioned.

5. **Utility Actions:**
   * **Copy to Clipboard:** Copy any AI routine with one click.
   * **Retry / Regenerate:** Quickly re-query if a network glitch occurs.
   * **New Chat:** Reset conversation state smoothly.

---

## 6. Backend API Reference

### Health Check
```http
GET /api/health
```
**Response:**
```json
{
  "status": "ok",
  "backend": "online",
  "ai_provider": "gemini",
  "model": "gemini-1.5-flash",
  "api_key_configured": true,
  "message": "FitBot AI backend is fully operational"
}
```

### Chat Completion
```http
POST /api/chat
Content-Type: application/json
```
**Payload:**
```json
{
  "message": "Give me a 30-minute dumbbell chest routine for beginners",
  "history": [
    { "role": "user", "content": "Hi FitBot!" },
    { "role": "assistant", "content": "Hey Athlete! Ready to train?" }
  ]
}
```
**Response:**
```json
{
  "reply": "### 30-Minute Beginner Dumbbell Chest Routine\n\n...",
  "model": "gemini-1.5-flash"
}
```
