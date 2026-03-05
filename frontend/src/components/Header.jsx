import React, { useState, useEffect, useRef } from 'react';
import logoImg from '../assets/DBLearn.png'; 

export default function Header({ currentPage, onNavigate, isLoggedIn, userData, onLogout, onLoginClick }) {
  const [currentTime, setCurrentTime] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const isStaff = userData?.role && ['instructor', 'ta', 'admin'].includes(userData.role);
  const isAdmin = userData?.role === 'admin';

  const roleLabel = { student: 'Student', ta: 'TA', instructor: 'Instructor', admin: 'Admin' };
  const roleColor = { student: 'bg-blue-500', ta: 'bg-emerald-500', instructor: 'bg-purple-600', admin: 'bg-red-500' };

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNavLinkStyle = (pageName) => {
    const isActive = currentPage === pageName;
    return `cursor-pointer px-3 lg:px-5 py-2.5 font-black uppercase tracking-wider transition-all border-[3px] text-xs lg:text-sm ${
      isActive 
        ? 'bg-[#FF9900] text-[#000066] border-slate-900 shadow-[4px_4px_0px_0px_#000000] -translate-y-1' 
        : 'bg-transparent text-white border-transparent hover:bg-white/10'
    }`;
  };

  const mobileNavBtn = (page, label) => (
    <button
      onClick={() => { setIsMobileMenuOpen(false); onNavigate(page); }}
      className={`cursor-pointer w-full text-left px-5 py-4 font-black uppercase text-sm tracking-widest transition-colors ${
        currentPage === page ? 'bg-[#FF9900] text-[#000066]' : 'text-white hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );

  return (
    <header className="bg-[#000044] text-white py-3 sm:py-4 px-4 sm:px-6 lg:px-10 border-b-[4px] border-slate-900 relative z-50">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        
        {/* Logo */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" onClick={() => onNavigate('home')}>
          <div className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <img src={logoImg} alt="Logo" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight uppercase">
            <span className="text-[#FF9900]">DB</span>LEARN
          </h1>
        </div>

        {/* Desktop Right Section */}
        <div className="flex items-center gap-3 lg:gap-6">
          {/* Desktop Nav (hidden < md) */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 font-bold">
              <button onClick={() => onNavigate('home')} className={getNavLinkStyle('home')}>Home</button>
              <button onClick={() => onNavigate('courses')} className={getNavLinkStyle('courses')}>Courses</button>
              <button onClick={() => onNavigate('dashboard')} className={getNavLinkStyle('dashboard')}>Dashboard</button>
              {isStaff && (
                <button onClick={() => onNavigate('instructor')} className={getNavLinkStyle('instructor')}>Instructor</button>
              )}
              {isAdmin && (
                <button onClick={() => onNavigate('admin')} className={getNavLinkStyle('admin')}>Admin</button>
              )}
            </nav>
          )}

          {/* Clock (hidden < lg) */}
          <div className="hidden lg:flex bg-white text-[#000066] font-black h-10 items-center justify-center w-[240px] border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000022]">
            <span className="tabular-nums text-sm font-mono uppercase tracking-tight">
              {currentTime || 'LOADING...'}
            </span>
          </div>

          {/* User Dropdown / Sign In */}
          {isLoggedIn ? (
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-2 sm:gap-3 bg-[#FF9900] text-[#000066] p-1.5 px-3 sm:p-2 sm:px-4 border-[3px] border-slate-900 shadow-[4px_4px_0px_0px_#000022] transition-all cursor-pointer select-none ${
                  isDropdownOpen ? 'translate-y-1 shadow-none' : 'hover:-translate-y-0.5'
                }`}
              >
                <div className="flex flex-col leading-none text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm sm:text-base font-black uppercase">{userData?.displayId || 'USER'}</span>
                    {userData?.role && (
                      <span className={`${roleColor[userData.role] || 'bg-slate-500'} text-white text-[8px] sm:text-[10px] font-black px-2 py-0.5 rounded-sm border border-slate-900 uppercase leading-none`}>
                        {roleLabel[userData.role] || userData.role}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold opacity-70 font-mono hidden sm:block">{userData?.email || ''}</span>
                </div>
                <span className={`text-[10px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
              </div>

              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+10px)] right-0 w-64 bg-white border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_#000022] flex flex-col z-50 overflow-hidden">
                  {/* Role badge in dropdown */}
                  <div className="px-4 py-2.5 border-b-2 border-slate-100 bg-slate-50">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{userData?.name || userData?.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-2.5 h-2.5 rounded-full ${roleColor[userData?.role] || 'bg-slate-400'}`}></div>
                      <span className="text-xs font-black text-slate-500 uppercase">{roleLabel[userData?.role] || 'Student'}</span>
                    </div>
                  </div>
                  {isStaff && (
                    <>
                      <button
                        onClick={() => { setIsDropdownOpen(false); onNavigate('instructor'); }}
                        className="cursor-pointer w-full text-left px-5 py-3.5 font-black text-[#000066] bg-white uppercase text-sm hover:bg-slate-100 transition-colors flex justify-between items-center border-b border-slate-200"
                      >
                        INSTRUCTOR <span>📊</span>
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); onNavigate('coursemanage'); }}
                        className="cursor-pointer w-full text-left px-5 py-3.5 font-black text-[#000066] bg-white uppercase text-sm hover:bg-slate-100 transition-colors flex justify-between items-center border-b border-slate-200"
                      >
                        COURSES <span>📚</span>
                      </button>
                      <button
                        onClick={() => { setIsDropdownOpen(false); onNavigate('problems'); }}
                        className="cursor-pointer w-full text-left px-5 py-3.5 font-black text-[#000066] bg-white uppercase text-sm hover:bg-slate-100 transition-colors flex justify-between items-center border-b border-slate-200"
                      >
                        PROBLEMS <span>📝</span>
                      </button>
                    </>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => { setIsDropdownOpen(false); onNavigate('admin'); }}
                      className="cursor-pointer w-full text-left px-5 py-3.5 font-black text-[#000066] bg-white uppercase text-sm hover:bg-slate-100 transition-colors flex justify-between items-center border-b border-slate-200"
                    >
                      ADMIN PANEL <span>🔧</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setIsDropdownOpen(false); onLogout(); }}
                    className="cursor-pointer w-full text-left px-5 py-3.5 font-black text-white bg-red-600 uppercase text-sm hover:bg-red-700 transition-colors flex justify-between items-center"
                  >
                    LOGOUT <span>→</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="cursor-pointer bg-white text-[#000066] font-black h-11 sm:h-12 px-5 sm:px-7 border-[3px] border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#000022] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000022] active:translate-y-0 active:shadow-none transition-all flex items-center gap-2 uppercase tracking-widest text-xs sm:text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                <polyline points="10 17 15 12 10 7"></polyline>
                <line x1="15" y1="12" x2="3" y2="12"></line>
              </svg>
              Sign In
            </button>
          )}

          {/* Mobile Hamburger (shown < md) */}
          {isLoggedIn && (
            <div className="md:hidden relative" ref={mobileMenuRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="cursor-pointer bg-white/10 border-[3px] border-white/20 w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-white/20 transition-colors"
              >
                <span className={`block w-5 h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-5 h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </button>

              {isMobileMenuOpen && (
                <div className="absolute top-[calc(100%+10px)] right-0 w-52 bg-[#000066] border-[3px] border-slate-900 shadow-[6px_6px_0px_0px_#000022] flex flex-col z-50 overflow-hidden rounded-xl">
                  {mobileNavBtn('home', 'Home')}
                  {mobileNavBtn('courses', 'Courses')}
                  {mobileNavBtn('dashboard', 'Dashboard')}
                  {isStaff && mobileNavBtn('instructor', 'Instructor')}
                  {isAdmin && mobileNavBtn('admin', 'Admin')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}