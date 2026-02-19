import React from 'react';

export default function StepIndicator({ totalSteps = 5, currentStep, onStepChange, statuses = [], lockedSteps = [] }) {
  return (
    <div className="flex items-center justify-center my-10 py-10 bg-slate-50 rounded-xl border-[3px] border-slate-200 relative overflow-x-auto px-6">
      
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="flex items-center z-10 min-w-max">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isActive = step === currentStep;
          const status = statuses[index];
          const isLocked = lockedSteps[index] === true;
          const isLast = step === totalSteps;

          const baseStyles = "relative w-12 h-12 rounded-lg font-black text-lg flex items-center justify-center border-[3px] font-mono transition-all duration-200 shrink-0 select-none";
          
          let stepClasses = "";
          let stepShadow = ""; 

          if (isLocked && !isActive) {
            // Locked exam step (passed + locked) - green with lock appearance
            stepClasses = "bg-[#4ade80] text-[#064e3b] border-[#166534] opacity-75 cursor-not-allowed";
            stepShadow = "4px 4px 0px 0px #14532d";
          } else if (isActive) {
            stepClasses = "bg-[#000033] text-white border-[#00001a] cursor-pointer";
            stepShadow = "4px 4px 0px 0px #00001a";
          } else if (status === 'passed') {
            stepClasses = "bg-[#4ade80] text-[#064e3b] border-[#166534] cursor-pointer";
            stepShadow = "4px 4px 0px 0px #14532d";
          } else if (status === 'failed') {
            stepClasses = "bg-[#ef4444] text-white border-[#991b1b] cursor-pointer";
            stepShadow = "4px 4px 0px 0px #7f1d1d";
          } else if (step < currentStep) {
            stepClasses = "bg-[#facc15] text-[#854d0e] border-[#92400e] cursor-pointer";
            stepShadow = "4px 4px 0px 0px #78350f";
          } else {
            stepClasses = "bg-white text-slate-400 border-slate-300 cursor-pointer";
            stepShadow = "4px 4px 0px 0px #cbd5e1";
          }

          return (
            <React.Fragment key={step}>
              <button
                onClick={() => !isLocked && onStepChange(step)}
                disabled={isLocked}
                className={`${baseStyles} ${stepClasses} ${isLocked ? '' : 'hover:-translate-y-1 hover:-translate-x-1 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none'}`}
                style={{ boxShadow: stepShadow }}
                title={isLocked ? 'ข้อนี้ถูกล็อคเเล้ว (ส่งคำตอบถูกต้อง)' : ''}
              >
                {isLocked ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ) : status === 'passed' && !isActive ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={5} stroke="currentColor" className="w-7 h-7">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </button>

              {!isLast && (
                <div className="flex items-center">
                  <div 
                    className={`w-10 h-4 border-y-[3px] transition-colors duration-300 ${
                      status === 'passed' ? 'bg-[#4ade80] border-[#166534]' : 'bg-slate-200 border-slate-300'
                    }`}
                    style={{ 
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