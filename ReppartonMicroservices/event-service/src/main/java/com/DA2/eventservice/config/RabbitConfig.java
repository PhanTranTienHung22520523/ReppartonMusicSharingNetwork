package com.DA2.eventservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableRabbit
public class RabbitConfig {

    // Exchange names
    public static final String USER_EXCHANGE = "user.exchange";
    public static final String SONG_EXCHANGE = "song.exchange";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    
    // Queue names
    public static final String USER_REGISTERED_QUEUE = "user.registered.queue";
    public static final String SONG_PLAYED_QUEUE = "song.played.queue";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    
    // Routing keys
    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String SONG_PLAYED_ROUTING_KEY = "song.played";
    public static final String NOTIFICATION_ROUTING_KEY = "notification.created";

    // Exchanges
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(USER_EXCHANGE);
    }

    @Bean
    public TopicExchange songExchange() {
        return new TopicExchange(SONG_EXCHANGE);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    // Queues
    @Bean
    public Queue userRegisteredQueue() {
        return QueueBuilder.durable(USER_REGISTERED_QUEUE).build();
    }

    @Bean
    public Queue songPlayedQueue() {
        return QueueBuilder.durable(SONG_PLAYED_QUEUE).build();
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(NOTIFICATION_QUEUE).build();
    }

    // Bindings
    @Bean
    public Binding userRegisteredBinding() {
        return BindingBuilder
            .bind(userRegisteredQueue())
            .to(userExchange())
            .with(USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding songPlayedBinding() {
        return BindingBuilder
            .bind(songPlayedQueue())
            .to(songExchange())
            .with(SONG_PLAYED_ROUTING_KEY);
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder
            .bind(notificationQueue())
            .to(notificationExchange())
            .with(NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Jackson2JsonMessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }
}
