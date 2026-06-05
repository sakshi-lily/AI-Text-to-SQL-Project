import axios from 'axios';
import alasql from 'alasql';

const API_BASE = '/api';

// Create Axios Instance
export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Configure JWT Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-session-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// MOCK DATA SEED FILES (Mirroring local registrar database)
export const MOCK_DEPARTMENTS = [
  { id: 1, department_name: "Computer Science", head_of_department: "Dr. Alan Turing", budget: 500000 },
  { id: 2, department_name: "Mechanical", head_of_department: "Dr. Nikolaus Otto", budget: 400000 },
  { id: 3, department_name: "Electrical", head_of_department: "Dr. Nikola Tesla", budget: 450000 },
  { id: 4, department_name: "Civil", head_of_department: "Dr. Hardy Cross", budget: 380000 },
  { id: 5, department_name: "Biology", head_of_department: "Dr. Charles Darwin", budget: 350000 }
];

export const MOCK_STUDENTS = [
  { id: 1, name: "Alice Smith", email: "alice.smith@university.edu", department: "Computer Science", cgpa: 9.2 },
  { id: 2, name: "Bob Jones", email: "bob.jones@university.edu", department: "Computer Science", cgpa: 8.5 },
  { id: 3, name: "Charlie Brown", email: "charlie.brown@university.edu", department: "Electrical", cgpa: 7.8 },
  { id: 4, name: "Diana Prince", email: "diana.prince@university.edu", department: "Biology", cgpa: 9.6 },
  { id: 5, name: "Evan Wright", email: "evan.wright@university.edu", department: "Mechanical", cgpa: 6.8 },
  { id: 6, name: "Fiona Gallagher", email: "fiona.gallagher@university.edu", department: "Civil", cgpa: 8.1 },
  { id: 7, name: "George Clark", email: "george.clark@university.edu", department: "Computer Science", cgpa: 7.4 },
  { id: 8, name: "Hannah Abbott", email: "hannah.abbott@university.edu", department: "Biology", cgpa: 8.9 },
  { id: 9, name: "Ian Malcolm", email: "ian.malcolm@university.edu", department: "Biology", cgpa: 9.1 },
  { id: 10, name: "Julia Roberts", email: "julia.roberts@university.edu", department: "Civil", cgpa: 9.4 },
  { id: 11, name: "Kevin Bacon", email: "kevin.bacon@university.edu", department: "Mechanical", cgpa: 7.2 },
  { id: 12, name: "Laura Croft", email: "laura.croft@university.edu", department: "Computer Science", cgpa: 9.8 },
  { id: 13, name: "Mike Wheeler", email: "mike.wheeler@university.edu", department: "Double E (EE)", cgpa: 6.5 },
  { id: 14, name: "Nancy Wheeler", email: "nancy.wheeler@university.edu", department: "Civil", cgpa: 8.7 },
  { id: 15, name: "Oscar Martinez", email: "oscar.martinez@university.edu", department: "Computer Science", cgpa: 7.9 },
  { id: 16, name: "Pam Beesly", email: "pam.beesly@university.edu", department: "Civil", cgpa: 8.3 },
  { id: 17, name: "Quinn Fabray", email: "quinn.fabray@university.edu", department: "Mechanical", cgpa: 9.0 },
  { id: 18, name: "Ryan Howard", email: "ryan.howard@university.edu", department: "Electrical", cgpa: 6.2 }
];

let dbInitialized = false;

function initAlasqlDb() {
  if (dbInitialized) return;
  try {
    alasql('DROP TABLE IF EXISTS students');
    alasql('DROP TABLE IF EXISTS departments');

    alasql('CREATE TABLE departments (id INT PRIMARY KEY, department_name STRING, head_of_department STRING, budget INT)');
    alasql('CREATE TABLE students (id INT PRIMARY KEY, name STRING, email STRING, department STRING, cgpa REAL)');

    MOCK_DEPARTMENTS.forEach(dept => {
      alasql('INSERT INTO departments VALUES (?, ?, ?, ?)', [dept.id, dept.department_name, dept.head_of_department, dept.budget]);
    });

    MOCK_STUDENTS.forEach(stud => {
      alasql('INSERT INTO students VALUES (?, ?, ?, ?, ?)', [stud.id, stud.name, stud.email, stud.department, stud.cgpa]);
    });

    dbInitialized = true;
    console.log('Alasql Emulated MySQL Database initialized and seeded.');
  } catch (e) {
    console.error('Alasql database creation failed:', e);
  }
}

// Real endpoints implementations with offline try-catch redirects

export async function getStudents(): Promise<any[]> {
  try {
    const res = await apiClient.get('/students');
    return res.data;
  } catch (e) {
    console.warn('Backend offline: falling back to local memory students records.');
    return MOCK_STUDENTS;
  }
}

export async function getDepartments(): Promise<any[]> {
  try {
    const res = await apiClient.get('/departments');
    return res.data;
  } catch (e) {
    console.warn('Backend offline: falling back to local memory departments records.');
    return MOCK_DEPARTMENTS;
  }
}

export interface QueryExplanation {
  description: string;
  tables: string[];
  filters: string[];
  sorting: string[];
  expected_output: string;
  confidence_score: number;
}

export interface TranslationResult {
  sql: string;
  explanation: QueryExplanation;
  source: string;
}

export async function generateSQL(
  prompt: string,
  apiKey?: string,
  chatContext: any[] = []
): Promise<TranslationResult> {
  try {
    // Attempt Spring Boot generate-sql route
    const res = await apiClient.post('/generate-sql', {
      question: prompt,
      apiKey: apiKey,
      context: chatContext
    });
    return res.data;
  } catch (e) {
    console.warn('Backend generate-sql offline: running local compiler fallback.');
    
    // Direct Gemini Browser Fallback
    if (apiKey && apiKey.startsWith('AIzaSy') && apiKey.length > 20) {
      try {
        const systemInstruction = 
          "You are an expert AI Text-to-SQL translator and analyst. " +
          "Translate the user's natural language question into a SQLite query, " +
          "and explain it. You MUST respond with a JSON object in this exact structure:\n" +
          "{\n" +
          "  \"sql\": \"SELECT ...;\",\n" +
          "  \"description\": \"Simple English description of what the query does.\",\n" +
          "  \"tables\": [\"table1\", \"table2\"],\n" +
          "  \"filters\": [\"Column X must be value Y\", \"Column Z > value\"],\n" +
          "  \"sorting\": [\"Column A descending\"],\n" +
          "  \"expected_output\": \"Description of the columns and data returned.\",\n" +
          "  \"confidence_score\": 98.5\n" +
          "}\n\n" +
          "The database schema represents a University Management System:\n" +
          "Table: students\n" +
          "- id (INTEGER, PRIMARY KEY)\n" +
          "- name (TEXT)\n" +
          "- email (TEXT)\n" +
          "- department (TEXT, FOREIGN KEY references departments.department_name)\n" +
          "- cgpa (REAL)\n\n" +
          "Table: departments\n" +
          "- id (INTEGER, PRIMARY KEY)\n" +
          "- department_name (TEXT)\n" +
          "- head_of_department (TEXT)\n" +
          "- budget (INTEGER)\n\n" +
          "Ensure the sql field contains valid SQLite syntax. Do not add markdown backticks around the JSON.";

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }],
            systemInstruction: {
              parts: [{
                text: systemInstruction
              }]
            },
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const resData = JSON.parse(rawText.trim());
            return {
              sql: resData.sql || "",
              explanation: {
                description: resData.description || "Translated query.",
                tables: resData.tables || ["students"],
                filters: resData.filters || [],
                sorting: resData.sorting || [],
                expected_output: resData.expected_output || "Query results.",
                confidence_score: typeof resData.confidence_score === 'number' ? resData.confidence_score : 95.0
              },
              source: "Gemini 1.5 Flash (Direct API Connection)"
            };
          }
        }
      } catch (geminiErr) {
        console.error('Direct Gemini call failed:', geminiErr);
      }
    }

    // Rule-Based Local Fallback compiler
    await new Promise(resolve => setTimeout(resolve, 600));
    const cleanPrompt = prompt.toLowerCase().trim();
    
    // Quick Rule mappings
    let sql = 'SELECT * FROM students;';
    let explanation: QueryExplanation = {
      description: 'Retrieves all column values for enrolled students.',
      tables: ['students'],
      filters: [],
      sorting: [],
      expected_output: 'Complete listing of student table rows.',
      confidence_score: 95.0
    };

    if (cleanPrompt.includes('gpa') && (cleanPrompt.includes('above 8') || cleanPrompt.includes('greater than 8'))) {
      sql = 'SELECT * FROM students WHERE cgpa > 8.0;';
      explanation = {
        description: 'Retrieves all student profiles where their current CGPA is higher than 8.0.',
        tables: ['students'],
        filters: ['CGPA must be greater than 8.0'],
        sorting: [],
        expected_output: 'Student ID, Name, Email, Department, and CGPA.',
        confidence_score: 98.0
      };
    } else if (cleanPrompt.includes('computer science') && (cleanPrompt.includes('above 3.5') || cleanPrompt.includes('gpa > 3.5'))) {
      sql = "SELECT * FROM students WHERE department = 'Computer Science' AND cgpa > 3.5;";
      explanation = {
        description: 'Retrieves students in the Computer Science department having a CGPA higher than 3.5.',
        tables: ['students'],
        filters: ["Department matches 'Computer Science'", 'CGPA must be greater than 3.5'],
        sorting: [],
        expected_output: 'Student ID, Name, Email, Department, and CGPA.',
        confidence_score: 99.0
      };
    } else if (cleanPrompt.includes('budget') || cleanPrompt.includes('head')) {
      sql = 'SELECT id, department_name, head_of_department, budget FROM departments ORDER BY budget DESC;';
      explanation = {
        description: 'Retrieves all operational departments sorted by their budgets (highest budget first).',
        tables: ['departments'],
        filters: [],
        sorting: ['Budget descending'],
        expected_output: 'Department metadata and allocations.',
        confidence_score: 97.0
      };
    } else if (cleanPrompt.includes('biology') && (cleanPrompt.includes('count') || cleanPrompt.includes('how many'))) {
      sql = "SELECT COUNT(*) FROM students WHERE department = 'Biology';";
      explanation = {
        description: 'Counts the total number of students enrolled in the Biology department.',
        tables: ['students'],
        filters: ["Department matches 'Biology'"],
        sorting: [],
        expected_output: 'A single numeric count representation.',
        confidence_score: 98.0
      };
    } else if (cleanPrompt.includes('top 3') && cleanPrompt.includes('gpa')) {
      sql = 'SELECT id, name, cgpa FROM students ORDER BY cgpa DESC LIMIT 3;';
      explanation = {
        description: 'Retrieves the top 3 highest-achieving students sorted by CGPA.',
        tables: ['students'],
        filters: ['Limit count to 3'],
        sorting: ['CGPA descending'],
        expected_output: 'Student name and GPA values.',
        confidence_score: 99.0
      };
    } else if (cleanPrompt.includes('departments') || cleanPrompt.includes('department list')) {
      sql = 'SELECT * FROM departments;';
      explanation = {
        description: 'Retrieves listing of all academic departments.',
        tables: ['departments'],
        filters: [],
        sorting: [],
        expected_output: 'ID, Name, HoD, and budget.',
        confidence_score: 95.0
      };
    }

    return {
      sql,
      explanation,
      source: 'Mock Rule-Based Translation (Stand-alone)'
    };
  }
}

export interface ExecutionResult {
  columns: string[];
  rows: any[];
  error: string;
  source?: string;
}

export async function executeQuery(sql: string): Promise<ExecutionResult> {
  try {
    const res = await apiClient.post('/execute-query', { sql });
    return { ...res.data, source: 'Spring Boot MySQL Connection' };
  } catch (e) {
    console.warn('Backend execute-query offline: running alasql simulator fallback.');
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      initAlasqlDb();
      let cleanedSql = sql.trim();
      if (cleanedSql.endsWith(';')) {
        cleanedSql = cleanedSql.slice(0, -1);
      }

      const res = alasql(cleanedSql);
      if (Array.isArray(res)) {
        if (res.length === 0) {
          return { columns: [], rows: [], error: '', source: 'alasql Sandbox' };
        }
        return {
          columns: Object.keys(res[0]),
          rows: res,
          error: '',
          source: 'alasql SQLite Simulator'
        };
      } else {
        return {
          columns: ['Status'],
          rows: [{ Status: 'Query executed successfully.' }],
          error: '',
          source: 'alasql SQLite Simulator'
        };
      }
    } catch (alasqlErr: any) {
      return {
        columns: [],
        rows: [],
        error: `SQL Execution Error: ${alasqlErr.message || alasqlErr}`,
        source: 'alasql Sandbox'
      };
    }
  }
}
