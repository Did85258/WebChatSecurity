package webchat.back_end.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import webchat.back_end.entity.ChatMessage;
import webchat.back_end.repository.ChatMessageRepository;
import webchat.back_end.service.ChatService;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

//@SecurityRequirement(name = "bearerAuth")
@Controller
public class ChatRealtimeController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatRepo;

    @MessageMapping("/chat.sent") // client ส่งมาที่ /app/chat.send
    public void sendMessage(@Payload ChatMessage msg, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Unauthorized"); // ✅ ปล่อยให้ Spring handle
        }
        if (Objects.equals(msg.getType_content(), "0")) {
            ChatMessage chat_message = chatService.handleIncomingMessage(msg);
            messagingTemplate.convertAndSend("/topic/messages/" + msg.getReceiver(), chat_message);
        } else if (Objects.equals(msg.getType_content(), "1")) {
            ChatMessage chat_image = chatService.findChatMessage(msg.getId())
                    .orElseThrow(() -> new RuntimeException("Message not found"));
            messagingTemplate.convertAndSend("/topic/messages/" + chat_image.getReceiver(), chat_image);
        }



        // ✅ ส่งกลับให้ receiver

    }


}
