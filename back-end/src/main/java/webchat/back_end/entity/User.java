package webchat.back_end.entity;

import com.mongodb.connection.ProxySettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document("users")
public class User {
    @Id
    private String id;
    private String username;
    private String password;
    private String role;
    private String publicKey;


}