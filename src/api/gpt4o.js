// ── GPT-4o API helper ────────────────────────────────────────────────────────
const OPENAI_API_KEY = "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";
const OPENAI_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const callGPT4o = async (systemPromptOrMessages, userPrompt) => {
  const messages = Array.isArray(systemPromptOrMessages)
    ? systemPromptOrMessages
    : [
        { role: "system", content: systemPromptOrMessages },
        { role: "user",   content: userPrompt }
      ];

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages: messages,
      temperature: 0.7,
      max_tokens: 3000
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

export const generateQuestions = async (config) => {
  const systemPrompt = 
    `You are a strict exam question generator.
    You MUST generate questions ONLY about the 
    EXACT topic specified. Never deviate.
    Return ONLY raw JSON. No markdown. No backticks.
    No explanation. Just the JSON object.`;

  const userPrompt = 
    `Generate ${config.count || config.numQuestions} MCQ questions for:
    Exam Type: ${config.examType}
    Subject: ${config.subject}  
    Topic: ${config.chapter?.trim()}
    Difficulty: ${config.difficulty}
    
    STRICT RULE: Every question must be 
    specifically about "${config.chapter?.trim()}" in ${config.subject}.
    No questions about any other topic.
    
    Return this exact JSON structure:
    {"questions":[{"id":1,"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"...","concept":"${config.chapter?.trim()}","subject":"${config.subject}","difficulty":"${config.difficulty}"}]}`;

  console.log('Topic:', config.chapter?.trim());
  
  const response = await callGPT4o([
    { role: "system", content: systemPrompt },
    { role: "user", content: userPrompt }
  ]);

  let rawContent = response;

  // Clean any markdown formatting
  rawContent = rawContent.trim();
  rawContent = rawContent.replace(/```json/g, '');
  rawContent = rawContent.replace(/```/g, '');
  rawContent = rawContent.trim();

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (parseErr) {
    // Try to extract JSON from response
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error(
        'Could not parse AI response. Try again.'
      );
    }
  }

  if (!parsed.questions || 
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0) {
    throw new Error(
      'No questions generated. Please try again.'
    );
  }

  return parsed.questions;
};

export const explainAnswer = async ({ question, correct, studentAnswer, concept }) => {
  const sys = "You are a helpful tutor. Explain concepts clearly and simply.";
  const usr = `Question: ${question}
Correct Answer: ${correct}
Student answered: ${studentAnswer}
Topic: ${concept}

Give a clear 2-3 sentence explanation of why ${correct} is correct and why ${studentAnswer} is wrong. Be encouraging and educational.`;
  return callGPT4o(sys, usr);
};

export const analyzePerformance = async ({ examType, subject, score, total, conceptScores, wrongConcepts, timeTaken }) => {
  const sys = "You are an expert academic coach analyzing student performance.";
  const usr = `Student just completed a ${examType} test on ${subject}.
Score: ${score}/${total}
Concept-wise performance: ${JSON.stringify(conceptScores)}
Time taken: ${timeTaken}
Wrong questions were about: ${wrongConcepts.join(", ")}

Provide:
1. A 2-sentence personalized performance summary
2. Top 3 specific weak areas with brief reason why
3. Top 3 actionable next steps to improve
4. One motivational message

Format as JSON:
{"summary":"text","weakAreas":["area1","area2","area3"],"nextSteps":["step1","step2","step3"],"motivation":"text"}`;
  const raw = await callGPT4o(sys, usr);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
};

export const generateStudyPlan = async (profile) => {
  const daysLeft = profile.examDate 
    ? Math.ceil(
        (new Date(profile.examDate) - new Date()) 
        / (1000 * 60 * 60 * 24)
      )
    : 90;

  const response = await callGPT4o([
    {
      role: "system",
      content: `You are an expert academic coach 
      for competitive exam preparation. 
      Create detailed, realistic study plans.
      Return ONLY valid JSON, no extra text.`
    },
    {
      role: "user",
      content: `Create a complete study plan for:
      Student Name: ${profile.name}
      Target Exam: ${profile.examType}
      Days Remaining: ${daysLeft}
      Weak Subjects: ${(profile.weakSubjects || []).join(', ')}
      Strong Subjects: ${(profile.strongSubjects || []).join(', ') || 'None specified'}
      Preparation Level: ${profile.level}
      Daily Study Hours: ${profile.studyHours}

      Create a week-by-week plan covering 
      all weeks until exam day.
      Prioritize weak subjects heavily.
      
      Return this exact JSON format:
      {
        "totalDays": ${daysLeft},
        "examName": "${profile.examType}",
        "overview": "2 sentence overall strategy",
        "weeks": [
          {
            "weekNumber": 1,
            "days": "Days 1-7",
            "theme": "Week theme title",
            "focusSubject": "Main subject",
            "focusTopic": "Specific topic",
            "dailyTasks": [
              "Day 1-2: specific task",
              "Day 3-4: specific task", 
              "Day 5-6: specific task",
              "Day 7: specific task"
            ],
            "dailyQuestions": 15,
            "weeklyGoal": "What to achieve this week"
          }
        ],
        "finalWeekStrategy": "What to do in last week",
        "dailyRoutine": {
          "morning": "Morning routine suggestion",
          "afternoon": "Afternoon task",
          "evening": "Evening revision",
          "night": "Night review"
        },
        "importantTips": [
          "tip1", "tip2", "tip3"
        ]
      }`
    }
  ]);

  let cleanResponse = response.trim();
  if (cleanResponse.startsWith('```json')) {
    cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleanResponse.startsWith('```')) {
    cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(cleanResponse);
};

export const askDoubt = async (doubt, examType, history = []) => {
  const sys = `You are a helpful tutor for ${examType} exam preparation. Answer questions clearly, step by step. Use simple language. Keep answers concise but complete. Maximum 150 words.`;
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "system", content: sys }, ...history, { role: "user", content: doubt }],
      temperature: 0.7, max_tokens: 300
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

export const notesToQuestions = async (notes, count) => {
  const sys = "You are an expert at creating exam questions from study material.";
  const usr = `Based on these study notes, generate ${count} multiple choice questions that test understanding of key concepts.
Notes: ${notes}
Return JSON: {"questions":[{"id":1,"question":"text","options":{"A":"o1","B":"o2","C":"o3","D":"o4"},"correct":"A","explanation":"why","concept":"concept","difficulty":"Medium"}]}`;
  const raw = await callGPT4o(sys, usr);
  return JSON.parse(raw.replace(/```json|```/g, "").trim()).questions;
};

export const teacherInsights = async ({ total, avgScore, highest, lowest, conceptData, weakStudents }) => {
  const sys = "You are an expert educational analyst helping teachers.";
  const usr = `Class test results:
Total students: ${total}, Average: ${avgScore}%, Highest: ${highest}%, Lowest: ${lowest}%
Concept-wise class average: ${JSON.stringify(conceptData)}
Students below 40%: ${weakStudents.join(", ")}

Provide JSON:
{"summary":"text","struggledConcepts":["c1","c2","c3"],"recommendations":["r1","r2","r3"],"urgentAttention":["s1","s2"]}`;
  const raw = await callGPT4o(sys, usr);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
};

// ── SYLLABUS FEATURES ────────────────────────────────────────────────────────

export const extractTextFromImage = async (base64Image) => {
  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: base64Image } },
            { type: "text", text: "Extract all text from this syllabus image. Return the complete syllabus content as plain text only. No extra commentary." }
          ]
        }
      ],
      max_tokens: 2000
    })
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices[0].message.content;
};

export const parseSyllabusWithAI = async (text) => {
  const sys = `You are an expert at analyzing academic syllabuses.
Parse the syllabus and return ONLY this JSON, no other text:
{
  "subject": "detected subject name",
  "examType": "detected exam type if visible",
  "units": [
    {
      "unitNumber": 1,
      "unitName": "Unit name here",
      "chapters": [
        {
          "chapterName": "Chapter name",
          "topics": ["topic1", "topic2", "topic3"]
        }
      ]
    }
  ]
}`;
  const raw = await callGPT4o(sys, `Parse this syllabus and return JSON structure:\n\n${text}`);
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
};

export const generateSyllabusQuestions = async ({ syllabusText, selectedTopics, count, difficulty, examType, subject }) => {
  const sys = `You are an expert exam question generator for ${examType} examination.
Generate ${count} multiple choice questions STRICTLY from these selected topics only:
${selectedTopics.join(", ")}

Reference syllabus content:
${syllabusText.substring(0, 3000)} // trim if too long

Generate questions at ${difficulty} difficulty.
Make questions realistic and exam-appropriate.

Return ONLY this JSON format, no other text:
{
  "questions": [
    {
      "id": 1,
      "question": "question text",
      "options": {
        "A": "option 1",
        "B": "option 2", 
        "C": "option 3",
        "D": "option 4"
      },
      "correct": "A",
      "explanation": "detailed explanation",
      "concept": "topic name",
      "unit": "unit name",
      "difficulty": "${difficulty}"
    }
  ]
}`;
  
  const raw = await callGPT4o(sys, `Subject: ${subject}\n\nStrictly generate questions only for the selected topics.`);
  const json = JSON.parse(raw.replace(/```json|```/g, "").trim());
  return json.questions;
};
