import React from 'react';

function StepIndicator({ totalSteps = 5, currentStep, onStepChange, statuses = [], lockedSteps = [] }) {
  return (
    // 1. ตัวกรอบนอกสุด กำหนดให้อยู่แค่ในความกว้าง 100% เสมอ
    <div className="w-full mb-8 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
      
      {/* 2. พื้นที่สำหรับการ Scroll ซ้าย-ขวา เวลาที่ข้อเยอะเกินขอบจอ */}
      <div className="w-full overflow-x-auto custom-scrollbar">
        
        {/* 3. เทคนิค Flexbox เพื่อจัดให้อยู่ตรงกลางเมื่อจอใหญ่ และเริ่มจากซ้ายเมื่อจอเล็ก (ป้องกันบั๊กโดนตัดขอบซ้าย) */}
        <div className="flex items-center justify-center w-max min-w-full px-6 py-8 sm:py-10">
          
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const status = statuses[index];
            const isLocked = lockedSteps[index] === true;
            const isLast = step === totalSteps;

            // ปรับขนาดวงกลมให้พอดีมือถือมากขึ้น (w-10 h-10) และป้องกันการโดนบีบด้วย shrink-0
            const baseStyles = "relative w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold text-sm flex items-center justify-center transition-all duration-300 shrink-0 select-none outline-none focus-visible:ring-4 focus-visible:ring-[#03045e]/30";
            
            let stepClasses = "";
            let iconOrText = step;

            if (isLocked && !isActive) {
              stepClasses = "bg-emerald-50 text-emerald-600 border-2 border-emerald-200 cursor-not-allowed opacity-80";
              iconOrText = (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              );
            } else if (isActive) {
              stepClasses = "bg-[#03045e] text-white ring-4 ring-[#03045e]/20 shadow-lg scale-110 cursor-default";
            } else if (status === 'passed') {
              stepClasses = "bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-md hover:bg-emerald-600 hover:-translate-y-0.5 cursor-pointer";
              iconOrText = (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              );
            } else if (status === 'failed') {
              stepClasses = "bg-rose-500 text-white ring-4 ring-rose-500/20 shadow-md hover:bg-rose-600 hover:-translate-y-0.5 cursor-pointer";
            } else if (step < currentStep) {
              stepClasses = "bg-amber-100 text-amber-600 border-2 border-amber-200 hover:bg-amber-200 hover:-translate-y-0.5 cursor-pointer";
            } else {
              stepClasses = "bg-white text-slate-400 border-2 border-slate-200 hover:border-[#03045e]/50 hover:text-[#03045e] shadow-sm hover:-translate-y-0.5 cursor-pointer";
            }

            const lineClass = status === 'passed' 
              ? "bg-emerald-400" 
              : (isActive || step < currentStep) ? "bg-[#03045e]/20" : "bg-slate-200";

            return (
              <React.Fragment key={step}>
                <button
                  onClick={() => !isLocked && !isActive && onStepChange(step)}
                  disabled={isLocked || isActive}
                  className={`${baseStyles} ${stepClasses}`}
                  title={isLocked ? 'ข้อนี้ถูกล็อคเเล้ว (ส่งคำตอบถูกต้อง)' : `ไปยังข้อที่ ${step}`}
                >
                  {iconOrText}
                </button>

                {!isLast && (
                  // ปรับความกว้างของเส้นให้อยู่ตรงกลางอย่างสวยงาม
                  <div className="flex items-center px-1.5 sm:px-2">
                    <div className={`w-6 sm:w-12 h-1 rounded-full transition-colors duration-500 ${lineClass}`} />
                  </div>
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default React.memo(StepIndicator);