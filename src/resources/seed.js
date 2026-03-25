/**
 * Lumina Ops — Seed Data
 *
 * Used during development / prototype phase.
 * Replace with API calls when Go backend is connected.
 * All field names here match the PostgreSQL schema (camelCase JS ↔ snake_case DB).
 */

export const seed = {
  employers: [
    { id:'e1', name:'Meridian Capital Group',  contact:'Sarah Chen',    email:'schen@meridiancap.com',    billing:'invoice', active:true, adminFeeCents:500000, adminFeeAnchorMonth:1,
      banking:{ bankName:'JPMorgan Chase', routing:'021000021', account:'4401882930', accountType:'checking', billingContact:'Sarah Chen', billingEmail:'ap@meridiancap.com' } },
    { id:'e2', name:'Vantage Law Partners',    contact:'James Holloway',email:'jholloway@vantagelaw.com', billing:'ach',     active:true, adminFeeCents:750000, adminFeeAnchorMonth:3,
      banking:{ bankName:'Bank of America',  routing:'026009593', account:'7723019845', accountType:'checking', billingContact:'Finance Dept', billingEmail:'finance@vantagelaw.com' } },
    { id:'e3', name:'Northshore Advisory',     contact:'Dana Ruiz',     email:'druiz@northshore.com',     billing:'invoice', active:true, adminFeeCents:350000, adminFeeAnchorMonth:6,
      banking: null },
  ],

  practices: [
    { id:'p1', name:'Williamsburg Therapy Group',       city:'New York, NY',      contact:'Dr. Selling',  email:'admin@wtgtherapy.com',           active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000,
      banking:{ bankName:'Citibank', routing:'021000089', account:'1234567890', accountType:'checking', billingContact:'Daniel Selling', billingEmail:'billing@wtgtherapy.com' } },
    { id:'p2', name:'Manhattan Wellness',               city:'New York, NY',      contact:'Dr. Park',     email:'admin@manhattanwellness.com',     active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000,
      banking:{ bankName:'Chase', routing:'021000021', account:'9876543210', accountType:'checking', billingContact:'Dr. Park', billingEmail:'billing@manhattanwellness.com' } },
    { id:'p3', name:'Wholeview Wellness',               city:'New York, NY',      contact:'Dr. Torres',   email:'admin@wholeview.com',             active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000, banking:null },
    { id:'p4', name:'The Therapy Group of Philadelphia',city:'Philadelphia, PA',  contact:'Practice Lead',email:'admin@therapygroupphilly.com',    active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:'p5', name:'Therapy for Women',                city:'Philadelphia, PA',  contact:'Practice Lead',email:'admin@therapyforwomen.com',       active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:'p6', name:'A Better Life Therapy',            city:'Philadelphia, PA',  contact:'Practice Lead',email:'admin@abetterlifetherapy.com',    active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:'p7', name:'Therapy Group of DC',              city:'Washington, DC',    contact:'Practice Lead',email:'admin@therapygroupdc.com',        active:true, rateIndividual:22500, rateCouple:32500, ratePsychiatry:37500, banking:null },
    { id:'p8', name:'SF Stress and Anxiety Center',     city:'San Francisco, CA', contact:'Practice Lead',email:'admin@sfstressandanxiety.com',   active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000, banking:null },
  ],

  contracts: [
    { id:'c1', practiceId:'p1', employerId:'e1', type:'per_employee',        rate:100000, units:5, margin:20, active:true, label:'$1,000/mo per employee' },
    { id:'c2', practiceId:'p2', employerId:'e2', type:'per_couple',          rate:140000, units:3, margin:20, active:true, label:'$1,400/mo per couple' },
    { id:'c3', practiceId:'p3', employerId:'e1', type:'per_employee',        rate:100000, units:4, margin:15, active:true, label:'$1,000/mo per employee' },
    { id:'c4', practiceId:'p1', employerId:'e3', type:'per_psychiatry_block',rate:80000,  units:6, margin:20, active:true, label:'$800/mo per 2-session block' },
    { id:'c5', practiceId:'p7', employerId:'e2', type:'per_employee',        rate:100000, units:4, margin:20, active:true, label:'$1,000/mo per employee' },
    { id:'c6', practiceId:'p4', employerId:'e3', type:'per_employee',        rate:100000, units:3, margin:20, active:true, label:'$1,000/mo per employee' },
  ],

  clinicians: [
    { id:'cl1', practiceId:'p1', name:'Dr. Avery Walsh',   credential:'PhD',  specialty:'CBT' },
    { id:'cl2', practiceId:'p1', name:'Dr. Marcus Reid',   credential:'PsyD', specialty:'Psychiatry' },
    { id:'cl3', practiceId:'p2', name:'Dr. Lena Okafor',   credential:'LCSW', specialty:'Couples' },
    { id:'cl4', practiceId:'p3', name:'Dr. Sam Nguyen',    credential:'MD',   specialty:'Psychiatry' },
    { id:'cl5', practiceId:'p4', name:'Dr. Jamie Ellison', credential:'PhD',  specialty:'CBT' },
    { id:'cl6', practiceId:'p5', name:'Dr. Priya Nair',    credential:'LCSW', specialty:"Women's Issues" },
    { id:'cl7', practiceId:'p6', name:'Dr. Caleb Ostroff', credential:'PsyD', specialty:'Anxiety' },
    { id:'cl8', practiceId:'p7', name:'Dr. Dana Whitfield',credential:'PhD',  specialty:'CBT' },
    { id:'cl9', practiceId:'p8', name:'Dr. Kenji Mori',    credential:'PhD',  specialty:'Anxiety & Stress' },
  ],

  clients: [
    { id:'cl_a', anonId:'LTA-0041', clientName:'James Whitmore',  employerId:'e1', practiceId:'p1', clinicianId:'cl1', intakeDate:'2025-11-01', status:'active', modality:'in-person', state:'New York',      email:'client1@email.com', phone:'' },
    { id:'cl_b', anonId:'LTA-0042', clientName:'Rachel Torres',   employerId:'e1', practiceId:'p1', clinicianId:'cl1', intakeDate:'2025-11-15', status:'active', modality:'in-person', state:'New York',      email:'client2@email.com', phone:'' },
    { id:'cl_c', anonId:'LTA-0043', clientName:'Marcus Webb',     employerId:'e2', practiceId:'p2', clinicianId:'cl3', intakeDate:'2025-12-01', status:'active', modality:'in-person', state:'New York',      email:'client3@email.com', phone:'' },
    { id:'cl_d', anonId:'LTA-0044', clientName:'Priya Nair',      employerId:'e1', practiceId:'p3', clinicianId:'cl4', intakeDate:'2025-12-10', status:'active', modality:'virtual',   state:'Florida',       email:'client4@email.com', phone:'555-0104' },
    { id:'cl_e', anonId:'LTA-0045', clientName:'Derek Okafor',    employerId:'e3', practiceId:'p1', clinicianId:'cl2', intakeDate:'2026-01-05', status:'active', modality:'virtual',   state:'Texas',         email:'client5@email.com', phone:'555-0105' },
    { id:'cl_f', anonId:'LTA-0046', clientName:'Sofia Carvalho',  employerId:'e2', practiceId:'p7', clinicianId:'cl8', intakeDate:'2026-01-10', status:'active', modality:'virtual',   state:'Washington DC', email:'client6@email.com', phone:'555-0106' },
    { id:'cl_g', anonId:'LTA-0047', clientName:'Nathan Ellison',  employerId:'e3', practiceId:'p4', clinicianId:'cl5', intakeDate:'2026-01-18', status:'active', modality:'in-person', state:'Pennsylvania',  email:'client7@email.com', phone:'' },
    { id:'cl_h', anonId:'LTA-0048', clientName:'Amanda Pierce',   employerId:'e2', practiceId:'p7', clinicianId:'cl8', intakeDate:'2026-02-01', status:'active', modality:'in-person', state:'Washington DC', email:'client8@email.com', phone:'' },
  ],

  sessions: [
    { id:'s1',  clientId:'cl_a', clinicianId:'cl1', practiceId:'p1', employerId:'e1', date:'2026-01-08', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s2',  clientId:'cl_b', clinicianId:'cl1', practiceId:'p1', employerId:'e1', date:'2026-01-10', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s3',  clientId:'cl_c', clinicianId:'cl3', practiceId:'p2', employerId:'e2', date:'2026-01-12', type:'couple',     modality:'in-person', feeCents:28000 },
    { id:'s4',  clientId:'cl_d', clinicianId:'cl4', practiceId:'p3', employerId:'e1', date:'2026-01-14', type:'psychiatry', modality:'virtual',   feeCents:40000 },
    { id:'s5',  clientId:'cl_e', clinicianId:'cl2', practiceId:'p1', employerId:'e3', date:'2026-01-20', type:'psychiatry', modality:'virtual',   feeCents:40000 },
    { id:'s6',  clientId:'cl_f', clinicianId:'cl8', practiceId:'p7', employerId:'e2', date:'2026-01-22', type:'individual', modality:'virtual',   feeCents:20000 },
    { id:'s7',  clientId:'cl_g', clinicianId:'cl5', practiceId:'p4', employerId:'e3', date:'2026-01-25', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s8',  clientId:'cl_a', clinicianId:'cl1', practiceId:'p1', employerId:'e1', date:'2026-02-05', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s9',  clientId:'cl_c', clinicianId:'cl3', practiceId:'p2', employerId:'e2', date:'2026-02-11', type:'couple',     modality:'in-person', feeCents:28000 },
    { id:'s10', clientId:'cl_b', clinicianId:'cl1', practiceId:'p1', employerId:'e1', date:'2026-02-18', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s11', clientId:'cl_e', clinicianId:'cl2', practiceId:'p1', employerId:'e3', date:'2026-02-25', type:'psychiatry', modality:'virtual',   feeCents:40000 },
    { id:'s12', clientId:'cl_f', clinicianId:'cl8', practiceId:'p7', employerId:'e2', date:'2026-02-28', type:'individual', modality:'virtual',   feeCents:20000 },
    { id:'s13', clientId:'cl_h', clinicianId:'cl8', practiceId:'p7', employerId:'e2', date:'2026-03-03', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s14', clientId:'cl_d', clinicianId:'cl4', practiceId:'p3', employerId:'e1', date:'2026-03-05', type:'psychiatry', modality:'virtual',   feeCents:40000 },
    { id:'s15', clientId:'cl_a', clinicianId:'cl1', practiceId:'p1', employerId:'e1', date:'2026-03-10', type:'individual', modality:'in-person', feeCents:20000 },
    { id:'s16', clientId:'cl_g', clinicianId:'cl5', practiceId:'p4', employerId:'e3', date:'2026-03-14', type:'individual', modality:'in-person', feeCents:20000 },
  ],

  assessments: [
    { id:'a1',  clientId:'cl_a', type:'PHQ9', date:'2025-11-01', score:16, answers:null, completed:true,  token:null },
    { id:'a2',  clientId:'cl_a', type:'GAD7', date:'2025-11-01', score:14, answers:null, completed:true,  token:null },
    { id:'a3',  clientId:'cl_a', type:'PHQ9', date:'2025-11-29', score:11, answers:null, completed:true,  token:null },
    { id:'a4',  clientId:'cl_a', type:'GAD7', date:'2025-11-29', score:9,  answers:null, completed:true,  token:null },
    { id:'a5',  clientId:'cl_a', type:'PHQ9', date:'2026-01-10', score:7,  answers:null, completed:true,  token:null },
    { id:'a6',  clientId:'cl_a', type:'GAD7', date:'2026-01-10', score:5,  answers:null, completed:true,  token:null },
    { id:'a7',  clientId:'cl_b', type:'PHQ9', date:'2025-11-15', score:12, answers:null, completed:true,  token:null },
    { id:'a8',  clientId:'cl_b', type:'GAD7', date:'2025-11-15', score:10, answers:null, completed:true,  token:null },
    { id:'a9',  clientId:'cl_b', type:'PHQ9', date:'2026-01-10', score:6,  answers:null, completed:true,  token:null },
    { id:'a10', clientId:'cl_b', type:'GAD7', date:'2026-01-10', score:4,  answers:null, completed:true,  token:null },
    { id:'a11', clientId:'cl_c', type:'PHQ9', date:'2025-12-01', score:14, answers:null, completed:true,  token:null },
    { id:'a12', clientId:'cl_c', type:'GAD7', date:'2025-12-01', score:13, answers:null, completed:true,  token:null },
    { id:'a13', clientId:'cl_c', type:'PHQ9', date:'2026-01-12', score:9,  answers:null, completed:true,  token:null },
    { id:'a14', clientId:'cl_c', type:'GAD7', date:'2026-01-12', score:7,  answers:null, completed:true,  token:null },
    { id:'a15', clientId:'cl_d', type:'PHQ9', date:'2025-12-10', score:18, answers:null, completed:true,  token:null },
    { id:'a16', clientId:'cl_d', type:'GAD7', date:'2025-12-10', score:15, answers:null, completed:true,  token:null },
    { id:'a17', clientId:'cl_d', type:'PHQ9', date:'2026-01-14', score:13, answers:null, completed:true,  token:null },
    { id:'a18', clientId:'cl_d', type:'GAD7', date:'2026-01-14', score:10, answers:null, completed:true,  token:null },
    { id:'a19', clientId:'cl_e', type:'PHQ9', date:'2026-01-05', score:10, answers:null, completed:true,  token:null },
    { id:'a20', clientId:'cl_e', type:'GAD7', date:'2026-01-05', score:8,  answers:null, completed:true,  token:null },
    { id:'a21', clientId:'cl_e', type:'PHQ9', date:'2026-02-25', score:5,  answers:null, completed:true,  token:null },
    { id:'a22', clientId:'cl_e', type:'GAD7', date:'2026-02-25', score:3,  answers:null, completed:true,  token:null },
  ],

  referrals: [
    { id:'ref1', anonId:'LTA-0041', employerId:'e1', practiceId:'p1', clinicianId:'cl1', presNeed:'Anxiety',                location:'New York, NY',    state:'New York',     sessionType:'individual', modality:'in-person', clientEmail:'client1@email.com', clientPhone:'',         status:'active',    createdAt:'2025-11-01', scheduledAt:'2025-11-03', notes:'Referred by HR',                practiceConfirmedAt:'2025-11-01', practiceContactedAt:'2025-11-02', practiceSessionBookedAt:'2025-11-03' },
    { id:'ref2', anonId:'LTA-0043', employerId:'e2', practiceId:'p2', clinicianId:'cl3', presNeed:'Couples / Relationship', location:'New York, NY',    state:'New York',     sessionType:'couple',     modality:'in-person', clientEmail:'client3@email.com', clientPhone:'',         status:'active',    createdAt:'2025-12-01', scheduledAt:'2025-12-04', notes:'',                              practiceConfirmedAt:'2025-12-01', practiceContactedAt:'2025-12-02', practiceSessionBookedAt:'2025-12-04' },
    { id:'ref3', anonId:'LTA-0046', employerId:'e2', practiceId:'p7', clinicianId:'cl8', presNeed:'Depression',             location:'Washington, DC',  state:'Washington DC',sessionType:'individual', modality:'virtual',   clientEmail:'client6@email.com', clientPhone:'',         status:'scheduled', createdAt:'2026-01-10', scheduledAt:'2026-01-13', notes:'Partner track associate',       practiceConfirmedAt:'2026-01-10', practiceContactedAt:'2026-01-11', practiceSessionBookedAt:'' },
    { id:'ref4', anonId:'LTA-0049', employerId:'e1', practiceId:'',   clinicianId:'',    presNeed:'Psychiatry / Medication',location:'Philadelphia, PA', state:'Texas',        sessionType:'psychiatry', modality:'virtual',   clientEmail:'client9@email.com', clientPhone:'555-0199', status:'pending',   createdAt:'2026-03-20', scheduledAt:'',           notes:'Client in Texas — PSYPACT virtual', practiceConfirmedAt:'', practiceContactedAt:'', practiceSessionBookedAt:'' },
  ],

  invoices: [
    { id:'inv1', employerId:'e1', period:'Jan 2026', totalCents:900000, status:'paid' },
    { id:'inv2', employerId:'e2', period:'Jan 2026', totalCents:420000, status:'paid' },
    { id:'inv3', employerId:'e3', period:'Jan 2026', totalCents:480000, status:'overdue' },
    { id:'inv4', employerId:'e1', period:'Feb 2026', totalCents:900000, status:'sent' },
    { id:'inv5', employerId:'e2', period:'Feb 2026', totalCents:420000, status:'paid' },
    { id:'inv6', employerId:'e3', period:'Feb 2026', totalCents:480000, status:'draft' },
    { id:'inv7', employerId:'e1', period:'Mar 2026', totalCents:900000, status:'draft' },
    { id:'inv8', employerId:'e2', period:'Mar 2026', totalCents:420000, status:'draft' },
    { id:'inv9', employerId:'e3', period:'Mar 2026', totalCents:480000, status:'draft' },
  ],

  adminFees: [
    { id:'af1', employerId:'e1', feeCents:500000, periodLabel:'Jan 2025 – Jan 2026', invoiceDate:'2025-01-15', dueDate:'2025-02-15', paidDate:'2025-02-10', status:'paid',    notes:'Annual admin fee — Year 1' },
    { id:'af2', employerId:'e1', feeCents:500000, periodLabel:'Jan 2026 – Jan 2027', invoiceDate:'2026-01-15', dueDate:'2026-02-15', paidDate:'',          status:'sent',    notes:'Annual admin fee — Year 2' },
    { id:'af3', employerId:'e2', feeCents:750000, periodLabel:'Mar 2025 – Mar 2026', invoiceDate:'2025-03-01', dueDate:'2025-04-01', paidDate:'2025-03-28', status:'paid',    notes:'Annual admin fee — Year 1' },
    { id:'af4', employerId:'e2', feeCents:750000, periodLabel:'Mar 2026 – Mar 2027', invoiceDate:'2026-03-01', dueDate:'2026-04-01', paidDate:'',          status:'draft',   notes:'Annual admin fee — Year 2' },
    { id:'af5', employerId:'e3', feeCents:350000, periodLabel:'Jun 2025 – Jun 2026', invoiceDate:'2025-06-01', dueDate:'2025-07-01', paidDate:'',          status:'overdue', notes:'Annual admin fee — Year 1' },
  ],

  payouts: [
    { id:'pay1',  practiceId:'p1', period:'Jan 2026', grossCents:500000, marginCents:100000, netCents:400000, status:'paid' },
    { id:'pay2',  practiceId:'p2', period:'Jan 2026', grossCents:420000, marginCents:84000,  netCents:336000, status:'paid' },
    { id:'pay3',  practiceId:'p3', period:'Jan 2026', grossCents:400000, marginCents:60000,  netCents:340000, status:'paid' },
    { id:'pay4',  practiceId:'p7', period:'Jan 2026', grossCents:400000, marginCents:80000,  netCents:320000, status:'paid' },
    { id:'pay5',  practiceId:'p4', period:'Jan 2026', grossCents:300000, marginCents:60000,  netCents:240000, status:'paid' },
    { id:'pay6',  practiceId:'p1', period:'Feb 2026', grossCents:500000, marginCents:100000, netCents:400000, status:'processing' },
    { id:'pay7',  practiceId:'p2', period:'Feb 2026', grossCents:420000, marginCents:84000,  netCents:336000, status:'paid' },
    { id:'pay8',  practiceId:'p3', period:'Feb 2026', grossCents:400000, marginCents:60000,  netCents:340000, status:'pending' },
    { id:'pay9',  practiceId:'p7', period:'Feb 2026', grossCents:400000, marginCents:80000,  netCents:320000, status:'paid' },
    { id:'pay10', practiceId:'p4', period:'Feb 2026', grossCents:300000, marginCents:60000,  netCents:240000, status:'pending' },
  ],
}
