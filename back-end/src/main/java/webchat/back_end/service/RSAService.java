package webchat.back_end.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import webchat.back_end.entity.User;
import webchat.back_end.exception.WrongUserPasswordException;
import webchat.back_end.repository.UserRepository;
import webchat.back_end.util.AESUtil;
import webchat.back_end.util.RSAUtil;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.*;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class RSAService {

    @Autowired
    private UserRepository userRepository;

    public byte[] generateRSAKey(String user_id) throws IOException, NoSuchAlgorithmException {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair pair = generator.generateKeyPair();

        PrivateKey privateKey = pair.getPrivate();
        PublicKey publicKey = pair.getPublic();

        // ✅ Save to file (PEM หรือ raw)
        Files.createDirectories(Paths.get("keys/private"));
        Files.write(Paths.get("keys/private/"+user_id+".key"), privateKey.getEncoded());

        return publicKey.getEncoded();
    }

    public byte[] getPublicKey(String user_id){
        User user = userRepository.findById(user_id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getPublicKey();
    }

    public Map<String, String> getPrivateKey(String user_id,String password) throws Exception {
        Path keyPath = Paths.get("keys/private/" + user_id + ".key");
        byte[] keyBytes = Files.readAllBytes(keyPath);

        byte[] iv = SecureRandom.getInstanceStrong().generateSeed(12);
        byte[] salt = SecureRandom.getInstanceStrong().generateSeed(16);

        byte[] encrypted = AESUtil.encrypt(keyBytes, password, iv, salt);

        Map<String, String> response = new HashMap<>();
        response.put("encryptedKey", Base64.getEncoder().encodeToString(encrypted));
        response.put("iv", Base64.getEncoder().encodeToString(iv));
        response.put("salt", Base64.getEncoder().encodeToString(salt));

        return response;
    }

//    public byte[] decryptAESKey(byte[] encryptedKey) {
//        try {
//            return RSAUtil.decryptAESKeyWithRSA(encryptedKey, privateKey);
//        } catch (Exception e) {
//            throw new RuntimeException("Failed to decrypt AES key", e);
//        }
//    }

}