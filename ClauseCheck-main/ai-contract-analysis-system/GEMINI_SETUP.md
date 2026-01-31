# 🚀 Getting Best Results with Gemini API

## Why Use Gemini API?

The AI Contract Analysis System works in two modes:

1. **Heuristic Mode (No API Key)**: Uses pattern matching and rules - basic but functional
2. **AI-Powered Mode (With Gemini API)**: Uses Google's Gemini AI for **much more accurate and comprehensive analysis**

## 🎯 For Hackathon: Use Gemini API!

To stand out in your hackathon, you **MUST** use the Gemini API. The difference is dramatic:

### Without Gemini API:
- Basic keyword matching
- Simple risk detection
- Limited clause identification
- Generic summaries

### With Gemini API:
- ✅ **Intelligent clause identification** - understands context
- ✅ **Comprehensive risk analysis** - identifies subtle issues
- ✅ **Professional summaries** - structured, detailed, actionable
- ✅ **Commercial insights** - explains business implications
- ✅ **Specific recommendations** - tells users what to review

## 🔑 How to Get Gemini API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the left sidebar
4. **Create API Key** (choose "Create API key in new project" or existing project)
5. **Copy the API key**

## ⚙️ Setup

1. **Create `.env` file** in the project root (if it doesn't exist)
2. **Add your API key**:
   ```
   GEMINI_API_KEY=your-api-key-here
   ```
3. **Save the file**
4. **Restart the backend** (the script auto-loads it)

## 💰 Cost

- **Gemini 1.5 Flash**: FREE tier available (generous limits)
- **Gemini 1.5 Pro**: Also has free tier, better quality
- The system tries Pro first, falls back to Flash automatically

## 📊 What You Get

### Enhanced Analysis Includes:

1. **Detailed Contract Summary**
   - Parties & purpose
   - Key commercial terms
   - Critical clauses
   - Risk assessment
   - Review recommendations

2. **Comprehensive Risk Analysis**
   - High/medium priority risks grouped by theme
   - Commercial impact explanations
   - Specific contract language references
   - Actionable recommendations

3. **Better Clause Detection**
   - Context-aware identification
   - More accurate categorization
   - Better understanding of relationships

## 🎨 Demo Tips for Hackathon

1. **Show the difference**: Run analysis with and without API key
2. **Use real contracts**: Test with actual contract samples
3. **Highlight AI insights**: Point out specific, actionable recommendations
4. **Emphasize accuracy**: Show how it catches subtle issues

## 🔧 Troubleshooting

**API Key not working?**
- Check `.env` file is in project root
- Verify no extra spaces in the key
- Restart backend after adding key
- Check API key is valid at https://aistudio.google.com/

**Getting errors?**
- System automatically falls back to Flash if Pro fails
- Check your API quota at Google AI Studio
- Verify internet connection

## 📝 Example Output Comparison

**Without Gemini (Heuristic):**
> "Payment terms: $1000 per month. Termination: 30 days notice."

**With Gemini (AI-Powered):**
> **Parties & Purpose**
> - Party A: ABC Corp (Service Provider)
> - Party B: XYZ Ltd (Client)
> - Purpose: Software licensing agreement
> 
> **Key Commercial Terms**
> - Payment: $1,000/month, due on 1st of each month
> - Late fees: 5% after 15 days (review for reasonableness)
> - Term: 12 months with automatic renewal
> 
> **Risk Assessment**
> - ⚠️ Automatic renewal may lock you into another year
> - ⚠️ Late fee rate (5%) should be verified against local regulations
> 
> **Recommendations**
> - Negotiate termination without cause
> - Clarify renewal notice period
> - Review late fee terms with legal counsel

---

**For your hackathon, the Gemini API is essential for demonstrating real AI value!** 🏆
