import React, { useEffect, useRef, useState } from 'react'
import { C, MONTHS } from '../../utils/constants'
import { fmt, today } from '../../utils/helpers'
import { useFinanceStore, useOrgStore, useCareStore } from '../../data/stores'
import { SH, Btn, Inp, Sel, Modal, Badge } from '../../components/ui'

export default function EmployersView() {
  const org = useOrgStore()
  const care = useCareStore()
  const finance = useFinanceStore()
  const [apiError, setApiError] = useState('')
  const [addEmployerError, setAddEmployerError] = useState('')
  const [feeModalError, setFeeModalError] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const prevDebouncedQRef = useRef(debouncedQ)

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(searchInput.trim()), 500)
    return () => clearTimeout(id)
  }, [searchInput])
  const db = {
    employers: org.employers_page_items,
    practices: org.practices,
    contracts: org.contracts,
    sessions: care.sessions,
    invoices: finance.invoices,
    adminFees: finance.adminFees,
  }

  useEffect(() => {
    ;(async () => {
      try {
        await org.ensureDetailsLoaded()
        await care.ensureCoreLoaded()
        await finance.ensureSummaryLoaded()
      } catch (e) {
        setApiError(e?.message || 'Failed loading employer data.')
      }
    })()
    // Run only on initial mount.
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        const qChanged = prevDebouncedQRef.current !== debouncedQ
        prevDebouncedQRef.current = debouncedQ
        const effectivePage = qChanged ? 1 : page
        if (qChanged && page !== 1) setPage(1)
        await org.load_employers_page({
          page: effectivePage,
          limit,
          q: debouncedQ || undefined,
        })
      } catch (e) {
        setApiError(e?.message || 'Failed loading employer data.')
      }
    })()
  }, [page, limit, debouncedQ])

  useEffect(() => {
    ;(async () => {
      try {
        if (!org.employers.length) return
        await finance.ensureAdminFeesLoaded({ employerIds: org.employers.map((e) => e.id) })
      } catch (e) {
        setApiError(e?.message || 'Failed loading employer data.')
      }
    })()
  }, [org.employers])

  const [modal,setModal]       = useState(false)
  const [feeModal,setFeeModal] = useState(null)
  const [invModal,setInvModal] = useState(null)
  const [form,setForm]         = useState({ name:'',contact_name:'',contact_email:'',billing_method:'invoice',admin_fee_cents:'',admin_fee_anchor_month:'1' })
  const [invForm,setInvForm]   = useState({ fee_cents:'',period_label:'',invoice_date:'',due_date:'',notes:'' })
  const [feeForm,setFeeForm]   = useState({
    name: '',
    contact_name: '',
    contact_email: '',
    billing_method: 'invoice',
    admin_fee_cents: '',
    admin_fee_anchor_month: '1',
    active: true,
  })

  const addEmployer = async () => {
    setAddEmployerError('')
    try {
      await org.addEmployer({
        name: form.name,
        contact_name: form.contact_name,
        contact_email: form.contact_email,
        billing_method: form.billing_method,
        admin_fee_cents: form.admin_fee_cents ? parseInt(form.admin_fee_cents, 10) * 100 : 0,
        admin_fee_anchor_month: parseInt(form.admin_fee_anchor_month, 10),
      })
      setModal(false)
      setAddEmployerError('')
      setForm({ name:'',contact_name:'',contact_email:'',billing_method:'invoice',admin_fee_cents:'',admin_fee_anchor_month:'1' })
    } catch (e) {
      setAddEmployerError(e?.message || 'Failed to add employer.')
    }
  }

  const saveAdminFee = async () => {
    setFeeModalError('')
    try {
      await org.updateEmployer({
        id: feeModal,
        name: feeForm.name,
        contact_name: feeForm.contact_name,
        contact_email: feeForm.contact_email,
        billing_method: feeForm.billing_method,
        admin_fee_cents: parseInt(feeForm.admin_fee_cents, 10) * 100,
        admin_fee_anchor_month: parseInt(feeForm.admin_fee_anchor_month, 10),
        active: feeForm.active,
      })
      setFeeModalError('')
      setFeeModal(null)
    } catch (e) {
      setFeeModalError(e?.message || 'Failed to update employer admin fee.')
    }
  }

  const addAdminInvoice = async () => {
    setApiError('')
    try {
      await finance.addAdminFee({
      employerId: invModal,
      feeCents: parseInt(invForm.fee_cents, 10) * 100,
      periodLabel: invForm.period_label,
      invoiceDate: invForm.invoice_date,
      dueDate: invForm.due_date,
      notes: invForm.notes,
    })
    setInvModal(null)
      setInvForm({ fee_cents:'',period_label:'',invoice_date:'',due_date:'',notes:'' })
    } catch (e) {
      setApiError(e?.message || 'Failed to create admin fee invoice.')
    }
  }

  const updateAdminFeeStatus = async (id, status) => {
    setApiError('')
    try {
      await finance.updateAdminFee({ id, status })
    } catch (e) {
      setApiError(e?.message || 'Failed to update invoice status.')
    }
  }

  const nextRenewal = (anchorMonth) => {
    if (!anchorMonth) return '—'
    const now = new Date()
    const thisYear = now.getFullYear()
    const anchor = new Date(thisYear, anchorMonth-1, 1)
    if (anchor <= now) anchor.setFullYear(thisYear+1)
    return anchor.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})
  }

  const daysUntil = (dateStr) => {
    if (!dateStr) return null
    return Math.ceil((new Date(dateStr) - new Date()) / (1000*60*60*24))
  }

  return <div>
    <SH title="Employers" sub={`${org.employers_pagination.total || 0} accounts`} action={
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', justifyContent:'flex-end' }}>
        <input
          type="search"
          placeholder="Search employers…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          aria-label="Search employers"
          style={{
            width: 220,
            minWidth: 160,
            boxSizing: 'border-box',
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: '8px 10px',
            fontSize: 13,
            color: C.textDark,
            fontFamily: 'Arial,sans-serif',
            outline: 'none',
          }}
        />
        <Btn onClick={()=>{setAddEmployerError('');setModal(true)}}>+ Add Employer</Btn>
      </div>
    }/>
    {apiError && (
      <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
        {apiError}
      </div>
    )}
    {org.employers_error && (
      <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
        {org.employers_error}
      </div>
    )}
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
      <div style={{fontSize:12,color:C.textMid}}>
        Page {org.employers_pagination.page} of {org.employers_pagination.total_pages}
      </div>
      <div style={{display:'flex',gap:8}}>
        <Btn variant="ghost" small disabled={org.employers_loading || page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Btn>
        <Btn variant="ghost" small disabled={org.employers_loading || page >= (org.employers_pagination.total_pages || 1)} onClick={() => setPage((p) => Math.min(org.employers_pagination.total_pages || 1, p + 1))}>Next</Btn>
      </div>
    </div>

    <div style={{display:'grid',gap:16}}>
      {db.employers.map(emp=>{
        const contracts    = db.contracts.filter(c=>(c.employer_id || c.employerId)===emp.id&&c.active)
        const sessions     = db.sessions.filter(s=>(s.employer_id || s.employerId)===emp.id).length
        const revenue      = db.invoices.filter(i=>i.employer_id===emp.id&&i.status==='paid').reduce((s,i)=>s+(i.total_cents||0),0)
        const empAdminFees = (db.adminFees||[]).filter(f=>(f.employer_id || f.employerId)===emp.id).sort((a,b)=>(b.invoice_date || b.invoiceDate || '').localeCompare(a.invoice_date || a.invoiceDate || ''))
        const totalAdminPaid = empAdminFees.filter(f=>f.status==='paid').reduce((s,f)=>s+(f.fee_cents || f.feeCents),0)
        const renewal = nextRenewal(emp.admin_fee_anchor_month)
        const renewalDays = emp.admin_fee_anchor_month ? daysUntil(new Date(new Date().getFullYear()+(new Date().getMonth()+1>=emp.admin_fee_anchor_month?1:0),emp.admin_fee_anchor_month-1,1).toISOString().split('T')[0]) : null
        const card = { background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }

        return <div key={emp.id} style={{...card,overflow:'hidden'}}>
          <div style={{padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.textDark}}>{emp.name}</div>
              <div style={{fontSize:12,color:C.textMid,marginTop:2}}>{emp.contact_name} · {emp.contact_email}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:10,background:C.cream,border:`1px solid ${C.border}`,color:C.textMid,padding:'3px 7px',borderRadius:3,textTransform:'uppercase',fontWeight:700}}>{emp.billing_method}</span>
              <Badge status={emp.active?'active':'discharged'}/>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:0,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
            {[['Contracts',contracts.length],['Sessions',sessions],['Session Revenue',fmt(revenue)],['Admin Fees Paid',fmt(totalAdminPaid)]].map(([l,v],i)=>(
              <div key={l} style={{padding:'12px 16px',borderRight:i<3?`1px solid ${C.border}`:'none'}}>
                <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:3}}>{l}</div>
                <div style={{fontSize:15,fontWeight:700,color:l.includes('Revenue')||l.includes('Admin')?C.tealDark:C.textDark,fontFamily:'monospace'}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{padding:'14px 18px',background:C.bgPage,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.07em'}}>Annual Administrative Fee</div>
              <div style={{display:'flex',gap:7}}>
                <Btn variant="ghost" small onClick={() => {
                  setFeeModalError('')
                  setFeeForm({
                    name: emp.name || '',
                    contact_name: emp.contact_name || '',
                    contact_email: emp.contact_email || '',
                    billing_method: emp.billing_method || 'invoice',
                    admin_fee_cents: String((emp.admin_fee_cents || 0) / 100),
                    admin_fee_anchor_month: String(emp.admin_fee_anchor_month || 1),
                    active: emp.active !== false,
                  })
                  setFeeModal(emp.id)
                }}>Edit</Btn>
                <Btn variant="ghost" small onClick={()=>{setInvForm({fee_cents:String((emp.admin_fee_cents||0)/100),period_label:'',invoice_date:today(),due_date:'',notes:'Annual admin fee'});setInvModal(emp.id)}}>+ Invoice</Btn>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:empAdminFees.length?14:0}}>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Annual Fee</div>
                <div style={{fontSize:16,fontWeight:700,color:emp.admin_fee_cents?C.tealDark:C.border,fontFamily:'monospace'}}>{emp.admin_fee_cents?fmt(emp.admin_fee_cents):'Not set'}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Renewal Month</div>
                <div style={{fontSize:14,fontWeight:700,color:C.textDark}}>{emp.admin_fee_anchor_month?MONTHS[emp.admin_fee_anchor_month-1]:'Not set'}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Next Renewal</div>
                <div style={{fontSize:13,fontWeight:700,color:renewalDays!==null&&renewalDays<=60?'#D4721A':C.textDark}}>
                  {renewal}
                  {renewalDays!==null&&renewalDays<=60&&<span style={{fontSize:10,marginLeft:6,color:'#D4721A'}}>({renewalDays}d)</span>}
                </div>
              </div>
            </div>

            {empAdminFees.length>0&&<div>
              <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:8}}>Invoice History</div>
              <div style={{display:'grid',gap:6}}>
                {empAdminFees.map(f=>{
                  const overdueDays = f.status==='sent'&&(f.due_date || f.dueDate) ? daysUntil(f.due_date || f.dueDate) : null
                  return <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'9px 12px',flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.textDark,fontFamily:'monospace'}}>{fmt(f.fee_cents || f.feeCents)}</div>
                      <div style={{fontSize:10,color:C.textMid,marginTop:1}}>{f.period_label || f.periodLabel}</div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:90,textAlign:'center'}}>
                      <div>Invoiced: <span style={{fontFamily:'monospace',color:C.textDark}}>{f.invoice_date || f.invoiceDate || '—'}</span></div>
                      <div>Due: <span style={{fontFamily:'monospace',color:overdueDays!==null&&overdueDays<0?'#B03A3A':C.textDark}}>{f.due_date || f.dueDate || '—'}</span></div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:80}}>
                      {(f.paid_date || f.paidDate)&&<div>Paid: <span style={{fontFamily:'monospace',color:C.tealDark}}>{f.paid_date || f.paidDate}</span></div>}
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <Badge status={f.status}/>
                      {f.status==='draft'   && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,'sent')}>Send</Btn>}
                      {f.status==='sent'    && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,'paid')}>Mark Paid</Btn>}
                      {f.status==='overdue' && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,'paid')}>Mark Paid</Btn>}
                    </div>
                    {f.notes&&<div style={{width:'100%',fontSize:10,color:C.textMid,fontStyle:'italic',paddingTop:4,borderTop:`1px solid ${C.border}`,marginTop:4}}>{f.notes}</div>}
                  </div>
                })}
              </div>
            </div>}
            {empAdminFees.length===0&&<div style={{fontSize:12,color:C.border,fontStyle:'italic'}}>No admin fee invoices yet — click "+ Invoice" to create one.</div>}
          </div>

          {contracts.length>0&&<div style={{padding:'12px 18px'}}>
            <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:7}}>Active Session Contracts</div>
            {contracts.map(c=><div key={c.id} style={{display:'flex',justifyContent:'space-between',fontSize:12,color:C.textMid,marginBottom:3}}>
              <span>{db.practices.find(p=>p.id===(c.practice_id || c.practiceId))?.name}</span>
              <span style={{fontFamily:'monospace',color:C.textDark}}>{c.label}</span>
            </div>)}
          </div>}
        </div>
      })}
    </div>

    {modal&&<Modal title="Add Employer" onClose={()=>{setAddEmployerError('');setModal(false)}}>
      <Inp label="Company Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <Inp label="Contact Name" value={form.contact_name} onChange={e=>setForm(f=>({...f,contact_name:e.target.value}))}/>
      <Inp label="Contact Email" type="email" value={form.contact_email} onChange={e=>setForm(f=>({...f,contact_email:e.target.value}))}/>
      <Sel label="Session Billing Method" value={form.billing_method} onChange={e=>setForm(f=>({...f,billing_method:e.target.value}))}
        options={[{value:'invoice',label:'Invoice (manual)'},{value:'ach',label:'ACH Auto-charge (Stripe)'}]}/>
      {addEmployerError && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {addEmployerError}
        </div>
      )}
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:2,marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10}}>Annual Administrative Fee</div>
        <Inp label="Annual Admin Fee ($)" type="number" value={form.admin_fee_cents} onChange={e=>setForm(f=>({...f,admin_fee_cents:e.target.value}))} placeholder="5000"/>
        <Sel label="Renewal Month" value={form.admin_fee_anchor_month} onChange={e=>setForm(f=>({...f,admin_fee_anchor_month:e.target.value}))}
          options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      </div>
      <Btn onClick={addEmployer} disabled={!form.name}>Add Employer</Btn>
    </Modal>}

    {feeModal&&<Modal title={`Edit — ${db.employers.find(e=>e.id===feeModal)?.name}`} onClose={()=>{setFeeModalError('');setFeeModal(null)}}>
      <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:'10px 12px',fontSize:12,color:C.textMid,marginBottom:16,lineHeight:1.6}}>
        Update employer details and annual administrative fee settings
      </div>
      {feeModalError && (
        <div style={{ background:'#FCE8E8', border:'1px solid #D9534F', borderRadius:4, padding:'9px 12px', fontSize:12, color:'#B03A3A', marginBottom:12 }}>
          {feeModalError}
        </div>
      )}
      <Inp label="Company Name" value={feeForm.name} onChange={e=>setFeeForm(f=>({...f,name:e.target.value}))}/>
      <Inp label="Contact Name" value={feeForm.contact_name} onChange={e=>setFeeForm(f=>({...f,contact_name:e.target.value}))}/>
      <Inp label="Contact Email" type="email" value={feeForm.contact_email} onChange={e=>setFeeForm(f=>({...f,contact_email:e.target.value}))}/>
      <Sel label="Session Billing Method" value={feeForm.billing_method} onChange={e=>setFeeForm(f=>({...f,billing_method:e.target.value}))}
        options={[{value:'invoice',label:'Invoice (manual)'},{value:'ach',label:'ACH Auto-charge (Stripe)'}]}/>
      <Sel label="Status" value={feeForm.active ? 'true' : 'false'} onChange={e=>setFeeForm(f=>({...f,active:e.target.value==='true'}))}
        options={[{value:'true',label:'Active'},{value:'false',label:'Inactive'}]}/>
      <Inp label="Annual Admin Fee ($)" type="number" value={feeForm.admin_fee_cents} onChange={e=>setFeeForm(f=>({...f,admin_fee_cents:e.target.value}))} placeholder="5000"/>
      <Sel label="Renewal Month" value={feeForm.admin_fee_anchor_month} onChange={e=>setFeeForm(f=>({...f,admin_fee_anchor_month:e.target.value}))}
        options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      <Btn onClick={saveAdminFee} disabled={!feeForm.name||!feeForm.contact_name||!feeForm.contact_email||!feeForm.admin_fee_cents}>Save</Btn>
    </Modal>}

    {invModal&&<Modal title={`New Admin Fee Invoice — ${db.employers.find(e=>e.id===invModal)?.name}`} onClose={()=>setInvModal(null)}>
      <Inp label="Fee Amount ($)" type="number" value={invForm.fee_cents} onChange={e=>setInvForm(f=>({...f,fee_cents:e.target.value}))} placeholder="5000"/>
      <Inp label="Period Label" value={invForm.period_label} onChange={e=>setInvForm(f=>({...f,period_label:e.target.value}))} placeholder="Jan 2026 – Jan 2027"/>
      <Inp label="Invoice Date" type="date" value={invForm.invoice_date} onChange={e=>setInvForm(f=>({...f,invoice_date:e.target.value}))}/>
      <Inp label="Due Date" type="date" value={invForm.due_date} onChange={e=>setInvForm(f=>({...f,due_date:e.target.value}))}/>
      <Inp label="Notes (optional)" value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="Annual admin fee — Year 2"/>
      <Btn onClick={addAdminInvoice} disabled={!invForm.fee_cents||!invForm.period_label||!invForm.invoice_date}>Create Invoice</Btn>
    </Modal>}
  </div>
}
