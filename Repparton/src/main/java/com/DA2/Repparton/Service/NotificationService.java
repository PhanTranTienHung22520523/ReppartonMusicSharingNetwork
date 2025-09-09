package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Notification;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.NotificationRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepo userRepo;

    @Transactional
    @CacheEvict(value = "notifications", key = "#userId")
    public void sendNotification(String userId, String content, String type, String referenceId) {
        try {
            // Sử dụng constructor có tham số thay vì builder
            Notification notification = new Notification(userId, content, type, referenceId);

            Notification saved = notificationRepo.save(notification);

            // Send real-time notification
            messagingTemplate.convertAndSend("/queue/notifications/" + userId, saved);
            System.out.println("Notification sent to user: " + userId + " with type: " + type);
        } catch (Exception e) {
            System.out.println("Failed to send notification to user: " + userId + " - " + e.getMessage());
        }
    }

    @Cacheable(value = "notifications", key = "#userId")
    public List<Notification> getNotifications(String userId) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Paginated version
    public Page<Notification> getNotifications(String userId, Pageable pageable) {
        return notificationRepo.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<Notification> getUnreadNotifications(String userId) {
        return notificationRepo.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);
    }

    public long getUnreadCount(String userId) {
        return notificationRepo.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    @CacheEvict(value = "notifications", key = "#userId")
    public void markAsRead(String notificationId, String userId) {
        Optional<Notification> notificationOpt = notificationRepo.findById(notificationId);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();

            // Verify ownership
            if (!notification.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to notification");
            }

            notification.setRead(true);
            notificationRepo.save(notification);

            System.out.println("Notification marked as read: " + notificationId);
        }
    }

    @Transactional
    @CacheEvict(value = "notifications", key = "#userId")
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepo.findByUserIdAndIsReadOrderByCreatedAtDesc(userId, false);

        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }

        notificationRepo.saveAll(unreadNotifications);
        System.out.println("All notifications marked as read for user: " + userId);
    }

    @Transactional
    @CacheEvict(value = "notifications", key = "#userId")
    public void deleteNotification(String notificationId, String userId) {
        Optional<Notification> notificationOpt = notificationRepo.findById(notificationId);

        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();

            // Verify ownership
            if (!notification.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized access to notification");
            }

            notificationRepo.delete(notification);
            System.out.println("Notification deleted: " + notificationId);
        }
    }

    @Transactional
    public void deleteOldNotifications(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        // Sử dụng cách thủ công vì repo không có method deleteByCreatedAtBefore
        List<Notification> oldNotifications = notificationRepo.findAll()
                .stream()
                .filter(n -> n.getCreatedAt().isBefore(cutoffDate))
                .collect(Collectors.toList());

        notificationRepo.deleteAll(oldNotifications);
        System.out.println("Deleted " + oldNotifications.size() + " old notifications older than " + daysOld + " days");
    }

    public void sendNotificationToAdmins(String content, String type, String referenceId) {
        List<User> admins = userRepo.findByRole("ADMIN");

        for (User admin : admins) {
            sendNotification(admin.getId(), content, type, referenceId);
        }

        System.out.println("Notification sent to " + admins.size() + " admins");
    }

    public void sendBulkNotification(List<String> userIds, String content, String type, String referenceId) {
        for (String userId : userIds) {
            sendNotification(userId, content, type, referenceId);
        }
        System.out.println("Bulk notification sent to " + userIds.size() + " users");
    }
}
