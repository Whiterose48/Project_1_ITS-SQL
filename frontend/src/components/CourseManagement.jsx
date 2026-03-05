import React, { useState } from 'react';

const MOCK_COURSES = [
  { 
    id: '06070999', 
    name: 'DATABASE CONCEPT SYSTEM', 
    code: 'ITSSQL2025',
    students: 48,
    modules: 5,
    status: 'active',
    semester: '2/2567',
    instructor: 'ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช',
    tas: ['นายพชร พรอโนทัย', 'นายณัฐวีร์ เเนวกำพล'],
    datasets: ['bikestore_mysql.sql']
  }
];

const MOCK_MODULES = [
  { id: '01', name: 'Database Fundamentals', problems: 1, type: 'COURSE', status: 'published' },
  { id: '02', name: 'SELECT Statement', problems: 12, type: 'COURSE', status: 'published' },
  { id: '03', name: 'SELECT with Conditions', problems: 12, type: 'COURSE', status: 'published' },
  { id: '05', name: 'JOIN Operations', problems: 12, type: 'COURSE', status: 'published' },
];

export default function CourseManagement({ onNavigate }) {
  const [activeView, setActiveView] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showDatasetModal, setShowDatasetModal] = useState(false);

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 pt-8 px-4 sm:px-6 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <button onClick={() => onNavigate('instructor')} className="cursor-pointer text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
            ← Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase">Course Management</h1>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
          + Create Course
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex overflow-x-auto bg-white border-[4px] border-slate-900 rounded-2xl shadow-[6px_6px_0px_0px_#000] scrollbar-hide">
        {[
          { id: 'courses', label: 'Courses', icon: '📚' },
          { id: 'modules', label: 'Modules', icon: '📦' },
          { id: 'datasets', label: 'Datasets', icon: '🗄️' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)}
            className={`cursor-pointer flex-1 min-w-[110px] py-4 font-black uppercase tracking-[0.1em] sm:tracking-[0.15em] text-xs sm:text-sm border-r-[3px] last:border-r-0 border-slate-900 transition-all flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap
              ${activeView === tab.id ? 'bg-[#000066] text-white' : 'bg-transparent text-slate-500 hover:bg-slate-50'}`}>
            <span>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {/* Courses View */}
      {activeView === 'courses' && (
        <div className="space-y-6">
          {MOCK_COURSES.map((course) => (
            <div key={course.id} className="relative">
              <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
              <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
                <div className="bg-[#000066] p-8 border-b-[4px] border-slate-900 text-white">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="bg-emerald-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border-2 border-slate-900">{course.status}</span>
                        <span className="bg-white/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{course.semester}</span>
                      </div>
                      <h3 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter">{course.name}</h3>
                      <p className="font-mono text-sm text-blue-200">ID: {course.id} | Code: {course.code}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button className="cursor-pointer bg-white text-[#000066] px-5 py-2.5 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-all">Edit</button>
                      <button className="cursor-pointer bg-[#FF9900] text-[#000066] px-5 py-2.5 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-all">Manage</button>
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[
                      { label: 'Enrolled', value: course.students, icon: '👥' },
                      { label: 'Modules', value: course.modules, icon: '📦' },
                      { label: 'Datasets', value: course.datasets.length, icon: '🗄️' },
                      { label: 'TAs', value: course.tas.length, icon: '🎓' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-slate-50 border-[3px] border-slate-200 rounded-xl p-4 text-center">
                        <span className="text-2xl">{stat.icon}</span>
                        <p className="font-black font-mono text-2xl text-slate-900 mt-1">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Instructor</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 border-[3px] border-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-[2px_2px_0px_0px_#000]">KA</div>
                        <p className="font-bold text-slate-800">{course.instructor}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Teaching Assistants</p>
                      <div className="space-y-2">
                        {course.tas.map((ta, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-500 border-2 border-slate-900 rounded-lg flex items-center justify-center text-white font-black text-xs">{ta.charAt(3)}</div>
                            <p className="font-bold text-sm text-slate-700">{ta}</p>
                          </div>
                        ))}
                        <button className="cursor-pointer text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">+ Add TA</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modules View */}
      {activeView === 'modules' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Curriculum Modules</h3>
            <button onClick={() => setShowModuleModal(true)} className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
              + Add Module
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative">
              <div className="overflow-x-auto">
              <div className="min-w-[650px]">
              <div className="bg-slate-900 px-8 py-4 grid grid-cols-12 text-white text-[10px] font-black uppercase tracking-widest">
                <div className="col-span-1">ID</div>
                <div className="col-span-4">Module Name</div>
                <div className="col-span-2">Problems</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-1">Actions</div>
              </div>
              <div className="divide-y-2 divide-slate-100">
                {MOCK_MODULES.map((mod) => (
                  <div key={mod.id} className="px-8 py-5 grid grid-cols-12 items-center hover:bg-slate-50 transition-colors">
                    <div className="col-span-1">
                      <span className="font-mono font-black text-slate-900">{mod.id}</span>
                    </div>
                    <div className="col-span-4">
                      <p className="font-black text-slate-900">{mod.name}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="bg-blue-50 border-2 border-blue-200 text-blue-700 text-xs font-black px-3 py-1 rounded-lg">{mod.problems} problems</span>
                    </div>
                    <div className="col-span-2">
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase">{mod.type}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border-2 ${
                        mod.status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                      }`}>{mod.status}</span>
                    </div>
                    <div className="col-span-1 flex gap-2">
                      <button className="cursor-pointer w-8 h-8 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-blue-50 hover:border-blue-300 transition-colors">✏️</button>
                      <button className="cursor-pointer w-8 h-8 bg-slate-100 border-2 border-slate-200 rounded-lg flex items-center justify-center text-sm hover:bg-red-50 hover:border-red-300 transition-colors">🗑️</button>
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

      {/* Datasets View */}
      {activeView === 'datasets' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">SQL Datasets</h3>
            <button onClick={() => setShowDatasetModal(true)} className="cursor-pointer bg-[#FF9900] text-[#000066] border-[3px] border-slate-900 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 transition-all">
              + Upload Dataset
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-[3px] border-slate-900 rounded-2xl overflow-hidden shadow-[5px_5px_0px_0px_#000]">
                  <div className="bg-emerald-500 px-6 py-4 border-b-[3px] border-slate-900 flex items-center justify-between">
                    <h4 className="text-white font-black uppercase tracking-widest text-sm">bikestore_mysql.sql</h4>
                    <span className="bg-white text-slate-900 text-[10px] font-black px-3 py-1 rounded-full border-2 border-slate-900">Active</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="font-black font-mono text-2xl text-slate-900">10</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tables</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-3 text-center">
                        <p className="font-black font-mono text-2xl text-slate-900">81</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Problems</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tables</p>
                      <div className="flex flex-wrap gap-2">
                        {['products', 'brands', 'categories', 'customers', 'orders', 'order_items', 'staffs', 'stores', 'stocks', 'users'].map(t => (
                          <span key={t} className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black px-2 py-1 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button className="cursor-pointer flex-1 bg-slate-900 text-white py-2.5 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-colors">Download</button>
                      <button className="cursor-pointer flex-1 bg-white py-2.5 rounded-xl border-[3px] border-slate-900 font-black uppercase text-[10px] tracking-widest shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-all">Preview</button>
                    </div>
                  </div>
                </div>

                {/* Add Dataset Card */}
                <button onClick={() => setShowDatasetModal(true)} 
                  className="cursor-pointer border-[3px] border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all min-h-[300px]">
                  <span className="text-4xl sm:text-5xl">📁</span>
                  <p className="font-black uppercase tracking-widest text-sm">Add New Dataset</p>
                  <p className="text-xs font-bold">Upload .sql file or paste schema</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeView === 'settings' && (
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-2 translate-y-2"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl overflow-hidden relative p-8 space-y-8">
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Course Settings</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Course Name</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold focus:outline-none focus:border-[#FF9900]" defaultValue="DATABASE CONCEPT SYSTEM" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Access Code</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold font-mono focus:outline-none focus:border-[#FF9900]" defaultValue="ITSSQL2025" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Semester</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold focus:outline-none focus:border-[#FF9900]" defaultValue="2/2567" />
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Max Students</label>
                  <input className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold font-mono focus:outline-none focus:border-[#FF9900]" defaultValue="60" type="number" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Grading Rules</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Auto-Grade Submissions', desc: 'Automatically verify SQL queries', checked: true },
                    { label: 'Enforce Semicolons', desc: 'Require queries to end with ;', checked: true },
                    { label: 'Case-Insensitive', desc: 'Ignore column name casing', checked: true },
                  ].map((rule, i) => (
                    <div key={i} className="bg-slate-50 border-[3px] border-slate-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-sm text-slate-900">{rule.label}</p>
                        <div className={`w-12 h-6 rounded-full border-[3px] border-slate-900 relative cursor-pointer ${rule.checked ? 'bg-emerald-400' : 'bg-slate-200'}`}>
                          <div className={`absolute w-4 h-4 bg-white border-2 border-slate-900 rounded-full top-[-1px] transition-all ${rule.checked ? 'right-[-1px]' : 'left-[-1px]'}`}></div>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{rule.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button className="cursor-pointer bg-slate-900 text-white px-8 py-4 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
                  Save Changes
                </button>
                <button className="cursor-pointer bg-red-500 text-white px-8 py-4 rounded-xl border-[3px] border-slate-900 font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#000] hover:-translate-y-1 transition-all">
                  Export Grades
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full">
            <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 translate-y-3"></div>
            <div className="bg-white border-[4px] border-slate-900 rounded-3xl p-10 relative space-y-6">
              <button onClick={() => setShowCreateModal(false)} className="cursor-pointer absolute -top-4 -right-4 bg-white border-[3px] border-slate-900 w-10 h-10 rounded-xl font-black text-xl hover:bg-red-500 hover:text-white shadow-[4px_4px_0px_0px_#000]">✕</button>
              <h3 className="text-2xl font-black uppercase tracking-tighter">Create New Course</h3>
              <div className="space-y-4">
                <input placeholder="Course Name" className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]" />
                <input placeholder="Course ID (e.g. 06070999)" className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold font-mono placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]" />
                <input placeholder="Access Code" className="w-full bg-slate-50 border-[3px] border-slate-900 p-4 rounded-xl font-bold font-mono placeholder:text-slate-300 focus:outline-none focus:border-[#FF9900]" />
                <button className="cursor-pointer w-full bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-[5px_5px_0px_0px_#FF9900] hover:-translate-y-1 transition-all">
                  Create Course
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
