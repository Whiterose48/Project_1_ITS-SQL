import React, { useState, useMemo } from 'react';

const MOCK_PROBLEMS = [
  { id: 1, title: 'Select All Products', module: '02', type: 'COURSE', difficulty: 'beginner', table: 'products', submissions: 245, passRate: 92.5 },
  { id: 7, title: 'Concat Staff Name', module: '02', type: 'COURSE', difficulty: 'intermediate', table: 'staffs', submissions: 198, passRate: 65.3 },
  { id: 13, title: 'Where State NY', module: '03', type: 'COURSE', difficulty: 'beginner', table: 'customers', submissions: 187, passRate: 78.2 },
  { id: 25, title: 'Equi-join Products Brands', module: '05', type: 'COURSE', difficulty: 'intermediate', table: 'products', submissions: 134, passRate: 45.8 },
  { id: 30, title: 'Multiple JOIN ON', module: '05', type: 'COURSE', difficulty: 'advanced', table: 'orders', submissions: 89, passRate: 32.1 },
  { id: 37, title: 'Select All Stores', module: '02', type: 'ASSIGNMENT', difficulty: 'beginner', table: 'stores', submissions: 210, passRate: 95.7 },
  { id: 66, title: 'Line Total Calculation', module: '05', type: 'ASSIGNMENT', difficulty: 'advanced', table: 'order_items', submissions: 56, passRate: 21.4 },
  { id: 100, title: 'EXAM: SELECT DATA', module: '02', type: 'EXAM', difficulty: 'beginner', table: 'staffs', submissions: 48, passRate: 85.4 },
  { id: 104, title: 'EXAM: INNER JOIN', module: '05', type: 'EXAM', difficulty: 'advanced', table: 'orders', submissions: 48, passRate: 37.5 },
  { id: 105, title: 'EXAM: MULTI JOIN', module: '05', type: 'EXAM', difficulty: 'advanced', table: 'orders', submissions: 48, passRate: 18.8 },
];

const MOCK_SUBMISSION_LOG = [
  { id: 1, student: 'นายวิชัย เก่งมาก', problem: 'Equi-join Products Brands', query: "SELECT p.product_id, p.product_name, b.brand_name FROM products p, brands b WHERE p.brand_id = b.brand_id;", status: 'passed', time: '2025-03-13 14:32', attempts: 1 },
  { id: 2, student: 'นายสมชาย ใจดี', problem: 'Equi-join Products Brands', query: "SELECT product_id, product_name, brand_name FROM products JOIN brands ON products.brand_id = brands.brand_id;", status: 'failed', time: '2025-03-13 14:28', attempts: 3 },
  { id: 3, student: 'นางสาวพิมพ์ใจ สวยงาม', problem: 'Multiple JOIN ON', query: "SELECT o.order_id, o.order_date FROM orders o;", status: 'failed', time: '2025-03-13 13:45', attempts: 5 },
];

export default function ProblemManagement({ onNavigate }) {
  const [activeView, setActiveView] = useState('problems');
  const [filterType, setFilterType] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const filteredProblems = useMemo(() => {
    return MOCK_PROBLEMS.filter(p => {
      const matchType = filterType === 'all' || p.type === filterType;
      const matchModule = filterModule === 'all' || p.module === filterModule;
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchType && matchModule && matchSearch;
    });
  }, [filterType, filterModule, searchTerm]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans selection:bg-[#FF9900]/20 selection:text-[#03045e] pb-32">
      <div className="max-w-[85rem] mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- Header --- */}
        <header className="mb-10">
          <button 
            onClick={() => onNavigate('instructor')} 
            className="group inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#03045e] transition-colors duration-300 mb-6"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200/50 flex items-center justify-center group-hover:bg-[#03045e]/10 transition-colors">
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </div>
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-[#03045e] text-xs font-bold tracking-widest uppercase mb-3 shadow-sm border border-blue-100/50">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Instructor Panel
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Problem Management</h1>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="flex items-center gap-2 bg-[#03045e] text-white px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-lg hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
              Create Problem
            </button>
          </div>
        </header>

        {/* --- View Tabs --- */}
        <div className="flex overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] mb-8 custom-scrollbar">
          {[
            { id: 'problems', label: 'All Problems', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
            { id: 'analytics', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
            { id: 'submissions', label: 'Submission Logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
            { id: 'rules', label: 'SQL Rules', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveView(tab.id)}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 whitespace-nowrap
                ${activeView === tab.id 
                  ? 'bg-[#03045e] text-white shadow-md' 
                  : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
            >
              <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon}></path></svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- Problems List View --- */}
        {activeView === 'problems' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex-1 min-w-[250px] relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input
                  type="text" placeholder="Search problems by title..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-11 pr-4 py-3 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03045e] focus:ring-1 focus:ring-[#03045e] transition-colors"
                />
              </div>
              <select 
                value={filterType} onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-[#03045e] min-w-[140px] cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="COURSE">Course</option>
                <option value="ASSIGNMENT">Assignment</option>
                <option value="EXAM">Exam</option>
              </select>
              <select 
                value={filterModule} onChange={(e) => setFilterModule(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl font-semibold text-slate-700 text-sm focus:outline-none focus:border-[#03045e] min-w-[140px] cursor-pointer"
              >
                <option value="all">All Modules</option>
                <option value="01">Module 01</option>
                <option value="02">Module 02</option>
                <option value="03">Module 03</option>
                <option value="05">Module 05</option>
              </select>
            </div>

            {/* Problem Table */}
            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4 rounded-tl-3xl">ID</th>
                      <th className="px-6 py-4">Problem Title</th>
                      <th className="px-6 py-4">Module</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Table Info</th>
                      <th className="px-6 py-4">Stats</th>
                      <th className="px-6 py-4 text-center rounded-tr-3xl">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredProblems.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 font-mono font-bold text-slate-400 text-sm">
                          #{p.id.toString().padStart(3, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-900">{p.title}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">
                            {p.module}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            p.type === 'COURSE' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                            p.type === 'ASSIGNMENT' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                            'bg-[#FF9900]/10 border-[#FF9900]/20 text-[#CC7A00]'
                          }`}>
                            {p.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                            p.difficulty === 'beginner' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                            p.difficulty === 'intermediate' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                            'bg-rose-50 border-rose-100 text-rose-600'
                          }`}>
                            {p.difficulty}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100">{p.table}</span>
                        </td>
                        <td className="px-6 py-4 min-w-[160px]">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 flex flex-col gap-1.5">
                              <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-slate-400">{p.submissions} subs</span>
                                <span className={p.passRate >= 70 ? 'text-emerald-600' : p.passRate >= 40 ? 'text-amber-600' : 'text-rose-600'}>
                                  {p.passRate}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${p.passRate >= 70 ? 'bg-emerald-400' : p.passRate >= 40 ? 'bg-amber-400' : 'bg-rose-400'}`}
                                  style={{ width: `${p.passRate}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedProblem(p)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#03045e] hover:border-[#03045e]/30 hover:bg-blue-50 transition-all shadow-sm" title="View">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            </button>
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#FF9900] hover:border-[#FF9900]/30 hover:bg-[#FF9900]/10 transition-all shadow-sm" title="Edit">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm" title="Delete">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Analytics View --- */}
        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty Card */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold uppercase tracking-widest text-xs text-slate-400 mb-6">Difficulty Distribution</h4>
                  <div className="space-y-5">
                    {[
                      { label: 'Beginner', count: 28, pct: 34, color: 'bg-emerald-400', bg: 'bg-emerald-50' },
                      { label: 'Intermediate', count: 35, pct: 43, color: 'bg-amber-400', bg: 'bg-amber-50' },
                      { label: 'Advanced', count: 18, pct: 23, color: 'bg-rose-400', bg: 'bg-rose-50' },
                    ].map((d, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                          <span>{d.label}</span>
                          <span className="text-slate-400">{d.count} ({d.pct}%)</span>
                        </div>
                        <div className={`h-2 ${d.bg} rounded-full overflow-hidden`}>
                          <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hardest Problems */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <h4 className="font-bold uppercase tracking-widest text-xs text-rose-500 mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Lowest Pass Rate
                </h4>
                <div className="space-y-4">
                  {[
                    { title: 'EXAM: MULTI JOIN', rate: 18.8 },
                    { title: 'Line Total Calculation', rate: 21.4 },
                    { title: 'Multiple JOIN ON', rate: 32.1 },
                    { title: 'EXAM: INNER JOIN', rate: 37.5 },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 truncate flex-1">{p.title}</p>
                      <span className="inline-flex items-center justify-center bg-rose-50 text-rose-600 font-bold text-xs px-2.5 py-1 rounded-lg ml-3">
                        {p.rate}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Most Attempted */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                <h4 className="font-bold uppercase tracking-widest text-xs text-blue-500 mb-6 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                  Most Attempted
                </h4>
                <div className="space-y-4">
                  {[
                    { title: 'Select All Products', subs: 245 },
                    { title: 'Select All Stores', subs: 210 },
                    { title: 'Concat Staff Name', subs: 198 },
                    { title: 'Where State NY', subs: 187 },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                      <p className="text-sm font-semibold text-slate-700 truncate flex-1">{p.title}</p>
                      <span className="font-mono text-xs font-bold text-slate-500 ml-3">{p.subs} subs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 lg:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Common Error Analysis</h3>
                  <p className="text-sm text-slate-500 mt-1">Frequently encountered SQL errors across all submissions</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { error: 'Missing semicolon ;', count: 156 },
                  { error: 'Wrong JOIN condition', count: 89 },
                  { error: 'Missing AS alias', count: 72 },
                  { error: 'Wrong column name', count: 54 },
                  { error: 'Missing WHERE clause', count: 45 },
                  { error: 'Wrong table reference', count: 38 },
                  { error: 'Missing DISTINCT', count: 31 },
                  { error: 'Wrong ORDER direction', count: 27 },
                ].map((err, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:bg-white hover:shadow-md hover:border-slate-200 transition-all">
                    <p className="font-semibold text-sm text-slate-800 mb-3">{err.error}</p>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      <p className="font-mono text-xs font-medium text-slate-500">{err.count} occurrences</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- Submission Logs View --- */}
        {activeView === 'submissions' && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="px-8 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Submissions</h3>
                <p className="text-sm text-slate-500">Live feed of student attempts</p>
              </div>
              <button className="text-sm font-semibold text-[#03045e] bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Export CSV
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {MOCK_SUBMISSION_LOG.map((sub) => (
                <div key={sub.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full border ${sub.status === 'passed' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                        {sub.status === 'passed' ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>}
                      </span>
                      <p className="font-bold text-slate-900">{sub.student}</p>
                      <span className="text-slate-300">/</span>
                      <p className="font-semibold text-slate-600">{sub.problem}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-slate-400 font-medium">{sub.time}</span>
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono text-xs font-semibold">Attempt {sub.attempts}</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl overflow-x-auto shadow-inner">
                    <pre className="font-mono text-sm text-blue-300 whitespace-pre-wrap">{sub.query}</pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- SQL Rules View --- */}
        {activeView === 'rules' && (
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)] max-w-4xl">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Auto-Grader Rules</h3>
              <p className="text-slate-500">Configure strictness and validation rules for the SQL execution engine.</p>
            </div>
            
            <div className="space-y-4">
              {[
                { name: 'Require Semicolon', desc: 'SQL queries must end with a semicolon (;)', enabled: true },
                { name: 'Case-Insensitive Keywords', desc: 'Accept SELECT, select, Select all as valid', enabled: true },
                { name: 'Case-Insensitive Columns', desc: 'Treat product_name same as Product_Name', enabled: true },
                { name: 'ORDER BY Enforcement', desc: 'If golden query has ORDER BY, student must too', enabled: true },
                { name: 'DISTINCT Enforcement', desc: 'If golden query has DISTINCT, student must too', enabled: true },
                { name: 'Join Type Enforcement', desc: 'Require exact join type match (e.g. NATURAL JOIN)', enabled: true },
                { name: 'Block Dangerous SQL', desc: 'Reject DROP, DELETE, INSERT, UPDATE', enabled: true },
              ].map((rule, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white hover:shadow-sm hover:border-slate-200 transition-all">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{rule.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">{rule.desc}</p>
                  </div>
                  <button className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${rule.enabled ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${rule.enabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- Detail Modal --- */}
      {selectedProblem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedProblem(null)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="px-3 py-1 bg-slate-200 text-slate-700 font-mono text-xs font-bold rounded-lg">ID: {selectedProblem.id}</span>
              <button onClick={() => setSelectedProblem(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="p-8">
              <h4 className="text-2xl font-bold text-slate-900 mb-6">{selectedProblem.title}</h4>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pass Rate</p>
                  <p className={`text-2xl font-black ${selectedProblem.passRate >= 70 ? 'text-emerald-600' : selectedProblem.passRate >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {selectedProblem.passRate}%
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Subs</p>
                  <p className="text-2xl font-black text-slate-700">{selectedProblem.submissions}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <button className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-200 transition-colors">Edit Details</button>
                <button className="flex-1 py-3.5 bg-[#03045e] text-white font-bold text-sm rounded-xl hover:bg-slate-900 transition-colors shadow-md hover:shadow-lg">View Submissions</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Create Modal --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden">
            
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <h3 className="text-xl font-bold text-slate-900">Create New Problem</h3>
              <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Problem Title</label>
                <input placeholder="e.g. Select Active Customers" className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03045e] focus:ring-1 focus:ring-[#03045e] transition-colors" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Description</label>
                <textarea placeholder="Explain the problem here..." rows={3} className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03045e] focus:ring-1 focus:ring-[#03045e] transition-colors resize-none" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Type</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-[#03045e]">
                    <option>COURSE</option>
                    <option>ASSIGNMENT</option>
                    <option>EXAM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Module</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-[#03045e]">
                    <option>Module 01</option>
                    <option>Module 02</option>
                    <option>Module 03</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Difficulty</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-[#03045e]">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2 flex justify-between">
                  Golden Query (Expected Answer)
                  <span className="text-blue-500 font-normal normal-case tracking-normal cursor-pointer hover:underline">Test Query</span>
                </label>
                <div className="bg-slate-900 rounded-xl overflow-hidden p-1 shadow-inner">
                  <textarea placeholder="SELECT * FROM table_name;" rows={4} className="w-full bg-transparent p-4 font-mono text-blue-300 text-sm placeholder:text-slate-600 focus:outline-none resize-none" />
                </div>
              </div>
            </div>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-4">
              <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-200 transition-colors">Cancel</button>
              <button className="px-8 py-3 rounded-xl font-bold text-sm bg-[#FF9900] text-white shadow-md hover:bg-[#e68a00] hover:shadow-lg hover:-translate-y-0.5 transition-all">Publish Problem</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}