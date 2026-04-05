import React, { useState, useRef, useEffect } from "react";

const OPENAI_API_KEY = "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";

const askGPT4o = async (messages, maxTokens = 400) => {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o',
        messages: messages,
        max_tokens: maxTokens,
        temperature: 0.7
      })
    }
  );

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'API call failed');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

const ChatBot = ({ profile, user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${profile?.name || 'there'}! 👋 
      I am your AI study assistant powered by GPT-4o.
      Ask me anything about ${profile?.examType || 'your exam'} topics!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setError('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const systemMessage = {
        role: 'system',
        content: `You are a helpful, friendly AI tutor for competitive exam preparation.
        Student profile:
        - Name: ${profile?.name || 'Student'}
        - Exam: ${profile?.examType || 'competitive exam'}
        - Level: ${profile?.level || 'Intermediate'}
        - Weak subjects: ${profile?.weakSubjects?.join(', ') || 'unknown'}
        
        Rules:
        - Answer in simple, clear language
        - Keep answers under 120 words
        - Use examples when helpful
        - Be encouraging and supportive
        - Focus on ${profile?.examType || 'exam'} level content
        - If asked about specific topics, give step by step explanations
        - Use emojis occasionally to be friendly`
      };

      const apiMessages = [
        systemMessage,
        ...history.slice(-8),
        { role: 'user', content: text }
      ];

      const reply = await askGPT4o(apiMessages, 350);

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: reply }
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Error: ' + err.message + '. Please check your API key has credits.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'Explain Newton\'s laws simply',
    'What is the formula for integration?',
    'How to solve quadratic equations?',
    'Explain photosynthesis',
    'Tips to crack ' + (profile?.examType || 'JEE')
  ];

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '24px',
      zIndex: 9998
    }}>
      <style>
        {`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
        `}
      </style>
      {/* Chat window */}
      {isOpen && (
        <div style={{
          width: '360px',
          height: '520px',
          background: '#FFFFFF',
          borderRadius: '20px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '12px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0D1B4B, #0D9488)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px'
              }}>
                🤖
              </div>
              <div>
                <p style={{ color: '#FFFFFF', fontWeight: '700', fontSize: '14px', margin: 0 }}>
                  AI Study Assistant
                </p>
                <p style={{ color: '#14B8A6', fontSize: '11px', margin: 0 }}>
                  ● Online · Powered by GPT-4o
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                borderRadius: '50%', width: '28px', height: '28px',
                color: '#FFFFFF', cursor: 'pointer', fontSize: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >×</button>
          </div>

          {/* Messages area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '16px',
            display: 'flex', flexDirection: 'column', gap: '10px',
            background: '#F8FAFC'
          }}>
            {/* Quick questions - show only at start */}
            {messages.length === 1 && (
              <div style={{ marginBottom: '8px' }}>
                <p style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                  Quick questions:
                </p>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '8px 12px', marginBottom: '6px',
                      background: '#FFFFFF', border: '1px solid #E2E8F0',
                      borderRadius: '8px', color: '#0D9488', fontSize: '12px',
                      cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    💬 {q}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-end', gap: '8px'
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: '#0D9488', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '14px', flexShrink: 0
                  }}>🤖</div>
                )}
                <div style={{
                  maxWidth: '78%', padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#0D9488' : '#FFFFFF',
                  color: msg.role === 'user' ? '#FFFFFF' : '#1E293B',
                  fontSize: '13px', lineHeight: '1.5',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.08)', whiteSpace: 'pre-line'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: '#0D9488', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '14px'
                }}>🤖</div>
                <div style={{
                  background: '#FFFFFF', borderRadius: '18px 18px 18px 4px',
                  padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center'
                }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      background: '#0D9488', animation: `bounce 0.8s ${i*0.2}s infinite`
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: '#FEF2F2', padding: '8px 16px', fontSize: '12px',
              color: '#EF4444', borderTop: '1px solid #FEE2E2'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Input area */}
          <div style={{
            padding: '12px 16px', background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0', display: 'flex', gap: '8px', alignItems: 'center'
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask any study doubt..."
              disabled={loading}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '24px',
                border: '1.5px solid #E2E8F0', fontSize: '13px', outline: 'none',
                background: loading ? '#F8FAFC' : '#FFFFFF', color: '#1E293B', fontFamily: 'inherit'
              }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                background: loading || !input.trim() ? '#E2E8F0' : '#0D9488',
                color: '#FFFFFF', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '56px', height: '56px', borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #0D9488, #0D1B4B)',
          boxShadow: '0 4px 20px rgba(13,148,136,0.4)', cursor: 'pointer',
          fontSize: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#FFFFFF', transition: 'transform 0.2s'
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default ChatBot;
