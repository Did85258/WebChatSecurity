package webchat.back_end.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "messages")
public class ChatMessage {
    @Id
    private String id;
    private String sender;
    private String receiver;
    private String content;
    private Instant timestamp; // ใช้ Instant ดีกว่า Date
}
