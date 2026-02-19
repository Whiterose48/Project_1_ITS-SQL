import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import { authenticateUser } from './lib/users'; 
import botIcon from './assets/bot.png'; 

export default function App() {
  const isFreshEntry = !sessionStorage.getItem('is_initialized');

  const [user, setUser] = useState(() => {
    if (isFreshEntry) return null;
    const saved = sessionStorage.getItem('userData');
    return saved ? JSON.parse(saved) : null;
  });

  const isLoggedIn = !!user;

  const [currentPage, setCurrentPage] = useState(() => {
    if (isFreshEntry) return 'home';
    const auth = sessionStorage.getItem('isLoggedIn') === 'true';
    if (!auth) return 'home';
    return sessionStorage.getItem('currentPage') || 'home';
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [workspaceMode, setWorkspaceMode] = useState(() => localStorage.getItem('workspaceMode') || 'COURSE');

  const handleLogout = useCallback(() => {
    setUser(null);
    setCurrentPage('home'); 
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentPage');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
  }, []);

  const handleLogin = (id, password) => {
    const result = authenticateUser(id, password);
    if (result.success) {
      setUser(result.user);
      setShowLoginModal(false);
      setLoginError('');
      setCurrentPage('home');
      sessionStorage.setItem('userData', JSON.stringify(result.user));
      sessionStorage.setItem('isLoggedIn', 'true');
    } else {
      setLoginError(result.error);
    }
  };

  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    setShowWarning(false);
    setCountdown(30);

    if (isLoggedIn) {
      warningRef.current = setTimeout(() => {
        setShowWarning(true);
        countdownIntervalRef.current = setInterval(() => {
          setCountdown(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
      }, 150000); 

      timeoutRef.current = setTimeout(() => handleLogout(), 180000); 
    }
  }, [isLoggedIn, handleLogout]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => events.forEach(event => window.removeEventListener(event, resetTimer));
  }, [resetTimer]);

  useEffect(() => {
    sessionStorage.setItem('is_initialized', 'true');
    const initializeApp = async () => {
      try { 
        if (!window.duckdb_initialized) {
          await dbManager.initialize(); 
          window.duckdb_initialized = true;
        }
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    initializeApp();
  }, []);

  useEffect(() => { sessionStorage.setItem('currentPage', currentPage); }, [currentPage]);

  // ✨ useCallback เพื่อป้องกันการสร้างฟังก์ชันใหม่ซ้ำๆ (จุดแก้บั๊กช้า)
  const getWorkspaceKeys = useCallback(() => {
    const mode = localStorage.getItem('workspaceMode') || 'COURSE';
    const modId = localStorage.getItem('workspaceModule') || '01';
    const userId = user?.id || 'guest';
    return {
      statusKey: `statuses_${userId}_${mode}_${modId}`,
      stepKey: `currentStep_${userId}_${mode}_${modId}`,
      submissionKey: `submissions_${userId}_${mode}_${modId}`
    };
  }, [user?.id]);

  const [currentProblem, setCurrentProblem] = useState(1);
  const [selectedTab, setSelectedTab] = useState(() => localStorage.getItem('selectedTab') || 'description');
  const [problemData, setProblemData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [overlay, setOverlay] = useState({ visible: false, status: 'loading', message: '' });
  const [filteredProblemsList, setFilteredProblemsList] = useState([]);
  const [problemStatuses, setProblemStatuses] = useState([]);
  
  const [currentHints, setCurrentHints] = useState([]);
  const [hintIndex, setHintIndex] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [botAlert, setBotAlert] = useState(false); 
  const hintRef = useRef(null);

  useEffect(() => { localStorage.setItem('selectedTab', selectedTab); }, [selectedTab]);

  const refreshCurrentSubmissions = useCallback((step) => {
    const { submissionKey } = getWorkspaceKeys();
    const allSubs = JSON.parse(localStorage.getItem(submissionKey)) || {};
    const specificSub = allSubs[step || currentProblem];
    setSubmissions(specificSub ? [specificSub] : []);
  }, [getWorkspaceKeys, currentProblem]);

  // ✨ Effect จัดการ Workspace แบบ High Performance
  useEffect(() => {
    if (currentPage === 'workspace') {
      const mode = localStorage.getItem('workspaceMode') || 'COURSE';
      const modId = localStorage.getItem('workspaceModule') || '01';
      setWorkspaceMode(mode);

      const currentList = problems.filter(p => p.type === mode && p.moduleId === modId);
      setFilteredProblemsList(currentList);
      
      const { statusKey, stepKey } = getWorkspaceKeys();
      const savedStatuses = localStorage.getItem(statusKey);
      setProblemStatuses(savedStatuses ? JSON.parse(savedStatuses) : []);
      
      const savedStep = parseInt(localStorage.getItem(stepKey)) || 1;
      const safeStep = (savedStep >= 1 && savedStep <= currentList.length) ? savedStep : 1;

      if (currentList.length > 0) {
        const stepIndex = safeStep - 1;
        setCurrentProblem(safeStep);
        setProblemData(currentList[stepIndex]);
        refreshCurrentSubmissions(safeStep);
      } else {
        setProblemData({
          title: `NO CONTENT FOUND`,
          description: `กรุณาติดต่อผู้สอนเพื่อเพิ่มข้อสอบ`,
          requirements: [], table: 'N/A', columns: [], goldenQuery: ''
        });
      }
    }
  }, [currentPage, getWorkspaceKeys]); // dependency แค่นี้พอ เพื่อหยุด Loop

  // ✨ เมื่อมีการเปลี่ยนข้อ แยกออกมาเพื่อให้ทำงานรวดเร็ว
  useEffect(() => {
    if (currentPage === 'workspace' && filteredProblemsList.length > 0) {
      const { stepKey } = getWorkspaceKeys();
      const target = filteredProblemsList[currentProblem - 1];
      if (target) {
        setProblemData(target);
        refreshCurrentSubmissions(currentProblem);
        localStorage.setItem(stepKey, currentProblem.toString());
      }
    }
  }, [currentProblem, filteredProblemsList, currentPage, getWorkspaceKeys, refreshCurrentSubmissions]);

  const updateProblemStatus = (index, status) => {
    setProblemStatuses(prev => {
      const next = [...prev];
      next[index] = status;
      const { statusKey } = getWorkspaceKeys();
      localStorage.setItem(statusKey, JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = async (code, language) => {
    if(!problemData || problemData.title === 'NO CONTENT FOUND') return;
    resetTimer(); 
    setOverlay({ visible: true, status: 'loading', message: 'Validating Query...' });
    try {
      const result = await new Verifier().verify(code, problemData.goldenQuery);
      const hasSemicolon = code.trim().endsWith(';');
      const isPassed = result.success && hasSemicolon;
      
      updateProblemStatus(currentProblem - 1, isPassed ? 'passed' : 'failed');

      const { submissionKey } = getWorkspaceKeys();
      const mode = localStorage.getItem('workspaceMode') || 'COURSE';
      const modId = localStorage.getItem('workspaceModule') || '01';
      const existingSubs = JSON.parse(localStorage.getItem(submissionKey)) || {};
      const newSubmission = { code, passed: isPassed, timestamp: new Date().toLocaleString(), queryResult: result.studentResult };
      existingSubs[currentProblem] = newSubmission;
      localStorage.setItem(submissionKey, JSON.stringify(existingSubs));

      if (isPassed && user) {
        if (mode === 'ASSIGNMENT') {
          // For ASSIGNMENT: only mark lesson COMPLETED when ALL problems are passed
          const { statusKey } = getWorkspaceKeys();
          const updatedStatuses = JSON.parse(localStorage.getItem(statusKey)) || [];
          updatedStatuses[currentProblem - 1] = 'passed';
          const totalProblems = problems.filter(p => p.type === 'ASSIGNMENT' && p.moduleId === modId).length;
          const allPassed = totalProblems > 0 && updatedStatuses.filter(s => s === 'passed').length >= totalProblems;
          if (allPassed) {
            const storageKey = `course_06070999_${user.id}_${mode}_lessons`;
            const savedLessons = JSON.parse(localStorage.getItem(storageKey)) || [];
            const updatedLessons = savedLessons.map(lesson => lesson.id === modId ? { ...lesson, status: 'COMPLETED' } : lesson);
            localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
          }
        } else {
          const storageKey = `course_06070999_${user.id}_${mode}_lessons`;
          const savedLessons = JSON.parse(localStorage.getItem(storageKey)) || [];
          const updatedLessons = savedLessons.map(lesson => lesson.id === modId ? { ...lesson, status: 'COMPLETED' } : lesson);
          localStorage.setItem(storageKey, JSON.stringify(updatedLessons));
        }
      }

      let hints = [];
      if (!isPassed && mode !== 'EXAM') {
        hints = new HintEngine().generateHints(code, result, problemData);
        if (result.success && !hasSemicolon) hints = [{ message: "Syntax Error: SQL queries must end with a semicolon (;)." }];
        setCurrentHints(hints); setHintIndex(0); setBotAlert(true); 
      } else { setBotAlert(false); }

      setSubmissions([newSubmission]);
      setOverlay({ visible: true, status: isPassed ? 'success' : 'error' });
      setTimeout(() => {
        setOverlay({ visible: false });
        setSelectedTab('submissions');
        // EXAM: Auto-advance to next unanswered problem after correct answer
        if (isPassed && mode === 'EXAM') {
          const totalSteps = filteredProblemsList.length;
          const { statusKey } = getWorkspaceKeys();
          const latestStatuses = JSON.parse(localStorage.getItem(statusKey)) || [];
          latestStatuses[currentProblem - 1] = 'passed';
          // Find next unanswered problem
          for (let i = 0; i < totalSteps; i++) {
            if (latestStatuses[i] !== 'passed') {
              setCurrentProblem(i + 1);
              return;
            }
          }
        }
      }, 1500);
    } catch (err) { 
      setOverlay({ visible: true, status: 'error', message: 'Parser Error' });
      setTimeout(() => setOverlay({ visible: false }), 2000);
    }
  };

  const handleStepChange = (newStep) => {
    // EXAM: prevent navigating to already-passed problems (locked)
    const mode = localStorage.getItem('workspaceMode') || 'COURSE';
    if (mode === 'EXAM' && problemStatuses[newStep - 1] === 'passed') {
      return; // Cannot go back to passed exam problems
    }
    if (newStep > currentProblem && problemStatuses[currentProblem - 1] !== 'passed') {
      updateProblemStatus(currentProblem - 1, 'skipped');
    }
    setCurrentProblem(newStep);
  };

  if (isLoading) return <FeedbackOverlay isVisible={true} />;

  return (
    <div className="min-h-screen relative font-sans text-left text-slate-900 overflow-x-hidden">
      <style>{`
          body, html { cursor: url("data:image/svg+xml,%3Csvg width='28' height='32' viewBox='0 0 28 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 4V28L11 21L16 29L21 26L16 18L24 18L4 4Z' fill='black'/%3E%3Cpath d='M0 0V24L7 17L12 25L17 22L12 14L20 14L0 0Z' fill='%23FF9900' stroke='black' stroke-width='2' stroke-linejoin='round'/%3E%3Ccircle cx='5' cy='7' r='1.5' fill='white'/%3E%3C/svg%3E") 0 0, auto; }
          button, a, select, [role="button"], .cursor-pointer { cursor: url("data:image/svg+xml,%3Csvg width='28' height='32' viewBox='0 0 28 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4 4V28L11 21L16 29L21 26L16 18L24 18L4 4Z' fill='black'/%3E%3Cpath d='M0 0V24L7 17L12 25L17 22L12 14L20 14L0 0Z' fill='%23FF9900' stroke='black' stroke-width='2' stroke-linejoin='round'/%3E%3Ccircle cx='5' cy='7' r='1.5' fill='white'/%3E%3C/svg%3E") 0 0, pointer; }
          input, textarea, .monaco-editor * { cursor: text; }
          @keyframes soft-pulse { 0% { transform: scale(0.9); opacity: 0.8; } 50% { transform: scale(1.4); opacity: 0.2; } 100% { transform: scale(0.9); opacity: 0.8; } }
          .animate-soft-pulse { animation: soft-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {showWarning && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white border-[5px] border-slate-900 shadow-[12px_12px_0px_0px_#ef4444] p-10 rounded-[32px] max-w-md w-full text-center space-y-6">
            <div className="text-6xl animate-bounce">⚠️</div>
            <h3 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Session Expiring</h3>
            <p className="text-slate-600 font-bold text-lg leading-relaxed">ระบบจะ Logout อัตโนมัติในอีก <span className="text-red-600 font-black text-2xl font-mono underline decoration-4 underline-offset-4">{countdown}</span> วินาที</p>
            <button onClick={resetTimer} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-[6px_6px_0px_0px_#ef4444] hover:translate-y-1 transition-all active:translate-y-2 active:shadow-none cursor-pointer">Stay Connected</button>
          </div>
        </div>
      )}

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#F8FAFC]"></div>
        <div className="absolute inset-0 opacity-[0.04] bg-[size:32px_32px] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)]"></div>
      </div>

      {overlay.visible && <FeedbackOverlay isVisible={overlay.visible} />}
      {showLoginModal && !isLoggedIn && <Login onLogin={handleLogin} onClose={() => { setShowLoginModal(false); setLoginError(''); }} loginError={loginError} />}
      <Header currentPage={currentPage} onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} userData={user} onLogout={handleLogout} onLoginClick={() => setShowLoginModal(true)} />

      <main className="container mx-auto px-4 py-12 relative z-10 min-h-screen">
        {currentPage === 'home' && <Home onNavigate={setCurrentPage} onShowLogin={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} />}
        {isLoggedIn ? (
          <>
            {currentPage === 'courses' && <Courses onNavigate={setCurrentPage} user={user} />}
            {currentPage === 'coursetext' && <CourseText onNavigate={setCurrentPage} user={user} />}
            {currentPage === 'dashboard' && <Dashboard onNavigate={setCurrentPage} user={user} />}
            {currentPage === 'workspace' && problemData && (
              <div className="animate-in fade-in zoom-in-95 duration-300 pb-32">
                <div className="mb-10 flex items-center justify-between">
                  <h1 className="text-6xl font-black tracking-tighter uppercase ">SQL Assignment</h1>
                  <button onClick={() => setCurrentPage('coursetext')} className="bg-white border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 transition-all flex items-center gap-2 cursor-pointer">← Back to Lesson</button>
                </div>
                <StepIndicator totalSteps={filteredProblemsList.length || 1} currentStep={currentProblem} onStepChange={handleStepChange} statuses={problemStatuses} lockedSteps={workspaceMode === 'EXAM' ? problemStatuses.map(s => s === 'passed') : []} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mt-10">
                  <LeftPanel problemData={problemData} currentStep={currentProblem} />
                  <div className="lg:col-span-2 relative z-20">
                    <Tabs selectedTab={selectedTab} onTabChange={setSelectedTab} />
                    {selectedTab === 'description' ? (
                      <RightPanel problemData={problemData} currentStep={currentProblem} onSubmit={handleSubmit} isExamLocked={workspaceMode === 'EXAM' && problemStatuses[currentProblem - 1] === 'passed'} />
                    ) : (
                      <MySubmissions submissions={submissions} problemData={problemData} />
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          currentPage !== 'home' && <Home onNavigate={setCurrentPage} onShowLogin={() => setShowLoginModal(true)} isLoggedIn={isLoggedIn} />
        )}
      </main>

      {currentPage === 'workspace' && isLoggedIn && workspaceMode !== 'EXAM' && (
        <>
          {isHintOpen && <div className="fixed inset-0 z-[1999] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setIsHintOpen(false)}></div>}
          <div className="fixed bottom-10 right-10 z-[2000] flex flex-col items-end pointer-events-none" ref={hintRef}>
            <div className={`pointer-events-auto absolute bottom-full right-0 mb-4 transition-all duration-300 origin-bottom-right ${isHintOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <div className="bg-white border-[5px] border-slate-900 shadow-[15px_15px_0px_0px_#000] rounded-[40px] w-[90vw] max-w-[850px] relative flex flex-col overflow-hidden">
                <div className="bg-slate-900 text-white px-10 py-6 flex items-center border-b-[5px] border-slate-900">
                  <h4 className="font-black text-2xl uppercase tracking-[0.2em]">Agentic Intelligence SQL</h4>
                </div>
                <div className="p-10 bg-slate-50">
                  <div className="p-10 bg-slate-800 border-[5px] border-slate-900 rounded-[30px] shadow-[inset_6px_6px_0px_0px_rgba(0,0,0,0.3)] min-h-[220px] flex flex-col justify-center relative">
                    <p className="text-emerald-400 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 mb-4"><span className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></span>DEEP ANALYSIS: {hintIndex + 1} / {currentHints.length || 0}</p>
                    <p className="text-2xl font-bold font-mono leading-relaxed text-slate-100">{currentHints.length > 0 ? currentHints[hintIndex]?.message : "Submit query for analysis."}</p>
                  </div>
                  {currentHints.length > 1 && (
                    <div className="flex gap-6 mt-8">
                      <button onClick={(e) => { e.stopPropagation(); setHintIndex(prev => Math.max(0, prev - 1)); }} className="flex-1 bg-white border-[4px] border-slate-900 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_0px_#000] hover:translate-y-1 transition-all cursor-pointer">Previous</button>
                      <button onClick={(e) => { e.stopPropagation(); setHintIndex(prev => Math.min(currentHints.length - 1, prev + 1)); }} className="flex-1 bg-slate-900 text-white border-[4px] border-slate-900 py-4 rounded-2xl font-black uppercase text-sm tracking-widest shadow-[6px_6px_0px_0px_#FF9900] hover:translate-y-1 transition-all cursor-pointer">Next</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsHintOpen(!isHintOpen); setBotAlert(false); }} className={`pointer-events-auto cursor-pointer relative w-32 h-32 rounded-[40px] border-[6px] border-slate-900 flex items-center justify-center bg-white transition-all transform hover:-translate-y-2 ${isHintOpen ? 'translate-y-2 shadow-none' : 'shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]'}`}>
              {botAlert && <div className="absolute -top-3 -left-3 z-50 w-10 h-10 bg-[#ef4444] text-white rounded-full border-[4px] border-[#1e293b] flex items-center justify-center shadow-lg"><span className="font-black text-xl">!</span></div>}
              <img src={botIcon} alt="Bot" className="w-full h-full object-contain p-3" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}