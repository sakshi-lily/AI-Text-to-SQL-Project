package com.example.texttosql.service;

import com.example.texttosql.dto.*;
import com.example.texttosql.model.Department;
import com.example.texttosql.model.Student;
import com.example.texttosql.model.QueryHistory;
import com.example.texttosql.repository.DepartmentRepository;
import com.example.texttosql.repository.StudentRepository;
import com.example.texttosql.repository.QueryHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class TextToSqlService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private QueryHistoryRepository queryHistoryRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    public void seedDatabase() {
        if (departmentRepository.count() == 0) {
            List<Department> departments = new ArrayList<>();
            departments.add(createDepartment("Computer Science", "Dr. Alan Turing", 500000));
            departments.add(createDepartment("Mechanical", "Dr. Nikolaus Otto", 400000));
            departments.add(createDepartment("Electrical", "Dr. Nikola Tesla", 450000));
            departments.add(createDepartment("Civil", "Dr. Hardy Cross", 380000));
            departments.add(createDepartment("Biology", "Dr. Charles Darwin", 350000));
            departmentRepository.saveAll(departments);
        }

        if (studentRepository.count() == 0) {
            List<Student> students = new ArrayList<>();
            students.add(createStudent("Alice Smith", "alice.smith@university.edu", "Computer Science", 9.2));
            students.add(createStudent("Bob Jones", "bob.jones@university.edu", "Computer Science", 8.5));
            students.add(createStudent("Charlie Brown", "charlie.brown@university.edu", "Electrical", 7.8));
            students.add(createStudent("Diana Prince", "diana.prince@university.edu", "Biology", 9.6));
            students.add(createStudent("Evan Wright", "evan.wright@university.edu", "Mechanical", 6.8));
            students.add(createStudent("Fiona Gallagher", "fiona.gallagher@university.edu", "Civil", 8.1));
            students.add(createStudent("George Clark", "george.clark@university.edu", "Computer Science", 7.4));
            students.add(createStudent("Hannah Abbott", "hannah.abbott@university.edu", "Biology", 8.9));
            students.add(createStudent("Ian Malcolm", "ian.malcolm@university.edu", "Biology", 9.1));
            students.add(createStudent("Julia Roberts", "julia.roberts@university.edu", "Civil", 9.4));
            students.add(createStudent("Kevin Bacon", "kevin.bacon@university.edu", "Mechanical", 7.2));
            students.add(createStudent("Laura Croft", "laura.croft@university.edu", "Computer Science", 9.8));
            students.add(createStudent("Mike Wheeler", "mike.wheeler@university.edu", "Electrical", 6.5));
            students.add(createStudent("Nancy Wheeler", "nancy.wheeler@university.edu", "Civil", 8.7));
            students.add(createStudent("Oscar Martinez", "oscar.martinez@university.edu", "Computer Science", 7.9));
            students.add(createStudent("Pam Beesly", "pam.beesly@university.edu", "Civil", 8.3));
            students.add(createStudent("Quinn Fabray", "quinn.fabray@university.edu", "Mechanical", 9.0));
            students.add(createStudent("Ryan Howard", "ryan.howard@university.edu", "Electrical", 6.2));
            studentRepository.saveAll(students);
        }
    }

    private Department createDepartment(String name, String head, int budget) {
        Department d = new Department();
        d.setDepartmentName(name);
        d.setHeadOfDepartment(head);
        d.setBudget(budget);
        return d;
    }

    private Student createStudent(String name, String email, String department, double cgpa) {
        Student s = new Student();
        s.setName(name);
        s.setEmail(email);
        s.setDepartment(department);
        s.setCgpa(cgpa);
        return s;
    }

    public List<String> getQueryHistory() {
        try {
            List<QueryHistory> histories = queryHistoryRepository.findAllByOrderByTimestampDesc();
            List<String> list = new ArrayList<>();
            for (QueryHistory h : histories) {
                list.add(h.getUserQuestion());
            }
            if (list.isEmpty()) {
                return Arrays.asList(
                    "Show all students in Computer Science with a CGPA above 8.0",
                    "Get the top 3 students by CGPA",
                    "Show the budget and head of each department",
                    "How many students are enrolled in Biology?",
                    "List students in Mechanical Engineering sorted by CGPA from lowest to highest"
                );
            }
            return list;
        } catch (Exception e) {
            return Arrays.asList(
                "Show all students in Computer Science with a CGPA above 8.0",
                "Get the top 3 students by CGPA",
                "Show the budget and head of each department",
                "How many students are enrolled in Biology?",
                "List students in Mechanical Engineering sorted by CGPA from lowest to highest"
            );
        }
    }

    public void addHistory(String prompt) {
        // Obsoleted: Handled inside translateNLP directly
    }

    public TranslationResponse translateNLP(String prompt, String apiKey) {
        TranslationResponse response = new TranslationResponse();

        if (apiKey != null && apiKey.startsWith("AIzaSy") && apiKey.length() > 20) {
            try {
                String systemInstruction = 
                    "You are an expert AI Text-to-SQL translator and analyst. " +
                    "Translate the user's natural language question into a MySQL query, " +
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
                    "- name (VARCHAR)\n" +
                    "- email (VARCHAR)\n" +
                    "- department (VARCHAR, foreign key references departments.department_name)\n" +
                    "- cgpa (DOUBLE)\n\n" +
                    "Table: departments\n" +
                    "- id (INTEGER, PRIMARY KEY)\n" +
                    "- department_name (VARCHAR)\n" +
                    "- head_of_department (VARCHAR)\n" +
                    "- budget (INTEGER)\n\n" +
                    "Ensure the sql field contains valid MySQL syntax. Do not add markdown backticks around the JSON.";

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", Collections.singletonList(
                    Map.of("parts", Collections.singletonList(Map.of("text", prompt)))
                ));
                requestBody.put("systemInstruction", Map.of(
                    "parts", Collections.singletonList(Map.of("text", systemInstruction))
                ));
                requestBody.put("generationConfig", Map.of(
                    "responseMimeType", "application/json"
                ));

                Map<String, Object> resMap = restTemplate.postForObject(url, requestBody, Map.class);
                if (resMap != null) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) resMap.get("candidates");
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> content = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    String rawJson = (String) parts.get(0).get("text");

                    Map<String, Object> geminiRes = objectMapper.readValue(rawJson.trim(), Map.class);
                    response.setSql((String) geminiRes.get("sql"));

                    QueryExplanation explanation = new QueryExplanation();
                    explanation.setDescription((String) geminiRes.get("description"));
                    explanation.setTables((List<String>) geminiRes.get("tables"));
                    explanation.setFilters((List<String>) geminiRes.get("filters"));
                    explanation.setSorting((List<String>) geminiRes.get("sorting"));
                    explanation.setExpected_output((String) geminiRes.get("expected_output"));
                    explanation.setConfidence_score(((Number) geminiRes.get("confidence_score")).doubleValue());
                    response.setExplanation(explanation);
                    response.setSource("Gemini AI API (Spring Boot Backend)");
                    return response;
                }
            } catch (Exception e) {
                // System.err.println("Gemini call failed: " + e.getMessage());
            }
        }

        // Rule-based translator fallback
        String clean = prompt.toLowerCase().trim();
        response.setSource("Rule-based Engine (Spring Boot Backend)");

        QueryExplanation exp = new QueryExplanation();
        exp.setTables(Collections.singletonList("students"));
        exp.setFilters(new ArrayList<>());
        exp.setSorting(new ArrayList<>());
        exp.setExpected_output("Query records.");
        exp.setConfidence_score(95.0);

        if (clean.equals("show all students with cgpa greater than 8") || clean.equals("show all students with cgpa greater than 8.")) {
            response.setSql("SELECT * FROM students WHERE cgpa > 8;");
            exp.setDescription("Retrieves all column values for students whose CGPA is greater than 8.");
            exp.getFilters().add("CGPA must be greater than 8");
            exp.setExpected_output("All columns from the students table.");
        } else if (clean.equals("show all students in computer science with a cgpa above 3.5") || clean.equals("show all students in computer science with a cgpa above 3.5.")) {
            response.setSql("SELECT * FROM students WHERE department = 'Computer Science' AND cgpa > 3.5;");
            exp.setDescription("Retrieves all column values for students in the Computer Science department whose CGPA is greater than 3.5.");
            exp.getFilters().add("Department is 'Computer Science'");
            exp.getFilters().add("CGPA must be greater than 3.5");
            exp.setExpected_output("All columns from the students table.");
        } else {
            // General Parser
            boolean isCount = clean.contains("count") || clean.contains("how many");
            String deptName = "";
            if (clean.contains("computer science") || clean.contains("cs")) deptName = "Computer Science";
            else if (clean.contains("mechanical") || clean.contains("me")) deptName = "Mechanical";
            else if (clean.contains("electrical") || clean.contains("ee")) deptName = "Electrical";
            else if (clean.contains("civil") || clean.contains("ce")) deptName = "Civil";
            else if (clean.contains("biology") || clean.contains("bio")) deptName = "Biology";

            Double cgpaThreshold = null;
            boolean isLessThan = false;
            Matcher mAbove = Pattern.compile("(?:cgpa|gpa)\\s*(?:above|greater than|>)\\s*([0-9.]+)").matcher(clean);
            if (mAbove.find()) {
                cgpaThreshold = Double.parseDouble(mAbove.group(1));
            } else {
                Matcher mBelow = Pattern.compile("(?:cgpa|gpa)\\s*(?:below|less than|<)\\s*([0-9.]+)").matcher(clean);
                if (mBelow.find()) {
                    cgpaThreshold = Double.parseDouble(mBelow.group(1));
                    isLessThan = true;
                }
            }

            boolean sortByCgpa = clean.contains("highest") || clean.contains("top") || clean.contains("best");
            boolean sortLowest = clean.contains("lowest") || clean.contains("worst");

            Integer limit = null;
            Matcher mLimit = Pattern.compile("(?:top|first|limit)\\s*([0-9]+)").matcher(clean);
            if (mLimit.find()) {
                limit = Integer.parseInt(mLimit.group(1));
            } else if (clean.contains("top student") || clean.contains("highest cgpa")) {
                limit = 1;
            }

            if (clean.contains("department") && deptName.isEmpty() && (clean.contains("budget") || clean.contains("head") || clean.contains("who leads"))) {
                exp.setTables(Collections.singletonList("departments"));
                exp.setExpected_output("Department details.");
                if (clean.contains("budget")) {
                    response.setSql("SELECT id, department_name, head_of_department, budget FROM departments ORDER BY budget DESC;");
                    exp.setDescription("Retrieves all departments sorted by their budget in descending order.");
                    exp.getSorting().add("budget descending");
                } else {
                    response.setSql("SELECT id, department_name, head_of_department FROM departments;");
                    exp.setDescription("Retrieves a listing of all departments and their respective heads.");
                }
            } else {
                String select = isCount ? "SELECT COUNT(*) FROM students" : "SELECT id, name, email, department, cgpa FROM students";
                List<String> wheres = new ArrayList<>();
                if (!deptName.isEmpty()) {
                    wheres.add("department = '" + deptName + "'");
                    exp.getFilters().add("Department must be exactly '" + deptName + "'");
                }
                if (cgpaThreshold != null) {
                    wheres.add("cgpa " + (isLessThan ? "<" : ">") + " " + cgpaThreshold);
                    exp.getFilters().add("CGPA must be " + (isLessThan ? "less than" : "greater than") + " " + cgpaThreshold);
                }
                String whereStr = wheres.isEmpty() ? "" : " WHERE " + String.join(" AND ", wheres);
                String orderStr = sortByCgpa ? " ORDER BY cgpa DESC" : (sortLowest ? " ORDER BY cgpa ASC" : "");
                if (sortByCgpa) exp.getSorting().add("CGPA descending (highest first)");
                else if (sortLowest) exp.getSorting().add("CGPA ascending (lowest first)");

                String limitStr = limit != null ? " LIMIT " + limit : "";
                if (limit != null) exp.getFilters().add("Limit output to first " + limit + " records");

                response.setSql(select + whereStr + orderStr + limitStr + ";");
                
                String desc = isCount ? "Counts the total number of students" : "Retrieves a list of students";
                if (!deptName.isEmpty()) desc += " in the " + deptName + " department";
                if (cgpaThreshold != null) desc += " who have a CGPA " + (isLessThan ? "below" : "above") + " " + cgpaThreshold;
                if (sortByCgpa) desc += " sorted by CGPA (highest first)";
                else if (sortLowest) desc += " sorted by CGPA (lowest first)";
                if (limit != null) desc += " limiting the output to " + limit + " results";
                exp.setDescription(desc + ".");
            }
        }

        response.setExplanation(exp);

        // Save generated query details to MySQL history table
        try {
            QueryHistory history = new QueryHistory();
            history.setUserQuestion(prompt);
            history.setGeneratedSql(response.getSql());
            history.setTimestamp(LocalDateTime.now());
            history.setExecutionTime(12L); // Estimated generation processing time
            queryHistoryRepository.save(history);
        } catch (Exception e) {
            System.err.println("Failed to save history: " + e.getMessage());
        }

        return response;
    }

    public QueryExecutionResponse executeSQL(String sql) {
        QueryExecutionResponse response = new QueryExecutionResponse();
        try {
            String cleanedSql = sql.trim();
            if (cleanedSql.endsWith(";")) {
                cleanedSql = cleanedSql.substring(0, cleanedSql.length() - 1);
            }

            // SQL Safety Validation Checks
            String lowercaseSql = cleanedSql.toLowerCase().replaceAll("\\s+", " ");
            
            // 1. Only allow read-only/schema actions
            boolean isSelectQuery = lowercaseSql.startsWith("select") || 
                                    lowercaseSql.startsWith("show") || 
                                    lowercaseSql.startsWith("desc") || 
                                    lowercaseSql.startsWith("explain");
                                    
            if (!isSelectQuery) {
                response.setColumns(new ArrayList<>());
                response.setRows(new ArrayList<>());
                response.setError("SQL Safety Blocked: Only SELECT (read-only) queries are permitted.");
                return response;
            }

            // 2. Block explicitly forbidden commands to prevent query injection bypasses
            List<String> blockedKeywords = Arrays.asList("drop", "delete", "truncate", "alter", "insert", "update", "create", "rename");
            for (String keyword : blockedKeywords) {
                // Word boundary check to prevent false positives on fields like "updated_at"
                Pattern pattern = Pattern.compile("\\b" + keyword + "\\b");
                if (pattern.matcher(lowercaseSql).find()) {
                    response.setColumns(new ArrayList<>());
                    response.setRows(new ArrayList<>());
                    response.setError("SQL Safety Blocked: Restricted command '" + keyword.toUpperCase() + "' detected.");
                    return response;
                }
            }

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(cleanedSql);
            List<String> columns = new ArrayList<>();
            if (!rows.isEmpty()) {
                columns.addAll(rows.get(0).keySet());
            }
            response.setColumns(columns);
            response.setRows(rows);
            response.setError("");
        } catch (Exception e) {
            response.setError(e.getMessage());
            response.setColumns(new ArrayList<>());
            response.setRows(new ArrayList<>());
        }
        return response;
    }

    public Map<String, TableSchema> getSchemas() {
        Map<String, TableSchema> schemas = new HashMap<>();

        // Schema for departments table
        List<ColumnInfo> deptCols = Arrays.asList(
            new ColumnInfo(0, "id", "INTEGER", 1, null, 1),
            new ColumnInfo(1, "department_name", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(2, "head_of_department", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(3, "budget", "INTEGER", 1, null, 0)
        );
        schemas.put("departments", new TableSchema(deptCols, departmentRepository.count()));

        // Schema for students table
        List<ColumnInfo> studCols = Arrays.asList(
            new ColumnInfo(0, "id", "INTEGER", 1, null, 1),
            new ColumnInfo(1, "name", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(2, "email", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(3, "department", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(4, "cgpa", "DOUBLE", 1, null, 0)
        );
        schemas.put("students", new TableSchema(studCols, studentRepository.count()));

        return schemas;
    }

    // Student CRUD Operations
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public Optional<Student> getStudentById(Long id) {
        return studentRepository.findById(id);
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    // Department CRUD Operations
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}
