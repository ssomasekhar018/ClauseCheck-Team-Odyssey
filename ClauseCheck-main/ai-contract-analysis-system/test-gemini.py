#!/usr/bin/env python3
"""Quick test script to verify Gemini API is working."""

import os
import sys
from contract_ai.llm_integration import generate_gemini_summary, generate_gemini_risk_overview
from contract_ai.models import DocumentText, Clause, ClauseType, RiskAssessment, RiskLevel

# Test data
test_doc = DocumentText(
    source_name="test_contract.txt",
    content="""
SERVICE AGREEMENT

This Agreement is entered into on January 1, 2024, between ABC Corporation ("Service Provider") and XYZ Ltd ("Client").

PAYMENT TERMS
Client shall pay Service Provider $5,000 per month, due on the 1st of each month. Late payments shall incur a penalty of 10% per month.

TERMINATION
This agreement may be terminated by either party with 30 days written notice. However, if terminated for cause, no notice is required.

LIABILITY
Service Provider disclaims all liability for any indirect, consequential, or punitive damages. Client agrees to indemnify Service Provider for any and all claims arising from Client's use of the services.

INTELLECTUAL PROPERTY
All intellectual property developed under this agreement shall be the exclusive property of Service Provider, including but not limited to software, documentation, and methodologies.

AUTOMATIC RENEWAL
This agreement shall automatically renew for successive one-year periods unless either party provides written notice of non-renewal at least 60 days prior to the expiration date.
"""
)

test_clauses = [
    Clause(id=1, type=ClauseType.PAYMENT, text="Client shall pay Service Provider $5,000 per month"),
    Clause(id=2, type=ClauseType.TERMINATION, text="This agreement may be terminated by either party with 30 days written notice"),
    Clause(id=3, type=ClauseType.LIABILITY, text="Service Provider disclaims all liability"),
]

test_risks = [
    RiskAssessment(clause_id=1, level=RiskLevel.MEDIUM, reasons=["High penalty rate (10%)"]),
    RiskAssessment(clause_id=3, level=RiskLevel.HIGH, reasons=["Broad indemnity language"]),
]

if __name__ == "__main__":
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY not found in environment")
        print("Set it in .env file or export it:")
        print("  export GEMINI_API_KEY=your-key-here")
        sys.exit(1)
    
    print("✅ Gemini API key found")
    print("Testing summary generation...")
    
    try:
        summary = generate_gemini_summary(
            test_doc,
            test_clauses,
            test_risks,
            heuristic_summary="Test summary"
        )
        
        if summary:
            print("✅ Summary generation successful!")
            print(f"Length: {len(summary)} characters")
            print("\n--- SUMMARY PREVIEW ---")
            print(summary[:500] + "..." if len(summary) > 500 else summary)
        else:
            print("❌ Summary generation returned None")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\nTesting risk overview...")
    try:
        risk_overview = generate_gemini_risk_overview(test_doc, test_clauses, test_risks)
        
        if risk_overview:
            print("✅ Risk overview generation successful!")
            print(f"Length: {len(risk_overview)} characters")
            print("\n--- RISK OVERVIEW PREVIEW ---")
            print(risk_overview[:500] + "..." if len(risk_overview) > 500 else risk_overview)
        else:
            print("❌ Risk overview returned None")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
