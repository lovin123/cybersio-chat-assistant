# CyberSIO Chat Assistant Backend

NestJS backend for the CyberSIO Chat Assistant with Hugging Face AI integration.

## Features

- **Hugging Face AI Integration**: Uses Hugging Face Inference API for chat-optimized LLM models
- **Advanced RAG System**: Full Retrieval-Augmented Generation with vector embeddings and semantic search
- **Vector Embeddings**: Uses `Xenova/all-MiniLM-L6-v2` for semantic similarity search
- **Hybrid Search**: Combines semantic (vector) and keyword-based search for optimal results
- **Knowledge Base System**: Stores and searches API documentation with embeddings in MongoDB
- **Markdown Documentation Support**: Automatically loads and parses comprehensive API documentation
- **Automatic Embedding Generation**: Generates vector embeddings for all documents automatically
- **Fallback System**: Gracefully falls back to keyword search if embeddings are unavailable

## Installation

```bash
npm install
```

## Setup Hugging Face

1. **Get Hugging Face API Key**:
   - Sign up at https://huggingface.co
   - Go to Settings → Access Tokens
   - Create a new token with read permissions

2. **Recommended Models for Chat Agents** (see `MODEL_RECOMMENDATIONS.md` for details):
   - **⭐ BEST**: `HuggingFaceH4/zephyr-7b-beta` - Best for production, chat-optimized
   - **⭐ HIGH QUALITY**: `mistralai/Mistral-7B-Instruct-v0.1` - Excellent instruction following
   - **⭐ POPULAR**: `meta-llama/Llama-2-7b-chat-hf` - Widely used, reliable
   - **⭐ BALANCED**: `facebook/blenderbot-400M-distill` - Good for development/testing
   - **⭐ STARTER**: `microsoft/DialoGPT-medium` - Free, good for simple conversations
   
   **We strongly recommend `HuggingFaceH4/zephyr-7b-beta` for production use.**

## Running the app

```bash
# development
npm run start:dev

# production mode
npm run start:prod
```

## MongoDB Setup

1. **Install MongoDB**:
   - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **Start MongoDB** (if using local):
   ```bash
   # Windows
   mongod

   # Linux/Mac
   sudo systemctl start mongod
   ```

3. **MongoDB Atlas** (recommended for production):
   - Create free account at https://www.mongodb.com/cloud/atlas
   - Create a cluster
   - Get connection string

## Environment Variables

Create a `.env` file in the backend directory:

```
PORT=3001
FRONTEND_URL=http://localhost:3000
HUGGINGFACE_API_KEY=your_api_key_here
HUGGINGFACE_MODEL=meta-llama/Llama-3.1-8B-Instruct:sambanova
HUGGINGFACE_ENDPOINT=https://router.huggingface.co/hf-inference
MONGODB_URI=mongodb://localhost:27017/cybersio-chat
```

**Important Notes:**
- **Inference Providers API**: Hugging Face has transitioned to a new "Inference Providers" system.
- **Model with Provider**: The model name includes the provider (e.g., `meta-llama/Llama-3.1-8B-Instruct:sambanova`). The format is `model-name:provider`.
- **Router Endpoint**: Uses `https://router.huggingface.co/hf-inference` endpoint (required as of 2024).
- **Chat Completions Only**: As of July 2025, generative models only work through the `chat_completion` endpoint. The `text_generation` endpoint is deprecated.
- **API Key Permissions**: Your API key must have the "Make calls to Inference Providers" permission enabled in your Hugging Face account settings.
- **Provider Selection**: You can specify different providers by changing the model name (e.g., `:sambanova`, `:together`, `:fal`, etc.).

**For MongoDB Atlas**, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cybersio-chat
```

**Note**: 
- For production, use `HuggingFaceH4/zephyr-7b-beta` (requires API key) - **RECOMMENDED**
- For testing/development, you can use `microsoft/DialoGPT-medium` (no API key required)
- See `MODEL_RECOMMENDATIONS.md` for detailed model comparisons and recommendations

## Knowledge Base Management

The knowledge base automatically loads documentation from `data/api-documentation.md` markdown file. You can:

1. **Markdown Documentation**: 
   - Place `api-documentation.md` in the `data/` directory
   - The system automatically parses markdown sections
   - Sections are categorized and indexed for search

2. **Add documentation via API**:
```bash
POST /api/knowledge-base/add
{
  "title": "Feature Name",
  "content": "Description...",
  "category": "Category",
  "keywords": ["keyword1", "keyword2"]
}
```

3. **View all documentation**:
```bash
GET /api/knowledge-base/all
```

4. **JSON files**: Place JSON files in `data/api-documentation/` directory as fallback

## API Documentation File

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

This documentation is automatically loaded and used to train the AI model with context.

## How RAG (Retrieval-Augmented Generation) Works

### RAG Pipeline

1. **Document Ingestion**:
   - Loads API documentation from `data/api-documentation.md`
   - Parses markdown into structured sections
   - Stores in MongoDB with metadata

2. **Embedding Generation**:
   - Generates vector embeddings for each document using `Xenova/all-MiniLM-L6-v2`
   - Stores embeddings in MongoDB alongside documents
   - Runs automatically in background for new documents

3. **Query Processing** (when user asks a question):
   - **Step 1 - Query Embedding**: Converts user query to vector embedding
   - **Step 2 - Semantic Search**: Finds similar documents using cosine similarity
   - **Step 3 - Keyword Search**: Performs keyword-based search as backup
   - **Step 4 - Hybrid Ranking**: Combines semantic and keyword results with weighted scoring
   - **Step 5 - Context Retrieval**: Retrieves top 5 most relevant documents

4. **Context Augmentation**:
   - Formats retrieved documents with relevance scores
   - Combines with conversation history and learning patterns
   - Creates enriched context for AI

5. **Response Generation**:
   - AI model receives: user query + retrieved context + conversation history
   - Generates accurate, context-aware response
   - Response is based on actual documentation, not just training data

### RAG Benefits

- **Semantic Understanding**: Finds relevant docs even without exact keyword matches
- **Better Accuracy**: Responses grounded in actual documentation
- **Up-to-date**: Can update knowledge base without retraining model
- **Hybrid Approach**: Combines best of semantic and keyword search
- **Automatic Learning**: Embeddings improve as more documents are added

## Model Training and Learning

The AI model automatically learns from all chat history stored in MongoDB:

### 1. API Documentation Training
- **Context Injection**: Relevant documentation sections are included in the prompt
- **System Prompts**: Detailed instructions guide the AI's behavior
- **RAG Pattern**: Retrieval-Augmented Generation ensures accurate, context-aware responses
- **Stored in MongoDB**: All documentation is stored in MongoDB for fast retrieval

### 2. Automatic Learning from All Chat History
- **Pattern Recognition**: Automatically identifies and learns from query patterns across ALL conversations
- **Frequency Tracking**: Tracks how often similar questions are asked
- **Successful Response Learning**: Remembers which responses worked well for similar queries
- **Category & Topic Learning**: Automatically categorizes and tags conversations
- **Cross-Session Learning**: Learns from all users and sessions, not just current conversation

### 3. How Automatic Learning Works
1. **User sends a message** → System processes it
2. **Pattern Matching**: System searches MongoDB for similar historical patterns
3. **Context Building**: Combines:
   - Current conversation history (last 5 messages)
   - Similar patterns from ALL chat history
   - Successful responses from past interactions
   - Relevant API documentation
4. **AI Processing**: AI generates response using all accumulated knowledge
5. **Automatic Learning**: System automatically:
   - Saves conversation to MongoDB
   - Extracts and normalizes query patterns
   - Tracks successful responses
   - Updates pattern frequency and metadata
   - Learns categories and topics

### 4. Learning Features
- **Pattern Normalization**: Similar queries are grouped together
- **Variation Tracking**: Tracks different ways users ask the same question
- **Response Quality**: Remembers which responses were successful
- **Analytics**: Provides insights into popular topics, categories, and patterns
- **Continuous Improvement**: Model gets smarter with every conversation

### 5. Learning Endpoints
- `GET /api/learning/insights` - Get learning analytics
- `GET /api/learning/popular-patterns` - Get most common patterns
- `GET /api/learning/patterns-by-category` - Get patterns by category

The model continuously improves by learning from:
- **All historical conversations** stored in MongoDB
- Comprehensive API documentation
- Query patterns and variations
- Successful response patterns
- User behavior and preferences
- Popular topics and workflows

This ensures the assistant provides increasingly accurate, context-aware responses that improve over time based on real usage patterns.

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
