package webchat.back_end.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("image")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Images {
    @Id
    private String id;
    private String messageId;
    private String url_file;
    private String aesKeySenderBase64;
    private String aesKeyReceiverBase64;
    private String iv;

}
