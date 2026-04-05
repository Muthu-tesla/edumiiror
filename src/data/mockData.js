// ── Mock fallback data ────────────────────────────────────────────────────────
export const MOCK_QUESTIONS = [
  { id:1, question:"What is 3/4 + 1/4?", options:{A:"1",B:"1/2",C:"3/8",D:"2/4"}, correct:"A", explanation:"When adding fractions with same denominator, add numerators: 3+1=4, so 4/4=1", concept:"Fractions", difficulty:"Easy" },
  { id:2, question:"Which fraction is equivalent to 2/3?", options:{A:"4/9",B:"6/9",C:"3/4",D:"2/4"}, correct:"B", explanation:"Multiply both numerator and denominator by 3: 2×3=6, 3×3=9, so 6/9", concept:"Fractions", difficulty:"Easy" },
  { id:3, question:"Newton's Second Law relates force to:", options:{A:"Energy × Time",B:"Mass × Acceleration",C:"Velocity × Distance",D:"Momentum / Volume"}, correct:"B", explanation:"F = ma. Force equals mass multiplied by acceleration.", concept:"Laws of Motion", difficulty:"Easy" },
  { id:4, question:"Which organelle is called the powerhouse of the cell?", options:{A:"Nucleus",B:"Ribosome",C:"Mitochondria",D:"Golgi Apparatus"}, correct:"C", explanation:"Mitochondria produce ATP through cellular respiration, supplying energy to the cell.", concept:"Cell Biology", difficulty:"Easy" },
  { id:5, question:"The value of √144 is:", options:{A:"12",B:"14",C:"11",D:"16"}, correct:"A", explanation:"12×12=144, so √144=12", concept:"Square Roots", difficulty:"Easy" },
  { id:6, question:"Which gas is most abundant in Earth's atmosphere?", options:{A:"Oxygen",B:"Carbon Dioxide",C:"Nitrogen",D:"Argon"}, correct:"C", explanation:"Nitrogen makes up ~78% of Earth's atmosphere, oxygen ~21%.", concept:"Atmosphere", difficulty:"Medium" },
  { id:7, question:"If 2x + 3 = 11, what is x?", options:{A:"3",B:"4",C:"5",D:"6"}, correct:"B", explanation:"2x = 11-3 = 8, so x = 4", concept:"Linear Equations", difficulty:"Easy" },
  { id:8, question:"The speed of light in vacuum is approximately:", options:{A:"3×10⁶ m/s",B:"3×10⁸ m/s",C:"3×10¹⁰ m/s",D:"3×10⁴ m/s"}, correct:"B", explanation:"The speed of light c ≈ 3×10⁸ m/s (300,000 km/s)", concept:"Wave Optics", difficulty:"Medium" },
  { id:9, question:"Photosynthesis occurs in which organelle?", options:{A:"Vacuole",B:"Nucleus",C:"Mitochondria",D:"Chloroplast"}, correct:"D", explanation:"Chloroplasts contain chlorophyll and are the site of photosynthesis.", concept:"Plant Biology", difficulty:"Easy" },
  { id:10, question:"What is the HCF of 12 and 18?", options:{A:"3",B:"6",C:"9",D:"12"}, correct:"B", explanation:"Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Highest common: 6", concept:"Number Theory", difficulty:"Medium" },
];

export const MOCK_STUDENTS = [
  { id:1, name:"Arjun S",    score:78, tabSwitches:0, status:"Submitted", progress:100, concepts:[60,40,40,80,60] },
  { id:2, name:"Priya M",    score:45, tabSwitches:2, status:"Submitted", progress:100, concepts:[40,20,60,100,80] },
  { id:3, name:"Ravi K",     score:62, tabSwitches:1, status:"Submitted", progress:100, concepts:[60,60,40,80,60] },
  { id:4, name:"Sneha R",    score:88, tabSwitches:0, status:"Submitted", progress:100, concepts:[40,60,80,100,80] },
  { id:5, name:"Kiran T",    score:91, tabSwitches:0, status:"Submitted", progress:100, concepts:[80,80,60,100,100] },
  { id:6, name:"Aisha B",    score:95, tabSwitches:0, status:"Submitted", progress:100, concepts:[100,100,100,100,100] },
  { id:7, name:"Dev P",      score:70, tabSwitches:1, status:"In Progress", progress:75, concepts:[60,40,60,80,80] },
  { id:8, name:"Meena L",    score:55, tabSwitches:3, status:"Submitted", progress:100, concepts:[40,80,60,60,80] },
  { id:9, name:"Raj T",      score:38, tabSwitches:4, status:"Submitted", progress:100, concepts:[20,40,20,60,40] },
  { id:10, name:"Lakshmi N", score:84, tabSwitches:0, status:"In Progress", progress:60, concepts:[80,60,80,100,80] },
];

export const EXAM_TYPES   = ["JEE", "NEET", "UPSC", "GMAT", "SAT", "Custom"];
export const SUBJECTS     = {
  JEE:    ["Physics", "Chemistry", "Mathematics"],
  NEET:   ["Biology", "Physics", "Chemistry"],
  UPSC:   ["History", "Geography", "Polity", "Economics", "Science"],
  GMAT:   ["Quant", "Verbal", "Data Insights"],
  SAT:    ["Math", "Reading", "Writing"],
  Custom: ["Mathematics", "Science", "English", "History"],
};
export const DIFFICULTIES = ["Easy", "Medium", "Hard", "Mixed"];
export const Q_COUNTS     = [5, 10, 15, 20];

export const MOCK_CLASSES = [
  { id:"C001", name:"Class 10 - Science", subject:"Science", code:"A1B2C3", students:24, tests:8 },
  { id:"C002", name:"JEE Batch 2025",     subject:"Physics",  code:"X9Y8Z7", students:18, tests:5 },
];

export const PAST_RESULTS = [
  { id:1, subject:"Physics",     topic:"Laws of Motion",    score:7,  total:10, date:"2026-03-28", examType:"JEE" },
  { id:2, subject:"Mathematics", topic:"Fractions",         score:4,  total:5,  date:"2026-03-25", examType:"JEE" },
  { id:3, subject:"Chemistry",   topic:"Periodic Table",    score:6,  total:10, date:"2026-03-22", examType:"NEET" },
];
