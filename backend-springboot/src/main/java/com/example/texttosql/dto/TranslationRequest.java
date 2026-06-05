package com.example.texttosql.dto;

import lombok.Data;

@Data
public class TranslationRequest {
    private String question;
    private String apiKey;
}
