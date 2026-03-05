package com.justicelinker.dto;

import com.justicelinker.model.Complaint;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class ComplaintDTO {

    @Data
    public static class CreateRequest {
        private Boolean isAnonymous = false;
        private String issueType;
        private String otherTypeText;
        private String subject;
        private String priority;
        private String description;
        private List<String> attachmentUrls;
        private Integer stateId;
        private Integer districtId;
        private Integer mandalId;
        private Integer villageId;
        private Double latitude;
        private Double longitude;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComplaintResponse {
        private Long id;
        private String complaintId;
        private String userName;
        private Boolean isAnonymous;
        private String issueType;
        private String otherTypeText;
        private String subject;
        private String priority;
        private String description;
        private String status;
        private String location;
        private String stateName;
        private String districtName;
        private String mandalName;
        private String villageName;
        private Integer stateId;
        private Integer districtId;
        private Integer mandalId;
        private Integer villageId;
        private Double latitude;
        private Double longitude;
        private List<AssetResponse> attachments;
        private List<StatusTimelineEntry> timeline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class AssetResponse {
        private Long id;
        private String url;
        private String secureUrl;
        private String format;
        private Integer bytes;
    }

    @Data
    public static class UpdateStatusRequest {
        private String fromStatus;
        private String toStatus;
    }

    @Data
    public static class UpdatePriorityRequest {
        private String priority;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ComplaintPageResponse {
        private List<ComplaintResponse> complaints;
        private long totalElements;
        private int totalPages;
        private int currentPage;
        private int pageSize;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardStats {
        private long totalComplaints;
        private long submitted;
        private long underReview;
        private long verified;
        private long assigned;
        private long inProgress;
        private long resolved;
        private long rejected;
        private long closed;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class StatusTimelineEntry {
        private String fromStatus;
        private String toStatus;
        private String changedBy;
        private String remarks;
        private LocalDateTime changedAt;
    }
}
