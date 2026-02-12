import React from 'react';

export default function ResultTable({ data }) {
  if (!data || data.length === 0) return null;
  const columns = Object.keys(data[0]);

  return (
    <div className="mt-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col max-h-[400px]">
      <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-700 text-sm">📊 Query Result ({data.length} rows)</h3>
      </div>
      <div className="overflow-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50/50 transition-colors">
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-sm text-gray-600 tabular-nums">
                    {row[col]?.toString() || 'NULL'}
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