package com.example.texttosql.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class SQLValidationService {
    
    public String validate(String sql) {
        if (sql == null || sql.trim().isEmpty()) {
            return "SQL query cannot be empty.";
        }
        
        String cleanedSql = sql.trim();
        if (cleanedSql.endsWith(";")) {
            cleanedSql = cleanedSql.substring(0, cleanedSql.length() - 1);
        }

        String lowercaseSql = cleanedSql.toLowerCase().replaceAll("\\s+", " ");
        
        boolean isSelectQuery = lowercaseSql.startsWith("select") || 
                                lowercaseSql.startsWith("show") || 
                                lowercaseSql.startsWith("desc") || 
                                lowercaseSql.startsWith("explain");
                                
        if (!isSelectQuery) {
            return "SQL Safety Blocked: Only SELECT, SHOW, DESC, and EXPLAIN read-only actions are permitted.";
        }

        List<String> blockedKeywords = Arrays.asList("drop", "delete", "truncate", "alter", "insert", "update", "create", "rename");
        for (String keyword : blockedKeywords) {
            Pattern pattern = Pattern.compile("\\b" + keyword + "\\b");
            if (pattern.matcher(lowercaseSql).find()) {
                return "SQL Safety Blocked: Restricted modification command '" + keyword.toUpperCase() + "' detected.";
            }
        }
        return ""; // Safe
    }
}
