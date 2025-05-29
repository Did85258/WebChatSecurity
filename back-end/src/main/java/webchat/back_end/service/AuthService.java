package webchat.back_end.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import webchat.back_end.dto.LoginRequestDTO;
import webchat.back_end.dto.RegisterRequestDTO;
import webchat.back_end.entity.User;
import webchat.back_end.exception.UserAlreadyExistsException;
import webchat.back_end.exception.WrongUserPasswordException;
import webchat.back_end.repository.UserRepository;


@Service
@RequiredArgsConstructor
public class AuthService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public String register(RegisterRequestDTO req_regis) {
        if (userRepository.findByUsername(req_regis.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username already exists");
        }
        User genUser = User.builder()
                .username(req_regis.getUsername())
                .password(passwordEncoder.encode(req_regis.getPassword()))
                .role("USER")
                .build();
        userRepository.save(genUser);
        return jwtService.generateToken(req_regis.getUsername());
    }

    public String login(LoginRequestDTO req_login) {
        System.out.println(userRepository.findByUsername(req_login.getUsername()));
        User f_user = userRepository
                .findByUsername(req_login.getUsername())
                .orElseThrow(() ->
                        new WrongUserPasswordException("User or Password is incorrect"));
        if (!passwordEncoder.matches(req_login.getPassword(), f_user.getPassword())) {
            throw new WrongUserPasswordException("User or Password is incorrect");
        }

        return jwtService.generateToken(f_user.getUsername());
    }
}

