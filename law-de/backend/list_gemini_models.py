"""
List all available Gemini models for your API key
"""
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

gemini_key = os.getenv("GEMINI_API_KEY")
if not gemini_key:
    print("❌ GEMINI_API_KEY not found")
    exit(1)

print("=" * 60)
print("LISTING AVAILABLE GEMINI MODELS")
print("=" * 60)

try:
    genai.configure(api_key=gemini_key)
    
    print("\nAvailable models:")
    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"  ✅ {model.name}")
    
    print("\n" + "=" * 60)
    print("If you see models listed above, we can update your code to use them.")
    print("=" * 60)
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    print("\nYour API key might be:")
    print("  1. Invalid or expired")
    print("  2. Not properly configured")
    print("  3. From a region where Gemini is not available")
    print("\nGet a new API key from: https://aistudio.google.com/app/apikey")
