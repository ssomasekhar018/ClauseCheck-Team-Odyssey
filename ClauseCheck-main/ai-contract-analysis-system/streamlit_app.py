from __future__ import annotations

import io
from typing import Optional

import streamlit as st

from contract_ai.analyzer import analyze_contract
from contract_ai.models import ClauseType, RiskLevel

APP_TITLE = "AI-Assisted Contract Analysis System"
DISCLAIMER_TEXT = (
    "This system is for assistance only and does not replace professional legal advice. "
    "It highlights patterns in the text using heuristic rules and may miss important issues."
)


def _render_disclaimer():
    st.sidebar.markdown("### Important Disclaimer")
    st.sidebar.write(DISCLAIMER_TEXT)


def _color_for_risk(level: RiskLevel) -> str:
    if level == RiskLevel.HIGH:
        return "#ffcccc"  # light red
    if level == RiskLevel.MEDIUM:
        return "#fff4cc"  # light amber
    return "#e6ffed"  # light green for LOW


def main() -> None:
    st.set_page_config(page_title=APP_TITLE, layout="wide")
    st.title(APP_TITLE)
    st.caption("Prototype decision-support tool for exploring contract text. Not legal advice.")

    _render_disclaimer()

    st.header("1. Upload Contract")
    uploaded_file = st.file_uploader("Upload a contract (PDF or text)", type=["pdf", "txt", "text"])

    st.write("OR paste contract text below:")
    pasted_text = st.text_area("Contract text", height=200, placeholder="Paste contract text here if not uploading a file.")

    analyze_clicked = st.button("Analyze Contract")

    if not analyze_clicked:
        st.info("Upload a file or paste text, then click 'Analyze Contract' to run the assistant.")
        return

    if not uploaded_file and not pasted_text.strip():
        st.warning("Please upload a contract file or paste the contract text.")
        return

    # Create an in-memory file-like object if using pasted text
    if not uploaded_file and pasted_text.strip():
        uploaded_file = io.BytesIO(pasted_text.encode("utf-8"))
        setattr(uploaded_file, "name", "pasted_text.txt")

    with st.spinner("Analyzing contract..."):
        result = analyze_contract(uploaded_file)

    st.success("Analysis complete. Review the sections below.")

    tabs = st.tabs(["Extracted Text", "Key Clauses", "Risk Highlights", "Summary"])

    with tabs[0]:
        st.subheader("Extracted Text")
        st.write(result.document.source_name)
        st.text_area("Normalized contract text", value=result.document.content, height=400)

    with tabs[1]:
        st.subheader("Key Clauses (heuristic)")
        for c in result.clauses[:300]:
            st.markdown(f"**[{c.type.name}]** {c.text}")

    with tabs[2]:
        st.subheader("Risk Highlights")
        high_first = sorted(result.risks, key=lambda r: r.level.value, reverse=True)
        for r in high_first:
            clause = next((c for c in result.clauses if c.id == r.clause_id), None)
            if clause is None:
                continue
            color = _color_for_risk(r.level)
            st.markdown(
                f"<div style='background-color: {color}; padding: 0.5rem; border-radius: 0.25rem; margin-bottom: 0.5rem;'>"
                f"<strong>Risk level: {r.level.name}</strong><br />"
                f"<em>Clause type: {clause.type.name}</em><br />"
                f"{clause.text}<br />"
                f"<strong>Reason:</strong> {r.reasons[0]}"
                f"</div>",
                unsafe_allow_html=True,
            )

    with tabs[3]:
        st.subheader("AI-Generated Summary (assistive only)")
        st.write(result.summary)
        st.markdown("---")
        st.markdown(f"**Disclaimer:** {result.disclaimer}")


if __name__ == "__main__":
    main()
