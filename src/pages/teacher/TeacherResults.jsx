import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Brain, Loader, TrendingUp, AlertTriangle } from "lucide-react";
import { MOCK_STUDENTS } from "../../data/mockData";
import { teacherInsights } from "../../api/gpt4o";
import { AIBadge, PageHeader } from "../../components/UI";

const CONCEPTS = ["Fractions","Algebra","Geometry","Numbers","Ratios"];

export default function TeacherResults({ onBack }) {
  const [insights, setInsights] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState("score");

  const students  = MOCK_STUDENTS;
  const avg       = Math.round(students.reduce((s,st)=>s+st.score,0)/students.length);
  const highest   = Math.max(...students.map(s=>s.score));
  const lowest    = Math.min(...students.map(s=>s.score));
  const weakStudents = students.filter(s=>s.score<40).map(s=>s.name);

  const conceptData = CONCEPTS.map((c,i) => ({
    name: c,
    avg: Math.round(students.reduce((s,st)=>s+st.concepts[i],0)/students.length)
  }));

  useEffect(() => {
    const run = async () => {
      try {
        const data = await teacherInsights({ total: students.length, avgScore: avg, highest, lowest, conceptData, weakStudents });
        setInsights(data);
      } catch {
        setInsights({
          summary: `The class averaged ${avg}%. Overall performance is ${avg>=60?"satisfactory":"below expectations"} with significant variance.`,
          struggledConcepts: conceptData.sort((a,b)=>a.avg-b.avg).slice(0,3).map(c=>c.name),
          recommendations: ["Focus on common mistakes in next class","Provide extra practice material","Schedule one-on-one with weak students"],
          urgentAttention: weakStudents.slice(0,3),
        });
      } finally { setLoading(false); }
    };
    run();
  }, []);

  const sorted = [...students].sort((a,b) => sort==="name" ? a.name.localeCompare(b.name) : b[sort]-a[sort]);

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <PageHeader title="📊 Class Results" subtitle="AI-powered analysis of class performance" back="Dashboard" onBack={onBack}/>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[{label:"Class Average", val:`${avg}%`, color:"#0D9488"},{label:"Highest", val:`${highest}%`, color:"#10B981"},{label:"Lowest", val:`${lowest}%`, color:"#EF4444"}].map(s=>(
            <div key={s.label} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
          <h3 style={{ fontWeight: 'bold', color: '#1E293B', marginBottom: '16px', fontSize: '18px', margin: '0 0 16px 0' }}>Concept-wise Class Average</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={conceptData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <XAxis dataKey="name" tick={{fontSize:11}}/>
              <YAxis domain={[0,100]} tick={{fontSize:11}} tickFormatter={v=>`${v}%`}/>
              <Tooltip formatter={v=>[`${v}%`,"Avg"]}/>
              <Bar dataKey="avg" radius={[6,6,0,0]}>
                {conceptData.map((d,i)=><Cell key={i} fill={d.avg>=60?"#0D9488":d.avg>=40?"#F59E0B":"#EF4444"}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Brain size={20} color="#0D9488" />
            <h3 style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '18px', margin: 0 }}>AI Class Insights</h3>
            <AIBadge/>
          </div>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#94A3B8', fontSize: '14px', padding: '16px 0' }}>
              <Loader size={18} color="#94A3B8" style={{ animation: 'spin 1.5s linear infinite' }} />
              Analyzing class data with GPT-4o…
            </div>
          ) : insights && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '14px', color: '#334155', background: '#F8FAFC', borderRadius: '12px', padding: '16px', margin: 0 }}>{insights.summary}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#FEF2F2' }}>
                  <div style={{ fontWeight: '600', color: '#DC2626', fontSize: '14px', marginBottom: '8px' }}>😟 Struggled Concepts</div>
                  {insights.struggledConcepts?.map((c,i)=><div key={i} style={{ fontSize: '12px', color: '#B91C1C', marginBottom: '4px' }}>• {c}</div>)}
                </div>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#F0FDF4' }}>
                  <div style={{ fontWeight: '600', color: '#16A34A', fontSize: '14px', marginBottom: '8px' }}>📋 Recommendations</div>
                  {insights.recommendations?.map((r,i)=><div key={i} style={{ fontSize: '12px', color: '#15803D', marginBottom: '4px' }}>• {r}</div>)}
                </div>
                <div style={{ borderRadius: '12px', padding: '16px', background: '#FEFCE8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', color: '#A16207', fontSize: '14px', marginBottom: '8px' }}><AlertTriangle size={14}/>Urgent Attention</div>
                  {insights.urgentAttention?.length ? insights.urgentAttention.map((s,i)=><div key={i} style={{ fontSize: '12px', color: '#854D0E', marginBottom: '4px' }}>• {s}</div>) : <div style={{ fontSize: '12px', color: '#854D0E' }}>No students flagged</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '18px', margin: 0 }}>Student Results</h3>
            <select value={sort} onChange={e=>setSort(e.target.value)}
              style={{ fontSize: '14px', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '6px 12px', outline: 'none', background: '#FFFFFF', color: '#1E293B' }}>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="tabSwitches">Sort by Tab Switches</option>
            </select>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                  {["#","Name","Score","Tab Switches","Status"].map(h=>(
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '12px', fontWeight: 'bold', color: '#64748B', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((s,i)=>(
                  <tr key={s.id} style={{ borderBottom: '1px solid #F8FAFC', background: s.score < 40 ? '#FEF2F2' : 'transparent', transition: 'background 0.2s' }}>
                    <td style={{ padding: '10px 12px', color: '#94A3B8' }}>{i+1}</td>
                    <td style={{ padding: '10px 12px', fontWeight: '500', color: '#1E293B' }}>{s.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontWeight: 'bold', color: s.score>=75 ? '#10B981' : s.score>=40 ? '#F59E0B' : '#EF4444' }}>{s.score}%</span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {s.tabSwitches > 0 ? (
                        <span style={{ padding: '2px 8px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', background: s.tabSwitches>=3 ? '#FEE2E2' : '#FEFCE8', color: s.tabSwitches>=3 ? '#DC2626' : '#B45309', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          ⚠ {s.tabSwitches}
                        </span>
                      ) : <span style={{ color: '#22C55E', fontSize: '12px', fontWeight: 'bold' }}>✓ Clean</span>}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '16px', fontSize: '12px', fontWeight: '500', display: 'inline-block', background: s.status==="Submitted" ? '#DCFCE7' : '#DBEAFE', color: s.status==="Submitted" ? '#15803D' : '#1D4ED8' }}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
