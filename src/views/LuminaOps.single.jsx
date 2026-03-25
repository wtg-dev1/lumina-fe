import { useState, useEffect } from "react";

const STORE_KEY = "lumina_ops_v12";
const loadState = async () => {
  try { const r = await window.storage.get(STORE_KEY); return r ? JSON.parse(r.value) : null; } catch { return null; }
};
const saveState = async (state) => {
  try { await window.storage.set(STORE_KEY, JSON.stringify(state)); } catch {}
};

// Responsive helpers
const useIsMobile = () => {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mobile;
};

// Exact colors extracted from Lumina_HL_Proposal_Document.docx
const C = {
  tealDark:  "#1D6B6B",
  teal:      "#2A7F7F",
  tealMid:   "#3D9E9E",
  tealGreen: "#1D9E75",
  cream:     "#F5F0E8",
  textDark:  "#333333",
  textMid:   "#666666",
  white:     "#FFFFFF",
  border:    "#D5CFC4",
  bgPage:    "#F9F6F1",
};

const seed = {
  employers: [
    { id:"e1", name:"Meridian Capital Group",  contact:"Sarah Chen",    email:"schen@meridiancap.com",    billing:"invoice", active:true, adminFeeCents:500000, adminFeeAnchorMonth:1,
      banking:{ bankName:"JPMorgan Chase", routing:"021000021", account:"4401882930", accountType:"checking", billingContact:"Sarah Chen", billingEmail:"ap@meridiancap.com" } },
    { id:"e2", name:"Vantage Law Partners",    contact:"James Holloway",email:"jholloway@vantagelaw.com", billing:"ach",     active:true, adminFeeCents:750000, adminFeeAnchorMonth:3,
      banking:{ bankName:"Bank of America",  routing:"026009593", account:"7723019845", accountType:"checking", billingContact:"Finance Dept", billingEmail:"finance@vantagelaw.com" } },
    { id:"e3", name:"Northshore Advisory",     contact:"Dana Ruiz",     email:"druiz@northshore.com",     billing:"invoice", active:true, adminFeeCents:350000, adminFeeAnchorMonth:6,
      banking:null },
  ],
  practices: [
    { id:"p1", name:"Williamsburg Therapy Group",       city:"New York, NY",       contact:"Dr. Selling",  email:"admin@wtgtherapy.com",            active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000,
      banking:{ bankName:"Citibank", routing:"021000089", account:"1234567890", accountType:"checking", billingContact:"Daniel Selling", billingEmail:"billing@wtgtherapy.com" } },
    { id:"p2", name:"Manhattan Wellness",                city:"New York, NY",       contact:"Dr. Park",     email:"admin@manhattanwellness.com",      active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000,
      banking:{ bankName:"Chase", routing:"021000021", account:"9876543210", accountType:"checking", billingContact:"Dr. Park", billingEmail:"billing@manhattanwellness.com" } },
    { id:"p3", name:"Wholeview Wellness",                city:"New York, NY",       contact:"Dr. Torres",   email:"admin@wholeview.com",              active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000, banking:null },
    { id:"p4", name:"The Therapy Group of Philadelphia", city:"Philadelphia, PA",   contact:"Practice Lead",email:"admin@therapygroupphilly.com",     active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:"p5", name:"Therapy for Women",                 city:"Philadelphia, PA",   contact:"Practice Lead",email:"admin@therapyforwomen.com",        active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:"p6", name:"A Better Life Therapy",             city:"Philadelphia, PA",   contact:"Practice Lead",email:"admin@abetterlifetherapy.com",     active:true, rateIndividual:20000, rateCouple:30000, ratePsychiatry:35000, banking:null },
    { id:"p7", name:"Therapy Group of DC",               city:"Washington, DC",     contact:"Practice Lead",email:"admin@therapygroupdc.com",         active:true, rateIndividual:22500, rateCouple:32500, ratePsychiatry:37500, banking:null },
    { id:"p8", name:"SF Stress and Anxiety Center",      city:"San Francisco, CA",  contact:"Practice Lead",email:"admin@sfstressandanxiety.com",     active:true, rateIndividual:25000, rateCouple:35000, ratePsychiatry:40000, banking:null },
  ],
  contracts: [
    { id:"c1", practiceId:"p1", employerId:"e1", type:"per_employee",        rate:100000, units:5, margin:20, active:true, label:"$1,000/mo per employee" },
    { id:"c2", practiceId:"p2", employerId:"e2", type:"per_couple",           rate:140000, units:3, margin:20, active:true, label:"$1,400/mo per couple" },
    { id:"c3", practiceId:"p3", employerId:"e1", type:"per_employee",        rate:100000, units:4, margin:15, active:true, label:"$1,000/mo per employee" },
    { id:"c4", practiceId:"p1", employerId:"e3", type:"per_psychiatry_block", rate:80000,  units:6, margin:20, active:true, label:"$800/mo per 2-session block" },
    { id:"c5", practiceId:"p7", employerId:"e2", type:"per_employee",        rate:100000, units:4, margin:20, active:true, label:"$1,000/mo per employee" },
    { id:"c6", practiceId:"p4", employerId:"e3", type:"per_employee",        rate:100000, units:3, margin:20, active:true, label:"$1,000/mo per employee" },
  ],
  clinicians: [
    { id:"cl1", practiceId:"p1", name:"Dr. Avery Walsh",   credential:"PhD",  specialty:"CBT" },
    { id:"cl2", practiceId:"p1", name:"Dr. Marcus Reid",   credential:"PsyD", specialty:"Psychiatry" },
    { id:"cl3", practiceId:"p2", name:"Dr. Lena Okafor",   credential:"LCSW", specialty:"Couples" },
    { id:"cl4", practiceId:"p3", name:"Dr. Sam Nguyen",    credential:"MD",   specialty:"Psychiatry" },
    { id:"cl5", practiceId:"p4", name:"Dr. Jamie Ellison", credential:"PhD",  specialty:"CBT" },
    { id:"cl6", practiceId:"p5", name:"Dr. Priya Nair",    credential:"LCSW", specialty:"Women's Issues" },
    { id:"cl7", practiceId:"p6", name:"Dr. Caleb Ostroff", credential:"PsyD", specialty:"Anxiety" },
    { id:"cl8", practiceId:"p7", name:"Dr. Dana Whitfield",credential:"PhD",  specialty:"CBT" },
    { id:"cl9", practiceId:"p8", name:"Dr. Kenji Mori",    credential:"PhD",  specialty:"Anxiety & Stress" },
  ],
  clients: [
    { id:"cl_a", anonId:"LTA-0041", clientName:"James Whitmore",   employerId:"e1", practiceId:"p1", clinicianId:"cl1", intakeDate:"2025-11-01", status:"active", modality:"in-person", state:"New York",       email:"client1@email.com" },
    { id:"cl_b", anonId:"LTA-0042", clientName:"Rachel Torres",    employerId:"e1", practiceId:"p1", clinicianId:"cl1", intakeDate:"2025-11-15", status:"active", modality:"in-person", state:"New York",       email:"client2@email.com" },
    { id:"cl_c", anonId:"LTA-0043", clientName:"Marcus Webb",      employerId:"e2", practiceId:"p2", clinicianId:"cl3", intakeDate:"2025-12-01", status:"active", modality:"in-person", state:"New York",       email:"client3@email.com" },
    { id:"cl_d", anonId:"LTA-0044", clientName:"Priya Nair",       employerId:"e1", practiceId:"p3", clinicianId:"cl4", intakeDate:"2025-12-10", status:"active", modality:"virtual",   state:"Florida",        email:"client4@email.com" },
    { id:"cl_e", anonId:"LTA-0045", clientName:"Derek Okafor",     employerId:"e3", practiceId:"p1", clinicianId:"cl2", intakeDate:"2026-01-05", status:"active", modality:"virtual",   state:"Texas",          email:"client5@email.com" },
    { id:"cl_f", anonId:"LTA-0046", clientName:"Sofia Carvalho",   employerId:"e2", practiceId:"p7", clinicianId:"cl8", intakeDate:"2026-01-10", status:"active", modality:"virtual",   state:"Washington DC",  email:"client6@email.com" },
    { id:"cl_g", anonId:"LTA-0047", clientName:"Nathan Ellison",   employerId:"e3", practiceId:"p4", clinicianId:"cl5", intakeDate:"2026-01-18", status:"active", modality:"in-person", state:"Pennsylvania",   email:"client7@email.com" },
    { id:"cl_h", anonId:"LTA-0048", clientName:"Amanda Pierce",    employerId:"e2", practiceId:"p7", clinicianId:"cl8", intakeDate:"2026-02-01", status:"active", modality:"in-person", state:"Washington DC",  email:"client8@email.com" },
  ],
  sessions: [
    { id:"s1",  clientId:"cl_a", clinicianId:"cl1", practiceId:"p1", employerId:"e1", date:"2026-01-08", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s2",  clientId:"cl_b", clinicianId:"cl1", practiceId:"p1", employerId:"e1", date:"2026-01-10", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s3",  clientId:"cl_c", clinicianId:"cl3", practiceId:"p2", employerId:"e2", date:"2026-01-12", type:"couple",     modality:"in-person", feeCents:28000 },
    { id:"s4",  clientId:"cl_d", clinicianId:"cl4", practiceId:"p3", employerId:"e1", date:"2026-01-14", type:"psychiatry", modality:"virtual",   feeCents:40000 },
    { id:"s5",  clientId:"cl_e", clinicianId:"cl2", practiceId:"p1", employerId:"e3", date:"2026-01-20", type:"psychiatry", modality:"virtual",   feeCents:40000 },
    { id:"s6",  clientId:"cl_f", clinicianId:"cl8", practiceId:"p7", employerId:"e2", date:"2026-01-22", type:"individual", modality:"virtual",   feeCents:20000 },
    { id:"s7",  clientId:"cl_g", clinicianId:"cl5", practiceId:"p4", employerId:"e3", date:"2026-01-25", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s8",  clientId:"cl_a", clinicianId:"cl1", practiceId:"p1", employerId:"e1", date:"2026-02-05", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s9",  clientId:"cl_c", clinicianId:"cl3", practiceId:"p2", employerId:"e2", date:"2026-02-11", type:"couple",     modality:"in-person", feeCents:28000 },
    { id:"s10", clientId:"cl_b", clinicianId:"cl1", practiceId:"p1", employerId:"e1", date:"2026-02-18", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s11", clientId:"cl_e", clinicianId:"cl2", practiceId:"p1", employerId:"e3", date:"2026-02-25", type:"psychiatry", modality:"virtual",   feeCents:40000 },
    { id:"s12", clientId:"cl_f", clinicianId:"cl8", practiceId:"p7", employerId:"e2", date:"2026-02-28", type:"individual", modality:"virtual",   feeCents:20000 },
    { id:"s13", clientId:"cl_h", clinicianId:"cl8", practiceId:"p7", employerId:"e2", date:"2026-03-03", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s14", clientId:"cl_d", clinicianId:"cl4", practiceId:"p3", employerId:"e1", date:"2026-03-05", type:"psychiatry", modality:"virtual",   feeCents:40000 },
    { id:"s15", clientId:"cl_a", clinicianId:"cl1", practiceId:"p1", employerId:"e1", date:"2026-03-10", type:"individual", modality:"in-person", feeCents:20000 },
    { id:"s16", clientId:"cl_g", clinicianId:"cl5", practiceId:"p4", employerId:"e3", date:"2026-03-14", type:"individual", modality:"in-person", feeCents:20000 },
  ],
  assessments: [
    { id:"a1",  clientId:"cl_a", type:"PHQ9", date:"2025-11-01", score:16, completed:true },
    { id:"a2",  clientId:"cl_a", type:"GAD7", date:"2025-11-01", score:14, completed:true },
    { id:"a3",  clientId:"cl_a", type:"PHQ9", date:"2025-11-29", score:11, completed:true },
    { id:"a4",  clientId:"cl_a", type:"GAD7", date:"2025-11-29", score:9,  completed:true },
    { id:"a5",  clientId:"cl_a", type:"PHQ9", date:"2026-01-10", score:7,  completed:true },
    { id:"a6",  clientId:"cl_a", type:"GAD7", date:"2026-01-10", score:5,  completed:true },
    { id:"a7",  clientId:"cl_b", type:"PHQ9", date:"2025-11-15", score:12, completed:true },
    { id:"a8",  clientId:"cl_b", type:"GAD7", date:"2025-11-15", score:10, completed:true },
    { id:"a9",  clientId:"cl_b", type:"PHQ9", date:"2026-01-10", score:6,  completed:true },
    { id:"a10", clientId:"cl_b", type:"GAD7", date:"2026-01-10", score:4,  completed:true },
    { id:"a11", clientId:"cl_c", type:"PHQ9", date:"2025-12-01", score:14, completed:true },
    { id:"a12", clientId:"cl_c", type:"GAD7", date:"2025-12-01", score:13, completed:true },
    { id:"a13", clientId:"cl_c", type:"PHQ9", date:"2026-01-12", score:9,  completed:true },
    { id:"a14", clientId:"cl_c", type:"GAD7", date:"2026-01-12", score:7,  completed:true },
    { id:"a15", clientId:"cl_d", type:"PHQ9", date:"2025-12-10", score:18, completed:true },
    { id:"a16", clientId:"cl_d", type:"GAD7", date:"2025-12-10", score:15, completed:true },
    { id:"a17", clientId:"cl_d", type:"PHQ9", date:"2026-01-14", score:13, completed:true },
    { id:"a18", clientId:"cl_d", type:"GAD7", date:"2026-01-14", score:10, completed:true },
    { id:"a19", clientId:"cl_e", type:"PHQ9", date:"2026-01-05", score:10, completed:true },
    { id:"a20", clientId:"cl_e", type:"GAD7", date:"2026-01-05", score:8,  completed:true },
    { id:"a21", clientId:"cl_e", type:"PHQ9", date:"2026-02-25", score:5,  completed:true },
    { id:"a22", clientId:"cl_e", type:"GAD7", date:"2026-02-25", score:3,  completed:true },
  ],
  adminFees: [
    { id:"af1", employerId:"e1", feeCents:500000, periodLabel:"Jan 2025 – Jan 2026", invoiceDate:"2025-01-15", dueDate:"2025-02-15", paidDate:"2025-02-10", status:"paid",    notes:"Annual admin fee — Year 1" },
    { id:"af2", employerId:"e1", feeCents:500000, periodLabel:"Jan 2026 – Jan 2027", invoiceDate:"2026-01-15", dueDate:"2026-02-15", paidDate:"",          status:"sent",    notes:"Annual admin fee — Year 2" },
    { id:"af3", employerId:"e2", feeCents:750000, periodLabel:"Mar 2025 – Mar 2026", invoiceDate:"2025-03-01", dueDate:"2025-04-01", paidDate:"2025-03-28", status:"paid",    notes:"Annual admin fee — Year 1" },
    { id:"af4", employerId:"e2", feeCents:750000, periodLabel:"Mar 2026 – Mar 2027", invoiceDate:"2026-03-01", dueDate:"2026-04-01", paidDate:"",          status:"draft",   notes:"Annual admin fee — Year 2" },
    { id:"af5", employerId:"e3", feeCents:350000, periodLabel:"Jun 2025 – Jun 2026", invoiceDate:"2025-06-01", dueDate:"2025-07-01", paidDate:"",          status:"overdue", notes:"Annual admin fee — Year 1" },
  ],
  invoices: [
    { id:"inv1", employerId:"e1", period:"Jan 2026", totalCents:900000, status:"paid" },
    { id:"inv2", employerId:"e2", period:"Jan 2026", totalCents:420000, status:"paid" },
    { id:"inv3", employerId:"e3", period:"Jan 2026", totalCents:480000, status:"overdue" },
    { id:"inv4", employerId:"e1", period:"Feb 2026", totalCents:900000, status:"sent" },
    { id:"inv5", employerId:"e2", period:"Feb 2026", totalCents:420000, status:"paid" },
    { id:"inv6", employerId:"e3", period:"Feb 2026", totalCents:480000, status:"draft" },
    { id:"inv7", employerId:"e1", period:"Mar 2026", totalCents:900000, status:"draft" },
    { id:"inv8", employerId:"e2", period:"Mar 2026", totalCents:420000, status:"draft" },
    { id:"inv9", employerId:"e3", period:"Mar 2026", totalCents:480000, status:"draft" },
  ],
  referrals: [
    { id:"ref1", anonId:"LTA-0041", employerId:"e1", practiceId:"p1", clinicianId:"cl1", presNeed:"Anxiety", location:"New York, NY", state:"New York", sessionType:"individual", modality:"in-person", clientEmail:"client1@email.com", clientPhone:"", status:"active", createdAt:"2025-11-01", scheduledAt:"2025-11-03", notes:"Referred by HR",
      practiceConfirmedAt:"2025-11-01", practiceContactedAt:"2025-11-02", practiceSessionBookedAt:"2025-11-03" },
    { id:"ref2", anonId:"LTA-0043", employerId:"e2", practiceId:"p2", clinicianId:"cl3", presNeed:"Couples / Relationship", location:"New York, NY", state:"New York", sessionType:"couple", modality:"in-person", clientEmail:"client3@email.com", clientPhone:"", status:"active", createdAt:"2025-12-01", scheduledAt:"2025-12-04", notes:"",
      practiceConfirmedAt:"2025-12-01", practiceContactedAt:"2025-12-02", practiceSessionBookedAt:"2025-12-04" },
    { id:"ref3", anonId:"LTA-0046", employerId:"e2", practiceId:"p7", clinicianId:"cl8", presNeed:"Depression", location:"Washington, DC", state:"Washington DC", sessionType:"individual", modality:"virtual", clientEmail:"client6@email.com", clientPhone:"", status:"scheduled", createdAt:"2026-01-10", scheduledAt:"2026-01-13", notes:"Partner track associate",
      practiceConfirmedAt:"2026-01-10", practiceContactedAt:"2026-01-11", practiceSessionBookedAt:"" },
    { id:"ref4", anonId:"LTA-0049", employerId:"e1", practiceId:"",   clinicianId:"",    presNeed:"Psychiatry / Medication", location:"Philadelphia, PA", state:"Texas", sessionType:"psychiatry", modality:"virtual", clientEmail:"client9@email.com", clientPhone:"555-0199", status:"pending", createdAt:"2026-03-20", scheduledAt:"", notes:"Client based in Texas — PSYPACT virtual",
      practiceConfirmedAt:"", practiceContactedAt:"", practiceSessionBookedAt:"" },
  ],
  payouts: [
    { id:"pay1",  practiceId:"p1", period:"Jan 2026", grossCents:500000, marginCents:100000, netCents:400000, status:"paid" },
    { id:"pay2",  practiceId:"p2", period:"Jan 2026", grossCents:420000, marginCents:84000,  netCents:336000, status:"paid" },
    { id:"pay3",  practiceId:"p3", period:"Jan 2026", grossCents:400000, marginCents:60000,  netCents:340000, status:"paid" },
    { id:"pay4",  practiceId:"p7", period:"Jan 2026", grossCents:400000, marginCents:80000,  netCents:320000, status:"paid" },
    { id:"pay5",  practiceId:"p4", period:"Jan 2026", grossCents:300000, marginCents:60000,  netCents:240000, status:"paid" },
    { id:"pay6",  practiceId:"p1", period:"Feb 2026", grossCents:500000, marginCents:100000, netCents:400000, status:"processing" },
    { id:"pay7",  practiceId:"p2", period:"Feb 2026", grossCents:420000, marginCents:84000,  netCents:336000, status:"paid" },
    { id:"pay8",  practiceId:"p3", period:"Feb 2026", grossCents:400000, marginCents:60000,  netCents:340000, status:"pending" },
    { id:"pay9",  practiceId:"p7", period:"Feb 2026", grossCents:400000, marginCents:80000,  netCents:320000, status:"paid" },
    { id:"pay10", practiceId:"p4", period:"Feb 2026", grossCents:300000, marginCents:60000,  netCents:240000, status:"pending" },
  ],
};

const fmt = (cents) => `$${(cents/100).toLocaleString("en-US",{minimumFractionDigits:0})}`;

// All 50 states + DC
const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","Washington DC",
  "West Virginia","Wisconsin","Wyoming"
];

// PSYPACT participating states (as of 2025 — clinicians need APIT to practice)
const PSYPACT_STATES = new Set([
  "Alabama","Arizona","Arkansas","Colorado","Connecticut","Delaware","District of Columbia",
  "Florida","Georgia","Idaho","Illinois","Indiana","Kansas","Kentucky","Maine",
  "Maryland","Michigan","Minnesota","Missouri","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","North Carolina","Ohio","Oklahoma","Pennsylvania",
  "Rhode Island","South Carolina","Tennessee","Texas","Utah","Virginia",
  "Washington","Washington DC","West Virginia","Wisconsin"
]);

// Lumina in-person practice states
const LUMINA_INPERSON_STATES = new Set(["New York","Pennsylvania","District of Columbia","California"]);

const getServiceability = (state, modality) => {
  if (!state) return null;
  if (modality === "in-person") {
    return LUMINA_INPERSON_STATES.has(state)
      ? { ok: true,  label: "In-person available", color: C.tealGreen }
      : { ok: false, label: "No in-person practice in this state — consider virtual", color: "#D4721A" };
  }
  // virtual
  return PSYPACT_STATES.has(state)
    ? { ok: true,  label: "PSYPACT state — virtual eligible", color: C.tealGreen }
    : { ok: false, label: "Non-PSYPACT state — verify licensure before referring", color: "#D4721A" };
};
const BADGE = {
  paid:       { bg:"#E6F4F1", color:"#1D6B6B", border:"#2A7F7F" },
  sent:       { bg:"#E8F0F7", color:"#1F4D78", border:"#2E74B5" },
  draft:      { bg:C.cream,   color:C.textMid,  border:C.border  },
  overdue:    { bg:"#FCE8E8", color:"#B03A3A",  border:"#D9534F" },
  processing: { bg:"#FFF3E0", color:"#8B5E00",  border:"#F0A500" },
  pending:    { bg:C.cream,   color:C.textMid,  border:C.border  },
  active:     { bg:"#E6F4F1", color:"#1D6B6B",  border:"#2A7F7F" },
  discharged: { bg:C.cream,   color:C.textMid,  border:C.border  },
};
const Badge = ({ status }) => {
  const s = BADGE[status] || BADGE.draft;
  return <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:3, textTransform:"capitalize" }}>{status}</span>;
};

const ModalityBadge = ({ modality }) => {
  if (!modality) return null;
  const ip = modality === "in-person";
  return (
    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:3,
      background: ip ? "#E6F4F1" : "#EEF2FF",
      color:      ip ? "#1D6B6B" : "#3730A3",
      border:     `1px solid ${ip ? "#2A7F7F" : "#818CF8"}`,
    }}>
      {ip ? "🏢 In-Person" : "💻 Virtual"}
    </span>
  );
};
const phqSev = (s) => s<=4?{l:"Minimal",c:"#1D9E75"}:s<=9?{l:"Mild",c:"#E6A817"}:s<=14?{l:"Moderate",c:"#D4721A"}:s<=19?{l:"Mod-Severe",c:"#C0392B"}:{l:"Severe",c:"#922B21"};
const gadSev = (s) => s<=4?{l:"Minimal",c:"#1D9E75"}:s<=9?{l:"Mild",c:"#E6A817"}:s<=14?{l:"Moderate",c:"#D4721A"}:{l:"Severe",c:"#C0392B"};

// ── UI atoms ─────────────────────────────────────────────────────────────────
const card = { background:C.white, border:`1px solid ${C.border}`, borderRadius:5 };

const SH = ({ title, sub, action }) => (
  <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginBottom:20 }}>
    <div>
      <h2 style={{ fontSize:20, fontWeight:700, color:C.textDark, margin:0 }}>{title}</h2>
      {sub && <p style={{ fontSize:13, color:C.textMid, margin:"3px 0 0" }}>{sub}</p>}
    </div>
    {action}
  </div>
);

const Btn = ({ children, onClick, disabled, variant="primary", small }) => {
  const vs = {
    primary:   { background:C.teal,    color:C.white,   border:`1px solid ${C.tealDark}` },
    secondary: { background:C.white,   color:C.teal,    border:`1px solid ${C.teal}` },
    ghost:     { background:"transparent", color:C.teal, border:`1px solid ${C.tealMid}` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...vs[variant], fontSize:small?11:13, fontWeight:600, padding:small?"4px 10px":"8px 16px", borderRadius:4, cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.4:1, fontFamily:"Arial,sans-serif" }}>{children}</button>;
};

const Inp = ({ label, ...p }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{label}</label>
    <input style={{ width:"100%", boxSizing:"border-box", border:`1px solid ${C.border}`, borderRadius:4, padding:"8px 10px", fontSize:13, color:C.textDark, fontFamily:"Arial,sans-serif", outline:"none" }} {...p} />
  </div>
);

const Sel = ({ label, options, ...p }) => (
  <div style={{ marginBottom:13 }}>
    <label style={{ display:"block", fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{label}</label>
    <select style={{ width:"100%", border:`1px solid ${C.border}`, borderRadius:4, padding:"8px 10px", fontSize:13, color:C.textDark, fontFamily:"Arial,sans-serif", background:C.white, outline:"none" }} {...p}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(29,107,107,0.25)", backdropFilter:"blur(3px)" }}>
    <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, width:"100%", maxWidth:460, maxHeight:"88vh", overflowY:"auto", boxShadow:"0 12px 48px rgba(29,107,107,0.2)" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", borderBottom:`1px solid ${C.border}`, background:C.cream }}>
        <span style={{ fontWeight:700, fontSize:14, color:C.textDark }}>{title}</span>
        <button onClick={onClose} style={{ background:"none", border:"none", fontSize:20, color:C.textMid, cursor:"pointer" }}>×</button>
      </div>
      <div style={{ padding:18 }}>{children}</div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, accent=C.teal }) => (
  <div style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:"16px 18px", borderTop:`3px solid ${accent}` }}>
    <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>{label}</div>
    <div style={{ fontSize:22, fontWeight:700, color:C.textDark }}>{value}</div>
    {sub && <div style={{ fontSize:11, color:C.textMid, marginTop:3 }}>{sub}</div>}
  </div>
);

const TH = { padding:"9px 14px", fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`, background:C.cream, whiteSpace:"nowrap" };
const TD = (right) => ({ padding:"10px 14px", textAlign:right?"right":"left", color:C.textDark, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" });

const Bar = ({ v, max, color=C.teal }) => (
  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
    <div style={{ flex:1, background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
      <div style={{ width:`${Math.min(100,(v/max)*100)}%`, height:"100%", background:color, borderRadius:2 }} />
    </div>
    <span style={{ fontSize:11, fontFamily:"monospace", color:C.textMid, minWidth:18, textAlign:"right" }}>{v}</span>
  </div>
);

const Note = ({ children }) => (
  <div style={{ background:`${C.teal}0f`, border:`1px solid ${C.teal}35`, borderRadius:4, padding:"8px 12px", fontSize:12, color:C.teal, marginBottom:14 }}>{children}</div>
);

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
const DashboardView = ({ db, setView }) => {
  const totalRev    = db.invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.totalCents,0);
  const pendRev     = db.invoices.filter(i=>["sent","draft"].includes(i.status)).reduce((s,i)=>s+i.totalCents,0);
  const margin      = db.payouts.filter(p=>p.status==="paid").reduce((s,p)=>s+p.marginCents,0);
  const clients     = db.clients.filter(c=>c.status==="active").length;
  const mtd         = db.sessions.filter(s=>s.date.startsWith("2026-03")).length;
  const overdue     = db.invoices.filter(i=>i.status==="overdue");
  const pendPay     = db.payouts.filter(p=>["pending","processing"].includes(p.status));
  const pendRef     = (db.referrals||[]).filter(r=>r.status==="pending").length;
  const adminPaid   = (db.adminFees||[]).filter(f=>f.status==="paid").reduce((s,f)=>s+f.feeCents,0);
  const adminOverdue= (db.adminFees||[]).filter(f=>f.status==="overdue");
  const adminSent   = (db.adminFees||[]).filter(f=>f.status==="sent");
  const totalSess   = db.sessions.length;
  const byPrac      = db.practices.map(p=>({ name:p.name, rev:db.payouts.filter(x=>x.practiceId===p.id&&x.status==="paid").reduce((s,x)=>s+x.netCents,0) })).sort((a,b)=>b.rev-a.rev);
  const byType      = ["individual","couple","psychiatry"].map(t=>({ t, n:db.sessions.filter(s=>s.type===t).length }));
  return (
    <div>
      <SH title="Operations Dashboard" sub="Lumina Therapy Alliance · March 2026" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:22 }}>
        <StatCard label="Session Revenue"  value={fmt(totalRev)}   sub="Paid invoices"     accent={C.teal} />
        <StatCard label="Admin Fees Paid"  value={fmt(adminPaid)}  sub="Annual fees YTD"   accent={C.tealGreen} />
        <StatCard label="Lumina Margin"    value={fmt(margin)}     sub="Retained YTD"      accent={C.tealMid} />
        <StatCard label="Sessions MTD"     value={mtd}             sub="March 2026"         accent={C.tealDark} />
      </div>

      {pendRef>0&&<div onClick={()=>setView("referrals")} style={{background:`${C.teal}0d`,border:`1px solid ${C.teal}40`,borderRadius:4,padding:"10px 14px",fontSize:13,color:C.teal,marginBottom:8,cursor:"pointer",fontWeight:600}}>
        📋 {pendRef} pending referral{pendRef>1?"s":""} awaiting practice match — <span style={{textDecoration:"underline"}}>view referrals →</span>
      </div>}

      {[...adminOverdue.map(f=>({ msg:<>⚠ Admin fee overdue — <strong>{db.employers.find(e=>e.id===f.employerId)?.name}</strong> · {f.periodLabel} · {fmt(f.feeCents)}</>, bg:"#FCE8E8",color:"#B03A3A",border:"#D9534F" })),
        ...adminSent.map(f=>({ msg:<>💰 Admin fee awaiting payment — <strong>{db.employers.find(e=>e.id===f.employerId)?.name}</strong> · {f.periodLabel} · {fmt(f.feeCents)} · Due {f.dueDate}</>, bg:"#FFF3E0",color:"#8B5E00",border:"#F0A500" })),
        ...overdue.map(inv=>({ msg:<>⚠ Session invoice overdue — <strong>{db.employers.find(e=>e.id===inv.employerId)?.name}</strong> · {inv.period} · {fmt(inv.totalCents)}</>, bg:"#FCE8E8",color:"#B03A3A",border:"#D9534F" })),
        ...pendPay.map(pay=>({ msg:<>⏳ Payout {pay.status} — <strong>{db.practices.find(p=>p.id===pay.practiceId)?.name}</strong> · {pay.period} · {fmt(pay.netCents)}</>, bg:"#FFF3E0",color:"#8B5E00",border:"#F0A500" }))
      ].map((a,i)=>(
        <div key={i} style={{ background:a.bg, border:`1px solid ${a.border}`, borderRadius:4, padding:"10px 14px", fontSize:13, color:a.color, marginBottom:8 }}>{a.msg}</div>
      ))}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:18 }}>
        <div style={{ ...card, padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Net Revenue by Practice</div>
          {byPrac.map(p=>(
            <div key={p.name} style={{ marginBottom:11 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4, color:C.textDark }}>
                <span>{p.name}</span><span style={{ fontFamily:"monospace", fontWeight:700 }}>{fmt(p.rev)}</span>
              </div>
              <div style={{ background:C.cream, borderRadius:2, height:5, border:`1px solid ${C.border}` }}>
                <div style={{ width:`${byPrac[0].rev?(p.rev/byPrac[0].rev)*100:0}%`, height:"100%", background:C.teal, borderRadius:2 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding:18 }}>
          <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:14 }}>Sessions by Type</div>
          {byType.map(({t,n})=>(
            <div key={t} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:11 }}>
              <div style={{ width:76, fontSize:12, color:C.textDark, textTransform:"capitalize" }}>{t}</div>
              <div style={{ flex:1 }}><Bar v={n} max={totalSess} /></div>
            </div>
          ))}
          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", fontSize:12, color:C.textMid }}>
            <span>Total sessions</span><span style={{ fontFamily:"monospace", fontWeight:700, color:C.textDark }}>{totalSess}</span>
          </div>
        </div>
      </div>

      <div style={card}>
        <div style={{ padding:"12px 14px", borderBottom:`1px solid ${C.border}`, background:C.cream }}>
          <span style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em" }}>Employer Summary</span>
        </div>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{[["Employer"],["Billing"],["Sessions",true],["Revenue",true],["Latest Invoice"]].map(([h,r],i)=><th key={i} style={{...TH,textAlign:r?"right":"left"}}>{h}</th>)}</tr></thead>
          <tbody>{db.employers.map(emp=>{
            const sessions = db.sessions.filter(s=>s.employerId===emp.id).length;
            const revenue  = db.invoices.filter(i=>i.employerId===emp.id&&i.status==="paid").reduce((s,i)=>s+i.totalCents,0);
            const inv = db.invoices.filter(i=>i.employerId===emp.id).sort((a,b)=>b.period.localeCompare(a.period))[0];
            return <tr key={emp.id}>
              <td style={TD(false)}><strong>{emp.name}</strong></td>
              <td style={{...TD(false),color:C.textMid,textTransform:"capitalize"}}>{emp.billing}</td>
              <td style={{...TD(true),fontFamily:"monospace"}}>{sessions}</td>
              <td style={{...TD(true),fontFamily:"monospace",color:C.tealDark,fontWeight:700}}>{fmt(revenue)}</td>
              <td style={TD(false)}>{inv?<Badge status={inv.status}/>:"—"}</td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </div>
  );
};

// ── Employers ────────────────────────────────────────────────────────────────
const EmployersView = ({ db, setDb }) => {
  const [modal,setModal]       = useState(false);
  const [feeModal,setFeeModal] = useState(null); // employerId
  const [invModal,setInvModal] = useState(null); // employerId — add admin invoice
  const [form,setForm]         = useState({ name:"",contact:"",email:"",billing:"invoice",adminFeeCents:"",adminFeeAnchorMonth:"1" });
  const [invForm,setInvForm]   = useState({ feeCents:"",periodLabel:"",invoiceDate:"",dueDate:"",notes:"" });
  const [feeForm,setFeeForm]   = useState({ adminFeeCents:"",adminFeeAnchorMonth:"1" });

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const addEmployer = () => {
    setDb(d=>({...d, employers:[...d.employers,{
      id:`e${Date.now()}`, name:form.name, contact:form.contact, email:form.email,
      billing:form.billing, active:true,
      adminFeeCents: form.adminFeeCents ? parseInt(form.adminFeeCents)*100 : 0,
      adminFeeAnchorMonth: parseInt(form.adminFeeAnchorMonth)
    }]}));
    setModal(false);
    setForm({name:"",contact:"",email:"",billing:"invoice",adminFeeCents:"",adminFeeAnchorMonth:"1"});
  };

  const saveAdminFee = () => {
    setDb(d=>({...d, employers:d.employers.map(e=>e.id===feeModal?{...e,
      adminFeeCents:parseInt(feeForm.adminFeeCents)*100,
      adminFeeAnchorMonth:parseInt(feeForm.adminFeeAnchorMonth)
    }:e)}));
    setFeeModal(null);
  };

  const addAdminInvoice = () => {
    const inv = {
      id:`af${Date.now()}`, employerId:invModal,
      feeCents: parseInt(invForm.feeCents)*100,
      periodLabel: invForm.periodLabel,
      invoiceDate: invForm.invoiceDate,
      dueDate: invForm.dueDate,
      paidDate: "",
      status: "draft",
      notes: invForm.notes
    };
    setDb(d=>({...d, adminFees:[...(d.adminFees||[]),inv]}));
    setInvModal(null);
    setInvForm({feeCents:"",periodLabel:"",invoiceDate:"",dueDate:"",notes:""});
  };

  const updateAdminFeeStatus = (id, status) => {
    setDb(d=>({...d, adminFees:d.adminFees.map(f=>f.id===id?{
      ...f, status,
      paidDate: status==="paid" ? new Date().toISOString().split("T")[0] : f.paidDate
    }:f)}));
  };

  // next renewal date based on anchor month
  const nextRenewal = (anchorMonth) => {
    if (!anchorMonth) return "—";
    const now = new Date();
    const thisYear = now.getFullYear();
    const anchor = new Date(thisYear, anchorMonth-1, 1);
    if (anchor <= now) anchor.setFullYear(thisYear+1);
    return anchor.toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000*60*60*24));
    return diff;
  };

  return <div>
    <SH title="Employers" sub={`${db.employers.length} accounts`} action={<Btn onClick={()=>setModal(true)}>+ Add Employer</Btn>}/>

    <div style={{display:"grid",gap:16}}>
      {db.employers.map(emp=>{
        const contracts   = db.contracts.filter(c=>c.employerId===emp.id&&c.active);
        const sessions    = db.sessions.filter(s=>s.employerId===emp.id).length;
        const revenue     = db.invoices.filter(i=>i.employerId===emp.id&&i.status==="paid").reduce((s,i)=>s+i.totalCents,0);
        const empAdminFees = (db.adminFees||[]).filter(f=>f.employerId===emp.id).sort((a,b)=>b.invoiceDate.localeCompare(a.invoiceDate));
        const latestAdminFee = empAdminFees[0];
        const totalAdminPaid = empAdminFees.filter(f=>f.status==="paid").reduce((s,f)=>s+f.feeCents,0);
        const renewal = nextRenewal(emp.adminFeeAnchorMonth);
        const renewalDays = emp.adminFeeAnchorMonth ? daysUntil(new Date(new Date().getFullYear()+(new Date().getMonth()+1>=emp.adminFeeAnchorMonth?1:0),emp.adminFeeAnchorMonth-1,1).toISOString().split("T")[0]) : null;

        return <div key={emp.id} style={{...card,overflow:"hidden"}}>
          {/* Header */}
          <div style={{padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.textDark}}>{emp.name}</div>
              <div style={{fontSize:12,color:C.textMid,marginTop:2}}>{emp.contact} · {emp.email}</div>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <span style={{fontSize:10,background:C.cream,border:`1px solid ${C.border}`,color:C.textMid,padding:"3px 7px",borderRadius:3,textTransform:"uppercase",fontWeight:700}}>{emp.billing}</span>
              <Badge status={emp.active?"active":"discharged"}/>
            </div>
          </div>

          {/* Stats row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
            {[["Contracts",contracts.length],["Sessions",sessions],["Session Revenue",fmt(revenue)],["Admin Fees Paid",fmt(totalAdminPaid)]].map(([l,v],i)=>(
              <div key={l} style={{padding:"12px 16px",borderRight:i<3?`1px solid ${C.border}`:"none"}}>
                <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{l}</div>
                <div style={{fontSize:15,fontWeight:700,color:l.includes("Revenue")||l.includes("Admin")?C.tealDark:C.textDark,fontFamily:"monospace"}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Admin fee panel */}
          <div style={{padding:"14px 18px",background:C.bgPage,borderBottom:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em"}}>Annual Administrative Fee</div>
              <div style={{display:"flex",gap:7}}>
                <Btn variant="ghost" small onClick={()=>{setFeeForm({adminFeeCents:String((emp.adminFeeCents||0)/100),adminFeeAnchorMonth:String(emp.adminFeeAnchorMonth||1)});setFeeModal(emp.id);}}>Edit Fee</Btn>
                <Btn variant="ghost" small onClick={()=>{setInvForm({feeCents:String((emp.adminFeeCents||0)/100),periodLabel:"",invoiceDate:new Date().toISOString().split("T")[0],dueDate:"",notes:"Annual admin fee"});setInvModal(emp.id);}}>+ Invoice</Btn>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:empAdminFees.length?14:0}}>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>Annual Fee</div>
                <div style={{fontSize:16,fontWeight:700,color:emp.adminFeeCents?C.tealDark:C.border,fontFamily:"monospace"}}>{emp.adminFeeCents?fmt(emp.adminFeeCents):"Not set"}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>Renewal Month</div>
                <div style={{fontSize:14,fontWeight:700,color:C.textDark}}>{emp.adminFeeAnchorMonth?MONTHS[emp.adminFeeAnchorMonth-1]:"Not set"}</div>
              </div>
              <div>
                <div style={{fontSize:9,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>Next Renewal</div>
                <div style={{fontSize:13,fontWeight:700,color:renewalDays!==null&&renewalDays<=60?"#D4721A":C.textDark}}>
                  {renewal}
                  {renewalDays!==null&&renewalDays<=60&&<span style={{fontSize:10,marginLeft:6,color:"#D4721A"}}>({renewalDays}d)</span>}
                </div>
              </div>
            </div>

            {/* Admin fee invoice history */}
            {empAdminFees.length>0&&<div>
              <div style={{fontSize:9,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>Invoice History</div>
              <div style={{display:"grid",gap:6}}>
                {empAdminFees.map(f=>{
                  const overdueDays = f.status==="sent"&&f.dueDate ? daysUntil(f.dueDate) : null;
                  return <div key={f.id} style={{display:"flex",alignItems:"center",gap:12,background:C.white,border:`1px solid ${C.border}`,borderRadius:4,padding:"9px 12px",flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontSize:12,fontWeight:700,color:C.textDark,fontFamily:"monospace"}}>{fmt(f.feeCents)}</div>
                      <div style={{fontSize:10,color:C.textMid,marginTop:1}}>{f.periodLabel}</div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:90,textAlign:"center"}}>
                      <div>Invoiced: <span style={{fontFamily:"monospace",color:C.textDark}}>{f.invoiceDate||"—"}</span></div>
                      <div>Due: <span style={{fontFamily:"monospace",color:overdueDays!==null&&overdueDays<0?"#B03A3A":C.textDark}}>{f.dueDate||"—"}</span></div>
                    </div>
                    <div style={{fontSize:11,color:C.textMid,minWidth:80}}>
                      {f.paidDate&&<div>Paid: <span style={{fontFamily:"monospace",color:C.tealDark}}>{f.paidDate}</span></div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <Badge status={f.status}/>
                      {f.status==="draft"   && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,"sent")}>Send</Btn>}
                      {f.status==="sent"    && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,"paid")}>Mark Paid</Btn>}
                      {f.status==="overdue" && <Btn variant="ghost" small onClick={()=>updateAdminFeeStatus(f.id,"paid")}>Mark Paid</Btn>}
                    </div>
                    {f.notes&&<div style={{width:"100%",fontSize:10,color:C.textMid,fontStyle:"italic",paddingTop:4,borderTop:`1px solid ${C.border}`,marginTop:4}}>{f.notes}</div>}
                  </div>;
                })}
              </div>
            </div>}
            {empAdminFees.length===0&&<div style={{fontSize:12,color:C.border,fontStyle:"italic"}}>No admin fee invoices yet — click "+ Invoice" to create one.</div>}
          </div>

          {/* Contracts */}
          {contracts.length>0&&<div style={{padding:"12px 18px"}}>
            <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Active Session Contracts</div>
            {contracts.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textMid,marginBottom:3}}>
              <span>{db.practices.find(p=>p.id===c.practiceId)?.name}</span>
              <span style={{fontFamily:"monospace",color:C.textDark}}>{c.label}</span>
            </div>)}
          </div>}
        </div>;
      })}
    </div>

    {/* Add Employer modal */}
    {modal&&<Modal title="Add Employer" onClose={()=>setModal(false)}>
      <Inp label="Company Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <Inp label="Contact Name" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))}/>
      <Inp label="Contact Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
      <Sel label="Session Billing Method" value={form.billing} onChange={e=>setForm(f=>({...f,billing:e.target.value}))}
        options={[{value:"invoice",label:"Invoice (manual)"},{value:"ach",label:"ACH Auto-charge (Stripe)"}]}/>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:14,marginTop:2,marginBottom:14}}>
        <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Annual Administrative Fee</div>
        <Inp label="Annual Admin Fee ($)" type="number" value={form.adminFeeCents} onChange={e=>setForm(f=>({...f,adminFeeCents:e.target.value}))} placeholder="5000"/>
        <Sel label="Renewal Month" value={form.adminFeeAnchorMonth} onChange={e=>setForm(f=>({...f,adminFeeAnchorMonth:e.target.value}))}
          options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      </div>
      <Btn onClick={addEmployer} disabled={!form.name}>Add Employer</Btn>
    </Modal>}

    {/* Edit Admin Fee modal */}
    {feeModal&&<Modal title={`Admin Fee — ${db.employers.find(e=>e.id===feeModal)?.name}`} onClose={()=>setFeeModal(null)}>
      <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:"10px 12px",fontSize:12,color:C.textMid,marginBottom:16,lineHeight:1.6}}>
        The annual administrative fee is billed once per year on the renewal month. This is separate from monthly session-based invoices.
      </div>
      <Inp label="Annual Admin Fee ($)" type="number" value={feeForm.adminFeeCents} onChange={e=>setFeeForm(f=>({...f,adminFeeCents:e.target.value}))} placeholder="5000"/>
      <Sel label="Renewal Month" value={feeForm.adminFeeAnchorMonth} onChange={e=>setFeeForm(f=>({...f,adminFeeAnchorMonth:e.target.value}))}
        options={MONTHS.map((m,i)=>({value:String(i+1),label:m}))}/>
      <Btn onClick={saveAdminFee} disabled={!feeForm.adminFeeCents}>Save</Btn>
    </Modal>}

    {/* Add Admin Fee Invoice modal */}
    {invModal&&<Modal title={`New Admin Fee Invoice — ${db.employers.find(e=>e.id===invModal)?.name}`} onClose={()=>setInvModal(null)}>
      <Inp label="Fee Amount ($)" type="number" value={invForm.feeCents} onChange={e=>setInvForm(f=>({...f,feeCents:e.target.value}))} placeholder="5000"/>
      <Inp label="Period Label" value={invForm.periodLabel} onChange={e=>setInvForm(f=>({...f,periodLabel:e.target.value}))} placeholder="Jan 2026 – Jan 2027"/>
      <Inp label="Invoice Date" type="date" value={invForm.invoiceDate} onChange={e=>setInvForm(f=>({...f,invoiceDate:e.target.value}))}/>
      <Inp label="Due Date" type="date" value={invForm.dueDate} onChange={e=>setInvForm(f=>({...f,dueDate:e.target.value}))}/>
      <Inp label="Notes (optional)" value={invForm.notes} onChange={e=>setInvForm(f=>({...f,notes:e.target.value}))} placeholder="Annual admin fee — Year 2"/>
      <Btn onClick={addAdminInvoice} disabled={!invForm.feeCents||!invForm.periodLabel||!invForm.invoiceDate}>Create Invoice</Btn>
    </Modal>}
  </div>;
};

// ── Practices ────────────────────────────────────────────────────────────────
const PracticesView = ({ db, setDb }) => {
  const [modal,setModal]=useState(false);
  const [cModal,setCModal]=useState(null);
  const [rModal,setRModal]=useState(null); // rate editing modal
  const [form,setForm]=useState({name:"",contact:"",email:"",city:""});
  const [cForm,setCForm]=useState({employerId:"",type:"per_employee",rate:"",units:"",margin:"20"});
  const [rForm,setRForm]=useState({rateIndividual:"",rateCouple:"",ratePsychiatry:""});

  const openRates=(prac)=>{
    setRForm({ rateIndividual: String((prac.rateIndividual||0)/100), rateCouple: String((prac.rateCouple||0)/100), ratePsychiatry: String((prac.ratePsychiatry||0)/100) });
    setRModal(prac.id);
  };
  const saveRates=()=>{
    setDb(d=>({...d, practices:d.practices.map(p=>p.id===rModal?{...p, rateIndividual:Math.round(parseFloat(rForm.rateIndividual||0)*100), rateCouple:Math.round(parseFloat(rForm.rateCouple||0)*100), ratePsychiatry:Math.round(parseFloat(rForm.ratePsychiatry||0)*100)}:p)}));
    setRModal(null);
  };
  const addP=()=>{ setDb(d=>({...d,practices:[...d.practices,{id:`p${Date.now()}`,...form,active:true,rateIndividual:20000,rateCouple:30000,ratePsychiatry:35000}]})); setModal(false); setForm({name:"",contact:"",email:"",city:""}); };
  const addC=()=>{
    const labels={per_employee:`$${cForm.rate}/mo per employee`,per_couple:`$${cForm.rate}/mo per couple`,per_psychiatry_block:`$${cForm.rate}/mo per 2-session block`};
    setDb(d=>({...d,contracts:[...d.contracts,{id:`c${Date.now()}`,practiceId:cModal,employerId:cForm.employerId,type:cForm.type,rate:parseInt(cForm.rate)*100,units:parseInt(cForm.units),margin:parseInt(cForm.margin),active:true,label:labels[cForm.type]}]}));
    setCModal(null);
  };

  return <div>
    <SH title="Practices" sub={`${db.practices.length} in network`} action={<Btn onClick={()=>setModal(true)}>+ Add Practice</Btn>}/>
    <div style={{display:"grid",gap:14}}>
      {db.practices.map(prac=>{
        const clins=db.clinicians.filter(c=>c.practiceId===prac.id);
        const contracts=db.contracts.filter(c=>c.practiceId===prac.id&&c.active);
        const sessions=db.sessions.filter(s=>s.practiceId===prac.id).length;
        const paid=db.payouts.filter(p=>p.practiceId===prac.id&&p.status==="paid").reduce((s,p)=>s+p.netCents,0);
        return <div key={prac.id} style={{...card,padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.textDark}}>{prac.name}</div>
              <div style={{fontSize:12,color:C.textMid,marginTop:2}}>{prac.city}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <Btn variant="ghost" small onClick={()=>openRates(prac)}>Set Rates</Btn>
              <Btn variant="secondary" small onClick={()=>setCModal(prac.id)}>+ Contract</Btn>
            </div>
          </div>

          {/* Session rates row */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:"12px 14px",marginBottom:14}}>
            {[["Individual",prac.rateIndividual],[" Couples",prac.rateCouple],["Psychiatry",prac.ratePsychiatry]].map(([l,r])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{l}</div>
                <div style={{fontSize:16,fontWeight:700,color:r?C.tealDark:C.border,fontFamily:"monospace"}}>{r?fmt(r):"—"}</div>
                <div style={{fontSize:9,color:C.textMid}}>per session</div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,paddingTop:14,borderTop:`1px solid ${C.border}`,marginBottom:14}}>
            {[["Clinicians",clins.length],["Sessions",sessions],["Paid Out",fmt(paid)]].map(([l,v])=>(
              <div key={l}><div style={{fontSize:10,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:3}}>{l}</div>
              <div style={{fontSize:15,fontWeight:700,color:l==="Paid Out"?C.tealDark:C.textDark,fontFamily:"monospace"}}>{v}</div></div>
            ))}
          </div>
          <div style={{fontSize:10,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>Clinicians</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:contracts.length?14:0}}>
            {clins.length>0?clins.map(cl=><span key={cl.id} style={{fontSize:11,background:C.cream,border:`1px solid ${C.border}`,color:C.textDark,padding:"3px 8px",borderRadius:3}}>{cl.name} · {cl.specialty}</span>)
              :<span style={{fontSize:12,color:C.border}}>No clinicians added yet</span>}
          </div>
          {contracts.length>0&&<div style={{paddingTop:14,borderTop:`1px solid ${C.border}`}}>
            <div style={{fontSize:10,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:7}}>Contracts</div>
            {contracts.map(c=><div key={c.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:C.textMid,marginBottom:3}}>
              <span>{db.employers.find(e=>e.id===c.employerId)?.name}</span>
              <span style={{fontFamily:"monospace",color:C.textDark}}>{c.label} · {c.units} units · {c.margin}% margin</span>
            </div>)}
          </div>}
        </div>;
      })}
    </div>

    {/* Add practice modal */}
    {modal&&<Modal title="Add Practice" onClose={()=>setModal(false)}>
      <Inp label="Practice Name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
      <Inp label="City" value={form.city} onChange={e=>setForm(f=>({...f,city:e.target.value}))} placeholder="New York, NY"/>
      <Inp label="Contact Name" value={form.contact} onChange={e=>setForm(f=>({...f,contact:e.target.value}))}/>
      <Inp label="Contact Email" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
      <Btn onClick={addP} disabled={!form.name}>Add Practice</Btn>
    </Modal>}

    {/* Set rates modal */}
    {rModal&&(()=>{
      const prac=db.practices.find(p=>p.id===rModal);
      return <Modal title={`Session Rates — ${prac?.name}`} onClose={()=>setRModal(null)}>
        <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:"10px 12px",fontSize:12,color:C.textMid,marginBottom:16}}>
          These rates are used to auto-populate the session fee when a session is logged for this practice. You can still override per session.
        </div>
        <Inp label="Individual Therapy Rate ($/session)" type="number" value={rForm.rateIndividual} onChange={e=>setRForm(f=>({...f,rateIndividual:e.target.value}))} placeholder="250"/>
        <Inp label="Couples Therapy Rate ($/session)" type="number" value={rForm.rateCouple} onChange={e=>setRForm(f=>({...f,rateCouple:e.target.value}))} placeholder="350"/>
        <Inp label="Psychiatry Rate ($/session)" type="number" value={rForm.ratePsychiatry} onChange={e=>setRForm(f=>({...f,ratePsychiatry:e.target.value}))} placeholder="400"/>
        <Btn onClick={saveRates}>Save Rates</Btn>
      </Modal>;
    })()}

    {/* Add contract modal */}
    {cModal&&<Modal title="Add Contract" onClose={()=>setCModal(null)}>
      <Sel label="Employer" value={cForm.employerId} onChange={e=>setCForm(f=>({...f,employerId:e.target.value}))}
        options={[{value:"",label:"Select employer..."},...db.employers.map(e=>({value:e.id,label:e.name}))]}/>
      <Sel label="Contract Type" value={cForm.type} onChange={e=>setCForm(f=>({...f,type:e.target.value}))}
        options={[{value:"per_employee",label:"Per Employee / Month"},{value:"per_couple",label:"Per Couple / Month"},{value:"per_psychiatry_block",label:"Per Psychiatry Block / Month"}]}/>
      <Inp label="Rate ($)" type="number" value={cForm.rate} onChange={e=>setCForm(f=>({...f,rate:e.target.value}))} placeholder="1000"/>
      <Inp label="Units" type="number" value={cForm.units} onChange={e=>setCForm(f=>({...f,units:e.target.value}))} placeholder="5"/>
      <Inp label="Lumina Margin (%)" type="number" value={cForm.margin} onChange={e=>setCForm(f=>({...f,margin:e.target.value}))} placeholder="20"/>
      <Btn onClick={addC} disabled={!cForm.employerId||!cForm.rate}>Add Contract</Btn>
    </Modal>}
  </div>;
};

// ── Clients ──────────────────────────────────────────────────────────────────
const ClientsView = ({ db, setDb, practiceId = null }) => {
  // practiceId = null means admin view (sees names); set = practice view (sees names for their practice only)
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({clientName:"",employerId:"",practiceId:"",clinicianId:"",state:"",modality:"in-person",email:"",phone:""});
  const filtC=db.clinicians.filter(c=>!form.practiceId||c.practiceId===form.practiceId);
  const add=()=>{
    const anonId=`LTA-${String(db.clients.length+46).padStart(4,"0")}`;
    setDb(d=>({...d,clients:[...d.clients,{id:`cl_${Date.now()}`,anonId,...form,intakeDate:new Date().toISOString().split("T")[0],status:"active"}]}));
    setModal(false); setForm({clientName:"",employerId:"",practiceId:"",clinicianId:"",state:"",modality:"in-person",email:"",phone:""});
  };

  // Filter: if practiceId provided (practice portal), show only that practice's clients
  const visibleClients = practiceId ? db.clients.filter(c=>c.practiceId===practiceId) : db.clients;

  return <div>
    <SH title="Clients" sub={`${visibleClients.length} enrolled`} action={!practiceId&&<Btn onClick={()=>setModal(true)}>+ Add Client</Btn>}/>
    <div style={card}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.cream}}>
          {[["Name"],["Anon ID"],["Employer"],["Practice"],["State"],["Modality"],["Intake"],["Status"],["Assess.",true]].map(([h,r],i)=>(
            <th key={i} style={{...TH,textAlign:r?"right":"left"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{visibleClients.map((c,i)=>{
          const emp=db.employers.find(e=>e.id===c.employerId);
          const prac=db.practices.find(p=>p.id===c.practiceId);
          const sess=db.sessions.filter(s=>s.clientId===c.id).length;
          const lastAssess=db.assessments.filter(a=>a.clientId===c.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
          const daysSince=lastAssess?Math.floor((new Date()-new Date(lastAssess.date))/(1000*60*60*24)):null;
          const assessDue=daysSince===null||daysSince>=28;
          return <tr key={c.id} style={{background:i%2===1?C.bgPage:C.white}}>
            <td style={{...TD(false),fontWeight:600}}>{c.clientName||<span style={{color:C.border}}>—</span>}</td>
            <td style={TD(false)}><span style={{fontFamily:"monospace",color:C.teal,fontWeight:700,fontSize:11}}>{c.anonId}</span></td>
            <td style={{...TD(false),fontSize:12}}>{emp?.name}</td>
            <td style={{...TD(false),fontSize:12}}>{prac?.name}</td>
            <td style={{...TD(false),fontSize:12}}>
              <div>{c.state||"—"}</div>
              {c.state&&c.modality==="virtual"&&<div style={{fontSize:9,marginTop:1,color:PSYPACT_STATES.has(c.state)?C.tealGreen:"#D4721A",fontWeight:700}}>{PSYPACT_STATES.has(c.state)?"PSYPACT":"Non-PSYPACT"}</div>}
            </td>
            <td style={TD(false)}><ModalityBadge modality={c.modality}/></td>
            <td style={{...TD(false),fontFamily:"monospace",fontSize:11,color:C.textMid}}>{c.intakeDate}</td>
            <td style={TD(false)}><Badge status={c.status}/></td>
            <td style={{...TD(true)}}>
              <span style={{fontSize:11,fontFamily:"monospace",color:assessDue?"#D4721A":C.tealGreen,fontWeight:700}}>
                {assessDue?"DUE":daysSince!==null?`${daysSince}d ago`:"—"}
              </span>
            </td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    {modal&&<Modal title="Add Client" onClose={()=>setModal(false)}>
      <Note>Name visible to Lumina admin and assigned practice only. Employers always see anonymous ID.</Note>
      <Inp label="Client Full Name" value={form.clientName} onChange={e=>setForm(f=>({...f,clientName:e.target.value}))} placeholder="First Last"/>
      <Sel label="Employer" value={form.employerId} onChange={e=>setForm(f=>({...f,employerId:e.target.value}))}
        options={[{value:"",label:"Select..."},...db.employers.map(e=>({value:e.id,label:e.name}))]}/>
      <Sel label="Practice" value={form.practiceId} onChange={e=>setForm(f=>({...f,practiceId:e.target.value,clinicianId:""}))}
        options={[{value:"",label:"Select..."},...db.practices.map(p=>({value:p.id,label:p.name}))]}/>
      <Sel label="Clinician" value={form.clinicianId} onChange={e=>setForm(f=>({...f,clinicianId:e.target.value}))}
        options={[{value:"",label:"Select..."},...filtC.map(c=>({value:c.id,label:`${c.name} · ${c.specialty}`}))]}/>
      <div style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Client State</label>
        <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}
          style={{width:"100%",border:`1px solid ${form.state?C.teal:C.border}`,borderRadius:4,padding:"8px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",background:C.white,outline:"none"}}>
          <option value="">Select state...</option>
          {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        {form.state&&form.modality==="virtual"&&<div style={{fontSize:11,marginTop:4,fontWeight:600,color:PSYPACT_STATES.has(form.state)?C.tealGreen:"#D4721A"}}>{PSYPACT_STATES.has(form.state)?"✓ PSYPACT state":"⚠ Non-PSYPACT — verify licensure"}</div>}
      </div>
      <div style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Modality</label>
        <div style={{display:"flex",gap:0,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
          {[["in-person","🏢 In-Person"],["virtual","💻 Virtual"]].map(([v,l])=>(
            <button key={v} onClick={()=>setForm(f=>({...f,modality:v}))} style={{flex:1,padding:"9px 0",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Arial,sans-serif",border:"none",background:form.modality===v?C.teal:C.white,color:form.modality===v?C.white:C.textMid,borderRight:v==="in-person"?`1px solid ${C.border}`:"none"}}>{l}</button>
          ))}
        </div>
      </div>
      <Inp label="Client Email (for assessments)" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/>
      <Inp label="Client Phone (optional)" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
      <Btn onClick={add} disabled={!form.clientName||!form.employerId||!form.practiceId||!form.clinicianId}>Enroll Client</Btn>
    </Modal>}
  </div>;
};

// ── Sessions ─────────────────────────────────────────────────────────────────
const SessionsView = ({ db, setDb }) => {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({clientId:"",clinicianId:"",practiceId:"",employerId:"",date:"",type:"individual",modality:"in-person",feeCents:""});

  const getRate=(practiceId, type)=>{
    const p=db.practices.find(x=>x.id===practiceId);
    if(!p) return "";
    const r={individual:p.rateIndividual, couple:p.rateCouple, psychiatry:p.ratePsychiatry}[type];
    return r ? String(r/100) : "";
  };

  const pick=(clientId)=>{
    const c=db.clients.find(x=>x.id===clientId);
    if(c){
      const fee=getRate(c.practiceId, form.type);
      setForm(f=>({...f,clientId,clinicianId:c.clinicianId,practiceId:c.practiceId,employerId:c.employerId,modality:c.modality||"in-person",feeCents:fee}));
    }
  };
  const changeType=(type)=>{
    const fee=form.practiceId?getRate(form.practiceId,type):"";
    setForm(f=>({...f,type,feeCents:fee}));
  };

  const add=()=>{ setDb(d=>({...d,sessions:[...d.sessions,{id:`s${Date.now()}`,...form,feeCents:Math.round(parseFloat(form.feeCents)*100)}]})); setModal(false); setForm({clientId:"",clinicianId:"",practiceId:"",employerId:"",date:"",type:"individual",modality:"in-person",feeCents:""}); };
  const sorted=[...db.sessions].sort((a,b)=>b.date.localeCompare(a.date));

  const prac=db.practices.find(p=>p.id===form.practiceId);
  const rateHint = prac ? `Practice rate: ${fmt(prac.rateIndividual||0)} / ${fmt(prac.rateCouple||0)} / ${fmt(prac.ratePsychiatry||0)} (individual / couples / psych)` : null;

  return <div>
    <SH title="Sessions" sub={`${db.sessions.length} total logged`} action={<Btn onClick={()=>setModal(true)}>+ Log Session</Btn>}/>
    <div style={card}>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr style={{background:C.cream}}>
          {[["Date"],["Client"],["Employer"],["Practice"],["Type"],["Modality"],["Fee",true]].map(([h,r],i)=>(
            <th key={i} style={{...TH,textAlign:r?"right":"left"}}>{h}</th>
          ))}
        </tr></thead>
        <tbody>{sorted.map((s,i)=>{
          const cl=db.clients.find(c=>c.id===s.clientId);
          const emp=db.employers.find(e=>e.id===s.employerId);
          const prac=db.practices.find(p=>p.id===s.practiceId);
          return <tr key={s.id} style={{background:i%2===1?C.bgPage:C.white}}>
            <td style={{...TD(false),fontFamily:"monospace",fontSize:12,color:C.textMid}}>{s.date}</td>
            <td style={TD(false)}><span style={{fontFamily:"monospace",color:C.teal,fontWeight:700,fontSize:12}}>{cl?.anonId}</span></td>
            <td style={{...TD(false),fontSize:13}}>{emp?.name}</td>
            <td style={{...TD(false),fontSize:13}}>{prac?.name}</td>
            <td style={{...TD(false),textTransform:"capitalize",color:C.textMid,fontSize:13}}>{s.type}</td>
            <td style={TD(false)}><ModalityBadge modality={s.modality}/></td>
            <td style={{...TD(true),fontFamily:"monospace",color:C.tealDark,fontWeight:700}}>{fmt(s.feeCents)}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
    {modal&&<Modal title="Log Session" onClose={()=>setModal(false)}>
      <Sel label="Client (Anonymous ID)" value={form.clientId} onChange={e=>pick(e.target.value)}
        options={[{value:"",label:"Select client..."},...db.clients.map(c=>({value:c.id,label:c.anonId}))]}/>
      {form.employerId&&<div style={{fontSize:12,color:C.textMid,marginTop:-8,marginBottom:12}}>Employer: {db.employers.find(e=>e.id===form.employerId)?.name}</div>}
      <Inp label="Session Date" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
      <Sel label="Session Type" value={form.type} onChange={e=>changeType(e.target.value)}
        options={[{value:"individual",label:"Individual Therapy"},{value:"couple",label:"Couples Therapy"},{value:"psychiatry",label:"Psychiatry"}]}/>
      <div style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Modality</label>
        <div style={{display:"flex",gap:0,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
          {[["in-person","🏢 In-Person"],["virtual","💻 Virtual"]].map(([v,l])=>(
            <button key={v} onClick={()=>setForm(f=>({...f,modality:v}))} style={{
              flex:1, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer",
              fontFamily:"Arial,sans-serif", border:"none",
              background: form.modality===v ? C.teal : C.white,
              color: form.modality===v ? C.white : C.textMid,
              borderRight: v==="in-person" ? `1px solid ${C.border}` : "none"
            }}>{l}</button>
          ))}
        </div>
        {form.clientId && db.clients.find(c=>c.id===form.clientId)?.modality && (
          <div style={{fontSize:11,color:C.tealDark,marginTop:5}}>
            ↑ Pre-filled from client preference ({db.clients.find(c=>c.id===form.clientId)?.modality})
          </div>
        )}
      </div>
      <div style={{marginBottom:13}}>
        <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Session Fee ($)</label>
        <input type="number" value={form.feeCents} onChange={e=>setForm(f=>({...f,feeCents:e.target.value}))}
          style={{width:"100%",boxSizing:"border-box",border:`1px solid ${form.feeCents&&parseFloat(form.feeCents)>0?C.teal:C.border}`,borderRadius:4,padding:"8px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",outline:"none"}}/>
        {rateHint&&<div style={{fontSize:11,color:C.tealDark,marginTop:5}}>{rateHint}</div>}
      </div>
      <Btn onClick={add} disabled={!form.clientId||!form.date||!form.feeCents}>Log Session</Btn>
    </Modal>}
  </div>;
};

// ── Assessments ───────────────────────────────────────────────────────────────
const AssessmentsView = ({ db }) => {
  const [empFilter,setEmpFilter]=useState("all");
  const list=db.clients.filter(c=>empFilter==="all"||c.employerId===empFilter).map(c=>{
    // Only include completed assessments with a real score
    const all=db.assessments.filter(a=>a.clientId===c.id&&a.completed===true&&a.score!==null&&a.score!==undefined).sort((a,b)=>a.date.localeCompare(b.date));
    return {...c, phq:all.filter(a=>a.type==="PHQ9"), gad:all.filter(a=>a.type==="GAD7"), empName:db.employers.find(e=>e.id===c.employerId)?.name};
  });
  return <div>
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20}}>
      <div><h2 style={{fontSize:20,fontWeight:700,color:C.textDark,margin:0}}>Assessments</h2><p style={{fontSize:13,color:C.textMid,margin:"3px 0 0"}}>PHQ-9 & GAD-7 · completed results</p></div>
      <select value={empFilter} onChange={e=>setEmpFilter(e.target.value)} style={{border:`1px solid ${C.border}`,borderRadius:4,padding:"7px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",background:C.white,outline:"none"}}>
        <option value="all">All Employers</option>
        {db.employers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
    </div>
    <div style={{display:"grid",gap:14}}>
      {list.map(c=>(
        <div key={c.id} style={{...card,padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <div>
              <span style={{fontFamily:"monospace",color:C.teal,fontWeight:700}}>{c.anonId}</span>
              {c.clientName&&<span style={{fontSize:12,fontWeight:600,color:C.textDark,marginLeft:10}}>{c.clientName}</span>}
              <span style={{fontSize:12,color:C.textMid,marginLeft:10}}>{c.empName}</span>
            </div>
            <span style={{fontSize:12,color:C.textMid}}>{c.phq.length + c.gad.length} completed</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            {[{key:"phq",data:c.phq,max:27,label:"PHQ-9 · Depression",color:C.teal,sev:phqSev},
              {key:"gad",data:c.gad,max:21,label:"GAD-7 · Anxiety",color:C.tealGreen,sev:gadSev}].map(({key,data,max,label,color,sev})=>(
              <div key={key} style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:14}}>
                <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>{label}</div>
                {data.length>0 ? <>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}>
                    <span style={{color:C.textMid}}>Intake: <strong style={{color:sev(data[0].score).c}}>{data[0].score} ({sev(data[0].score).l})</strong></span>
                    <span style={{color:C.textMid}}>Latest: <strong style={{color:sev(data[data.length-1].score).c}}>{data[data.length-1].score} ({sev(data[data.length-1].score).l})</strong></span>
                  </div>
                  <Bar v={data[data.length-1].score} max={max} color={data[data.length-1].score<data[0].score?color:"#C0392B"}/>
                  {data[0].score-data[data.length-1].score>=5&&<div style={{marginTop:7,fontSize:11,color:color}}>✓ Clinically significant improvement (≥5pt)</div>}
                  <div style={{marginTop:10}}>
                    {data.map(a=><div key={a.id} style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textMid,marginBottom:3}}>
                      <span style={{fontFamily:"monospace"}}>{a.date}</span>
                      <strong style={{color:sev(a.score).c}}>{a.score}</strong>
                    </div>)}
                  </div>
                </> : <div style={{fontSize:12,color:C.border}}>No completed assessments yet</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>;
};

// ── Billing ───────────────────────────────────────────────────────────────────
const BillingView = ({ db, setDb }) => {
  const upd=(id,status)=>setDb(d=>({...d,invoices:d.invoices.map(i=>i.id===id?{...i,status}:i)}));
  const paid=db.invoices.filter(i=>i.status==="paid").reduce((s,i)=>s+i.totalCents,0);
  const pend=db.invoices.filter(i=>["sent","draft"].includes(i.status)).reduce((s,i)=>s+i.totalCents,0);
  const over=db.invoices.filter(i=>i.status==="overdue").reduce((s,i)=>s+i.totalCents,0);
  return <div>
    <SH title="Billing" sub="Employer invoices"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
      <StatCard label="Collected" value={fmt(paid)} accent={C.tealGreen}/>
      <StatCard label="Pending"   value={fmt(pend)} accent={C.tealMid}/>
      <StatCard label="Overdue"   value={fmt(over)} accent="#C0392B"/>
    </div>
    <div style={{display:"grid",gap:14}}>
      {db.employers.map(emp=>{
        const invs=db.invoices.filter(i=>i.employerId===emp.id).sort((a,b)=>b.period.localeCompare(a.period));
        return <div key={emp.id} style={card}>
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,background:C.cream,display:"flex",justifyContent:"space-between"}}>
            <span style={{fontWeight:700,fontSize:14,color:C.textDark}}>{emp.name}</span>
            <span style={{fontSize:10,color:C.textMid,textTransform:"uppercase",fontWeight:700}}>{emp.billing}</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <tbody>{invs.map((inv,i)=><tr key={inv.id} style={{background:i%2===1?C.bgPage:C.white,borderBottom:`1px solid ${C.border}`}}>
              <td style={{padding:"10px 14px",fontFamily:"monospace",fontSize:12,color:C.textMid}}>{inv.period}</td>
              <td style={{padding:"10px 14px",fontFamily:"monospace",fontWeight:700,color:C.textDark,textAlign:"right"}}>{fmt(inv.totalCents)}</td>
              <td style={{padding:"10px 14px"}}><Badge status={inv.status}/></td>
              <td style={{padding:"10px 14px",textAlign:"right"}}>
                {inv.status==="draft"&&<Btn variant="ghost" small onClick={()=>upd(inv.id,"sent")}>Send</Btn>}
                {["sent","overdue"].includes(inv.status)&&<Btn variant="ghost" small onClick={()=>upd(inv.id,"paid")}>Mark Paid</Btn>}
              </td>
            </tr>)}</tbody>
          </table>
        </div>;
      })}
    </div>
  </div>;
};

// ── Payouts ───────────────────────────────────────────────────────────────────
const PayoutsView = ({ db, setDb }) => {
  const upd=(id,status)=>setDb(d=>({...d,payouts:d.payouts.map(p=>p.id===id?{...p,status}:p)}));
  const paid=db.payouts.filter(p=>p.status==="paid").reduce((s,p)=>s+p.netCents,0);
  const pend=db.payouts.filter(p=>["pending","processing"].includes(p.status)).reduce((s,p)=>s+p.netCents,0);
  const margin=db.payouts.filter(p=>p.status==="paid").reduce((s,p)=>s+p.marginCents,0);
  return <div>
    <SH title="Payouts" sub="Practice ACH disbursements"/>
    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:22}}>
      <StatCard label="Paid Out"      value={fmt(paid)}   accent={C.teal}/>
      <StatCard label="Pending"       value={fmt(pend)}   accent={C.tealMid}/>
      <StatCard label="Lumina Margin" value={fmt(margin)} accent={C.tealGreen}/>
    </div>
    <div style={{display:"grid",gap:14}}>
      {db.practices.map(prac=>{
        const pays=db.payouts.filter(p=>p.practiceId===prac.id).sort((a,b)=>b.period.localeCompare(a.period));
        return <div key={prac.id} style={card}>
          <div style={{padding:"12px 14px",borderBottom:`1px solid ${C.border}`,background:C.cream}}>
            <span style={{fontWeight:700,fontSize:14,color:C.textDark}}>{prac.name}</span>
          </div>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead><tr style={{background:C.bgPage}}>
              {[["Period"],["Gross",true],["Margin",true],["Net Payout",true],["Status"],[""]].map(([h,r],i)=>(
                <th key={i} style={{...TH,textAlign:r?"right":"left"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{pays.map((pay,i)=><tr key={pay.id} style={{background:i%2===1?C.bgPage:C.white,borderBottom:`1px solid ${C.border}`}}>
              <td style={{...TD(false),fontFamily:"monospace",fontSize:12,color:C.textMid}}>{pay.period}</td>
              <td style={{...TD(true),fontFamily:"monospace",fontSize:12,color:C.textMid}}>{fmt(pay.grossCents)}</td>
              <td style={{...TD(true),fontFamily:"monospace",fontSize:12,color:C.tealGreen}}>−{fmt(pay.marginCents)}</td>
              <td style={{...TD(true),fontFamily:"monospace",fontWeight:700,color:C.tealDark}}>{fmt(pay.netCents)}</td>
              <td style={TD(false)}><Badge status={pay.status}/></td>
              <td style={{...TD(true)}}>
                {pay.status==="pending"&&<Btn variant="ghost" small onClick={()=>upd(pay.id,"processing")}>Initiate ACH</Btn>}
                {pay.status==="processing"&&<Btn variant="ghost" small onClick={()=>upd(pay.id,"paid")}>Mark Paid</Btn>}
              </td>
            </tr>)}</tbody>
          </table>
        </div>;
      })}
    </div>
  </div>;
};

// ── ROI Reports ───────────────────────────────────────────────────────────────
const ROIView = ({ db }) => {
  const [sel,setSel]=useState(db.employers[0]?.id);
  const emp=db.employers.find(e=>e.id===sel);
  const ec=db.clients.filter(c=>c.employerId===sel);
  const es=db.sessions.filter(s=>s.employerId===sel);
  const ea=db.assessments.filter(a=>ec.some(c=>c.id===a.clientId)&&a.completed===true&&a.score!==null&&a.score!==undefined);

  const fl=(type)=>{
    const m={};
    ea.filter(a=>a.type===type).forEach(a=>{
      if(!m[a.clientId]) m[a.clientId]={f:a,l:a};
      else { if(a.date<m[a.clientId].f.date) m[a.clientId].f=a; if(a.date>m[a.clientId].l.date) m[a.clientId].l=a; }
    });
    return m;
  };
  const phq=fl("PHQ9"), gad=fl("GAD7");
  const avg=(vs)=>vs.length?(vs.reduce((s,v)=>s+v,0)/vs.length).toFixed(1):"—";
  const pct=(m)=>{ const ids=Object.keys(m); if(!ids.length) return "—"; const n=ids.filter(id=>m[id].f.score-m[id].l.score>=5).length; return `${Math.round((n/ids.length)*100)}%`; };

  const phqI=avg(Object.values(phq).map(d=>d.f.score));
  const phqL=avg(Object.values(phq).map(d=>d.l.score));
  const gadI=avg(Object.values(gad).map(d=>d.f.score));
  const gadL=avg(Object.values(gad).map(d=>d.l.score));

  const byPrac=db.practices.map(p=>({name:p.name,n:es.filter(s=>s.practiceId===p.id).length})).filter(p=>p.n>0);
  const byType=["individual","couple","psychiatry"].map(t=>({t,n:es.filter(s=>s.type===t).length})).filter(t=>t.n>0);

  return <div>
    <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20}}>
      <div><h2 style={{fontSize:20,fontWeight:700,color:C.textDark,margin:0}}>ROI Reports</h2><p style={{fontSize:13,color:C.textMid,margin:"3px 0 0"}}>De-identified aggregate · HIPAA compliant</p></div>
      <select value={sel} onChange={e=>setSel(e.target.value)} style={{border:`1px solid ${C.border}`,borderRadius:4,padding:"7px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",background:C.white,outline:"none"}}>
        {db.employers.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}
      </select>
    </div>
    <div style={card}>
      {/* Header */}
      <div style={{background:C.tealDark,padding:"22px 26px"}}>
        <div style={{fontSize:10,color:C.tealMid,textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:5,fontWeight:700}}>Lumina Therapy Alliance</div>
        <div style={{fontSize:20,fontWeight:700,color:C.white}}>{emp?.name}</div>
        <div style={{fontSize:13,color:"#A8D5D5",marginTop:3}}>Employee Wellness Report · March 2026</div>
        <div style={{fontSize:11,color:"#7ABCBC",marginTop:6}}>All data de-identified · HIPAA compliant · aggregate only</div>
      </div>
      <div style={{padding:24}}>
        {/* Utilization */}
        <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.teal}`,paddingBottom:7,marginBottom:16,display:"inline-block"}}>Program Utilization</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
          {[["Employees Engaged",ec.length,C.teal],["Total Sessions",es.length,C.tealDark],["Avg Sessions / Employee",ec.length?(es.length/ec.length).toFixed(1):"—",C.tealGreen]].map(([l,v,c])=>(
            <div key={l} style={{background:C.cream,border:`1px solid ${C.border}`,borderRadius:4,padding:14,textAlign:"center"}}>
              <div style={{fontSize:26,fontWeight:700,color:c,fontFamily:"monospace"}}>{v}</div>
              <div style={{fontSize:11,color:C.textMid,marginTop:4}}>{l}</div>
            </div>
          ))}
        </div>

        {/* Clinical outcomes */}
        <div style={{fontSize:11,fontWeight:700,color:C.teal,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.teal}`,paddingBottom:7,marginBottom:16,display:"inline-block"}}>Clinical Outcomes</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:24}}>
          {[{label:"PHQ-9 · Depression",i:phqI,l:phqL,p:pct(phq),color:C.teal},{label:"GAD-7 · Anxiety",i:gadI,l:gadL,p:pct(gad),color:C.tealGreen}].map(({label,i,l,p,color})=>(
            <div key={label} style={{background:C.cream,border:`1px solid ${C.border}`,borderRadius:4,padding:16}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textDark,marginBottom:12}}>{label}</div>
              {[["Avg intake score",i],["Avg current score",l],["Clinically improved (≥5pt)",p]].map(([lbl,val])=>(
                <div key={lbl} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8,paddingBottom:8,borderBottom:`1px solid ${C.border}`}}>
                  <span style={{color:C.textMid}}>{lbl}</span>
                  <strong style={{color:color,fontFamily:"monospace"}}>{val}</strong>
                </div>
              ))}
              {i!=="—"&&l!=="—"&&<div style={{marginTop:4}}>
                <div style={{fontSize:10,color:C.textMid,marginBottom:4}}>Avg improvement</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{flex:1,background:C.border,borderRadius:2,height:5}}>
                    <div style={{width:`${Math.max(0,((i-l)/i)*100)}%`,height:"100%",background:color,borderRadius:2}}/>
                  </div>
                  <span style={{fontSize:12,color:color,fontFamily:"monospace",fontWeight:700}}>−{(i-l).toFixed(1)} pts</span>
                </div>
              </div>}
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20,marginBottom:20}}>
          {[{title:"Sessions by Practice",rows:byPrac.map(p=>[p.name,`${p.n} sessions`])},
            {title:"Sessions by Type",rows:byType.map(t=>[t.t,`${t.n} sessions`]),cap:true},
            {title:"Sessions by Modality",rows:[
              ["🏢 In-Person", `${es.filter(s=>s.modality==="in-person").length} sessions`],
              ["💻 Virtual",   `${es.filter(s=>s.modality==="virtual").length} sessions`],
            ]}
          ].map(({title,rows,cap})=>(
            <div key={title}>
              <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>{title}</div>
              {rows.map(([l,v])=><div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.textMid,textTransform:cap?"capitalize":"none"}}>{l}</span>
                <span style={{fontFamily:"monospace",fontWeight:700,color:C.textDark}}>{v}</span>
              </div>)}
            </div>
          ))}
        </div>
        <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`,fontSize:11,color:C.textMid,lineHeight:1.7}}>
          All data is de-identified and reported in aggregate only, in compliance with HIPAA. No individual employee data is disclosed. This report is generated automatically and transmitted securely to authorized employer contacts only.
        </div>
      </div>
    </div>
  </div>;
};

// ── Referrals ────────────────────────────────────────────────────────────────
const PRESENTING_NEEDS = [
  "Anxiety","Depression","Couples / Relationship","Grief / Loss","Trauma / PTSD",
  "Work / Leadership Stress","Psychiatry / Medication","ADHD","Substance Use",
  "Family / Parenting","Life Transitions","Other"
];
const SESSION_TYPES = [
  {value:"individual",label:"Individual Therapy"},
  {value:"couple",label:"Couples Therapy"},
  {value:"psychiatry",label:"Psychiatry"},
];
const STATUS_FLOW = ["pending","scheduled","active","discharged"];

const ReferralsView = ({ db, setDb }) => {
  const [modal,setModal]=useState(false);
  const [msgModal,setMsgModal]=useState(null);
  const [filter,setFilter]=useState("all");
  const [step,setStep]=useState(1);
  const [form,setForm]=useState({
    employerId:"",presNeed:"Anxiety",location:"",practiceId:"",sessionType:"individual",
    modality:"in-person", state:"", clientEmail:"",clientPhone:"",notes:""
  });
  const [match,setMatch]=useState({practiceId:"",clinicianId:""});

  // unique cities from practices
  const cities = [...new Set(db.practices.map(p=>p.city))].sort();

  // filter practices by selected city (or all if none selected)
  const suggestedPractices = form.location
    ? db.practices.filter(p => p.city === form.location)
    : db.practices;

  // if coordinator already picked a specific practice in step 1, pre-select it in step 2
  const effectivePractices = form.practiceId
    ? db.practices.filter(p => p.id === form.practiceId)
    : suggestedPractices;

  const matchedClinicians = match.practiceId
    ? db.clinicians.filter(c=>c.practiceId===match.practiceId)
    : [];

  // when city changes, clear practice selection if it no longer belongs to that city
  const handleCityChange = (city) => {
    const practiceStillValid = !city || db.practices.find(p=>p.id===form.practiceId&&p.city===city);
    setForm(f=>({...f, location:city, practiceId: practiceStillValid?f.practiceId:""}));
    setMatch(m=>({...m, practiceId:"", clinicianId:""}));
  };

  const handlePracticeChange = (pid) => {
    const p = db.practices.find(x=>x.id===pid);
    setForm(f=>({...f, practiceId:pid, location: pid&&p ? p.city : f.location}));
    setMatch(m=>({...m, practiceId:pid||"", clinicianId:""}));
  };

  const resetForm=()=>{ setForm({employerId:"",presNeed:"Anxiety",location:"",practiceId:"",sessionType:"individual",modality:"in-person",state:"",clientEmail:"",clientPhone:"",notes:""}); setMatch({practiceId:"",clinicianId:""}); setStep(1); };

  const submit=()=>{
    const anonId=`LTA-${String(db.clients.length+db.referrals.length+46).padStart(4,"0")}`;
    const ref={
      id:`ref${Date.now()}`, anonId, ...form, ...match,
      status:"pending", createdAt:new Date().toISOString().split("T")[0], scheduledAt:"", 
    };
    // also create client record
    const client={
      id:`cl_${Date.now()}`, anonId, employerId:form.employerId,
      practiceId:match.practiceId, clinicianId:match.clinicianId,
      intakeDate:new Date().toISOString().split("T")[0], status:"active",
      modality:form.modality, state:form.state,
      email:form.clientEmail, phone:form.clientPhone
    };
    setDb(d=>({...d, referrals:[...d.referrals,ref], clients:[...d.clients,client]}));
    setMsgModal(ref.id);
    setModal(false); resetForm();
  };

  const updateStatus=(id,status)=>setDb(d=>({...d,referrals:d.referrals.map(r=>r.id===id?{...r,status,scheduledAt:status==="scheduled"?new Date().toISOString().split("T")[0]:r.scheduledAt}:r)}));

  const filtered=filter==="all"?db.referrals:db.referrals.filter(r=>r.status===filter);
  const sorted=[...filtered].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));

  // message generator
  const genMessage=(ref,mode)=>{
    const prac=db.practices.find(p=>p.id===ref.practiceId);
    const clin=db.clinicians.find(c=>c.id===ref.clinicianId);
    const emp=db.employers.find(e=>e.id===ref.employerId);
    if(mode==="email") return `Subject: Your Lumina Therapy Alliance Appointment\n\nHello,\n\nThank you for reaching out to Lumina Therapy Alliance through ${emp?.name||"your employer"}.\n\nWe have matched you with ${prac?.name||"a practice"}${clin?`, where you will be working with ${clin.name} (${clin.credential})`:""}, located in ${prac?.city||""}.\n\nYour care coordinator will be in touch within 24 hours to confirm your first appointment. You can expect your first session within 72 hours of booking.\n\nYour anonymous client ID is: ${ref.anonId}\n\nIf you have any questions, please reply to this email or call us directly.\n\nWarm regards,\nLumina Therapy Alliance Care Team\ndrselling@luminatherapyalliance.com\n(718) 757-7033`;
    return `Hi, this is Lumina Therapy Alliance. We've matched you with ${prac?.name||"a practice"} in ${prac?.city||"your area"}${clin?` — your clinician will be ${clin.name}`:""}.  Your coordinator will call within 24 hrs to confirm your first appointment (within 72 hrs of booking). Questions? Call (718) 757-7033. Ref: ${ref.anonId}`;
  };

  const counts={all:db.referrals.length, ...STATUS_FLOW.reduce((a,s)=>({...a,[s]:db.referrals.filter(r=>r.status===s).length}),{})};

  return <div>
    <SH title="Referrals" sub="Intake · matching · client outreach"
      action={<Btn onClick={()=>{resetForm();setModal(true);}}>+ New Referral</Btn>}/>

    {/* Status filter tabs */}
    <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
      {[["all","All"],["pending","Pending"],["scheduled","Scheduled"],["active","Active"],["discharged","Discharged"]].map(([v,l])=>(
        <button key={v} onClick={()=>setFilter(v)} style={{
          padding:"6px 14px",borderRadius:20,fontSize:12,fontWeight:filter===v?700:500,cursor:"pointer",
          background:filter===v?C.teal:C.white, color:filter===v?C.white:C.textMid,
          border:`1px solid ${filter===v?C.teal:C.border}`
        }}>{l} <span style={{fontFamily:"monospace",fontSize:11,opacity:0.8}}>({counts[v]||0})</span></button>
      ))}
    </div>

    {/* Referral cards */}
    <div style={{display:"grid",gap:12}}>
      {sorted.length===0&&<div style={{...card,padding:24,textAlign:"center",color:C.textMid,fontSize:13}}>No referrals{filter!=="all"?` with status "${filter}"`:""}.</div>}
      {sorted.map(ref=>{
        const emp=db.employers.find(e=>e.id===ref.employerId);
        const prac=db.practices.find(p=>p.id===ref.practiceId);
        const clin=db.clinicians.find(c=>c.id===ref.clinicianId);
        const nextStatus={pending:"scheduled",scheduled:"active",active:"discharged"}[ref.status];
        const nextLabel={pending:"Mark Scheduled",scheduled:"Mark Active",active:"Discharge"}[ref.status];
        return <div key={ref.id} style={{...card,padding:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"monospace",color:C.teal,fontWeight:700,fontSize:13}}>{ref.anonId}</span>
              <Badge status={ref.status}/>
              <span style={{fontSize:11,color:C.textMid,fontFamily:"monospace"}}>{ref.createdAt}</span>
            </div>
            <div style={{display:"flex",gap:7}}>
              <Btn variant="ghost" small onClick={()=>setMsgModal(ref.id)}>📨 Message</Btn>
              {nextStatus&&<Btn variant="secondary" small onClick={()=>updateStatus(ref.id,nextStatus)}>{nextLabel}</Btn>}
            </div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:ref.notes?12:0}}>
            {[["Employer",emp?.name||"—"],["Presenting Need",ref.presNeed],["Session Type",ref.sessionType],["Client State",ref.state||"—"]].map(([l,v])=>(
              <div key={l}>
                <div style={{fontSize:9,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3}}>{l}</div>
                <div style={{fontSize:12,color:C.textDark,textTransform:"capitalize"}}>{v}</div>
              </div>
            ))}
          </div>
          {(ref.modality||ref.state)&&<div style={{marginTop:8,marginBottom:4,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <ModalityBadge modality={ref.modality}/>
            {ref.state&&ref.modality==="virtual"&&(()=>{
              const isPsypact = PSYPACT_STATES.has(ref.state);
              return <span style={{fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:3,
                background:isPsypact?"#E6F4F1":"#FFF3E0",
                color:isPsypact?C.tealDark:"#8B5E00",
                border:`1px solid ${isPsypact?C.teal:"#F0A500"}`
              }}>{isPsypact?"✓ PSYPACT":"⚠ Non-PSYPACT"}</span>;
            })()}
          </div>}

          {/* Match info + loop status */}
          <div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
              {prac
                ? <><div style={{fontSize:12,color:C.textDark}}><strong>Practice:</strong> {prac.name} · {prac.city}</div>
                    {clin&&<div style={{fontSize:12,color:C.textMid}}>Clinician: {clin.name} ({clin.credential}) · {clin.specialty}</div>}</>
                : <div style={{fontSize:12,color:"#D4721A",fontWeight:600}}>⚠ No practice matched yet</div>
              }
            </div>
            {prac&&<div style={{display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:10,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.05em"}}>Practice loop:</span>
              {[["✓",ref.practiceConfirmedAt,"Confirmed"],["✓",ref.practiceContactedAt,"Contacted"],["✓",ref.practiceSessionBookedAt,"Booked"]].map(([n,d,l],i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:4,fontSize:11}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:d?C.tealGreen:C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.white,fontWeight:700}}>{d?"✓":i+1}</div>
                  <span style={{color:d?C.tealDark:C.textMid,fontWeight:d?700:400}}>{l}</span>
                </div>
              ))}
            </div>}
          </div>

          {ref.notes&&<div style={{marginTop:10,fontSize:12,color:C.textMid,fontStyle:"italic"}}>"{ref.notes}"</div>}
          {ref.clientEmail&&<div style={{marginTop:6,fontSize:11,color:C.textMid}}>📧 {ref.clientEmail}{ref.clientPhone?`  ·  📱 ${ref.clientPhone}`:""}</div>}
        </div>;
      })}
    </div>

    {/* ── New referral modal (3-step) ── */}
    {modal&&<Modal title={`New Referral — Step ${step} of 3`} onClose={()=>{setModal(false);resetForm();}}>
      {step===1&&<div>
        <div style={{fontSize:12,color:C.textMid,marginBottom:16,lineHeight:1.6}}>Step 1: Capture intake information from the employer or client.</div>
        <Sel label="Employer" value={form.employerId} onChange={e=>setForm(f=>({...f,employerId:e.target.value}))}
          options={[{value:"",label:"Select employer..."},...db.employers.map(e=>({value:e.id,label:e.name}))]}/>
        <Sel label="Presenting Need" value={form.presNeed} onChange={e=>setForm(f=>({...f,presNeed:e.target.value}))}
          options={PRESENTING_NEEDS.map(n=>({value:n,label:n}))}/>
        <Sel label="Session Type" value={form.sessionType} onChange={e=>setForm(f=>({...f,sessionType:e.target.value}))}
          options={SESSION_TYPES}/>

        {/* Modality toggle */}
        <div style={{marginBottom:13}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:7}}>Modality</label>
          <div style={{display:"flex",gap:0,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
            {[["in-person","🏢 In-Person"],["virtual","💻 Virtual"]].map(([v,l])=>(
              <button key={v} onClick={()=>setForm(f=>({...f,modality:v}))} style={{
                flex:1, padding:"9px 0", fontSize:13, fontWeight:700, cursor:"pointer",
                fontFamily:"Arial,sans-serif", border:"none",
                background: form.modality===v ? C.teal : C.white,
                color: form.modality===v ? C.white : C.textMid,
                borderRight: v==="in-person" ? `1px solid ${C.border}` : "none"
              }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Client state dropdown */}
        <div style={{marginBottom:13}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>Client State (where they are located)</label>
          <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))}
            style={{width:"100%",border:`1px solid ${form.state?C.teal:C.border}`,borderRadius:4,padding:"8px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",background:C.white,outline:"none"}}>
            <option value="">Select state...</option>
            {US_STATES.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          {form.state&&(()=>{
            const sv = getServiceability(form.state, form.modality);
            return sv ? (
              <div style={{fontSize:11,marginTop:5,fontWeight:600,color:sv.color,display:"flex",alignItems:"center",gap:4}}>
                <span>{sv.ok?"✓":"⚠"}</span><span>{sv.label}</span>
                {!sv.ok && form.modality==="virtual" && !PSYPACT_STATES.has(form.state) && (
                  <a href="https://psypact.org/mpage/psypactmap" target="_blank" rel="noopener noreferrer"
                    style={{marginLeft:4,fontSize:10,color:C.teal,textDecoration:"underline"}}>Check PSYPACT map →</a>
                )}
              </div>
            ) : null;
          })()}
        </div>

        {/* City dropdown */}
        <Sel label="Preferred City" value={form.location} onChange={e=>handleCityChange(e.target.value)}
          options={[{value:"",label:"Any city / no preference"},...cities.map(c=>({value:c,label:c}))]}/>

        {/* Practice dropdown — filtered by city if selected */}
        <div style={{marginBottom:13}}>
          <label style={{display:"block",fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>
            Specific Practice <span style={{fontWeight:400,textTransform:"none",letterSpacing:0,color:C.border}}>(optional — or choose on next step)</span>
          </label>
          <select value={form.practiceId} onChange={e=>handlePracticeChange(e.target.value)}
            style={{width:"100%",border:`1px solid ${form.practiceId?C.teal:C.border}`,borderRadius:4,padding:"8px 10px",fontSize:13,color:C.textDark,fontFamily:"Arial,sans-serif",background:C.white,outline:"none"}}>
            <option value="">— Let me choose on next step —</option>
            {(form.location ? db.practices.filter(p=>p.city===form.location) : db.practices).map(p=>(
              <option key={p.id} value={p.id}>{p.name} · {p.city}</option>
            ))}
          </select>
          {form.practiceId&&<div style={{fontSize:11,color:C.teal,marginTop:4}}>✓ Pre-selected — you can still change on the next step.</div>}
        </div>

        <Inp label="Client Email" type="email" value={form.clientEmail} onChange={e=>setForm(f=>({...f,clientEmail:e.target.value}))}/>
        <Inp label="Client Phone (optional)" value={form.clientPhone} onChange={e=>setForm(f=>({...f,clientPhone:e.target.value}))} placeholder="555-000-0000"/>
        <Inp label="Coordinator Notes (optional)" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any context from the call..."/>
        <Btn onClick={()=>{ if(form.practiceId) setMatch(m=>({...m,practiceId:form.practiceId})); setStep(2); }} disabled={!form.employerId||!form.clientEmail}>Next: Match Practice →</Btn>
      </div>}

      {step===2&&<div>
        <div style={{fontSize:12,color:C.textMid,marginBottom:16,lineHeight:1.6}}>
          Step 2: Confirm or change the practice and assign a clinician.<br/>
          <strong style={{color:C.tealDark}}>Need: {form.presNeed} · {form.sessionType}{form.location?` · ${form.location}`:""}</strong>
        </div>

        <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>
          {form.practiceId?"Pre-selected Practice — click to change":form.location?`Practices in ${form.location}`:"All Practices"}
        </div>
        <div style={{display:"grid",gap:8,marginBottom:16}}>
          {effectivePractices.map(p=>{
            const sel=match.practiceId===p.id;
            const rateKey="rate"+form.sessionType.charAt(0).toUpperCase()+form.sessionType.slice(1);
            const rate=p[rateKey]||p.rateIndividual;
            return <div key={p.id} onClick={()=>setMatch(m=>({...m,practiceId:p.id,clinicianId:""}))}
              style={{border:`2px solid ${sel?C.teal:C.border}`,borderRadius:5,padding:"10px 14px",cursor:"pointer",background:sel?`${C.teal}0a`:C.white,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:C.textDark}}>{p.name}</div>
                <div style={{fontSize:11,color:C.textMid,marginTop:2}}>{p.city}</div>
              </div>
              <div style={{textAlign:"right",fontSize:11,color:sel?C.tealDark:C.textMid,fontFamily:"monospace",fontWeight:sel?700:400}}>
                {rate?`${fmt(rate)}/session`:""}
              </div>
            </div>;
          })}
          {/* Show "show all" link if filtered */}
          {(form.location||form.practiceId)&&<button onClick={()=>{setForm(f=>({...f,location:"",practiceId:""}));setMatch(m=>({...m,practiceId:"",clinicianId:""}));}}
            style={{background:"none",border:`1px dashed ${C.border}`,borderRadius:5,padding:"8px",fontSize:12,color:C.textMid,cursor:"pointer",fontFamily:"Arial,sans-serif"}}>
            Show all practices →
          </button>}
        </div>

        {match.practiceId&&<>
          <Sel label="Assign Clinician" value={match.clinicianId} onChange={e=>setMatch(m=>({...m,clinicianId:e.target.value}))}
            options={[{value:"",label:"Select clinician..."},...matchedClinicians.map(c=>({value:c.id,label:`${c.name} · ${c.credential} · ${c.specialty}`}))]}/>
        </>}

        <div style={{display:"flex",gap:8,marginTop:4}}>
          <Btn variant="secondary" onClick={()=>setStep(1)}>← Back</Btn>
          <Btn onClick={()=>setStep(3)} disabled={!match.practiceId}>Next: Review & Send →</Btn>
        </div>
      </div>}

      {step===3&&(()=>{
        const prac=db.practices.find(p=>p.id===match.practiceId);
        const clin=db.clinicians.find(c=>c.id===match.clinicianId);
        const emp=db.employers.find(e=>e.id===form.employerId);
        const anonId=`LTA-${String(db.clients.length+db.referrals.length+47).padStart(4,"0")}`;
        return <div>
          <div style={{fontSize:12,color:C.textMid,marginBottom:16}}>Step 3: Review the referral and confirm. Email + text will be ready to send.</div>

          <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:5,padding:16,marginBottom:16}}>
            <div style={{fontSize:10,fontWeight:700,color:C.textMid,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Referral Summary</div>
            {[
              ["Client ID (assigned)",anonId],
              ["Employer",emp?.name],
              ["Presenting Need",form.presNeed],
              ["Session Type",form.sessionType],
              ["Modality", form.modality==="in-person"?"🏢 In-Person":"💻 Virtual"],
              ["Client State", form.state||(form.modality==="virtual"?"— required for PSYPACT":"—")],
              ["Practice",prac?.name+" · "+prac?.city],
              ["Clinician",clin?`${clin.name} · ${clin.credential}`:"To be assigned"],
              ["Contact",form.clientEmail+(form.clientPhone?" · "+form.clientPhone:"")],
            ].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:6,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
                <span style={{color:C.textMid}}>{l}</span>
                <span style={{color:C.textDark,fontWeight:600,textTransform:"capitalize",textAlign:"right",maxWidth:"60%"}}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{background:`${C.tealGreen}10`,border:`1px solid ${C.tealGreen}40`,borderRadius:4,padding:"10px 12px",fontSize:12,color:C.tealDark,marginBottom:16}}>
            ✓ On submission: client record created, email + text message ready to copy and send.
          </div>

          <div style={{display:"flex",gap:8}}>
            <Btn variant="secondary" onClick={()=>setStep(2)}>← Back</Btn>
            <Btn onClick={submit}>Submit Referral</Btn>
          </div>
        </div>;
      })()}
    </Modal>}

    {/* ── Message modal ── */}
    {msgModal&&(()=>{
      const ref=db.referrals.find(r=>r.id===msgModal);
      if(!ref) return null;
      const [tab,setTab]=useState("email");
      const msg=genMessage(ref,tab);
      return <Modal title={`Client Outreach — ${ref.anonId}`} onClose={()=>setMsgModal(null)}>
        <div style={{display:"flex",gap:0,marginBottom:14,border:`1px solid ${C.border}`,borderRadius:4,overflow:"hidden"}}>
          {[["email","📧 Email"],["text","💬 Text"]].map(([v,l])=>(
            <button key={v} onClick={()=>setTab(v)} style={{
              flex:1,padding:"8px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Arial,sans-serif",
              background:tab===v?C.teal:C.white, color:tab===v?C.white:C.textMid,
              border:"none",borderRight:v==="email"?`1px solid ${C.border}`:"none"
            }}>{l}</button>
          ))}
        </div>
        <div style={{background:C.bgPage,border:`1px solid ${C.border}`,borderRadius:4,padding:14,fontSize:12,color:C.textDark,whiteSpace:"pre-wrap",lineHeight:1.7,marginBottom:14,maxHeight:260,overflowY:"auto",fontFamily:tab==="text"?"Arial,sans-serif":"monospace"}}>{msg}</div>
        <div style={{display:"flex",gap:8}}>
          <Btn onClick={()=>navigator.clipboard.writeText(msg)}>Copy {tab==="email"?"Email":"Text"}</Btn>
          <Btn variant="secondary" onClick={()=>setMsgModal(null)}>Done</Btn>
        </div>
      </Modal>;
    })()}
  </div>;
};

// ── Practice Portal ───────────────────────────────────────────────────────────
const PracticePortalView = ({ db, setDb, practiceId }) => {
  const prac = db.practices.find(p => p.id === practiceId);
  const myReferrals = (db.referrals||[]).filter(r => r.practiceId === practiceId)
    .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  const mySessions = db.sessions.filter(s => s.practiceId === practiceId);
  const myPayouts  = db.payouts.filter(p => p.practiceId === practiceId);
  const [nameModal, setNameModal] = useState(null); // { refId, field }
  const [nameInput, setNameInput] = useState("");

  const stamp = () => new Date().toISOString().split("T")[0];

  const updateRef = (id, fields) =>
    setDb(d => ({ ...d, referrals: d.referrals.map(r => r.id === id ? { ...r, ...fields } : r) }));

  const loopStep = (ref) => {
    if (!ref.practiceConfirmedAt) return { label:"Confirm Receipt", field:"practiceConfirmedAt", color:C.teal, desc:"Acknowledge this referral has been received. You'll also enter the client's name.", needsName:true };
    if (!ref.practiceContactedAt) return { label:"Mark Client Contacted", field:"practiceContactedAt", color:"#D4721A", desc:"Confirm the practice has made contact with the client." };
    if (!ref.practiceSessionBookedAt) return { label:"Mark Session Booked", field:"practiceSessionBookedAt", color:C.tealGreen, desc:"Confirm the first session has been scheduled." };
    return null;
  };

  const loopStatus = (ref) => {
    if (ref.practiceSessionBookedAt) return { label:"Session Booked ✓", bg:"#E6F4F1", color:C.tealDark, border:C.teal };
    if (ref.practiceContactedAt)     return { label:"Client Contacted", bg:"#FFF3E0", color:"#8B5E00", border:"#F0A500" };
    if (ref.practiceConfirmedAt)     return { label:"Receipt Confirmed", bg:"#E8F0F7", color:"#1F4D78", border:"#2E74B5" };
    return { label:"Awaiting Confirmation", bg:"#FCE8E8", color:"#B03A3A", border:"#D9534F" };
  };

  const pendingActions = myReferrals.filter(r => !r.practiceSessionBookedAt && r.practiceId).length;

  return (
    <div>
      {/* Practice header */}
      <div style={{ ...card, marginBottom:20, overflow:"hidden" }}>
        <div style={{ background:C.tealDark, padding:"18px 22px" }}>
          <div style={{ fontSize:10, color:"#A8D5D5", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Practice Portal</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{prac?.name}</div>
          <div style={{ fontSize:12, color:"#A8D5D5", marginTop:3 }}>{prac?.city}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
          {[
            ["Referrals", myReferrals.length, "total"],
            ["Action Needed", pendingActions, "incomplete loop"],
            ["Sessions", mySessions.length, "all time"],
            ["Payouts", myPayouts.filter(p=>p.status==="paid").length, "paid"],
          ].map(([l,v,sub],i) => (
            <div key={l} style={{ padding:"14px 18px", borderRight: i<3?`1px solid ${C.border}`:"none", borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:10, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{l}</div>
              <div style={{ fontSize:20, fontWeight:700, color: l==="Action Needed"&&v>0?"#D4721A":C.textDark, fontFamily:"monospace" }}>{v}</div>
              <div style={{ fontSize:10, color:C.textMid, marginTop:2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Session rates */}
      <div style={{ ...card, padding:16, marginBottom:20 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Your Session Rates (set by Lumina)</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[["Individual",prac?.rateIndividual],["Couples",prac?.rateCouple],["Psychiatry",prac?.ratePsychiatry]].map(([l,r])=>(
            <div key={l} style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:"12px 14px", textAlign:"center" }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:5 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:700, color:r?C.tealDark:C.border, fontFamily:"monospace" }}>{r?fmt(r):"—"}</div>
              <div style={{ fontSize:9, color:C.textMid, marginTop:2 }}>per session</div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrals */}
      <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>
        Incoming Referrals
      </div>

      {myReferrals.length === 0 && (
        <div style={{ ...card, padding:24, textAlign:"center", color:C.textMid, fontSize:13 }}>No referrals assigned to this practice yet.</div>
      )}

      <div style={{ display:"grid", gap:12 }}>
        {myReferrals.map(ref => {
          const clin = db.clinicians.find(c => c.id === ref.clinicianId);
          const emp  = db.employers.find(e => e.id === ref.employerId);
          const next = loopStep(ref);
          const ls   = loopStatus(ref);
          return (
            <div key={ref.id} style={{ ...card, padding:18 }}>
              {/* Header row */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"monospace", color:C.teal, fontWeight:700, fontSize:13 }}>{ref.anonId}</span>
                    {/* Show real name if confirmed — visible to practice only */}
                    {ref.practiceConfirmedAt && (() => {
                      const c = db.clients.find(x=>x.anonId===ref.anonId);
                      return c?.clientName ? <span style={{ fontSize:13, fontWeight:700, color:C.textDark }}>{c.clientName}</span> : null;
                    })()}
                    <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:3, background:ls.bg, color:ls.color, border:`1px solid ${ls.border}` }}>{ls.label}</span>
                    <ModalityBadge modality={ref.modality}/>
                  </div>
                  <div style={{ fontSize:11, color:C.textMid }}>Referred {ref.createdAt} · {emp?.name} · {ref.presNeed} · <span style={{ textTransform:"capitalize" }}>{ref.sessionType}</span>
                    {ref.state && <span> · {ref.state}{ref.modality==="virtual"&&<span style={{marginLeft:4,fontWeight:700,color:PSYPACT_STATES.has(ref.state)?C.tealGreen:"#D4721A"}}>{PSYPACT_STATES.has(ref.state)?"(PSYPACT ✓)":"(Non-PSYPACT ⚠)"}</span>}</span>}
                  </div>
                </div>
                {next && (
                  <button onClick={() => {
                    if (next.needsName) { setNameModal({refId:ref.id, field:next.field}); setNameInput(""); }
                    else updateRef(ref.id, { [next.field]: stamp() });
                  }}
                    style={{ background:next.color, color:C.white, border:"none", borderRadius:4, padding:"8px 14px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Arial,sans-serif", whiteSpace:"nowrap" }}>
                    {next.label}
                  </button>
                )}
              </div>

              {/* Loop timeline */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
                {[
                  { label:"Receipt Confirmed",  date:ref.practiceConfirmedAt,      icon:"1" },
                  { label:"Client Contacted",    date:ref.practiceContactedAt,      icon:"2" },
                  { label:"First Session Booked",date:ref.practiceSessionBookedAt,  icon:"3" },
                ].map(({label,date,icon}) => (
                  <div key={label} style={{ background: date?`${C.tealGreen}12`:C.bgPage, border:`1px solid ${date?C.tealGreen:C.border}`, borderRadius:4, padding:"10px 12px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:date?C.tealGreen:C.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:C.white, fontWeight:700, flexShrink:0 }}>{date?"✓":icon}</div>
                      <div style={{ fontSize:10, fontWeight:700, color:date?C.tealDark:C.textMid, textTransform:"uppercase", letterSpacing:"0.05em" }}>{label}</div>
                    </div>
                    <div style={{ fontSize:11, fontFamily:"monospace", color:date?C.tealDark:C.border, paddingLeft:24 }}>{date||"—"}</div>
                  </div>
                ))}
              </div>

              {/* Next action hint */}
              {next && (
                <div style={{ background:`${next.color}10`, border:`1px solid ${next.color}35`, borderRadius:4, padding:"8px 12px", fontSize:12, color:next.color }}>
                  → <strong>Action needed:</strong> {next.desc}
                </div>
              )}

              {/* Clinician + notes */}
              <div style={{ marginTop:12, paddingTop:12, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", fontSize:12, color:C.textMid }}>
                <span>{clin ? `Clinician: ${clin.name} · ${clin.credential} · ${clin.specialty}` : "No clinician assigned"}</span>
                {ref.notes && <span style={{ fontStyle:"italic" }}>"{ref.notes}"</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Name capture modal — shown when practice confirms receipt */}
      {nameModal && (
        <Modal title="Confirm Receipt — Enter Client Name" onClose={()=>setNameModal(null)}>
          <div style={{ background:`${C.teal}0f`, border:`1px solid ${C.teal}35`, borderRadius:4, padding:"10px 12px", fontSize:12, color:C.tealDark, marginBottom:16, lineHeight:1.7 }}>
            Enter the client's full name. Visible to your practice and Lumina admin only — never shared with employers.
          </div>
          <Inp label="Client Full Name" value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="First Last"/>
          <Btn onClick={()=>{
            setDb(d => {
              const ref = d.referrals.find(r=>r.id===nameModal.refId);
              return {
                ...d,
                clients: d.clients.map(c => c.anonId===ref?.anonId ? {...c, clientName:nameInput.trim()} : c),
                referrals: d.referrals.map(r => r.id===nameModal.refId ? {...r, [nameModal.field]: stamp()} : r)
              };
            });
            setNameModal(null);
          }} disabled={!nameInput.trim()}>Confirm Receipt</Btn>
        </Modal>
      )}
    </div>
  );
};
// ── PHQ-9 & GAD-7 Question Data ───────────────────────────────────────────────
const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
  "Trouble concentrating on things, such as reading the newspaper or watching television",
  "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
  "Thoughts that you would be better off dead, or of hurting yourself in some way",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const FREQ_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

// ── Assessment Form (client-facing) ──────────────────────────────────────────
const AssessmentForm = ({ type, clientName, onSubmit, onCancel }) => {
  const questions = type === "PHQ9" ? PHQ9_QUESTIONS : GAD7_QUESTIONS;
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every(a => a !== null);
  const totalScore = answers.reduce((s, a) => s + (a || 0), 0);
  const maxScore = type === "PHQ9" ? 27 : 21;

  const sev = type === "PHQ9" ? phqSev : gadSev;
  const severity = sev(totalScore);

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(answers, totalScore);
  };

  const title = type === "PHQ9"
    ? "PHQ-9 — Depression Screening"
    : "GAD-7 — Anxiety Screening";

  const intro = type === "PHQ9"
    ? "Over the last 2 weeks, how often have you been bothered by any of the following problems?"
    : "Over the last 2 weeks, how often have you been bothered by the following problems?";

  if (submitted) {
    return (
      <div style={{ textAlign:"center", padding:"40px 20px" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>✓</div>
        <div style={{ fontSize:20, fontWeight:700, color:C.tealDark, marginBottom:8 }}>Thank you, {clientName||""}!</div>
        <div style={{ fontSize:14, color:C.textMid, marginBottom:24 }}>Your responses have been recorded and shared with your care team.</div>
        <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:8, padding:"20px 28px", display:"inline-block", minWidth:200 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>{type} Score</div>
          <div style={{ fontSize:40, fontWeight:700, color:severity.c, fontFamily:"monospace" }}>{totalScore}</div>
          <div style={{ fontSize:13, color:severity.c, fontWeight:600, marginTop:4 }}>{severity.l}</div>
          <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>out of {maxScore}</div>
        </div>
        <div style={{ marginTop:24, fontSize:12, color:C.textMid, maxWidth:400, margin:"24px auto 0" }}>
          {type==="PHQ9" && totalScore >= 10 && <div style={{ background:"#FFF3E0", border:"1px solid #F0A500", borderRadius:4, padding:"10px 14px", color:"#8B5E00" }}>If you are having thoughts of harming yourself, please contact the 988 Suicide & Crisis Lifeline by calling or texting <strong>988</strong>.</div>}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background:C.tealDark, padding:"20px 24px", borderRadius:"5px 5px 0 0", margin:"-18px -18px 20px" }}>
        <div style={{ fontSize:10, color:"#A8D5D5", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Lumina Therapy Alliance</div>
        <div style={{ fontSize:17, fontWeight:700, color:C.white }}>{title}</div>
        {clientName && <div style={{ fontSize:12, color:"#A8D5D5", marginTop:3 }}>For: {clientName}</div>}
      </div>

      <div style={{ fontSize:13, color:C.textDark, marginBottom:20, lineHeight:1.7, background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:"12px 14px" }}>
        {intro}
      </div>

      {/* Progress */}
      <div style={{ marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:C.textMid, marginBottom:5 }}>
          <span>{answers.filter(a=>a!==null).length} of {questions.length} answered</span>
          {allAnswered && <span style={{ color:C.tealGreen, fontWeight:700 }}>✓ All answered — ready to submit</span>}
        </div>
        <div style={{ background:C.cream, borderRadius:2, height:4, border:`1px solid ${C.border}` }}>
          <div style={{ width:`${(answers.filter(a=>a!==null).length/questions.length)*100}%`, height:"100%", background:C.teal, borderRadius:2, transition:"width 0.3s" }}/>
        </div>
      </div>

      {/* Questions */}
      <div style={{ display:"grid", gap:14 }}>
        {questions.map((q, qi) => (
          <div key={qi} style={{ background: answers[qi]!==null ? `${C.teal}08` : C.white, border:`1px solid ${answers[qi]!==null?C.teal:C.border}`, borderRadius:5, padding:"14px 16px", transition:"all 0.2s" }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.textDark, marginBottom:12, lineHeight:1.5 }}>
              <span style={{ fontSize:11, fontWeight:700, color:C.teal, marginRight:8 }}>{qi+1}.</span>{q}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:6 }}>
              {FREQ_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setAnswers(a => { const n=[...a]; n[qi]=opt.value; return n; })}
                  style={{ padding:"9px 12px", borderRadius:4, fontSize:12, fontWeight:answers[qi]===opt.value?700:400, cursor:"pointer", fontFamily:"Arial,sans-serif", textAlign:"left",
                    background: answers[qi]===opt.value ? C.teal : C.white,
                    color: answers[qi]===opt.value ? C.white : C.textDark,
                    border: `1px solid ${answers[qi]===opt.value ? C.teal : C.border}`,
                  }}>
                  <span style={{ fontSize:10, marginRight:6, opacity:0.7 }}>{opt.value}</span>{opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Score preview */}
      {allAnswered && (
        <div style={{ marginTop:20, background:C.cream, border:`1px solid ${C.border}`, borderRadius:5, padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:C.textMid, marginBottom:2 }}>Your {type} score</div>
            <div style={{ fontSize:28, fontWeight:700, color:severity.c, fontFamily:"monospace" }}>{totalScore} <span style={{ fontSize:14, color:severity.c }}>{severity.l}</span></div>
          </div>
          <div style={{ textAlign:"right", fontSize:11, color:C.textMid }}>out of {maxScore}</div>
        </div>
      )}

      {/* Disclaimer */}
      <div style={{ marginTop:16, fontSize:11, color:C.textMid, lineHeight:1.6, fontStyle:"italic" }}>
        This questionnaire is for clinical monitoring purposes only and is not a diagnosis. Your responses are confidential and shared only with your clinician and care coordinator.
      </div>

      {/* Actions */}
      <div style={{ display:"flex", gap:10, marginTop:20 }}>
        <Btn onClick={handleSubmit} disabled={!allAnswered}>
          Submit {type==="PHQ9"?"PHQ-9":"GAD-7"}
        </Btn>
        {onCancel && <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>}
      </div>
    </div>
  );
};

// ── Assessment Send View ──────────────────────────────────────────────────────
const AssessmentSendView = ({ db, setDb, practiceId = null }) => {
  const [activeForm, setActiveForm] = useState(null); // { clientId, type } — in-person
  const [msgModal,   setMsgModal]   = useState(null); // { client, type } — remote send
  const [tab,        setTab]        = useState("email");

  const BASE_URL = "https://ops.luminatherapyalliance.com";

  const visibleClients = practiceId
    ? db.clients.filter(c => c.practiceId === practiceId && c.status === "active")
    : db.clients.filter(c => c.status === "active");

  // Get latest completed assessment for a client+type
  const lastCompleted = (clientId, type) =>
    db.assessments
      .filter(a => a.clientId===clientId && a.type===type && a.completed===true && a.score!==null)
      .sort((a,b) => b.date.localeCompare(a.date))[0] || null;

  // Get pending (sent but not completed) assessment
  const pendingAssess = (clientId, type) =>
    db.assessments
      .filter(a => a.clientId===clientId && a.type===type && a.completed===false && a.token)
      .sort((a,b) => b.sentAt?.localeCompare(a.sentAt))[0] || null;

  const daysSince = (d) => d ? Math.floor((new Date() - new Date(d)) / (1000*60*60*24)) : null;

  const getStatus = (clientId, type) => {
    const pending = pendingAssess(clientId, type);
    if (pending) return { label:`⏳ Sent ${pending.sentAt||"—"} · awaiting response`, color:"#8B5E00", pending:true };
    const last = lastCompleted(clientId, type);
    if (!last) return { label:"⚠ Never completed", color:"#D4721A", due:true };
    const days = daysSince(last.date);
    if (days >= 28) return { label:`⚠ Due (last: ${last.date})`, color:"#D4721A", due:true };
    return { label:`✓ ${days}d ago · score ${last.score}`, color:C.tealGreen, due:false };
  };

  // Generate a token and create a pending assessment record
  const createToken = (clientId, type) => {
    const token = `lta_${clientId}_${type}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const record = {
      id: `a_${Date.now()}`, clientId, type,
      date: new Date().toISOString().split("T")[0],
      sentAt: new Date().toISOString().split("T")[0],
      score: null, answers: null, completed: false, token,
    };
    setDb(d => ({ ...d, assessments: [...d.assessments, record] }));
    return token;
  };

  // Complete a pending assessment (called when client submits via in-person form)
  const handleFormSubmit = (answers, score) => {
    const { clientId, type } = activeForm;
    // Mark any pending record for this client+type as completed, or create new
    setDb(d => {
      const pending = d.assessments.find(a => a.clientId===clientId && a.type===type && !a.completed);
      if (pending) {
        return { ...d, assessments: d.assessments.map(a => a.id===pending.id
          ? { ...a, score, answers, completed:true, date: new Date().toISOString().split("T")[0] }
          : a
        )};
      }
      return { ...d, assessments: [...d.assessments, {
        id:`a_${Date.now()}`, clientId, type,
        date: new Date().toISOString().split("T")[0],
        score, answers, completed:true, token:null,
      }]};
    });
    setTimeout(() => setActiveForm(null), 3500);
  };

  const genEmail = (c, type, token) => {
    const link = `${BASE_URL}/assess/${token}`;
    const name = c.clientName || "there";
    const typeName = type==="PHQ9" ? "PHQ-9 (depression screening, 9 questions)" : "GAD-7 (anxiety screening, 7 questions)";
    return {
      subject: `Your ${type==="PHQ9"?"Depression":"Anxiety"} Check-In — Lumina Therapy Alliance`,
      body: `Hello ${name},

As part of your mental health care through Lumina Therapy Alliance, we ask that you complete a brief ${typeName} every four weeks. This takes about 2 minutes and helps your clinician track your progress.

Please complete your assessment here:
${link}

This link is private and unique to you. It will work on your phone, tablet, or computer. Your responses are confidential and will only be shared with your clinician and care coordinator.

If you have any questions or concerns, please contact us:
Email: drselling@luminatherapyalliance.com
Phone: (718) 757-7033

Thank you,
Lumina Therapy Alliance Care Team`
    };
  };

  const genText = (c, type, token) => {
    const link = `${BASE_URL}/assess/${token}`;
    return `Lumina Therapy Alliance: Hi ${c.clientName?.split(" ")[0]||"there"}, your ${type==="PHQ9"?"depression (PHQ-9)":"anxiety (GAD-7)"} check-in is ready. Takes 2 min: ${link}  Questions? Call (718) 757-7033.`;
  };

  // If in-person form is open
  if (activeForm) {
    const client = db.clients.find(c => c.id === activeForm.clientId);
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={()=>setActiveForm(null)} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:4, padding:"6px 12px", fontSize:12, color:C.textMid, cursor:"pointer", fontFamily:"Arial,sans-serif" }}>← Back</button>
          <div style={{ fontSize:13, color:C.textMid }}>In-person assessment — <strong style={{ color:C.textDark }}>{client?.clientName||client?.anonId}</strong></div>
        </div>
        <div style={{ ...card, padding:18 }}>
          <AssessmentForm type={activeForm.type} clientName={client?.clientName||""} onSubmit={handleFormSubmit} onCancel={()=>setActiveForm(null)}/>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SH title="Send Assessments" sub="PHQ-9 & GAD-7 · remote link or in-person"/>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
        <div style={{ background:`${C.teal}0d`, border:`1px solid ${C.teal}35`, borderRadius:5, padding:"12px 14px", fontSize:12, color:C.tealDark, lineHeight:1.7 }}>
          <strong>💻 Remote clients:</strong> Click <strong>Send Link</strong> — generates a unique personal link and ready-to-copy email or text. Client completes it on their own device. Score saves automatically when they submit.
        </div>
        <div style={{ background:`${C.tealGreen}0d`, border:`1px solid ${C.tealGreen}35`, borderRadius:5, padding:"12px 14px", fontSize:12, color:C.tealDark, lineHeight:1.7 }}>
          <strong>🏢 In-person clients:</strong> Click <strong>Start Now</strong> to open the form right here. Hand device to client or complete together. Score saves immediately on submit.
        </div>
      </div>

      <div style={{ ...card, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr style={{ background:C.cream }}>
            {["Client","Practice / Modality","PHQ-9","GAD-7","Actions"].map((h,i)=>(
              <th key={i} style={{ ...TH, textAlign:"left" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {visibleClients.map((c, i) => {
              const prac   = db.practices.find(p=>p.id===c.practiceId);
              const phqSt  = getStatus(c.id, "PHQ9");
              const gadSt  = getStatus(c.id, "GAD7");
              return (
                <tr key={c.id} style={{ background:i%2===1?C.bgPage:C.white }}>
                  <td style={{ ...TD(false) }}>
                    <div style={{ fontWeight:600, color:C.textDark }}>{c.clientName||<span style={{color:C.border}}>—</span>}</div>
                    <div style={{ fontSize:10, fontFamily:"monospace", color:C.teal, marginTop:2 }}>{c.anonId}</div>
                  </td>
                  <td style={{ ...TD(false), fontSize:12 }}>
                    <div>{prac?.name}</div>
                    <ModalityBadge modality={c.modality}/>
                  </td>
                  <td style={{ ...TD(false) }}>
                    <div style={{ fontSize:11, fontWeight:600, color:phqSt.color }}>{phqSt.label}</div>
                  </td>
                  <td style={{ ...TD(false) }}>
                    <div style={{ fontSize:11, fontWeight:600, color:gadSt.color }}>{gadSt.label}</div>
                  </td>
                  <td style={{ ...TD(false) }}>
                    <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                      {/* Remote send */}
                      <Btn variant="primary" small onClick={()=>{ setMsgModal({client:c,type:"PHQ9",token:createToken(c.id,"PHQ9")}); setTab("email"); }}>
                        📧 PHQ-9 Link
                      </Btn>
                      <Btn variant="primary" small onClick={()=>{ setMsgModal({client:c,type:"GAD7",token:createToken(c.id,"GAD7")}); setTab("email"); }}>
                        📧 GAD-7 Link
                      </Btn>
                      {/* In-person */}
                      {c.modality==="in-person" && <>
                        <Btn variant="ghost" small onClick={()=>setActiveForm({clientId:c.id,type:"PHQ9"})}>Start PHQ-9</Btn>
                        <Btn variant="ghost" small onClick={()=>setActiveForm({clientId:c.id,type:"GAD7"})}>Start GAD-7</Btn>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Remote send modal */}
      {msgModal && (() => {
        const { client:c, type, token } = msgModal;
        const email = genEmail(c, type, token);
        const text  = genText(c, type, token);
        const link  = `${BASE_URL}/assess/${token}`;
        const msg   = tab==="email" ? `Subject: ${email.subject}\n\n${email.body}` : text;
        return (
          <Modal title={`Send ${type==="PHQ9"?"PHQ-9":"GAD-7"} Link — ${c.clientName||c.anonId}`} onClose={()=>setMsgModal(null)}>
            <div style={{ background:`${C.teal}0d`, border:`1px solid ${C.teal}35`, borderRadius:4, padding:"9px 12px", fontSize:12, color:C.tealDark, marginBottom:14, lineHeight:1.6 }}>
              A unique assessment link has been generated. Copy the message below and send from your email or phone. The assessment will appear as <strong>pending</strong> until the client submits it.
            </div>

            {/* Link preview */}
            <div style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:"9px 12px", marginBottom:14, display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
              <span style={{ fontSize:11, fontFamily:"monospace", color:C.textDark, wordBreak:"break-all" }}>{link}</span>
              <button onClick={()=>navigator.clipboard?.writeText(link)} style={{ flexShrink:0, background:"none", border:`1px solid ${C.border}`, borderRadius:3, padding:"3px 8px", fontSize:11, color:C.teal, cursor:"pointer", fontFamily:"Arial,sans-serif" }}>Copy Link</button>
            </div>

            {/* Email / Text tabs */}
            <div style={{ display:"flex", gap:0, marginBottom:12, border:`1px solid ${C.border}`, borderRadius:4, overflow:"hidden" }}>
              {[["email","📧 Email"],["text","💬 Text"]].map(([v,l])=>(
                <button key={v} onClick={()=>setTab(v)} style={{ flex:1, padding:"8px", fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"Arial,sans-serif", background:tab===v?C.teal:C.white, color:tab===v?C.white:C.textMid, border:"none", borderRight:v==="email"?`1px solid ${C.border}`:"none" }}>{l}</button>
              ))}
            </div>
            <div style={{ background:C.bgPage, border:`1px solid ${C.border}`, borderRadius:4, padding:12, fontSize:12, color:C.textDark, whiteSpace:"pre-wrap", lineHeight:1.7, maxHeight:240, overflowY:"auto", fontFamily:tab==="text"?"Arial,sans-serif":"monospace", marginBottom:12 }}>{msg}</div>
            <div style={{ fontSize:11, color:C.textMid, marginBottom:14 }}>
              {tab==="email" ? `To: ${c.email||"⚠ no email on file"}` : `To: ${c.phone||"⚠ no phone on file"}`}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Btn onClick={()=>{ navigator.clipboard?.writeText(msg); setMsgModal(null); }}>
                Copy {tab==="email"?"Email":"Text"} & Close
              </Btn>
              <Btn variant="secondary" onClick={()=>setMsgModal(null)}>Cancel</Btn>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
};

// ── Banking View (Admin only) ─────────────────────────────────────────────────
const BankingView = ({ db, setDb }) => {
  const [pracModal, setPracModal] = useState(null);
  const [empModal, setEmpModal]   = useState(null);
  const [bForm, setBForm]         = useState({ bankName:"", routing:"", account:"", accountType:"checking", billingContact:"", billingEmail:"" });

  const savePracBanking = () => {
    setDb(d=>({...d, practices:d.practices.map(p=>p.id===pracModal?{...p,banking:bForm}:p)}));
    setPracModal(null);
  };
  const saveEmpBanking = () => {
    setDb(d=>({...d, employers:d.employers.map(e=>e.id===empModal?{...e,banking:bForm}:e)}));
    setEmpModal(null);
  };
  const openPrac = (p) => { setBForm(p.banking||{bankName:"",routing:"",account:"",accountType:"checking",billingContact:"",billingEmail:""}); setPracModal(p.id); };
  const openEmp  = (e) => { setBForm(e.banking||{bankName:"",routing:"",account:"",accountType:"checking",billingContact:"",billingEmail:""}); setEmpModal(e.id); };

  const mask = (s) => s ? "••••••" + String(s).slice(-4) : "—";

  const BankingCard = ({ entity, type, onEdit }) => {
    const b = entity.banking;
    return (
      <div style={{ ...card, padding:16, marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: b?12:0 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{entity.name}</div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>{type==="practice"?entity.city:entity.billing?.toUpperCase()}</div>
          </div>
          <Btn variant={b?"secondary":"primary"} small onClick={onEdit}>{b?"Edit Banking":"+ Add Banking"}</Btn>
        </div>
        {b ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, paddingTop:12, borderTop:`1px solid ${C.border}` }}>
            {[["Bank",b.bankName||"—"],["Routing",b.routing||"—"],["Account",mask(b.account)],["Type",(b.accountType||"—")],["Billing Contact",b.billingContact||"—"],["Billing Email",b.billingEmail||"—"]].map(([l,v])=>(
              <div key={l}>
                <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{l}</div>
                <div style={{ fontSize:12, color:C.textDark }}>{v}</div>
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize:12, color:C.border, fontStyle:"italic" }}>No banking information on file</div>}
      </div>
    );
  };

  const BankForm = ({ title, onSave, onClose }) => (
    <Modal title={title} onClose={onClose}>
      <div style={{ background:"#FFF3E0", border:"1px solid #F0A500", borderRadius:4, padding:"8px 12px", fontSize:12, color:"#8B5E00", marginBottom:14 }}>
        🔒 Banking information is visible to Lumina admin only. Never shared with employers or other practices.
      </div>
      <Inp label="Bank Name" value={bForm.bankName} onChange={e=>setBForm(f=>({...f,bankName:e.target.value}))} placeholder="Chase, Bank of America..."/>
      <Inp label="Routing Number" value={bForm.routing} onChange={e=>setBForm(f=>({...f,routing:e.target.value}))} placeholder="9 digits"/>
      <Inp label="Account Number" value={bForm.account} onChange={e=>setBForm(f=>({...f,account:e.target.value}))} placeholder="Account number"/>
      <Sel label="Account Type" value={bForm.accountType} onChange={e=>setBForm(f=>({...f,accountType:e.target.value}))}
        options={[{value:"checking",label:"Checking"},{value:"savings",label:"Savings"}]}/>
      <Inp label="Billing Contact Name" value={bForm.billingContact} onChange={e=>setBForm(f=>({...f,billingContact:e.target.value}))}/>
      <Inp label="Billing Email" type="email" value={bForm.billingEmail} onChange={e=>setBForm(f=>({...f,billingEmail:e.target.value}))}/>
      <Btn onClick={onSave} disabled={!bForm.bankName||!bForm.routing||!bForm.account}>Save Banking Info</Btn>
    </Modal>
  );

  return (
    <div>
      <SH title="Banking" sub="Practice payouts & employer payments — admin only"/>
      <div style={{ background:"#FCE8E8", border:"1px solid #D9534F", borderRadius:5, padding:"10px 14px", fontSize:12, color:"#B03A3A", marginBottom:20 }}>
        🔒 This page contains sensitive financial information. All banking details are encrypted and visible to Lumina admin only.
      </div>
      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, marginBottom:10 }}>Alliance Practices — ACH Payout Accounts</h3>
      {db.practices.map(p => <BankingCard key={p.id} entity={p} type="practice" onEdit={()=>openPrac(p)}/>)}
      <h3 style={{ fontSize:14, fontWeight:700, color:C.textDark, margin:"24px 0 10px" }}>Employers — ACH Payment Accounts</h3>
      {db.employers.filter(e=>e.billing==="ach").map(e => <BankingCard key={e.id} entity={e} type="employer" onEdit={()=>openEmp(e)}/>)}
      {db.employers.filter(e=>e.billing!=="ach").map(e => (
        <div key={e.id} style={{ ...card, padding:14, marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div><div style={{ fontWeight:700, fontSize:13, color:C.textDark }}>{e.name}</div><div style={{ fontSize:11, color:C.textMid, marginTop:1 }}>INVOICE billing — no ACH banking needed</div></div>
          <span style={{ fontSize:11, background:C.cream, border:`1px solid ${C.border}`, color:C.textMid, padding:"3px 8px", borderRadius:3 }}>Invoice</span>
        </div>
      ))}
      {pracModal && <BankForm title={`Banking — ${db.practices.find(p=>p.id===pracModal)?.name}`} onSave={savePracBanking} onClose={()=>setPracModal(null)}/>}
      {empModal  && <BankForm title={`Banking — ${db.employers.find(e=>e.id===empModal)?.name}`}  onSave={saveEmpBanking}  onClose={()=>setEmpModal(null)}/>}
    </div>
  );
};

// ── Employer Portal ───────────────────────────────────────────────────────────
const EmployerPortalView = ({ db, employerId }) => {
  const [tab, setTab] = useState("invoices");
  const emp = db.employers.find(e => e.id === employerId);
  if (!emp) return <div style={{ color:C.textMid, padding:20 }}>Employer not found.</div>;

  const sessionInvoices = db.invoices.filter(i => i.employerId === employerId).sort((a,b)=>b.period.localeCompare(a.period));
  const adminFeeInvs    = (db.adminFees||[]).filter(f => f.employerId === employerId).sort((a,b)=>b.invoiceDate.localeCompare(a.invoiceDate));
  const empClients      = db.clients.filter(c => c.employerId === employerId);
  const empSessions     = db.sessions.filter(s => s.employerId === employerId);
  const empAssessments  = db.assessments.filter(a => empClients.some(c=>c.id===a.clientId) && a.completed===true && a.score!==null && a.score!==undefined);

  const totalOwed = [...sessionInvoices, ...adminFeeInvs].filter(i=>["sent","overdue"].includes(i.status)).reduce((s,i)=>s+(i.totalCents||i.feeCents||0),0);
  const totalPaid = [...sessionInvoices, ...adminFeeInvs].filter(i=>i.status==="paid").reduce((s,i)=>s+(i.totalCents||i.feeCents||0),0);

  const fl=(type)=>{
    const m={};
    empAssessments.filter(a=>a.type===type&&a.completed).forEach(a=>{
      if(!m[a.clientId]) m[a.clientId]={f:a,l:a};
      else { if(a.date<m[a.clientId].f.date) m[a.clientId].f=a; if(a.date>m[a.clientId].l.date) m[a.clientId].l=a; }
    });
    return m;
  };
  const phq=fl("PHQ9"), gad=fl("GAD7");
  const avg=(vs)=>vs.length?(vs.reduce((s,v)=>s+v,0)/vs.length).toFixed(1):"—";
  const pct=(m)=>{ const ids=Object.keys(m); if(!ids.length) return "—"; const n=ids.filter(id=>m[id].f.score-m[id].l.score>=5).length; return `${Math.round((n/ids.length)*100)}%`; };
  const phqI=avg(Object.values(phq).map(d=>d.f.score)), phqL=avg(Object.values(phq).map(d=>d.l.score));
  const gadI=avg(Object.values(gad).map(d=>d.f.score)), gadL=avg(Object.values(gad).map(d=>d.l.score));

  const TABS = [["invoices","Invoices"],["roi","Wellness Report"],["utilization","Utilization"]];

  return (
    <div>
      {/* Employer header */}
      <div style={{ ...card, overflow:"hidden", marginBottom:20 }}>
        <div style={{ background:C.tealDark, padding:"18px 22px" }}>
          <div style={{ fontSize:10, color:"#A8D5D5", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Employer Portal</div>
          <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{emp.name}</div>
          <div style={{ fontSize:12, color:"#A8D5D5", marginTop:3 }}>{emp.contact} · {emp.email}</div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:0 }}>
          {[["Total Paid",fmt(totalPaid)],["Currently Owed",fmt(totalOwed)],["Employees Enrolled",empClients.length],["Sessions Used",empSessions.length]].map(([l,v],i)=>(
            <div key={l} style={{ padding:"13px 16px", borderRight:i<3?`1px solid ${C.border}`:"none", borderTop:`1px solid ${C.border}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:3 }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:700, color:l==="Currently Owed"&&totalOwed>0?"#D4721A":C.tealDark, fontFamily:"monospace" }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:18 }}>
        {TABS.map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{ padding:"7px 16px", borderRadius:20, fontSize:12, fontWeight:tab===v?700:500, cursor:"pointer", background:tab===v?C.teal:C.white, color:tab===v?C.white:C.textMid, border:`1px solid ${tab===v?C.teal:C.border}` }}>{l}</button>
        ))}
      </div>

      {/* Invoices tab */}
      {tab==="invoices"&&<div>
        {totalOwed>0&&<div style={{ background:"#FFF3E0", border:"1px solid #F0A500", borderRadius:4, padding:"10px 14px", fontSize:13, color:"#8B5E00", marginBottom:14, fontWeight:600 }}>
          💰 You have {fmt(totalOwed)} currently outstanding. Please remit payment at your earliest convenience.
        </div>}
        <h3 style={{ fontSize:13, fontWeight:700, color:C.textDark, marginBottom:10 }}>Monthly Session Invoices</h3>
        <div style={card}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.cream }}>
              {[["Period"],["Amount",true],["Status"],["Due Date"]].map((h,i)=><th key={i} style={{...TH,textAlign:i===1?"right":"left"}}>{h}</th>)}
            </tr></thead>
            <tbody>{sessionInvoices.map((inv,i)=>(
              <tr key={inv.id} style={{ background:i%2===1?C.bgPage:C.white, borderBottom:`1px solid ${C.border}` }}>
                <td style={{ ...TD(false), fontFamily:"monospace" }}>{inv.period}</td>
                <td style={{ ...TD(true), fontFamily:"monospace", fontWeight:700, color:C.tealDark }}>{fmt(inv.totalCents)}</td>
                <td style={TD(false)}><Badge status={inv.status}/></td>
                <td style={{ ...TD(false), color:C.textMid, fontSize:12 }}>—</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <h3 style={{ fontSize:13, fontWeight:700, color:C.textDark, margin:"20px 0 10px" }}>Annual Administrative Fee Invoices</h3>
        <div style={card}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:C.cream }}>
              {[["Period"],["Amount",true],["Status"],["Due Date"],["Paid Date"]].map((h,i)=><th key={i} style={{...TH,textAlign:i===1?"right":"left"}}>{h}</th>)}
            </tr></thead>
            <tbody>{adminFeeInvs.map((f,i)=>(
              <tr key={f.id} style={{ background:i%2===1?C.bgPage:C.white, borderBottom:`1px solid ${C.border}` }}>
                <td style={{ ...TD(false), fontSize:12 }}>{f.periodLabel}</td>
                <td style={{ ...TD(true), fontFamily:"monospace", fontWeight:700, color:C.tealDark }}>{fmt(f.feeCents)}</td>
                <td style={TD(false)}><Badge status={f.status}/></td>
                <td style={{ ...TD(false), fontFamily:"monospace", fontSize:12, color:C.textMid }}>{f.dueDate||"—"}</td>
                <td style={{ ...TD(false), fontFamily:"monospace", fontSize:12, color:C.tealGreen }}>{f.paidDate||"—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <div style={{ marginTop:14, fontSize:11, color:C.textMid }}>
          Questions about your invoices? Contact Lumina Therapy Alliance at drselling@luminatherapyalliance.com or (718) 757-7033.
        </div>
      </div>}

      {/* ROI / Wellness tab — same as admin ROI but for this employer */}
      {tab==="roi"&&<div>
        <div style={{ ...card, overflow:"hidden" }}>
          <div style={{ background:C.tealDark, padding:"20px 24px" }}>
            <div style={{ fontSize:10, color:C.tealMid, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:5, fontWeight:700 }}>Lumina Therapy Alliance</div>
            <div style={{ fontSize:18, fontWeight:700, color:C.white }}>{emp.name}</div>
            <div style={{ fontSize:12, color:"#A8D5D5", marginTop:3 }}>Employee Wellness Report · March 2026</div>
            <div style={{ fontSize:11, color:"#7ABCBC", marginTop:5 }}>All data de-identified · HIPAA compliant · aggregate only · no individual names disclosed</div>
          </div>
          <div style={{ padding:22 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:22 }}>
              {[{label:"PHQ-9 · Depression",i:phqI,l:phqL,p:pct(phq),color:C.teal},{label:"GAD-7 · Anxiety",i:gadI,l:gadL,p:pct(gad),color:C.tealGreen}].map(({label,i,l,p,color})=>(
                <div key={label} style={{ background:C.cream, border:`1px solid ${C.border}`, borderRadius:4, padding:16 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:C.textDark, marginBottom:12 }}>{label}</div>
                  {[["Avg intake score",i],["Avg current score",l],["Clinically improved (≥5pt)",p]].map(([lbl,val])=>(
                    <div key={lbl} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:8, paddingBottom:8, borderBottom:`1px solid ${C.border}` }}>
                      <span style={{ color:C.textMid }}>{lbl}</span><strong style={{ color, fontFamily:"monospace" }}>{val}</strong>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:C.textMid, borderTop:`1px solid ${C.border}`, paddingTop:14 }}>
              All data is de-identified and reported in aggregate only, in compliance with HIPAA. No individual employee names or identifying information is disclosed in this report.
            </div>
          </div>
        </div>
      </div>}

      {/* Utilization tab */}
      {tab==="utilization"&&<div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:18 }}>
          {[["Employees Enrolled",empClients.length,C.teal],["Total Sessions",empSessions.length,C.tealDark],["Avg Sessions/Employee",empClients.length?(empSessions.length/empClients.length).toFixed(1):"—",C.tealGreen]].map(([l,v,c])=>(
            <div key={l} style={{ background:C.white, border:`1px solid ${C.border}`, borderRadius:5, padding:"16px 18px", borderTop:`3px solid ${c}` }}>
              <div style={{ fontSize:9, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 }}>{l}</div>
              <div style={{ fontSize:22, fontWeight:700, color:C.textDark, fontFamily:"monospace" }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ ...card, padding:16 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Sessions by Type</div>
          {["individual","couple","psychiatry"].map(t=>{
            const n = empSessions.filter(s=>s.type===t).length;
            return <div key={t} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              <div style={{ width:80, fontSize:12, color:C.textDark, textTransform:"capitalize" }}>{t}</div>
              <div style={{ flex:1, background:C.cream, borderRadius:2, height:6, border:`1px solid ${C.border}` }}>
                <div style={{ width:`${empSessions.length?(n/empSessions.length)*100:0}%`, height:"100%", background:C.teal, borderRadius:2 }}/>
              </div>
              <span style={{ fontSize:11, fontFamily:"monospace", color:C.textDark, minWidth:20 }}>{n}</span>
            </div>;
          })}
          <div style={{ marginTop:14, fontSize:11, color:C.textMid, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
            Session breakdown by modality — In-Person: <strong>{empSessions.filter(s=>s.modality==="in-person").length}</strong> · Virtual: <strong>{empSessions.filter(s=>s.modality==="virtual").length}</strong>
          </div>
        </div>
      </div>}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// APP
// ════════════════════════════════════════════════════════════════════════════
const ADMIN_NAV = [
  {id:"dashboard",l:"Dashboard"},{id:"referrals",l:"Referrals ✦"},
  {id:"employers",l:"Employers"},{id:"practices",l:"Practices"},
  {id:"clients",l:"Clients"},{id:"sessions",l:"Sessions"},
  {id:"assessments",l:"Assessments"},{id:"send-assessments",l:"Send Assessments"},
  {id:"banking",l:"Banking 🔒"},{id:"billing",l:"Billing"},
  {id:"payouts",l:"Payouts"},{id:"roi",l:"ROI Reports"},
];

export default function App() {
  const [db,setDb]           = useState(null);
  const [view,setView]       = useState("dashboard");
  const [role,setRole]       = useState("admin");
  const [loading,setLoading] = useState(true);
  const [navOpen,setNavOpen] = useState(false);
  const isMobile             = useIsMobile();

  useEffect(()=>{ loadState().then(s=>{ setDb(s||seed); setLoading(false); }); },[]);
  useEffect(()=>{ if(db) saveState(db); },[db]);

  if(loading) return (
    <div style={{minHeight:"100vh",background:C.bgPage,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Arial,sans-serif"}}>
      <span style={{color:C.teal,fontSize:14}}>Loading Lumina Ops...</span>
    </div>
  );

  const isPractice   = db.practices.some(p => p.id === role);
  const isEmployer   = db.employers.some(e => e.id === role);
  const currentPrac  = isPractice ? db.practices.find(p=>p.id===role) : null;
  const currentEmp   = isEmployer ? db.employers.find(e=>e.id===role) : null;
  const navLabel     = isPractice ? currentPrac?.name : isEmployer ? currentEmp?.name : ADMIN_NAV.find(n=>n.id===view)?.l;

  const handleNav = (id) => { setView(id); setNavOpen(false); };
  const handleRole = (r) => {
    setRole(r);
    if (r === "admin") setView("dashboard");
    else if (db.employers.some(e => e.id === r)) setView("employer-portal");
    else setView("practice");
    setNavOpen(false);
  };

  const Sidebar = () => (
    <div style={{
      width: isMobile ? "100%" : 210,
      flexShrink: 0,
      background: C.tealDark,
      display: "flex",
      flexDirection: "column",
      ...(isMobile ? {
        position:"fixed", top:0, left:0, right:0, bottom:0, zIndex:200,
        overflowY:"auto",
        transform: navOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.22s ease",
      } : {})
    }}>
      <div style={{padding:"20px 18px 16px",borderBottom:"1px solid rgba(255,255,255,0.12)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:C.white,letterSpacing:"0.05em"}}>LUMINA</div>
          <div style={{fontSize:10,color:"#A8D5D5",marginTop:2,letterSpacing:"0.07em"}}>THERAPY ALLIANCE</div>
          <div style={{marginTop:10,fontSize:9,color:"#7ABCBC",textTransform:"uppercase",letterSpacing:"0.08em",background:"rgba(255,255,255,0.08)",padding:"3px 7px",borderRadius:3,display:"inline-block"}}>
            {isPractice ? "Practice Portal" : isEmployer ? "Employer Portal" : "Admin Portal"}
          </div>
        </div>
        {isMobile && (
          <button onClick={()=>setNavOpen(false)} style={{background:"none",border:"none",color:"#A8D5D5",fontSize:22,cursor:"pointer",padding:"4px 8px"}}>✕</button>
        )}
      </div>

      <nav style={{flex:1,padding:"10px 8px",overflowY:"auto"}}>
        {isPractice ? (
          <>
            <button onClick={()=>handleNav("practice")} style={{width:"100%",display:"flex",alignItems:"center",padding:"11px 12px",borderRadius:4,marginBottom:1,fontSize:13,fontWeight:view==="practice"?700:400,color:C.white,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",textAlign:"left",fontFamily:"Arial,sans-serif"}}>My Referrals</button>
            <button onClick={()=>handleNav("practice-clients")} style={{width:"100%",display:"flex",alignItems:"center",padding:"11px 12px",borderRadius:4,marginBottom:1,fontSize:13,fontWeight:view==="practice-clients"?700:400,color:view==="practice-clients"?C.white:"#A8D5D5",background:view==="practice-clients"?"rgba(255,255,255,0.15)":"transparent",border:view==="practice-clients"?"1px solid rgba(255,255,255,0.2)":"1px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"Arial,sans-serif"}}>My Clients</button>
            <button onClick={()=>handleNav("practice-assessments")} style={{width:"100%",display:"flex",alignItems:"center",padding:"11px 12px",borderRadius:4,marginBottom:1,fontSize:13,fontWeight:view==="practice-assessments"?700:400,color:view==="practice-assessments"?C.white:"#A8D5D5",background:view==="practice-assessments"?"rgba(255,255,255,0.15)":"transparent",border:view==="practice-assessments"?"1px solid rgba(255,255,255,0.2)":"1px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"Arial,sans-serif"}}>Send Assessments</button>
          </>
        ) : isEmployer ? (
          <button onClick={()=>handleNav("employer-portal")} style={{width:"100%",display:"flex",alignItems:"center",padding:"11px 12px",borderRadius:4,marginBottom:1,fontSize:13,fontWeight:700,color:C.white,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.2)",cursor:"pointer",textAlign:"left",fontFamily:"Arial,sans-serif"}}>My Portal</button>
        ) : (
          ADMIN_NAV.map(n=>(
            <button key={n.id} onClick={()=>handleNav(n.id)} style={{width:"100%",display:"flex",alignItems:"center",padding:"11px 12px",borderRadius:4,marginBottom:1,fontSize:13,fontWeight:view===n.id?700:400,color:view===n.id?C.white:"#A8D5D5",background:view===n.id?"rgba(255,255,255,0.15)":"transparent",border:view===n.id?"1px solid rgba(255,255,255,0.2)":"1px solid transparent",cursor:"pointer",textAlign:"left",fontFamily:"Arial,sans-serif"}}>{n.l}</button>
          ))
        )}
      </nav>

      <div style={{padding:"12px 10px",borderTop:"1px solid rgba(255,255,255,0.12)"}}>
        <div style={{fontSize:9,color:"#7ABCBC",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:6}}>Switch View</div>
        <select value={role} onChange={e=>handleRole(e.target.value)}
          style={{width:"100%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:4,padding:"7px 8px",fontSize:11,color:C.white,fontFamily:"Arial,sans-serif",cursor:"pointer",outline:"none"}}>
          <option value="admin">🔑 Lumina Admin</option>
          <optgroup label="── Practices ──">
            {db.practices.map(p=><option key={p.id} value={p.id}>🏥 {p.name.length>24?p.name.slice(0,24)+"…":p.name}</option>)}
          </optgroup>
          <optgroup label="── Employers ──">
            {db.employers.map(e=><option key={e.id} value={e.id}>🏢 {e.name.length>24?e.name.slice(0,24)+"…":e.name}</option>)}
          </optgroup>
        </select>
        {isPractice  && <div style={{fontSize:10,color:"#A8D5D5",marginTop:5}}>{currentPrac?.city}</div>}
        {isEmployer  && <div style={{fontSize:10,color:"#A8D5D5",marginTop:5}}>Employer Portal</div>}
        {!isPractice && !isEmployer && <div style={{fontSize:10,color:"#7ABCBC",marginTop:5}}>Daniel Selling, Psy.D.</div>}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:isMobile?"column":"row",fontFamily:"Arial,sans-serif",background:C.bgPage}}>
      {isMobile && navOpen && <div onClick={()=>setNavOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:199}}/>}
      {!isMobile && <Sidebar/>}
      {isMobile && <Sidebar/>}

      <div style={{flex:1,overflowY:"auto",minWidth:0}}>
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:isMobile?"11px 16px":"11px 26px",display:"flex",alignItems:"center",justifyContent:"space-between",position:isMobile?"sticky":"static",top:0,zIndex:100}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {isMobile && <button onClick={()=>setNavOpen(true)} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:4,padding:"5px 9px",fontSize:16,cursor:"pointer",color:C.teal,lineHeight:1}}>☰</button>}
            <div style={{fontSize:isMobile?11:12,color:C.textMid}}>
              <span style={{color:C.teal,fontWeight:700}}>Lumina</span>
              <span style={{margin:"0 6px",color:C.border}}>›</span>
              <span style={{fontWeight:600,color:C.textDark}}>{navLabel}</span>
            </div>
          </div>
          <div style={{fontSize:11,color:C.textMid}}>Mar 2026</div>
        </div>

        <div style={{maxWidth:1080,margin:"0 auto",padding:isMobile?"16px 12px":"26px 26px"}}>
          {/* Employer portal */}
          {isEmployer && <EmployerPortalView db={db} employerId={role}/>}

          {/* Practice portal */}
          {isPractice && view==="practice"             && <PracticePortalView    db={db} setDb={setDb} practiceId={role}/>}
          {isPractice && view==="practice-clients"     && <ClientsView           db={db} setDb={setDb} practiceId={role}/>}
          {isPractice && view==="practice-assessments" && <AssessmentSendView    db={db} setDb={setDb} practiceId={role}/>}

          {/* Admin */}
          {!isPractice && !isEmployer && view==="dashboard"        && <DashboardView      db={db} setView={setView}/>}
          {!isPractice && !isEmployer && view==="referrals"        && <ReferralsView      db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="employers"        && <EmployersView      db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="practices"        && <PracticesView      db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="clients"          && <ClientsView        db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="sessions"         && <SessionsView       db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="assessments"      && <AssessmentsView    db={db}/>}
          {!isPractice && !isEmployer && view==="send-assessments" && <AssessmentSendView db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="banking"          && <BankingView        db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="billing"          && <BillingView        db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="payouts"          && <PayoutsView        db={db} setDb={setDb}/>}
          {!isPractice && !isEmployer && view==="roi"              && <ROIView            db={db}/>}
        </div>
      </div>
    </div>
  );
}
