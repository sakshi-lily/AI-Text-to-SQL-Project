package com.example.texttosql.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ColumnInfo {
    private int cid;
    private String name;
    private String type;
    private int notnull;
    private Object dflt_value;
    private int pk;
}
