import React, { useEffect, useState } from 'react'
import { C } from '../../utils/constants'
import { useOrgStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal } from '../../components/ui'

function BankForm({ title, onSave, onClose, bForm, setBForm, error }) {
  return (
    <Modal title={title} onClose={onClose}>
      {error && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:14 }}>
          {error}
        </div>
      )}
      <div style={{ background:'#FFF3E0', border:'1px solid #F0A500', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#8B5E00', marginBottom:14 }}>
        🔒 Banking information is visible to Lumina admin only. Never shared with employers or other practices.
      </div>
      <Inp label="Bank Name"            value={bForm.bank_name}       onChange={e => setBForm(f => ({ ...f, bank_name:e.target.value }))}       placeholder="Chase, Bank of America..."/>
      <Inp label="Routing Number"       value={bForm.routing}        onChange={e => setBForm(f => ({ ...f, routing:e.target.value }))}        placeholder="9 digits"/>
      <Inp label="Account Number"       value={bForm.account_number}        onChange={e => setBForm(f => ({ ...f, account_number:e.target.value }))}        placeholder="Account number"/>
      <Sel label="Account Type"         value={bForm.account_type}    onChange={e => setBForm(f => ({ ...f, account_type:e.target.value }))}
        options={[{ value:'checking', label:'Checking' }, { value:'savings', label:'Savings' }]}/>
      <Inp label="Billing Contact Name" value={bForm.billing_contact} onChange={e => setBForm(f => ({ ...f, billing_contact:e.target.value }))}/>
      <Inp label="Billing Email" type="email" value={bForm.billing_email} onChange={e => setBForm(f => ({ ...f, billing_email:e.target.value }))}/>
      <Btn onClick={onSave} disabled={!bForm.bank_name || !bForm.routing || !bForm.account_number}>Save Banking Info</Btn>
    </Modal>
  )
}

export default function BankingView() {
  const org = useOrgStore()
  const db = { practices: org.practices, employers: org.employers }
  const [apiError, setApiError] = useState('')
  const [practicesPage, setPracticesPage] = useState(1)
  const [employersPage, setEmployersPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    org.ensureDetailsLoaded()
  }, [org.ensureDetailsLoaded])

  const [pracModal, setPracModal] = useState(null)  // practiceId
  const [empModal,  setEmpModal]  = useState(null)  // employerId
  const [bankingId, setBankingId] = useState(null)
  const [bForm,     setBForm]     = useState({ bank_name:'', routing:'', account_number:'', account_type:'checking', billing_contact:'', billing_email:'' })

  const savePracBanking = async () => {
    setApiError('')
    try {
      await org.updatePractice({ id: pracModal, banking: bForm })
      setPracModal(null)
    } catch (e) {
      setApiError(e?.message || 'Failed to save practice banking.')
    }
  }

  const saveEmpBanking = async () => {
    setApiError('')
    try {
      await org.updateEmployer({ id: empModal, banking: bForm }, { banking_id: bankingId })
      setEmpModal(null)
      setBankingId(null)
    } catch (e) {
      setApiError(e?.message || 'Failed to save employer banking.')
    }
  }

  const openPrac = (p) => {
    setApiError('')
    setBForm(p.banking || { bank_name:'', routing:'', account_number:'', account_type:'checking', billing_contact:'', billing_email:'' })
    setPracModal(p.id)
  }
  const openEmp  = (e) => {
    setApiError('')
    setBankingId(e.banking?.id || null)
    setBForm(e.banking || { bank_name:'', routing:'', account_number:'', account_type:'checking', billing_contact:'', billing_email:'' })
    setEmpModal(e.id)
  }
  const mask     = (s) => s ? '••••••' + String(s).slice(-4) : '—'
  const totalPracticePages = Math.max(1, Math.ceil(db.practices.length / pageSize))
  const totalEmployerPages = Math.max(1, Math.ceil(db.employers.length / pageSize))
  const practicePageItems = db.practices.slice((practicesPage - 1) * pageSize, practicesPage * pageSize)
  const employerPageItems = db.employers.slice((employersPage - 1) * pageSize, employersPage * pageSize)

  const card = { background: C.white, border: `1px solid ${C.border}`, borderRadius: 5 }
  const pageControls = { display:'flex', justifyContent:'flex-end', alignItems:'center', gap:8, marginBottom:14 }

  useEffect(() => {
    setPracticesPage((prev) => Math.min(prev, totalPracticePages))
  }, [totalPracticePages])

  useEffect(() => {
    setEmployersPage((prev) => Math.min(prev, totalEmployerPages))
  }, [totalEmployerPages])

  const BankingCard = ({ entity, type, onEdit }) => {
    const b = entity.banking
    return (
      <div style={{ ...card, padding:16, marginBottom:10 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:b ? 12 : 0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{entity.name}</div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>{type === 'practice' ? entity.city : entity.billing_method?.toUpperCase()}</div>
          </div>
          <Btn variant={b ? 'secondary' : 'primary'} small onClick={onEdit}>{b ? 'Edit Banking' : '+ Add Banking'}</Btn>
        </div>
        {b ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
            {[['Bank', b.bank_name || '—'], ['Routing', b.routing || '—'], ['Account', mask(b.account_number)], ['Type', b.account_type || '—'], ['Billing Contact', b.billing_contact || '—'], ['Billing Email', b.billing_email || '—']].map(([l, v]) => (
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

  return (
    <div>
      <SH title="Banking" sub="Practice payouts & employer payments — admin only"/>
      <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:5, padding:'10px 14px', fontSize:12, color:'#B03A3A', marginBottom:20 }}>
        🔒 This page contains sensitive financial information. All banking details are encrypted and visible to Lumina admin only.
      </div>

      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, marginBottom:10 }}>Alliance Practices — ACH Payout Accounts</h3>
      {practicePageItems.map(p => <BankingCard key={p.id} entity={p} type="practice" onEdit={() => openPrac(p)}/>)}
      <div style={pageControls}>
        <Btn small variant="secondary" disabled={practicesPage === 1} onClick={() => setPracticesPage((prev) => Math.max(1, prev - 1))}>
          Previous
        </Btn>
        <span style={{ fontSize:12, color:C.textMid }}>
          Page {practicesPage} of {totalPracticePages}
        </span>
        <Btn small variant="secondary" disabled={practicesPage >= totalPracticePages} onClick={() => setPracticesPage((prev) => Math.min(totalPracticePages, prev + 1))}>
          Next
        </Btn>
      </div>

      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, margin:'24px 0 10px' }}>Employers — ACH Payment Accounts</h3>
      {employerPageItems.map((e) => (
        e.billing_method === 'ach'
          ? <BankingCard key={e.id} entity={e} type="employer" onEdit={() => openEmp(e)}/>
          : (
            <div key={e.id} style={{ ...card, padding:14, marginBottom:10, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{e.name}</div>
                <div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>INVOICE billing — no ACH banking needed</div>
              </div>
              <span style={{ fontSize:11, background:C.cream, border:`1px solid ${C.border}`, color:C.textMid, padding:'3px 8px', borderRadius:3 }}>Invoice</span>
            </div>
          )
      ))}
      <div style={pageControls}>
        <Btn small variant="secondary" disabled={employersPage === 1} onClick={() => setEmployersPage((prev) => Math.max(1, prev - 1))}>
          Previous
        </Btn>
        <span style={{ fontSize:12, color:C.textMid }}>
          Page {employersPage} of {totalEmployerPages}
        </span>
        <Btn small variant="secondary" disabled={employersPage >= totalEmployerPages} onClick={() => setEmployersPage((prev) => Math.min(totalEmployerPages, prev + 1))}>
          Next
        </Btn>
      </div>

      {pracModal && (
        <BankForm
          title={`Banking — ${db.practices.find(p => p.id === pracModal)?.name}`}
          onSave={savePracBanking}
          onClose={() => { setApiError(''); setPracModal(null) }}
          bForm={bForm}
          setBForm={setBForm}
          error={apiError}
        />
      )}
      {empModal && (
        <BankForm
          title={`Banking — ${db.employers.find(e => e.id === empModal)?.name}`}
          onSave={saveEmpBanking}
          onClose={() => { setApiError(''); setEmpModal(null) }}
          bForm={bForm}
          setBForm={setBForm}
          error={apiError}
        />
      )}
    </div>
  )
}
