import React, { useState, useEffect } from 'react';

export default function LeftPanel({ problemData, currentStep }) {
  const [timeLeft, setTimeLeft] = useState('');

  // ✨ อัปเดต Timer ให้อิงจากเวลาเริ่มสอบจริง (1 ชั่วโมง)
  useEffect(() => {
    let timer;
    const EXAM_DURATION = 60 * 60 * 1000; // 1 ชั่วโมง

    const calculateTimeLeft = () => {
      const mode = localStorage.getItem('workspaceMode');
      const modId = localStorage.getItem('workspaceModule');
      const userData = sessionStorage.getItem('userData');
      const userId = userData ? JSON.parse(userData).id : 'guest';

      let targetTime;
      
      if (mode === 'EXAM') {
         // ดึงเวลาเริ่มสอบ ถ้ามีให้นับ 1 ชม. ถ้าไม่มีก็ให้เริ่มใหม่
         const startTime = localStorage.getItem(`exam_start_${userId}_${modId}`);
         if (startTime) {
             targetTime = parseInt(startTime) + EXAM_DURATION;
         } else {
             targetTime = Date.now() + EXAM_DURATION;
         }
      } else {
         // ถ้าโหมดอื่น โชว์เวลา Mock ไว้เท่ๆ
         targetTime = new Date('2026-03-13T10:00:00+07:00').getTime();
      }

      const currentNow = Date.now();
      const difference = targetTime - currentNow;

      if (difference <= 0) {
        setTimeLeft('00h 00m 00s'); // เวลาหมด!
        return;
      }

      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      // เติม 0 ด้านหน้าให้เลขสวยงาม
      const format = (val) => val.toString().padStart(2, '0');
      
      // ถ้าน้อยกว่า 1 วัน ไม่ต้องโชว์ Day
      setTimeLeft(`${format(h)}h ${format(m)}m ${format(s)}s`);
    };

    calculateTimeLeft();
    timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!problemData) return null;

  return (
    <div className="bg-white rounded-[32px] border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#000] flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-500">
      
      <div className="bg-gradient-to-r from-[#DBDCFF] to-[#FFE5C4] p-6 text-center border-b-[4px] border-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:10px_10px]"></div>
        <p className="relative z-10 text-slate-900 text-[15px] uppercase tracking-[0.3em] font-black mb-1">
          Time Remaining
        </p>
        <div className="relative z-10 flex justify-center items-center">
          {/* ✨ ทำให้เวลาที่ใกล้หมด กระพริบเป็นสีแดงได้ถ้าต้องการ */}
          <p className={`text-4xl font-black tabular-nums tracking-tighter font-mono drop-shadow-[2px_2px_0px_rgba(255,255,255,0.5)] ${timeLeft === '00h 00m 00s' ? 'text-red-600 animate-pulse' : 'text-slate-900'}`}>
            {timeLeft || '00:00:00'}
          </p>
        </div>
      </div>

      <div className="p-8 overflow-y-auto custom-scrollbar flex-1 pb-10 bg-white relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="mb-10 relative">
          <div className="inline-block relative">
             <div className="absolute inset-0 bg-slate-900 rounded-lg translate-x-1.5 translate-y-1.5"></div>
             <span className="relative z-10 text-white font-black text-xs uppercase tracking-[0.2em] bg-blue-600 px-4 py-2 rounded-lg border-[3px] border-slate-900 block">
               PROBLEM : {currentStep}
             </span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 mt-8 leading-[0.9] tracking-tighter uppercase">
            {problemData.title}
          </h2>
        </div>

        <div className="mb-12 relative group">
          <div className="absolute inset-0 bg-blue-500/10 rounded-2xl -rotate-1 group-hover:rotate-0 transition-transform duration-300"></div>
          <p className="relative z-10 text-slate-800 text-[18px] font-bold leading-relaxed border-l-[8px] border-blue-600 pl-6 py-4">
            {problemData.description}
          </p>
        </div>

        <div className="mb-12">
          <div className="bg-slate-900 border-[4px] border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#FF9900] overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b-[4px] border-slate-900">
              <h3 className="font-black text-white flex items-center text-sm tracking-widest uppercase">
                <span className="mr-3 text-xl">🎯</span> Mission Objectives
              </h3>
              <div className="bg-[#FF4500] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-2 border-slate-900 shadow-[2px_2px_0px_0px_#000]">
                Rules
              </div>
            </div>

            <div className="p-6 space-y-4 bg-white">
              {problemData.requirements?.map((req, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-xl border-[3px] border-slate-100 hover:border-slate-900 hover:bg-slate-50 transition-all cursor-default group">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg border-[3px] border-slate-900 bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_#000] group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <span className="font-black font-mono text-sm">{i + 1}</span>
                  </div>
                  <p className="text-slate-700 font-bold text-[15px] leading-tight pt-1.5">{req}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6"> 
          <div className="flex items-center justify-between px-1">
            <h3 className="font-black text-slate-900 flex items-center text-sm tracking-widest uppercase">
              <span className="mr-3 text-xl">📊</span> Database Schema
            </h3>
            <span className="text-white font-mono text-[10px] font-black bg-blue-600 px-3 py-1.5 rounded-lg border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_#000] uppercase">
              {problemData.allTables && problemData.allTables.length > 1
                ? `${problemData.allTables.length} Tables`
                : `Table: ${problemData.table}`}
            </span>
          </div>
          
          {(problemData.allTables && problemData.allTables.length > 1
            ? problemData.allTables
            : [{ name: problemData.table, columns: problemData.columns }]
          ).map((tbl, tblIdx) => (
            <div key={tblIdx} className="border-[4px] border-slate-900 rounded-2xl overflow-hidden shadow-[8px_8px_0px_0px_#000] bg-white">
              <div className="bg-blue-600 px-6 py-3 flex items-center justify-between border-b-[3px] border-slate-900">
                <span className="text-white font-black text-xs uppercase tracking-widest font-mono">{tbl.name}</span>
                <span className="text-blue-200 font-mono text-[10px] font-bold">{tbl.columns?.length || 0} cols</span>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900">
                    <th className="px-6 py-4 font-black text-white uppercase text-[11px] tracking-widest border-r-2 border-slate-700">Column</th>
                    <th className="px-6 py-4 font-black text-white uppercase text-[11px] tracking-widest">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100">
                  {tbl.columns?.map((col, idx) => (
                    <tr key={idx} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 border-r-2 border-slate-100">
                        <code className="text-blue-700 font-black font-mono text-sm bg-blue-50 px-2 py-1 rounded-md">
                          {col.name}
                        </code>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-bold font-mono text-xs uppercase">
                        {col.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}