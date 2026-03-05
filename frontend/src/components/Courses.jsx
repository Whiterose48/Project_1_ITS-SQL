import React, { useState, useEffect } from 'react';
import { enrollInCourse } from '../lib/api';

const INITIAL_COURSE_DATA = [
  { 
    id: '06070999', 
    name: 'DATABASE CONCEPT SYSTEM', 
    code: 'DB101', 
    theme: 'bg-[#000066]', 
    instructor: 'ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช' 
  }
];

export default function Courses({ onNavigate, user }) {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [enrolledList, setEnrolledList] = useState({});
  const [isEnrolling, setIsEnrolling] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`user_enrolled_${user.id}`);
      if (saved) {
        setEnrolledList(JSON.parse(saved));
      }
    }
  }, [user]);

  const handleCourseClick = (course) => {
    if (enrolledList[course.id]) {
      onNavigate('coursetext');
    } else {
      setSelectedCourse(course);
      setError('');
      setAccessCode('');
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || isEnrolling) return;
    setIsEnrolling(true);
    setError('');

    try {
      // Try backend API first
      await enrollInCourse(selectedCourse.id, accessCode);
      const newList = { ...enrolledList, [selectedCourse.id]: true };
      localStorage.setItem(`user_enrolled_${user.id}`, JSON.stringify(newList));
      setEnrolledList(newList);
      setSelectedCourse(null);
      onNavigate('coursetext');
    } catch (apiErr) {
      // Fallback: check access code locally (DB101 or ITSSQL2025)
      const validCodes = [selectedCourse.code, 'ITSSQL2025'];
      if (validCodes.includes(accessCode)) {
        const newList = { ...enrolledList, [selectedCourse.id]: true };
        localStorage.setItem(`user_enrolled_${user.id}`, JSON.stringify(newList));
        setEnrolledList(newList);
        setSelectedCourse(null);
        onNavigate('coursetext');
      } else {
        setError(apiErr?.message || 'Invalid Access Code. Please try again.');
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="max-w-[1450px] mx-auto space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-6 sm:pt-10 px-4 sm:px-6 text-left relative">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase">Overview Courses</h1>
        <p className="text-base sm:text-lg md:text-xl font-bold text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.3em]">Select a module to begin your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
        {INITIAL_COURSE_DATA.map((course) => {
          const isEnrolled = enrolledList[course.id];
          return (
            <div key={course.id} className="group relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 sm:translate-x-3 translate-y-2 sm:translate-y-3"></div>
              <div className="bg-white border-[3px] sm:border-[4px] border-slate-900 rounded-3xl relative overflow-hidden h-full flex flex-col">
                <div className={`${course.theme} p-5 sm:p-8 border-b-[3px] sm:border-b-[4px] border-slate-900 text-white relative`}>
                   <div className="relative z-10 space-y-2">
                      <span className="bg-white/20 text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">ID: {course.id}</span>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-none uppercase tracking-tighter pt-2">{course.name}</h3>
                   </div>
                </div>
                <div className="p-5 sm:p-8 flex-1 flex flex-col justify-between space-y-6 sm:space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 rounded-full flex items-center justify-center font-black">KA</div>
                      <p className="font-bold text-slate-700">{course.instructor}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCourseClick(course)}
                    className={`cursor-pointer w-full py-4 sm:py-5 rounded-2xl border-[3px] sm:border-[4px] border-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all flex items-center justify-center gap-2
                      ${isEnrolled ? 'bg-[#4ade80] text-slate-900' : 'bg-[#FF9900] text-[#000066]'}`}
                  >
                    {isEnrolled ? '✓ ENTER COURSE' : 'ENROLL NOW'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 sm:translate-x-3 translate-y-2 sm:translate-y-3"></div>
            <div className="bg-white border-[3px] sm:border-[4px] border-slate-900 rounded-3xl p-6 sm:p-10 relative">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="cursor-pointer absolute -top-3 sm:-top-4 -right-3 sm:-right-4 bg-white border-[3px] border-slate-900 w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-black text-lg sm:text-xl hover:bg-red-500 hover:text-white shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000]"
              >✕</button>

              <div className="text-center space-y-5 sm:space-y-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FF9900] border-[3px] sm:border-[4px] border-slate-900 rounded-3xl mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-[4px_4px_0px_0px_#000] sm:shadow-[5px_5px_0px_0px_#000]">🔑</div>
                <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Enter Course Code</h3>
                
                <form onSubmit={handleEnrollSubmit} className="space-y-5">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Enter Code (e.g. DB101)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-[3px] sm:border-[4px] border-slate-900 p-3 sm:p-4 rounded-xl font-black text-center text-base sm:text-xl placeholder:text-slate-200 focus:outline-none focus:border-[#FF9900]"
                  />
                  {error && <p className="text-red-500 text-xs font-black uppercase">{error}</p>}
                  
                  <button type="submit" disabled={isEnrolling} className={`w-full bg-slate-900 text-white py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#FF9900] hover:-translate-y-1 active:translate-y-1 transition-all ${isEnrolling ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}>
                    {isEnrolling ? 'Verifying...' : 'Unlock Course'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}