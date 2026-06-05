export interface OptimizationResult {
  needsOptimization: boolean;
  originalSql: string;
  optimizedSql: string;
  explanation: string;
  performanceGain: string;
}

export function optimizeQuery(sql: string): OptimizationResult {
  if (!sql || !sql.trim()) {
    return {
      needsOptimization: false,
      originalSql: '',
      optimizedSql: '',
      explanation: '',
      performanceGain: '0%'
    };
  }

  const clean = sql.trim();
  const lowercase = clean.toLowerCase();
  
  // 1. Rule: Avoid SELECT * on students table
  if (lowercase.includes('select *') && lowercase.includes('from students')) {
    const optimized = clean.replace(/select\s+\*\s+from\s+students/gi, 'SELECT id, name, email, department, cgpa FROM students');
    return {
      needsOptimization: true,
      originalSql: clean,
      optimizedSql: optimized,
      explanation: 'Avoid SELECT * in enterprise platforms. Specifying table columns (id, name, email, department, cgpa) reduces data transmission sizes, eliminates memory overhead, and allows index covering.',
      performanceGain: '15% reduction in payload overhead'
    };
  }

  // 2. Rule: Avoid SELECT * on departments table
  if (lowercase.includes('select *') && lowercase.includes('from departments')) {
    const optimized = clean.replace(/select\s+\*\s+from\s+departments/gi, 'SELECT id, department_name, head_of_department, budget FROM departments');
    return {
      needsOptimization: true,
      originalSql: clean,
      optimizedSql: optimized,
      explanation: 'Avoid SELECT *. Specifying columns explicitly (id, department_name, head_of_department, budget) ensures schema updates do not break downstream components.',
      performanceGain: '10% reduction in data buffer size'
    };
  }

  // 3. Rule: Check for implicit comma-separated joins
  // e.g., FROM students, departments WHERE students.department = departments.department_name
  if (lowercase.includes('from students') && lowercase.includes('departments') && lowercase.includes('where') && 
      (lowercase.includes('.department') && (lowercase.includes('.department_name') || lowercase.includes('.department')))) {
    
    // Suggest explicit INNER JOIN
    if (lowercase.includes('students, departments') || lowercase.includes('departments, students')) {
      const optimized = "SELECT s.id, s.name, s.cgpa, d.department_name, d.head_of_department \nFROM students s \nINNER JOIN departments d ON s.department = d.department_name;";
      return {
        needsOptimization: true,
        originalSql: clean,
        optimizedSql: optimized,
        explanation: 'Replace old ANSI-89 comma-based join style with explicit ANSI-92 INNER JOIN ON query structures. Explicit joins separating filtration conditions from join paths compile faster and prevent accidental Cartesian products.',
        performanceGain: '25% improvement in execution plan compilation'
      };
    }
  }

  // 4. Rule: Full table query without LIMIT or filters
  if (!lowercase.includes('where') && !lowercase.includes('limit') && 
      (lowercase.includes('from students') || lowercase.includes('from departments'))) {
    const optimized = clean.endsWith(';') 
      ? clean.slice(0, -1) + ' LIMIT 10;' 
      : clean + ' LIMIT 10;';
    return {
      needsOptimization: true,
      originalSql: clean,
      optimizedSql: optimized,
      explanation: 'Performing query scans without filter constraints (WHERE) or row constraints (LIMIT) scans all rows in the dataset. Restricting results with a LIMIT clause decreases processing durations and memory allocation.',
      performanceGain: '40% reduction in query execution latency'
    };
  }

  // 5. Rule: Leading Wildcard search pattern (LIKE '%value%')
  if (lowercase.includes("like '%") && lowercase.includes("%'")) {
    // If we have a leading wildcard, suggest prefix matching or specify search indexing
    const valMatch = clean.match(/like\s+'%([^%']+)%'/i);
    const searchTerm = valMatch ? valMatch[1] : 'term';
    return {
      needsOptimization: true,
      originalSql: clean,
      optimizedSql: clean.replace(/like\s+'%([^%']+)%'/gi, `like '${searchTerm}%'`),
      explanation: 'Leading wildcards in LIKE patterns (LIKE \'%value%\') prevent the SQL optimizer from using indexes, forcing full table scans. If possible, convert to prefix search patterns (LIKE \'value%\') to utilize indexes.',
      performanceGain: '50% faster query times (utilizes index scan vs table scan)'
    };
  }

  return {
    needsOptimization: false,
    originalSql: clean,
    optimizedSql: clean,
    explanation: 'Query structure complies with enterprise indexing and performance standards.',
    performanceGain: 'Optimal'
  };
}
