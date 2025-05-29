package org.example.config;


import org.springframework.context.annotation.Configuration;

@Configuration
@EnableWebSocketMessageBroker

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");  // สำหรับผู้รับ
        config.setApplicationDestinationPrefixes("/app"); // สำหรับผู้ส่ง
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/chat").setAllowedOrigins("*").withSockJS(); // endpoint
    }
}
