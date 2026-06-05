package com.example.texttosql.service;

import com.example.texttosql.dto.ColumnInfo;
import com.example.texttosql.dto.TableSchema;
import com.example.texttosql.repository.DepartmentRepository;
import com.example.texttosql.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SchemaAnalyzerService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    public Map<String, TableSchema> getSchemas() {
        Map<String, TableSchema> schemas = new HashMap<>();

        // Schema for departments table
        List<ColumnInfo> deptCols = Arrays.asList(
            new ColumnInfo(0, "id", "INTEGER", 1, null, 1),
            new ColumnInfo(1, "department_name", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(2, "head_of_department", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(3, "budget", "INTEGER", 1, null, 0)
        );
        schemas.put("departments", new TableSchema(deptCols, departmentRepository.count()));

        // Schema for students table
        List<ColumnInfo> studCols = Arrays.asList(
            new ColumnInfo(0, "id", "INTEGER", 1, null, 1),
            new ColumnInfo(1, "name", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(2, "email", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(3, "department", "VARCHAR(255)", 1, null, 0),
            new ColumnInfo(4, "cgpa", "DOUBLE", 1, null, 0)
        );
        schemas.put("students", new TableSchema(studCols, studentRepository.count()));

        return schemas;
    }
}
