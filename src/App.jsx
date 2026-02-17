import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import Courses from './components/Courses';
import CourseText from './components/CourseText';
import Dashboard from './components/Dashboard'; 
import Login from './components/Login'; 
import StepIndicator from './components/StepIndicator';
import LeftPanel from './components/LeftPanel';
import RightPanel from './components/RightPanel';
import MySubmissions from './components/MySubmissions';
import Tabs from './components/Tabs';
import FeedbackOverlay from './components/FeedbackOverlay';
import { dbManager } from './lib/db-manager';
import { problems } from './lib/problems';
import { Verifier } from './lib/verifier';
import { HintEngine } from './lib/hint-engine';
import botIcon from './assets/bot.png'; 

export default function App() {
  // --- 1. System & Auth States ---
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    const auth = localStorage.getItem('isLoggedIn') === 'true';
    if (!auth) return 'home';
    // ✨ เปลี่ยนค่า default เป็น 'home' แทน 'dashboard'
    return localStorage.getItem('currentPage') || 'home'; 
  });

  // --- 2. Learning & UI States ---
  const [currentProblem, setCurrentProblem] = useState(() => parseInt(localStorage.getItem('currentProblem')) || 1);
  const [selectedTab, setSelectedTab] = useState(() => localStorage.getItem('selectedTab') || 'description');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [problemData, setProblemData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [overlay, setOverlay] = useState({ visible: false, status: 'loading', message: '' });

  const [filteredProblemsList, setFilteredProblemsList] = useState([]);

  const [problemStatuses, setProblemStatuses] = useState(() => {
    const saved = localStorage.getItem('problemStatuses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentHints, setCurrentHints] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const hintRef = useRef(null);

  // --- 3. Persistence & Sync Effects ---
  useEffect(() => { localStorage.setItem('isLoggedIn', isLoggedIn); }, [isLoggedIn]);
  useEffect(() => { localStorage.setItem('currentPage', currentPage); }, [currentPage]);
  useEffect(() => { localStorage.setItem('currentProblem', currentProblem); }, [currentProblem]);
  useEffect(() => { localStorage.setItem('selectedTab', selectedTab); }, [selectedTab]);
  useEffect(() => { localStorage.setItem('problemStatuses', JSON.stringify(problemStatuses)); }, [problemStatuses]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        await dbManager.initialize();
        
        if (currentPage === 'workspace') {
          const mode = localStorage.getItem('workspaceMode') || 'COURSE';
          const modId = localStorage.getItem('workspaceModule') || '02';

          const currentList = problems.filter(p => p.type === mode && p.moduleId === modId);
          
          if (currentList.length > 0) {
            setFilteredProblemsList(currentList);
            
            if (problemStatuses.length !== currentList.length) {
                setProblemStatuses(Array(currentList.length).fill(null));
                setCurrentProblem(1);
                setProblemData(currentList[0]);
            } else {
                const safeIndex = (currentProblem - 1 >= 0 && currentProblem - 1 < currentList.length) 
                                  ? currentProblem - 1 : 0;
                setProblemData(currentList[safeIndex]);
            }
          } else {
            setFilteredProblemsList([problems[0]]);
            setProblemData(problems[0]);
            setProblemStatuses([null]);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    initializeApp();
  }, [currentPage]);

  useEffect(() => {
    if (filteredProblemsList.length > 0) {
      const safeIndex = (currentProblem - 1 >= 0 && currentProblem - 1 < filteredProblemsList.length) 
                        ? currentProblem - 1 : 0;
      setProblemData(filteredProblemsList[safeIndex]);
      setSelectedTab('description'); 
    }
  }, [currentProblem, filteredProblemsList]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (hintRef.current && !hintRef.current.contains(event.target)) {
        setIsHintOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 4. Event Handlers ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home'); 
    localStorage.clear();
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setCurrentPage('home');
  };

  const updateProblemStatus = (index, status) => {
    setProblemStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      return next;
    });
  };

  const handleSubmit = async (code, language) => {
    setOverlay({ visible: true, status: 'loading', message: 'Validating Query...' });
    try {
      const verifier = new Verifier();
      const result = await verifier.verify(code, problemData.goldenQuery);
      updateProblemStatus(currentProblem - 1, result.success ? 'passed' : 'failed');

      let hints = [];
      if (!result.success) {
        const hintEngine = new HintEngine();
        hints = hintEngine.generateHints(code, result, problemData);
        setCurrentHints(hints);
        setHintIndex(0);
      } else {
        setCurrentHints([]);
        setIsHintOpen(false);
      }
      
      const newSubmission = {
        code, language, timestamp: new Date().toLocaleString('th-TH'),
        passed: result.success,
        queryResult: result.studentResult || { columns: [], rows: [] },
        hint: hints.length > 0 ? hints[0].message : null
      };
      
      setSubmissions([newSubmission, ...submissions]);
      setOverlay({ visible: true, status: result.success ? 'success' : 'error' });
      
      setTimeout(() => { 
        setOverlay({ visible: false, status: 'loading', message: '' }); 
        setSelectedTab('submissions'); 
      }, 1500);
    } catch (err) {
      setOverlay({ visible: true, status: 'error', message: err.message });
      setTimeout(() => setOverlay({ visible: false }), 2000);
    }
  };

  const handleStepChange = (newStep) => {
    if (newStep > currentProblem && problemStatuses[currentProblem - 1] !== 'passed') {
      updateProblemStatus(currentProblem - 1, 'skipped');
    }
    setCurrentProblem(newStep);
  };

  // --- 5. Render Logic ---
  if (isLoading) return <FeedbackOverlay status="loading" isVisible={true} message="Initializing DBLearn..." />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative font-sans text-left text-slate-900">
      <div className="absolute inset-0 opacity-[0.03] bg-[size:24px_24px] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] pointer-events-none fixed"></div>

      {overlay.visible && (
        <FeedbackOverlay status={overlay.status} isVisible={overlay.visible} onNextStep={() => setOverlay({ visible: false })} />
      )}

      {showLoginModal && !isLoggedIn && (
        <Login onLogin={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />
      )}
      
      <Header currentPage={currentPage} onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} onLogout={handleLogout} onLoginClick={() => setShowLoginModal(true)} />

      <main className="container mx-auto px-4 py-12 relative z-10 min-h-screen">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} onShowLogin={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} />}

        {isLoggedIn ? (
          <>
            {currentPage === 'courses' && <Courses onNavigate={setCurrentPage} />}
            {currentPage === 'coursetext' && <CourseText onNavigate={setCurrentPage} />}
            {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} />}
            
            {currentPage === 'workspace' && (
              <div className="animate-in fade-in zoom-in-95 duration-300 pb-32">
                <div className="mb-10 flex items-center justify-between">
                  <h1 className="text-6xl font-black tracking-tighter uppercase ">SQL Assignment</h1>
                  <button onClick={() => setCurrentPage('coursetext')} className="bg-white border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 transition-all flex items-center gap-2">← Back to Lesson</button>
                </div>

                <StepIndicator 
                    totalSteps={filteredProblemsList.length || 1} 
                    currentStep={currentProblem} 
                    onStepChange={handleStepChange} 
                    statuses={problemStatuses} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
                  <LeftPanel problemData={problemData} currentStep={currentProblem} />
                  <div className="lg:col-span-2">
                    <Tabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
                    {selectedTab === 'description' ? <RightPanel problemData={problemData} currentStep={currentProblem} onSubmit={handleSubmit} /> : <MySubmissions submissions={submissions} problemData={problemData} />}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          currentPage !== 'home' && <Home onNavigate={setCurrentPage} onShowLogin={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} />
        )}
      </main>

      {/* ✨ AI Bot Widget - โทนสี Professional, Clean & Simple */}
      {currentPage === 'workspace' && isLoggedIn && (
        <div className="fixed bottom-10 right-10 z-50 flex items-end gap-6" ref={hintRef}>
          
          {/* Chat Bubble Window */}
          <div className={`transition-all duration-300 transform origin-bottom-right ${isHintOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none translate-y-10'}`}>
            <div className="bg-white border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] rounded-2xl w-[400px] md:w-[450px] mb-6 relative flex flex-col overflow-hidden">
              
              {/* Window Header - เปลี่ยนเป็นสีกรมท่าเข้ม ดูเรียบหรูทางการ */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg">🤖</span>
                  <h4 className="font-black text-lg uppercase tracking-widest text-white">AI Assistant</h4>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-600"></div>
                </div>
              </div>
              
              {/* Chat Body */}
              <div className="p-6 bg-slate-50">
                {/* Terminal Display - ใช้พื้นหลังสีเทาเข้ม ตัวหนังสือสบายตา */}
                <div className="p-6 bg-slate-800 border-[3px] border-slate-900 rounded-xl shadow-inner min-h-[150px] text-left relative">
                  <p className="text-slate-400 text-xs font-black uppercase mb-3 tracking-widest flex items-center gap-2">
                    <span className="text-emerald-400">{'>'}</span> 
                    {/* ✨ เเก้ไขเฉพาะข้อความตรงนี้ตามที่สั่ง */}
                    <span>{currentHints.length > 0 ? `Hint ${hintIndex + 1} of ${currentHints.length}` : 'HINTS STANDBY'}</span>
                    <span className="animate-pulse w-2 h-4 bg-emerald-400 inline-block ml-1"></span>
                  </p>
                  <p className="text-[15px] font-medium font-mono leading-relaxed text-slate-200">
                    {/* ✨ เเก้ไขเฉพาะข้อความตรงนี้ตามที่สั่ง */}
                    {currentHints.length > 0 ? currentHints[hintIndex]?.message : 'Submit your SQL query first. If you encounter any errors or incorrect results, I will analyze your code and provide hints here.'}
                  </p>
                </div>

                {/* ปุ่มเลื่อนดูคำใบ้ - ดีไซน์คลีนๆ ขาวดำ */}
                {currentHints.length > 1 && (
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => setHintIndex(prev => Math.max(0, prev - 1))}
                      disabled={hintIndex === 0}
                      className="px-5 py-2.5 bg-white border-[3px] border-slate-900 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-y-0.5 active:translate-y-1 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      ← Prev
                    </button>
                    <button 
                      onClick={() => setHintIndex(prev => Math.min(currentHints.length - 1, prev + 1))}
                      disabled={hintIndex === currentHints.length - 1}
                      className="px-5 py-2.5 bg-slate-900 text-white border-[3px] border-slate-900 rounded-xl font-black text-xs uppercase shadow-[3px_3px_0px_0px_#0f172a] hover:-translate-y-0.5 active:translate-y-1 disabled:opacity-50 disabled:shadow-none transition-all"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </div>

              {/* Chat Bubble Tail */}
              <div className="absolute -bottom-[16px] right-[65px] w-8 h-8 bg-slate-50 border-r-[4px] border-b-[4px] border-slate-900 rotate-[45deg] z-10"></div>
            </div>
          </div>

          {/* Bot Toggle Button - ลดขนาดเงาและขอบให้มินิมอลขึ้น */}
          <button 
            onClick={() => setIsHintOpen(!isHintOpen)} 
            className={`relative w-24 h-24 md:w-28 md:h-28 rounded-3xl border-[4px] border-slate-900 flex items-center justify-center transition-all duration-300 z-50 p-4 bg-white
              ${isHintOpen 
                ? 'translate-y-1 shadow-none' 
                : 'shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:-translate-y-1'
              }`}
          >
            {/* กล่องแจ้งเตือนคำใบ้ (จุดแดง) ปรับให้ดูเป็นธรรมชาติ */}
            {currentHints.length > 0 && !isHintOpen && (
              <div className="absolute -top-2 -right-2 flex items-center justify-center h-8 w-8 z-20">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative flex items-center justify-center rounded-full h-8 w-8 bg-red-500 border-[3px] border-slate-900 text-white font-black text-xs">
                  !
                </span>
              </div>
            )}
            
            {/* รูป Bot */}
            <img 
              src={botIcon} 
              alt="Bot" 
              className={`w-full h-full object-contain transition-all duration-300 ${isHintOpen ? 'scale-90 opacity-60' : 'scale-100'}`} 
            />
          </button>
        </div>
      )}
    </div>
  );
}