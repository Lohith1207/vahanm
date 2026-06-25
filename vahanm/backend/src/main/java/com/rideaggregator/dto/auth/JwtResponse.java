package com.rideaggregator.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    @Builder.Default
    private String type = "Bearer";
    private Object user;

    public JwtResponse(String accessToken, Object user) {
        this.token = accessToken;
        this.user = user;
    }
}
