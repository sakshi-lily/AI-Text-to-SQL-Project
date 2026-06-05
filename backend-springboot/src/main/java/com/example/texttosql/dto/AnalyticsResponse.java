package com.example.texttosql.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private long totalQueries;
    private long successfulQueries;
    private long failedQueries;
    private double avgQueryTimeMs;
    private String mostAccessedTable;
    private double aiAccuracy;
    private long recordsFetched;
}
