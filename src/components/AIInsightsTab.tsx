import React, { useState, useEffect } from 'react';
import { DayLog, CycleSettings, AIInsights, ChatMessage, CycleHealthReport } from '../types';
import { Sparkles, Utensils, Dumbbell, Brain, MessageSquare, Send, RefreshCw, FileCheck, AlertCircle, Heart } from 'lucide-react';

interface AIInsightsTabProps {
  currentPhase: string;
  cycleDay: number;
  avgCycleLength: number;
  todayLog?: DayLog;
  recentLogs: DayLog[];
  settings: CycleSettings;
}

const QUICK_PROMPTS = [
  "Why do I get sugar cravings during my luteal phase?",
  "How can I naturally reduce menstrual cramps?",
  "What type of workouts are best during my follicular phase?",
  "How does sleep impact cycle regularity and hormones?",
  "What foods help boost energy during menstruation?",
  "What activities can help me during period cramps?"
];

export const AIInsightsTab: React.FC<AIInsightsTabProps> = ({
  currentPhase,
  cycleDay,
  avgCycleLength,
  todayLog,
  recentLogs,
  settings,
}) => {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [errorInsights, setErrorInsights] = useState<string | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello & hi ${settings.userName || 'there'}! I am Jester, your personal AI for everything assistant. You are currently on Day ${cycleDay} of your ${currentPhase} phase. How can I support your wellness today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // Health Report State
  const [report, setReport] = useState<CycleHealthReport | null>(null);
  const [generatingReport, setGeneratingReport] = useState<boolean>(false);

  // Fetch AI Insights for current phase and symptoms
  const fetchInsights = async () => {
    setLoadingInsights(true);
    setErrorInsights(null);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: currentPhase,
          cycleDay,
          avgCycleLength,
          symptoms: todayLog?.symptoms || [],
          moods: todayLog?.moods || [],
          flow: todayLog?.flow || 'None',
          recentLogs: recentLogs.slice(-10),
        }),
      });

      if (!res.ok) throw new Error('Server returned an error');
      const data = await res.json();
      setInsights(data);
    } catch (err: any) {
      console.error(err);
      setErrorInsights('Failed to load real-time insights. Retrying with default guides.');
      // Fallback
      setInsights({
        phaseOverview: `During the ${currentPhase} phase (Day ${cycleDay}), your hormone levels shift to support your reproductive system. Focus on nourishment and rest.`,
        nutritionAdvice: [
          'Incorporate rich leafy greens, dark chocolate, and pumpkin seeds.',
          'Stay hydrated with warm water and caffeine-free herbal teas.',
          'Eat anti-inflammatory foods rich in Omega-3 fats.'
        ],
        exerciseAdvice: [
          'Listen to your body\'s energy levels.',
          'Gentle stretching, yoga, and walking provide restorative movement.'
        ],
        symptomAnalysis: 'Logged symptoms reflect natural hormonal variations across your cycle.',
        mindsetTip: 'Practice mindfulness and allow yourself adequate rest.',
        keyTakeaway: 'Nourish your body and prioritize rest today.',
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [currentPhase, cycleDay]);

  // Send message to AI Chat
  const handleSendMessage = async (textToSend?: string) => {
    const question = textToSend || inputQuestion.trim();
    if (!question || sendingChat) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputQuestion('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          currentContext: {
            phase: currentPhase,
            cycleDay,
            avgCycleLength,
          },
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      const aiMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: data.answer || "I'm here to support your health journey.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: "I experienced a temporary connection glitch. However, remember that hydration, gentle movement, and magnesium-rich foods are generally beneficial throughout your cycle!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSendingChat(false);
    }
  };

  // Generate Health Summary Report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: recentLogs,
          settings,
        }),
      });

      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="neo-border-4 bg-[#f07167] text-white p-6 sm:p-10 neo-shadow-accent relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="neo-badge transform -rotate-1 bg-[#1b2021] text-white">
              POWERED BY GEMINI AI
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Personalized Cycle Health Insights
            </h2>
            <p className="text-sm font-sans font-medium text-white/90 max-w-xl leading-relaxed">
              Custom nutrition, exercise, and symptom recommendations generated for Day {cycleDay} ({currentPhase} Phase).
            </p>
          </div>

          <button
            id="refresh-ai-insights-btn"
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="neo-btn bg-white text-[#1b2021] px-5 py-3 text-xs flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-[#f07167] ${loadingInsights ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main AI Insights Cards Grid */}
      {loadingInsights ? (
        <div className="neo-border-4 bg-white p-12 neo-shadow text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#f07167] animate-spin mx-auto" />
          <p className="font-mono text-sm font-bold text-[#1b2021]">
            Analyzing cycle status &amp; symptoms with Gemini AI...
          </p>
        </div>
      ) : insights ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overview & Key Takeaway */}
          <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-[#0081a7] font-mono font-bold uppercase tracking-widest text-xs">
              <Brain className="w-5 h-5 text-[#f07167]" />
              <span>Phase Physiology &amp; Hormonal Focus</span>
            </div>
            <p className="text-[#1b2021] leading-relaxed text-sm sm:text-base font-sans">
              {insights.phaseOverview}
            </p>
            <div className="p-4 border-2 border-[#1b2021] bg-[#fed9b7] neo-shadow-sm flex items-start gap-3">
              <Heart className="w-5 h-5 text-[#f07167] flex-shrink-0 mt-0.5 fill-[#f07167]" />
              <div>
                <span className="font-mono text-xs font-bold text-[#1b2021] uppercase tracking-wider block">
                  KEY TAKEAWAY
                </span>
                <p className="text-xs sm:text-sm text-[#1b2021] font-bold mt-0.5 font-sans">
                  {insights.keyTakeaway}
                </p>
              </div>
            </div>
          </div>

          {/* Nutrition Advice */}
          <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
            <div className="flex items-center gap-2 text-[#0081a7] font-mono font-bold uppercase tracking-widest text-xs">
              <Utensils className="w-5 h-5 text-[#0081a7]" />
              <span>Recommended Phase Nutrition</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1b2021] font-sans">
              {insights.nutritionAdvice.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 bg-[#0081a7] border border-[#1b2021] mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Exercise & Movement Advice */}
          <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4">
            <div className="flex items-center gap-2 text-[#0081a7] font-mono font-bold uppercase tracking-widest text-xs">
              <Dumbbell className="w-5 h-5 text-[#0081a7]" />
              <span>Optimal Movement &amp; Exercise</span>
            </div>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#1b2021] font-sans">
              {insights.exerciseAdvice.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 bg-[#f07167] border border-[#1b2021] mt-2 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Symptom Pattern Analysis */}
          <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-[#0081a7] font-mono font-bold uppercase tracking-widest text-xs">
              <Sparkles className="w-5 h-5 text-[#f07167]" />
              <span>Symptom Pattern &amp; Comfort Guide</span>
            </div>
            <p className="text-xs sm:text-sm text-[#1b2021] font-sans leading-relaxed">
              {insights.symptomAnalysis}
            </p>
            <div className="p-4 bg-[#fffbf2] border-2 border-[#1b2021] font-sans text-xs text-[#1b2021]">
              💡 <span className="font-bold text-[#0081a7]">Mindfulness Tip:</span> {insights.mindsetTip}
            </div>
          </div>
        </div>
      ) : null}

      {/* Interactive AI Chat Assistant */}
      <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-6">
        <div className="flex items-center justify-between border-b-2 border-[#1b2021] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#1b2021] bg-[#f07167] text-white flex items-center justify-center font-hand font-bold text-2xl neo-shadow-sm">
              J
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-[#1b2021] tracking-tight">
                Ask Jester - Your AI Health Specialist
              </h3>
              <p className="font-mono text-xs text-[#0081a7]">
                Inquire about period symptoms, hormonal nutrition, or cycle phases.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Suggested Prompts */}
        <div>
          <span className="font-mono text-xs font-bold text-[#1b2021] uppercase tracking-widest block mb-2.5">
            SUGGESTED PROMPTS
          </span>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="font-mono text-xs font-bold px-3 py-2 bg-[#fffbf2] hover:bg-[#fed9b7] text-[#1b2021] border-2 border-[#1b2021] transition-all cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Chat History Box */}
        <div className="bg-[#fffbf2] border-2 border-[#1b2021] p-5 h-72 overflow-y-auto space-y-4 neo-shadow-sm">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] p-4 text-xs sm:text-sm font-sans leading-relaxed border-2 border-[#1b2021] ${
                  msg.sender === 'user'
                    ? 'bg-[#f07167] text-white neo-shadow-sm'
                    : 'bg-white text-[#1b2021] neo-shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{msg.text}</p>
              </div>
              <span className="font-mono text-[10px] text-[#1b2021]/60 mt-1">
                {msg.timestamp}
              </span>
            </div>
          ))}
          {sendingChat && (
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#0081a7] bg-white p-3 border-2 border-[#1b2021] w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#f07167]" />
              Jester is processing...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Ask a health or cycle question..."
            value={inputQuestion}
            onChange={e => setInputQuestion(e.target.value)}
            className="flex-1 px-4 py-3 text-sm font-sans bg-[#fffbf2] border-2 border-[#1b2021] focus:outline-none focus:bg-white"
          />
          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputQuestion.trim() || sendingChat}
            className="neo-btn bg-[#f07167] text-white px-6 py-3 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* AI Health Summary Report Generator */}
      <div className="neo-border-4 bg-white p-6 sm:p-8 neo-shadow space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#1b2021] tracking-tight flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#f07167]" />
              Cycle Health Summary Report
            </h3>
            <p className="font-mono text-xs text-[#0081a7]">
              Generate a structured report summarizing your 3-month cycle trends to review or share with your doctor.
            </p>
          </div>
          <button
            id="generate-report-btn"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="neo-btn bg-[#0081a7] text-white px-6 py-3 text-xs flex items-center gap-2 cursor-pointer"
          >
            {generatingReport ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <FileCheck className="w-4 h-4 text-white" />
            )}
            {generatingReport ? 'Analyzing Logs...' : 'Generate Full Report'}
          </button>
        </div>

        {report && (
          <div className="p-6 bg-[#fffbf2] border-2 border-[#1b2021] neo-shadow-sm space-y-4">
            <div>
              <h4 className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-widest">
                EXECUTIVE HEALTH SUMMARY
              </h4>
              <p className="text-xs sm:text-sm font-sans text-[#1b2021] mt-1 leading-relaxed">
                {report.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white border-2 border-[#1b2021]">
                <span className="font-mono text-xs font-bold text-[#1b2021] uppercase tracking-wider block mb-1">
                  REGULARITY ASSESSMENT
                </span>
                <p className="text-xs sm:text-sm font-sans text-[#1b2021] font-medium">
                  {report.cycleRegularityAssessment}
                </p>
              </div>

              <div className="p-4 bg-white border-2 border-[#1b2021]">
                <span className="font-mono text-xs font-bold text-[#1b2021] uppercase tracking-wider block mb-1">
                  COMMON SYMPTOMS
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {report.commonSymptomsObserved.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-[#f07167] text-white font-mono text-xs font-bold border border-[#1b2021]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-2 border-[#1b2021]">
              <span className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-wider block mb-1">
                PHYSICIAN DISCUSSION POINTS
              </span>
              <p className="text-xs sm:text-sm font-sans text-[#1b2021] leading-relaxed">
                {report.physicianNotes}
              </p>
            </div>

            <div className="p-4 bg-white border-2 border-[#1b2021]">
              <span className="font-mono text-xs font-bold text-[#0081a7] uppercase tracking-wider block mb-2">
                LIFESTYLE &amp; HEALTH RECOMMENDATIONS
              </span>
              <ul className="space-y-1.5 text-xs sm:text-sm font-sans text-[#1b2021]">
                {report.lifestyleRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#f07167] font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
