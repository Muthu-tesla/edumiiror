import { useState } from "react";
import { Loader, Upload, BookOpen, AlertCircle } from "lucide-react";
import { extractTextFromImage, parseSyllabusWithAI, generateSyllabusQuestions } from "../api/gpt4o";
import { toast } from "./Toast";

export default function SyllabusUploader({ profile, role, onGenerated }) {
  const [method, setMethod] = useState("upload");
  const [syllabusText, setSyllabusText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  
  const [selectedTopics, setSelectedTopics] = useState([]);
  
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);

  const readPdfText = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file); // Note: For a real PDF, we'd use pdf.js. But keeping to simple text extraction per instructions.
  });

  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result); // the full data URL since the API supports it in that format
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSyllabusUpload = async (file) => {
    setLoading(true);
    setStatus("Reading your syllabus file...");
    
    try {
      let text = "";
      
      if (file.type.includes("image")) {
        setStatus("Extracting text from image with AI Vision...");
        const base64 = await toBase64(file);
        text = await extractTextFromImage(base64);
      } else {
        setStatus("Reading text content...");
        text = await readPdfText(file);
      }
      
      setStatus("Mapping your syllabus topics with AI...");
      const parsed = await parseSyllabusWithAI(text);
      
      setData(parsed);
      setSyllabusText(text);
      setStatus("Syllabus mapped successfully!");
      toast.success("Syllabus mapped successfully!");
    } catch (error) {
      setStatus("Error: " + error.message);
      toast.error("Error analyzing syllabus");
    } finally {
      setLoading(false);
    }
  };

  const handlePasteAnalyze = async () => {
    if (!syllabusText.trim()) return;
    setLoading(true);
    setStatus("Mapping your syllabus topics with AI...");
    try {
      const parsed = await parseSyllabusWithAI(syllabusText);
      setData(parsed);
      setStatus("Syllabus mapped successfully!");
      toast.success("Syllabus mapped successfully!");
    } catch (error) {
      setStatus("Error: " + error.message);
      toast.error("Error parsing pasted syllabus");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleSyllabusUpload(file);
  };
  const handleDragOver = (e) => e.preventDefault();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleSyllabusUpload(file);
  };

  const toggleAll = (select) => {
    if (select && data) {
      const all = [];
      data.units.forEach(u => u.chapters?.forEach(c => c.topics?.forEach(t => all.push(t))));
      setSelectedTopics(all);
    } else {
      setSelectedTopics([]);
    }
  };

  const toggleUnit = (u) => {
    const unitTopics = [];
    u.chapters?.forEach(c => c.topics?.forEach(t => unitTopics.push(t)));
    const allSelected = unitTopics.every(t => selectedTopics.includes(t));
    if (allSelected) {
      setSelectedTopics(prev => prev.filter(t => !unitTopics.includes(t)));
    } else {
      setSelectedTopics(prev => [...new Set([...prev, ...unitTopics])]);
    }
  };

  const toggleChapter = (c) => {
    const chapterTopics = c.topics || [];
    const allSelected = chapterTopics.every(t => selectedTopics.includes(t));
    if (allSelected) {
      setSelectedTopics(prev => prev.filter(t => !chapterTopics.includes(t)));
    } else {
      setSelectedTopics(prev => [...new Set([...prev, ...chapterTopics])]);
    }
  };

  const toggleTopic = (t) => {
    setSelectedTopics(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  };

  const generate = async () => {
    if (selectedTopics.length === 0) {
      toast.warn("Please select at least one topic");
      return;
    }
    setIsGenerating(true);
    setStatus("Generating realistic exam questions...");
    try {
      const examType = data?.examType || profile?.examType || "General";
      const subject = data?.subject || profile?.strongSubjects?.[0] || "General";
      
      const q = await generateSyllabusQuestions({
        syllabusText,
        selectedTopics,
        count,
        difficulty,
        examType,
        subject
      });
      
      toast.success("✨ Questions generated successfully!");
      onGenerated(q, { examType, subject, chapter: "Custom Syllabus", difficulty });
    } catch (e) {
      toast.error("API Error generating questions");
      alert("Failed to generate test questions. Please check your API credits and try again.");
    } finally {
      setIsGenerating(false);
      setStatus("");
    }
  };

  if (data) {
    return (
      <div style={{ animation: 'fadeIn 0.4s' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', color: '#1E293B', fontWeight: 'bold' }}>Topic Selection</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => toggleAll(true)} style={{ padding: '6px 12px', background: '#F0FDFA', color: '#0D9488', border: '1px solid #CCFBF1', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Select All</button>
            <button onClick={() => toggleAll(false)} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#EF4444', border: '1px solid #FEE2E2', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Deselect All</button>
          </div>
        </div>

        <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', maxHeight: '350px', overflowY: 'auto', marginBottom: '24px' }}>
          {data.units?.map((u, i) => {
            const unitTopics = []; u.chapters?.forEach(c => c.topics?.forEach(t => unitTopics.push(t)));
            const unitChecked = unitTopics.length > 0 && unitTopics.every(t => selectedTopics.includes(t));
            
            return (
              <div key={i} style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', color: '#0D1B4B', fontSize: '14px', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={unitChecked} onChange={() => toggleUnit(u)} style={{ margin: 0, cursor: 'pointer' }}/>
                  ▼ {u.unitName}
                </label>
                
                <div style={{ paddingLeft: '24px' }}>
                  {u.chapters?.map((c, j) => {
                    const chChecked = c.topics?.length > 0 && c.topics.every(t => selectedTopics.includes(t));
                    return (
                      <div key={j} style={{ marginBottom: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', fontWeight: '600', marginBottom: '4px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={chChecked} onChange={() => toggleChapter(c)} style={{ margin: 0, cursor: 'pointer' }}/>
                          {c.chapterName}
                        </label>
                        <div style={{ paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {c.topics?.map((topic, k) => (
                            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', cursor: 'pointer' }}>
                              <input type="checkbox" checked={selectedTopics.includes(topic)} onChange={() => toggleTopic(topic)} style={{ margin: 0, cursor: 'pointer' }}/>
                              • {topic}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Number of Questions</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input type="range" min={5} max={20} step={1} value={count} onChange={e=>setCount(+e.target.value)} style={{ flex: 1, accentColor: '#0D9488' }}/>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0D9488', minWidth: '32px' }}>{count}</span>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>Difficulty</label>
            <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '10px', fontSize: '13px', outline: 'none', background: '#FFFFFF', color: '#1E293B', cursor: 'pointer' }}>
              {["Easy", "Medium", "Hard", "Mixed"].map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <button onClick={generate} disabled={isGenerating || selectedTopics.length === 0}
          style={{ width: '100%', padding: '16px', borderRadius: '12px', fontWeight: 'bold', color: '#FFFFFF', fontSize: '14px', border: 'none', cursor: isGenerating || selectedTopics.length === 0 ? 'not-allowed' : 'pointer', background: isGenerating || selectedTopics.length === 0 ? '#94A3B8' : 'linear-gradient(135deg,#0D1B4B,#0D9488)' }}>
          {isGenerating ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader size={16} style={{ animation: 'spin 1.5s linear infinite' }}/> {status}
            </span>
          ) : "✨ Generate Questions from Selected Topics"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={()=>{ setData(null); setSyllabusText(""); setSelectedTopics([]); }} style={{ fontSize: '13px', color: '#EF4444', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Reset Syllabus</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => setMethod('upload')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: method === 'upload' ? 'none' : '2px solid #E2E8F0', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: method === 'upload' ? '#0D1B4B' : 'transparent', color: method === 'upload' ? '#FFFFFF' : '#475569' }}>Upload PDF/Image</button>
        <button onClick={() => setMethod('paste')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: method === 'paste' ? 'none' : '2px solid #E2E8F0', fontSize: '13px', fontWeight: '600', cursor: 'pointer', background: method === 'paste' ? '#0D1B4B' : 'transparent', color: method === 'paste' ? '#FFFFFF' : '#475569' }}>Paste Text</button>
      </div>

      {method === 'upload' ? (
        <div 
          onDrop={handleDrop} 
          onDragOver={handleDragOver}
          style={{ border: '2px dashed #94A3B8', borderRadius: '16px', padding: '40px 20px', textAlign: 'center', background: '#F8FAFC', position: 'relative' }}>
          
          <input type="file" accept=".pdf,image/png,image/jpeg,.txt" onChange={handleFileChange} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }} disabled={loading}/>
          
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#0D9488' }}>
              <Loader size={36} style={{ animation: 'spin 1.5s linear infinite' }}/>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>{status}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Upload size={36} color="#0D9488" />
              <div>
                <p style={{ margin: 0, fontSize: '15px', color: '#1E293B', fontWeight: 'bold' }}>Drop your syllabus here</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748B' }}>Supports PDF, JPG, PNG, TXT</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <textarea value={syllabusText} onChange={e => setSyllabusText(e.target.value)} rows={6} disabled={loading}
            placeholder="Paste syllabus content here..."
            style={{ width: '100%', borderRadius: '12px', border: '2px solid #E2E8F0', padding: '16px', fontSize: '14px', outline: 'none', background: '#F8FAFC', color: '#1E293B', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}/>
          <button onClick={handlePasteAnalyze} disabled={loading || !syllabusText.trim()}
            style={{ marginTop: '16px', width: '100%', padding: '14px', borderRadius: '12px', color: '#FFFFFF', fontSize: '14px', fontWeight: 'bold', border: 'none', cursor: loading || !syllabusText.trim() ? 'not-allowed' : 'pointer', background: loading || !syllabusText.trim() ? '#94A3B8' : '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }}/> {status}</> : "Analyze Syllabus Text"}
          </button>
        </div>
      )}
    </div>
  );
}
