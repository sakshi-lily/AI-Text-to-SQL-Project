package com.example.texttosql.service;

import com.example.texttosql.dto.QueryExecutionResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class QueryExecutionService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SQLValidationService validationService;

    public QueryExecutionResponse execute(String sql) {
        QueryExecutionResponse response = new QueryExecutionResponse();
        
        // Safety check
        String securityError = validationService.validate(sql);
        if (!securityError.isEmpty()) {
            response.setColumns(new ArrayList<>());
            response.setRows(new ArrayList<>());
            response.setError(securityError);
            return response;
        }

        try {
            String cleanedSql = sql.trim();
            if (cleanedSql.endsWith(";")) {
                cleanedSql = cleanedSql.substring(0, cleanedSql.length() - 1);
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
}
