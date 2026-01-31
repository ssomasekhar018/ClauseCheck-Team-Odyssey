"""
Test script to verify API keys are working
Run this before starting the main app
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("API KEY TEST")
print("=" * 60)

# Check if keys exist
gemini_key = os.getenv("GEMINI_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")

print(f"\n1. Environment Variables:")
print(f"   GEMINI_API_KEY: {'✅ Found' if gemini_key else '❌ Not found'}")
print(f"   OPENAI_API_KEY: {'✅ Found' if openai_key else '❌ Not found'}")

if gemini_key:
    print(f"   Gemini Key starts with: {gemini_key[:10]}...")
if openai_key:
    print(f"   OpenAI Key starts with: {openai_key[:10]}...")

# Test Gemini
print("\n2. Testing Gemini API...")
try:
    import google.generativeai as genai
    genai.configure(api_key=gemini_key)
    
    # Try gemini-2.5-flash (latest stable model)
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Say hello in one word")
    print(f"   ✅ Gemini (gemini-2.5-flash) works!")
    print(f"   Response: {response.text}")
except Exception as e:
    print(f"   ❌ Gemini Error: {str(e)[:200]}")

print("\n" + "=" * 60)
print("TEST COMPLETE")
print("=" * 60)
