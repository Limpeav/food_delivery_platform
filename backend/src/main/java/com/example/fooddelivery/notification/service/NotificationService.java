package com.example.fooddelivery.notification.service;

import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.notification.dto.NotificationResponse;
import com.example.fooddelivery.notification.entity.Notification;
import com.example.fooddelivery.notification.entity.NotificationType;
import com.example.fooddelivery.notification.repository.NotificationRepository;
import com.example.fooddelivery.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Notification sendNotification(User user, String title, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        log.info("Notification saved for user {}: {}", user.getId(), title);

        try {
            // Push via WebSocket STOMP topic
            NotificationResponse response = NotificationResponse.from(saved);
            messagingTemplate.convertAndSend("/topic/notifications/" + user.getId(), response);
        } catch (Exception e) {
            log.warn("Failed to send WebSocket notification to user {}: {}", user.getId(), e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long userId, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        if (notification.getUser().getId().equals(userId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }
}
