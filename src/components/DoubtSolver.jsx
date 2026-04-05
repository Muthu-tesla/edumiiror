import React, { useState, useRef, useEffect } from "react";

const OPENAI_API_KEY = "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";

const callGPT4o = async (messages) => {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

const DoubtSolverChat = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const [chatMessages, setChatMessages] = useState([
    { 
      role: "assistant", 
      content: "Hi! I am your AI study assistant powered by GPT-4o. Ask me anything about your exam topics!" 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: "smooth" 
    });
  }, [chatMessages]);

  const handleSendDoubt = async () => {
    const question = chatInput.trim();
    if (!question || chatLoading) return;

    setChatInput("");
    setChatLoading(true);

    setChatMessages(prev => [
      ...prev,
      { role: "user", content: question }
    ]);

    try {
      let daysLeft = "";
      if (profile && profile.examDate) {
        const timeDiff = new Date(profile.examDate) - new Date();
        const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
        daysLeft = days > 0 ? days : 0;
      }
      
      const systemPrompt = profile ? 
        `Student name: ${profile.name || 'Student'}\nTarget exam: ${profile.examType || 'exam'}\nWeak subjects: ${(profile.weakSubjects || []).join(", ") || 'none'}\nLevel: ${profile.level || 'Intermediate'}\nUse this context to personalize all responses. Keep answers under 120 words. Use simple language.` :
        "You are a helpful tutor for competitive exam preparation. Answer student doubts clearly. Keep answers under 120 words. Use simple language.";

      const messages = [
        {
          role: "system",
          content: systemPrompt
        },
        ...chatHistory,
        { role: "user", content: question }
      ];

      const reply = await callGPT4o(messages);

      setChatMessages(prev => [
        ...prev,
        { role: "assistant", content: reply }
      ]);

      setChatHistory(prev => {
        const newHistory = [
          ...prev,
          { role: "user", content: question },
          { role: "assistant", content: reply }
        ];
        // Keep last 10 messages (5 user-assistant pairs)
        return newHistory.slice(-10);
      });

    } catch (error) {
      setChatMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: "API Error: " + error.message + ". Please check if your OpenAI API key is correct and has credits available." 
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const bounceStyle = `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  `;

  return (
    <div style={{ 
      position: "fixed", 
      bottom: "24px", 
      right: "24px", 
      zIndex: 9999 
    }}>
      <style>{bounceStyle}</style>
      
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: "340px",
          height: "480px",
          background: "#FFFFFF",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          marginBottom: "12px",
          overflow: "hidden"
        }}>
          
          {/* Header */}
          <div style={{
            background: "#0D1B4B",
            padding: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <p style={{ 
                color: "#FFFFFF", 
                fontWeight: "700",
                fontSize: "15px",
                margin: 0 
              }}>
                AI Doubt Solver
              </p>
              <p style={{ 
                color: "#14B8A6", 
                fontSize: "12px",
                margin: 0 
              }}>
                Powered by GPT-4o
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >×</button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            background: "#F8FAFC"
          }}>
            {chatMessages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" 
                  ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.role === "user" 
                    ? "16px 16px 4px 16px" 
                    : "16px 16px 16px 4px",
                  background: msg.role === "user" 
                    ? "#0D9488" : "#FFFFFF",
                  color: msg.role === "user" 
                    ? "#FFFFFF" : "#1E293B",
                  fontSize: "13px",
                  lineHeight: "1.5",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {chatLoading && (
              <div style={{ display: "flex", gap: "4px", padding: "8px" }}>
                <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%", background: "#0D9488",
                  animation: "bounce 0.6s infinite"
                }}/>
                <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%", background: "#0D9488",
                  animation: "bounce 0.6s 0.2s infinite"
                }}/>
                <div style={{
                  width: "8px", height: "8px",
                  borderRadius: "50%", background: "#0D9488",
                  animation: "bounce 0.6s 0.4s infinite"
                }}/>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "12px",
            borderTop: "1px solid #E2E8F0",
            display: "flex",
            gap: "8px",
            background: "#FFFFFF"
          }}>
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleSendDoubt();
              }}
              placeholder="Ask your doubt..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1.5px solid #E2E8F0",
                fontSize: "13px",
                outline: "none",
                background: "#F8FAFC"
              }}
            />
            <button
              onClick={handleSendDoubt}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                background: chatLoading ? "#94A3B8" : "#0D9488",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "#FFFFFF",
                cursor: chatLoading ? "not-allowed" : "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >→</button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "#0D9488",
          border: "none",
          boxShadow: "0 4px 16px rgba(13,148,136,0.4)",
          cursor: "pointer",
          fontSize: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFFFFF"
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
};

export default DoubtSolverChat;
