package com.justicelinker.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final BrevoEmailClient brevoEmailClient;

    @Value("${app.noreply-email}")
    private String noReplyEmail;

    @Value("${app.support-email}")
    private String supportEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // ============ OTP EMAIL ============
    @Async
    public void sendOtpEmail(String to, String otp, int expiryMinutes) {

        String subject = "🔐 JusticeLinker — Your Login OTP";

        String html = buildTemplate(
                "Your Login OTP",
                "<div style='text-align:center;margin:24px 0'>" +
                        "<div style='display:inline-block;background:#1e293b;border:2px solid #f97316;border-radius:12px;padding:16px 32px;letter-spacing:8px;font-size:32px;font-weight:bold;color:#f97316'>" +
                        otp +
                        "</div>" +
                        "</div>" +
                        "<p style='color:#94a3b8;font-size:14px;text-align:center'>This code expires in <strong>"
                        + expiryMinutes + " minutes</strong>.</p>" +
                        "<p style='color:#64748b;font-size:13px;text-align:center;margin-top:16px'>If you did not request this code, please ignore this email.</p>"
        );

        sendHtml(to, subject, html);
    }

    // ============ COMPLAINT SUBMITTED ============
    @Async
    public void sendComplaintConfirmation(String to, String complaintId, String subject) {

        String emailSubject = "✅ Complaint Submitted — " + complaintId;

        String html = buildTemplate(
                "Complaint Submitted Successfully",
                "<div style='background:#0f4c3a;border:1px solid #22c55e;border-radius:8px;padding:16px;margin:16px 0'>" +
                        "<p style='color:#4ade80;font-weight:600;margin:0'>Your complaint has been received!</p>" +
                        "</div>" +

                        "<table style='width:100%;border-collapse:collapse;margin:16px 0'>" +

                        "<tr><td style='color:#94a3b8;padding:8px 0;border-bottom:1px solid #1e293b'>Complaint ID</td>" +
                        "<td style='color:#f97316;font-weight:bold;font-family:monospace;padding:8px 0;border-bottom:1px solid #1e293b;text-align:right'>"
                        + complaintId + "</td></tr>" +

                        "<tr><td style='color:#94a3b8;padding:8px 0;border-bottom:1px solid #1e293b'>Subject</td>" +
                        "<td style='color:#e2e8f0;padding:8px 0;border-bottom:1px solid #1e293b;text-align:right'>"
                        + escapeHtml(subject) + "</td></tr>" +

                        "<tr><td style='color:#94a3b8;padding:8px 0'>Status</td>" +
                        "<td style='padding:8px 0;text-align:right'>" +
                        "<span style='background:#f59e0b20;color:#fbbf24;padding:4px 12px;border-radius:100px;font-size:12px;font-weight:600'>SUBMITTED</span>" +
                        "</td></tr>" +

                        "</table>" +

                        "<p style='color:#94a3b8;font-size:14px'>You can track your complaint status anytime from your dashboard.</p>" +

                        "<div style='text-align:center;margin:20px 0'>" +
                        "<a href='" + frontendUrl + "/complaints/" + complaintId + "' style='display:inline-block;background:#f97316;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px'>Track Complaint</a>" +
                        "</div>"
        );

        sendHtml(to, emailSubject, html);
    }

    // ============ STATUS UPDATE ============
    @Async
    public void sendStatusUpdateEmail(String to, String complaintId, String fromStatus, String toStatus, String reason) {

        String emailSubject = "📋 Status Update — " + complaintId;

        String statusColor = getStatusColor(toStatus);
        String statusLabel = toStatus.replace("_", " ");

        StringBuilder reasonHtml = new StringBuilder();

        if (reason != null && !reason.trim().isEmpty()) {

            reasonHtml.append("<div style='background:#1e293b;border-left:4px solid ")
                    .append(statusColor)
                    .append(";border-radius:8px;padding:16px;margin:16px 0'>")

                    .append("<p style='color:#94a3b8;font-size:12px;margin:0 0 8px 0'>REASON / REMARKS</p>")

                    .append("<p style='color:#e2e8f0;font-size:14px;margin:0'>")
                    .append(escapeHtml(reason))
                    .append("</p></div>");
        }

        String html = buildTemplate(
                "Complaint Status Updated",

                "<div style='background:#1e293b;border-radius:8px;padding:16px;margin:16px 0;text-align:center'>" +
                        "<p style='color:#64748b;font-size:12px;margin:0 0 8px 0'>COMPLAINT ID</p>" +
                        "<p style='color:#f97316;font-weight:bold;font-family:monospace;font-size:18px;margin:0'>"
                        + complaintId + "</p>" +
                        "</div>" +

                        "<div style='display:flex;align-items:center;justify-content:center;gap:12px;margin:20px 0'>" +

                        "<span style='background:#1e293b;color:#94a3b8;padding:6px 16px;border-radius:100px;font-size:13px'>"
                        + formatStatus(fromStatus) + "</span>" +

                        "<span style='color:#64748b;font-size:18px'> → </span>" +

                        "<span style='background:" + statusColor + "20;color:" + statusColor +
                        ";padding:6px 16px;border-radius:100px;font-size:13px;font-weight:600'>"
                        + statusLabel + "</span>" +

                        "</div>" +

                        "<p style='color:#94a3b8;font-size:14px;text-align:center'>" +
                        getStatusMessage(toStatus) +
                        "</p>" +

                        reasonHtml +

                        "<div style='text-align:center;margin:20px 0'>" +
                        "<a href='" + frontendUrl + "/complaints/" + complaintId +
                        "' style='display:inline-block;background:#f97316;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px'>View Details</a>" +
                        "</div>"
        );

        sendHtml(to, emailSubject, html);
    }

    // ============ ACCOUNT STATUS ============
    @Async
    public void sendAccountStatusEmail(String to, String status, String reason) {

        String action = status.equals("SUSPENDED") ? "Suspended" : "Terminated";
        String color = status.equals("SUSPENDED") ? "#eab308" : "#ef4444";

        String subject = "⚠️ JusticeLinker — Account " + action;

        String html = buildTemplate(
                "Account " + action,

                "<div style='background:#1e293b;border-left:4px solid " + color +
                        ";border-radius:8px;padding:16px;margin:16px 0'>" +

                        "<p style='color:#e2e8f0;margin:0 0 12px 0'>Your account has been <strong>"
                        + action.toLowerCase() + "</strong>.</p>" +

                        "<p style='color:#94a3b8;font-size:13px'>REASON:</p>" +

                        "<p style='color:#e2e8f0;font-style:italic'>\"" +
                        escapeHtml(reason) +
                        "\"</p>" +

                        "</div>"
        );

        sendHtml(to, subject, html);
    }

    // ============ SEND EMAIL ============
    private void sendHtml(String to, String subject, String html) {

        try {

            brevoEmailClient.sendEmail(
                    noReplyEmail,
                    "JusticeLinker",
                    to,
                    subject,
                    html
            );

            log.info("Email sent to {} : {}", to, subject);

        } catch (Exception e) {

            log.error("Email failed: {}", e.getMessage());
        }
    }

    private String getStatusColor(String status) {

        return switch (status) {
            case "SUBMITTED" -> "#eab308";
            case "UNDER_REVIEW" -> "#3b82f6";
            case "VERIFIED" -> "#06b6d4";
            case "ASSIGNED" -> "#a855f7";
            case "IN_PROGRESS" -> "#6366f1";
            case "RESOLVED" -> "#22c55e";
            case "REJECTED" -> "#ef4444";
            case "CLOSED" -> "#6b7280";
            default -> "#94a3b8";
        };
    }

    private String getStatusMessage(String status) {

        return switch (status) {
            case "UNDER_REVIEW" -> "A moderator is reviewing your complaint.";
            case "VERIFIED" -> "Your complaint has been verified.";
            case "ASSIGNED" -> "Your complaint has been assigned.";
            case "IN_PROGRESS" -> "Work has started on resolving your complaint.";
            case "RESOLVED" -> "Your complaint has been resolved.";
            case "REJECTED" -> "Your complaint could not be verified.";
            case "CLOSED" -> "This complaint has been closed.";
            default -> "Your complaint status has been updated.";
        };
    }

    private String formatStatus(String status) {

        if (status == null)
            return "New";

        return status.replace("_", " ");
    }

    private String escapeHtml(String text) {

        if (text == null)
            return "";

        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;");
    }
}
