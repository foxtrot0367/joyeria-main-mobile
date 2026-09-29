package com.joyeria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeRequest {
    @NotBlank
    private String currentPassword;
    @NotBlank @Size(min = 8)
    private String newPassword;
    @NotBlank
    private String confirmPassword;
}
