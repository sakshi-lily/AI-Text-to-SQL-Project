package com.example.texttosql.dto;

import lombok.Data;
import java.util.List;

@Data
public class QueryExplanation {
    private String description;
    private List<String> tables;
    private List<String> filters;
    private List<String> sorting;
    private String expected_output;
    private double confidence_score;
}
