package com.example.texttosql.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "departments")
@Data
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "department_name", unique = true, nullable = false)
    private String departmentName;

    @Column(name = "head_of_department", nullable = false)
    private String headOfDepartment;

    @Column(nullable = false)
    private Integer budget;
}
