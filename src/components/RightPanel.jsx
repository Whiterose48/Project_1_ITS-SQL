import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

// SQL Auto-complete suggestions
const SQL_KEYWORDS = [
  // --- 1. Data Query Language (DQL) ---
  { label: 'SELECT', kind: 'Keyword', insertText: 'SELECT', detail: 'เลือกคอลัมน์ที่ต้องการแสดงผล' },
  { label: 'FROM', kind: 'Keyword', insertText: 'FROM', detail: 'ระบุชื่อตารางที่ต้องการดึงข้อมูล' },
  { label: 'WHERE', kind: 'Keyword', insertText: 'WHERE', detail: 'กรองข้อมูลตามเงื่อนไขที่กำหนด' },
  { label: 'AS', kind: 'Keyword', insertText: 'AS', detail: 'ตั้งชื่อนามแฝง (Alias)' },
  { label: 'DISTINCT', kind: 'Keyword', insertText: 'DISTINCT', detail: 'ดึงเฉพาะค่าที่ไม่ซ้ำกัน' },

  // --- 2. Data Manipulation Language (DML) ---
  { label: 'INSERT INTO', kind: 'Keyword', insertText: 'INSERT INTO', detail: 'เพิ่มข้อมูลใหม่ลงในตาราง' },
  { label: 'UPDATE', kind: 'Keyword', insertText: 'UPDATE', detail: 'แก้ไขข้อมูลที่มีอยู่แล้ว' },
  { label: 'DELETE', kind: 'Keyword', insertText: 'DELETE', detail: 'ลบข้อมูลออกจากตาราง' },
  { label: 'VALUES', kind: 'Keyword', insertText: 'VALUES', detail: 'ระบุค่าที่ต้องการเพิ่ม' },
  { label: 'MERGE', kind: 'Keyword', insertText: 'MERGE', detail: 'ทำ Upsert (Insert/Update)' },

  // --- 3. Data Definition Language (DDL) ---
  { label: 'CREATE', kind: 'Keyword', insertText: 'CREATE', detail: 'สร้าง Object ใหม่ (Table, Database)' },
  { label: 'ALTER', kind: 'Keyword', insertText: 'ALTER', detail: 'แก้ไขโครงสร้างตาราง' },
  { label: 'DROP', kind: 'Keyword', insertText: 'DROP', detail: 'ลบ Object ออกอย่างถาวร' },
  { label: 'TRUNCATE', kind: 'Keyword', insertText: 'TRUNCATE', detail: 'ล้างข้อมูลในตารางแต่โครงสร้างยังอยู่' },
  { label: 'RENAME', kind: 'Keyword', insertText: 'RENAME', detail: 'เปลี่ยนชื่อตารางหรือ Object' },

  // --- 4. Logical & Comparison Operators ---
  { label: 'AND', kind: 'Operator', insertText: 'AND', detail: 'เชื่อมเงื่อนไข (และ)' },
  { label: 'OR', kind: 'Operator', insertText: 'OR', detail: 'เชื่อมเงื่อนไข (หรือ)' },
  { label: 'NOT', kind: 'Operator', insertText: 'NOT', detail: 'ปฏิเสธเงื่อนไข' },
  { label: 'BETWEEN', kind: 'Operator', insertText: 'BETWEEN', detail: 'ตรวจสอบค่าในช่วง' },
  { label: 'LIKE', kind: 'Operator', insertText: 'LIKE', detail: 'ค้นหาตามรูปแบบ (Wildcard)' },
  { label: 'IN', kind: 'Operator', insertText: 'IN', detail: 'ตรวจสอบค่าในรายการ' },
  { label: 'IS NULL', kind: 'Operator', insertText: 'IS NULL', detail: 'ตรวจสอบค่าว่าง' },
  { label: 'EXISTS', kind: 'Operator', insertText: 'EXISTS', detail: 'ตรวจสอบการมีอยู่ของข้อมูลจากการ Query ย่อย' },

  // --- 5. Transaction & Control (TCL & DCL) ---
  { label: 'COMMIT', kind: 'Keyword', insertText: 'COMMIT', detail: 'ยืนยันการบันทึกการเปลี่ยนแปลง' },
  { label: 'ROLLBACK', kind: 'Keyword', insertText: 'ROLLBACK', detail: 'ยกเลิกการเปลี่ยนแปลง (ย้อนกลับ)' },
  { label: 'SAVEPOINT', kind: 'Keyword', insertText: 'SAVEPOINT', detail: 'ตั้งจุดบันทึกชั่วคราว' },
  { label: 'GRANT', kind: 'Keyword', insertText: 'GRANT', detail: 'ให้สิทธิ์การเข้าถึง' },
  { label: 'REVOKE', kind: 'Keyword', insertText: 'REVOKE', detail: 'ยกเลิกสิทธิ์การเข้าถึง' },

  // --- 6. Joins & Aggregations ---
  { label: 'JOIN', kind: 'Keyword', insertText: 'JOIN', detail: 'รวมตาราง' },
  { label: 'INNER JOIN', kind: 'Keyword', insertText: 'INNER JOIN', detail: 'รวมเฉพาะข้อมูลที่ตรงกันทั้งสองตาราง' },
  { label: 'LEFT JOIN', kind: 'Keyword', insertText: 'LEFT JOIN', detail: 'รวมตารางโดยเน้นข้อมูลฝั่งซ้าย' },
  { label: 'RIGHT JOIN', kind: 'Keyword', insertText: 'RIGHT JOIN', detail: 'รวมตารางโดยเน้นข้อมูลฝั่งขวา' },
  { label: 'ON', kind: 'Keyword', insertText: 'ON', detail: 'ระบุเงื่อนไขการ Join' },
  { label: 'GROUP BY', kind: 'Keyword', insertText: 'GROUP BY', detail: 'จัดกลุ่มข้อมูล' },
  { label: 'HAVING', kind: 'Keyword', insertText: 'HAVING', detail: 'กรองข้อมูลหลังจัดกลุ่ม' },
  { label: 'ORDER BY', kind: 'Keyword', insertText: 'ORDER BY', detail: 'เรียงลำดับผลลัพธ์' },
  { label: 'LIMIT', kind: 'Keyword', insertText: 'LIMIT', detail: 'จำกัดจำนวนแถว' },
  { label: 'ASC', kind: 'Keyword', insertText: 'ASC', detail: 'เรียงน้อยไปมาก' },
  { label: 'DESC', kind: 'Keyword', insertText: 'DESC', detail: 'เรียงมากไปน้อย' },

  // --- Functions ---
  { label: 'COUNT', kind: 'Function', insertText: 'COUNT', detail: 'นับจำนวนแถว' },
  { label: 'SUM', kind: 'Function', insertText: 'SUM', detail: 'ผลรวม' },
  { label: 'AVG', kind: 'Function', insertText: 'AVG', detail: 'ค่าเฉลี่ย' },
  { label: 'MIN', kind: 'Function', insertText: 'MIN', detail: 'ค่าน้อยที่สุด' },
  { label: 'MAX', kind: 'Function', insertText: 'MAX', detail: 'ค่ามากที่สุด' },
];

export default function RightPanel({ problemData, currentStep, onStepChange, onSubmit }) {
  const [code, setCode] = useState('-- Write your SQL query here --');
  const [isRunning, setIsRunning] = useState(false);
  const editorRef = useRef(null);
  const completionProviderRef = useRef(null);

  useEffect(() => {
    setCode('-- Write your SQL query here --');
  }, [problemData]);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    
    // ลงทะเบียน autocomplete provider เพียงครั้งเดียว
    if (!completionProviderRef.current) {
      completionProviderRef.current = window.monaco?.languages.registerCompletionItemProvider('sql', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };

          const suggestions = SQL_KEYWORDS.map(keyword => ({
            label: keyword.label,
            kind: window.monaco?.languages.CompletionItemKind[keyword.kind] || 14,
            insertText: keyword.insertText,
            insertTextRules: window.monaco?.languages.CompletionItemInsertTextRule?.InsertAsSnippet,
            detail: keyword.detail,
            range: range,
            sortText: keyword.label,
          }));

          return { suggestions };
        },
        triggerCharacters: ['S', 's', 'F', 'f', 'W', 'w', 'A', 'a', 'O', 'o', 'G', 'g', 'H', 'h', 'L', 'l', 'I', 'i', 'U', 'u', 'D', 'd', 'C', 'c', 'J', 'j'],
      });
    }
  };

  const handleRunQuery = async () => {
    setIsRunning(true);
    try {
      if (onSubmit) {
        await onSubmit(code, 'sql');
      }
      setIsRunning(false);
    } catch (error) {
      console.error('Submit error:', error);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Editor Section - 2D Flat Design */}
      <div className="bg-[#0f172a] rounded-xl overflow-hidden border-[3px] border-slate-800 shadow-[6px_6px_0px_0px_#1e293b] transition-all">
        
        {/* Flat Header */}
        <div className="bg-slate-800 text-white p-4 flex items-center justify-between border-b-[3px] border-slate-900">
          <div className="flex items-center gap-4">
            {/* 2D Window Controls - เปลี่ยนวงกลมเป็นสี่เหลี่ยมบล็อกๆ */}
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 bg-red-500 border-2 border-slate-900 rounded-sm"></div>
              <div className="w-3.5 h-3.5 bg-yellow-400 border-2 border-slate-900 rounded-sm"></div>
              <div className="w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-sm"></div>
            </div>
            <h3 className="text-lg font-black tracking-widest ml-2 font-mono uppercase text-slate-200">
              Query Editor
            </h3>
          </div>
          
          {/* 2D Badge */}
          <span className="bg-blue-600 px-3 py-1 rounded border-2 border-slate-900 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#020617]">
            SQL
          </span>
        </div>

        {/* Monaco Editor Container */}
        <div className="h-[450px] relative p-2">
          <Editor
            defaultLanguage="sql"
            value={code}
            onChange={(value) => setCode(value || '')}
            onMount={handleEditorMount}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 16,
              fontFamily: '"Fira Code", "JetBrains Mono", monospace',
              padding: { top: 16, bottom: 16 },
              scrollBeyondLastLine: false,
              lineHeight: 24,
              quickSuggestions: { other: true, comments: false, strings: false },
              suggestOnTriggerCharacters: true,
              wordBasedSuggestions: false,
              scrollbar: {
                alwaysConsumeMouseWheel: false,
              },
              fixedOverflowWidgets: true,
            }}
          />
        </div>
      </div>

      {/* 2D Solid Submit Button */}
      <button
        onClick={handleRunQuery}
        disabled={isRunning}
        className="w-full flex items-center justify-center gap-3 py-5 font-black text-xl tracking-widest uppercase transition-all duration-200 rounded-xl border-[3px] border-[#000066] bg-blue-600 text-white shadow-[6px_6px_0px_0px_#000066] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_#000066] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none disabled:opacity-75 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:translate-x-0 disabled:active:shadow-[6px_6px_0px_0px_#000066]"
      >
        {isRunning ? (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            <span>Submitting...</span>
          </div>
        ) : (
          <>
            <span className="text-2xl drop-shadow-sm">▶</span>
            <span className="drop-shadow-sm">Submit Answer</span>
          </>
        )}
      </button>
    </div>
  );
}