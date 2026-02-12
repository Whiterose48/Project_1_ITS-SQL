import React from 'react';
import ResultTable from './ResultTable';

export default function MySubmissions({ submissions, problemData }) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10">
        <p className="text-gray-400 text-center py-12 text-xl font-medium">
          No submissions yet. Submit your first solution!
        </p>
      </div>
    );
  }

  const latestSubmission = submissions[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Test Status Header */}
      <div className={`rounded-2xl p-6 border-l-[6px] shadow-sm ${
        latestSubmission.passed 
          ? 'bg-green-50 border-green-500' 
          : 'bg-red-50 border-red-500'
      }`}>
        <div className="flex items-center">
          <span className="text-4xl mr-5">
            {latestSubmission.passed ? '✅' : '❌'}
          </span>
          <div>
            <h3 className={`text-2xl font-black mb-1 ${
              latestSubmission.passed ? 'text-green-800' : 'text-red-800'
            }`}>
              {latestSubmission.passed ? 'All Tests Passed!' : 'Some Tests Failed'}
            </h3>
            <p className="text-lg font-bold text-gray-600">
              {latestSubmission.passedCount} / {latestSubmission.totalTests} test cases passed
            </p>
          </div>
        </div>
      </div>

      {/* Your Code Section */}
      <div>
        <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center">
          <span className="mr-2">📝</span> Your Code:
        </h3>
        <div className="bg-[#0f172a] text-green-400 p-6 rounded-2xl font-mono text-[17px] leading-relaxed shadow-inner border border-slate-800 overflow-x-auto custom-scrollbar">
          <pre className="whitespace-pre-wrap">{latestSubmission.code}</pre>
        </div>
      </div>

      {/* Query Result Table */}
      {latestSubmission.queryResult && (
        <div>
          <h3 className="text-2xl font-black text-slate-900 mb-5 flex items-center">
            <span className="text-3xl mr-3">📊</span> Query Result
          </h3>
          <ResultTable data={latestSubmission.queryResult} />
        </div>
      )}

      {/* Test Cases Section */}
      {latestSubmission.testCases && latestSubmission.testCases.length > 0 && (
      <div>
        <h3 className="text-xl font-black text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🧪</span> Test Cases:
        </h3>
        <div className="space-y-4">
          {latestSubmission.testCases.map((testCase, idx) => (
            <div
              key={idx}
              className={`border-l-[5px] pl-6 py-5 rounded-2xl shadow-sm transition-all hover:translate-x-1 ${
                testCase.passed
                  ? 'bg-white border-green-500 ring-1 ring-green-100'
                  : 'bg-white border-red-500 ring-1 ring-red-100'
              }`}
            >
              <div className="flex items-center mb-4">
                <span className={`text-xl mr-3 font-black ${testCase.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {testCase.passed ? '✓' : '✗'}
                </span>
                <p className={`text-lg font-black uppercase tracking-wide ${
                  testCase.passed ? 'text-green-700' : 'text-red-700'
                }`}>
                  Test Case {idx + 1}: {testCase.passed ? 'Passed' : 'Failed'}
                </p>
              </div>

              <div className="space-y-3 px-2">
                <div className="text-[16px] leading-relaxed">
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Input</p>
                  <p className="text-gray-800 font-semibold bg-gray-50 p-2 rounded border border-gray-100">{testCase.input}</p>
                </div>
                
                <div className="text-[16px] leading-relaxed">
                  <p className="text-gray-500 font-bold uppercase text-xs tracking-widest mb-1">Expected Output</p>
                  <p className="text-gray-800 font-semibold bg-gray-50 p-2 rounded border border-gray-100">{testCase.expectedOutput}</p>
                </div>

                {!testCase.passed && (
                  <div className="text-[16px] leading-relaxed animate-in slide-in-from-left-2">
                    <p className="text-red-500 font-bold uppercase text-xs tracking-widest mb-1">Your Output</p>
                    <p className="text-red-600 font-bold bg-red-50 p-2 rounded border border-red-100">{testCase.actualOutput}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Hint if Failed */}
      {!latestSubmission.passed && latestSubmission.hint && (
        <div className="bg-orange-50 border-l-[6px] border-orange-400 p-6 rounded-2xl shadow-sm">
          <p className="text-xl font-black text-orange-800 mb-2 flex items-center">
            <span className="mr-2">💡</span> Hint:
          </p>
          <p className="text-orange-700 text-lg font-medium leading-relaxed">
            {latestSubmission.hint}
          </p>
        </div>
      )}
    </div>
  );
}