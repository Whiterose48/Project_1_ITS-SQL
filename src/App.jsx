import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StepIndicator from './components/StepIndicator';
import Tabs from './components/Tabs';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MySubmissions from './components/MySubmissions';
import FeedbackOverlay from './components/FeedbackOverlay';
import { dbManager } from './lib/db-manager';
import { problems } from './lib/problems';
import botIcon from './assets/bot.png'; 

export default function App() {
  const [currentProblem, setCurrentProblem] = useState(1);
  const [selectedTab, setSelectedTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState('4d 4h 47m 45s');
  const [problemData, setProblemData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [overlay, setOverlay] = useState({ visible: false, status: 'loading', message: '' });
  
  // --- Agentic AI State ---
  const [isHintOpen, setIsHintOpen] = useState(false);
  const hintRef = useRef(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);
      await dbManager.initialize();
      const initialData = problems[currentProblem - 1];
      setProblemData(initialData);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentProblem > 0 && problems[currentProblem - 1]) {
      setProblemData(problems[currentProblem - 1]);
    }
  }, [currentProblem]);

  // ปิดหน้าต่างคำใบ้เมื่อคลิกที่อื่น
  useEffect(() => {
    function handleClickOutside(event) {
      if (hintRef.current && !hintRef.current.contains(event.target)) {
        setIsHintOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (code, language) => {
    setOverlay({ visible: true, status: 'loading', message: 'Validating your query...' });
    setTimeout(() => {
      // เพิ่ม submission ใหม่
      const newSubmission = {
        code,
        language,
        timestamp: new Date().toLocaleString('th-TH'),
        passed: true,
        passedCount: 5,
        totalTests: 5,
        // ตัวอย่างผลลัพธ์ของ SQL query
        queryResult: [
          { brand_id: 1, brand_name: 'Trek', 'NULL': null },
          { brand_id: 2, brand_name: 'Giant', 'NULL': null },
          { brand_id: 3, brand_name: 'Specialized', 'NULL': null },
          { brand_id: 4, brand_name: 'Cannondale', 'NULL': null },
          { brand_id: 5, brand_name: 'Santa Cruz', 'NULL': null },
        ],
      };
      setSubmissions([newSubmission, ...submissions]);
      
      setOverlay({ visible: true, status: 'success', message: '' });
      setTimeout(() => {
        setOverlay({ visible: false, status: 'loading', message: '' });
        // เปลี่ยน tab ไป 'submissions'
        setSelectedTab('submissions');
      }, 1000);
    }, 1500);
  };

  if (isLoading) return <FeedbackOverlay status="loading" isVisible={true} message="Initializing..." />;
  if (error) return <div className="p-10 text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-sans">
      {overlay.visible && (
        <FeedbackOverlay
          status={overlay.status}
          isVisible={overlay.visible}
          onNextStep={() => { 
            setOverlay({ visible: false, status: 'loading', message: '' }); 
            setCurrentProblem(s => Math.min(s + 1, 5)); 
          }}
        />
      )}
      
      <Header />

      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mb-8 text-left">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">SQL Assignment</h1>
          <button className="text-blue-600 font-bold hover:underline transition-all">← Back to Course</button>
        </div>

        <StepIndicator totalSteps={5} currentStep={currentProblem} onStepChange={setCurrentProblem} />

        <div className="grid grid-cols-3 gap-8 mt-8">
          <LeftPanel problemData={problemData} currentStep={currentProblem} />
          <div className="col-span-2 text-left">
            <Tabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
            {selectedTab === 'description' ? (
              <RightPanel problemData={problemData} currentStep={currentProblem} onSubmit={handleSubmit} />
            ) : (
              <MySubmissions submissions={submissions} problemData={problemData} />
            )}
          </div>
        </div>
      </div>

      {/* --- Agentic AI Assistant Widget (Enhanced & Enlarged) --- */}
      <div className="fixed bottom-10 right-10 z-50 flex items-end gap-6" ref={hintRef}>
        <div className={`transition-all duration-500 transform origin-bottom-right ${
          isHintOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'
        }`}>
          <div className="bg-white border border-slate-100 shadow-[0_30px_70px_rgba(0,0,0,0.2)] rounded-[3.5rem] p-10 w-[400px] relative mb-6 text-left">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-[#000066] font-black text-3xl tracking-tight">AI Assistant ✨</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-slate-400 text-[12px] font-black uppercase tracking-widest">Active Now</span>
                </div>
              </div>
            </div>

            {/* Hint Content Area */}
            <div className="relative min-h-[140px] p-8 bg-slate-900 rounded-[2.5rem] text-white shadow-inner overflow-hidden border border-slate-800">
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-blue-300 text-[11px] font-black uppercase tracking-[0.2em] mb-4 opacity-70">
                  Bot Suggestion
                </p>
                <p className="text-[18px] font-medium leading-relaxed italic text-slate-100">
                  "{problemData?.hints?.[0] || 'ลองตรวจสอบความถูกต้องของคำสั่งดูอีกครั้งนะครับ ผมเป็นกำลังใจให้!'}"
                </p>
              </div>
            </div>

            {/* Speech Bubble Arrow */}
            <div className="absolute -bottom-2 right-16 w-8 h-8 bg-white border-r border-b border-slate-100 rotate-[45deg]"></div>
          </div>
        </div>

        {/* Assistant Button - ปรับขนาดจาก w-28 เป็น w-36 (144px) */}
        <button 
          onClick={() => setIsHintOpen(!isHintOpen)}
          className={`group relative w-36 h-36 bg-white rounded-full shadow-[0_25px_60px_rgba(0,0,0,0.2)] transition-all duration-500 border-[6px] flex items-center justify-center hover:scale-110 active:scale-95 z-50 ${
            isHintOpen ? 'border-slate-900 rotate-12 shadow-none' : 'border-[#FF8C00]'
          }`}
        >
          {/* ขยายขนาด Icon Bot เป็น w-24 */}
          <img 
            src={botIcon} 
            alt="AI Assistant" 
            className={`w-24 h-24 object-contain transition-all duration-500 ${isHintOpen ? 'scale-110' : 'group-hover:rotate-6'}`}
          />
          
          {/* ป้าย HINT! ขนาดใหญ่ขึ้น */}
          <div className="absolute -top-1 -right-1 bg-[#FF8C00] text-white text-[13px] font-black px-5 py-2 rounded-full border-[3px] border-white shadow-xl animate-bounce">
            HINT!
          </div>

          {/* ป้าย Bot ด้านล่าง ปรับให้หนาและใหญ่ขึ้น */}
          <div className="absolute -bottom-4 bg-slate-900 text-[12px] text-white font-black px-7 py-2.5 rounded-full uppercase tracking-[0.25em] shadow-2xl border-[3px] border-white">
            Bot
          </div>
        </button>
      </div>
    </div>
  );
}