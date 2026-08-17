import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { problems as builtinProblems, dbSchema } from '../lib/problems';
import {
  getCustomProblems, saveCustomProblem, deleteCustomProblem,
  getAnnouncements, saveAnnouncement, deleteAnnouncement,
  getContent, saveContent, deleteContent,
  getAllSubmissions, setSubmissionStatus, onStoreChange,
  getExamConfigs, setExamConfig,
} from '../lib/instructor-store';

// ── Constants ───────────────────────────────────────────────
const MODULES = [
  { id: '01', name: 'Database Fundamentals' },
  { id: '02', name: 'SELECT Statement' },
  { id: '03', name: 'WHERE Clause & Operators' },
  { id: '04', name: 'ORDER BY & LIMIT' },
  { id: '05', name: 'Joins & Relationships' },
];
const moduleName = (id) => MODULES.find((m) => m.id === id)?.name || `Module ${id}`;
const TABLES = Object.keys(dbSchema);

const TYPE_STYLES = {
  COURSE: 'bg-blue-50 border-blue-100 text-blue-600',
  ASSIGNMENT: 'bg-indigo-50 border-indigo-100 text-indigo-600',
  EXAM: 'bg-[#FF9900]/10 border-[#FF9900]/20 text-[#CC7A00]',
};
const DIFF_STYLES = {
  beginner: 'bg-emerald-50 border-emerald-100 text-emerald-600',
  intermediate: 'bg-amber-50 border-amber-100 text-amber-600',
  advanced: 'bg-rose-50 border-rose-100 text-rose-600',
};

// ── Small UI helpers ────────────────────────────────────────
const labelCls = 'text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2';
const inputCls = 'w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#03045e] focus:ring-1 focus:ring-[#03045e] transition-colors';

const Icon = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);
const ICONS = {
  grid: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  check: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  book: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.247m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.247',
  code: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
  mega: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
  plus: 'M12 4v16m8-8H4',
  edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  close: 'M6 18L18 6M6 6l12 12',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
  users: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4 0M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  doc: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  chart: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
};

function Modal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] bg-white rounded-[2rem] shadow-[0_24px_60px_-15px_rgba(3,4,94,0.35)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}>
        <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div>
            <h3 className="text-lg font-bold text-[#03045e]">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors outline-none">
            <Icon d={ICONS.close} className="w-4 h-4" />
          </button>
        </div>
        <div className="p-7 overflow-y-auto custom-scrollbar space-y-5">{children}</div>
        {footer && <div className="px-7 py-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, hint }) {
  return (
    <div className="bg-white border border-slate-200 shadow-[0_8px_30px_rgba(0,0,0,0.03)] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[260px]">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-5 border border-slate-100">
        <Icon d={icon} className="w-7 h-7" />
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-1">{title}</h3>
      <p className="text-slate-400 text-sm max-w-xs mx-auto">{hint}</p>
    </div>
  );
}

const btnPrimary = 'inline-flex items-center justify-center gap-2 bg-[#03045e] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#020344] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-[#03045e]/30';
const btnAccent = 'inline-flex items-center justify-center gap-2 bg-[#f48c06] text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-[#e07d00] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md hover:shadow-lg outline-none focus-visible:ring-2 focus-visible:ring-[#f48c06]/40';
const btnGhost = 'inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 transition-colors outline-none';

/** Build a CSV string from rows of cells (RFC-4180 quoting) and trigger a download. */
function downloadCsv(filename, rows) {
  const csv = rows
    .map((r) => r.map((c) => {
      const s = c == null ? '' : String(c);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Consistent, clear section heading: icon tile + title + description + optional action. */
function SectionHeader({ icon, title, desc, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-[#03045e]/10 text-[#03045e] flex items-center justify-center shrink-0">
          <Icon d={icon} className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#03045e] tracking-tight leading-none">{title}</h2>
          {desc && <p className="text-sm text-slate-500 mt-1.5">{desc}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function InstructorDashboard({ onNavigate, user }) {
  const [section, setSection] = useState('overview');
  const [customProblems, setCustomProblems] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [content, setContent] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [examConfigs, setExamConfigs] = useState({});

  const refresh = useCallback(() => {
    setCustomProblems(getCustomProblems());
    setAnnouncements(getAnnouncements());
    setContent(getContent());
    setSubmissions(getAllSubmissions());
    setExamConfigs(getExamConfigs());
  }, []);

  useEffect(() => {
    refresh();
    const off = onStoreChange(() => refresh());
    return off;
  }, [refresh]);

  // TA is merged into Instructor — one shared teaching identity.
  const roleLabel = 'Instructor';

  const stats = useMemo(() => {
    const total = builtinProblems.length + customProblems.length;
    const exams = builtinProblems.filter((p) => p.type === 'EXAM').length + customProblems.filter((p) => p.type === 'EXAM').length;
    const passed = submissions.filter((s) => s.passed).length;
    const passRate = submissions.length ? Math.round((passed / submissions.length) * 100) : 0;
    return { total, exams, passRate, subs: submissions.length };
  }, [customProblems, submissions]);

  const SECTIONS = [
    { id: 'overview', label: 'Overview', icon: ICONS.grid },
    { id: 'students', label: 'Students', icon: ICONS.users },
    { id: 'grading', label: 'Grading', icon: ICONS.check },
    { id: 'analytics', label: 'Analytics', icon: ICONS.chart },
    { id: 'content', label: 'Content', icon: ICONS.book },
    { id: 'problems', label: 'Problems', icon: ICONS.code },
    { id: 'exams', label: 'Exam Control', icon: ICONS.doc },
    { id: 'announcements', label: 'Announcements', icon: ICONS.mega },
  ];

  return (
    <div className="max-w-[1300px] mx-auto pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#03045e] text-white flex items-center justify-center shadow-[0_8px_20px_rgba(3,4,94,0.25)] shrink-0">
            <Icon d={ICONS.users} className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#03045e]/5 border border-[#03045e]/10 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f48c06]"></span>
              <span className="text-[10px] font-bold text-[#03045e] uppercase tracking-widest">{roleLabel} Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#03045e] tracking-tight leading-none">Teaching Console</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSection('problems')} className={btnGhost + ' bg-white border border-slate-200 shadow-sm'}>
            <Icon d={ICONS.code} className="w-4 h-4" /> Problems
          </button>
          <button onClick={() => setSection('announcements')} className={btnAccent}>
            <Icon d={ICONS.plus} className="w-4 h-4" /> Announce
          </button>
        </div>
      </div>

      {/* Section Nav — roomy responsive grid (2 → 3 → 5 columns) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-[0_4px_20px_rgb(0,0,0,0.02)] grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm leading-tight text-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#03045e]/30
              ${section === s.id ? 'bg-[#03045e] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
          >
            <Icon d={s.icon} className="w-4 h-4 shrink-0" />
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {section === 'overview' && <Overview stats={stats} submissions={submissions} announcements={announcements} onGoto={setSection} />}
      {section === 'students' && <Students submissions={submissions} />}
      {section === 'grading' && <Grading submissions={submissions} onRefresh={refresh} />}
      {section === 'analytics' && <Analytics submissions={submissions} />}
      {section === 'content' && <ContentManager content={content} onRefresh={refresh} />}
      {section === 'problems' && <ProblemManager custom={customProblems} onRefresh={refresh} />}
      {section === 'exams' && <ExamControl custom={customProblems} examConfigs={examConfigs} onRefresh={refresh} />}
      {section === 'announcements' && <AnnouncementManager items={announcements} onRefresh={refresh} author={user?.name || roleLabel} />}
    </div>
  );
}

// ── Overview ────────────────────────────────────────────────
function Overview({ stats, submissions, announcements, onGoto }) {
  const cards = [
    { label: 'Total Problems', value: stats.total, tint: 'text-[#03045e] bg-[#03045e]/10', icon: ICONS.code },
    { label: 'Exams', value: stats.exams, tint: 'text-[#CC7A00] bg-[#FF9900]/10', icon: ICONS.doc },
    { label: 'Submissions', value: stats.subs, tint: 'text-indigo-600 bg-indigo-50', icon: ICONS.check },
    { label: 'Pass Rate', value: `${stats.passRate}%`, tint: 'text-emerald-600 bg-emerald-50', icon: ICONS.chart },
  ];
  const recent = submissions.slice(0, 6);
  return (
    <div className="space-y-6">
      <SectionHeader icon={ICONS.grid} title="Overview" desc="Live snapshot of your class activity." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.tint}`}>
              <Icon d={c.icon} className="w-4 h-4" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{c.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Recent Submissions</h3>
            <button onClick={() => onGoto('grading')} className="text-xs font-bold text-[#03045e] hover:underline">Review all →</button>
          </div>
          {recent.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No submissions recorded yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((s, i) => (
                <div key={i} className="px-6 py-3.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">Student {s.userId}</p>
                    <p className="text-xs text-slate-400 truncate">{s.mode} · Module {s.modId} · Q{s.step}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${s.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                    {s.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Latest Announcements</h3>
            <button onClick={() => onGoto('announcements')} className="text-xs font-bold text-[#03045e] hover:underline">Manage →</button>
          </div>
          {announcements.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-400">No announcements posted yet.</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {announcements.slice(0, 5).map((a) => (
                <div key={a.id} className="px-6 py-3.5 flex items-start gap-3">
                  <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.priority === 'high' ? 'bg-rose-500' : a.priority === 'low' ? 'bg-emerald-500' : 'bg-[#f48c06]'}`}></span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{a.title}</p>
                    <p className="text-xs text-slate-400 truncate">{a.body}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Grading (ดูการตรวจงาน) ──────────────────────────────────
function Grading({ submissions, onRefresh }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [expanded, setExpanded] = useState(null);

  const rows = useMemo(() => {
    return submissions.filter((s) => {
      const matchFilter = filter === 'all' || (filter === 'passed' ? s.passed : !s.passed);
      const matchQ = !q || String(s.userId).toLowerCase().includes(q.toLowerCase());
      return matchFilter && matchQ;
    });
  }, [submissions, filter, q]);

  const toggleGrade = (s) => {
    setSubmissionStatus(s.key, s.step, !s.passed);
    onRefresh();
  };

  const exportCsv = () => {
    const header = ['student', 'mode', 'module', 'question', 'status', 'attempts', 'duration_ms', 'submitted_at', 'overridden'];
    const body = submissions.map((s) => [
      s.userId, s.mode, s.modId, s.step,
      s.passed ? 'Passed' : 'Failed',
      Array.isArray(s.attempts) ? s.attempts.length : 1,
      s.durationMs ?? '',
      s.timestamp || '',
      s.gradedByInstructor ? 'yes' : '',
    ]);
    downloadCsv(`gradebook_${new Date().toISOString().slice(0, 10)}.csv`, [header, ...body]);
  };

  if (submissions.length === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader icon={ICONS.check} title="Grading" desc="Review student work and override pass / fail." />
        <EmptyState icon={ICONS.check} title="No submissions to grade" hint="Student attempts recorded in this browser will appear here for review and manual override." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader icon={ICONS.check} title="Grading" desc="Review student work and override pass / fail."
        action={<button onClick={exportCsv} className={btnPrimary}><Icon d={ICONS.doc} className="w-4 h-4" /> Export CSV</button>} />
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon d={ICONS.search} className="w-4 h-4" /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student ID..." className={inputCls + ' pl-10'} />
        </div>
        <div className="flex gap-2">
          {['all', 'passed', 'failed'].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all outline-none
                ${filter === f ? 'bg-[#03045e] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] divide-y divide-slate-50">
        {rows.map((s, i) => {
          const key = `${s.key}-${s.step}`;
          const isOpen = expanded === key;
          return (
            <div key={key}>
              <div className="px-5 sm:px-6 py-4 flex items-center gap-4">
                <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${s.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                  <Icon d={s.passed ? ICONS.check : ICONS.close} className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">Student {s.userId}</p>
                  <p className="text-xs text-slate-400 truncate">{s.mode} · Module {s.modId} · Q{s.step} · {s.timestamp || '—'}{s.gradedByInstructor ? ' · overridden' : ''}</p>
                </div>
                <button onClick={() => setExpanded(isOpen ? null : key)} className="text-xs font-bold text-[#03045e] hover:underline shrink-0">{isOpen ? 'Hide' : 'Code'}</button>
                <button onClick={() => toggleGrade(s)}
                  className={`shrink-0 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-colors ${s.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600' : 'bg-rose-50 border-rose-200 text-rose-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'}`}
                  title="Toggle pass/fail">
                  {s.passed ? 'Mark Fail' : 'Mark Pass'}
                </button>
              </div>
              {isOpen && (
                <div className="px-5 sm:px-6 pb-5">
                  <div className="bg-[#0e1117] rounded-2xl p-4 overflow-x-auto custom-scrollbar border border-slate-800">
                    <pre className="font-mono text-[13px] leading-relaxed text-slate-200 whitespace-pre-wrap"><code>{s.code || '-- (no code stored)'}</code></pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && <div className="p-10 text-center text-sm text-slate-400">No submissions match this filter.</div>}
      </div>
    </div>
  );
}

// ── Content Manager (สร้างเนื้อหา) ──────────────────────────
function ContentManager({ content, onRefresh }) {
  const [draft, setDraft] = useState(null);

  const openNew = () => setDraft({ title: '', moduleId: '02', type: 'article', body: '' });
  const save = () => {
    if (!draft.title.trim()) { alert('Title is required.'); return; }
    saveContent({ ...draft, title: draft.title.trim() });
    setDraft(null);
    onRefresh();
  };
  const remove = (id) => { if (window.confirm('Delete this content item?')) { deleteContent(id); onRefresh(); } };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={ICONS.book}
        title="Learning Content"
        desc="Author lesson notes and reading material — published to students."
        action={<button onClick={openNew} className={btnPrimary}><Icon d={ICONS.plus} className="w-4 h-4" /> New Content</button>}
      />

      {content.length === 0 ? (
        <EmptyState icon={ICONS.book} title="No content yet" hint="Create lesson notes, guides, or reading material tied to a module." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">Module {c.moduleId} · {c.type}</span>
                <div className="flex gap-1.5">
                  <button onClick={() => setDraft(c)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#03045e] hover:bg-blue-50 flex items-center justify-center transition-colors"><Icon d={ICONS.edit} className="w-4 h-4" /></button>
                  <button onClick={() => remove(c.id)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"><Icon d={ICONS.trash} className="w-4 h-4" /></button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 mb-1">{c.title}</h4>
              <p className="text-sm text-slate-500 line-clamp-3 whitespace-pre-wrap">{c.body || 'No description.'}</p>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <Modal
          title={draft.id ? 'Edit Content' : 'New Content'}
          subtitle="Lesson notes / reading material"
          onClose={() => setDraft(null)}
          footer={<>
            <button onClick={() => setDraft(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} className={btnPrimary}>Save Content</button>
          </>}
        >
          <div>
            <label className={labelCls}>Title</label>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Understanding INNER JOIN" className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Module</label>
              <select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })} className={inputCls}>
                {MODULES.map((m) => <option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type</label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className={inputCls}>
                <option value="article">Article</option>
                <option value="note">Note</option>
                <option value="guide">Guide</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Body</label>
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={6} placeholder="Write the lesson content here..." className={inputCls + ' resize-none'} />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Problem & Exam Manager (สร้างโจทย์ / สร้างข้อสอบ) ────────
function ProblemManager({ custom, onRefresh }) {
  const [draft, setDraft] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [q, setQ] = useState('');

  const builtinList = builtinProblems.map((p) => ({ ...p, builtin: true }));
  const all = [...custom.map((p) => ({ ...p, builtin: false })), ...builtinList];
  const rows = all.filter((p) => {
    const matchType = typeFilter === 'all' || p.type === typeFilter;
    const matchQ = !q || (p.title || '').toLowerCase().includes(q.toLowerCase());
    return matchType && matchQ;
  });

  const openNew = (type = 'COURSE') => setDraft({
    type, moduleId: '02', difficulty: 'beginner', table: 'products',
    title: '', description: '', goldenQuery: '', starterCode: 'SELECT ', requirementsText: '',
  });
  const openEdit = (p) => setDraft({ ...p, requirementsText: (p.requirements || []).join('\n') });

  const save = () => {
    if (!draft.title.trim() || !draft.goldenQuery.trim()) { alert('Title and Golden Query are required.'); return; }
    saveCustomProblem({
      id: draft.id,
      type: draft.type,
      moduleId: draft.moduleId,
      title: draft.title.trim(),
      category: draft.category || `Custom · ${draft.type}`,
      difficulty: draft.difficulty,
      description: draft.description,
      table: draft.table,
      goldenQuery: draft.goldenQuery.trim(),
      starterCode: draft.starterCode || 'SELECT ',
      requirements: draft.requirementsText.split('\n').map((s) => s.trim()).filter(Boolean),
    });
    setDraft(null);
    onRefresh();
  };
  const remove = (id) => { if (window.confirm('Delete this problem? Students will no longer see it.')) { deleteCustomProblem(id); onRefresh(); } };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={ICONS.code}
        title="Problems & Exams"
        desc="Author problems and exams — they appear instantly in the student workspace."
        action={<div className="flex gap-2">
          <button onClick={() => openNew('EXAM')} className={btnGhost + ' bg-white border border-slate-200 shadow-sm'}><Icon d={ICONS.plus} className="w-4 h-4" /> New Exam</button>
          <button onClick={() => openNew('COURSE')} className={btnPrimary}><Icon d={ICONS.plus} className="w-4 h-4" /> New Problem</button>
        </div>}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon d={ICONS.search} className="w-4 h-4" /></span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search problems by title..." className={inputCls + ' pl-10'} />
        </div>
        <div className="flex gap-2">
          {['all', 'COURSE', 'ASSIGNMENT', 'EXAM'].map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all outline-none
                ${typeFilter === t ? 'bg-[#03045e] text-white shadow-md' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] divide-y divide-slate-50">
        {rows.map((p) => (
          <div key={(p.builtin ? 'b' : 'c') + p.id} className="px-5 sm:px-6 py-4 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-slate-800 text-sm truncate">{p.title}</p>
                {!p.builtin && <span className="text-[9px] font-bold uppercase tracking-widest text-[#f48c06] bg-[#FF9900]/10 border border-[#FF9900]/20 px-1.5 py-0.5 rounded">Custom</span>}
              </div>
              <p className="text-xs text-slate-400 truncate">Module {p.moduleId} · table {p.table || '—'}</p>
            </div>
            <span className={`hidden sm:inline shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${TYPE_STYLES[p.type] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>{p.type}</span>
            <span className={`hidden md:inline shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${DIFF_STYLES[p.difficulty] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>{p.difficulty || 'n/a'}</span>
            {p.builtin ? (
              <span className="shrink-0 text-[10px] font-semibold text-slate-300 uppercase tracking-widest w-[72px] text-right">Built-in</span>
            ) : (
              <div className="shrink-0 flex gap-1.5 w-[72px] justify-end">
                <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#03045e] hover:bg-blue-50 flex items-center justify-center transition-colors"><Icon d={ICONS.edit} className="w-4 h-4" /></button>
                <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"><Icon d={ICONS.trash} className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        ))}
        {rows.length === 0 && <div className="p-10 text-center text-sm text-slate-400">No problems match this filter.</div>}
      </div>

      {draft && (
        <Modal
          wide
          title={draft.id ? 'Edit Problem' : draft.type === 'EXAM' ? 'Create Exam' : 'Create Problem'}
          subtitle="Publishes to the live student workspace"
          onClose={() => setDraft(null)}
          footer={<>
            <button onClick={() => setDraft(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} className={btnAccent}>{draft.id ? 'Save Changes' : 'Publish'}</button>
          </>}
        >
          <div>
            <label className={labelCls}>Problem Title</label>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Select Active Customers" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} rows={2} placeholder="Explain the task for the student..." className={inputCls + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>Type</label>
              <select value={draft.type} onChange={(e) => setDraft({ ...draft, type: e.target.value })} className={inputCls}>
                <option value="COURSE">COURSE</option>
                <option value="ASSIGNMENT">ASSIGNMENT</option>
                <option value="EXAM">EXAM</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Module</label>
              <select value={draft.moduleId} onChange={(e) => setDraft({ ...draft, moduleId: e.target.value })} className={inputCls}>
                {MODULES.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Difficulty</label>
              <select value={draft.difficulty} onChange={(e) => setDraft({ ...draft, difficulty: e.target.value })} className={inputCls}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Main Table</label>
              <select value={draft.table} onChange={(e) => setDraft({ ...draft, table: e.target.value })} className={inputCls}>
                {TABLES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>Requirements <span className="normal-case tracking-normal text-slate-400 font-medium">(one per line)</span></label>
            <textarea value={draft.requirementsText} onChange={(e) => setDraft({ ...draft, requirementsText: e.target.value })} rows={3} placeholder={'ใช้คำสั่ง SELECT\nกรองข้อมูลด้วย WHERE'} className={inputCls + ' resize-none'} />
          </div>
          <div>
            <label className={labelCls}>Golden Query <span className="normal-case tracking-normal text-slate-400 font-medium">(expected answer)</span></label>
            <div className="bg-[#0e1117] rounded-xl overflow-hidden border border-slate-800">
              <textarea value={draft.goldenQuery} onChange={(e) => setDraft({ ...draft, goldenQuery: e.target.value })} rows={4} placeholder="SELECT * FROM products;" className="w-full bg-transparent p-4 font-mono text-[13px] text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none" />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Announcement Manager ────────────────────────────────────
function AnnouncementManager({ items, onRefresh, author }) {
  const [draft, setDraft] = useState(null);

  const openNew = () => setDraft({ title: '', body: '', priority: 'medium', pinned: false });
  const save = () => {
    if (!draft.title.trim()) { alert('Title is required.'); return; }
    saveAnnouncement({ ...draft, title: draft.title.trim(), author });
    setDraft(null);
    onRefresh();
  };
  const remove = (id) => { if (window.confirm('Delete this announcement?')) { deleteAnnouncement(id); onRefresh(); } };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={ICONS.mega}
        title="Announcements"
        desc="Posted announcements are shown to students on their dashboard."
        action={<button onClick={openNew} className={btnAccent}><Icon d={ICONS.plus} className="w-4 h-4" /> New Announcement</button>}
      />

      {items.length === 0 ? (
        <EmptyState icon={ICONS.mega} title="No announcements" hint="Post class updates, deadlines, or exam openings for students to see." />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex items-start gap-4">
              <span className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${a.priority === 'high' ? 'bg-rose-500' : a.priority === 'low' ? 'bg-emerald-500' : 'bg-[#f48c06]'}`}></span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-slate-800">{a.title}</h4>
                  {a.pinned && <span className="text-[9px] font-bold uppercase tracking-widest text-[#03045e] bg-[#03045e]/5 border border-[#03045e]/10 px-1.5 py-0.5 rounded">Pinned</span>}
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border ${a.priority === 'high' ? 'bg-rose-50 border-rose-200 text-rose-600' : a.priority === 'low' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>{a.priority}</span>
                </div>
                <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{a.body}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => setDraft(a)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#03045e] hover:bg-blue-50 flex items-center justify-center transition-colors"><Icon d={ICONS.edit} className="w-4 h-4" /></button>
                <button onClick={() => remove(a.id)} className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"><Icon d={ICONS.trash} className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft && (
        <Modal
          title={draft.id ? 'Edit Announcement' : 'New Announcement'}
          onClose={() => setDraft(null)}
          footer={<>
            <button onClick={() => setDraft(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} className={btnAccent}>Post</button>
          </>}
        >
          <div>
            <label className={labelCls}>Title</label>
            <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Exam Module 05 is now open" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Message</label>
            <textarea value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={4} placeholder="Write your announcement..." className={inputCls + ' resize-none'} />
          </div>
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelCls}>Priority</label>
              <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value })} className={inputCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <label className="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer select-none">
              <input type="checkbox" checked={!!draft.pinned} onChange={(e) => setDraft({ ...draft, pinned: e.target.checked })} className="w-4 h-4 accent-[#03045e]" />
              <span className="text-sm font-semibold text-slate-600">Pin to top</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Students / Roster (per-student progress) ────────────────
function Students({ submissions }) {
  const [q, setQ] = useState('');
  const [openId, setOpenId] = useState(null);

  const roster = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      const id = String(s.userId);
      let r = map.get(id);
      if (!r) { r = { userId: id, subs: 0, passed: 0, problems: new Set(), modules: new Set(), exams: 0, last: 0 }; map.set(id, r); }
      r.subs += 1;
      if (s.passed) r.passed += 1;
      r.problems.add(`${s.mode}-${s.modId}-${s.step}`);
      r.modules.add(s.modId);
      if (s.mode === 'EXAM') r.exams += 1;
      const t = s.submittedAt || Date.parse(s.timestamp) || 0;
      if (t > r.last) r.last = t;
    });
    return [...map.values()]
      .map((r) => ({ ...r, problems: r.problems.size, modules: r.modules.size, passRate: r.subs ? Math.round((r.passed / r.subs) * 100) : 0 }))
      .sort((a, b) => b.last - a.last);
  }, [submissions]);

  const filtered = roster.filter((r) => !q || r.userId.toLowerCase().includes(q.toLowerCase()));
  const detail = useMemo(
    () => (openId ? submissions.filter((s) => String(s.userId) === openId).sort((a, b) => (b.submittedAt || Date.parse(b.timestamp) || 0) - (a.submittedAt || Date.parse(a.timestamp) || 0)) : []),
    [openId, submissions]
  );

  if (roster.length === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader icon={ICONS.users} title="Students" desc="Per-student progress from recorded submissions." />
        <EmptyState icon={ICONS.users} title="No students yet" hint="Once students submit answers in this browser, their progress appears here." />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader icon={ICONS.users} title="Students" desc="Per-student progress from recorded submissions." />
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Icon d={ICONS.search} className="w-4 h-4" /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search student ID..." className={inputCls + ' pl-10'} />
      </div>
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] divide-y divide-slate-50">
        {filtered.map((r) => (
          <button key={r.userId} onClick={() => setOpenId(r.userId)} className="w-full px-5 sm:px-6 py-4 flex items-center gap-4 text-left hover:bg-slate-50/60 transition-colors outline-none">
            <div className="w-10 h-10 rounded-full bg-[#03045e]/10 text-[#03045e] flex items-center justify-center font-bold shrink-0 uppercase">{r.userId.slice(0, 2)}</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">Student {r.userId}</p>
              <p className="text-xs text-slate-400 truncate">{r.problems} problems · {r.modules} modules · {r.exams} exam subs · last {r.last ? new Date(r.last).toLocaleDateString() : '—'}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-slate-900 tabular-nums">{r.passRate}%</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{r.passed}/{r.subs} pass</p>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="p-10 text-center text-sm text-slate-400">No students match.</div>}
      </div>

      {openId && (
        <Modal wide title={`Student ${openId}`} subtitle={`${detail.length} submission${detail.length !== 1 ? 's' : ''}`} onClose={() => setOpenId(null)} footer={<button onClick={() => setOpenId(null)} className={btnGhost}>Close</button>}>
          <div className="space-y-2.5">
            {detail.map((s, i) => (
              <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-2.5 flex items-center gap-3 bg-slate-50/60">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{s.mode} · Module {s.modId} · Q{s.step}</span>
                  <span className="text-[11px] text-slate-400 shrink-0">{s.timestamp || '—'}</span>
                </div>
                <pre className="bg-[#0e1117] p-3.5 overflow-x-auto custom-scrollbar text-[12.5px] font-mono text-slate-200 whitespace-pre-wrap"><code>{s.code || '-- (no code)'}</code></pre>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Analytics (class performance from submissions) ──────────
function Analytics({ submissions }) {
  const a = useMemo(() => {
    const total = submissions.length;
    const passed = submissions.filter((s) => s.passed).length;
    const students = new Set(submissions.map((s) => String(s.userId))).size;
    const durations = submissions.map((s) => s.durationMs).filter((d) => typeof d === 'number');
    const avgMs = durations.length ? Math.round(durations.reduce((x, y) => x + y, 0) / durations.length) : null;

    const byModule = {};
    const byMode = { COURSE: 0, ASSIGNMENT: 0, EXAM: 0 };
    const probMap = new Map();
    submissions.forEach((s) => {
      byModule[s.modId] = byModule[s.modId] || { total: 0, passed: 0 };
      byModule[s.modId].total += 1;
      if (s.passed) byModule[s.modId].passed += 1;
      if (byMode[s.mode] != null) byMode[s.mode] += 1;
      const pk = `${s.mode}|${s.modId}|${s.step}`;
      const p = probMap.get(pk) || { mode: s.mode, modId: s.modId, step: s.step, total: 0, passed: 0 };
      p.total += 1;
      if (s.passed) p.passed += 1;
      probMap.set(pk, p);
    });
    const modules = Object.entries(byModule)
      .map(([id, v]) => ({ id, ...v, rate: v.total ? Math.round((v.passed / v.total) * 100) : 0 }))
      .sort((x, y) => x.id.localeCompare(y.id));
    const hardest = [...probMap.values()]
      .map((p) => ({ ...p, rate: p.total ? Math.round((p.passed / p.total) * 100) : 0 }))
      .sort((x, y) => x.rate - y.rate || y.total - x.total)
      .slice(0, 8);
    return { total, passed, students, avgMs, modules, byMode, hardest, passRate: total ? Math.round((passed / total) * 100) : 0 };
  }, [submissions]);

  if (a.total === 0) {
    return (
      <div className="space-y-5">
        <SectionHeader icon={ICONS.chart} title="Analytics" desc="Class performance from recorded submissions." />
        <EmptyState icon={ICONS.chart} title="No data yet" hint="Analytics populate as students submit answers." />
      </div>
    );
  }

  const Bar = ({ label, note, rate, tone = '#03045e' }) => (
    <div>
      <div className="flex justify-between text-xs mb-1 gap-3">
        <span className="font-semibold text-slate-600 truncate">{label}</span>
        <span className="text-slate-400 tabular-nums shrink-0">{rate}%{note ? ` · ${note}` : ''}</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${rate}%`, background: tone }}></div></div>
    </div>
  );

  const stat = [
    { label: 'Submissions', value: a.total },
    { label: 'Students', value: a.students },
    { label: 'Pass Rate', value: `${a.passRate}%` },
    { label: 'Avg Verify', value: a.avgMs != null ? `${a.avgMs} ms` : '—' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader icon={ICONS.chart} title="Analytics" desc="Class performance from recorded submissions." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stat.map((c) => (
          <div key={c.label} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">{c.value}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
          <h3 className="font-bold text-slate-800">Pass Rate by Module</h3>
          {a.modules.map((m) => <Bar key={m.id} label={`Module ${m.id} · ${moduleName(m.id)}`} note={`${m.passed}/${m.total}`} rate={m.rate} />)}
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] space-y-4">
          <h3 className="font-bold text-slate-800">Hardest Problems <span className="text-xs font-medium text-slate-400">(lowest pass rate)</span></h3>
          {a.hardest.map((p, i) => <Bar key={i} label={`${p.mode} · M${p.modId} · Q${p.step}`} note={`${p.passed}/${p.total}`} rate={p.rate} tone="#e11d48" />)}
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        <h3 className="font-bold text-slate-800 mb-4">Submissions by Type</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(a.byMode).map(([k, v]) => (
            <div key={k} className={`rounded-2xl p-4 border ${TYPE_STYLES[k] || 'bg-slate-50 border-slate-200 text-slate-500'}`}>
              <p className="text-2xl font-bold tabular-nums">{v}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest mt-1">{k}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Exam Control (per-module schedule + time limit) ─────────
function ExamControl({ custom, examConfigs, onRefresh }) {
  const [draft, setDraft] = useState(null); // { moduleId, openAt, closeAt, timeLimitMin }

  const examCount = (modId) =>
    builtinProblems.filter((p) => p.type === 'EXAM' && p.moduleId === modId).length +
    custom.filter((p) => p.type === 'EXAM' && p.moduleId === modId).length;

  // epoch ms ↔ <input type="datetime-local"> local wall-clock string
  const toInput = (ms) => {
    if (!ms) return '';
    return new Date(ms - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const fromInput = (str) => (str ? new Date(str).getTime() : null);
  const fmt = (ms) => (ms ? new Date(ms).toLocaleString() : '—');

  const openEdit = (modId) => {
    const c = examConfigs[modId] || {};
    setDraft({ moduleId: modId, openAt: c.openAt || null, closeAt: c.closeAt || null, timeLimitMin: c.timeLimitMin || 60 });
  };
  const save = () => {
    setExamConfig(draft.moduleId, {
      openAt: draft.openAt || null,
      closeAt: draft.closeAt || null,
      timeLimitMin: draft.timeLimitMin ? Number(draft.timeLimitMin) : null,
    });
    setDraft(null);
    onRefresh();
  };
  const clearCfg = (modId) => { if (window.confirm('Clear the exam schedule for this module?')) { setExamConfig(modId, null); onRefresh(); } };

  return (
    <div className="space-y-4">
      <SectionHeader icon={ICONS.doc} title="Exam Control" desc="Schedule open / close windows and a time limit per module exam — enforced live in the student workspace." />
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.03)] divide-y divide-slate-50">
        {MODULES.map((m) => {
          const c = examConfigs[m.id];
          const n = examCount(m.id);
          const scheduled = !!c && (c.openAt || c.closeAt || c.timeLimitMin);
          return (
            <div key={m.id} className="px-5 sm:px-6 py-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm truncate">Module {m.id} · {m.name}</p>
                <p className="text-xs text-slate-400 truncate">
                  {n} exam problem{n !== 1 ? 's' : ''}
                  {scheduled ? ` · opens ${fmt(c.openAt)} · closes ${fmt(c.closeAt)} · limit ${c.timeLimitMin || '—'} min` : ' · no schedule (open, 60 min default)'}
                </p>
              </div>
              <span className={`hidden sm:inline shrink-0 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md border ${scheduled ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                {scheduled ? 'Scheduled' : 'Default'}
              </span>
              <button onClick={() => openEdit(m.id)} className="shrink-0 text-xs font-bold text-[#03045e] hover:underline">Edit</button>
              {scheduled && (
                <button onClick={() => clearCfg(m.id)} className="shrink-0 w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"><Icon d={ICONS.trash} className="w-4 h-4" /></button>
              )}
            </div>
          );
        })}
      </div>

      {draft && (
        <Modal
          title={`Exam Schedule · Module ${draft.moduleId}`}
          subtitle="Applies live to the student exam workspace"
          onClose={() => setDraft(null)}
          footer={<>
            <button onClick={() => setDraft(null)} className={btnGhost}>Cancel</button>
            <button onClick={save} className={btnAccent}>Save Schedule</button>
          </>}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Opens At</label>
              <input type="datetime-local" value={toInput(draft.openAt)} onChange={(e) => setDraft({ ...draft, openAt: fromInput(e.target.value) })} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Closes At</label>
              <input type="datetime-local" value={toInput(draft.closeAt)} onChange={(e) => setDraft({ ...draft, closeAt: fromInput(e.target.value) })} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Time Limit <span className="normal-case tracking-normal text-slate-400 font-medium">(minutes)</span></label>
            <input type="number" min="1" value={draft.timeLimitMin || ''} onChange={(e) => setDraft({ ...draft, timeLimitMin: e.target.value })} placeholder="60" className={inputCls} />
          </div>
          <p className="text-xs text-slate-400">Leave a field empty to disable that rule. The time limit counts from the moment each student starts the module exam.</p>
        </Modal>
      )}
    </div>
  );
}
