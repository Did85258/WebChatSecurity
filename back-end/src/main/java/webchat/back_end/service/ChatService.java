package webchat.back_end.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import webchat.back_end.entity.ChatMessage;
import webchat.back_end.exception.NotFoundException;
import webchat.back_end.exception.UserAlreadyExistsException;
import webchat.back_end.repository.ChatMessageRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatRepo;

    public List<ChatMessage> loadMsg(String user1, String user2){
        if(chatRepo.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
                user1, user2,
                user2, user1
        ).isEmpty()){
            throw new NotFoundException("Not Found");
        }
        return chatRepo.findBySenderAndReceiverOrReceiverAndSenderOrderByTimestampAsc(
                user1, user2,
                user2, user1
        );
    }

    public ChatMessage handleIncomingMessage(ChatMessage req_chat ){
        ChatMessage getChat = ChatMessage.builder()
                .sender(req_chat.getSender())
                .receiver(req_chat.getReceiver())
                .content(req_chat.getContent())
                .timestamp(req_chat.getTimestamp())
                .build();
        return chatRepo.save(getChat);
    }
}
