import { useState } from 'react';
import { Table, Key, Link2, Info, GraduationCap, Building2, Eye, List } from 'lucide-react';

export default function SchemaExplorer() {
  const [studentsView, setStudentsView] = useState<'schema' | 'sample'>('schema');
  const [departmentsView, setDepartmentsView] = useState<'schema' | 'sample'>('schema');

  const studentsColumns = [
    { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Unique identifier for students (Primary Key)' },
    { name: 'name', type: 'TEXT', isPk: false, isFk: false, desc: 'Full name of the student' },
    { name: 'email', type: 'TEXT', isPk: false, isFk: false, desc: 'University email address (unique)' },
    { name: 'department', type: 'TEXT', isPk: false, isFk: true, references: 'departments.department_name', desc: 'Department name (Foreign Key)' },
    { name: 'cgpa', type: 'REAL', isPk: false, isFk: false, desc: 'Current Cumulative GPA (6.0 - 10.0)' }
  ];

  const departmentsColumns = [
    { name: 'id', type: 'INTEGER', isPk: true, isFk: false, desc: 'Unique identifier for departments (Primary Key)' },
    { name: 'department_name', type: 'TEXT', isPk: false, isFk: false, desc: 'Name of academic department (unique)' },
    { name: 'head_of_department', type: 'TEXT', isPk: false, isFk: false, desc: 'Faculty lead / Head of Department' },
    { name: 'budget', type: 'INTEGER', isPk: false, isFk: false, desc: 'Annual budget allocation (USD)' }
  ];

  const studentsSampleData = [
    { id: 1, name: "Alice Smith", email: "alice.smith@university.edu", department: "Computer Science", cgpa: 9.2 },
    { id: 2, name: "Bob Jones", email: "bob.jones@university.edu", department: "Computer Science", cgpa: 8.5 },
    { id: 3, name: "Charlie Brown", email: "charlie.brown@university.edu", department: "Electrical", cgpa: 7.8 },
    { id: 4, name: "Diana Prince", email: "diana.prince@university.edu", department: "Biology", cgpa: 9.6 },
    { id: 5, name: "Evan Wright", email: "evan.wright@university.edu", department: "Mechanical", cgpa: 6.8 }
  ];

  const departmentsSampleData = [
    { id: 1, department_name: "Computer Science", head_of_department: "Dr. Alan Turing", budget: 500000 },
    { id: 2, department_name: "Mechanical", head_of_department: "Dr. Nikolaus Otto", budget: 400000 },
    { id: 3, department_name: "Electrical", head_of_department: "Dr. Nikola Tesla", budget: 450000 },
    { id: 4, department_name: "Civil", head_of_department: "Dr. Hardy Cross", budget: 380000 },
    { id: 5, department_name: "Biology", head_of_department: "Dr. Charles Darwin", budget: 350000 }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 max-h-screen overflow-y-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header Title */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850/80 pb-4">
        <div>
          <h2 className="text-xl font-black tracking-tight dark:text-white flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-500" />
            Database Schema Explorer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visual entity-relationship mapping and sample records inspector for the University Management System.
          </p>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400">
          Relational Schema Active
        </span>
      </div>

      {/* Relational Visualizer Diagram (SVG-based relationship card) */}
      <section className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-850/60 pb-3">
          <Link2 className="w-4 h-4 text-indigo-500" />
          Entity-Relationship Diagram (ERD)
        </h3>

        {/* Visual ERD layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center justify-center p-4 bg-slate-100/40 dark:bg-slate-900/20 rounded-2xl border border-slate-200/50 dark:border-slate-850/50 relative overflow-hidden">
          
          {/* Card 1: Students Table */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="px-4 py-3 bg-blue-50/50 dark:bg-blue-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs dark:text-white">students</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs">
              {studentsColumns.map((col, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-4 group/item hover:bg-slate-50/50 dark:hover:bg-slate-855/10">
                  <div className="flex items-center gap-2">
                    {col.isPk && <span title="Primary Key"><Key className="w-3 h-3 text-yellow-500" /></span>}
                    {col.isFk && <span title="Foreign Key"><Link2 className="w-3 h-3 text-indigo-500 animate-pulse" /></span>}
                    <span className={`font-mono font-bold ${col.isFk ? 'text-indigo-650 dark:text-indigo-400' : 'dark:text-slate-200'}`}>{col.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">{col.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual Link / Arrow */}
          <div className="md:col-span-1 flex flex-col items-center justify-center py-6 md:py-0 relative">
            {/* Desktop SVG Connector */}
            <div className="hidden md:block w-full h-12">
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 2 L 10 5 L 0 8 z" className="fill-indigo-500" />
                  </marker>
                </defs>
                <path 
                  d="M 5 20 Q 50 5 95 20" 
                  fill="none" 
                  className="stroke-indigo-550 dark:stroke-indigo-600/80 stroke-2 stroke-dasharray-[4]" 
                  markerEnd="url(#arrow)" 
                />
              </svg>
            </div>
            
            {/* Label Badge */}
            <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/60 shadow-sm relative z-10">
              FK Relation (M:1)
            </span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold mt-1">students.department → departments.department_name</span>
          </div>

          {/* Card 2: Departments Table */}
          <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden group hover:border-indigo-500/40 transition-colors">
            <div className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-xs dark:text-white">departments</span>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs">
              {departmentsColumns.map((col, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-855/10">
                  <div className="flex items-center gap-2">
                    {col.isPk && <span title="Primary Key"><Key className="w-3 h-3 text-yellow-500" /></span>}
                    <span className="font-mono font-bold dark:text-slate-200">{col.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase">{col.type}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Specifications & Sample Record tables split grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Table 1 Card: students spec & preview */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850/60 pb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-500" />
              Table: students
            </h4>
            
            {/* View Switcher Toggler */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <button 
                onClick={() => setStudentsView('schema')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  studentsView === 'schema' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <List className="w-3 h-3" />
                Columns
              </button>
              <button 
                onClick={() => setStudentsView('sample')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  studentsView === 'sample' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                Sample Records
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Stores academic profiles, contact credentials, and department registrations for enrolled university students.
          </p>

          {/* Conditional panel rendering */}
          {studentsView === 'schema' ? (
            <div className="space-y-3 pt-2">
              {studentsColumns.map((col, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-250/20 dark:border-slate-850/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold dark:text-slate-200">{col.name}</span>
                    <div className="flex items-center gap-1.5">
                      {col.isPk && <span className="text-[8px] font-bold bg-yellow-105 dark:bg-yellow-950 text-yellow-805 dark:text-yellow-450 px-1.5 py-0.5 rounded border border-yellow-250/20">PK</span>}
                      {col.isFk && <span className="text-[8px] font-bold bg-indigo-105 dark:bg-indigo-950 text-indigo-805 dark:text-indigo-405 px-1.5 py-0.5 rounded border border-indigo-250/20">FK</span>}
                      <span className="text-[9px] font-bold text-slate-400 font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{col.type}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-450 leading-relaxed font-semibold">{col.desc}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-900/20 pt-2">
              <table className="w-full text-left border-collapse text-[11px] leading-normal">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850/80">
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Student ID</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Name</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Email</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Department</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">CGPA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                  {studentsSampleData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-4 py-2.5 font-mono dark:text-slate-200">{row.id}</td>
                      <td className="px-4 py-2.5 font-medium dark:text-slate-200">{row.name}</td>
                      <td className="px-4 py-2.5 dark:text-slate-305/85">{row.email}</td>
                      <td className="px-4 py-2.5 dark:text-slate-200">{row.department}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-blue-600 dark:text-blue-400">{row.cgpa}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2 Card: departments spec & preview */}
        <div className="glass-card p-6 rounded-3xl border border-slate-200 dark:border-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850/60 pb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-500" />
              Table: departments
            </h4>
            
            {/* View Switcher Toggler */}
            <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-850">
              <button 
                onClick={() => setDepartmentsView('schema')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  departmentsView === 'schema' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <List className="w-3 h-3" />
                Columns
              </button>
              <button 
                onClick={() => setDepartmentsView('sample')}
                className={`px-3 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                  departmentsView === 'sample' 
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-slate-550 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3" />
                Sample Records
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Maintains academic departments, faculty oversight, and financial budget details.
          </p>

          {/* Conditional panel rendering */}
          {departmentsView === 'schema' ? (
            <div className="space-y-3 pt-2">
              {departmentsColumns.map((col, idx) => (
                <div key={idx} className="flex flex-col gap-1 p-3 rounded-xl bg-white/40 dark:bg-slate-900/40 border border-slate-250/20 dark:border-slate-850/40">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold dark:text-slate-200">{col.name}</span>
                    <div className="flex items-center gap-1.5">
                      {col.isPk && <span className="text-[8px] font-bold bg-yellow-105 dark:bg-yellow-950 text-yellow-805 dark:text-yellow-450 px-1.5 py-0.5 rounded border border-yellow-250/20">PK</span>}
                      <span className="text-[9px] font-bold text-slate-400 font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{col.type}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-450 dark:text-slate-450 leading-relaxed font-semibold">{col.desc}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-900/20 pt-2">
              <table className="w-full text-left border-collapse text-[11px] leading-normal">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850/80">
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">ID</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Department Name</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Head of Department</th>
                    <th className="px-4 py-3 font-bold text-slate-500 dark:text-slate-400 uppercase">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/50">
                  {departmentsSampleData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                      <td className="px-4 py-2.5 font-mono dark:text-slate-200">{row.id}</td>
                      <td className="px-4 py-2.5 font-medium dark:text-slate-200">{row.department_name}</td>
                      <td className="px-4 py-2.5 dark:text-slate-200">{row.head_of_department}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-indigo-600 dark:text-indigo-400">${row.budget.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </section>

      {/* Relational Info banner */}
      <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/10 text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed flex gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
        <span>
          <strong>Relational Integrity:</strong> The `students.department` field has a foreign key constraint referencing `departments.department_name`. When writing queries, you can perform JOIN operations to associate student profiles directly with department-level oversight budgets.
        </span>
      </div>

    </div>
  );
}
