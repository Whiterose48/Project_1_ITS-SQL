import React, { useState, useEffect } from 'react';

export default function Dashboard({ onNavigate }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    // ✨ ดึงข้อมูลจริงจาก localStorage
    const coursesData = [];
    // ปรับให้ตรงกับ INITIAL_COURSE_DATA ในหน้า Courses.jsx
    const allCourses = [
      { id: '06070999', name: 'DATABASE CONCEPT SYSTEM', theme: 'bg-[#000066]' },
    ];

    allCourses.forEach(course => {
      const savedData = localStorage.getItem(`course_${course.id}_lessons`);
      if (savedData) {
        const lessons = JSON.parse(savedData);
        // คำนวณความคืบหน้า
        const completedCount = lessons.filter(l => l.status === 'COMPLETED').length;
        const total = lessons.length;
        const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        coursesData.push({
          ...course,
          progress: percent,
          completedCount: completedCount,
          totalCount: total,
          status: percent === 100 ? 'COMPLETE' : 'IN PROGRESS'
        });
      }
    });
    setEnrolledCourses(coursesData);
  }, []);

  // ✨ ปรับ Deadlines ให้ตรงกับวิชา Database Concept System
  const deadlines = [
    { title: 'SQL Fundamentals Quiz', course: 'Database Concept System', date: 'Feb 20', tag: 'Urgent', tagCol: 'bg-[#fee2e2] text-[#ef4444]' },
    { title: 'Relational Model Lab', course: 'Database Concept System', date: 'Feb 25', tag: 'In Coming', tagCol: 'bg-[#fce7f3] text-[#db2777]' },
    { title: 'Schema Design Project', course: 'Database Concept System', date: 'Mar 05', tag: 'Upcoming', tagCol: 'bg-[#dbeafe] text-[#2563eb]' },
  ];

  return (
    <div className="max-w-[1450px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-10 px-4 sm:px-6 text-left">
      
      {/* 1. Dashboard Header */}
      <div className="relative group px-2">
        <h1 className="text-7xl font-black text-[#1e293b] tracking-tighter uppercase ">
          IT66070126 DASHBOARD
        </h1>
        <p className="text-xl font-bold text-slate-400 mt-2 uppercase tracking-[0.3em]">
          Enrolled Courses & Active Modules
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 2. Left Column: Enrolled Courses */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white border-[4px] border-slate-900 shadow-[12px_12px_0px_0px_#000] rounded-3xl overflow-hidden">
            <div className="bg-[#000066] p-6 border-b-[4px] border-slate-900 flex items-center gap-4 text-white">
              <span className="text-3xl">📖</span>
              <h2 className="text-2xl font-black uppercase tracking-widest">Enrolled Courses</h2>
            </div>

            <div className="divide-y-[4px] divide-slate-900 bg-white">
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <div key={course.id} className="p-10 hover:bg-slate-50 transition-all group">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                      
                      <div className="flex items-center gap-8 flex-1">
                        {/* ✨ นำ Icon Container ออกเรียบร้อยแล้วเพื่อให้ชื่อวิชาแสดงผลได้กว้างขึ้น */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <span className="bg-slate-100 text-slate-500 font-mono font-black text-[10px] px-3 py-1 border-2 border-slate-900 rounded uppercase">CODE: {course.id}</span>
                            <span className={`px-4 py-1 font-black text-[10px] uppercase border-2 border-slate-900 rounded shadow-[2px_2px_0px_0px_#000] ${course.status === 'COMPLETE' ? 'bg-[#FF9900] text-[#000066]' : 'bg-[#4ade80] text-slate-900'}`}>
                              {course.status}
                            </span>
                          </div>
                          <h3 className="text-3xl font-black text-slate-800 leading-none uppercase tracking-tight max-w-2xl">{course.name}</h3>
                        </div>
                      </div>

                      {/* ฝั่งขวา: Progress Bar & Action Button */}
                      <div className="flex flex-col items-end gap-5 shrink-0 w-full md:w-64">
                        
                        <div className="w-full space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                              Progress
                            </span>
                            <span className="text-2xl font-black text-slate-900 leading-none italic">
                              {course.progress}%
                            </span>
                          </div>
                          
                          <div className="w-full h-5 bg-slate-200 border-[3px] border-slate-900 rounded-lg overflow-hidden relative shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
                            <div 
                              className={`h-full border-r-[3px] border-slate-900 transition-all duration-1000 ease-out relative
                                ${course.progress === 100 ? 'bg-[#FF9900]' : 'bg-[#4ade80]'}`
                              }
                              style={{ width: `${course.progress}%` }}
                            >
                                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#000_5px,#000_10px)]"></div>
                            </div>
                          </div>
                        </div>

                        <button 
                          onClick={() => onNavigate('coursetext')}
                          className={`w-full font-black text-xs uppercase tracking-widest px-8 py-4 border-[3px] border-slate-900 shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl flex items-center justify-center gap-2 group
                            ${course.progress === 100 
                              ? 'bg-slate-100 text-slate-800' 
                              : 'bg-[#FF9900] text-[#000066]'}`
                          }
                        >
                          {course.progress === 100 ? 'Review Course' : 'Continue Learning'} 
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))
              ) : (
                <div className="p-24 text-center">
                   <p className="text-slate-400 font-black uppercase tracking-[0.3em]">No courses enrolled yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Right Column: Deadlines & Quick Stats */}
        <div className="lg:col-span-4 space-y-10">
          <div className="bg-white border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#000] rounded-3xl overflow-hidden">
            <div className="bg-[#3b82f6] p-6 border-b-[4px] border-slate-900 flex items-center gap-4 text-white">
              <span className="text-2xl">📅</span>
              <h2 className="text-xl font-black uppercase tracking-widest">Upcoming Deadlines</h2>
            </div>
            <div className="divide-y-[3px] divide-slate-100">
              {deadlines.map((item, idx) => (
                <div key={idx} className="p-8 bg-white transition-colors hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-lg text-[#1e293b] uppercase tracking-tight">{item.title}</h4>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000] ${item.tagCol}`}>
                      {item.tag}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-4">{item.course}</p>
                  <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase">
                    <span>🗓️</span> {item.date}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}