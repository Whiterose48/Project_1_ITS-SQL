import React from 'react';
// นำเข้ารูปภาพโลโก้จาก assets
import kmitlLogo from '../assets/it.png'; 

// ลบ props isLoggedIn และ onShowLogin ออก เพราะไม่ได้ใช้ในหน้านี้แล้ว
export default function Home({ onNavigate }) {
  
  return (
    /* ✨ ขยายออกด้านข้างโดยปรับ max-w เป็น 1450px และเพิ่ม px-6 เพื่อไม่ให้ชิดขอบจอเกินไป */
    <div className="max-w-[1450px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 md:px-6">
      
      {/* 1. Hero Section (Split Layout) */}
      {/* ✨ เพิ่ม gap-16 (จากเดิม gap-10) เพื่อให้ฝั่งซ้ายและขวาห่างกันมากขึ้นเมื่อจอกว้าง */}
      <div className="bg-[#000066] border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] rounded-2xl p-8 md:p-14 relative overflow-hidden mt-6 flex flex-col md:flex-row items-center gap-10 lg:gap-16">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        
        <div className="relative z-10 flex-1 text-left">
          <div className="inline-block bg-[#FF9900] text-slate-900 font-black px-4 py-1.5 border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_#0f172a] -rotate-2 mb-6 uppercase tracking-widest text-sm">
            Welcome to DBLearn
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-[1.1] drop-shadow-[4px_4px_0px_#000000]">
            Master SQL & <br/>
            <span className="text-[#00E5FF]">Database Management</span>
          </h1>
          <p className="text-lg font-bold text-slate-300 max-w-xl leading-relaxed mb-10">
            Learn structured query language and database systems from fundamentals to advanced concepts. Build real-world solutions and master data manipulation.
          </p>
          
          <button 
            onClick={() => onNavigate('courses')}
            className="inline-flex items-center justify-center gap-4 bg-[#FF9900] text-[#000066] font-black text-2xl uppercase tracking-[0.15em] px-12 py-5 border-[4px] border-slate-900 rounded-xl shadow-[8px_8px_0px_0px_#000000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_#000000] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all"
          >
            <span>GO TO COURSES</span>
            <span className="text-3xl leading-none">🚀</span>
          </button>
        </div>

        {/* ✨ ขยายพื้นที่ฝั่ง Code Block ให้กว้างขึ้นเล็กน้อยเพื่อบาลานซ์กับหน้าจอ */}
        <div className="relative z-10 w-full md:w-5/12 lg:w-1/2 hidden md:block">
          <div className="bg-slate-900 border-[4px] border-slate-900 rounded-xl shadow-[8px_8px_0px_0px_#0f172a] overflow-hidden rotate-2 hover:rotate-0 transition-transform duration-300">
            <div className="bg-slate-200 border-b-[4px] border-slate-900 px-4 py-3 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-slate-900"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-yellow-400 border-2 border-slate-900"></div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
              <span className="ml-2 text-xs font-black uppercase text-slate-800 tracking-widest">query.sql</span>
            </div>
            <div className="p-6 font-mono text-sm leading-relaxed text-emerald-400">
              <p><span className="text-pink-500">SELECT</span> *</p>
              <p><span className="text-pink-500">FROM</span> students</p>
              <p><span className="text-pink-500">WHERE</span> skills <span className="text-blue-400">LIKE</span> <span className="text-yellow-300">'%SQL%'</span></p>
              <p><span className="text-pink-500">ORDER BY</span> awesomeness <span className="text-pink-500">DESC</span>;</p>
              <br/>
              <p className="text-slate-500">-- Result: 100% Success!</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What You'll Learn Section */}
      <div className="bg-white border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] rounded-2xl p-10 relative">
        <div className="absolute -top-6 left-8 bg-[#FF9900] border-[4px] border-slate-900 px-8 py-2 rounded-lg shadow-[4px_4px_0px_0px_#0f172a]">
          <h2 className="text-2xl font-black uppercase text-slate-900 tracking-widest">What You'll Learn</h2>
        </div>

        {/* ✨ เพิ่ม gap-x-20 (แนวนอน) เพื่อให้เนื้อหาสองฝั่งมีพื้นที่หายใจเมื่อหน้าจอกว้างขึ้น */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 lg:gap-x-20 gap-y-8 mt-8">
          {[
            "Database design and normalization principles",
            "Writing efficient SELECT, INSERT, UPDATE, DELETE queries",
            "Complex JOINs and subqueries",
            "Aggregate functions and data analysis",
            "Database optimization and indexing",
            "Transaction management and ACID properties"
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-8 h-8 flex-shrink-0 bg-slate-900 text-white font-mono font-black rounded-sm flex items-center justify-center border-2 border-slate-900 shadow-[3px_3px_0px_0px_#FF9900] group-hover:bg-[#FF9900] group-hover:text-slate-900 transition-all duration-200">
                {idx + 1}
              </div>
              <p className="text-slate-800 font-bold text-lg tracking-tight border-b-2 border-transparent group-hover:border-slate-900 transition-all pb-1 text-left">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. School Info Section */}
      <div className="bg-[#f8fafc] border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#0f172a] rounded-xl relative mt-20">
        <div className="p-10 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          <div className="space-y-4 flex-1 text-left">
            <div className="bg-white border-[3px] border-slate-900 p-2 rounded-xl shadow-[6px_6px_0px_0px_#000000] inline-block mb-2">
              <img 
                src={kmitlLogo} 
                alt="KMITL Logo" 
                className="w-24 h-24 object-contain" 
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/100?text=IT";
                }}
              />
            </div>
            
            <h3 className="text-3xl font-black text-[#000066] uppercase tracking-tight">
              School of Information Technology
            </h3>
            <div className="space-y-1 border-l-[4px] border-[#FF9900] pl-5">
              <p className="text-slate-700 font-black text-xl leading-tight">
                King Mongkut's Institute of Technology Ladkrabang (KMITL)
              </p>
              <p className="text-slate-500 font-bold text-base uppercase tracking-wider">
                1 Chalongkrung Road, Lat Krabang, Bangkok 10520
              </p>
            </div>
          </div>

          <div className="bg-white border-[3px] border-slate-300 p-8 rounded-xl max-w-sm lg:max-w-md shrink-0 shadow-[8px_8px_0px_0px_#cbd5e1] -rotate-1 text-left relative overflow-hidden">
            <div className="absolute top-2 right-4 text-slate-100 text-6xl font-serif">"</div>
            <p className="text-slate-500 font-bold italic text-[16px] leading-relaxed relative z-10">
              "Developed as part of our commitment to enhancing programming education and providing students with practical tools."
            </p>
          </div>
        </div>
      </div>

      {/* 4. Footer */}
      <div className="text-center py-8 border-[4px] border-slate-900 bg-slate-900 text-white rounded-xl shadow-[6px_6px_0px_0px_#0f172a] mt-12">
          <p className="font-black uppercase tracking-[0.15em] text-lg mb-2 text-emerald-400">
              © 2026 School of IT, KMITL (Prototype)
          </p>
          
          <p className="font-black text-slate-300 text-xl tracking-widest uppercase flex items-center justify-center gap-3">
              Made by 
              <a 
              href="https://github.com/Whiterose48" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:text-[#FF9900] hover:underline transition-all duration-200 decoration-[3px] underline-offset-4"
              >
              @Phruk
              </a> 
              <span className="text-slate-500">&</span> 
              <a 
              href="https://github.com/Parallaxxx25" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white hover:text-[#FF9900] hover:underline transition-all duration-200 decoration-[3px] underline-offset-4"
              >
              @Khet
              </a>
          </p>
      </div>
    </div>
  );
}