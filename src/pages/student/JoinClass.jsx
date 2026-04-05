import { useState } from "react";
import { CheckCircle, Users } from "lucide-react";
import { PageHeader } from "../../components/UI";
import { toast } from "../../components/Toast";

export default function JoinClass({ onJoined, onBack }) {
  const [code, setCode]   = useState("");
  const [name, setName]   = useState("");
  const [joined, setJoined] = useState(false);

  const join = () => {
    if (code.trim().length !== 6) { toast.warn("Enter a valid 6-character class code"); return; }
    if (!name.trim()) { toast.warn("Please enter your name"); return; }
    setJoined(true);
    toast.success(`🎉 Welcome ${name}! You've joined the class.`);
    setTimeout(() => onJoined({ name, code }), 1200);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', background: '#F8FAFC', boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <button onClick={onBack} style={{ fontSize: '14px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '24px', background: 'transparent', border: 'none', cursor: 'pointer' }}>← Back</button>

        <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', border: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', background: 'linear-gradient(135deg,#6366f1,#7c3aed)', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>
              <Users size={22} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0D1B4B', margin: '0 0 4px 0' }}>Join Class</h2>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0 }}>Enter the code given by your teacher</p>
            </div>
          </div>

          {!joined ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Your Name</label>
                <input value={name} onChange={e=>setName(e.target.value)}
                  style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px 16px', fontSize: '14px', outline: 'none', background: '#FFFFFF', color: '#1E293B', boxSizing: 'border-box' }}
                  placeholder="e.g. Arjun Sharma"/>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#334155', marginBottom: '8px' }}>Class Code (6 characters)</label>
                <input
                  value={code} onChange={e=>setCode(e.target.value.toUpperCase())} maxLength={6}
                  style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '12px 16px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '24px', letterSpacing: '8px', outline: 'none', background: '#F8FAFC', color: '#0D1B4B', textTransform: 'uppercase', boxSizing: 'border-box' }}
                  placeholder="A1B2C3"/>
              </div>
              <button onClick={join}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', color: '#FFFFFF', fontWeight: 'bold', fontSize: '14px', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', marginTop: '8px', background: 'linear-gradient(135deg,#6366f1,#7c3aed)' }}>
                Join Class →
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <CheckCircle size={56} color="#10B981" style={{ margin: '0 auto 12px auto' }}/>
              <p style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '16px', margin: 0 }}>Joining class…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
