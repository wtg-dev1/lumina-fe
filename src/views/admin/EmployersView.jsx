import React, { useState } from 'react'
import { C, MONTHS } from '../../utils/constants'
import { fmt, today } from '../../utils/helpers'
import { useStore } from '../../data/store'
import { SH, Btn, Inp, Sel, Modal, Badge } from '../../components/ui'

export default function EmployersView() {
  const { state: db, dispatch } = useStore()

  const [modal,setModal]       = useState(false)
  const [feeModal,setFeeModal] = useState(null)  // employerId
  const [invModal,setInvModal] = useState(null)  // employerId
  const [form,setForm]         = useState({ name:'',contact:'',email:'',billing:'invoice',adminFeeCents:'',adminFeeAnchorMonth:'1' })
  const [invForm,setInvForm]   = useState({ feeCents:'',periodLabel:'',invoiceDate:'',dueDate:'',notes:'' })
  const [feeForm,setFeeForm]   = useState({ adminFeeCents:'',adminFeeAnchorMonth:'1' })

  const addEmployer = () => {
    dispatch({ type:'ADD_EMPLOYER', payload:{
      name:form.name, contact:form.contact, email:form.email,
      billing:form.billing,
      adminFeeCents: form.adminFeeCents ? parseInt(form.adminFeeCents)*100 : 0,
      adminFeeAnchorMonth: parseInt(form.adminFeeAnchorMonth),
    }})
    setModal(false)
    setForm({ name:'',contact:'',email:'',billing:'invoice',adminFeeCents:'',adminFeeAnchorMonth:'1' })
  }

  const saveAdminFee = () => {
    dispatch({ type:'UPDATE_EMPLOYER', payload:{
      id: feeModal,
      adminFeeCents: parseInt(feeForm.adminFeeCents)*100,
      adminFeeAnchorMonth: parseInt(feeForm.adminFeeAnchorMonth),
    }})
    setFeeModal(null)
  }

  const addAdminInvoice = () => {
    dispatch({ type:'ADD_ADMIN_FEE', payload:{
      employerId: invModal,
      feeCents: parseInt(invForm.feeCents)*100,
      periodLabel: invForm.periodLabel,
      invoiceDate: invForm.invoiceDate,
      dueDate: invForm.dueDate,
      notes: invForm.notes,
    }})
    setInvModal(null)
    setInvForm({ feeCents:'',periodLabel:'',invoiceDate:'',dueDate:'',notes:'' })
  }

  const updateAdminFeeStatus = (id, status) => {
    dispatch({ type:'UPDATE_ADMIN_FEE', payload:{ id, status } })
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
    <SH title="Employers" sub={`${db.employers.length} accounts`} action={<Btn onClick={()=>setModal(true)}>+ Add Employer</Btn>}/>

    <div style={{display:'grid',gap:16}}>
      {db.employers.map(emp=>{
        const contracts    = db.contracts.filter(c=>c.employerId===emp.id&&c.active)
        const sessions     = db.sessions.filter(s=>s.employerId===emp.id).length
        const revenue      = db.invoices.filter(i=>i.employerId===emp.id&&i.status==='paid').reduce((s,i)=>s+i.totalCents,0)
        const empAdminFees = (db.adminFees||[]).filter(f=>f.employerId===emp.id).sort((a,b)=>b.invoiceDate.localeCompare(a.invoiceDate))
        const totalAdminPaid = empAdminFees.filter(f=>f.status==='paid').reduce((s,f)=>s+f.feeCents,0)
        const renewal = nextRenewal(emp.adminFeeAnchorMonth)
        const renewalDays = emp.adminFeeAnchorMonth ? daysUntil(new Date(new Date().getFullYear()+(new Date().getMonth()+1>=emp.adminFeeAnchorMonth?1:0),emp.adminFeeAnchorMonth-1,1).toISOString().split('T')[0]) : null
        const card = { background:C.white, border:`1px solid ${C.border}`, borderRadius:5 }

        return <div key={emp.id} style={{...card,overflow:'hidden'}}>
          <div style={{padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.textDark}}>{emp.name}</div>
              <div style={{fontSize:12,color:C.textMid,marginTop:2}}>{emp.contact} · {emp.email}</div>
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <span style={{fontSize:10,background:C.cream,border:`1px solid ${C.border}`,color:C.textMid,padding:'3px 7px',borderRadius:3,textTransform:'uppercase',fontWeight:700}}>{emp.billing}</span>
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
                <Btn variant="ghost" small onClick={()=>{setFeeForm({adminFeeCents:String((emp.adminFeeCents||0)/100),adminFeeAnchorMonth:String(emp.adminFeeAnchorMonth||1)});setFeeModal(emp.id)}}>Edit Fee</Btn>
                <Btn variant="ghost" small onClick={()=>{setInvForm({feeCents:String((emp.adminFeeCents||0)/100),periodLabel:'',invoiceDate:today(),dueDate:'',notes:'Annual admin fee'});setInvModal(emp.id)}}>+ Invoice</Btn>
              </div>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:empAdminFees.length?14:0}}>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Annual Fee</div>
                <div style={{fontSize:16,fontWeight:700,color:emp.adminFeeCents?C.tealDark:C.border,fontFamily:'monospace'}}>{emp.adminFeeCents?fmt(emp.adminFeeCents):'Not set'}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:3}}>Renewal Month</div>
                <div style={{fontSize:14,fontWeight:700,color:C.textDark}}>{emp.adminFeeAnchorMonth?MONTHS[emp.adminFeeAnchorMonth-1]:'Not set'}</div>
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
                  const overdueDays = f.status==='sent'&&f.dueDate ? daysUntil(f.dueDate) : null
                  return <div key={f.id} style={{display:'flex',alignItems:'center',gap:12,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:'9px 12px',flexWrap:'wrap'}}>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.textDark,fontFamily:'monospace'}}>{fmt(f.feeCents)}</div>
                      <div style={{fontSize:10,color:C.textMid,marginTop:1}}>{f.periodLabel}</div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:90,textAlign:'center'}}>
                      <div>Invoiced: <span style={{fontFamily:'monospace',color:C.textDark}}>{f.invoiceDate||'—'}</span></div>
                      <div>Due: <span style={{fontFamily:'monospace',color:overdueDays!==null&&overdueDays<0?'#B03A3A':C.textDark}}>{f.dueDate||'—'}</span></div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:80}}>
                      {f.paidDate&&<div>Paid: <span style={{fontFamily:'monospace',color:C.tealDark}}>{f.paidDate}</span></div>}
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
              <span>{db.practices.find(p=>p.id===c.practiceId)?.name}</span>
              <span style={{fontFamily:'monospace',color:C.textDark}}>{c.label}</span>
            </div>)}
          </div>}
        </div>
      })}
    </div>

    {modal&&<Modal title="Add Employer" onClose={()=>setModal(false)}>
      <Inp label="Company Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <Inp label="Contact Name" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))}/>
      <Inp label="Contact Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
      <Sel label="Session Billing Method" value={form.billing} onChange={e=>setForm(f=>({...f,billing:e.target.value}))}
        options={[{value:'invoice',label:'Invoice (manual)'},{value:'ach',label:'ACH Auto-charge (Stripe)'}]}/>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:2,marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:10}}>Annual Administrative Fee</div>
        <Inp label="Annual Admin Fee ($)" type="number" value={form.adminFeeCents} onChange={e=>setForm(f=>({...f,adminFeeCents:e.target.value}))} placeholder="5000"/>
        <Sel label="Renewal Month" value={form.adminFeeAnchorMonth} onChange={e=>setForm(f=>({...f,adminFeeAnchorMonth:e.target.value}))}
          options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      </div>
      <Btn onClick={addEmployer} disabled={!form.name}>Add Employer</Btn>
    </Modal>}

    {feeModal&&<Modal title={`Admin Fee — ${db.employers.find(e=>e.id===feeModal)?.name}`} onClose={()=>setFeeModal(null)}>
      <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:'10px 12px',fontSize:12,color:C.textMid,marginBottom:16,lineHeight:1.6}}>
        The annual administrative fee is billed once per year on the renewal month. This is separate from monthly session-based invoices.
      </div>
      <Inp label="Annual Admin Fee ($)" type="number" value={feeForm.adminFeeCents} onChange={e=>setFeeForm(f=>({...f,adminFeeCents:e.target.value}))} placeholder="5000"/>
      <Sel label="Renewal Month" value={feeForm.adminFeeAnchorMonth} onChange={e=>setFeeForm(f=>({...f,adminFeeAnchorMonth:e.target.value}))}
        options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      <Btn onClick={saveAdminFee} disabled={!feeForm.adminFeeCents}>Save</Btn>
    </Modal>}

    {invModal&&<Modal title={`New Admin Fee Invoice — ${db.employers.find(e=>e.id===invModal)?.name}`} onClose={()=>setInvModal(null)}>
      <Inp label="Fee Amount ($)" type="number" value={invForm.feeCents} onChange={e=>setInvForm(f=>({...f,feeCents:e.target.value}))} placeholder="5000"/>
      <Inp label="Period Label" value={invForm.periodLabel} onChange={e=>setInvForm(f=>({...f,periodLabel:e.target.value}))} placeholder="Jan 2026 – Jan 2027"/>
      <Inp label="Invoice Date" type="date" value={invForm.invoiceDate} onChange={e=>setInvForm(f=>({...f,invoiceDate:e.target.value}))}/>
      <Inp label="Due Date" type="date" value={invForm.dueDate} onChange={e=>setInvForm(f=>({...f,dueDate:e.target.value}))}/>
      <Inp label="Notes (optional)" value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="Annual admin fee — Year 2"/>
      <Btn onClick={addAdminInvoice} disabled={!invForm.feeCents||!invForm.periodLabel||!invForm.invoiceDate}>Create Invoice</Btn>
    </Modal>}
  </div>
}
