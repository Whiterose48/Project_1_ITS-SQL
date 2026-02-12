import React from 'react';

export default function StepIndicator({ totalSteps, currentStep, onStepChange }) {
  return (
    <div className="flex items-center justify-center gap-6 my-10 py-10 bg-white rounded-3xl shadow-sm border border-gray-100">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const step = index + 1;
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;

        // แยก Style ของแต่ละสถานะ
        const baseStyles = "relative w-16 h-16 rounded-full font-black text-2xl transition-all duration-300 flex items-center justify-center border-2";
        
        let statusStyles = "";
        let inlineStyles = {};

        if (isActive) {
          // ปัจจุบัน: สีน้ำเงินเข้ม
          statusStyles = "text-white border-black shadow-xl scale-110";
          inlineStyles = { 
            backgroundColor: '#000066',
            boxShadow: '0 10px 20px -5px rgba(0, 0, 102, 0.4)' 
          };
        } else if (isCompleted) {
          // ผ่านไปแล้ว: สีเขียวอ่อน
          statusStyles = "bg-[#E8F5E9] text-[#2E7D32] border-[#A5D6A7]";
        } else {
          // ยังไม่ถึง: สีขาวขอบฟ้าจาง
          statusStyles = "bg-white text-[#64748b] border-[#DBEAFE] hover:border-[#cbd5e1]";
        }

        return (
          <button
            key={step}
            onClick={() => onStepChange(step)}
            className={`${baseStyles} ${statusStyles}`}
            style={inlineStyles}
          >
            {isCompleted ? (
              <span className="flex items-center justify-center">
                {step}
                <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  ✓
                </span>
              </span>
            ) : (
              step
            )}
          </button>
        );
      })}
    </div>
  );
}