import React, { useState, useEffect } from 'react';
// Import รูปภาพจาก assets
import logoImg from '../assets/DBLearn.png'; 
import avatarImg from '../assets/p.png';

export default function Header() {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    let timer;

    const updateTime = () => {
      // 1. ปัดเศษมิลลิวินาทีทิ้งเพื่อให้เป็นวินาทีจำนวนเต็ม (.000)
      // ช่วยให้ทุก Component ที่ใช้ Logic นี้แสดงค่าวินาทีตรงกันเป๊ะ
      const now = new Date(Math.floor(Date.now() / 1000) * 1000);
      
      const options = {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Asia/Bangkok'
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
        const s = ["th", "st", "nd", "rd"],
              v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
      };

      setCurrentTime(`${getOrdinal(day)} ${month}, ${hour}:${minute}:${second} ${dayPeriod}`);
    };

    // 2. ฟังก์ชันช่วย Sync ให้เริ่มเดินที่ต้นวินาทีใหม่พร้อมกันทั้งหน้าจอ
    const startSyncHeader = () => {
      updateTime();
      const msUntilNextSecond = 1000 - (Date.now() % 1000);

      setTimeout(() => {
        updateTime();
        // เริ่ม setInterval ที่จุดเริ่มต้นของวินาทีใหม่ (.000ms)
        timer = setInterval(updateTime, 1000);
      }, msUntilNextSecond);
    };

    startSyncHeader();

    return () => {
      if (timer) clearInterval(timer);
    };
  }, []);

  return (
    <header className="bg-[#000066] text-white py-3 px-6 shadow-md">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        
        {/* ส่วนโลโก้และชื่อระบบ */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-12 h-12 flex items-center justify-center">
            <img 
              src={logoImg} 
              alt="DBLearn Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="text-[#FF9900]">DB</span>Learn
          </h1>
        </div>

        {/* ส่วนเมนู เวลา และโปรไฟล์ */}
        <div className="flex items-center gap-8 text-[15px]">
          <nav className="flex items-center gap-8 font-medium shrink-0">
            <a href="#" className="hover:text-gray-300 transition-colors">Home</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Courses</a>
            <a href="#" className="hover:text-gray-300 transition-colors flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Dashboard
            </a>
          </nav>

          {/* ช่องแสดงเวลา - tabular-nums ป้องกันตัวเลขขยับ */}
          <div className="bg-white text-[#000066] rounded-full font-bold shadow-inner h-10 flex items-center justify-center w-[260px] shrink-0">
            <span className="tabular-nums text-[16px]">{currentTime || 'Loading...'}</span>
          </div>

          {/* ส่วนข้อมูลผู้ใช้งาน */}
          <div className="flex items-center gap-3 bg-white/10 p-1.5 pr-5 rounded-xl border border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/20">
               <img src={avatarImg} alt="Phachara" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold whitespace-nowrap">Phachara Pornanothai</span>
              <span className="text-[11px] text-gray-300 font-light lowercase">@it66070126</span>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}