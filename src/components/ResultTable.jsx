import React from 'react';

export default function ResultTable({ data }) {
  // Empty State - ปรับให้เป็นกล่อง 2D ที่ดูเป็นกราฟิกมากขึ้น
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-slate-50 border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#000] p-12 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5 text-8xl font-black rotate-12 select-none">EMPTY</div>
        <div className="text-6xl mb-6 filter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)]">📂</div>
        <p className="text-slate-900 text-2xl font-black uppercase tracking-tighter mb-2">No Data Found</p>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Execute a valid query to see results here</p>
      </div>
    );
  }
  
  const columns = Object.keys(data[0]);

  return (
    // Container: ขอบหนาพิเศษและเงาสีดำทึบ
    <div className="bg-white border-[4px] border-slate-900 shadow-[10px_10px_0px_0px_#000] overflow-hidden flex flex-col max-h-[600px] animate-in fade-in zoom-in-95 duration-300">
      
      {/* Table Title Bar - สไตล์ Window Header เหมือนใน RightPanel */}
      <div className="bg-[#a855f7] border-b-[4px] border-slate-900 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white border-[2px] border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
            <span className="text-slate-900 font-black text-sm">#</span>
          </div>
          <h3 className="text-white font-black uppercase tracking-widest text-sm drop-shadow-[2px_2px_0px_#000]">
            Query Output
          </h3>
        </div>
        {/* Badge แสดงจำนวนแถว */}
        <span className="bg-white text-[#a855f7] px-3 py-1 border-[2px] border-slate-900 font-black text-[10px] uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
          {data.length} Rows Returned
        </span>
      </div>

      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-20">
            <tr className="bg-slate-50">
              {columns.map((col) => (
                <th 
                  key={col} 
                  className="px-6 py-5 text-[13px] font-black text-slate-900 uppercase tracking-widest border-b-[4px] border-slate-900 border-r-[3px] last:border-r-0 bg-slate-50 relative"
                >
                  <span className="relative z-10">{col}</span>
                  {/* เส้นเน้นด้านล่างของหัวตาราง */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-slate-900 bg-white">
            {data.map((row, i) => (
              <tr 
                key={i} 
                className="hover:bg-purple-50 group transition-colors"
              >
                {columns.map((col) => (
                  <td 
                    key={col} 
                    className={`px-6 py-4 text-[16px] font-bold font-mono tabular-nums border-r-[3px] border-slate-900 last:border-r-0 transition-all ${
                      row[col] === null || row[col] === undefined
                        ? 'bg-slate-50/50'
                        : 'text-slate-800'
                    }`}
                  >
                    {/* จัดการค่า NULL ให้เป็น Badge 2D สีเทาตามสไตล์เดิม */}
                    {row[col] === null || row[col] === undefined ? (
                      <div className="flex items-center gap-2 opacity-50">
                        <span className="w-2 h-2 bg-slate-400 rounded-sm"></span>
                        <span className="text-[11px] font-black uppercase tracking-tighter">NULL</span>
                      </div>
                    ) : (
                      <span className="group-hover:text-purple-700">{row[col]?.toString()}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer ตารางจางๆ เพื่อความสมดุล */}
      <div className="bg-slate-900 h-2"></div>
    </div>
  );
}