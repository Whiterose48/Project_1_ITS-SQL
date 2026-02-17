import React from 'react';
import ResultTable from './ResultTable';

export default function MySubmissions({ submissions, problemData }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-white rounded-xl border-[3px] border-slate-800 shadow-[8px_8px_0px_0px_#1e293b] p-10 flex flex-col items-center justify-center min-h-[300px]">
        <div className="text-6xl mb-4 drop-shadow-md">👾</div>
        <p className="text-slate-500 text-center text-xl font-black uppercase tracking-widest">
          No submissions yet.
        </p>
        <p className="text-slate-400 font-bold mt-2">
          Submit your first solution to see the results!
        </p>
      </div>
    );
  }

  const latestSubmission = submissions[0];

  // ✨ ตรวจสอบ Semicolon (;) จากโค้ดที่ส่งมา
  const hasSemicolon = latestSubmission.code.trim().endsWith(';');
  
  // ✨ Override สถานะ: จะผ่านได้ก็ต่อเมื่อระบบตรวจว่าผ่าน (passed) "และ" ต้องมี Semicolon ปิดท้าย
  const isPassed = latestSubmission.passed && hasSemicolon;

  // ✨ จัดการคำใบ้: ถ้าโค้ดทำงานถูกแต่ลืมใส่ ; ให้แสดงคำใบ้แจ้งเตือนเฉพาะเจาะจง
  const displayHint = (!hasSemicolon && latestSubmission.passed) 
    ? "Syntax Error: SQL queries must end with a semicolon (;). Please check your code and try again." 
    : latestSubmission.hint;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- Test Status Header --- */}
      <div className={`rounded-xl p-8 border-[3px] border-slate-900 shadow-[8px_8px_0px_0px_#0f172a] relative overflow-hidden ${
        isPassed 
          ? 'bg-[#10B981]' 
          : 'bg-[#EF4444]'
      }`}>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,1)_75%,rgba(255,255,255,1)_100%)] bg-[length:20px_20px]"></div>
        
        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center">
            {/* ✨ ใช้ค่า isPassed แทน latestSubmission.passed */}
            <div className="bg-white border-[3px] border-slate-900 w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-[4px_4px_0px_0px_#0f172a] mr-8 rotate-[-3deg]">
              {isPassed ? '🏆' : '💥'}
            </div>
            <div>
              <h3 className="text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[3px_3px_0px_#000]">
                {isPassed ? 'QUERY PASSED!' : 'QUERY FAILED'}
              </h3>
            </div>
          </div>
          
          <div className={`hidden lg:flex px-6 py-3 font-black text-2xl uppercase tracking-widest border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] rotate-[3deg] ${
             isPassed ? 'bg-yellow-400 text-slate-900' : 'bg-slate-900 text-red-500'
          }`}>
            {isPassed ? 'SUCCESS' : 'ERROR'}
          </div>
        </div>
      </div>

      {/* Your Code Section */}
      <div>
        <div className="inline-flex items-center gap-3 bg-blue-600 text-white px-5 py-2.5 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] mb-6 rounded-lg">
          <span className="text-xl">📝</span>
          <h3 className="text-lg font-black uppercase tracking-widest">Your Code</h3>
        </div>
        
        <div className="bg-[#0f172a] p-6 rounded-xl border-[3px] border-slate-800 shadow-[6px_6px_0px_0px_#1e293b] relative">
          <div className="absolute top-4 right-4 flex gap-2">
             <div className="w-3 h-3 bg-red-500 border-2 border-slate-900 rounded-sm"></div>
             <div className="w-3 h-3 bg-yellow-400 border-2 border-slate-900 rounded-sm"></div>
             <div className="w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-sm"></div>
          </div>
          <pre className="font-mono text-emerald-400 text-[17px] leading-relaxed whitespace-pre-wrap mt-2">{latestSubmission.code}</pre>
        </div>
      </div>

      {/* Query Result Table */}
      {latestSubmission.queryResult && latestSubmission.queryResult.rows && (
        <div>
          <div className="inline-flex items-center gap-3 bg-purple-600 text-white px-5 py-2.5 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#0f172a] mb-6 rounded-lg">
            <span className="text-xl">📊</span>
            <h3 className="text-lg font-black uppercase tracking-widest">Query Result</h3>
          </div>
          <div className="border-[3px] border-slate-800 rounded-xl shadow-[6px_6px_0px_0px_#1e293b] overflow-hidden bg-white">
            <ResultTable data={latestSubmission.queryResult.rows} />
          </div>
        </div>
      )}

      {/* Hint if Failed (Dialog Style) */}
      {/* ✨ แสดงคำใบ้โดยอิงจากค่า isPassed ที่ผ่านการเช็ค Semicolon แล้ว */}
      {!isPassed && displayHint && (
        <div className="bg-[#FFD700] border-[3px] border-slate-900 p-8 rounded-2xl shadow-[8px_8px_0px_0px_#0f172a] relative mt-10">
          <div className="absolute -top-6 -left-6 w-14 h-14 bg-white border-[3px] border-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_#000] animate-bounce">
            💡
          </div>
          <h4 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-widest ml-6">
            Bot_Suggestion
          </h4>
          <p className="text-slate-900 text-xl font-bold leading-relaxed ml-6 border-l-[6px] border-slate-900 pl-6 bg-white/40 py-4 rounded-r-xl">
            {displayHint}
          </p>
        </div>
      )}
    </div>
  );
}