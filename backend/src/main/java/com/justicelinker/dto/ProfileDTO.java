package com.justicelinker.dto;

import lombok.*;

public class ProfileDTO {

    @Data
    public static class UpdateRequest {
        private String fullName;
        private Integer stateId;
        private Integer districtId;
        private Integer mandalId;
        private Integer villageId;
    }
}
