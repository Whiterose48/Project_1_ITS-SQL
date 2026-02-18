import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/DBLearn.png'; 

export default function Header({ currentPage, onNavigate, isLoggedIn, onLogout, onLoginClick }) {
  const [currentTime, setCurrentTime] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    let timer;
    const updateTime = () => {
      const now = new Date();
      const options = {
        day: 'numeric', month: 'short', hour: 'numeric',
        minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Bangkok'
      };
      const formatter = new Intl.DateTimeFormat('en-GB', options);
      const parts = formatter.formatToParts(now);
      const day = parts.find(p => p.type === 'day').value;
      const month = parts.find(p => p.type === 'month').value;
      const hour = parts.find(p => p.type === 'hour').value;
      const minute = parts.find(p => p.type === 'minute').value;
      const second = parts.find(p => p.type === 'second').value;
      const dayPeriod = parts.find(p => p.type === 'dayPeriod').value.toUpperCase();
      
      const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"], v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };
      setCurrentTime(`${getOrdinal(day)} ${month}, ${hour}:${minute}:${second} ${dayPeriod}`);
    };

    updateTime();
    timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavLinkStyle = (pageName) => {
    const isActive = currentPage === pageName;
    return `px-4 py-2 font-black uppercase tracking-wider transition-all border-[3px] ${
      isActive 
        ? 'bg-[#FF9900] text-[#000066] border-slate-900 shadow-[4px_4px_0px_0px_#000000] -translate-y-1' 
        : 'bg-transparent text-white border-transparent hover:bg-white/10'
    }`;
  };

  return (
    <header className="bg-[#000044] text-white py-4 px-10 border-b-[4px] border-slate-900 relative z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            <img 
              src={logoImg} 
              alt="Logo" 
              className="w-full h-full object-contain transition-transform group-hover:scale-110" 
            />
          </div>
          <h1 className="text-3xl font-black tracking-tight uppercase">
            <span className="text-[#FF9900]">DB</span>LEARN
          </h1>
        </div>

        <div className="flex items-center gap-8">
          {isLoggedIn && (
            <nav className="flex items-center gap-3 font-bold mr-4">
              <button onClick={() => onNavigate('home')} className={getNavLinkStyle('home')}>Home</button>
              <button onClick={() => onNavigate('courses')} className={getNavLinkStyle('courses')}>Courses</button>
              <button onClick={() => onNavigate('dashboard')} className={getNavLinkStyle('dashboard')}>Dashboard</button>
            </nav>
          )}

          <div className="bg-white text-[#000066] font-black h-11 flex items-center justify-center w-[260px] border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000022]">
            <span className="tabular-nums text-sm font-mono uppercase tracking-tight">
              {currentTime || 'LOADING...'}
            </span>
          </div>

          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 bg-[#FF9900] text-[#000066] p-2 px-4 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000022] transition-all cursor-pointer select-none ${
                  isDropdownOpen ? 'translate-y-1 shadow-none' : 'hover:-translate-y-0.5'
                }`}
              >
                <div className="flex flex-col leading-none text-left">
                  <span className="text-sm font-black uppercase">Phachara P.</span>
                  <span className="text-[10px] font-bold opacity-70 font-mono">@IT66070126</span>
                </div>
                <span className={`text-[10px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+10px)] right-0 w-full bg-white border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_#000022] flex flex-col z-50 overflow-hidden">
                  <button 
                    onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                    className="w-full text-left px-4 py-3 font-black text-white bg-red-600 uppercase text-xs hover:bg-red-700 transition-colors flex justify-between items-center"
                  >
                    LOGOUT <span>→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="bg-white text-[#000066] font-black h-11 px-6 border-[3px] border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#000022] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000022] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}