import React, { useState, useEffect } from 'react';

export default function Login({ onLogin, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) onLogin(username, password);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6 animate-in fade-in duration-500">
      <div className="relative max-w-lg w-full">
        <div className="absolute inset-0 bg-slate-900 rounded-3xl translate-x-4 translate-y-4"></div>
        <div className="bg-white border-[5px] border-slate-900 rounded-3xl relative overflow-hidden animate-in zoom-in-95 duration-300">
          
          <div className="bg-[#000066] border-b-[5px] border-slate-900 p-6 flex justify-between items-center relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-[#FF9900] rounded-full border-2 border-slate-900"></div>
                <span className="text-[10px] font-black text-[#FF9900] uppercase tracking-[0.3em]">System Authentication</span>
              </div>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Login <span className="text-[#FF9900]">Portal</span></h3>
            </div>
            <button 
              onClick={onClose}
              className="bg-white hover:bg-red-500 hover:text-white text-slate-900 border-[3px] border-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_#000] transition-all hover:-translate-y-1 active:translate-y-1 active:shadow-none z-20"
            >
              <span className="text-2xl font-black">✕</span>
            </button>
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#fff_10px,#fff_11px)]"></div>
          </div>

          <div className="p-10 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-5">
                
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-[#FF9900]">●</span> Student ID
                  </label>
                  <input 
                    type="text" 
                    placeholder="Enter your ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border-[4px] border-slate-900 p-5 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                    required
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-[#000066]">●</span> Password
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border-[4px] border-slate-900 p-5 pr-14 rounded-2xl font-black text-lg text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF9900] transition-colors duration-200"
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                          <line x1="2" y1="2" x2="22" y2="22"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-[#FF9900] text-[#000066] border-[4px] border-slate-900 py-6 rounded-2xl font-black text-xl uppercase tracking-widest shadow-[8px_8px_0px_0px_#000066] hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#000066] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-4 group"
              >
                Sign In
              </button>
            </form>
          </div>

          <div className="bg-slate-50 border-t-[4px] border-slate-900 p-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                {displayText}
              </span>
              <span className="text-sm">👋</span>
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