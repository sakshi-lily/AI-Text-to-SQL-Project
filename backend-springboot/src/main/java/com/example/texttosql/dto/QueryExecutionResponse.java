package com.example.texttosql.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class QueryExecutionResponse {
    private List<String> columns;
    private List<Map<String, Object>> rows;
    private String error;
}
