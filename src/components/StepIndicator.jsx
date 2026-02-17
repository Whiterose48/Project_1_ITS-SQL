import React from 'react';

// รับ statuses มาจาก App.jsx (อาเรย์ของ 'passed', 'failed', 'skipped', หรือ null)
export default function StepIndicator({ totalSteps = 5, currentStep, onStepChange, statuses = [] }) {
  return (
    // Container: ลายตาราง Blueprint จางๆ พร้อมขอบหนาสไตล์ 2D
    <div className="flex items-center justify-center my-10 py-10 bg-slate-50 rounded-xl border-[3px] border-slate-200 relative overflow-x-auto px-6">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="flex items-center z-10 min-w-max">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const status = statuses[index]; // ดึงสถานะของแต่ละข้อออกมา
          const isLast = step === totalSteps;

          // --- สไตล์พื้นฐานของปุ่มตัวเลข ---
          const baseStyles = "relative w-12 h-12 rounded-lg font-black text-lg flex items-center justify-center border-[3px] font-mono transition-all duration-200 shrink-0 select-none";
          
          let stepClasses = "";
          let stepShadow = ""; 

          // ✨ เงื่อนไขการเปลี่ยนสีตามสถานะที่ได้รับจาก App.jsx
          if (isActive) {
            // 1. ข้อปัจจุบัน: สีน้ำเงินเข้มเสมอ
            stepClasses = "bg-[#000066] text-white border-[#000033]";
            stepShadow = "4px 4px 0px 0px #000033";
          } else if (status === 'passed') {
            // 2. ตอบถูก: สีเขียว (Success) พร้อมไอคอนติ๊กถูก
            stepClasses = "bg-[#4ade80] text-[#064e3b] border-[#166534]";
            stepShadow = "4px 4px 0px 0px #14532d";
          } else if (status === 'failed') {
            // 3. ตอบผิด: สีแดง (Error)
            stepClasses = "bg-[#ef4444] text-white border-[#991b1b]";
            stepShadow = "4px 4px 0px 0px #7f1d1d";
          } else if (status === 'skipped') {
            // 4. กดข้าม: สีเหลือง (Warning)
            stepClasses = "bg-[#facc15] text-[#854d0e] border-[#a16207]";
            stepShadow = "4px 4px 0px 0px #713f12";
          } else {
            // 5. ยังไม่ถึง/ยังไม่ทำ: สีขาวปกติ
            stepClasses = "bg-white text-slate-400 border-slate-300";
            stepShadow = "4px 4px 0px 0px #cbd5e1";
          }

          return (
            <React.Fragment key={step}>
              {/* ปุ่ม Step */}
              <button
                onClick={() => onStepChange(step)}
                className={`${baseStyles} ${stepClasses} hover:-translate-y-1 hover:-translate-x-1 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none`}
                style={{ boxShadow: stepShadow }}
              >
                {/* ถ้าผ่านแล้วให้โชว์เครื่องหมายเช็คถูก ถ้ายังไม่ผ่านให้โชว์เลขข้อ */}
                {status === 'passed' && !isActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </button>

              {/* --- เส้นเชื่อมสี่เหลี่ยม (Connector) --- */}
              {!isLast && (
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-4 border-y-[3px] transition-colors duration-300 ${
                      status === 'passed' ? 'bg-[#4ade80] border-[#166534]' : 'bg-slate-200 border-slate-300'
                    }`}
                    style={{ 
                      // เงาแข็งใต้เส้นเชื่อม เปลี่ยนตามสถานะ 'passed'
                      boxShadow: status === 'passed' ? '0px 3px 0px 0px #14532d' : '0px 3px 0px 0px #cbd5e1'
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}