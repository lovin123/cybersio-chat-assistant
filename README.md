# CyberSIO Chat Assistant

An intelligent help agent for the CyberSIO Platform (tbSIEM & tbUEBA), powered by Hugging Face AI and providing UI-based guidance for navigating the platform and completing tasks.

## Project Structure

```
cybersio-chat-assistant/
├── backend/          # NestJS backend
│   ├── src/
│   │   ├── ai/       # AI service (Hugging Face Inference API)
│   │   ├── chat/     # Chat module (controller, service)
│   │   ├── knowledge-base/  # Knowledge base for API documentation
│   │   ├── rag/      # RAG service (vector embeddings, semantic search)
│   │   ├── conversation-history/  # Conversation history management
│   │   ├── learning/ # Automatic learning from chat history
│   │   ├── database/ # MongoDB schemas and models
│   │   └── main.ts   # Application entry point
│   ├── data/
│   │   └── api-documentation.md  # Comprehensive API documentation
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/   # Radix UI components
│   │   │   └── ChatAssistant.js
│   │   ├── contexts/ # Theme context
│   │   └── App.js
│   └── package.json
└── README.md
```

## Features

### Backend

- **Hugging Face AI Integration**: Uses Hugging Face Inference Providers API with automatic model selection
- **Advanced RAG System**: Full Retrieval-Augmented Generation with vector embeddings and semantic search
- **Vector Embeddings**: Uses `Xenova/all-MiniLM-L6-v2` for semantic similarity search
- **Hybrid Search**: Combines semantic (vector) and keyword-based search for optimal results
- **Knowledge Base System**: Stores and searches API documentation with embeddings in MongoDB
- **Markdown Documentation Support**: Automatically loads and parses comprehensive API documentation
- **Automatic Learning**: Learns from all chat history across all sessions
- **MongoDB Integration**: Persistent storage for conversations, knowledge base, and learning patterns
- **Fallback System**: Rule-based responses when AI is unavailable

### Frontend

- **Radix UI Components**: Accessible, professional UI components
- **Theme Support**: Dark and light mode with smooth transitions
- **Modern UI/UX**: Clean, minimalist, professional design
- **Responsive Design**: Works on all screen sizes
- **Toast Notifications**: User-friendly error handling

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Hugging Face API Key (for AI features)

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Setup MongoDB:

   - **Local MongoDB**: Install from https://www.mongodb.com/try/download/community
   - **MongoDB Atlas** (recommended): Create free account at https://www.mongodb.com/cloud/atlas

4. Get Hugging Face API Key:

   - Sign up at https://huggingface.co
   - Go to Settings → Access Tokens
   - Create a new token with "Make calls to Inference Providers" permission

5. Create a `.env` file in the `backend` directory:

```
PORT=3001
FRONTEND_URL=http://localhost:3000
HUGGINGFACE_API_KEY=your_api_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct:sambanova
HUGGINGFACE_ENDPOINT=https://router.huggingface.co/hf-inference
MONGODB_URI=mongodb://localhost:27017/cybersio-chat
```

For MongoDB Atlas:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybersio-chat
```

6. Start the development server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. (Optional) Create a `.env` file:

```
REACT_APP_API_URL=http://localhost:3001
```

4. Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Usage

1. Start both backend and frontend servers
2. Open your browser to `http://localhost:3000`
3. Type your questions about CyberSIO platform features
4. The assistant will provide UI-based guidance using:
   - Hugging Face AI with Inference Providers
   - RAG system with vector embeddings
   - Knowledge base from API documentation
   - Learning from historical conversations

## Knowledge Base Management

The knowledge base automatically loads documentation from `backend/data/api-documentation.md` markdown file. The system:

- Parses markdown sections automatically
- Generates vector embeddings for semantic search
- Stores everything in MongoDB
- Uses RAG (Retrieval-Augmented Generation) for context-aware responses

### Adding Documentation via API

```bash
POST http://localhost:3001/api/knowledge-base/add
Content-Type: application/json

{
  "title": "Dashboard Navigation",
  "content": "How to navigate dashboards...",
  "category": "UI Navigation",
  "keywords": ["dashboard", "navigation", "view"]
}
```

### Viewing All Documentation

```bash
GET http://localhost:3001/api/knowledge-base/all
```

### Markdown Documentation

The system includes a comprehensive `api-documentation.md` file covering:

- Platform overview
- tbSIEM module features
- tbUEBA module features
- Dashboard navigation
- Alerts management
- Anomaly detection
- Detection rules
- Investigations
- Reports
- UI navigation guides

## Example Queries

The assistant can help with various CyberSIO platform queries. Here are some examples:

### Dashboard Queries

- "How do I access the security dashboard?"
- "Show me how to view the threat dashboard"
- "What dashboards are available in CyberSIO?"

### tbSIEM Module Queries

- "How do I check logs in tbSIEM?"
- "Show me how to view threats in tbSIEM"
- "How do I investigate a threat in tbSIEM?"

### tbUEBA Module Queries

- "What is tbUEBA used for?"
- "How do I view anomalies in tbUEBA?"
- "Show me how to check user behavior analytics"

### Alerts Management Queries

- "How do I view alerts?"
- "Show me how to acknowledge an alert"
- "How do I filter alerts by severity?"

### Detection Rules Queries

- "How do I create a detection rule?"
- "Show me how to edit a rule"
- "What types of detection rules are available?"

### Investigation Queries

- "How do I create a new investigation?"
- "Show me how to add evidence to an investigation"
- "How do I close an investigation?"

### Reports Queries

- "How do I generate a report?"
- "What types of reports are available?"
- "How do I schedule a report?"

See `backend/README.md` for a complete list of example queries and tips for best results.

## Technology Stack

### Backend

- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe JavaScript
- **Hugging Face Inference API** - AI model inference via Inference Providers
- **MongoDB** - Database for persistent storage
- **Mongoose** - MongoDB object modeling
- **@xenova/transformers** - Vector embeddings for semantic search
- **RAG System** - Retrieval-Augmented Generation with hybrid search
- **Axios** - HTTP client

### Frontend

- **React** - UI library
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first CSS framework
- **JavaScript** - Frontend language

## Development

### Backend Commands

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm test` - Run tests

### Frontend Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## How It Works

1. **User Query**: User sends a message through the chat interface
2. **RAG Search**:
   - System converts query to vector embedding
   - Performs semantic search using cosine similarity
   - Combines with keyword search (hybrid search)
   - Retrieves top 5 most relevant documentation sections
3. **Context Building**:
   - Combines retrieved documentation context
   - Adds conversation history (last 5 messages)
   - Includes learning patterns from all historical conversations
4. **AI Processing**:
   - Sends query + context to Hugging Face Inference API
   - Uses Inference Providers for automatic model selection
   - Model generates context-aware response
5. **Learning**:
   - Saves conversation to MongoDB
   - Extracts patterns and learns from successful responses
   - Updates knowledge for future queries
6. **Fallback**: If AI is unavailable, system uses rule-based responses
7. **UI Display**: Response is displayed in the chat interface

## Configuration

### Backend Environment Variables

- `PORT`: Server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)
- `HUGGINGFACE_API_KEY`: Your Hugging Face API key (required)
- `HUGGINGFACE_MODEL`: Model with provider (default: `meta-llama/Llama-3.1-8B-Instruct:sambanova`)
- `HUGGINGFACE_ENDPOINT`: Router endpoint (default: `https://router.huggingface.co/hf-inference`)
- `MONGODB_URI`: MongoDB connection string (required)

### Frontend Configuration

- `REACT_APP_API_URL`: Backend API URL
- `window.config.apiUrl`: Alternative configuration via config.js

### Important Notes

- **Hugging Face API Key**: Must have "Make calls to Inference Providers" permission
- **Model Format**: Use `model-name:provider` format (e.g., `:sambanova`, `:together`, `:fal`)
- **MongoDB**: Required for storing conversations, knowledge base, and learning data
- **RAG System**: Automatically generates embeddings for semantic search

## Example Queries (Prompts)

Here are some example queries you can use to interact with the CyberSIO Chat Assistant:

### Dashboard Queries

- "How do I access the security dashboard?"
- "Show me how to view the threat dashboard"
- "What dashboards are available in CyberSIO?"
- "How do I customize a dashboard?"
- "Where can I see the overview dashboard?"

### tbSIEM Module Queries

- "How do I check logs in tbSIEM?"
- "Show me how to view threats in tbSIEM"
- "How do I search for specific log entries?"
- "What is tbSIEM and what does it do?"
- "How do I investigate a threat in tbSIEM?"
- "How to export logs from tbSIEM?"
- "Where do I find incident management in tbSIEM?"

### tbUEBA Module Queries

- "What is tbUEBA used for?"
- "How do I view anomalies in tbUEBA?"
- "Show me how to check user behavior analytics"
- "How do I investigate an anomaly?"
- "What are the key features of tbUEBA?"
- "How to access behavior analytics?"

### Alerts Management Queries

- "How do I view alerts?"
- "Show me how to acknowledge an alert"
- "How do I filter alerts by severity?"
- "What actions can I take on alerts?"
- "How to assign an alert to a team member?"
- "Where do I find active alerts?"

### Detection Rules Queries

- "How do I create a detection rule?"
- "Show me how to edit a rule"
- "What types of detection rules are available?"
- "How do I enable or disable a rule?"
- "How to test a detection rule?"

### Investigation Queries

- "How do I create a new investigation?"
- "Show me how to add evidence to an investigation"
- "How do I close an investigation?"
- "What information is included in an investigation?"
- "How to assign an investigation to someone?"

### Reports Queries

- "How do I generate a report?"
- "What types of reports are available?"
- "How do I schedule a report?"
- "Show me how to export a report"
- "Where can I find compliance reports?"

### General Navigation Queries

- "How do I navigate the CyberSIO platform?"
- "What are the main sections of the platform?"
- "Show me the main menu options"
- "How do I access settings?"
- "What features are available in CyberSIO?"

### Feature Discovery Queries

- "What can CyberSIO do?"
- "What are the main features of the platform?"
- "How does threat detection work?"
- "What is the difference between tbSIEM and tbUEBA?"
- "How do I get started with CyberSIO?"

### Troubleshooting Queries

- "I can't find the logs section"
- "Where do I go to view alerts?"
- "How do I access the dashboard?"
- "I need help with investigations"
- "How do I create a rule?"

### Tips for Best Results

- **Be specific**: Instead of "dashboard", try "How do I access the security dashboard?"
- **Use action words**: "Show me", "How do I", "Where can I" work well
- **Mention module names**: Include "tbSIEM" or "tbUEBA" for module-specific queries
- **Ask follow-up questions**: The assistant remembers conversation context
- **Use natural language**: The assistant understands conversational queries

The assistant will provide step-by-step guidance based on the actual CyberSIO platform documentation and UI workflows.

## License

Private - CyberSIO Platform
