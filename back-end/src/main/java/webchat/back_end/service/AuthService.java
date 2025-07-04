package webchat.back_end.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import webchat.back_end.dto.auth.LoginRequestDTO;
import webchat.back_end.dto.auth.RegisterRequestDTO;
import webchat.back_end.dto.auth.UserResponseDTO;
import webchat.back_end.entity.User;
import webchat.back_end.exception.UserAlreadyExistsException;
import webchat.back_end.exception.WrongUserPasswordException;
import webchat.back_end.repository.UserRepository;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;


@Service
@RequiredArgsConstructor
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private RSAService rsaService;

    public void register(RegisterRequestDTO req_regis) throws IOException, NoSuchAlgorithmException {
        if (userRepository.findByUsername(req_regis.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already exists");
        }


        User genUser = User.builder()
                .username(req_regis.getUsername())
                .password(passwordEncoder.encode(req_regis.getPassword()))
                .role("USER")

                .build();
        userRepository.save(genUser);
        User user = userRepository.findByUsername(req_regis.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        byte[] publicKey = rsaService.generateRSAKey(user.getId());


            user.setPublicKey(publicKey);
            userRepository.save(user);
    }

    public String loginToken(LoginRequestDTO req_login) {
//        System.out.println(userRepository.findByUsername(req_login.getUsername()));
        String username = req_login.getUsername().trim();
        String password = req_login.getPassword().trim();
        User f_user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new WrongUserPasswordException("User or Password is incorrect"));
        if (!passwordEncoder.matches(password, f_user.getPassword())) {
            throw new WrongUserPasswordException("User or Password is incorrect");
        }

        return jwtService.generateToken(username);
    }

    public UserResponseDTO findByUserId(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        UserResponseDTO userRes = new UserResponseDTO();
        userRes.setUser_id(user.getId());
        userRes.setUsername(user.getUsername());
        userRes.setRole(user.getRole());

        return userRes;
    }
}

