package webchat.back_end.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import webchat.back_end.dto.auth.UserResponseDTO;
import webchat.back_end.entity.ChatMessage;
import webchat.back_end.entity.Images;
import webchat.back_end.service.ChatService;
import webchat.back_end.service.JWTService;
import webchat.back_end.service.RSAService;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private JWTService jwtService;

    @Autowired
    private RSAService rsaService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;


    @GetMapping("/allUser")
    public ResponseEntity<?> getAllUser(Authentication authentication) {
        try {
            authentication.isAuthenticated();
            List<UserResponseDTO> user_all = chatService.findAllUser();
            return ResponseEntity.ok(user_all);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

    @GetMapping("/oldMsg")
    public ResponseEntity<?> getOldChat(@RequestParam String sender, @RequestParam String receiver, Authentication authentication) {
        try {
            if (!authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
            }
            List<ChatMessage> oldMsg = chatService.oldMsg(sender, receiver);
            return ResponseEntity.ok(oldMsg);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Bad Request");
        }
    }

    @GetMapping("/getImg")
    public ResponseEntity<Map<String, Object>> getEncryptedImage(@RequestParam String message_id) throws IOException {
        Map<String, Object> encryptImg = chatService.getImg(message_id);

        return ResponseEntity.ok(encryptImg);
    }

    @PostMapping("/sentImg")
    public ResponseEntity<String> get(@RequestParam("file") MultipartFile file,
                                      @RequestParam("sender_id") String sender_id,
                                      @RequestParam("receiver_id") String receiver_id,
                                      @RequestParam("timestamp") Instant timestamp,
                                      @RequestParam("iv") String ivBase64,
                                      @RequestParam("encrypted_aes_key_for_sender") String aesKeySenderBase64,
                                      @RequestParam("encrypted_aes_key_for_receiver") String aesKeyReceiverBase64) throws Exception {
        Images img = chatService.handleIncomingImage(file, sender_id, receiver_id, timestamp, ivBase64, aesKeySenderBase64,aesKeyReceiverBase64);
        return ResponseEntity.ok("img");

    }

    @GetMapping("/public-key")
    public ResponseEntity<byte[]> getUserPublicKey(@RequestParam String userId) throws Exception {
        byte[] key = rsaService.getPublicKey(userId);
        return ResponseEntity.ok(key);

    }

    @PostMapping("/private-key")
    public ResponseEntity<Map<String, String>> getEncryptedPrivateKey(
            @RequestParam String user_id,
            @RequestParam String password
    ) throws Exception {

        Map<String, String> key = rsaService.getPrivateKey(user_id,password);
        return ResponseEntity.ok(key);
    }

}
