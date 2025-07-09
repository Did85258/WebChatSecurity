package webchat.back_end.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import webchat.back_end.dto.auth.UserResponseDTO;
import webchat.back_end.entity.ChatMessage;
import webchat.back_end.entity.Images;
import webchat.back_end.entity.User;
import webchat.back_end.exception.NotFoundException;
import webchat.back_end.repository.ChatMessageRepository;
import webchat.back_end.repository.ImagesRepository;
import webchat.back_end.repository.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatRepo;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ImagesRepository imagesRepository;

    @Autowired
    private RSAService rsaService;

    public List<ChatMessage> oldMsg(String sender, String receiver) {

        if (chatRepo.findMessagesBetweenUsers(
                sender, receiver
        ).isEmpty()) {
            throw new NotFoundException("Not Found");
        }

        return chatRepo.findMessagesBetweenUsers(
                sender, receiver
        );
    }

    public Map<String, Object> getImg(String message_id) throws IOException {

        Images img = imagesRepository.findByMessageId(message_id)
                .orElseThrow(() -> new RuntimeException("not found"));

        // 2. โหลด .enc ไฟล์
        Path path = Paths.get(img.getUrl_file());
        byte[] fileBytes = Files.readAllBytes(path);
        String base64File = Base64.getEncoder().encodeToString(fileBytes);

        // 3. ส่ง response กลับ
        Map<String, Object> result = new HashMap<>();
        result.put("file", base64File);
        result.put("iv", img.getIv());
        result.put("aesKeyReceiverBase64", img.getAesKeyReceiverBase64());
        result.put("aesKeySenderBase64", img.getAesKeySenderBase64());


        return result;
    }

    public ChatMessage handleIncomingMessage(ChatMessage req_chat) {

        ChatMessage getChat = ChatMessage.builder()
                .sender(req_chat.getSender())
                .receiver(req_chat.getReceiver())
                .content(req_chat.getContent())
                .type_content(req_chat.getType_content())
                .timestamp(req_chat.getTimestamp())
                .build();
        return chatRepo.save(getChat);
    }

    public ChatMessage handleIncomingImage(MultipartFile file, String sender_id, String receiver_id, Instant timestamp, String ivBase64,String aesKeySenderBase64, String aesKeyReceiverBase64) throws IOException {
        ChatMessage getChat = ChatMessage.builder()
                .sender(sender_id)
                .receiver(receiver_id)
                .content("")
                .type_content("1")
                .timestamp(timestamp)
                .build();
        chatRepo.save(getChat);

        String fileName = getChat.getId() + ".enc";
        Path uploadPath = Paths.get("images", fileName);
        Files.createDirectories(uploadPath.getParent());

        // บันทึกไฟล์ลงโฟลเดอร์
        Files.write(uploadPath, file.getBytes());


        Images getImg = Images.builder()
                .iv(ivBase64)
                .aesKeySenderBase64(aesKeySenderBase64)
                .aesKeyReceiverBase64(aesKeyReceiverBase64)
                .url_file("images/" + fileName)
                .messageId(getChat.getId())
                .build();
        imagesRepository.save(getImg);
        return getChat;
    }

    public Optional<ChatMessage> findChatMessage(String message_id){
        return chatRepo.findById(message_id);
    }

    public List<UserResponseDTO> findAllUser() {
        List<User> user = userRepository.findAll();

        List<UserResponseDTO> userRes = user.stream()
                .map(u -> new UserResponseDTO(u.getId(), u.getUsername(), u.getRole()))
                .collect(Collectors.toList());

        return userRes;
    }


}
