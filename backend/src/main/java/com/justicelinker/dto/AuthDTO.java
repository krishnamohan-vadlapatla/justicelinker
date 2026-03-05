package com.justicelinker.dto;

import lombok.*;

public class AuthDTO {

    @Data
    public static class SendOtpRequest {
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    public static class AdminLoginRequest {
        private String email;
        private String password;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AuthResponse {
        private String message;
        private String role;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfoResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private LocationInfo location;
        private boolean maxComplaintsExceeded;
        private int complaintsThisMonth;
        private int maxComplaintsPerMonth;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationInfo {
        private Integer stateId;
        private String stateName;
        private Integer districtId;
        private String districtName;
        private Integer mandalId;
        private String mandalName;
        private Integer villageId;
        private String villageName;
    }
}
