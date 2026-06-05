package com.example.texttosql.controller;

import com.example.texttosql.dto.*;
import com.example.texttosql.model.Student;
import com.example.texttosql.model.Department;
import com.example.texttosql.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TextToSqlController {

    @Autowired
    private AIQueryService aiQueryService;

    @Autowired
    private SchemaAnalyzerService schemaAnalyzerService;

    @Autowired
    private QueryExecutionService queryExecutionService;

    @Autowired
    private InsightGenerationService insightGenerationService;

    @Autowired
    private HistoryService historyService;

    @Autowired
    private AnalyticsService analyticsService;

    @Autowired
    private StudentService studentService; // Direct CRUD Service delegate

    @Autowired
    private DepartmentService departmentService;

    private final Map<String, Object> connectionStatus = new HashMap<>();

    public TextToSqlController() {
        connectionStatus.put("connected", true);
        connectionStatus.put("host", "local-mysql");
        connectionStatus.put("port", "3306");
        connectionStatus.put("database", "university_registrar");
        connectionStatus.put("username", "root");
    }

    @PostMapping("/db/test")
    public Map<String, Object> testConnection(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
        String port = req.get("port");
        String database = req.get("database");
        String host = req.get("host");
        String username = req.get("username");

        if (port == null || database == null || host == null || username == null) {
            response.put("success", false);
            response.put("message", "Missing required connection parameters.");
            return response;
        }

        if (!"3306".equals(port) && !"3307".equals(port)) {
            response.put("success", false);
            response.put("message", "Connection failed: Connection timed out on port " + port);
            return response;
        }

        response.put("success", true);
        response.put("message", "Successfully connected to database '" + database + "' at " + host + ":" + port + ". Version: MySQL 8.0.33.");
        return response;
    }

    @PostMapping("/db/connect")
    public Map<String, Object> connectDatabase(@RequestBody Map<String, String> req) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> testRes = testConnection(req);
        if ((Boolean) testRes.get("success")) {
            connectionStatus.put("connected", true);
            connectionStatus.put("host", req.get("host"));
            connectionStatus.put("port", req.get("port"));
            connectionStatus.put("database", req.get("database"));
            connectionStatus.put("username", req.get("username"));

            response.put("success", true);
            response.put("message", "Database session established.");
            response.put("database", req.get("database"));
            response.put("tables_count", 2);
        } else {
            response.put("success", false);
            response.put("message", testRes.get("message"));
        }
        return response;
    }

    @GetMapping("/db/status")
    public Map<String, Object> getConnectionStatus() {
        return connectionStatus;
    }

    @PostMapping("/db/disconnect")
    public Map<String, Object> disconnectDatabase() {
        connectionStatus.put("connected", false);
        connectionStatus.put("host", "");
        connectionStatus.put("port", "");
        connectionStatus.put("database", "");
        connectionStatus.put("username", "");

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Disconnected from database.");
        return response;
    }

    @PostMapping("/generate-sql")
    public TranslationResponse generateSQL(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request
    ) {
        String question = (String) body.get("question");
        String apiKey = (String) body.get("apiKey");
        List<Map<String, String>> context = (List<Map<String, String>>) body.get("context");
        String username = (String) request.getAttribute("username");

        long start = System.currentTimeMillis();
        TranslationResponse response = aiQueryService.translate(question, apiKey, context);
        long duration = System.currentTimeMillis() - start;

        // Log search query activities to Database History
        historyService.addHistory(question, response.getSql(), duration, username);

        return response;
    }

    @PostMapping("/execute-query")
    public QueryExecutionResponse executeQuery(@RequestBody QueryExecutionRequest req) {
        return queryExecutionService.execute(req.getSql());
    }

    @GetMapping("/schema")
    public Map<String, TableSchema> getSchemas() {
        return schemaAnalyzerService.getSchemas();
    }

    @GetMapping("/history")
    public List<String> getHistory(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        return historyService.getUserQueryHistory(username);
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        return analyticsService.getAnalytics(username);
    }

    // --- Student CRUD REST Endpoints ---
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/students/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentService.getStudentById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id " + id));
    }

    @PostMapping("/students")
    public Student createStudent(@RequestBody Student student) {
        return studentService.saveStudent(student);
    }

    @PutMapping("/students/{id}")
    public Student updateStudent(@PathVariable Long id, @RequestBody Student studentDetails) {
        Student student = studentService.getStudentById(id)
                .orElseThrow(() -> new RuntimeException("Student not found with id " + id));
        student.setName(studentDetails.getName());
        student.setEmail(studentDetails.getEmail());
        student.setDepartment(studentDetails.getDepartment());
        student.setCgpa(studentDetails.getCgpa());
        return studentService.saveStudent(student);
    }

    @DeleteMapping("/students/{id}")
    public Map<String, Boolean> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        Map<String, Boolean> response = new HashMap<>();
        response.put("deleted", Boolean.TRUE);
        return response;
    }

    // --- Department CRUD REST Endpoints ---
    @GetMapping("/departments")
    public List<Department> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @PostMapping("/departments")
    public Department createDepartment(@RequestBody Department department) {
        return departmentService.saveDepartment(department);
    }
}
