import { Loader } from "lucide-react";

export function Spinner({ text = "Loading…" }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '48px 0' }}>
      <Loader size={48} color="#0D9488" style={{ animation: 'spin 1.5s linear infinite' }} />
      <p style={{ color: '#1E293B', fontWeight: '500', fontSize: '14px' }}>{text}</p>
    </div>
  );
}

export function AIBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '24px', fontSize: '12px', fontWeight: '600', color: '#FFFFFF', background: 'linear-gradient(135deg,#0D9488,#14B8A6)' }}>
      ✦ GPT-4o
    </span>
  );
}

export function StatCard({ icon, label, value, color = "#0D9488", sub }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', flexShrink: 0, background: `linear-gradient(135deg,${color}CC,${color})` }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: color }}>{value}</div>
        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1E293B' }}>{label}</div>
        {sub && <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, back, onBack }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      {back && (
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px', marginBottom: '12px', cursor: 'pointer' }}>
          ← {back}
        </button>
      )}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0D1B4B', margin: '0' }}>{title}</h1>
      {subtitle && <p style={{ color: '#64748B', marginTop: '4px', fontSize: '14px', margin: '4px 0 0 0' }}>{subtitle}</p>}
    </div>
  );
}
