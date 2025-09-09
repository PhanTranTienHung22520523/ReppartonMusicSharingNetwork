package com.DA2.eventservice.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Topic names
    public static final String USER_EVENTS_TOPIC = "user-events";
    public static final String SONG_EVENTS_TOPIC = "song-events";
    public static final String NOTIFICATION_EVENTS_TOPIC = "notification-events";
    public static final String ANALYTICS_EVENTS_TOPIC = "analytics-events";

    @Bean
    public NewTopic userEventsTopic() {
        return TopicBuilder.name(USER_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic songEventsTopic() {
        return TopicBuilder.name(SONG_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic notificationEventsTopic() {
        return TopicBuilder.name(NOTIFICATION_EVENTS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic analyticsEventsTopic() {
        return TopicBuilder.name(ANALYTICS_EVENTS_TOPIC)
                .partitions(6)
                .replicas(1)
                .build();
    }
}
