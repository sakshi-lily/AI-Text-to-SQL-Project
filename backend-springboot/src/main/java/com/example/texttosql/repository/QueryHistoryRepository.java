package com.example.texttosql.repository;

import com.example.texttosql.model.QueryHistory;
import com.example.texttosql.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueryHistoryRepository extends JpaRepository<QueryHistory, Long> {
    List<QueryHistory> findAllByOrderByTimestampDesc();
    List<QueryHistory> findAllByUserOrderByTimestampDesc(User user);
}
