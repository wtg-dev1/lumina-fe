import React from 'react'
import { C } from '../../utils/constants'
import { fmt } from '../../utils/helpers'
import { useStore } from '../../data/store'
import { SH, StatCard, Badge, Btn } from '../../components/ui'

export default function BillingView() {
  const { state: db, dispatch } = useStore()

  const updateStatus = (id, status) => dispatch({ type: 'UPDATE_INVOICE_STATUS', payload: { id, status } })

  const paid = db.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.totalCents, 0)
  const pend = db.invoices.filter(i => ['sent', 'draft'].includes(i.status)).reduce((s, i) => s + i.totalCents, 0)
  const over = db.invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.totalCents, 0)

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  return (
    <div>
      <SH title="Billing" sub="Employer invoices"/>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:22 }}>
        <StatCard label="Collected" value={fmt(paid)} accent={C.tealGreen}/>
        <StatCard label="Pending"   value={fmt(pend)} accent={C.tealMid}/>
        <StatCard label="Overdue"   value={fmt(over)} accent="#C0392B"/>
      </div>

      <div style={{ display:'grid', gap:14 }}>
        {db.employers.map(emp => {
          const invs = db.invoices
            .filter(i => i.employerId === emp.id)
            .sort((a, b) => b.period.localeCompare(a.period))

          return (
            <div key={emp.id} style={card}>
              <div style={{ padding:'12px 14px', borderBottom:`1px solid ${C.border}`, background:C.cream, display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{emp.name}</span>
                <span style={{ fontSize:10, color:C.textMid, textTransform:'uppercase', fontWeight:700 }}>{emp.billing}</span>
              </div>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <tbody>
                  {invs.map((inv, i) => (
                    <tr key={inv.id} style={{ background: i % 2 === 1 ? C.bgPage : C.white, borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:C.textMid }}>{inv.period}</td>
                      <td style={{ padding:'10px 14px', fontFamily:'monospace', fontWeight:700, color:C.textDark, textAlign:'right' }}>{fmt(inv.totalCents)}</td>
                      <td style={{ padding:'10px 14px' }}><Badge status={inv.status}/></td>
                      <td style={{ padding:'10px 14px', textAlign:'right' }}>
                        {inv.status === 'draft' && <Btn variant="ghost" small onClick={() => updateStatus(inv.id, 'sent')}>Send</Btn>}
                        {['sent', 'overdue'].includes(inv.status) && <Btn variant="ghost" small onClick={() => updateStatus(inv.id, 'paid')}>Mark Paid</Btn>}
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
