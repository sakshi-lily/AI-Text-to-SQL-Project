package com.example.texttosql.service;

import com.example.texttosql.model.QueryHistory;
import com.example.texttosql.model.User;
import com.example.texttosql.repository.QueryHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class HistoryService {

    @Autowired
    private QueryHistoryRepository queryHistoryRepository;

    @Autowired
    private UserAuthService authService;

    public void addHistory(String prompt, String sql, long execTimeMs, String username) {
        try {
            QueryHistory history = new QueryHistory();
            history.setUserQuestion(prompt);
            history.setGeneratedSql(sql);
            history.setExecutionTime(execTimeMs);
            history.setTimestamp(LocalDateTime.now());

            if (username != null) {
                authService.findByUsername(username).ifPresent(history::setUser);
            }

            queryHistoryRepository.save(history);
        } catch (Exception e) {
            System.err.println("Failed to log query history: " + e.getMessage());
        }
    }

    public List<String> getUserQueryHistory(String username) {
        List<String> questions = new ArrayList<>();
        try {
            if (username == null) return questions;
            
            User user = authService.findByUsername(username).orElse(null);
            if (user == null) return questions;

            List<QueryHistory> logs = queryHistoryRepository.findAllByUserOrderByTimestampDesc(user);
            for (QueryHistory log : logs) {
                questions.add(log.getUserQuestion());
            }
        } catch (Exception e) {
            System.err.println("Failed to load user query history: " + e.getMessage());
        }
        return questions;
    }
}
