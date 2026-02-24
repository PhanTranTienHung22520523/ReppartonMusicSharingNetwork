package com.DA2.userservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.util.HtmlUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public void sendVerificationEmail(String to, String username, String token) {
        try {
            String verificationLink = frontendUrl + "/verify-email?token=" + token;
            
            String htmlContent = buildEmailTemplate(
                "Verify Your Email",
                "Hi " + username + ",",
                "Thank you for registering with Repparton! Please verify your email address by clicking the button below:",
                "Verify Email",
                verificationLink,
                "This link will expire in 24 hours."
            );

            sendHtmlEmail(to, "Verify Your Email - Repparton", htmlContent);
            log.info("Verification email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification email to: {}", to, e);
            throw new RuntimeException("Failed to send verification email");
        }
    }

    public void sendVerificationCodeEmail(String to, String username, String code) {
        try {
            String message = String.format(
                "Hi %s,\n\nYour Repparton verification code is: %s\n\nThis code will expire in 24 hours.",
                username, code
            );

            String htmlContent = buildEmailTemplate(
                "Verify Your Email - Code",
                "Hi " + username + ",",
                "Use the verification code below to confirm your email:",
                code,
                frontendUrl,
                "If you did not request this, please ignore."
            );

            sendHtmlEmail(to, "Your Repparton verification code", htmlContent);
            log.info("Verification code email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send verification code email to: {}", to, e);
            throw new RuntimeException("Failed to send verification code email");
        }
    }

    public void sendPasswordResetEmail(String to, String username, String token) {
        try {
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            
            String htmlContent = buildEmailTemplate(
                "Reset Your Password",
                "Hi " + username + ",",
                "We received a request to reset your password. Click the button below to create a new password:",
                "Reset Password",
                resetLink,
                "This link will expire in 1 hour. If you didn't request this, please ignore this email."
            );

            sendHtmlEmail(to, "Reset Your Password - Repparton", htmlContent);
            log.info("Password reset email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", to, e);
            throw new RuntimeException("Failed to send password reset email");
        }
    }

    public void sendPasswordChangedEmail(String to, String username) {
        try {
            String htmlContent = buildEmailTemplate(
                "Password Changed Successfully",
                "Hi " + username + ",",
                "Your password has been changed successfully. If you didn't make this change, please contact our support team immediately.",
                "Go to Repparton",
                frontendUrl,
                "This is a security notification email."
            );

            sendHtmlEmail(to, "Password Changed - Repparton", htmlContent);
            log.info("Password changed notification sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send password changed email to: {}", to, e);
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        if (fromEmail == null || fromEmail.isBlank()) {
            throw new IllegalStateException("Email service not configured (missing spring.mail.username)");
        }
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        
        mailSender.send(message);
    }

    private String buildEmailTemplate(String title, String greeting, String message, 
                                      String buttonText, String buttonLink, String footer) {
        // Do NOT use String.format/String.formatted here: the HTML/CSS contains '%' (e.g. 100%)
        // which will break Java's format parsing.
        String template = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                              color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; padding: 12px 30px; background: #667eea;
                              color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>{{TITLE}}</h1>
                    </div>
                    <div class="content">
                        <p><strong>{{GREETING}}</strong></p>
                        <p>{{MESSAGE}}</p>
                        <div style="text-align: center;">
                            <a href="{{BUTTON_LINK}}" class="button">{{BUTTON_TEXT}}</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">{{FOOTER}}</p>
                    </div>
                    <div class="footer">
                        <p>&copy; 2025 Repparton. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """;

        return template
            .replace("{{TITLE}}", HtmlUtils.htmlEscape(nullToEmpty(title)))
            .replace("{{GREETING}}", HtmlUtils.htmlEscape(nullToEmpty(greeting)))
            .replace("{{MESSAGE}}", HtmlUtils.htmlEscape(nullToEmpty(message)))
            .replace("{{BUTTON_LINK}}", HtmlUtils.htmlEscape(nullToEmpty(buttonLink)))
            .replace("{{BUTTON_TEXT}}", HtmlUtils.htmlEscape(nullToEmpty(buttonText)))
            .replace("{{FOOTER}}", HtmlUtils.htmlEscape(nullToEmpty(footer)));
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
