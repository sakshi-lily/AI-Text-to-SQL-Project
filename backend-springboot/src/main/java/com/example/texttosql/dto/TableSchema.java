package com.example.texttosql.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableSchema {
    private List<ColumnInfo> columns;
    private long count;
}
