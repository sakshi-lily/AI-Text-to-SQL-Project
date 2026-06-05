package com.example.texttosql.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "query_history")
@Data
public class QueryHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_question", nullable = false, length = 1000)
    private String userQuestion;

    @Column(name = "generated_sql", nullable = false, length = 2000)
    private String generatedSql;

    @Column(name = "execution_time")
    private Long executionTime;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
}
