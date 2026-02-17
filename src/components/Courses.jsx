import React, { useState, useEffect } from 'react';

// ✨ ข้อมูลจำลองรายวิชา
const INITIAL_COURSE_DATA = [
  {
    id: '06070999',
    term: '2/2568',
    name: 'DATABASE CONCEPT SYSTEM',
    releaseDate: '24 Nov 2025',
    owner: 'ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช',
    theme: 'bg-[#000066]', 
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white opacity-90">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>
    )
  }
];

const DEFAULT_LESSONS = [
  { id: '01', title: 'DATABASE FUNDAMENTALS', type: 'DOCUMENT', status: 'PENDING', desc: 'พื้นฐานระบบฐานข้อมูลและความสัมพันธ์ของข้อมูล' },
  { id: '02', title: 'SELECT STATEMENT', type: 'VIDEO', status: 'PENDING', desc: 'การดึงข้อมูลพื้นฐานด้วยคำสั่ง SELECT และ DISTINCT' },
  { id: '03', title: 'WHERE CLAUSE & OPERATORS', type: 'PRACTICE', status: 'PENDING', desc: 'การกรองข้อมูลอย่างละเอียดด้วยเงื่อนไขต่างๆ' },
  { id: '04', title: 'ORDER BY & LIMIT', type: 'PRACTICE', status: 'PENDING', desc: 'การจัดเรียงลำดับผลลัพธ์และการจำกัดจำนวนข้อมูล' },
  { id: '05', title: 'JOINS & RELATIONSHIPS', type: 'VIDEO', status: 'PENDING', desc: 'การรวมตารางหลายใบเข้าด้วยกันเพื่อดึงข้อมูลที่ซับซ้อน' },
];

export default function Courses({ onNavigate }) {
  const [unlockModal, setUnlockModal] = useState({ isOpen: false, course: null });
  const [enrollCode, setEnrollCode] = useState('');
  
  const isEnrolled = (courseId) => {
    return localStorage.getItem(`course_${courseId}_lessons`) !== null;
  };

  const handleEnterCourse = (courseId) => {
    if (!isEnrolled(courseId)) {
      localStorage.setItem(`course_${courseId}_lessons`, JSON.stringify(DEFAULT_LESSONS));
    }
    onNavigate('coursetext');
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    if (!enrollCode.trim()) return;
    localStorage.setItem(`course_${unlockModal.course.id}_lessons`, JSON.stringify(DEFAULT_LESSONS));
    setUnlockModal({ isOpen: false, course: null });
    setEnrollCode('');
    onNavigate('coursetext');
  };

  return (
    <div className="max-w-[1250px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 mt-10 pb-32 px-4 text-left">
      
      <div className="relative group">
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase ">
          Course Catalog
        </h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Explore our database curriculum</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {INITIAL_COURSE_DATA.map((course) => (
          <div 
            key={course.id} 
            className="flex flex-col lg:flex-row bg-white border-[3px] border-slate-900 shadow-[8px_8px_0px_0px_#000] rounded-3xl overflow-hidden hover:-translate-y-0.5 transition-all duration-300"
          >
            
            {/* 1. ส่วนไอคอน (เล็กลง) */}
            <div className={`${course.theme} w-full lg:w-64 p-10 flex flex-col items-center justify-center border-b-[3px] lg:border-b-0 lg:border-r-[3px] border-slate-900 relative`}>
              <div className="mb-6">{course.icon}</div>
              <div className="bg-white text-slate-900 font-black font-mono px-4 py-2 border-2 border-slate-900 shadow-[3px_3px_0px_0px_#000] text-sm">
                ID: {course.id}
              </div>
            </div>

            {/* 2. ส่วนเนื้อหา (ปรับขนาดตัวอักษรลง) */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center">
              <div className="space-y-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] border-2 border-slate-100 px-3 py-1 rounded bg-slate-50 inline-block">
                  TERM {course.term}
                </span>
                
                <h2 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase tracking-tighter leading-tight max-w-xl">
                  {course.name}
                </h2>

                <div className="flex flex-col gap-4 pt-2 border-t-2 border-slate-50">
                  {/* Instructor */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FF9900]/10 flex items-center justify-center border-2 border-[#FF9900]/20">
                       <span className="text-lg">👤</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                      <p className="text-lg font-black text-slate-800 leading-none">
                        {course.owner}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#000066]/10 flex items-center justify-center border-2 border-[#000066]/20">
                       <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Release Date</p>
                      <p className="text-lg font-black text-slate-800 leading-none">
                        {course.releaseDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ส่วนปุ่มกด (กระชับขึ้น) */}
            <div className="w-full lg:w-80 bg-slate-50 p-10 flex flex-col justify-center items-center border-t-[3px] lg:border-t-0 lg:border-l-[3px] border-slate-900">
              <div className="text-center w-full mb-8">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">COURSE STATUS</p>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${isEnrolled(course.id) ? 'bg-emerald-400 animate-pulse' : 'bg-slate-200'}`}></div>
                  <p className={`font-black uppercase tracking-widest text-[11px] ${isEnrolled(course.id) ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {isEnrolled(course.id) ? 'READY TO LEARN' : 'ACCESS LOCKED'}
                  </p>
                </div>
              </div>

              {isEnrolled(course.id) ? (
                <button 
                  onClick={() => handleEnterCourse(course.id)}
                  className="w-full bg-[#FF9900] text-[#000066] font-black text-xs uppercase tracking-[0.1em] py-4 border-[3px] border-slate-900 rounded-2xl shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  ENTER COURSE <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              ) : (
                <button 
                  onClick={() => setUnlockModal({ isOpen: true, course })}
                  className="w-full bg-white text-slate-900 font-black text-xs uppercase tracking-[0.1em] py-4 border-[3px] border-slate-900 rounded-2xl shadow-[5px_5px_0px_0px_#cbd5e1] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  UNLOCK ACCESS 🔒
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* --- Modal --- */}
      {unlockModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/40 animate-in fade-in duration-300">
          <div className="relative w-full max-w-md bg-white border-[4px] border-slate-900 shadow-[12px_12px_0px_0px_#000] rounded-3xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 bg-[#FF9900] border-b-[4px] border-slate-900 flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 uppercase">Unlock Course</h3>
              <button onClick={() => setUnlockModal({ isOpen: false, course: null })} className="bg-white border-[2px] border-slate-900 w-8 h-8 rounded-lg flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#000] hover:bg-red-500 hover:text-white transition-all text-sm">✕</button>
            </div>
            <div className="p-7 space-y-6">
              <form onSubmit={handleUnlockSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter enrollment code..."
                  value={enrollCode}
                  onChange={(e) => setEnrollCode(e.target.value)}
                  className="w-full bg-slate-50 border-[3px] border-slate-900 rounded-xl p-4 font-black text-base focus:outline-none focus:border-[#FF9900] transition-all"
                  autoFocus
                />
                <button type="submit" className="w-full bg-[#000066] text-white font-black uppercase tracking-widest py-4 border-[3px] border-slate-900 rounded-xl shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
                  ACTIVATE NOW 🚀
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}