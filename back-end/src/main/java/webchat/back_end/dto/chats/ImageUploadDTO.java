package webchat.back_end.dto.chats;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageUploadDTO {
    private String message_id;
    private MultipartFile url_file;
    private String encrypted_aes_key;
    private String iv;
}
