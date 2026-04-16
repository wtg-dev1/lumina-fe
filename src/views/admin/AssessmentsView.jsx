import React, { useEffect, useMemo, useState } from 'react'
import { C } from '../../utils/constants'
import { mapApiError, phqSev, gadSev } from '../../utils/helpers'
import { useCareStore, useOrgStore } from '../../data/stores'
import { SH, Btn } from '../../components/ui'

const TYPE_META = {
  PHQ9: { label: 'PHQ-9', topic: 'Depression', max: 27, sev: phqSev },
  GAD7: { label: 'GAD-7', topic: 'Anxiety',    max: 21, sev: gadSev },
}

// Tiny inline sparkline (latest at the right).
function Sparkline({ values, max, color }) {
  if (!values || values.length < 2) return null
  const w = 140
  const h = 32
  const pad = 2
  const step = (w - pad * 2) / (values.length - 1)
  const points = values.map((v, i) => {
    const x = pad + i * step
    const y = pad + (1 - (v / max)) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v, i) => {
        const x = pad + i * step
        const y = pad + (1 - (v / max)) * (h - pad * 2)
        return <circle key={i} cx={x} cy={y} r={1.8} fill={color} />
      })}
    </svg>
  )
}

function ImprovementChip() {
  return (
    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, color: '#FFF', background: C.tealGreen, borderRadius: 10, padding: '2px 8px', letterSpacing: '0.03em' }}>
      ↓ Improved
    </span>
  )
}

function HistoryTable({ rows, type, loading, error, onRetry }) {
  if (loading) return <div style={{ padding: 18, color: C.textMid, fontSize: 13 }}>Loading history…</div>
  if (error) {
    return (
      <div style={{ padding: 18 }}>
        <div style={{ background: '#FCE8E8', border: '1px solid #D9534F', color: '#B03A3A', borderRadius: 5, padding: '10px 14px', fontSize: 12, marginBottom: 10 }}>{error}</div>
        <Btn small onClick={onRetry}>Retry</Btn>
      </div>
    )
  }
  if (!rows || rows.length === 0) {
    return <div style={{ padding: 18, color: C.textMid, fontSize: 13 }}>No completed {TYPE_META[type].label} assessments yet.</div>
  }

  const meta = TYPE_META[type]
  // API returns latest-first. Build chronological series for the sparkline.
  const chrono = [...rows].reverse()
  const values = chrono.map((r) => r.score ?? 0)
  const sevFn = meta.sev

  return (
    <div style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: C.textMid }}>
          <span style={{ fontWeight: 700, color: C.textDark }}>{rows.length}</span> completed · latest first
        </div>
        <Sparkline values={values} max={meta.max} color={C.teal} />
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 4, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: C.cream }}>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: C.textMid, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Date</th>
              <th style={{ textAlign: 'right', padding: '8px 12px', fontWeight: 700, color: C.textMid, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Score</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: C.textMid, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Severity</th>
              <th style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 700, color: C.textMid, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const sevInfo = sevFn(r.score ?? 0)
              const severity = r.severity || sevInfo.l
              return (
                <tr key={r.id || `${type}-${i}`} style={{ borderTop: i === 0 ? 'none' : `1px solid ${C.border}` }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: C.textDark }}>{r.completed_at || r.date || '—'}</td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: sevInfo.c, fontFamily: 'monospace' }}>{r.score ?? '—'}</td>
                  <td style={{ padding: '8px 12px', color: sevInfo.c }}>{severity}</td>
                  <td style={{ padding: '8px 12px' }}>{r.improved === true ? <ImprovementChip /> : <span style={{ color: C.border }}>—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ClientRow({ row, active, onSelect }) {
  const client = row.client || {}
  const phq = row.phq9
  const gad = row.gad7
  return (
    <button
      onClick={onSelect}
      style={{
        width: '100%',
        textAlign: 'left',
        background: active ? `${C.teal}10` : C.white,
        border: `1px solid ${active ? C.teal : C.border}`,
        borderRadius: 4,
        padding: '10px 12px',
        marginBottom: 6,
        cursor: 'pointer',
        fontFamily: 'Arial,sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontWeight: 600, color: C.textDark, fontSize: 13 }}>
          {client.client_name || client.clientName || '—'}
        </div>
        <div style={{ fontSize: 10, fontFamily: 'monospace', color: C.teal }}>{client.anon_id || client.anonId || ''}</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4, fontSize: 11, color: C.textMid }}>
        <span>PHQ-9: <strong style={{ color: C.textDark }}>{phq?.last_score ?? '—'}</strong>{phq?.last_severity ? ` · ${phq.last_severity}` : ''}</span>
        <span>GAD-7: <strong style={{ color: C.textDark }}>{gad?.last_score ?? '—'}</strong>{gad?.last_severity ? ` · ${gad.last_severity}` : ''}</span>
      </div>
    </button>
  )
}

export default function AssessmentsView() {
  const org = useOrgStore()
  const care = useCareStore()

  useEffect(() => {
    org.ensureSummaryLoaded()
    care.ensureCoreLoaded()
    care.loadStatuses().catch(() => {})
  }, [org.ensureSummaryLoaded, care.ensureCoreLoaded, care.loadStatuses])

  const [empFilter, setEmpFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [activeType, setActiveType] = useState('PHQ9')
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  const rows = useMemo(() => {
    const all = Array.isArray(care.assessmentStatuses) ? care.assessmentStatuses : []
    const employers = org.employers || []
    const clientsById = new Map((care.clients || []).map((c) => [c.id, c]))
    const q = query.trim().toLowerCase()

    return all
      .map((row) => {
        const base = clientsById.get(row?.client?.id) || {}
        const merged = { ...base, ...(row.client || {}) }
        const employerId = merged.employerId || merged.employer_id
        const empName = employers.find((e) => e.id === employerId)?.name || ''
        return { ...row, client: merged, empName, employerId }
      })
      .filter((r) => empFilter === 'all' || r.employerId === empFilter)
      .filter((r) => {
        if (!q) return true
        const name = (r.client?.client_name || r.client?.clientName || '').toLowerCase()
        const anon = (r.client?.anon_id || r.client?.anonId || '').toLowerCase()
        return name.includes(q) || anon.includes(q)
      })
  }, [care.assessmentStatuses, care.clients, org.employers, empFilter, query])

  const selected = useMemo(() => rows.find((r) => r?.client?.id === selectedId) || null, [rows, selectedId])

  const historyKey = selectedId ? `${selectedId}:${activeType}` : null
  const historyRows = historyKey ? (care.historyByClient?.[historyKey] || null) : null

  const fetchHistory = async (clientId, type) => {
    setHistoryLoading(true)
    setHistoryError('')
    try {
      await care.loadHistory(clientId, type, { force: true })
    } catch (err) {
      setHistoryError(mapApiError(err).message)
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    if (!selectedId) return
    const key = `${selectedId}:${activeType}`
    if (Array.isArray(care.historyByClient?.[key])) return
    fetchHistory(selectedId, activeType)
  }, [selectedId, activeType])

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Assessments" sub="PHQ-9 & GAD-7 · completed history per client" />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        {/* List */}
        <div style={{ ...card, padding: 12 }}>
          <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or anon id…"
              style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px', fontSize: 12, color: C.textDark, fontFamily: 'Arial,sans-serif', outline: 'none' }}
            />
            <select
              value={empFilter}
              onChange={(e) => setEmpFilter(e.target.value)}
              style={{ border: `1px solid ${C.border}`, borderRadius: 4, padding: '7px 10px', fontSize: 12, color: C.textDark, fontFamily: 'Arial,sans-serif', background: C.white, outline: 'none' }}
            >
              <option value="all">All Employers</option>
              {(org.employers || []).map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {care.statusesLoading && rows.length === 0 && (
            <div style={{ padding: 16, color: C.textMid, fontSize: 12, textAlign: 'center' }}>Loading…</div>
          )}
          {!care.statusesLoading && rows.length === 0 && (
            <div style={{ padding: 16, color: C.textMid, fontSize: 12, textAlign: 'center' }}>No clients match.</div>
          )}

          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {rows.map((r) => (
              <ClientRow
                key={r?.client?.id}
                row={r}
                active={r?.client?.id === selectedId}
                onSelect={() => setSelectedId(r?.client?.id)}
              />
            ))}
          </div>
        </div>

        {/* Detail */}
        <div style={{ ...card, minHeight: 240 }}>
          {!selected ? (
            <div style={{ padding: 40, textAlign: 'center', color: C.textMid, fontSize: 13 }}>
              Select a client to view their assessment history.
            </div>
          ) : (
            <>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', background: C.cream, borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.textDark }}>
                    {selected.client?.client_name || selected.client?.clientName || '—'}
                  </div>
                  <div style={{ fontSize: 11, color: C.textMid, fontFamily: 'monospace', marginTop: 2 }}>
                    {selected.client?.anon_id || selected.client?.anonId || ''}
                    {selected.empName ? ` · ${selected.empName}` : ''}
                  </div>
                </div>
                <Btn small variant="secondary" onClick={() => fetchHistory(selected.client.id, activeType)}>Refresh</Btn>
              </div>

              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                {['PHQ9', 'GAD7'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveType(t)}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'Arial,sans-serif',
                      background: activeType === t ? C.white : C.bgPage,
                      color: activeType === t ? C.teal : C.textMid,
                      border: 'none',
                      borderBottom: activeType === t ? `2px solid ${C.teal}` : '2px solid transparent',
                    }}
                  >
                    {TYPE_META[t].label} · {TYPE_META[t].topic}
                  </button>
                ))}
              </div>

              <HistoryTable
                rows={historyRows}
                type={activeType}
                loading={historyLoading}
                error={historyError}
                onRetry={() => fetchHistory(selected.client.id, activeType)}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
