import React, { useState, useMemo } from 'react';

const MOCK_STATS = {
  totalStudents: 48,
  activeToday: 32,
  totalSubmissions: 1247,
  avgScore: 72.5,
  passRate: 68.3,
  pendingReview: 15,
};

const MOCK_RECENT_SUBMISSIONS = [
  { id: 1, student: 'นายสมชาย ใจดี', problem: 'Equi-join Products', status: 'passed', time: '2 min ago', score: '1/1' },
  { id: 2, student: 'นางสาวสมหญิง รักเรียน', problem: 'WHERE Condition', status: 'failed', time: '5 min ago', score: '0/1' },
  { id: 3, student: 'นายวิชัย เก่งมาก', problem: 'CONCAT Staff Name', status: 'passed', time: '8 min ago', score: '1/1' },
  { id: 4, student: 'นางสาวพิมพ์ใจ สวยงาม', problem: 'JOIN USING Filter', status: 'failed', time: '12 min ago', score: '0/1' },
  { id: 5, student: 'นายธนวัฒน์ ประเสริฐ', problem: 'NATURAL JOIN', status: 'passed', time: '15 min ago', score: '1/1' },
  { id: 6, student: 'นางสาวกมลา ทองดี', problem: 'Select All Products', status: 'passed', time: '20 min ago', score: '1/1' },
];

const MOCK_MODULE_STATS = [
  { name: 'Module 01: Intro', total: 48, completed: 45, avgScore: 95 },
  { name: 'Module 02: Select', total: 48, completed: 38, avgScore: 78 },
  { name: 'Module 03: Condition', total: 48, completed: 30, avgScore: 65 },
  { name: 'Module 05: Join', total: 48, completed: 18, avgScore: 52 },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'นายวิชัย เก่งมาก', score: 95, problems: '78/81', streak: 12 },
  { rank: 2, name: 'นายสมชาย ใจดี', score: 92, problems: '76/81', streak: 8 },
  { rank: 3, name: 'นางสาวกมลา ทองดี', score: 88, problems: '72/81', streak: 6 },
  { rank: 4, name: 'นางสาวพิมพ์ใจ สวยงาม', score: 85, problems: '70/81', streak: 5 },
  { rank: 5, name: 'นายธนวัฒน์ ประเสริฐ', score: 82, problems: '68/81', streak: 4 },
];

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'Lab 3 Deadline Extended', content: 'Due date moved to March 20', date: '2025-03-13', priority: 'high' },
  { id: 2, title: 'Exam Module 05 Available', content: 'JOIN exam is now open for all students', date: '2025-03-12', priority: 'medium' },
  { id: 3, title: 'Office Hours Changed', content: 'New office hours: Mon/Wed 14:00-16:00', date: '2025-03-10', priority: 'low' },
];

export default function InstructorDashboard({ onNavigate, user }) {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'announcements', label: 'Announcements', icon: '📢' },
  ];

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-2 w-12 bg-[#FF9900] border-2 border-slate-900"></div>
            <p className="font-mono text-xs font-black text-[#FF9900] tracking-widest uppercase">Instructor Panel</p>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase">Dashboard</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => onNavigate('coursemanage')} className="cursor-pointer bg-white border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
            ⚙️ Manage Course
          </button>
          <button onClick={() => onNavigate('problems')} className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
            📝 Problems
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex overflow-x-auto bg-white border-[4px] border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#000] scrollbar-hide">
        {sections.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`cursor-pointer flex-1 min-w-[110px] py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs sm:text-sm border-r-[3px] last:border-r-0 border-slate-900 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap
              ${activeSection === s.id ? 'bg-[#000066] text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span>{s.icon}</span> <span className="hidden sm:inline">{s.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {[
              { label: 'Total Students', value: MOCK_STATS.totalStudents, color: 'bg-blue-600', icon: '👥' },
              { label: 'Active Today', value: MOCK_STATS.activeToday, color: 'bg-emerald-500', icon: '🟢' },
              { label: 'Submissions', value: MOCK_STATS.totalSubmissions.toLocaleString(), color: 'bg-purple-600', icon: '📄' },
              { label: 'Avg Score', value: `${MOCK_STATS.avgScore}%`, color: 'bg-[#FF9900]', icon: '📈' },
              { label: 'Pass Rate', value: `${MOCK_STATS.passRate}%`, color: 'bg-cyan-500', icon: '✅' },
              { label: 'Pending Review', value: MOCK_STATS.pendingReview, color: 'bg-red-500', icon: '⏳' },
            ].map((stat, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
                <div className="bg-white border-[3px] border-slate-900 rounded-2xl p-5 relative">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xl sm:text-2xl">{stat.icon}</span>
                    <div className={`w-3 h-3 ${stat.color} rounded-full`}></div>
                  </div>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 font-mono">{stat.value}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Module Progress */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
                <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Module Progress</h3>
                  <span className="text-slate-400 font-mono text-xs">4 modules</span>
                </div>
                <div className="p-6 space-y-5">
                  {MOCK_MODULE_STATS.map((mod, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-slate-800">{mod.name}</p>
                        <span className="font-mono text-xs font-black text-slate-500">{mod.completed}/{mod.total}</span>
                      </div>
                      <div className="h-4 bg-slate-100 rounded-full border-2 border-slate-200 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${mod.avgScore >= 80 ? 'bg-emerald-400' : mod.avgScore >= 60 ? 'bg-[#FF9900]' : 'bg-red-400'}`}
                          style={{ width: `${(mod.completed / mod.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Score: {mod.avgScore}%</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
                <div className="bg-slate-900 px-8 py-5 flex items-center justify-between">
                  <h3 className="text-white font-black uppercase tracking-widest text-sm">Recent Submissions</h3>
                  <span className="text-emerald-400 font-mono text-xs animate-pulse">● Live</span>
                </div>
                <div className="divide-y-2 divide-slate-100">
                  {MOCK_RECENT_SUBMISSIONS.map((sub) => (
                    <div key={sub.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className={`w-3 h-3 rounded-full border-2 border-slate-900 ${sub.status === 'passed' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        <div>
                          <p className="font-bold text-sm text-slate-800">{sub.student}</p>
                          <p className="text-xs text-slate-400 font-bold">{sub.problem}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border-2 ${
                          sub.status === 'passed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
                        }`}>{sub.status}</span>
                        <p className="text-[10px] text-slate-400 font-bold mt-1">{sub.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Students Section */}
      {activeSection === 'students' && <StudentMonitoring />}

      {/* Leaderboard Section */}
      {activeSection === 'leaderboard' && (
        <div className="relative">
          <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
          <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
            <div className="bg-gradient-to-r from-[#FF9900] to-[#FF6600] px-8 py-6 border-b-[4px] border-slate-900">
                <h3 className="text-slate-900 font-black uppercase tracking-widest text-2xl flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">🏆</span> Student Leaderboard
              </h3>
            </div>
            <div className="divide-y-[3px] divide-slate-100">
              {MOCK_LEADERBOARD.map((student) => (
                <div key={student.rank} className="px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className={`w-14 h-14 rounded-2xl border-[3px] border-slate-900 flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000]
                      ${student.rank === 1 ? 'bg-[#FFD700] text-slate-900' : student.rank === 2 ? 'bg-[#C0C0C0] text-slate-900' : student.rank === 3 ? 'bg-[#CD7F32] text-white' : 'bg-white text-slate-900'}`}>
                      {student.rank <= 3 ? ['🥇','🥈','🥉'][student.rank-1] : `#${student.rank}`}
                    </div>
                    <div>
                      <p className="font-black text-xl text-slate-900">{student.name}</p>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{student.problems} problems solved</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-8 ml-auto sm:ml-0">
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Streak</p>
                      <p className="font-black font-mono text-lg text-[#FF9900]">🔥 {student.streak}</p>
                    </div>
                    <div className="bg-[#000066] text-white px-6 py-3 rounded-xl border-[3px] border-slate-900 shadow-[3px_3px_0px_0px_#000]">
                      <p className="font-black font-mono text-lg sm:text-2xl">{student.score}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-200">Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Section */}
      {activeSection === 'announcements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Announcements</h3>
            <button className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
              + New Announcement
            </button>
          </div>
          <div className="space-y-4">
            {MOCK_ANNOUNCEMENTS.map((ann) => (
              <div key={ann.id} className="relative group">
                <div className="absolute inset-0 bg-slate-900 rounded-2xl translate-x-1.5 translate-y-1.5"></div>
                <div className="bg-white border-[3px] border-slate-900 rounded-2xl p-6 relative flex items-start gap-5">
                  <div className={`w-3 h-3 rounded-full mt-1.5 border-2 border-slate-900 shrink-0 ${
                    ann.priority === 'high' ? 'bg-red-500' : ann.priority === 'medium' ? 'bg-[#FF9900]' : 'bg-emerald-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-lg text-slate-900">{ann.title}</h4>
                      <span className="text-xs font-bold text-slate-400">{ann.date}</span>
                    </div>
                    <p className="text-slate-600 font-bold mt-1">{ann.content}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button className="cursor-pointer w-9 h-9 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">✏️</button>
                    <button className="cursor-pointer w-9 h-9 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-red-50 hover:border-red-300 transition-colors">🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Student Monitoring Sub-Component
function StudentMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const MOCK_STUDENTS = [
    { id: 1, name: 'นายวิชัย เก่งมาก', email: 'wichai@kmitl.ac.th', progress: 95, problems: '78/81', lastActive: '2 min ago', status: 'active' },
    { id: 2, name: 'นายสมชาย ใจดี', email: 'somchai@kmitl.ac.th', progress: 88, problems: '72/81', lastActive: '1 hr ago', status: 'active' },
    { id: 3, name: 'นางสาวกมลา ทองดี', email: 'kamala@kmitl.ac.th', progress: 82, problems: '68/81', lastActive: '3 hr ago', status: 'idle' },
    { id: 4, name: 'นางสาวสมหญิง รักเรียน', email: 'somying@kmitl.ac.th', progress: 65, problems: '54/81', lastActive: '1 day ago', status: 'idle' },
    { id: 5, name: 'นายธนวัฒน์ ประเสริฐ', email: 'thanawat@kmitl.ac.th', progress: 55, problems: '45/81', lastActive: '2 days ago', status: 'inactive' },
    { id: 6, name: 'นางสาวพิมพ์ใจ สวยงาม', email: 'pimjai@kmitl.ac.th', progress: 40, problems: '33/81', lastActive: '5 days ago', status: 'at-risk' },
  ];

  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white border-[3px] border-slate-900 px-5 py-3 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]"
        />
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'idle', 'at-risk'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)}
              className={`cursor-pointer px-4 py-3 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest transition-all
                ${filterStatus === status ? 'bg-slate-900 text-white shadow-none' : 'bg-white shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
        <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
          <div className="overflow-x-auto">
          <div className="min-w-[700px]">
          <div className="bg-slate-900 px-8 py-4 grid grid-cols-12 text-white text-[10px] font-black uppercase tracking-widest">
            <div className="col-span-4">Student</div>
            <div className="col-span-2">Progress</div>
            <div className="col-span-2">Problems</div>
            <div className="col-span-2">Last Active</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
          <div className="divide-y-2 divide-slate-100">
            {filteredStudents.map((student) => (
              <div key={student.id} className="px-8 py-5 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#000066] border-[3px] border-slate-900 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-[2px_2px_0px_0px_#000]">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-sm text-slate-900">{student.name}</p>
                    <p className="text-[10px] font-bold text-slate-400">{student.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                      <div className={`h-full rounded-full ${student.progress >= 80 ? 'bg-emerald-400' : student.progress >= 50 ? 'bg-[#FF9900]' : 'bg-red-400'}`}
                        style={{ width: `${student.progress}%` }}></div>
                    </div>
                    <span className="font-mono text-xs font-black text-slate-600">{student.progress}%</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="font-mono text-sm font-black text-slate-700">{student.problems}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-bold text-slate-400">{student.lastActive}</span>
                </div>
                <div className="col-span-2 flex justify-center">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 ${
                    student.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    student.status === 'idle' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' :
                    student.status === 'at-risk' ? 'bg-red-50 border-red-200 text-red-700' :
                    'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>{student.status}</span>
                </div>
              </div>
            ))}
          </div>          </div>
          </div>        </div>
      </div>
    </div>
  );
}
