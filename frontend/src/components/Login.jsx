import React, { useState, useEffect } from 'react';
import Button from './ui/Button';

const ROLE_OPTIONS = [
  { id: 'student',    label: 'Student',            labelTh: 'นักศึกษา',        icon: '🎓', color: 'bg-blue-500',    desc: 'เรียนและทำแบบฝึกหัด SQL' },
  { id: 'ta',         label: 'Teaching Assistant', labelTh: 'ผู้ช่วยสอน (TA)', icon: '📋', color: 'bg-emerald-500', desc: 'ตรวจงานและช่วยดูแลนักศึกษา' },
  { id: 'instructor', label: 'Instructor',          labelTh: 'อาจารย์',          icon: '👨‍🏫', color: 'bg-purple-600', desc: 'จัดการคอร์สและโจทย์ทั้งหมด' },
];

// ── เปลี่ยนจาก Module (ภาษา) → สาขาวิชา ─────────────────────
const BRANCHES = [
  { id: 'dsba', label: 'DSBA', icon: '📊', desc: 'Data Science & Business Analytics' },
  { id: 'it',   label: 'IT',   icon: '💻', desc: 'Information Technology' },
  { id: 'ait',  label: 'AIT',  icon: '🤖', desc: 'Artificial Intelligence & Technology' },
];

// ── Authorized Instructors ─────────────────────────────────────
const AUTHORIZED_INSTRUCTORS = [
  'ผศ.ดร.กนกวรรณ อัจฉริยะชาญวณิช',
  'ดร.ศิรสิทธิ์ โล่ชนะจิต',
  'นายพชร พรอโนทัย',
  'นายณัฐวีร์ เแนกำพล',
];

// ── Mock auth helper (ใช้เมื่อ server ไม่ตอบสนอง) ────────────
const mockAuth = (type, payload) => {
  const fakeToken = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const fakeUser  = {
    username: payload.username,
    name:     payload.name     || payload.username,
    email:    payload.email    || `${payload.username}@kmitl.ac.th`,
    role:     payload.role     || 'student',
    branches: payload.branches || [],
  };
  return { success: true, token: fakeToken, user: fakeUser };
};

export default function Login({ onLogin, onClose, loginError }) {
  // ── mode & step ──────────────────────────────────────────────
  const [mode, setMode] = useState('login');   // 'login' | 'register'
  const [step, setStep] = useState(1);         // register: 1=creds, 2=profile

  // ── UI ───────────────────────────────────────────────────────
  const [isLoading,  setIsLoading]  = useState(false);
  const [shake,      setShake]      = useState(false);
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');

  // ── form ─────────────────────────────────────────────────────
  const [username,          setUsername]          = useState('');
  const [password,          setPassword]          = useState('');
  const [email,             setEmail]             = useState('');
  const [name,              setName]              = useState('');
  const [selectedRole,      setSelectedRole]      = useState('student');
  const [selectedBranches,  setSelectedBranches]  = useState([]);
  const [selectedInstructorName, setSelectedInstructorName] = useState('');

  // ── typing animation (footer) ────────────────────────────────
  const [displayText, setDisplayText] = useState('');
  const [isDeleting,  setIsDeleting]  = useState(false);
  const [loopNum,     setLoopNum]     = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const greetings = ['สวัสดี', 'Hello', 'こんにちは', 'Bonjour', 'Hola', '안녕하세요', 'Ciao'];

  useEffect(() => {
    const handleTyping = () => {
      const i        = loopNum % greetings.length;
      const fullText = greetings[i];
      setDisplayText(isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1)
      );
      setTypingSpeed(isDeleting ? 80 : 150);
      if (!isDeleting && displayText === fullText) setTimeout(() => setIsDeleting(true), 1500);
      else if (isDeleting && displayText === '') { setIsDeleting(false); setLoopNum(loopNum + 1); }
    };
    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed]);

  useEffect(() => {
    if (loginError) triggerError(loginError);
  }, [loginError]);

  // ── helpers ───────────────────────────────────────────────────
  const triggerError = (msg) => {
    setError(msg); setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const toggleBranch = (id) =>
    setSelectedBranches(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );

  const switchMode = (m) => {
    setMode(m); setStep(1); setError('');
    setUsername(''); setPassword(''); setEmail(''); setName('');
    setSelectedRole('student'); setSelectedBranches([]);
    setSelectedInstructorName('');
  };

  // ── LOGIN ─────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!username || !password) { triggerError('กรุณากรอก Username และ Password'); return; }
    setIsLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      // 404 / 500 / server ไม่มี endpoint → fallback mock
      if (res.status === 404 || res.status >= 500) {
        const data = mockAuth('login', { username, role: selectedRole });
        localStorage.setItem('its_token', data.token);
        onLogin(data.user);
      } else {
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem('its_token', data.token);
          onLogin(data.user);
        } else {
          triggerError(data.detail || 'Username หรือ Password ไม่ถูกต้อง');
        }
      }
    } catch {
      // network error / CORS / server ไม่ตอบ
      const data = mockAuth('login', { username, role: selectedRole });
      localStorage.setItem('its_token', data.token);
      onLogin(data.user);
    }
    setIsLoading(false);
  };

  // ── REGISTER step 1 → 2 ───────────────────────────────────────
  const handleRegisterNext = () => {
    if (!username)           { triggerError('กรุณากรอก Username'); return; }
    if (!password)           { triggerError('กรุณากรอก Password'); return; }
    if (password.length < 6) { triggerError('Password ต้องมีอย่างน้อย 6 ตัวอักษร'); return; }
    if (!email)              { triggerError('กรุณากรอก Email'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { triggerError('รูปแบบ Email ไม่ถูกต้อง'); return; }
    setError(''); setStep(2);
  };

  // ── REGISTER step 2 submit ────────────────────────────────────
  const handleRegister = async () => {
    if (selectedRole === 'instructor') {
      if (!selectedInstructorName) { triggerError('กรุณาเลือกชื่ออาจารย์'); return; }
    } else {
      if (!name.trim())                  { triggerError('กรุณากรอกชื่อ-นามสกุล'); return; }
      if (selectedBranches.length === 0) { triggerError('กรุณาเลือกอย่างน้อย 1 สาขา'); return; }
    }
    setIsLoading(true); setError('');
    try {
      const finalName = selectedRole === 'instructor' ? selectedInstructorName : name;
      const finalBranches = selectedRole === 'instructor' ? [] : selectedBranches;
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email, name: finalName, role: selectedRole, modules: finalBranches }),
      });
      // 404 / 500 / server ไม่มี endpoint → fallback mock
      if (res.status === 404 || res.status >= 500) {
        const data = mockAuth('register', { username, email, name: finalName, role: selectedRole, modules: selectedBranches });
        localStorage.setItem('its_token', data.token);
        onLogin(data.user);
      } else {
        const data = await res.json();
        if (res.ok && data.success) {
          localStorage.setItem('its_token', data.token);
          onLogin(data.user);
        } else {
          triggerError(data.detail || 'ลงทะเบียนไม่สำเร็จ');
          setStep(1);
        }
      }
    } catch {
      // network error / CORS / server ไม่ตอบ
      const finalName = selectedRole === 'instructor' ? selectedInstructorName : name;
      const finalBranches = selectedRole === 'instructor' ? [] : selectedBranches;
      const data = mockAuth('register', { username, email, name: finalName, role: selectedRole, modules: finalBranches });
      localStorage.setItem('its_token', data.token);
      onLogin(data.user);
    }
    setIsLoading(false);
  };

  const activeRole = ROLE_OPTIONS.find(r => r.id === selectedRole);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="relative max-w-lg w-full">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 sm:translate-x-4 translate-y-3 sm:translate-y-4"></div>
        <div className="bg-white border-[4px] sm:border-[5px] border-slate-900 rounded-3xl relative overflow-hidden animate-in zoom-in-95 duration-300">

          {/* ── Header ── */}
          <div className="bg-[#000066] border-b-[4px] sm:border-b-[5px] border-slate-900 p-4 sm:p-6 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#FF9900] rounded-full border-2 border-slate-900"></div>
                <span className="text-[8px] sm:text-[10px] font-black text-[#FF9900] uppercase tracking-[0.2em] sm:tracking-[0.3em]">System Authentication</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter">Login <span className="text-[#FF9900]">Portal</span></h3>
            </div>
            <button onClick={onClose} className="cursor-pointer bg-white hover:bg-red-500 hover:text-white text-slate-900 border-[3px] border-slate-900 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none z-20">
              <span className="text-xl sm:text-2xl font-black">✕</span>
            </button>
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_11px)]"></div>
          </div>

          {/* ── Body ── */}
          <div className="p-6 sm:p-10 space-y-5 sm:space-y-6">

            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 border-[3px] border-slate-900">
              {[{ key: 'login', label: 'เข้าสู่ระบบ' }, { key: 'register', label: 'ลงทะเบียน' }].map(({ key, label }) => (
                <button key={key} onClick={() => switchMode(key)}
                  className={`flex-1 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all
                    ${mode === key ? 'bg-[#000066] text-[#FF9900] shadow-[3px_3px_0px_0px_#FF9900]' : 'text-slate-400 hover:text-slate-700'}`}>
                  {label}
                </button>
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className={`bg-red-50 border-[3px] border-red-400 rounded-2xl p-3 sm:p-4 flex items-center gap-3 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <div className="bg-red-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-red-700 font-bold">{error}</p>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 1 — Role + Username + Password + Email
            ══════════════════════════════════════════ */}
            {step === 1 && (
              <div className="space-y-5">

                {/* Role selector */}
                <div className="space-y-3">
                  <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest text-center">เลือก Role ของคุณ</p>
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    {ROLE_OPTIONS.map((role) => {
                      const isActive = selectedRole === role.id;
                      return (
                        <button key={role.id} onClick={() => setSelectedRole(role.id)}
                          className={`cursor-pointer relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-[3px] transition-all duration-200
                            ${isActive
                              ? `${role.color} text-white border-slate-900 shadow-[4px_4px_0px_0px_#000] -translate-y-1 scale-[1.03]`
                              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'}`}>
                          <span className="text-2xl sm:text-3xl mb-1">{role.icon}</span>
                          <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-900'}`}>
                            {role.label === 'Teaching Assistant' ? 'TA' : role.label}
                          </span>
                          <span className={`text-[9px] sm:text-xs font-bold mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{role.labelTh}</span>
                          {isActive && (
                            <div className="absolute -top-2 -right-2 bg-white text-slate-900 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[2px] border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                              <span className="text-[10px] sm:text-xs">✓</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {activeRole && <p className="text-center text-[10px] sm:text-xs font-bold text-slate-400 mt-1">{activeRole.desc}</p>}
                </div>

                {/* Username */}
                <InputField label="Username" icon="👤"
                  placeholder={selectedRole === 'student' ? 'รหัสนักศึกษา เช่น 66070126' : 'Username'}
                  value={username} onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegisterNext())}
                />

                {/* Password */}
                <InputField label="Password" icon="🔒" type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegisterNext())}
                  right={
                    <button onClick={() => setShowPass(v => !v)} className="text-xs font-black text-slate-400 hover:text-slate-700 uppercase transition-colors">
                      {showPass ? 'ซ่อน' : 'แสดง'}
                    </button>
                  }
                />

                {/* Email — register only */}
                {mode === 'register' && (
                  <InputField label="Email" icon="📧" type="email"
                    placeholder="example@kmitl.ac.th"
                    value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRegisterNext()}
                  />
                )}

                {/* Submit */}
                <Button onClick={mode === 'login' ? handleLogin : handleRegisterNext} className={`w-full px-5 py-3 rounded-2xl ${mode === 'login' ? 'bg-[#000066] text-[#FF9900]' : 'bg-[#000066] text-[#FF9900]'} shadow-[4px_4px_0px_0px_#FF9900]`} ariaLabel={mode === 'login' ? 'เข้าสู่ระบบ' : 'ถัดไป'}>
                  {mode === 'login' ? (
                    'เข้าสู่ระบบ'
                  ) : (
                    'ถัดไป →'
                  )}
                </Button>

                <div className="bg-slate-50 border-[2px] border-slate-200 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed text-center">
                    💡 Role จะถูกเก็บในระบบ — ถ้าเคยล็อกอินมาก่อน ระบบจะใช้ role เดิมที่มีอยู่ในฐานข้อมูล
                  </p>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════
                STEP 2 — Name + Branches (register only)
            ══════════════════════════════════════════ */}
            {step === 2 && (
              <div className="space-y-5">

                {/* Name or Instructor Selection */}
                {selectedRole === 'instructor' ? (
                  <div className="space-y-3">
                    <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest">
                      👨‍🏫 เลือกชื่ออาจารย์
                    </p>
                    <div className="space-y-2">
                      {AUTHORIZED_INSTRUCTORS.map((instructor, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedInstructorName(instructor)}
                          className={`w-full px-4 py-3 sm:py-4 rounded-2xl border-[3px] font-black text-left transition-all duration-200
                            ${selectedInstructorName === instructor
                              ? 'bg-[#000066] text-white border-slate-900 shadow-[4px_4px_0px_0px_#FF9900] -translate-y-1'
                              : 'bg-white text-slate-900 border-slate-900 hover:shadow-[4px_4px_0px_0px_#000] hover:-translate-y-0.5'}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base uppercase tracking-wide">{instructor}</span>
                            {selectedInstructorName === instructor && (
                              <span className="text-lg">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="bg-blue-50 border-[2px] border-blue-300 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-bold text-blue-700 leading-relaxed text-center">
                        💡 เลือกชื่ออาจารย์ได้ 1 คนต่อการสร้างบัญชี — หลังจากสร้างแล้ว สามารถใช้บัญชีนี้ได้เรื่อยๆ
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <InputField label="ชื่อ-นามสกุล" icon="✏️"
                      placeholder="เช่น สมชาย ใจดี"
                      value={name} onChange={e => setName(e.target.value)}
                    />

                    {/* Branches */}
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest text-center">
                        เลือกสาขาวิชา <span className="normal-case font-bold text-slate-300">(เลือกได้หลายสาขา)</span>
                      </p>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {BRANCHES.map(branch => {
                          const active = selectedBranches.includes(branch.id);
                          return (
                            <button key={branch.id} onClick={() => toggleBranch(branch.id)}
                              className={`cursor-pointer relative flex flex-col items-center p-3 sm:p-5 rounded-xl border-[3px] transition-all duration-200
                                ${active
                                  ? 'bg-[#000066] text-white border-slate-900 shadow-[4px_4px_0px_0px_#FF9900] -translate-y-1'
                                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'}`}>
                              <span className="text-2xl sm:text-3xl mb-1">{branch.icon}</span>
                              <span className={`text-sm sm:text-base font-black uppercase tracking-wider ${active ? 'text-white' : 'text-slate-900'}`}>
                                {branch.label}
                              </span>
                              <span className={`text-[9px] sm:text-[10px] font-bold mt-0.5 text-center leading-tight ${active ? 'text-white/70' : 'text-slate-400'}`}>
                                {branch.desc}
                              </span>
                              {active && (
                                <div className="absolute -top-2 -right-2 bg-[#FF9900] text-slate-900 w-5 h-5 rounded-full border-[2px] border-slate-900 flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
                                  <span className="text-[10px]">✓</span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex gap-3">
                  <Button onClick={() => { setStep(1); setError(''); }} className="px-5 py-4 rounded-2xl border-[3px] border-slate-900 text-sm uppercase tracking-wide bg-white text-slate-700 hover:bg-slate-100 shadow-[4px_4px_0px_0px_#000]" ariaLabel="ย้อนกลับ">
                    ← กลับ
                  </Button>
                  <Button onClick={handleRegister} className={`flex-1 px-6 py-4 rounded-2xl text-white ${activeRole?.color || 'bg-[#000066]'} shadow-[6px_6px_0px_0px_#000]`} ariaLabel="สร้างบัญชี">
                    <span className="mr-2">{activeRole?.icon}</span> สร้างบัญชี
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* ── Footer ── */}
          <div className="bg-slate-50 border-t-[3px] sm:border-t-[4px] border-slate-900 p-4 sm:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-700 uppercase tracking-widest">{displayText}</span>
              <span className="text-xs sm:text-sm">👋</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-6px)}
          40%{transform:translateX(6px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function InputField({ label, icon, type = 'text', placeholder, value, onChange, onKeyDown, right }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-3 border-[3px] border-slate-900 rounded-2xl px-4 py-3 sm:py-4 bg-white focus-within:border-[#000066] focus-within:shadow-[4px_4px_0px_0px_#000066] transition-all">
        <span className="text-slate-400 text-lg">{icon}</span>
        <input type={type} placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
          className="flex-1 outline-none text-slate-900 font-bold text-sm sm:text-base placeholder-slate-300 bg-transparent" />
        {right}
      </div>
    </div>
  );
}

function SubmitBtn({ loading, color, onClick, label, icon, flex1 }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={`cursor-pointer ${flex1 ? 'flex-1' : 'w-full'} border-[3px] sm:border-[4px] border-slate-900 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wide
        shadow-[6px_6px_0px_0px_#000066] sm:shadow-[8px_8px_0px_0px_#000066]
        hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000066]
        active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3
        disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000066]
        ${color || 'bg-blue-500'} text-white`}>
      {loading
        ? <div className="w-5 h-5 sm:w-6 sm:h-6 border-[3px] border-white/40 border-t-white rounded-full animate-spin" />
        : <><span className="text-xl">{icon}</span><span>{label}</span></>
      }
    </button>
  );
}