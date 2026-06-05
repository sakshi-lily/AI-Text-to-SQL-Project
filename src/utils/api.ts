// API Service for communicating with the Python FastAPI Backend
// Contains a robust client-side fallback to make the app fully functional stand-alone.
import alasql from 'alasql';
import axios from 'axios';

const API_BASE = '/api';
const CONNECT_REAL_APIS = true; // Set to true when live backend is ready to integrate

export interface ColumnInfo {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export interface TableSchema {
  columns: ColumnInfo[];
  count: number;
}

export interface DbSchemas {
  [tableName: string]: TableSchema;
}

export interface ConnectionStatus {
  connected: boolean;
  host: string;
  port: string;
  database: string;
  username: string;
}

export interface QueryResult {
  columns: string[];
  rows: any[];
  error: string;
  source?: string;
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
  explanation?: QueryExplanation;
  source: string;
}

// ==========================================
// CLIENT-SIDE FALLBACK MOCK DATA & ENGINE
// ==========================================

const MOCK_DEPARTMENTS = [
  { id: 1, department_name: "Computer Science", head_of_department: "Dr. Alan Turing", budget: 500000 },
  { id: 2, department_name: "Mechanical", head_of_department: "Dr. Nikolaus Otto", budget: 400000 },
  { id: 3, department_name: "Electrical", head_of_department: "Dr. Nikola Tesla", budget: 450000 },
  { id: 4, department_name: "Civil", head_of_department: "Dr. Hardy Cross", budget: 380000 },
  { id: 5, department_name: "Biology", head_of_department: "Dr. Charles Darwin", budget: 350000 }
];

const MOCK_STUDENTS = [
  { id: 1, name: "Alice Smith", email: "alice.smith@university.edu", department_id: 1, cgpa: 9.2 },
  { id: 2, name: "Bob Jones", email: "bob.jones@university.edu", department_id: 1, cgpa: 8.5 },
  { id: 3, name: "Charlie Brown", email: "charlie.brown@university.edu", department_id: 3, cgpa: 7.8 },
  { id: 4, name: "Diana Prince", email: "diana.prince@university.edu", department_id: 5, cgpa: 9.6 },
  { id: 5, name: "Evan Wright", email: "evan.wright@university.edu", department_id: 2, cgpa: 6.8 },
  { id: 6, name: "Fiona Gallagher", email: "fiona.gallagher@university.edu", department_id: 4, cgpa: 8.1 },
  { id: 7, name: "George Clark", email: "george.clark@university.edu", department_id: 1, cgpa: 7.4 },
  { id: 8, name: "Hannah Abbott", email: "hannah.abbott@university.edu", department_id: 5, cgpa: 8.9 },
  { id: 9, name: "Ian Malcolm", email: "ian.malcolm@university.edu", department_id: 5, cgpa: 9.1 },
  { id: 10, name: "Julia Roberts", email: "julia.roberts@university.edu", department_id: 4, cgpa: 9.4 },
  { id: 11, name: "Kevin Bacon", email: "kevin.bacon@university.edu", department_id: 2, cgpa: 7.2 },
  { id: 12, name: "Laura Croft", email: "laura.croft@university.edu", department_id: 1, cgpa: 9.8 },
  { id: 13, name: "Mike Wheeler", email: "mike.wheeler@university.edu", department_id: 3, cgpa: 6.5 },
  { id: 14, name: "Nancy Wheeler", email: "nancy.wheeler@university.edu", department_id: 4, cgpa: 8.7 },
  { id: 15, name: "Oscar Martinez", email: "oscar.martinez@university.edu", department_id: 1, cgpa: 7.9 },
  { id: 16, name: "Pam Beesly", email: "pam.beesly@university.edu", department_id: 4, cgpa: 8.3 },
  { id: 17, name: "Quinn Fabray", email: "quinn.fabray@university.edu", department_id: 2, cgpa: 9.0 },
  { id: 18, name: "Ryan Howard", email: "ryan.howard@university.edu", department_id: 3, cgpa: 6.2 }
];

const MOCK_SCHEMAS: DbSchemas = {
  students: {
    columns: [
      { cid: 0, name: "id", type: "INTEGER", notnull: 1, dflt_value: null, pk: 1 },
      { cid: 1, name: "name", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
      { cid: 2, name: "email", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
      { cid: 3, name: "department", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
      { cid: 4, name: "cgpa", type: "REAL", notnull: 1, dflt_value: null, pk: 0 }
    ],
    count: 18
  },
  departments: {
    columns: [
      { cid: 0, name: "id", type: "INTEGER", notnull: 1, dflt_value: null, pk: 1 },
      { cid: 1, name: "department_name", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
      { cid: 2, name: "head_of_department", type: "TEXT", notnull: 1, dflt_value: null, pk: 0 },
      { cid: 3, name: "budget", type: "INTEGER", notnull: 1, dflt_value: null, pk: 0 }
    ],
    count: 5
  }
};

let fallbackConnectionState: ConnectionStatus = {
  connected: true,
  host: "local-sqlite-client",
  port: "3306",
  database: "university_registrar_client",
  username: "client_user"
};

// Client-side rule-based translator
function clientTranslate(prompt: string): string {
  const clean = prompt.toLowerCase().trim();
  if (clean === "show all students with cgpa greater than 8" || clean === "show all students with cgpa greater than 8.") {
    return "SELECT * FROM students WHERE cgpa > 8;";
  }
  if (clean === "show all students in computer science with a cgpa above 3.5" || clean === "show all students in computer science with a cgpa above 3.5.") {
    return "SELECT * FROM students\nWHERE department = 'Computer Science'\nAND cgpa > 3.5;";
  }
  let isCount = clean.includes("count") || clean.includes("how many");
  
  let deptId: number | null = null;
  let deptName = "";
  if (clean.includes("computer science") || clean.includes("cs")) { deptId = 1; deptName = "Computer Science"; }
  else if (clean.includes("mechanical") || clean.includes("me")) { deptId = 2; deptName = "Mechanical"; }
  else if (clean.includes("electrical") || clean.includes("ee")) { deptId = 3; deptName = "Electrical"; }
  else if (clean.includes("civil") || clean.includes("ce")) { deptId = 4; deptName = "Civil"; }
  else if (clean.includes("biology") || clean.includes("bio")) { deptId = 5; deptName = "Biology"; }

  let cgpaThreshold: number | null = null;
  let isLessThan = false;
  let matchAbove = clean.match(/(?:cgpa|gpa)\s*(?:above|greater than|>)\s*([0-9.]+)/);
  if (matchAbove) {
    cgpaThreshold = parseFloat(matchAbove[1]);
  } else {
    let matchBelow = clean.match(/(?:cgpa|gpa)\s*(?:below|less than|<)\s*([0-9.]+)/);
    if (matchBelow) {
      cgpaThreshold = parseFloat(matchBelow[1]);
      isLessThan = true;
    }
  }

  let sortByCgpa = clean.includes("highest") || clean.includes("top") || clean.includes("best");
  let sortLowest = clean.includes("lowest") || clean.includes("worst");

  let limit: number | null = null;
  let limitMatch = clean.match(/(?:top|first|limit)\s*([0-9]+)/);
  if (limitMatch) {
    limit = parseInt(limitMatch[1], 10);
  } else if (clean.includes("top student") || clean.includes("highest cgpa")) {
    limit = 1;
  }

  // Generate SQL string
  let select = isCount ? "SELECT COUNT(*) FROM students" : "SELECT id, name, email, department, cgpa FROM students";
  let whereClauses: string[] = [];
  
  if (deptName) whereClauses.push(`department = '${deptName}'`);
  if (cgpaThreshold !== null) {
    whereClauses.push(`cgpa ${isLessThan ? '<' : '>'} ${cgpaThreshold}`);
  }
  
  let where = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(" AND ")}` : "";
  let order = sortByCgpa ? " ORDER BY cgpa DESC" : (sortLowest ? " ORDER BY cgpa ASC" : "");
  let limitStr = limit ? ` LIMIT ${limit}` : "";

  if (clean.includes("department") && deptId === null && (clean.includes("budget") || clean.includes("head") || clean.includes("who leads"))) {
    if (clean.includes("budget")) {
      return "SELECT id, department_name, head_of_department, budget FROM departments ORDER BY budget DESC;";
    }
    return "SELECT id, department_name, head_of_department FROM departments;";
  }

  let finalSql = `${select}${where}${order}${limitStr};`;
  if (finalSql === "SELECT id, name, email, department, cgpa FROM students;") {
    if (clean.includes("department") && clean.includes("budget")) {
      return "SELECT id, department_name, head_of_department, budget FROM departments;";
    } else if (clean.includes("department")) {
      return "SELECT * FROM departments;";
    }
  }
  
  return finalSql;
}

// Client-side rule-based explanation generator
function clientExplain(prompt: string): QueryExplanation {
  const clean = prompt.toLowerCase().trim();
  if (clean === "show all students with cgpa greater than 8" || clean === "show all students with cgpa greater than 8.") {
    return {
      description: "Retrieves all column values for students whose CGPA is greater than 8.",
      tables: ["students"],
      filters: ["CGPA must be greater than 8"],
      sorting: [],
      expected_output: "All columns from the students table.",
      confidence_score: 99.0
    };
  }
  if (clean === "show all students in computer science with a cgpa above 3.5" || clean === "show all students in computer science with a cgpa above 3.5.") {
    return {
      description: "Retrieves all column values for students in the Computer Science department whose CGPA is greater than 3.5.",
      tables: ["students"],
      filters: ["Department is 'Computer Science'", "CGPA must be greater than 3.5"],
      sorting: [],
      expected_output: "All columns from the students table.",
      confidence_score: 99.0
    };
  }
  let isCount = clean.includes("count") || clean.includes("how many");
  
  let deptId: number | null = null;
  let deptName = "";
  if (clean.includes("computer science") || clean.includes("cs")) { deptId = 1; deptName = "Computer Science"; }
  else if (clean.includes("mechanical") || clean.includes("me")) { deptId = 2; deptName = "Mechanical"; }
  else if (clean.includes("electrical") || clean.includes("ee")) { deptId = 3; deptName = "Electrical"; }
  else if (clean.includes("civil") || clean.includes("ce")) { deptId = 4; deptName = "Civil"; }
  else if (clean.includes("biology") || clean.includes("bio")) { deptId = 5; deptName = "Biology"; }

  let cgpaThreshold: number | null = null;
  let isLessThan = false;
  let matchAbove = clean.match(/(?:cgpa|gpa)\s*(?:above|greater than|>)\s*([0-9.]+)/);
  if (matchAbove) {
    cgpaThreshold = parseFloat(matchAbove[1]);
  } else {
    let matchBelow = clean.match(/(?:cgpa|gpa)\s*(?:below|less than|<)\s*([0-9.]+)/);
    if (matchBelow) {
      cgpaThreshold = parseFloat(matchBelow[1]);
      isLessThan = true;
    }
  }

  let sortByCgpa = clean.includes("highest") || clean.includes("top") || clean.includes("best");
  let sortLowest = clean.includes("lowest") || clean.includes("worst");

  let limit: number | null = null;
  let limitMatch = clean.match(/(?:top|first|limit)\s*([0-9]+)/);
  if (limitMatch) {
    limit = parseInt(limitMatch[1], 10);
  } else if (clean.includes("top student") || clean.includes("highest cgpa")) {
    limit = 1;
  }

  const filters: string[] = [];
  const sorting: string[] = [];
  let tables = ["students"];
  let description = "Retrieves student profiles from the university database.";
  let expected_output = isCount ? "A numerical count of students matching the filters." : "ID, Name, Email, Department, and CGPA.";

  if (deptName) filters.push(`Department must be exactly '${deptName}'`);
  if (cgpaThreshold !== null) {
    filters.push(`CGPA must be ${isLessThan ? 'less than' : 'greater than'} ${cgpaThreshold}`);
  }
  if (sortByCgpa) sorting.push("CGPA descending (highest first)");
  else if (sortLowest) sorting.push("CGPA ascending (lowest first)");
  if (limit) filters.push(`Limit output to first ${limit} record${limit > 1 ? 's' : ''}`);

  if (clean.includes("department") && deptId === null && (clean.includes("budget") || clean.includes("head") || clean.includes("who leads"))) {
    tables = ["departments"];
    expected_output = "Department ID, Name, Head, and budget metrics.";
    if (clean.includes("budget")) {
      description = "Retrieves all departments sorted by their annual budget in descending order.";
      sorting.push("budget descending");
    } else {
      description = "Retrieves a listing of all departments and their respective heads.";
    }
  } else {
    let descParts = [];
    if (isCount) descParts.push("counts the total number of students");
    else descParts.push("retrieves a list of students");
    
    if (deptId !== null) descParts.push(`in the ${deptName} department`);
    if (cgpaThreshold !== null) descParts.push(`who have a CGPA ${isLessThan ? 'below' : 'above'} ${cgpaThreshold}`);
    if (sortByCgpa) descParts.push("sorted by CGPA (highest first)");
    else if (sortLowest) descParts.push("sorted by CGPA (lowest first)");
    if (limit) descParts.push(`limiting the output to ${limit} result${limit > 1 ? 's' : ''}`);
    
    description = descParts.join(" ") + ".";
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }

  let score = 95.0;
  if (deptId !== null) score += 1.0;
  if (cgpaThreshold !== null) score += 1.5;
  if (limit) score += 1.0;

  return {
    description,
    tables,
    filters,
    sorting,
    expected_output,
    confidence_score: Math.min(score, 99.5)
  };
}

// Client-side in-memory SQLite database setup
let dbInitialized = false;

function initMockDb() {
  if (dbInitialized) return;
  try {
    // Drop tables if they exist
    try {
      alasql('DROP TABLE IF EXISTS students');
      alasql('DROP TABLE IF EXISTS departments');
    } catch (e) {}

    // Create departments table
    alasql('CREATE TABLE departments (id INT PRIMARY KEY, department_name STRING, head_of_department STRING, budget INT)');
    
    // Create students table
    alasql('CREATE TABLE students (id INT PRIMARY KEY, name STRING, email STRING, department STRING, cgpa REAL)');

    // Seed departments (5 departments)
    MOCK_DEPARTMENTS.forEach(dept => {
      alasql('INSERT INTO departments VALUES (?, ?, ?, ?)', [
        dept.id,
        dept.department_name,
        dept.head_of_department,
        dept.budget
      ]);
    });

    // Seed students (18 students)
    const seededStudents = MOCK_STUDENTS.map(s => {
      const deptLookup: Record<number, string> = {
        1: "Computer Science",
        2: "Mechanical",
        3: "Electrical",
        4: "Civil",
        5: "Biology"
      };
      return {
        id: s.id,
        name: s.name,
        email: s.email,
        department: deptLookup[s.department_id] || "Unknown",
        cgpa: s.cgpa
      };
    });

    seededStudents.forEach(stud => {
      alasql('INSERT INTO students VALUES (?, ?, ?, ?, ?)', [
        stud.id,
        stud.name,
        stud.email,
        stud.department,
        stud.cgpa
      ]);
    });

    dbInitialized = true;
    console.log("alasql: mock university database initialized and seeded.");
  } catch (e) {
    console.error("alasql initialization failed:", e);
  }
}

// Client-side mock SQL executor
function clientExecute(sql: string): QueryResult {
  if (!fallbackConnectionState.connected) {
    return { columns: [], rows: [], error: "No active database connection." };
  }

  try {
    initMockDb();

    let cleanedSql = sql.trim();
    if (cleanedSql.endsWith(';')) {
      cleanedSql = cleanedSql.slice(0, -1);
    }

    const res = alasql(cleanedSql);
    
    if (Array.isArray(res)) {
      if (res.length === 0) {
        return {
          columns: [],
          rows: [],
          error: ""
        };
      }
      
      const columns = Object.keys(res[0]);
      return {
        columns,
        rows: res,
        error: ""
      };
    } else {
      return {
        columns: ["Status"],
        rows: [{ Status: `Query executed successfully.` }],
        error: ""
      };
    }
  } catch (err: any) {
    return {
      columns: [],
      rows: [],
      error: `SQL Execution Error: ${err.message || err}`
    };
  }
}

// ==========================================
// EXPOSED API CLIENT METHODS
// ==========================================

export async function testConnection(params: any): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axios.post(`${API_BASE}/db/test`, params);
    return res.data;
  } catch (e: any) {
    // Client-side fallback testing
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate networking loading state
    if (params.port !== "5432" && params.port !== "3306") {
      return { success: false, message: `Connection failed: Connection timed out on port ${params.port} (Client Simulation).` };
    }
    return { success: true, message: `Successfully connected to database '${params.database}' at ${params.host}:${params.port}. (Client-Side Simulation)` };
  }
}

export async function connectDatabase(params: any): Promise<{ success: boolean; message: string; database?: string }> {
  try {
    const res = await axios.post(`${API_BASE}/db/connect`, params);
    return res.data;
  } catch (e) {
    // Client-side fallback connection
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate loading state
    fallbackConnectionState = {
      connected: true,
      host: params.host,
      port: params.port,
      database: params.database,
      username: params.username
    };
    return { success: true, message: 'Database session established.', database: params.database };
  }
}

export async function getConnectionStatus(): Promise<ConnectionStatus> {
  try {
    const res = await axios.get(`${API_BASE}/db/status`);
    return res.data;
  } catch (e) {
    return fallbackConnectionState;
  }
}

export async function disconnectDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    const res = await axios.post(`${API_BASE}/db/disconnect`);
    return res.data;
  } catch (e) {
    fallbackConnectionState = {
      connected: false,
      host: "",
      port: "",
      database: "",
      username: ""
    };
    return { success: true, message: 'Disconnected from database.' };
  }
}

export async function translatePrompt(prompt: string, apiKey?: string): Promise<TranslationResult> {
  const endpoint = `${API_BASE}/generate-sql`;
  
  if (CONNECT_REAL_APIS) {
    try {
      const res = await axios.post(endpoint, { question: prompt, apiKey });
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.detail || e.message || "Failed to generate SQL from prompt.");
    }
  }

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

      if (!response.ok) {
        throw new Error(`Gemini API returned status ${response.status}`);
      }

      const resJson = await response.json();
      const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error("Empty response from Gemini API");
      }

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
    } catch (e: any) {
      console.warn("Direct Gemini translation failed, falling back to rule-based engine:", e);
    }
  }

  // Fallback to client-side rule-based translation
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (!prompt.trim()) {
    throw new Error("Query prompt cannot be empty.");
  }
  
  const sql = clientTranslate(prompt);
  const explanation = clientExplain(prompt);
  
  return {
    sql,
    explanation,
    source: "Mock NLP Translator Engine (Stand-alone)"
  };
}

export async function executeSql(sql: string): Promise<QueryResult> {
  const endpoint = `${API_BASE}/execute-query`;
  
  if (CONNECT_REAL_APIS) {
    try {
      const res = await axios.post(endpoint, { sql });
      return { ...res.data, source: "Spring Boot MySQL Connection" };
    } catch (e: any) {
      return {
        columns: [],
        rows: [],
        error: `Network error during execution: ${e.response?.data?.detail || e.message || e}`
      };
    }
  } else {
    // Mock response simulation with loading state delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!sql.trim()) {
      return {
        columns: [],
        rows: [],
        error: "SQL query string cannot be empty."
      };
    }
    
    const result = clientExecute(sql);
    return {
      ...result,
      source: "Mock In-Memory SQLite Simulator"
    };
  }
}

export async function getDbSchemas(): Promise<DbSchemas> {
  const endpoint = `${API_BASE}/schema`;
  
  if (CONNECT_REAL_APIS) {
    try {
      const res = await axios.get(endpoint);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.detail || e.message || "Unable to retrieve database schemas.");
    }
  } else {
    // Mock response simulation with loading state delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SCHEMAS;
  }
}

export async function getQueryHistory(): Promise<string[]> {
  const endpoint = `${API_BASE}/history`;
  
  if (CONNECT_REAL_APIS) {
    try {
      const res = await axios.get(endpoint);
      return res.data;
    } catch (e: any) {
      throw new Error(e.response?.data?.detail || e.message || "Unable to retrieve history logs.");
    }
  } else {
    // Mock response simulation with loading state delay
    await new Promise(resolve => setTimeout(resolve, 200));
    const saved = localStorage.getItem('query-history-list');
    return saved ? JSON.parse(saved) : [
      "Show all students in Computer Science with a CGPA above 8.0",
      "Get the top 3 students by CGPA",
      "Show the budget and head of each department",
      "How many students are enrolled in Biology?",
      "List students in Mechanical Engineering sorted by CGPA from lowest to highest"
    ];
  }
}
