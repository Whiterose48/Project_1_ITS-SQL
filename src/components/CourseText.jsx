import React, { useState, useEffect } from 'react';
import { problems } from '../lib/problems';

const INITIAL_LESSONS = [
  { id: '01', title: 'DATABASE FUNDAMENTALS', status: 'PENDING', desc: 'พื้นฐานระบบฐานข้อมูลและความสัมพันธ์ของข้อมูล' },
  { id: '02', title: 'SELECT STATEMENT', status: 'PENDING', desc: 'การดึงข้อมูลพื้นฐานด้วยคำสั่ง SELECT และ DISTINCT' },
  { id: '03', title: 'WHERE CLAUSE & OPERATORS', status: 'PENDING', desc: 'การกรองข้อมูลอย่างละเอียดด้วยเงื่อนไขต่างๆ' },
  { id: '04', title: 'ORDER BY & LIMIT', status: 'PENDING', desc: 'การจัดเรียงลำดับผลลัพธ์และการจำกัดจำนวนข้อมูล' },
  { id: '05', title: 'JOINS & RELATIONSHIPS', status: 'PENDING', desc: 'การรวมตารางหลายใบเข้าด้วยกันเพื่อดึงข้อมูลที่ซับซ้อน' },
];

export default function CourseText({ onNavigate, user }) {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('course_active_tab') || 'COURSE');
  const [expandedId, setExpandedId] = useState(null); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [scoreOverlayData, setScoreOverlayData] = useState(null);
  
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const EXAM_DURATION = 60 * 60 * 1000; 

  const getExamProblemCount = (moduleId) => {
    return problems.filter(p => p.type === 'EXAM' && p.moduleId === moduleId).length;
  };

  const checkExamCompletion = (moduleId) => {
    if (!user) return false;
    const totalProblems = getExamProblemCount(moduleId);
    if (totalProblems === 0) return false; 

    const submissionsKey = `submissions_${user.id}_EXAM_${moduleId}`;
    const userSubs = JSON.parse(localStorage.getItem(submissionsKey)) || {};
    const attemptedCount = Object.keys(userSubs).length;
    
    return attemptedCount >= totalProblems;
  };

  useEffect(() => {
    if (!user) return; 
    const storageKey = `course_06070999_${user.id}_${activeTab}_lessons`;
    const saved = localStorage.getItem(storageKey);
    if (saved) setLessons(JSON.parse(saved));
    else setLessons(INITIAL_LESSONS);

    // Auto-green: check if all problems in ASSIGNMENT modules are passed
    if (activeTab === 'ASSIGNMENT') {
      const storageKeyForSave = `course_06070999_${user.id}_ASSIGNMENT_lessons`;
      const currentLessons = saved ? JSON.parse(saved) : INITIAL_LESSONS;
      let updated = false;
      const updatedLessons = currentLessons.map(lesson => {
        const assignmentProblems = problems.filter(p => p.type === 'ASSIGNMENT' && p.moduleId === lesson.id);
        if (assignmentProblems.length === 0) return lesson;
        const statusKey = `statuses_${user.id}_ASSIGNMENT_${lesson.id}`;
        const statuses = JSON.parse(localStorage.getItem(statusKey)) || [];
        const allPassed = statuses.filter(s => s === 'passed').length >= assignmentProblems.length;
        if (allPassed && lesson.status !== 'COMPLETED') {
          updated = true;
          return { ...lesson, status: 'COMPLETED' };
        }
        return lesson;
      });
      if (updated) {
        setLessons(updatedLessons);
        localStorage.setItem(storageKeyForSave, JSON.stringify(updatedLessons));
      }
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (lessons.length > 0 && user) {
      const storageKey = `course_06070999_${user.id}_${activeTab}_lessons`;
      localStorage.setItem(storageKey, JSON.stringify(lessons));
    }
  }, [lessons, activeTab, user]);

  useEffect(() => {
    localStorage.setItem('course_active_tab', activeTab);
  }, [activeTab]);

  const handleMarkComplete = (id) => {
    setIsProcessing(true); 
    setTimeout(() => {
      setLessons(prevLessons => 
        prevLessons.map(lesson => lesson.id === id ? { ...lesson, status: 'COMPLETED' } : lesson)
      );
      setIsProcessing(false); 
    }, 800); 
  };

  const handleEnterWorkspace = (id) => {
    setIsProcessing(true); 
    
    if (activeTab === 'EXAM' && user) {
      const startTimeKey = `exam_start_${user.id}_${id}`;
      if (!localStorage.getItem(startTimeKey)) {
        localStorage.setItem(startTimeKey, Date.now().toString());
      }
    }

    setTimeout(() => {
      localStorage.setItem('workspaceMode', activeTab);
      localStorage.setItem('workspaceModule', id);
      setIsProcessing(false); 
      onNavigate('workspace');
    }, 500); 
  };

  const handleViewScore = (lessonId) => {
    const userId = user?.id || 'guest';
    const mode = 'EXAM';
    
    const examProblems = problems.filter(p => p.type === mode && p.moduleId === lessonId);
    const submissionsKey = `submissions_${userId}_${mode}_${lessonId}`;
    const userSubs = JSON.parse(localStorage.getItem(submissionsKey)) || {};
    
    let totalScore = 0;
    const details = examProblems.map((prob, idx) => {
        const step = idx + 1;
        const sub = userSubs[step]; 
        const isCorrect = sub && sub.passed; 
        
        if (isCorrect) totalScore += 1; 
        
        let displayStatus = 'NOT_ATTEMPTED';
        if (sub) displayStatus = sub.passed ? 'PASSED' : 'FAILED';
        
        return {
            step, title: prob.title, desc: prob.description,
            code: sub ? sub.code : '-- No Submission --', status: displayStatus 
        };
    });
    
    setScoreOverlayData({ lessonId, totalScore, maxScore: examProblems.length, details });
  };

  return (
    <div className="max-w-[1450px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left relative">
      <div className="relative group">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
        <div className="bg-[#000066] border-[4px] border-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <button onClick={() => onNavigate('courses')} className="bg-white text-[#000066] font-black text-xs uppercase tracking-widest px-6 py-3 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl cursor-pointer">
              ← BACK TO OVERVIEW
            </button>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3">
                  <div className="h-2 w-12 bg-[#FF9900] border-2 border-slate-900"></div>
                  <p className="font-mono text-sm font-black text-[#FF9900] tracking-widest uppercase">ID: 06070999</p>
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] max-w-full drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]">
                  DATABASE CONCEPT SYSTEM
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex bg-white border-[4px] border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {['COURSE', 'ASSIGNMENT', 'EXAM'].map((tab) => (
          <button key={tab} onClick={() => { setActiveTab(tab); setExpandedId(null); }}
            className={`cursor-pointer flex-1 py-5 font-black uppercase tracking-[0.2em] text-[15px] border-r-[4px] last:border-r-0 border-slate-900 transition-all ${activeTab === tab ? 'bg-[#FF9900] text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#000] rounded-2xl p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b-2 border-slate-50 pb-2">Faculty Mentors</p>
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-xs font-black text-[#FF9900] uppercase tracking-widest">Course Instructor</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 border-[3px] border-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-[3px_3px_0px_0px_#000] shrink-0 text-2xl">KA</div>
                  <div className="overflow-visible">
                    <p className="font-black text-slate-900 text-lg leading-tight">ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">PROFESSOR</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t-[3px] border-slate-100"></div>
              <div className="space-y-6">
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Teaching Assistants</p>
                {[
                  { name: 'นายพชร พรอโนทัย', initial: 'PP', role: 'TA', color: 'bg-emerald-500' },
                  { name: 'นายณัฐวีร์ เเนวกำพล', initial: 'NN', role: 'TA', color: 'bg-purple-600' }
                ].map((prof, i) => (
                  <div key={i} className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${prof.color} border-[3px] border-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_#000] shrink-0 text-xl`}>
                      {prof.initial}
                    </div>
                    <div className="overflow-visible">
                      <p className="font-black text-slate-800 text-base leading-tight">{prof.name}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{prof.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#000] rounded-3xl overflow-hidden">
            <div className="bg-slate-900 p-6 border-b-[4px] border-slate-900 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_0px_#000]"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_0px_#000]"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-[1px_1px_0px_0px_#000]"></div>
              </div>
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white ml-2">
                {activeTab === 'ASSIGNMENT' ? 'Lab Assignments' : activeTab === 'EXAM' ? 'Final Examinations' : 'Curriculum Modules'}
              </h2>
            </div>

            <div className="divide-y-[4px] divide-slate-900 bg-white">
              {lessons.map((lesson) => {
                const isAssignment = activeTab === 'ASSIGNMENT';
                const isExam = activeTab === 'EXAM';
                const displayTitle = isAssignment ? `LAB - ${lesson.title}` : isExam ? `EXAM - ${lesson.title}` : lesson.title;
                const displayDesc = isAssignment ? `โจทย์ฝึกปฏิบัติ: ${lesson.desc} ผ่านการเขียนคำสั่ง SQL จริงใน Terminal` : isExam ? `แบบทดสอบประเมินผล: ${lesson.desc} (จำกัดเวลา 1 ชั่วโมงและบังคับส่งคำตอบอัตโนมัติ)` : lesson.desc;
                const isExamCompleted = isExam ? checkExamCompletion(lesson.id) : false;
                let isTimeUp = false;
                if (isExam && user) {
                  const startTimeKey = `exam_start_${user.id}_${lesson.id}`;
                  const startTime = localStorage.getItem(startTimeKey);
                  if (startTime) isTimeUp = (now - parseInt(startTime)) >= EXAM_DURATION;
                }
                const forceShowScore = isExamCompleted || isTimeUp;

                return (
                  <div key={lesson.id} className="relative group">
                    <div onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)} className={`flex items-center justify-between p-8 cursor-pointer transition-all ${expandedId === lesson.id ? 'bg-slate-50' : 'hover:bg-blue-50/50'}`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 border-[3px] border-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_0px_#000] ${(lesson.status === 'COMPLETED' || forceShowScore) ? 'bg-[#2bdc97] text-slate-900' : 'bg-white text-slate-900'}`}>
                          {lesson.id}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900 group-hover:text-[#000066] transition-colors leading-none">{displayTitle}</h4>
                          <p className="text-sm font-bold text-slate-500 line-clamp-1 max-w-xl">{displayDesc}</p>
                        </div>
                      </div>
                      <button className={`cursor-pointer w-10 h-10 border-[3px] border-slate-900 rounded-full flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_#000] ${expandedId === lesson.id ? 'bg-slate-900 text-white rotate-180 shadow-none' : 'bg-white text-slate-900'}`}>▼</button>
                    </div>

                    {expandedId === lesson.id && (
                      <div className="p-8 bg-slate-50 border-t-[4px] border-slate-900 animate-in slide-in-from-top-6 duration-500">
                        <div className="bg-white border-[4px] border-slate-900 p-10 rounded-3xl shadow-[8px_8px_0px_0px_#000] text-left">
                          <div className="max-w-3xl space-y-6 mb-10">
                            <h5 className="text-xs font-black text-[#000066] uppercase tracking-[0.3em] flex items-center gap-2">
                              <span className="w-2 h-2 bg-[#FF9900] rounded-full border-2 border-slate-900"></span>
                              {isAssignment ? 'Practice Objectives' : isExam ? 'Examination Criteria' : 'Module Objectives'}
                            </h5>
                            <p className="text-slate-900 font-bold text-xl leading-relaxed italic border-l-[8px] border-[#FF9900] pl-6 py-4 bg-[#FF9900]/5 rounded-r-2xl">
                              "{displayDesc}. {isExam ? 'คุณมีเวลาทำข้อสอบ 1 ชั่วโมง เมื่อหมดเวลาระบบจะปิดรับคำตอบทันที' : 'ฝึกฝนทักษะการใช้งานจริงเพื่อให้เกิดความเชี่ยวชาญ'}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-5">
                            {isExam ? (
                                forceShowScore ? (
                                    <button onClick={() => handleViewScore(lesson.id)} className="cursor-pointer px-10 py-4 border-[4px] font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl bg-slate-900 text-white border-slate-900 hover:shadow-[5px_5px_0px_0px_#FF9900]">
                                      📊 VIEW SCORE
                                    </button>
                                ) : (
                                    <button onClick={() => handleEnterWorkspace(lesson.id)} disabled={isProcessing} className={`cursor-pointer bg-[#FF9900] text-[#000066] px-8 py-4 border-[4px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl flex items-center gap-3 group ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                                      <span className="text-lg">⚡</span> START EXAMINATION <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                )
                            ) : (
                                <>
                                  <button onClick={() => handleEnterWorkspace(lesson.id)} disabled={isProcessing} className={`cursor-pointer bg-[#FF9900] text-[#000066] px-8 py-4 border-[4px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl flex items-center gap-3 group ${isProcessing ? 'opacity-50 cursor-wait' : ''}`}>
                                    <span className="text-lg">⚡</span> {isAssignment ? 'START LAB ASSIGNMENT' : 'OPEN SQL TERMINAL'} <span className="group-hover:translate-x-1 transition-transform">→</span>
                                  </button>
                                  {activeTab === 'COURSE' && (
                                    <button onClick={() => handleMarkComplete(lesson.id)} disabled={lesson.status === 'COMPLETED' || isProcessing} className={`px-8 py-4 border-[4px] font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl ${lesson.status === 'COMPLETED' ? 'bg-slate-100 text-slate-400 border-slate-300 shadow-none cursor-not-allowed translate-y-1' : isProcessing ? 'bg-white text-emerald-600 border-emerald-500 shadow-emerald-200 opacity-50 cursor-wait' : 'cursor-pointer bg-white text-emerald-600 border-emerald-500 shadow-emerald-200'}`}>
                                      {lesson.status === 'COMPLETED' ? '✓ DONE' : 'MARK COMPLETED'}
                                    </button>
                                  )}
                                </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ✨ ✨ ✨ สถาปัตยกรรม Modal แบบ Deep Tech Monochromatic ใหม่ อ่านง่าย ชัดเจน 100% ✨ ✨ ✨ */}
      {scoreOverlayData && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/85 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[28px] border-[4px] border-[#0f172a] shadow-[20px_20px_0px_0px_#1e293b] flex flex-col relative overflow-hidden">
            
            {/* Header: Deep Navy with Cyan Accents */}
            <div className="bg-[#0f172a] p-8 relative overflow-hidden shrink-0 border-b-[6px] border-slate-900">
              <div className="absolute inset-0 opacity-[0.15] pointer-events-none" 
                   style={{ backgroundImage: `linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)`, backgroundSize: '20px 20px' }}></div>

              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 bg-[#38bdf8] text-[#0f172a] px-4 py-1 rounded-full border-[3px] border-slate-900 font-black text-[11px] uppercase tracking-[0.15em] shadow-[4px_4px_0px_0px_#000]">
                    System_Verification_Success
                  </div>
                  <div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-white leading-none">
                      EXAMINATION <span className="text-[#38bdf8] block md:inline">RESULT</span>
                    </h2>
                    <div className="flex items-center gap-3 mt-3">
                       <div className="h-[3px] w-12 bg-[#38bdf8]"></div>
                       <p className="text-xs font-mono font-bold tracking-widest uppercase text-slate-400">
                         MODULE_ID: {scoreOverlayData.lessonId}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 self-end md:self-auto">
                  <div className="bg-[#1e293b] px-8 py-5 rounded-2xl border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#38bdf8] group">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Grade Summary</p>
                    <div className="text-5xl font-black font-mono leading-none flex items-baseline">
                      <span className="text-white">{scoreOverlayData.totalScore.toString().padStart(2, '0')}</span>
                      <span className="text-slate-600 mx-1 text-3xl">/</span>
                      <span className="text-slate-500 text-3xl">{scoreOverlayData.maxScore.toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  <button onClick={() => setScoreOverlayData(null)} className="group cursor-pointer relative w-16 h-16 shrink-0">
                    <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-y-1.5"></div>
                    <div className="absolute inset-0 bg-white border-[4px] border-slate-900 rounded-2xl flex items-center justify-center text-[#0f172a] text-3xl font-black transition-all group-hover:-translate-y-1 group-active:translate-y-0.5">✕</div>
                  </button>
                </div>
              </div>
            </div>

            {/* ส่วนแสดงรายการคำตอบ (Body) */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-white space-y-8">
              {scoreOverlayData.details.length > 0 ? (
                  scoreOverlayData.details.map((detail, idx) => {
                    let bgClass = "bg-[#f1f5f9]"; 
                    let badgeClass = "bg-slate-300 text-slate-700";
                    let statusText = "NO SUBMISSION / TIME OUT";
                    if (detail.status === 'PASSED') { bgClass = "bg-[#34d399]"; badgeClass = "bg-white text-emerald-700"; statusText = "✅ CORRECT"; } 
                    else if (detail.status === 'FAILED') { bgClass = "bg-[#f87171]"; badgeClass = "bg-white text-red-700"; statusText = "❌ INCORRECT"; }
                    return (
                        <div key={idx} className="border-[3px] border-slate-900 rounded-2xl overflow-hidden shadow-[6px_6px_0px_0px_#0f172a]">
                          <div className={`p-4 border-b-[3px] border-slate-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${bgClass}`}>
                            <div className="flex items-center gap-4">
                              <span className="bg-[#0f172a] text-white w-12 h-12 rounded-xl flex items-center justify-center font-black font-mono text-xl border-[3px] border-slate-900 shadow-[2px_2px_0px_0px_#fff]">{detail.step}</span>
                              <h3 className={`font-black uppercase tracking-widest text-lg drop-shadow-sm ${detail.status === 'NOT_ATTEMPTED' ? 'text-slate-800' : 'text-[#0f172a]'}`}>{detail.title}</h3>
                            </div>
                            <div className={`${badgeClass} px-5 py-2 rounded-lg border-[3px] border-slate-900 font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_#0f172a]`}>{statusText}</div>
                          </div>
                          <div className="p-6 space-y-5 bg-slate-50">
                            <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Requirement</p><p className="text-slate-800 font-bold text-[15px] leading-relaxed border-l-[4px] border-slate-300 pl-4">{detail.desc}</p></div>
                            <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Submitted Query</p><div className="bg-[#1e1e1e] p-5 rounded-xl border-[3px] border-slate-800 relative"><pre className={`font-mono text-sm whitespace-pre-wrap ${detail.status === 'NOT_ATTEMPTED' ? 'text-slate-500 italic' : 'text-emerald-400'}`}>{detail.code}</pre></div></div>
                          </div>
                        </div>
                    );
                  })
              ) : (
                  <div className="text-center py-20 flex flex-col items-center">
                      <div className="text-6xl mb-4 grayscale opacity-50">📝</div>
                      <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-lg">No examination data found.</p>
                      <p className="text-slate-400 font-bold text-sm mt-2">Please add problems with type: 'EXAM' in lib/problems.js</p>
                  </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}