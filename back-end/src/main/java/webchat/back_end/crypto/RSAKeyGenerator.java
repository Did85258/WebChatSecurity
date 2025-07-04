package webchat.back_end.crypto;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;

public class RSAKeyGenerator {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        KeyPair pair = generator.generateKeyPair();

        PrivateKey privateKey = pair.getPrivate();
        PublicKey publicKey = pair.getPublic();

        // ✅ Save to file (PEM หรือ raw)
        Files.write(Paths.get("keys/private.key"), privateKey.getEncoded());
        Files.write(Paths.get("keys/public.key"), publicKey.getEncoded());
    }
}
