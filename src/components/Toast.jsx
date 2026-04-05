import { useState, useEffect } from "react";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

let _addToast = () => {};
export const toast = {
  success: (msg) => _addToast({ type: "success", msg }),
  error:   (msg) => _addToast({ type: "error",   msg }),
  info:    (msg) => _addToast({ type: "info",    msg }),
  warn:    (msg) => _addToast({ type: "warn",    msg }),
};

const ICONS  = { success: CheckCircle, error: X, info: Info, warn: AlertTriangle };
const COLORS = {
  success: "#10B981",
  error:   "#EF4444",
  info:    "#0D9488",
  warn:    "#F59E0B",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _addToast = ({ type, msg }) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, type, msg }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: 'none' }}>
      {toasts.map(t => {
        const Icon = ICONS[t.type];
        return (
          <div
            key={t.id}
            style={{ 
              pointerEvents: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              padding: '12px 16px', 
              borderRadius: '12px', 
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)', 
              color: '#FFFFFF', 
              background: COLORS[t.type],
              minWidth: '240px', 
              maxWidth: '340px'
            }}
          >
            <Icon size={18} color="#FFFFFF" />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{t.msg}</span>
          </div>
        );
      })}
    </div>
  );
}
