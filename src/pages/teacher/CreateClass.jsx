import { useState } from "react";
import { Copy, CheckCircle } from "lucide-react";
import { PageHeader } from "../../components/UI";
import { toast } from "../../components/Toast";

const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

export default function CreateClass({ onBack }) {
  const [name,    setName]    = useState("");
  const [subject, setSubject] = useState("");
  const [code,    setCode]    = useState(genCode());
  const [created, setCreated] = useState(false);

  const create = () => {
    if (!name.trim() || !subject.trim()) { toast.warn("Please fill in all fields"); return; }
    setCreated(true);
    toast.success("✅ Class created successfully!");
  };

  return (
    <div style={{ minHeight: '100vh', padding: '32px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        <PageHeader title="Create New Class" subtitle="Set up a class and share the code with students" back="Dashboard" onBack={onBack}/>

        <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #F1F5F9' }}>
          {!created ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Class Name</label>
                <input value={name} onChange={e=>setName(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px 16px', fontSize: '14px', outline: 'none', background: '#FFFFFF', color: '#1E293B', boxSizing: 'border-box' }}
                  placeholder="e.g. Class 10 - Science Batch A"/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Subject</label>
                <input value={subject} onChange={e=>setSubject(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px 16px', fontSize: '14px', outline: 'none', background: '#FFFFFF', color: '#1E293B', boxSizing: 'border-box' }}
                  placeholder="e.g. Physics, Mathematics"/>
              </div>
              <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>Auto-generated Class Code</div>
                  <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '24px', letterSpacing: '2px', color: '#0D1B4B' }}>{code}</div>
                </div>
                <button onClick={() => setCode(genCode())} style={{ fontSize: '12px', color: '#0D9488', fontWeight: '500', background: 'transparent', border: 'none', cursor: 'pointer' }}>Regenerate</button>
              </div>
              <button onClick={create}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', color: '#FFFFFF', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg,#0D1B4B,#0D9488)' }}>
                Create Class
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={52} color="#10B981" style={{ margin: '0 auto 16px auto' }}/>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E293B', marginBottom: '8px', margin: 0 }}>Class Created!</h3>
              <p style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px' }}>Share this code with your students to join the class</p>
              <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '36px', letterSpacing: '4px', color: '#0D1B4B' }}>{code}</div>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(code); toast.success("Code copied!"); }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto', padding: '12px 24px', borderRadius: '12px', color: '#FFFFFF', fontWeight: '600', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
                <Copy size={16} color="#FFFFFF" /> Copy Class Code
              </button>
              <button onClick={onBack} style={{ marginTop: '16px', fontSize: '14px', color: '#94A3B8', background: 'transparent', border: 'none', cursor: 'pointer' }}>Back to Dashboard</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
