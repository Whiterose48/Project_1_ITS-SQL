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
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <button onClick={() => onNavigate('instructor')} className="cursor-pointer text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase">Problem Management</h1>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
          + Create Problem
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex overflow-x-auto bg-white border-[4px] border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#000] scrollbar-hide">
        {[
          { id: 'problems', label: 'All Problems', icon: '📝' },
          { id: 'analytics', label: 'Analytics', icon: '📊' },
          { id: 'submissions', label: 'Submission Logs', icon: '📋' },
          { id: 'rules', label: 'SQL Rules', icon: '⚖️' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`cursor-pointer flex-1 min-w-[110px] py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs sm:text-sm border-r-[3px] last:border-r-0 border-slate-900 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap
              ${activeView === tab.id ? 'bg-[#000066] text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Problems List */}
      {activeView === 'problems' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text" placeholder="Search problems..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] bg-white border-[3px] border-slate-900 px-5 py-3 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]"
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
              className="bg-white border-[3px] border-slate-900 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
              <option value="all">All Types</option>
              <option value="COURSE">Course</option>
              <option value="ASSIGNMENT">Assignment</option>
              <option value="EXAM">Exam</option>
            </select>
            <select value={filterModule} onChange={(e) => setFilterModule(e.target.value)}
              className="bg-white border-[3px] border-slate-900 px-4 py-3 rounded-xl font-black text-xs uppercase tracking-widest">
              <option value="all">All Modules</option>
              <option value="01">Module 01</option>
              <option value="02">Module 02</option>
              <option value="03">Module 03</option>
              <option value="05">Module 05</option>
            </select>
          </div>

          {/* Problem Table */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
              <div className="overflow-x-auto">
              <div className="min-w-[900px]">
              <div className="bg-slate-900 px-6 py-4 grid grid-cols-12 text-white text-[10px] font-black uppercase tracking-widest">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Problem Title</div>
                <div className="col-span-1">Module</div>
                <div className="col-span-1">Type</div>
                <div className="col-span-1">Level</div>
                <div className="col-span-1">Table</div>
                <div className="col-span-1">Subs</div>
                <div className="col-span-2">Pass Rate</div>
                <div className="col-span-1">Actions</div>
              </div>
              <div className="divide-y-2 divide-slate-100">
                {filteredProblems.map((p) => (
                  <div key={p.id} className="px-6 py-4 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-1 font-mono font-black text-slate-900">#{p.id}</div>
                    <div className="col-span-3">
                      <p className="font-bold text-sm text-slate-900 truncate">{p.title}</p>
                    </div>
                    <div className="col-span-1">
                      <span className="font-mono text-xs font-black bg-slate-100 px-2 py-1 rounded border border-slate-200">{p.module}</span>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border-2 ${
                        p.type === 'COURSE' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        p.type === 'ASSIGNMENT' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>{p.type}</span>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border-2 ${
                        p.difficulty === 'beginner' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                        p.difficulty === 'intermediate' ? 'bg-[#FF9900]/10 border-[#FF9900]/30 text-[#CC7A00]' :
                        'bg-red-50 border-red-200 text-red-700'
                      }`}>{p.difficulty}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="font-mono text-xs text-slate-500">{p.table}</span>
                    </div>
                    <div className="col-span-1">
                      <span className="font-mono text-sm font-black text-slate-700">{p.submissions}</span>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                          <div className={`h-full rounded-full ${p.passRate >= 70 ? 'bg-emerald-400' : p.passRate >= 40 ? 'bg-[#FF9900]' : 'bg-red-400'}`}
                            style={{ width: `${p.passRate}%` }}></div>
                        </div>
                        <span className="font-mono text-xs font-black text-slate-500 w-12 text-right">{p.passRate}%</span>
                      </div>
                    </div>
                    <div className="col-span-1 flex gap-1">
                      <button onClick={() => setSelectedProblem(p)} className="cursor-pointer w-7 h-7 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-xs hover:bg-blue-50 transition-colors">👁️</button>
                      <button className="cursor-pointer w-7 h-7 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-xs hover:bg-blue-50 transition-colors">✏️</button>
                      <button className="cursor-pointer w-7 h-7 bg-slate-100 border border-slate-200 rounded flex items-center justify-center text-xs hover:bg-red-50 transition-colors">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
              </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Difficulty Distribution */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
              <div className="bg-white border-[3px] border-slate-900 rounded-2xl p-6 relative space-y-4">
                <h4 className="font-black uppercase tracking-widest text-xs text-slate-400">By Difficulty</h4>
                {[
                  { label: 'Beginner', count: 28, pct: 34, color: 'bg-emerald-400' },
                  { label: 'Intermediate', count: 35, pct: 43, color: 'bg-[#FF9900]' },
                  { label: 'Advanced', count: 18, pct: 23, color: 'bg-red-400' },
                ].map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600">
                      <span>{d.label}</span>
                      <span className="font-mono">{d.count} ({d.pct}%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className={`h-full ${d.color} rounded-full`} style={{ width: `${d.pct}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hardest Problems */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
              <div className="bg-white border-[3px] border-slate-900 rounded-2xl p-6 relative space-y-4">
                <h4 className="font-black uppercase tracking-widest text-xs text-red-500">Hardest Problems</h4>
                {[
                  { title: 'EXAM: MULTI JOIN', rate: 18.8 },
                  { title: 'Line Total Calculation', rate: 21.4 },
                  { title: 'Multiple JOIN ON', rate: 32.1 },
                  { title: 'EXAM: INNER JOIN', rate: 37.5 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <p className="text-sm font-bold text-slate-700 truncate flex-1">{p.title}</p>
                    <span className="font-mono text-xs font-black text-red-600 ml-2">{p.rate}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Most Attempted */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
              <div className="bg-white border-[3px] border-slate-900 rounded-2xl p-6 relative space-y-4">
                <h4 className="font-black uppercase tracking-widest text-xs text-blue-500">Most Attempted</h4>
                {[
                  { title: 'Select All Products', subs: 245 },
                  { title: 'Select All Stores', subs: 210 },
                  { title: 'Concat Staff Name', subs: 198 },
                  { title: 'Where State NY', subs: 187 },
                ].map((p, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <p className="text-sm font-bold text-slate-700 truncate flex-1">{p.title}</p>
                    <span className="font-mono text-xs font-black text-blue-600 ml-2">{p.subs} subs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-6">
              <h4 className="text-xl font-black uppercase tracking-tighter">Common Mistakes Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { error: 'Missing semicolon ;', count: 156, icon: '❌' },
                  { error: 'Wrong JOIN condition', count: 89, icon: '🔗' },
                  { error: 'Missing AS alias', count: 72, icon: '🏷️' },
                  { error: 'Wrong column name', count: 54, icon: '📛' },
                  { error: 'Missing WHERE clause', count: 45, icon: '🔍' },
                  { error: 'Wrong table reference', count: 38, icon: '📋' },
                  { error: 'Missing DISTINCT', count: 31, icon: '🎯' },
                  { error: 'Wrong ORDER direction', count: 27, icon: '↕️' },
                ].map((err, i) => (
                  <div key={i} className="bg-slate-50 border-[3px] border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{err.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-slate-800">{err.error}</p>
                      <p className="font-mono text-xs font-black text-red-500">{err.count} occurrences</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Logs */}
      {activeView === 'submissions' && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
              <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
                <h3 className="text-white font-black uppercase tracking-widest text-sm">Submission History</h3>
                <button className="cursor-pointer bg-[#FF9900] text-slate-900 px-4 py-2 rounded-lg border-2 border-slate-900 font-black text-[10px] uppercase tracking-widest">Export CSV</button>
              </div>
              <div className="divide-y-2 divide-slate-100">
                {MOCK_SUBMISSION_LOG.map((sub) => (
                  <div key={sub.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mb-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${sub.status === 'passed' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        <p className="font-black text-slate-900">{sub.student}</p>
                        <span className="text-xs font-bold text-slate-400">→</span>
                        <p className="font-bold text-sm text-slate-600">{sub.problem}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <span className="text-xs font-bold text-slate-400">{sub.time}</span>
                        <span className="font-mono text-xs font-black text-slate-500">Attempt #{sub.attempts}</span>
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border-2 ${
                          sub.status === 'passed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>{sub.status}</span>
                      </div>
                    </div>
                    <div className="bg-[#1e1e1e] p-4 rounded-xl border-[3px] border-slate-800">
                      <pre className="font-mono text-sm text-emerald-400 whitespace-pre-wrap">{sub.query}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SQL Rules View */}
      {activeView === 'rules' && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter">SQL Validation Rules</h3>
              <p className="text-slate-500 font-bold">Configure grading rules for auto SQL judge system</p>
              
              <div className="space-y-4">
                {[
                  { name: 'Require Semicolon', desc: 'SQL queries must end with a semicolon (;)', enabled: true },
                  { name: 'Case-Insensitive Keywords', desc: 'Accept SELECT, select, Select all as valid', enabled: true },
                  { name: 'Case-Insensitive Columns', desc: 'Treat product_name same as Product_Name', enabled: true },
                  { name: 'ORDER BY Enforcement', desc: 'If golden query has ORDER BY, student must too', enabled: true },
                  { name: 'DISTINCT Enforcement', desc: 'If golden query has DISTINCT, student must too', enabled: true },
                  { name: 'Join Type Enforcement', desc: 'If golden uses NATURAL JOIN, require that specific type', enabled: true },
                  { name: 'Alias Enforcement', desc: 'Check that required column aliases are used', enabled: true },
                  { name: 'Block Dangerous SQL', desc: 'Reject DROP, DELETE, INSERT, UPDATE, ALTER, CREATE', enabled: true },
                  { name: 'Float Tolerance', desc: 'Allow ±0.0001 difference for decimal values', enabled: true },
                  { name: 'Order-Independent Compare', desc: 'Sort both result sets before comparison (unless ORDER BY)', enabled: true },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border-[3px] border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                    <div>
                      <p className="font-black text-slate-900">{rule.name}</p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">{rule.desc}</p>
                    </div>
                    <div className={`w-14 h-7 rounded-full border-[3px] border-slate-900 relative cursor-pointer ${rule.enabled ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                      <div className={`absolute w-5 h-5 bg-white border-2 border-slate-900 rounded-full top-[-1px] transition-all ${rule.enabled ? 'right-[-1px]' : 'left-[-1px]'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Problem Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl relative overflow-hidden">
              <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
                <h3 className="text-white font-black uppercase tracking-widest">Problem #{selectedProblem.id}</h3>
                <button onClick={() => setSelectedProblem(null)} className="cursor-pointer text-white text-xl font-black hover:text-red-400 transition-colors">✕</button>
              </div>
              <div className="p-8 space-y-6">
                <h4 className="text-2xl font-black text-slate-900">{selectedProblem.title}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pass Rate</p>
                    <p className="font-black font-mono text-3xl text-slate-900">{selectedProblem.passRate}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submissions</p>
                    <p className="font-black font-mono text-3xl text-slate-900">{selectedProblem.submissions}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="cursor-pointer flex-1 bg-slate-900 text-white py-3 rounded-xl font-black uppercase text-xs tracking-widest">Edit Problem</button>
                  <button className="cursor-pointer flex-1 bg-[#FF9900] text-[#000066] py-3 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[3px_3px_0px_0px_#000]">View Submissions</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Problem Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl p-10 relative space-y-6">
              <button onClick={() => setShowCreateModal(false)} className="cursor-pointer absolute top-4 right-4 bg-white border-[3px] border-slate-900 w-10 h-10 rounded-xl font-black text-xl hover:bg-red-500 hover:text-white shadow-[3px_3px_0px_0px_#000]">✕</button>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter">Create New Problem</h3>
              
              <div className="space-y-4">
                <input placeholder="Problem Title" className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]" />
                
                <textarea placeholder="Problem Description (Thai or English)" rows={3} className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900] resize-none" />
                
                <div className="grid grid-cols-3 gap-4">
                  <select className="bg-white border-[3px] border-slate-900 p-3 rounded-xl font-black text-xs uppercase">
                    <option>COURSE</option>
                    <option>ASSIGNMENT</option>
                    <option>EXAM</option>
                  </select>
                  <select className="bg-white border-[3px] border-slate-900 p-3 rounded-xl font-black text-xs uppercase">
                    <option>Module 01</option>
                    <option>Module 02</option>
                    <option>Module 03</option>
                    <option>Module 05</option>
                  </select>
                  <select className="bg-white border-[3px] border-slate-900 p-3 rounded-xl font-black text-xs uppercase">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Golden Query (Expected Answer)</label>
                  <div className="bg-[#1e1e1e] border-[3px] border-slate-900 rounded-xl overflow-hidden">
                    <textarea placeholder="SELECT * FROM products;" rows={4} className="w-full bg-transparent p-4 font-mono text-emerald-400 text-sm placeholder:text-slate-600 focus:outline-none resize-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Requirements (one per line)</label>
                  <textarea placeholder="ใช้คำสั่ง SELECT ดึงข้อมูล&#10;แสดงคอลัมน์ทั้งหมด" rows={3} className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900] resize-none" />
                </div>

                <button className="cursor-pointer w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
                  Create Problem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
