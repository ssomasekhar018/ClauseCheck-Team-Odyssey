import React, { useState } from 'react'
import type { FormEvent } from 'react'

interface StructuredOverview {
  contract_type?: string
  parties?: string[]
  duration?: string
  compensation?: string
  overall_risk?: string
}

interface FormattedRisk {
  clause_type_key: string
  level: string
  level_key: string
  clause_name: string
  reasons: string[]
  plain_language_takeaway?: string
  in_this_contract_summary?: string
}

interface ClauseGroup {
  type_name: string
  type_key: string
  clauses: { id: number; summary: string }[]
}

interface FormattedData {
  overview?: { overall_risk_level?: string; [k: string]: unknown }
  structured_overview?: StructuredOverview
  summary_bullets?: string[]
  key_clauses_grouped?: ClauseGroup[]
  risk_highlights?: FormattedRisk[]
  disclaimer?: string
}

interface AnalysisResult {
  document: { source_name: string; content: string }
  clauses: Array<{ id: number; type: { name: string } | string; text: string }>
  risks: Array<{ clause_id: number; level: { name: string } | string; reasons: string[] }>
  heuristic_summary: string
  disclaimer: string
  llm_summary?: string | null
  llm_risk_overview?: string | null
  formatted?: FormattedData | null
}

const DISCLAIMER_TEXT =
  'This system is an AI-assisted tool for contract review. It does not provide legal advice and does not replace professional legal judgment.'


const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [extracted, setExtracted] = useState<{ source_name: string; content: string } | null>(null)
  const [extractLoading, setExtractLoading] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<'summary' | 'risks' | 'clauses'>('summary')

  const handleExtract = async () => {
    setExtractError(null)
    if (!file && !text.trim()) {
      setExtractError('Upload a file or paste text to extract.')
      return
    }
    setExtractLoading(true)
    try {
      let res: Response
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        res = await fetch('/api/extract/file', { method: 'POST', body: formData })
      } else {
        res = await fetch('/api/extract/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
      }
      if (!res.ok) throw new Error(await res.text() || 'Extract failed')
      const data = (await res.json()) as { document: { source_name: string; content: string } }
      setExtracted(data.document || { source_name: 'Unknown', content: '' })
    } catch (err: unknown) {
      setExtractError(err instanceof Error ? err.message : 'Extract failed')
    } finally {
      setExtractLoading(false)
    }
  }

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!file && !text.trim()) {
      setError('Please upload a contract file or paste contract text.')
      return
    }

    setLoading(true)
    try {
      let res: Response

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        res = await fetch('/api/analyze/file', {
          method: 'POST',
          body: formData,
        })
      } else {
        res = await fetch('/api/analyze/text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        })
      }

      if (!res.ok) {
        const detail = await res.text()
        throw new Error(detail || `Request failed with status ${res.status}`)
      }

      const data = (await res.json()) as AnalysisResult
      // Ensure data structure is valid
      if (!data) {
        throw new Error('Invalid response from server')
      }
      // Normalize the data structure
      const normalizedData: AnalysisResult = {
        document: data.document || { source_name: 'Unknown', content: '' },
        clauses: Array.isArray(data.clauses) ? data.clauses : [],
        risks: Array.isArray(data.risks) ? data.risks : [],
        heuristic_summary: data.heuristic_summary || (data as { summary?: string }).summary || '',
        disclaimer: data.disclaimer || 'This system is for assistance only and does not replace professional legal advice.',
        llm_summary: data.llm_summary || null,
        llm_risk_overview: data.llm_risk_overview || null,
        formatted: (data as { formatted?: FormattedData }).formatted || null,
      }
      setAnalysis(normalizedData)
      setActiveView('summary')
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong while analyzing the contract.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      {/* Global navbar to switch between all tools */}
      <div className="app-global-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 1.2rem', backgroundColor: '#0b3d91', color: '#fff' }}>
        <span style={{ fontWeight: 700 }}>Legal Tech Suite</span>
        <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem' }}>
          <a href="http://localhost:8080" style={{ color: '#fff', textDecoration: 'none' }}>Home</a>
          <a href="http://localhost:5175" style={{ color: '#fff', textDecoration: 'none', fontWeight: 600 }}>AI Contract Analysis</a>
          <a href="http://localhost:5174" style={{ color: '#fff', textDecoration: 'none' }}>Courtroom Simulation</a>
          <a href="http://localhost:3000" style={{ color: '#fff', textDecoration: 'none' }}>Case File Library</a>
        </nav>
      </div>
      <header className="app-header">
        <div>
          <div className="app-title">AI-Assisted Contract Analysis</div>
          <div className="app-disclaimer">Prototype · Assistive only · Not legal advice</div>
        </div>
        <button
          type="button"
          className="button-secondary"
          onClick={() => window.location.reload()}
        >
          Reset session
        </button>
      </header>

      <main className="app-main">
        <section className="app-left">
          <div className="section-title">1. Upload or paste contract</div>
          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="file-input-wrap">
              <input type="file" accept=".pdf,.txt,.text" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>

            <textarea
              className="textarea"
              placeholder="Paste contract text here if you are not uploading a file."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <div className="form-actions">
              <button type="submit" className="button-primary" disabled={loading}>
                {loading ? 'Analyzing…' : 'Analyze Contract'}
              </button>
              <span className="small-muted">Uses heuristics + Gemini (if configured) to highlight key clauses and risks.</span>
            </div>

            {error && (
              <div className="error-message">{error}</div>
            )}
          </form>

          <div className="extracted-section">
            <div className="extracted-section-header">
              <span className="section-title">2. Extracted text</span>
              <button type="button" className="button-extract" onClick={handleExtract} disabled={extractLoading || (!file && !text.trim())}>
                {extractLoading ? 'Extracting…' : 'Extract text'}
              </button>
            </div>
            {!extracted ? (
              <p className="extracted-placeholder">Click &quot;Extract text&quot; to get raw text from your file or pasted content.</p>
            ) : (
              <>
                <p className="small-muted extracted-source">Source: {extracted.source_name || 'Unknown'}</p>
                <pre className="extracted-pre extracted-pre-left">{extracted.content || 'No content'}</pre>
              </>
            )}
            {extractError && <div className="error-message">{extractError}</div>}
          </div>
        </section>

        <section className="app-right">
          {!analysis ? (
            <div className="placeholder-pane">
              Provide a contract on the left, then run the analysis. Use &quot;Extract text&quot; to see raw text; results appear here.
            </div>
          ) : (
            <div className="dashboard-panel">
              {/* Three buttons — only one view at a time */}
              <div className="view-tabs">
                <button type="button" className={`view-tab ${activeView === 'summary' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('summary')}>AI Summary</button>
                <button type="button" className={`view-tab ${activeView === 'risks' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('risks')}>Risk Highlights</button>
                <button type="button" className={`view-tab ${activeView === 'clauses' ? 'view-tab-active' : ''}`} onClick={() => setActiveView('clauses')}>Clause List</button>
              </div>

              <div className="view-content">
                {activeView === 'summary' && (
                  <>
                    {!analysis.llm_summary && (
                      <p className="gemini-note">Overview generated using rule-based analysis. Connect Gemini API for richer insights.</p>
                    )}
                    <section className="dashboard-section">
                      <h2 className="dashboard-h2">📄 AI-Generated Overview</h2>
                      <div className="overview-card">
                        <dl className="overview-dl">
                          <dt>Contract Type</dt>
                          <dd>{analysis.formatted?.structured_overview?.contract_type ?? '—'}</dd>
                          <dt>Parties</dt>
                          <dd>{(() => { const p = analysis.formatted?.structured_overview?.parties ?? []; return (p.length && !(p.length === 1 && p[0] === '—')) ? p.join(', ') : '—'; })()}</dd>
                          <dt>Duration / Term</dt>
                          <dd>{analysis.formatted?.structured_overview?.duration ?? '—'}</dd>
                          <dt>Compensation</dt>
                          <dd>{analysis.formatted?.structured_overview?.compensation ?? '—'}</dd>
                          <dt>Overall Risk Level</dt>
                          <dd>
                            {(() => {
                              const r = (analysis.formatted?.structured_overview?.overall_risk || 'Low').toLowerCase()
                              const em = r.startsWith('high') ? '🔴' : r.startsWith('medium') || r.includes('medium') ? '🟡' : '🟢'
                              return <><span className={`overview-risk overview-risk-${r.replace(/\s+/g, '-')}`}>{em} {analysis.formatted?.structured_overview?.overall_risk ?? 'Low'}</span></>
                            })()}
                          </dd>
                        </dl>
                      </div>
                    </section>
                    <section className="dashboard-section">
                      <h2 className="dashboard-h2">🧠 Contract Summary</h2>
                      {(analysis.formatted?.summary_bullets ?? []).length > 0 ? (
                        <ul className="summary-bullets">
                          {(analysis.formatted!.summary_bullets!).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="contract-summary-para">
                          This contract is between {((analysis.formatted?.structured_overview?.parties) ?? []).join(', ') || 'the identified parties'}. Overall risk: {analysis.formatted?.structured_overview?.overall_risk ?? 'Low'}.
                        </p>
                      )}
                    </section>
                  </>
                )}

                {activeView === 'risks' && (
                  <section className="dashboard-section dashboard-section-full">
                    <h2 className="dashboard-h2">Risk Highlights</h2>
                    {(analysis.formatted?.risk_highlights ?? []).length === 0 ? (
                      <p className="dashboard-muted">✅ No significant risk patterns were detected. This contract appears to have standard terms.</p>
                    ) : (
                      <div className="risk-cards">
                        {(analysis.formatted?.risk_highlights ?? []).map((r) => {
                          const emoji = r.level_key === 'HIGH' ? '🔴' : r.level_key === 'MEDIUM' ? '🟡' : '🟢'
                          const cn = r.level_key === 'HIGH' ? 'risk-label-high' : r.level_key === 'MEDIUM' ? 'risk-label-medium' : 'risk-label-low'
                          return (
                            <div key={r.clause_type_key} className={`risk-card risk-card-${r.level_key.toLowerCase()}`}>
                              <div className="risk-card-title"><span className={cn}>{emoji} {r.level} Risk</span> — {r.clause_name}</div>
                              {r.plain_language_takeaway && (
                                <div className="risk-plain-takeaway">{r.plain_language_takeaway}</div>
                              )}
                              {r.in_this_contract_summary && (
                                <div className="risk-in-this-contract">{r.in_this_contract_summary}</div>
                              )}
                              <div className="risk-reasons">
                                <div className="risk-reasons-label">Risks identified:</div>
                                <ul>{r.reasons.map((s, i) => <li key={i}>{s}</li>)}</ul>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>
                )}

                {activeView === 'clauses' && (
                  <section className="dashboard-section dashboard-section-full">
                    <h2 className="dashboard-h2">🧾 Key Clauses Identified</h2>
                    {(analysis.formatted?.key_clauses_grouped ?? []).length === 0 ? (
                      <p className="dashboard-muted">No key clauses were identified.</p>
                    ) : (
                      <div className="clause-groups">
                        {(analysis.formatted?.key_clauses_grouped ?? []).map((g) => (
                          <div key={g.type_key} className="clause-group">
                            <div className="clause-group-title">📌 {g.type_name}</div>
                            {g.clauses.map((c) => (
                              <div key={c.id} className="clause-group-item">{c.summary}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )}
              </div>

              <section className="dashboard-section dashboard-disclaimer disclaimer-highlight">
                <p className="disclaimer-label">Disclaimer</p>
                <p className="disclaimer-final">{DISCLAIMER_TEXT}</p>
              </section>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
