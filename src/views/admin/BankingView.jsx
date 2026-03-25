import React, { useState } from 'react'
import { C } from '../../utils/constants'
import { useStore } from '../../data/store'
import { SH, Btn, Inp, Sel, Modal } from '../../components/ui'

export default function BankingView() {
  const { state: db, dispatch } = useStore()

  const [pracModal, setPracModal] = useState(null)  // practiceId
  const [empModal,  setEmpModal]  = useState(null)  // employerId
  const [bForm,     setBForm]     = useState({ bankName:'', routing:'', account:'', accountType:'checking', billingContact:'', billingEmail:'' })

  const savePracBanking = () => {
    dispatch({ type: 'UPDATE_PRACTICE', payload: { id: pracModal, banking: bForm } })
    setPracModal(null)
  }

  const saveEmpBanking = () => {
    dispatch({ type: 'UPDATE_EMPLOYER', payload: { id: empModal, banking: bForm } })
    setEmpModal(null)
  }

  const openPrac = (p) => { setBForm(p.banking || { bankName:'', routing:'', account:'', accountType:'checking', billingContact:'', billingEmail:'' }); setPracModal(p.id) }
  const openEmp  = (e) => { setBForm(e.banking || { bankName:'', routing:'', account:'', accountType:'checking', billingContact:'', billingEmail:'' }); setEmpModal(e.id) }
  const mask     = (s) => s ? '••••••' + String(s).slice(-4) : '—'

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }

  const BankingCard = ({ entity, type, onEdit }) => {
    const b = entity.banking
    return (
      <div style={{ ...card, padding:16, marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:b ? 12 : 0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{entity.name}</div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>{type === 'practice' ? entity.city : entity.billing?.toUpperCase()}</div>
          </div>
          <Btn variant={b ? 'secondary' : 'primary'} small onClick={onEdit}>{b ? 'Edit Banking' : '+ Add Banking'}</Btn>
        </div>
        {b ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
            {[['Bank', b.bankName || '—'], ['Routing', b.routing || '—'], ['Account', mask(b.account)], ['Type', b.accountType || '—'], ['Billing Contact', b.billingContact || '—'], ['Billing Email', b.billingEmail || '—']].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:12, color:C.textDark }}>{v}</div>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize:12, color:C.border, fontStyle:'italic' }}>No banking information on file</div>}
      </div>
    )
  }

  const BankForm = ({ title, onSave, onClose }) => (
    <Modal title={title} onClose={onClose}>
      <div style={{ background:'#FFF3E0', border:'1px solid #F0A500', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#8B5E00', marginBottom:14 }}>
        🔒 Banking information is visible to Lumina admin only. Never shared with employers or other practices.
      </div>
      <Inp label="Bank Name"            value={bForm.bankName}       onChange={e => setBForm(f => ({ ...f, bankName:e.target.value }))}       placeholder="Chase, Bank of America..."/>
      <Inp label="Routing Number"       value={bForm.routing}        onChange={e => setBForm(f => ({ ...f, routing:e.target.value }))}        placeholder="9 digits"/>
      <Inp label="Account Number"       value={bForm.account}        onChange={e => setBForm(f => ({ ...f, account:e.target.value }))}        placeholder="Account number"/>
      <Sel label="Account Type"         value={bForm.accountType}    onChange={e => setBForm(f => ({ ...f, accountType:e.target.value }))}
        options={[{ value:'checking', label:'Checking' }, { value:'savings', label:'Savings' }]}/>
      <Inp label="Billing Contact Name" value={bForm.billingContact} onChange={e => setBForm(f => ({ ...f, billingContact:e.target.value }))}/>
      <Inp label="Billing Email" type="email" value={bForm.billingEmail} onChange={e => setBForm(f => ({ ...f, billingEmail:e.target.value }))}/>
      <Btn onClick={onSave} disabled={!bForm.bankName || !bForm.routing || !bForm.account}>Save Banking Info</Btn>
    </Modal>
  )

  return (
    <div>
      <SH title="Banking" sub="Practice payouts & employer payments — admin only"/>
      <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:5, padding:'10px 14px', fontSize:12, color:'#B03A3A', marginBottom:20 }}>
        🔒 This page contains sensitive financial information. All banking details are encrypted and visible to Lumina admin only.
      </div>

      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, marginBottom:10 }}>Alliance Practices — ACH Payout Accounts</h3>
      {db.practices.map(p => <BankingCard key={p.id} entity={p} type="practice" onEdit={() => openPrac(p)}/>)}

      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, margin:'24px 0 10px' }}>Employers — ACH Payment Accounts</h3>
      {db.employers.filter(e => e.billing === 'ach').map(e => <BankingCard key={e.id} entity={e} type="employer" onEdit={() => openEmp(e)}/>)}
      {db.employers.filter(e => e.billing !== 'ach').map(e => (
        <div key={e.id} style={{ ...card, padding:14, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{e.name}</div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>INVOICE billing — no ACH banking needed</div>
          </div>
          <span style={{ fontSize:11, background:C.cream, border:`1px solid ${C.border}`, color:C.textMid, padding:'3px 8px', borderRadius:3 }}>Invoice</span>
        </div>
      ))}

      {pracModal && <BankForm title={`Banking — ${db.practices.find(p => p.id === pracModal)?.name}`} onSave={savePracBanking} onClose={() => setPracModal(null)}/>}
      {empModal  && <BankForm title={`Banking — ${db.employers.find(e => e.id === empModal)?.name}`}  onSave={saveEmpBanking}  onClose={() => setEmpModal(null)}/>}
    </div>
  )
}
