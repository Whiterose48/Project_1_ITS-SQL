import React, { useState, useEffect } from 'react';

// ✨ นำ property 'type' ออกเพื่อให้หน้าจอดูสะอาดขึ้นตามต้องการ
const INITIAL_LESSONS = [
  { id: '01', title: 'DATABASE FUNDAMENTALS', status: 'PENDING', desc: 'พื้นฐานระบบฐานข้อมูลและความสัมพันธ์ของข้อมูล' },
  { id: '02', title: 'SELECT STATEMENT', status: 'PENDING', desc: 'การดึงข้อมูลพื้นฐานด้วยคำสั่ง SELECT และ DISTINCT' },
  { id: '03', title: 'WHERE CLAUSE & OPERATORS', status: 'PENDING', desc: 'การกรองข้อมูลอย่างละเอียดด้วยเงื่อนไขต่างๆ' },
  { id: '04', title: 'ORDER BY & LIMIT', status: 'PENDING', desc: 'การจัดเรียงลำดับผลลัพธ์และการจำกัดจำนวนข้อมูล' },
  { id: '05', title: 'JOINS & RELATIONSHIPS', status: 'PENDING', desc: 'การรวมตารางหลายใบเข้าด้วยกันเพื่อดึงข้อมูลที่ซับซ้อน' },
];

export default function CourseText({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('COURSE');
  const [expandedId, setExpandedId] = useState(null); 
  
  const [lessons, setLessons] = useState(() => {
    const saved = localStorage.getItem('course_06070999_lessons');
    return saved ? JSON.parse(saved) : INITIAL_LESSONS;
  });

  useEffect(() => {
    localStorage.setItem('course_06070999_lessons', JSON.stringify(lessons));
  }, [lessons]);

  const handleMarkComplete = (id) => {
    setLessons(prevLessons => 
      prevLessons.map(lesson => 
        lesson.id === id ? { ...lesson, status: 'COMPLETED' } : lesson
      )
    );
  };

  return (
    <div className="max-w-[1450px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left">
      
      {/* 1. Header - ปรับชื่อเป็น DATABASE CONCEPT SYSTEM และขยายขนาดตัวอักษร */}
      <div className="relative group">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
        <div className="bg-[#000066] border-[4px] border-slate-900 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <button 
              onClick={() => onNavigate('courses')}
              className="bg-white text-[#000066] font-black text-xs uppercase tracking-widest px-6 py-3 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl"
            >
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

      {/* 2. Navigation Tabs */}
      <div className="flex bg-white border-[4px] border-slate-900 rounded-2xl shadow-[8px_8px_0px_0px_#000] overflow-hidden">
        {['COURSE', 'ASSIGNMENT', 'EXAM'].map((tab) => (
          <button
            key={tab}
            onClick={() => {
                setActiveTab(tab);
                setExpandedId(null); 
            }}
            className={`flex-1 py-5 font-black uppercase tracking-[0.2em] text-[15px] border-r-[4px] last:border-r-0 border-slate-900 transition-all ${
              activeTab === tab ? 'bg-[#FF9900] text-slate-900' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sidebar - ปรับสัดส่วนเป็น lg:col-span-4 เพื่อให้เห็นชื่อผู้สอนเต็มบรรทัด */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#000] rounded-2xl p-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b-2 border-slate-50 pb-2">Faculty Mentors</p>
            
            <div className="space-y-8">
              {/* กลุ่มอาจารย์ - ปรับขนาดชื่อให้ใหญ่ขึ้น */}
              <div className="space-y-4">
                <p className="text-xs font-black text-[#FF9900] uppercase tracking-widest">Course Instructor</p>
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-blue-600 border-[3px] border-slate-900 rounded-2xl flex items-center justify-center text-white font-black shadow-[3px_3px_0px_0px_#000] shrink-0 text-2xl">
                    KA
                  </div>
                  <div className="overflow-visible">
                    <p className="font-black text-slate-900 text-lg leading-tight">ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">PROFESSOR</p>
                  </div>
                </div>
              </div>

              <div className="border-t-[3px] border-slate-100"></div>

              {/* กลุ่ม TA - ปรับขนาดชื่อและแสดงผลชื่อเต็ม */}
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

        {/* Lesson List - แสดงหัวข้อบทเรียนและระบบ Lab/Exam */}
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
                // ✨ ระบบเปลี่ยนหัวข้อและคำอธิบายอัตโนมัติตาม Tab
                const isAssignment = activeTab === 'ASSIGNMENT';
                const isExam = activeTab === 'EXAM';
                
                const displayTitle = isAssignment 
                    ? `Lab - ${lesson.title}` 
                    : isExam 
                        ? `Exam - ${lesson.title}` 
                        : lesson.title;

                const displayDesc = isAssignment 
                  ? `โจทย์ฝึกปฏิบัติ: ${lesson.desc} ผ่านการเขียนคำสั่ง SQL จริงใน Terminal` 
                  : isExam 
                    ? `แบบทดสอบประเมินผล: ${lesson.desc} (จำกัดเวลาและการส่งคำตอบ)` 
                    : lesson.desc;

                return (
                  <div key={lesson.id} className="relative group">
                    <div 
                      onClick={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                      className={`flex items-center justify-between p-8 cursor-pointer transition-all ${
                        expandedId === lesson.id ? 'bg-slate-50' : 'hover:bg-blue-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        <div className={`w-14 h-14 border-[3px] border-slate-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-[4px_4px_0px_0px_#000] ${
                          lesson.status === 'COMPLETED' ? 'bg-emerald-400 text-slate-900' : 'bg-white text-slate-900'
                        }`}>
                          {lesson.id}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black uppercase tracking-tight text-2xl text-slate-900 group-hover:text-[#000066] transition-colors leading-none">
                            {displayTitle}
                          </h4>
                          <div className="flex items-center gap-3">
                             <p className="text-sm font-bold text-slate-500 line-clamp-1 max-w-xl">
                                {displayDesc}
                             </p>
                          </div>
                        </div>
                      </div>
                      <button className={`w-10 h-10 border-[3px] border-slate-900 rounded-full flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_#000] ${
                        expandedId === lesson.id ? 'bg-slate-900 text-white rotate-180 shadow-none' : 'bg-white text-slate-900'
                      }`}>
                        ▼
                      </button>
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
                              "{displayDesc}. {isExam ? 'กรุณาตรวจสอบความถูกต้องก่อนส่ง' : 'ฝึกฝนทักษะการใช้งานจริงเพื่อให้เกิดความเชี่ยวชาญ'}"
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-5">
                            <button 
                              onClick={() => {
                                localStorage.setItem('workspaceMode', activeTab);
                                localStorage.setItem('workspaceModule', lesson.id);
                                onNavigate('workspace');
                              }} 
                              className="bg-[#FF9900] text-[#000066] px-8 py-4 border-[4px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl flex items-center gap-3 group"
                            >
                              <span className="text-lg">⚡</span> 
                              {isAssignment ? 'START LAB ASSIGNMENT' : isExam ? 'START EXAMINATION' : 'OPEN SQL TERMINAL'} 
                              <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                            
                            <button 
                              onClick={() => handleMarkComplete(lesson.id)}
                              disabled={lesson.status === 'COMPLETED'}
                              className={`px-8 py-4 border-[4px] font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 active:translate-y-1 transition-all rounded-xl ${
                                lesson.status === 'COMPLETED' 
                                ? 'bg-slate-100 text-slate-400 border-slate-300 shadow-none cursor-not-allowed translate-y-1' 
                                : 'bg-white text-emerald-600 border-emerald-500 shadow-emerald-200'
                              }`}
                            >
                              {lesson.status === 'COMPLETED' ? '✓ DONE' : 'MARK COMPLETED'}
                            </button>
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
    </div>
  );
}