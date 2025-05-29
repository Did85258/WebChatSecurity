package webchat.back_end.controller;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import webchat.back_end.entity.ChatMessage;
import webchat.back_end.repository.ChatMessageRepository;
import webchat.back_end.service.ChatService;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

//@SecurityRequirement(name = "bearerAuth")
@Controller
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatMessageRepository chatRepo;

    @MessageMapping("/chat") // client ส่งมาที่ /app/chat.send
//    @SendTo("/topic/messages")      // broadcast ไปยัง /topic/public
    public ChatMessage sendMessage(@Payload ChatMessage msg) {
        ChatMessage chat = chatService.handleIncomingMessage(msg);
//        messagingTemplate.convertAndSend("/topic/messages/" + chat.getReceiver(), chat);
        messagingTemplate.convertAndSend("/topic/messages/" + "test", chat);
        return chat;
    }

    @GetMapping("/hist_chat")
    public List<ChatMessage> getChatHistory(@RequestParam String user1, @RequestParam String user2) {

        return chatService.loadMsg(user1,user2);
    }

}
