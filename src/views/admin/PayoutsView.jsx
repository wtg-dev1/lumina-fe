import React, { useEffect } from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useFinanceStore, useOrgStore } from '../../data/stores'
import { SH, StatCard, Badge, Btn } from '../../components/ui'
import { TH, TD } from '../../components/ui'

export default function PayoutsView() {
  const org = useOrgStore()
  const finance = useFinanceStore()
  const db = { practices: org.practices, payouts: finance.payouts }

  useEffect(() => {
    org.ensureSummaryLoaded()
    finance.ensureSummaryLoaded()
  }, [org.ensureSummaryLoaded, finance.ensureSummaryLoaded])

  const updateStatus = (id, status) => finance.updatePayoutStatus({ id, status })

  const paid   = db.payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.netCents, 0)
  const pend   = db.payouts.filter(p => ['pending', 'processing'].includes(p.status)).reduce((s, p) => s + p.netCents, 0)
  const margin = db.payouts.filter(p => p.status === 'paid').reduce((s, p) => s + p.marginCents, 0)

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Payouts" sub="Practice ACH disbursements"/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:22 }}>
        <StatCard label="Paid Out"      value={fmt(paid)}   accent={C.teal}/>
        <StatCard label="Pending"       value={fmt(pend)}   accent={C.tealMid}/>
        <StatCard label="Lumina Margin" value={fmt(margin)} accent={C.tealGreen}/>
      </div>

      <div style={{ display:'grid', gap:14 }}>
        {db.practices.map(prac => {
          const pays = db.payouts
            .filter(p => p.practiceId === prac.id)
            .sort((a, b) => b.period.localeCompare(a.period))

          return (
            <div key={prac.id} style={card}>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, background:C.cream }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{prac.name}</span>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:C.bgPage }}>
                    {[['Period'], ['Gross', true], ['Margin', true], ['Net Payout', true], ['Status'], ['']].map(([h, r], i) => (
                      <th key={i} style={{ ...TH, textAlign: r ? 'right' : 'left' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pays.map((pay, i) => (
                    <tr key={pay.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ ...TD(false), fontFamily:'monospace', fontSize:12, color:C.textMid }}>{pay.period}</td>
                      <td style={{ ...TD(true),  fontFamily:'monospace', fontSize:12, color:C.textMid }}>{fmt(pay.grossCents)}</td>
                      <td style={{ ...TD(true),  fontFamily:'monospace', fontSize:12, color:C.tealGreen }}>−{fmt(pay.marginCents)}</td>
                      <td style={{ ...TD(true),  fontFamily:'monospace', fontWeight:700, color:C.tealDark }}>{fmt(pay.netCents)}</td>
                      <td style={TD(false)}><Badge status={pay.status}/></td>
                      <td style={TD(true)}>
                        {pay.status === 'pending'    && <Btn variant="ghost" small onClick={() => updateStatus(pay.id, 'processing')}>Initiate ACH</Btn>}
                        {pay.status === 'processing' && <Btn variant="ghost" small onClick={() => updateStatus(pay.id, 'paid')}>Mark Paid</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
