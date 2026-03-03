# Development Notes

## Project: Law Simulation Training Platform

### Architecture Overview

The project uses a **3-AI agent architecture**:
1. **Opposing Counsel** (Gemini) - Argues against the lawyer
2. **Observer/Mentor** (GPT-4o-mini) - Provides help when requested
3. **Analyzer** (GPT-4o-mini) - Evaluates performance at the end

---

## Recent Fixes & Changes

### Issue #1: Rust Compilation Error (Fixed ✅)
**Problem**: `pydantic-core` required Rust to compile on Windows
**Solution**: Updated `requirements.txt` to use newer versions with pre-built wheels
- Updated all packages to latest versions
- Changed from `pydantic==2.5.3` to `pydantic==2.10.3`

### Issue #2: Gemini Model Not Found (Fixed ✅)
**Problem**: `gemini-pro` model was deprecated
**Solution**: Updated to `gemini-2.0-flash-exp` in `opposing_counsel.py`
- Changed line 15: `genai.GenerativeModel('gemini-2.0-flash-exp')`
- Note: If this model fails, try: `gemini-1.5-flash` or `gemini-1.5-pro`

### Issue #3: OpenRouter API Key Support (Fixed ✅)
**Problem**: User had OpenRouter key (`sk-or-v1-...`) instead of direct OpenAI key
**Solution**: Added automatic detection in all AI agents:
```python
if api_key.startswith("sk-or-"):
    self.client = OpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )
    self.model = "openai/gpt-4o-mini"  # OpenRouter format
else:
    self.client = OpenAI(api_key=api_key)
    self.model = "gpt-4o-mini"  # Direct OpenAI
```

### Issue #4: Model Name Updates (Fixed ✅)
**Problem**: Code used `gpt-4` but user wanted `gpt-4o-mini`
**Solution**: 
- Changed all references from `gpt-4` to `gpt-4o-mini`
- Made model name dynamic (stored in `self.model`)

### Issue #5: Insufficient Error Logging (Fixed ✅)
**Problem**: Hard to debug API issues
**Solution**: Added comprehensive logging throughout:
- Added `logging` to all agent files
- Added try-catch blocks with detailed error messages
- Added INFO logs for successful operations
- Logs now show:
  - Agent initialization
  - Request types
  - Success/failure of API calls
  - Error stack traces

---

## File Changes Summary

### Modified Files:

1. **`backend/requirements.txt`**
   - Updated all package versions to latest stable releases
   - Ensures no Rust compilation needed

2. **`backend/app/agents/opposing_counsel.py`**
   - Added logging import
   - Added API key validation
   - Changed model to `gemini-2.0-flash-exp`
   - Added try-catch error handling
   - Added detailed logging

3. **`backend/app/agents/observer.py`**
   - Added logging import
   - Added API key validation
   - Added OpenRouter support (auto-detect)
   - Changed model to `gpt-4o-mini`
   - Made model name dynamic
   - Added error handling and logging

4. **`backend/app/agents/analyzer.py`**
   - Added logging import
   - Added API key validation
   - Added OpenRouter support
   - Changed model to `gpt-4o-mini`
   - Made model name dynamic
   - Added comprehensive error handling

5. **`backend/app/main.py`**
   - Added logging configuration
   - Added detailed logs for WebSocket events
   - Added logs for help requests
   - Improved error handling with stack traces

---

## API Key Requirements

### Gemini API Key
- Get from: https://aistudio.google.com/app/apikey
- Format: `AIzaSy...`
- Add to `.env`: `GEMINI_API_KEY=your_key_here`

### OpenAI / OpenRouter API Key
- **Direct OpenAI**: Get from https://platform.openai.com/api-keys
  - Format: `sk-...`
- **OpenRouter** (more models, cheaper): Get from https://openrouter.ai/keys
  - Format: `sk-or-v1-...`
  - Automatically detected and configured
- Add to `.env`: `OPENAI_API_KEY=your_key_here`

---

## Testing Your API Keys

Before running the full app, test your keys:

### Test Gemini:
```python
# test_gemini.py
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash-exp')
response = model.generate_content("Say hello")
print(response.text)
```

### Test OpenAI/OpenRouter:
```python
# test_openai.py
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if api_key.startswith("sk-or-"):
    client = OpenAI(api_key=api_key, base_url="https://openrouter.ai/api/v1")
    model = "openai/gpt-4o-mini"
else:
    client = OpenAI(api_key=api_key)
    model = "gpt-4o-mini"

response = client.chat.completions.create(
    model=model,
    messages=[{"role": "user", "content": "Say hello"}]
)
print(response.choices[0].message.content)
```

---

## Available Gemini Models (as of Oct 2024)

If `gemini-2.0-flash-exp` doesn't work, try these in order:
1. `gemini-1.5-flash` (fast, cheap, recommended)
2. `gemini-1.5-flash-8b` (even faster)
3. `gemini-1.5-pro` (more capable but slower)
4. `gemini-pro` (legacy, might be deprecated)

To change: Edit line 15 in `backend/app/agents/opposing_counsel.py`

---

## Common Issues & Solutions

### Issue: "API Key not found"
**Solution**: 
1. Check `.env` file exists in `backend/` folder
2. Check no extra spaces: `GEMINI_API_KEY=AIza...` (no spaces around `=`)
3. Restart the backend server after editing `.env`

### Issue: "Model not found"
**Solution**: Try different Gemini model names (see list above)

### Issue: "401 Unauthorized" (OpenAI)
**Solution**: 
1. Verify key is valid at https://platform.openai.com/api-keys
2. Check if you have credits remaining
3. If using OpenRouter, verify at https://openrouter.ai/

### Issue: WebSocket disconnects immediately
**Solution**: Check backend logs for specific error, likely API key or model name issue

---

## Future Enhancements (TODO)

### Priority 1: Critical
- [ ] Add environment variable validation on startup
- [ ] Add graceful fallback if one AI service fails
- [ ] Add rate limiting to prevent API quota exhaustion

### Priority 2: Features
- [ ] Add ability to upload documents during debate
- [ ] Add voice input/output
- [ ] Save simulation history to database
- [ ] Add replay feature for past simulations
- [ ] Add multiple opposing counsel personalities

### Priority 3: UX
- [ ] Add typing indicators when AI is thinking
- [ ] Add animation for message appearances
- [ ] Add dark mode
- [ ] Add export conversation as PDF

### Priority 4: Technical
- [ ] Move session storage from memory to Redis
- [ ] Add database migrations
- [ ] Add unit tests
- [ ] Add API documentation with Swagger
- [ ] Add Docker support

---

## Model Configuration Guide

### Changing AI Models

#### To change Opposing Counsel model:
Edit `backend/app/agents/opposing_counsel.py` line 15:
```python
self.model = genai.GenerativeModel('YOUR_MODEL_HERE')
```

#### To change Mentor/Analyzer model:
Edit `backend/app/agents/observer.py` lines 20 and 24:
```python
self.model = "YOUR_MODEL_HERE"  # For OpenRouter: "provider/model"
```

### Supported Model Formats

**OpenRouter**: Use format `provider/model`
- `openai/gpt-4o-mini`
- `openai/gpt-4o`
- `anthropic/claude-3-haiku`
- `google/gemini-flash-1.5`

**Direct OpenAI**: Use direct model names
- `gpt-4o-mini`
- `gpt-4o`
- `gpt-4-turbo`

---

## Logging Guide

### View Logs
Logs appear in the terminal where you run:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 5173
```

### Log Levels
- **INFO**: Normal operations (agent initialization, requests)
- **WARNING**: Potential issues (invalid session IDs)
- **ERROR**: Failures (API errors, exceptions)

### Understanding Common Log Messages

**Good (working):**
```
INFO - Opposing Counsel Agent initialized with gemini-2.0-flash-exp
INFO - Observer Agent initialized with OpenRouter (gpt-4o-mini)
INFO - Getting response from opposing counsel for session abc123
INFO - Response generated successfully
```

**Bad (errors):**
```
ERROR - Error generating response: 400 API Key not found
ERROR - Error providing help: Error code: 401 - Invalid API key
```

---

## Performance Optimization Tips

1. **Use faster models for development**:
   - Gemini: `gemini-1.5-flash-8b` (fastest)
   - OpenAI: `gpt-4o-mini` (cheapest)

2. **Reduce token usage**:
   - Limit conversation history (currently 5 messages for opposing, 10 for mentor)
   - Reduce `max_tokens` in API calls

3. **Cache static content**:
   - System prompts can be pre-computed
   - Case details don't change during simulation

---

## Deployment Notes (For Production)

**⚠️ Current setup is for LOCAL DEVELOPMENT ONLY**

For production deployment, you need:
1. **Environment variables** in production server (not .env file)
2. **Real database** (PostgreSQL instead of SQLite)
3. **Session storage** (Redis instead of in-memory dict)
4. **HTTPS** for WebSocket security
5. **CORS** properly configured for your domain
6. **Rate limiting** on API endpoints
7. **API key rotation** and secrets management
8. **Error monitoring** (Sentry, etc.)

---

## Contact & Support

For issues or questions:
1. Check this file first
2. Check logs in terminal
3. Test API keys individually (see Testing section)
4. Check README.md for setup instructions

---

**Last Updated**: October 26, 2025
**Project Version**: 1.0
**Status**: Development - Not production ready
