import React, { useState, useEffect } from "react";

const TestInterface = ({ 
  questions, config, profile, user, onComplete 
}) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = 
    useState([]);
  const [timeLeft, setTimeLeft] = useState(
    (questions?.length || 10) * 120
  );
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = 
    useState(false);

  const totalQuestions = questions?.length || 0;
  const currentQuestion = questions?.[currentQ];
  const isFirst = currentQ === 0;
  const isLast = currentQ === totalQuestions - 1;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tab lock
  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) {
        setTabSwitches(prev => {
          const next = prev + 1;
          if (next >= 3) handleSubmit(true);
          return next;
        });
      }
    };
    const onBlur = () => {
      setTabSwitches(prev => {
        const next = prev + 1;
        if (next >= 3) handleSubmit(true);
        return next;
      });
    };
    document.addEventListener(
      'visibilitychange', onVisChange
    );
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener(
        'visibilitychange', onVisChange
      );
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const handleAnswer = (questionId, option) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: option
    }));
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQ(index);
    }
  };

  const goNext = () => {
    if (!isLast) {
      setCurrentQ(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setCurrentQ(prev => prev - 1);
    }
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev => 
      prev.includes(currentQ)
        ? prev.filter(i => i !== currentQ)
        : [...prev, currentQ]
    );
  };

  const handleSubmit = (auto = false) => {
    if (!auto) {
      setShowSubmitConfirm(true);
      return;
    }
    submitTest();
  };

  const submitTest = () => {
    const conceptScores = {};
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    questions.forEach(q => {
      const ans = answers[q.id];
      const concept = q.concept || q.subject || 'General';
      
      if (!conceptScores[concept]) {
        conceptScores[concept] = { correct: 0, total: 0 };
      }
      conceptScores[concept].total++;

      if (!ans) {
        skipped++;
      } else if (ans === q.correct) {
        correct++;
        conceptScores[concept].correct++;
      } else {
        wrong++;
      }
    });

    const results = {
      correct, wrong, skipped,
      total: totalQuestions,
      percentage: Math.round(
        (correct / totalQuestions) * 100
      ),
      timeTaken: (totalQuestions * 120) - timeLeft,
      tabSwitches,
      answers,
      questions,
      conceptScores,
      config
    };

    onComplete(results);
  };

  const isLowTime = timeLeft < 60;
  const isVeryLowTime = timeLeft < 30;

  if (!currentQuestion) return null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8FAFC',
      fontFamily: 'inherit',
      paddingBottom: '20px'
    }}>

      {/* Tab switch warning banner */}
      {tabSwitches > 0 && (
        <div style={{
          background: '#EF4444',
          color: '#FFFFFF',
          padding: '10px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: '700'
        }}>
          ⚠️ Tab switch detected — Warning {tabSwitches}/3
          {tabSwitches >= 2 && 
            ' — One more will AUTO-SUBMIT!'}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: '#0D1B4B',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div>
          <p style={{
            color: '#FFFFFF',
            fontWeight: '700',
            margin: 0,
            fontSize: '16px'
          }}>
            {config?.subject} Test
          </p>
          <p style={{
            color: '#94A3B8',
            margin: 0,
            fontSize: '13px'
          }}>
            {config?.chapter} · 
            Question {currentQ + 1} of {totalQuestions}
          </p>
        </div>

        {/* Timer */}
        <div style={{
          background: isVeryLowTime 
            ? '#EF4444' 
            : isLowTime ? '#F59E0B' : '#0D9488',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: '12px',
          fontWeight: '800',
          fontSize: '24px',
          fontFamily: 'monospace',
          animation: isVeryLowTime 
            ? 'pulse 0.5s infinite' : 'none'
        }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '5px',
        background: '#E2E8F0'
      }}>
        <div style={{
          height: '100%',
          width: `${((currentQ + 1) / totalQuestions) * 100}%`,
          background: '#0D9488',
          transition: 'width 0.3s ease'
        }}/>
      </div>

      {/* Main content */}
      <div style={{
        maxWidth: '900px',
        margin: '24px auto',
        padding: '0 16px',
        display: 'grid',
        gridTemplateColumns: '1fr 220px',
        gap: '20px',
        alignItems: 'start'
      }}>

        {/* Left - Question */}
        <div>
          {/* Question card */}
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            marginBottom: '16px'
          }}>
            {/* Question header */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              marginBottom: '24px'
            }}>
              <div style={{
                minWidth: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#0D1B4B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontWeight: '800',
                fontSize: '15px',
                flexShrink: 0
              }}>
                {currentQ + 1}
              </div>
              <p style={{
                margin: 0,
                fontSize: '17px',
                color: '#1E293B',
                lineHeight: '1.65',
                fontWeight: '500'
              }}>
                {currentQuestion.question}
              </p>
            </div>

            {/* Options */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {Object.entries(
                currentQuestion.options || {}
              ).map(([key, value]) => {
                const isSelected = 
                  answers[currentQuestion.id] === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleAnswer(
                      currentQuestion.id, key
                    )}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '15px 18px',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: isSelected 
                        ? '#0D9488' : '#E2E8F0',
                      background: isSelected 
                        ? '#F0FDF9' : '#FAFAFA',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      fontFamily: 'inherit',
                      transition: 'all 0.15s'
                    }}
                  >
                    <span style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: isSelected 
                        ? '#0D9488' : '#CBD5E1',
                      background: isSelected 
                        ? '#0D9488' : 'transparent',
                      color: isSelected 
                        ? '#FFFFFF' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {key}
                    </span>
                    <span style={{
                      fontSize: '15px',
                      color: isSelected 
                        ? '#0D9488' : '#1E293B',
                      fontWeight: isSelected ? '600' : '400',
                      lineHeight: '1.4'
                    }}>
                      {value}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            {/* Previous button */}
            <button
              onClick={goPrev}
              disabled={isFirst}
              style={{
                padding: '13px 28px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: isFirst 
                  ? '#E2E8F0' : '#0D1B4B',
                background: '#FFFFFF',
                color: isFirst ? '#CBD5E1' : '#0D1B4B',
                cursor: isFirst 
                  ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: 'inherit',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ← Previous
            </button>

            {/* Mark for review */}
            <button
              onClick={toggleMarkForReview}
              style={{
                padding: '13px 20px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: markedForReview
                  .includes(currentQ) 
                  ? '#F59E0B' : '#E2E8F0',
                background: markedForReview
                  .includes(currentQ) 
                  ? '#FFFBEB' : '#FFFFFF',
                color: markedForReview
                  .includes(currentQ) 
                  ? '#F59E0B' : '#64748B',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                fontFamily: 'inherit'
              }}
            >
              🚩 {markedForReview.includes(currentQ) 
                ? 'Marked' : 'Mark Review'}
            </button>

            {/* Next / Submit button */}
            {isLast ? (
              <button
                onClick={() => handleSubmit(false)}
                style={{
                  padding: '13px 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Submit Test ✓
              </button>
            ) : (
              <button
                onClick={goNext}
                style={{
                  padding: '13px 28px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#0D9488',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '700',
                  fontFamily: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Right - Sidebar */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
          position: 'sticky',
          top: '80px'
        }}>
          <p style={{
            fontWeight: '700',
            color: '#0D1B4B',
            margin: '0 0 16px',
            fontSize: '14px'
          }}>
            Question Palette
          </p>

          {/* Question grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {questions.map((q, i) => {
              const isAnswered = answers[q.id];
              const isCurrent = i === currentQ;
              const isMarked = markedForReview
                .includes(i);
              
              let bg = '#E2E8F0';
              let color = '#64748B';
              let border = 'none';

              if (isCurrent) {
                bg = '#0D1B4B';
                color = '#FFFFFF';
              } else if (isMarked) {
                bg = '#FEF3C7';
                color = '#F59E0B';
                border = '2px solid #F59E0B';
              } else if (isAnswered) {
                bg = '#10B981';
                color = '#FFFFFF';
              }

              return (
                <button
                  key={i}
                  onClick={() => goToQuestion(i)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    border: isCurrent 
                      ? '2px solid #0D9488' 
                      : border,
                    background: bg,
                    color: color,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ marginBottom: '20px' }}>
            {[
              { color: '#10B981', label: 'Answered', 
                count: answeredCount },
              { color: '#E2E8F0', label: 'Unanswered',
                count: unansweredCount,
                textColor: '#64748B' },
              { color: '#F59E0B', label: 'Marked',
                count: markedForReview.length },
              { color: '#0D1B4B', label: 'Current',
                count: 1 }
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '6px'
              }}>
                <div style={{
                  width: '14px', height: '14px',
                  borderRadius: '3px',
                  background: item.color,
                  flexShrink: 0
                }}/>
                <span style={{
                  fontSize: '12px',
                  color: '#64748B'
                }}>
                  {item.label} ({item.count})
                </span>
              </div>
            ))}
          </div>

          {/* Submit button in sidebar */}
          <button
            onClick={() => handleSubmit(false)}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: 'inherit'
            }}
          >
            Submit Test ✓
          </button>

          {/* Stats */}
          <div style={{
            marginTop: '16px',
            padding: '12px',
            background: '#F8FAFC',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#64748B'
          }}>
            <p style={{ margin: '0 0 4px' }}>
              📝 {answeredCount}/{totalQuestions} answered
            </p>
            <p style={{ margin: '0 0 4px' }}>
              🚩 {markedForReview.length} marked
            </p>
            <p style={{ margin: 0 }}>
              ⚠️ {tabSwitches} tab switches
            </p>
          </div>
        </div>
      </div>

      {/* Submit confirmation modal */}
      {showSubmitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              📋
            </div>
            <h3 style={{
              color: '#0D1B4B',
              fontSize: '20px',
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              Submit Test?
            </h3>
            <p style={{
              color: '#64748B',
              fontSize: '14px',
              marginBottom: '24px'
            }}>
              You have answered {answeredCount} of {totalQuestions} questions.
              {unansweredCount > 0 && (
                <><br/><strong style={{ color: '#EF4444' }}>
                  {unansweredCount} questions unanswered!
                </strong></>
              )}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                style={{
                  padding: '13px',
                  borderRadius: '10px',
                  border: '2px solid #E2E8F0',
                  background: '#FFFFFF',
                  color: '#64748B',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  fontFamily: 'inherit'
                }}
              >
                Continue Test
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  submitTest();
                }}
                style={{
                  padding: '13px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '700',
                  fontFamily: 'inherit'
                }}
              >
                Yes, Submit!
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default TestInterface;
