import React from 'react';

export default function ResultTable({ data }) {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden flex flex-col max-h-[550px]">
      <div className="overflow-auto custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="border-b-2 border-slate-300">
              {columns.map((col, idx) => (
                <th 
                  key={col} 
                  className="px-6 py-4 text-[13px] font-black text-slate-900 uppercase tracking-widest border-r border-slate-300"
                  style={{
                    background: `linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 100%)`
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr 
                key={i} 
                className="border-b border-slate-200 hover:bg-slate-50"
              >
                {columns.map((col, idx) => (
                  <td 
                    key={col} 
                    className={`px-6 py-4 text-sm font-semibold tabular-nums border-r border-slate-200 ${
                      row[col] === null || row[col] === undefined
                        ? 'text-slate-400 italic'
                        : 'text-slate-800'
                    }`}
                  >
                    {row[col] === null || row[col] === undefined ? (
                      <span className="text-slate-400">NULL</span>
                    ) : (
                      row[col]?.toString()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}