import React, { useState, useEffect } from 'react';
import { signInWithGoogle } from '../lib/auth';

const ROLE_OPTIONS = [
  { id: 'student', label: 'Student', labelTh: 'นักศึกษา', icon: '🎓', color: 'bg-blue-500', border: 'border-blue-600', desc: 'เรียนและทำแบบฝึกหัด SQL' },
  { id: 'ta', label: 'Teaching Assistant', labelTh: 'ผู้ช่วยสอน (TA)', icon: '📋', color: 'bg-emerald-500', border: 'border-emerald-600', desc: 'ตรวจงานและช่วยดูแลนักศึกษา' },
  { id: 'instructor', label: 'Instructor', labelTh: 'อาจารย์', icon: '👨‍🏫', color: 'bg-purple-600', border: 'border-purple-700', desc: 'จัดการคอร์สและโจทย์ทั้งหมด' },
];

export default function Login({ onLogin, onClose, loginError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [selectedRole, setSelectedRole] = useState('student');

  useEffect(() => {
    if (loginError) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [loginError]);

  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const greetings = [
    "สวัสดี",      // Thai
    "Hello",       // English
    "こんにちは",  // Japanese
    "Bonjour",     // French
    "Hola",        // Spanish
    "안녕하세요",    // Korean
    "Ciao"         // Italian
  ];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % greetings.length;
      const fullText = greetings[i];

      setDisplayText(
        isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1)
      );

      setTypingSpeed(isDeleting ? 80 : 150);

      if (!isDeleting && displayText === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await signInWithGoogle(selectedRole);
    if (result.success) {
      onLogin(result.user);
    } else {
      onLogin(null, result.error);
    }
    setIsLoading(false);
  };

  const activeRole = ROLE_OPTIONS.find(r => r.id === selectedRole);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 sm:p-6 animate-in fade-in duration-500">
      <div className="relative max-w-lg w-full">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-3 sm:translate-x-4 translate-y-3 sm:translate-y-4"></div>
        <div className="bg-white border-[4px] sm:border-[5px] border-slate-900 rounded-3xl relative overflow-hidden animate-in zoom-in-95 duration-300">

          {/* Header */}
          <div className="bg-[#000066] border-b-[4px] sm:border-b-[5px] border-slate-900 p-4 sm:p-6 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2.5 sm:w-3 h-2.5 sm:h-3 bg-[#FF9900] rounded-full border-2 border-slate-900"></div>
                <span className="text-[8px] sm:text-[10px] font-black text-[#FF9900] uppercase tracking-[0.2em] sm:tracking-[0.3em]">System Authentication</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tighter">Login <span className="text-[#FF9900]">Portal</span></h3>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer bg-white hover:bg-red-500 hover:text-white text-slate-900 border-[3px] border-slate-900 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-[3px_3px_0px_0px_#000] sm:shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none z-20"
            >
              <span className="text-xl sm:text-2xl font-black">✕</span>
            </button>
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_11px)]"></div>
          </div>

          <div className="p-6 sm:p-10 space-y-6 sm:space-y-8">

            {/* Error */}
            {loginError && (
              <div className={`bg-red-50 border-[3px] border-red-400 rounded-2xl p-3 sm:p-4 flex items-center gap-3 ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
                <div className="bg-red-500 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 border-red-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-red-700 font-bold">{loginError}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest text-center">เลือก Role ของคุณ</p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {ROLE_OPTIONS.map((role) => {
                    const isActive = selectedRole === role.id;
                    return (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`cursor-pointer relative flex flex-col items-center p-3 sm:p-4 rounded-xl border-[3px] transition-all duration-200
                          ${isActive
                            ? `${role.color} text-white border-slate-900 shadow-[4px_4px_0px_0px_#000] -translate-y-1 scale-[1.03]`
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:-translate-y-0.5'
                          }`}
                      >
                        <span className="text-3xl sm:text-4xl mb-1">{role.icon}</span>
                        <span className={`text-xs sm:text-sm font-black uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-900'}`}>{role.label === 'Teaching Assistant' ? 'TA' : role.label}</span>
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
                {activeRole && (
                  <p className="text-center text-[10px] sm:text-xs font-bold text-slate-400 mt-1">{activeRole.desc}</p>
                )}
              </div>

              {/* Icon + Label */}
              <div className="text-center space-y-3 sm:space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 ${activeRole?.color || 'bg-slate-100'} rounded-full border-[3px] sm:border-[4px] border-slate-900 shadow-[3px_3px_0px_0px_#000066] sm:shadow-[4px_4px_0px_0px_#000066] transition-colors duration-300`}>
                  <span className="text-3xl sm:text-4xl">{activeRole?.icon || '👤'}</span>
                </div>
                <div>
                  <h4 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-wide">
                    {selectedRole === 'student' ? 'Sign in with KMITL Account' : 'Sign in with Gmail'}
                  </h4>
                  <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                    {selectedRole === 'student'
                      ? 'ใช้ @kmitl.ac.th เท่านั้น'
                      : 'ใช้ @gmail.com เท่านั้น'}
                  </p>
                </div>
              </div>

              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="cursor-pointer w-full bg-white text-slate-700 border-[3px] sm:border-[4px] border-slate-900 py-4 sm:py-5 rounded-2xl font-black text-base sm:text-lg uppercase tracking-wide shadow-[6px_6px_0px_0px_#000066] sm:shadow-[8px_8px_0px_0px_#000066] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000066] sm:hover:shadow-[12px_12px_0px_0px_#000066] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 sm:gap-4 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[6px_6px_0px_0px_#000066]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 sm:w-6 sm:h-6 border-3 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-base sm:text-lg md:text-xl">Sign in with Google</span>
                  </>
                )}
              </button>

              {/* Role hint */}
              <div className="bg-slate-50 border-[2px] border-slate-200 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-bold text-slate-400 leading-relaxed text-center">
                  💡 Role จะถูกเก็บในระบบ — ถ้าเคยล็อกอินมาก่อน ระบบจะใช้ role เดิมที่มีอยู่ในฐานข้อมูล
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t-[3px] sm:border-t-[4px] border-slate-900 p-4 sm:p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-black text-slate-700 uppercase tracking-widest">
                {displayText}
              </span>
              <span className="text-xs sm:text-sm">👋</span>
            </div>
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}