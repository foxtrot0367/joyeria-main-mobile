package com.joyeria.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {
    private String query;
    private Integer page = 0;
    private Integer size = 20;
    private String sort = "name";
    private String direction = "asc";
}
