// ── Brand Colors (from Lumina_HL_Proposal_Document.docx) ─────────────────────
export const C = {
  tealDark:  '#1D6B6B',
  teal:      '#2A7F7F',
  tealMid:   '#3D9E9E',
  tealGreen: '#1D9E75',
  cream:     '#F5F0E8',
  textDark:  '#333333',
  textMid:   '#666666',
  white:     '#FFFFFF',
  border:    '#D5CFC4',
  bgPage:    '#F9F6F1',
}

// ── US States ─────────────────────────────────────────────────────────────────
export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','Washington DC',
  'West Virginia','Wisconsin','Wyoming',
]

// ── PSYPACT Participating States (2025) ───────────────────────────────────────
export const PSYPACT_STATES = new Set([
  'Alabama','Arizona','Arkansas','Colorado','Connecticut','Delaware',
  'Florida','Georgia','Idaho','Illinois','Indiana','Kansas','Kentucky','Maine',
  'Maryland','Michigan','Minnesota','Missouri','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','North Carolina','Ohio','Oklahoma','Pennsylvania',
  'Rhode Island','South Carolina','Tennessee','Texas','Utah','Virginia',
  'Washington','Washington DC','West Virginia','Wisconsin',
])

// ── Lumina In-Person Practice States ─────────────────────────────────────────
export const LUMINA_INPERSON_STATES = new Set([
  'New York','Pennsylvania','District of Columbia','California',
])

// ── Assessment Question Data ──────────────────────────────────────────────────
export const PHQ9_QUESTIONS = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
]

export const GAD7_QUESTIONS = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen',
]

export const FREQ_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
]

// ── Crisis resources (shown when show_crisis_resources=true or PHQ-9 >= 10) ───
export const CRISIS_RESOURCES = {
  lifeline: { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988' },
  textLine: { name: 'Crisis Text Line',             contact: 'Text HOME to 741741' },
}

export const PRESENTING_NEEDS = [
  'Anxiety','Depression','Couples / Relationship','Grief / Loss','Trauma / PTSD',
  'Work / Leadership Stress','Psychiatry / Medication','ADHD','Substance Use',
  'Family / Parenting','Life Transitions','Other',
]

export const SESSION_TYPES = [
  { value: 'individual', label: 'Individual Therapy' },
  { value: 'couple',     label: 'Couples Therapy' },
  { value: 'psychiatry', label: 'Psychiatry' },
]

export const STATUS_FLOW = ['pending','scheduled','active','discharged']

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── API Base URL ──────────────────────────────────────────────────────────────
// In development: proxied to http://localhost:8080 via vite.config.js
// In production: set VITE_API_URL in .env
export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1'

// ── Assessment public URL ─────────────────────────────────────────────────────
// Where the client-facing assessment form is hosted
export const ASSESS_BASE_URL = import.meta.env.VITE_ASSESS_URL || 'https://ops.luminatherapyalliance.com'
