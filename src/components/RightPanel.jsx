import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const SQL_KEYWORDS = [
  { label: 'SELECT', kind: 'Keyword', insertText: 'SELECT', detail: 'เลือกคอลัมน์ที่ต้องการแสดงผล' },
  { label: 'FROM', kind: 'Keyword', insertText: 'FROM', detail: 'ระบุชื่อตารางที่ต้องการดึงข้อมูล' },
  { label: 'WHERE', kind: 'Keyword', insertText: 'WHERE', detail: 'กรองข้อมูลตามเงื่อนไขที่กำหนด' },
  { label: 'AS', kind: 'Keyword', insertText: 'AS', detail: 'ตั้งชื่อนามแฝง (Alias)' },
  { label: 'DISTINCT', kind: 'Keyword', insertText: 'DISTINCT', detail: 'ดึงเฉพาะค่าที่ไม่ซ้ำกัน' },
  { label: 'INSERT INTO', kind: 'Keyword', insertText: 'INSERT INTO', detail: 'เพิ่มข้อมูลใหม่ลงในตาราง' },
  { label: 'UPDATE', kind: 'Keyword', insertText: 'UPDATE', detail: 'แก้ไขข้อมูลที่มีอยู่แล้ว' },
  { label: 'DELETE', kind: 'Keyword', insertText: 'DELETE', detail: 'ลบข้อมูลออกจากตาราง' },
  { label: 'VALUES', kind: 'Keyword', insertText: 'VALUES', detail: 'ระบุค่าที่ต้องการเพิ่ม' },
  { label: 'MERGE', kind: 'Keyword', insertText: 'MERGE', detail: 'ทำ Upsert (Insert/Update)' },
  { label: 'CREATE', kind: 'Keyword', insertText: 'CREATE', detail: 'สร้าง Object ใหม่' },
  { label: 'ALTER', kind: 'Keyword', insertText: 'ALTER', detail: 'แก้ไขโครงสร้างตาราง' },
  { label: 'DROP', kind: 'Keyword', insertText: 'DROP', detail: 'ลบ Object ออกอย่างถาวร' },
  { label: 'TRUNCATE', kind: 'Keyword', insertText: 'TRUNCATE', detail: 'ล้างข้อมูลในตาราง' },
  { label: 'RENAME', kind: 'Keyword', insertText: 'RENAME', detail: 'เปลี่ยนชื่อตาราง' },
  { label: 'AND', kind: 'Operator', insertText: 'AND', detail: 'เชื่อมเงื่อนไข (และ)' },
  { label: 'OR', kind: 'Operator', insertText: 'OR', detail: 'เชื่อมเงื่อนไข (หรือ)' },
  { label: 'NOT', kind: 'Operator', insertText: 'NOT', detail: 'ปฏิเสธเงื่อนไข' },
  { label: 'BETWEEN', kind: 'Operator', insertText: 'BETWEEN', detail: 'ตรวจสอบค่าในช่วง' },
  { label: 'LIKE', kind: 'Operator', insertText: 'LIKE', detail: 'ค้นหาตามรูปแบบ (Wildcard)' },
  { label: 'IN', kind: 'Operator', insertText: 'IN', detail: 'ตรวจสอบค่าในรายการ' },
  { label: 'IS NULL', kind: 'Operator', insertText: 'IS NULL', detail: 'ตรวจสอบค่าว่าง' },
  { label: 'EXISTS', kind: 'Operator', insertText: 'EXISTS', detail: 'ตรวจสอบการมีอยู่ของข้อมูล' },
  { label: 'JOIN', kind: 'Keyword', insertText: 'JOIN', detail: 'รวมตาราง' },
  { label: 'INNER JOIN', kind: 'Keyword', insertText: 'INNER JOIN', detail: 'รวมเฉพาะข้อมูลที่ตรงกัน' },
  { label: 'LEFT JOIN', kind: 'Keyword', insertText: 'LEFT JOIN', detail: 'รวมตารางโดยเน้นฝั่งซ้าย' },
  { label: 'RIGHT JOIN', kind: 'Keyword', insertText: 'RIGHT JOIN', detail: 'รวมตารางโดยเน้นฝั่งขวา' },
  { label: 'ON', kind: 'Keyword', insertText: 'ON', detail: 'ระบุเงื่อนไขการ Join' },
  { label: 'GROUP BY', kind: 'Keyword', insertText: 'GROUP BY', detail: 'จัดกลุ่มข้อมูล' },
  { label: 'HAVING', kind: 'Keyword', insertText: 'HAVING', detail: 'กรองข้อมูลหลังจัดกลุ่ม' },
  { label: 'ORDER BY', kind: 'Keyword', insertText: 'ORDER BY', detail: 'เรียงลำดับผลลัพธ์' },
  { label: 'LIMIT', kind: 'Keyword', insertText: 'LIMIT', detail: 'จำกัดจำนวนแถว' },
  { label: 'ASC', kind: 'Keyword', insertText: 'ASC', detail: 'เรียงน้อยไปมาก' },
  { label: 'DESC', kind: 'Keyword', insertText: 'DESC', detail: 'เรียงมากไปน้อย' },
  { label: 'COUNT', kind: 'Function', insertText: 'COUNT', detail: 'นับจำนวนแถว' },
  { label: 'SUM', kind: 'Function', insertText: 'SUM', detail: 'ผลรวม' },
  { label: 'AVG', kind: 'Function', insertText: 'AVG', detail: 'ค่าเฉลี่ย' },
  { label: 'MIN', kind: 'Function', insertText: 'MIN', detail: 'ค่าน้อยที่สุด' },
  { label: 'MAX', kind: 'Function', insertText: 'MAX', detail: 'ค่ามากที่สุด' }
];

export default function RightPanel({ problemData, currentStep, onStepChange, onSubmit }) {
  const [code, setCode] = useState('-- Write your SQL query here --');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);

  // ✨ สร้าง state เพื่อเก็บสถานะว่าเวลาหมดหรือยัง
  const [isTimeUp, setIsTimeUp] = useState(false);

  const getStorageKey = () => {
    const mode = localStorage.getItem('workspaceMode') || 'COURSE';
    const modId = localStorage.getItem('workspaceModule') || '02';
    return `saved_code_${mode}_${modId}_step_${currentStep}`;
  };

  // ✨ เช็คเวลาตลอดเวลา ถ้าเป็นโหมด EXAM แล้วเวลาเกิน 1 ชม. ให้ล็อคหน้าจอ!
  useEffect(() => {
    const mode = localStorage.getItem('workspaceMode');
    if (mode !== 'EXAM') return;

    const EXAM_DURATION = 60 * 60 * 1000;
    const modId = localStorage.getItem('workspaceModule');
    const userData = sessionStorage.getItem('userData');
    const userId = userData ? JSON.parse(userData).id : 'guest';
    const startTime = localStorage.getItem(`exam_start_${userId}_${modId}`);

    const checkTime = () => {
        if (startTime) {
            if (Date.now() - parseInt(startTime) >= EXAM_DURATION) {
                setIsTimeUp(true);
            }
        }
    };
    
    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!problemData) return;
    const storageKey = getStorageKey();
    const savedCode = localStorage.getItem(storageKey);
    
    if (savedCode) {
      setCode(savedCode); 
    } else {
      setCode('-- Write your SQL query here --'); 
    }
  }, [problemData, currentStep]);

  const handleEditorChange = (value) => {
    const newCode = value || '';
    setCode(newCode);
    if (problemData) {
      localStorage.setItem(getStorageKey(), newCode);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.updateOptions({
      wordBasedSuggestions: 'off',
      suggest: { showWords: false }
    });
    
    if (monaco) {
      if (!monaco.languages.__isCustomSqlRegistered) {
        monaco.languages.registerCompletionItemProvider('sql', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber, endLineNumber: position.lineNumber,
              startColumn: word.startColumn, endColumn: word.endColumn,
            };
            const suggestions = SQL_KEYWORDS.map(keyword => ({
              label: keyword.label,
              kind: monaco.languages.CompletionItemKind[keyword.kind] || 14,
              insertText: keyword.insertText,
              insertTextRules: monaco.languages.CompletionItemInsertTextRule?.InsertAsSnippet,
              detail: keyword.detail,
              range: range,
              sortText: "000-" + keyword.label, 
            }));
            return { suggestions };
          },
          triggerCharacters: ['S', 's', 'F', 'f', 'W', 'w', 'A', 'a', 'O', 'o', 'G', 'g', 'H', 'h', 'L', 'l', 'I', 'i', 'U', 'u', 'D', 'd', 'C', 'c', 'J', 'j'],
        });
        monaco.languages.__isCustomSqlRegistered = true;
      }
    }
  };

  const handleRunQuery = async () => {
    if (isRunning || isTimeUp) return; // ดักเผื่อบั๊ก
    setIsRunning(true);
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(code, 'sql');
      }
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetCode = () => {
    if (isTimeUp) return; // ถ้าเวลาหมด ห้ามรีเซ็ตด้วย!
    if(window.confirm('Are you sure you want to reset your code? This cannot be undone.')) {
      const defaultCode = '-- Write your SQL query here --';
      setCode(defaultCode);
      localStorage.setItem(getStorageKey(), defaultCode);
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="bg-[#0f172a] rounded-[24px] overflow-hidden border-[4px] border-slate-900 shadow-[8px_8px_0px_0px_#1e293b] flex flex-col">
        <div className={`bg-slate-800 text-white px-6 py-4 flex items-center justify-between border-b-[4px] border-slate-900 shrink-0 transition-colors ${isTimeUp ? 'bg-red-900/50' : ''}`}>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 bg-red-500 border-2 border-slate-900 rounded-sm"></div>
              <div className="w-3.5 h-3.5 bg-yellow-400 border-2 border-slate-900 rounded-sm"></div>
              <div className="w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-sm"></div>
            </div>
            <h3 className="text-lg font-black tracking-widest ml-2 font-mono uppercase text-slate-200">
              Query Editor {isTimeUp && <span className="text-red-400 ml-2 animate-pulse">(LOCKED)</span>}
            </h3>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetCode}
              disabled={isTimeUp}
              className={`font-bold text-xs uppercase tracking-widest transition-colors mr-2 ${isTimeUp ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-red-400 cursor-pointer'}`}
            >
              Reset
            </button>
            <span className={`${isTimeUp ? 'bg-red-600' : 'bg-blue-600'} px-3 py-1 rounded-md border-[3px] border-slate-900 text-xs font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_#020617]`}>
              SQL
            </span>
          </div>
        </div>
        
        <div className="h-[450px] w-full relative bg-[#1e1e1e]">
          {isTimeUp && (
             <div className="absolute inset-0 z-50 bg-slate-900/30 backdrop-blur-[1px] flex items-center justify-center">
                 {/* แผ่นกระจกใสๆ มาบัง Editor ไม่ให้กดได้เลย */}
             </div>
          )}
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="sql"
            value={code}
            onChange={handleEditorChange} 
            onMount={handleEditorMount}
            theme="vs-dark"
            loading={
              <div className="flex h-full w-full items-center justify-center text-emerald-400 font-mono font-bold animate-pulse text-lg">
                Initializing Database Editor...
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              padding: { top: 24, bottom: 24 },
              scrollBeyondLastLine: false,
              lineHeight: 24,
              wordBasedSuggestions: 'off',
              suggest: { showWords: false },
              scrollbar: { alwaysConsumeMouseWheel: false },
              fixedOverflowWidgets: true,
              readOnly: isTimeUp, // ✨ ล็อคไม่ให้พิมพ์เพิ่มได้ถ้าเวลาหมด
            }}
          />
        </div>
      </div>

      {/* ✨ เปลี่ยนปุ่มเป็นปุ่ม "หมดเวลา" ถ้าครบ 1 ชั่วโมง */}
      <button
        onClick={handleRunQuery}
        disabled={isRunning || isTimeUp}
        className={`relative z-10 w-full flex items-center justify-center gap-3 py-6 font-black text-xl tracking-widest uppercase transition-all duration-150 rounded-[20px] border-[4px] border-slate-900 text-white 
          ${isTimeUp 
            ? 'bg-red-600 shadow-[8px_8px_0px_0px_#7f1d1d] cursor-not-allowed opacity-90' 
            : 'bg-blue-600 shadow-[8px_8px_0px_0px_#000066] hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000066] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none cursor-pointer'
          }
        `}
      >
        {isTimeUp ? (
          <>
            <span className="text-2xl drop-shadow-md">🔒</span>
            <span className="drop-shadow-md pointer-events-none">TIME IS UP</span>
          </>
        ) : isRunning ? (
          <div className="flex items-center gap-3 pointer-events-none">
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          <>
            <span className="text-2xl drop-shadow-md pointer-events-none">▶</span>
            <span className="drop-shadow-md pointer-events-none">Submit Answer</span>
          </>
        )}
      </button>
    </div>
  );
}