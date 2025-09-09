package com.DA2.eventservice.service;

import com.DA2.shared.events.BaseEvent;
import com.DA2.eventservice.config.KafkaConfig;
import com.DA2.eventservice.config.RabbitConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventPublisherService {

    private final RabbitTemplate rabbitTemplate;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegisteredEvent(BaseEvent event) {
        try {
            // Send to RabbitMQ for immediate processing
            rabbitTemplate.convertAndSend(
                RabbitConfig.USER_EXCHANGE,
                RabbitConfig.USER_REGISTERED_ROUTING_KEY,
                event
            );
            
            // Send to Kafka for analytics and event sourcing
            kafkaTemplate.send(KafkaConfig.USER_EVENTS_TOPIC, event.getUserId(), event);
            
            log.info("Published user registered event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to publish user registered event: {}", event.getEventId(), e);
        }
    }

    public void publishSongPlayedEvent(BaseEvent event) {
        try {
            // Send to RabbitMQ for recommendation updates
            rabbitTemplate.convertAndSend(
                RabbitConfig.SONG_EXCHANGE,
                RabbitConfig.SONG_PLAYED_ROUTING_KEY,
                event
            );
            
            // Send to Kafka for analytics
            kafkaTemplate.send(KafkaConfig.SONG_EVENTS_TOPIC, event.getUserId(), event);
            kafkaTemplate.send(KafkaConfig.ANALYTICS_EVENTS_TOPIC, event.getUserId(), event);
            
            log.info("Published song played event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to publish song played event: {}", event.getEventId(), e);
        }
    }

    public void publishNotificationEvent(BaseEvent event) {
        try {
            // Send to RabbitMQ for immediate notification delivery
            rabbitTemplate.convertAndSend(
                RabbitConfig.NOTIFICATION_EXCHANGE,
                RabbitConfig.NOTIFICATION_ROUTING_KEY,
                event
            );
            
            // Send to Kafka for event logging
            kafkaTemplate.send(KafkaConfig.NOTIFICATION_EVENTS_TOPIC, event.getUserId(), event);
            
            log.info("Published notification event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to publish notification event: {}", event.getEventId(), e);
        }
    }

    public void publishGenericEvent(String topic, String routingKey, BaseEvent event) {
        try {
            // Send to Kafka
            kafkaTemplate.send(topic, event.getUserId(), event);
            
            log.info("Published generic event to topic {}: {}", topic, event.getEventId());
        } catch (Exception e) {
            log.error("Failed to publish generic event to topic {}: {}", topic, event.getEventId(), e);
        }
    }
}
