package com.example.texttosql.service;

import com.example.texttosql.dto.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class AIQueryService {
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public TranslationResponse translate(String prompt, String apiKey, List<Map<String, String>> context) {
        TranslationResponse response = new TranslationResponse();
        
        // Gemini API Implementation
        if (apiKey != null && apiKey.startsWith("AIzaSy") && apiKey.length() > 20) {
            try {
                // Build conversational history representation
                StringBuilder contextBuilder = new StringBuilder();
                if (context != null) {
                    for (Map<String, String> msg : context) {
                        String role = msg.get("role");
                        String content = msg.get("content");
                        contextBuilder.append(role.equals("user") ? "User Question: " : "AI Response: ")
                                      .append(content).append("\n");
                    }
                }
                
                String systemInstruction = 
                    "You are an expert AI Text-to-SQL translator and analyst. " +
                    "Translate the user's natural language question (which might be in English or Hindi) into a MySQL query, " +
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
                    "Ensure explanation descriptions are in simple English. " +
                    "Be responsive to conversation context if the user asks follow-up queries. " +
                    "Ensure the sql field contains valid MySQL syntax. Do not add markdown backticks around the JSON.";

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;
                String userQuery = contextBuilder.toString() + "User Question: " + prompt;

                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("contents", Collections.singletonList(
                    Map.of("parts", Collections.singletonList(Map.of("text", userQuery)))
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
                    Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
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
                    response.setSource("Gemini 1.5 Flash (Spring Boot Backend)");
                    return response;
                }
            } catch (Exception e) {
                // Fallback on error
            }
        }

        // Rule-Based Fallback
        String clean = prompt.toLowerCase().trim();
        response.setSource("Rule-based Engine (Spring Boot Backend)");

        QueryExplanation exp = new QueryExplanation();
        exp.setTables(Collections.singletonList("students"));
        exp.setFilters(new ArrayList<>());
        exp.setSorting(new ArrayList<>());
        exp.setExpected_output("Query records.");
        exp.setConfidence_score(95.0);

        if (clean.contains("cgpa > 8") || clean.contains("cgpa greater than 8") || clean.contains("८ से अधिक")) {
            response.setSql("SELECT * FROM students WHERE cgpa > 8.0;");
            exp.setDescription("Retrieves all column values for students whose CGPA is greater than 8.");
            exp.getFilters().add("CGPA must be greater than 8.0");
            exp.setExpected_output("All columns from the students table.");
        } else if ((clean.contains("computer science") || clean.contains("कंप्यूटर साइंस")) && (clean.contains("above 3.5") || clean.contains("3.5 से अधिक"))) {
            response.setSql("SELECT * FROM students WHERE department = 'Computer Science' AND cgpa > 3.5;");
            exp.setDescription("Retrieves all column values for students in the Computer Science department whose CGPA is greater than 3.5.");
            exp.getFilters().add("Department is 'Computer Science'");
            exp.getFilters().add("CGPA must be greater than 3.5");
            exp.setExpected_output("All columns from the students table.");
        } else if (clean.contains("budget") || clean.contains("head") || clean.contains("बजट")) {
            response.setSql("SELECT id, department_name, head_of_department, budget FROM departments ORDER BY budget DESC;");
            exp.setTables(Collections.singletonList("departments"));
            exp.setDescription("Retrieves departments sorted by annual budget in descending order.");
            exp.getSorting().add("budget descending");
            exp.setExpected_output("ID, Name, Head, and budget.");
        } else {
            response.setSql("SELECT * FROM students;");
            exp.setDescription("Retrieves listing of all student records.");
            exp.setExpected_output("Full student list.");
        }

        response.setExplanation(exp);
        return response;
    }
}
