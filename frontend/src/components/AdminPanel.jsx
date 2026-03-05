import React, { useState, useMemo } from 'react';

const MOCK_USERS = [
  { id: 1, name: 'ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช', email: 'kanokwan.a@gmail.com', role: 'instructor', lastLogin: '2025-03-13 14:00', status: 'active' },
  { id: 2, name: 'นายพชร พรอโนทัย', email: 'pachara.porn@gmail.com', role: 'ta', lastLogin: '2025-03-13 13:45', status: 'active' },
  { id: 3, name: 'นายณัฐวีร์ เเนวกำพล', email: 'natthawee.n@gmail.com', role: 'ta', lastLogin: '2025-03-13 12:30', status: 'active' },
  { id: 4, name: 'นายวิชัย เก่งมาก', email: 'wichai@kmitl.ac.th', role: 'student', lastLogin: '2025-03-13 14:32', status: 'active' },
  { id: 5, name: 'นายสมชาย ใจดี', email: 'somchai@kmitl.ac.th', role: 'student', lastLogin: '2025-03-13 14:28', status: 'active' },
  { id: 6, name: 'นางสาวพิมพ์ใจ สวยงาม', email: 'pimjai@kmitl.ac.th', role: 'student', lastLogin: '2025-03-08', status: 'inactive' },
  { id: 7, name: 'Admin System', email: 'admin@kmitl.ac.th', role: 'admin', lastLogin: '2025-03-13 10:00', status: 'active' },
];

const MOCK_SYSTEM_STATS = {
  uptime: '99.8%',
  dbSize: '124 MB',
  apiCalls: '15,432',
  errorRate: '0.3%',
  avgResponse: '45ms',
  activeUsers: 32,
};

const MOCK_SYSTEM_LOGS = [
  { time: '14:32:15', level: 'info', message: 'User login: wichai@kmitl.ac.th', source: 'auth' },
  { time: '14:28:42', level: 'info', message: 'Submission graded: Problem #25 → PASSED', source: 'grading' },
  { time: '14:25:10', level: 'warn', message: 'DuckDB-WASM slow query: >2s execution time', source: 'verifier' },
  { time: '14:20:33', level: 'info', message: 'Course enrollment: somchai@kmitl.ac.th → 06070999', source: 'enrollment' },
  { time: '14:15:00', level: 'error', message: 'Backend API timeout: /api/submissions (retry succeeded)', source: 'api' },
  { time: '14:10:22', level: 'info', message: 'Database backup completed successfully', source: 'system' },
  { time: '13:55:18', level: 'info', message: 'New student registered: newuser@kmitl.ac.th', source: 'auth' },
  { time: '13:45:33', level: 'warn', message: 'Rate limit reached: 100 requests/min from 192.168.1.50', source: 'security' },
];

export default function AdminPanel({ onNavigate }) {
  const [activeView, setActiveView] = useState('users');
  const [userFilter, setUserFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(null);

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter(u => {
      const matchRole = userFilter === 'all' || u.role === userFilter;
      const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchSearch;
    });
  }, [userFilter, searchTerm]);

  const roleColors = {
    admin: 'bg-red-500 text-white border-red-700',
    instructor: 'bg-blue-600 text-white border-blue-800',
    ta: 'bg-emerald-500 text-white border-emerald-700',
    student: 'bg-slate-200 text-slate-700 border-slate-400',
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <button onClick={() => onNavigate('instructor')} className="cursor-pointer text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase">Admin Panel</h1>
            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full border-2 border-slate-900 uppercase tracking-widest">Admin Only</span>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex flex-wrap bg-white border-[3px] sm:border-[4px] border-slate-900 rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_#000] sm:shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        {[
          { id: 'users', label: 'User Management', icon: '👤' },
          { id: 'system', label: 'System Stats', icon: '🖥️' },
          { id: 'logs', label: 'System Logs', icon: '📋' },
          { id: 'config', label: 'Configuration', icon: '🔧' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`cursor-pointer flex-1 min-w-[120px] py-3.5 sm:py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs sm:text-sm border-r-[2px] sm:border-r-[3px] last:border-r-0 border-slate-900 transition-all flex items-center justify-center gap-1.5 sm:gap-2
              ${activeView === tab.id ? 'bg-red-500 text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeView === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <input
              type="text" placeholder="Search users..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-white border-[3px] border-slate-900 px-5 py-3 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]"
            />
            <div className="flex gap-2">
              {['all', 'admin', 'instructor', 'ta', 'student'].map((role) => (
                <button key={role} onClick={() => setUserFilter(role)}
                  className={`cursor-pointer px-4 py-3 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest transition-all
                    ${userFilter === role ? 'bg-slate-900 text-white shadow-none' : 'bg-white shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5'}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
              <div className="overflow-x-auto">
              <div className="min-w-[800px]">
              <div className="bg-slate-900 px-8 py-4 grid grid-cols-12 text-white text-[10px] font-black uppercase tracking-widest">
                <div className="col-span-1">ID</div>
                <div className="col-span-3">Name</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-1">Role</div>
                <div className="col-span-2">Last Login</div>
                <div className="col-span-2 text-center">Actions</div>
              </div>
              <div className="divide-y-2 divide-slate-100">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="px-8 py-5 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-1">
                      <span className="font-mono font-black text-slate-600">#{user.id}</span>
                    </div>
                    <div className="col-span-3 flex items-center gap-3">
                      <div className={`w-10 h-10 ${roleColors[user.role].split(' ')[0]} border-[3px] border-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_0px_#000]`}>
                        {user.name.charAt(0)}
                      </div>
                      <p className="font-black text-sm text-slate-900">{user.name}</p>
                    </div>
                    <div className="col-span-3">
                      <p className="font-mono text-xs text-slate-500">{user.email}</p>
                    </div>
                    <div className="col-span-1">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border-2 ${roleColors[user.role]}`}>{user.role}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-bold text-slate-400">{user.lastLogin}</span>
                    </div>
                    <div className="col-span-2 flex justify-center gap-2">
                      <button onClick={() => setShowEditModal(user)} className="cursor-pointer w-9 h-9 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">✏️</button>
                      <button className="cursor-pointer w-9 h-9 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-red-50 hover:border-red-300 transition-colors">🗑️</button>
                      <button className="cursor-pointer w-9 h-9 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-purple-50 hover:border-purple-300 transition-colors">🔑</button>
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

      {/* System Stats */}
      {activeView === 'system' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { label: 'Uptime', value: MOCK_SYSTEM_STATS.uptime, icon: '🟢', color: 'border-emerald-300' },
              { label: 'DB Size', value: MOCK_SYSTEM_STATS.dbSize, icon: '💾', color: 'border-blue-300' },
              { label: 'API Calls', value: MOCK_SYSTEM_STATS.apiCalls, icon: '📡', color: 'border-purple-300' },
              { label: 'Error Rate', value: MOCK_SYSTEM_STATS.errorRate, icon: '⚠️', color: 'border-red-300' },
              { label: 'Avg Response', value: MOCK_SYSTEM_STATS.avgResponse, icon: '⚡', color: 'border-yellow-300' },
              { label: 'Active Users', value: MOCK_SYSTEM_STATS.activeUsers, icon: '👥', color: 'border-cyan-300' },
            ].map((stat, i) => (
              <div key={i} className="relative">
                <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
                <div className={`bg-white border-[3px] border-slate-900 rounded-2xl p-5 relative`}>
                  <span className="text-2xl">{stat.icon}</span>
                  <p className="font-black font-mono text-2xl text-slate-900 mt-2">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Service Status */}
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-6">
              <h3 className="font-black uppercase tracking-tighter text-xl">Service Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Frontend (Vite)', status: 'running', port: '8080', uptime: '99.9%' },
                  { name: 'Backend (FastAPI)', status: 'running', port: '8000', uptime: '99.8%' },
                  { name: 'DuckDB-WASM', status: 'running', port: 'Client', uptime: '99.9%' },
                  { name: 'Firebase Auth', status: 'running', port: 'Cloud', uptime: '99.95%' },
                ].map((svc, i) => (
                  <div key={i} className="bg-slate-50 border-[3px] border-slate-200 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-black text-sm text-slate-900">{svc.name}</p>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${svc.status === 'running' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        <span className="text-[10px] font-black text-emerald-600 uppercase">{svc.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-400">
                      <span>Port: {svc.port}</span>
                      <span>Uptime: {svc.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Logs */}
      {activeView === 'logs' && (
        <div className="relative">
          <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
          <div className="bg-[#0f172a] border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
            <div className="bg-slate-800 px-8 py-5 flex items-center justify-between border-b-[3px] border-slate-700">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <h3 className="text-white font-black uppercase tracking-widest text-sm ml-2">System Log Viewer</h3>
              </div>
              <div className="flex gap-2">
                <button className="cursor-pointer bg-slate-700 text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-slate-600 border border-slate-600">Clear</button>
                <button className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 border border-blue-500">Export</button>
              </div>
            </div>
            <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm space-y-1 max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              {MOCK_SYSTEM_LOGS.map((log, i) => {
                const levelColors = {
                  info: 'text-cyan-400',
                  warn: 'text-yellow-400',
                  error: 'text-red-400',
                };
                return (
                  <div key={i} className="flex gap-3 py-1 hover:bg-white/5 px-2 rounded transition-colors">
                    <span className="text-slate-500 shrink-0">[{log.time}]</span>
                    <span className={`${levelColors[log.level]} font-black uppercase w-14 shrink-0`}>[{log.level}]</span>
                    <span className="text-slate-400 shrink-0">[{log.source}]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      {activeView === 'config' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Authentication Config */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-5">
                <h3 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">🔐 Authentication</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Google OAuth', value: 'Enabled', editable: false },
                    { label: 'Domain Restriction', value: 'Student: @kmitl.ac.th | Staff: @gmail.com', editable: true },
                    { label: 'Session Timeout', value: '180 seconds', editable: true },
                    { label: 'Firebase Project', value: 'its-sql-platform', editable: false },
                  ].map((cfg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-bold text-slate-600">{cfg.label}</span>
                      <span className="font-mono text-sm font-black text-slate-900">{cfg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Database Config */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-5">
                <h3 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">💾 Database</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Backend DB', value: 'SQLite (aiosqlite)', editable: false },
                    { label: 'Client Engine', value: 'DuckDB-WASM', editable: false },
                    { label: 'Dataset Schema', value: 'bikestore_mysql.sql', editable: false },
                    { label: 'Tables', value: '10 tables', editable: false },
                  ].map((cfg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-bold text-slate-600">{cfg.label}</span>
                      <span className="font-mono text-sm font-black text-slate-900">{cfg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Grading Config */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-5">
                <h3 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">⚡ Grading Engine</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Primary Engine', value: 'DuckDB-WASM (Client)' },
                    { label: 'Fallback Engine', value: 'SQLite Sandbox (Server)' },
                    { label: 'Query Timeout', value: '10 seconds' },
                    { label: 'Max Result Rows', value: '10,000' },
                  ].map((cfg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-bold text-slate-600">{cfg.label}</span>
                      <span className="font-mono text-sm font-black text-slate-900">{cfg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* API Config */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-5">
                <h3 className="font-black uppercase tracking-tighter text-lg flex items-center gap-2">🌐 API Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: 'API Base URL', value: 'http://localhost:8000/api' },
                    { label: 'CORS Origins', value: 'localhost:8080' },
                    { label: 'Rate Limit', value: '100 req/min' },
                    { label: 'JWT Expiry', value: '24 hours' },
                  ].map((cfg, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                      <span className="text-sm font-bold text-slate-600">{cfg.label}</span>
                      <span className="font-mono text-sm font-black text-slate-900">{cfg.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
              Save Configuration
            </button>
            <button className="cursor-pointer bg-red-500 text-white px-8 py-4 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 transition-all">
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl p-10 relative space-y-6">
              <button onClick={() => setShowEditModal(null)} className="cursor-pointer absolute -top-4 -right-4 bg-white border-[3px] border-slate-900 w-10 h-10 rounded-xl font-black text-xl hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_0px_#000]">✕</button>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Edit User</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Name</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold focus:outline-none focus:border-[#FF9900] mt-1" defaultValue={showEditModal.name} />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-mono font-bold focus:outline-none focus:border-[#FF9900] mt-1" defaultValue={showEditModal.email} readOnly />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Role</label>
                  <select className="w-full bg-white border-[3px] border-slate-900 p-4 rounded-xl font-black text-sm uppercase mt-1" defaultValue={showEditModal.role}>
                    <option value="student">Student</option>
                    <option value="ta">Teaching Assistant</option>
                    <option value="instructor">Instructor / อาจารย์</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="cursor-pointer flex-1 bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
                    Save Changes
                  </button>
                  <button className="cursor-pointer flex-1 bg-red-500 text-white py-4 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest">
                    Deactivate
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
