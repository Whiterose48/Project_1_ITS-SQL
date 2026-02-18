import React, { useState, useEffect } from 'react';

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

  const handleEnrollSubmit = (e) => {
    e.preventDefault();
    if (!user?.id) return; 

    if (accessCode === selectedCourse.code) {
      const newList = { ...enrolledList, [selectedCourse.id]: true };
      localStorage.setItem(`user_enrolled_${user.id}`, JSON.stringify(newList));
      setEnrolledList(newList);
      setSelectedCourse(null); 
      onNavigate('coursetext');
    } else {
      setError('Invalid Access Code. Please try again.');
    }
  };

  return (
    <div className="max-w-[1450px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-10 px-4 sm:px-6 text-left relative">
      <div className="space-y-2">
        <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase">Overview Courses</h1>
        <p className="text-xl font-bold text-slate-400 uppercase tracking-[0.3em]">Select a module to begin your journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        {INITIAL_COURSE_DATA.map((course) => {
          const isEnrolled = enrolledList[course.id];
          return (
            <div key={course.id} className="group relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl relative overflow-hidden h-full flex flex-col">
                <div className={`${course.theme} p-8 border-b-[4px] border-slate-900 text-white relative`}>
                   <div className="relative z-10 space-y-2">
                      <span className="bg-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/30">ID: {course.id}</span>
                      <h3 className="text-3xl font-black leading-none uppercase tracking-tighter pt-2">{course.name}</h3>
                   </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between space-y-8">
                  <div className="space-y-4">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 border-2 border-slate-900 rounded-full flex items-center justify-center font-black">KA</div>
                      <p className="font-bold text-slate-700">{course.instructor}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleCourseClick(course)}
                    className={`w-full py-5 rounded-2xl border-[4px] border-slate-900 font-black text-xs uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_#000] hover:-translate-y-1 transition-all flex items-center justify-center gap-2
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
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl p-10 relative">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="absolute -top-4 -right-4 bg-white border-[3px] border-slate-900 w-10 h-10 rounded-xl font-black text-xl hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_0px_#000]"
              >✕</button>

              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-[#FF9900] border-[4px] border-slate-900 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-[5px_5px_0px_0px_#000]">🔑</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Enter Course Code</h3>
                
                <form onSubmit={handleEnrollSubmit} className="space-y-5">
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Enter Code (e.g. DB101)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-50 border-[4px] border-slate-900 p-4 rounded-xl font-black text-center text-xl placeholder:text-slate-200 focus:outline-none focus:border-[#FF9900]"
                  />
                  {error && <p className="text-red-500 text-xs font-black uppercase">{error}</p>}
                  
                  <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-xl font-black uppercase text-xs tracking-widest shadow-[6px_6px_0px_0px_#FF9900] hover:-translate-y-1 active:translate-y-1 transition-all">
                    Unlock Course
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