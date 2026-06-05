package com.example.texttosql.dto;

import lombok.Data;

@Data
public class TranslationResponse {
    private String sql;
    private QueryExplanation explanation;
    private String source;
}
