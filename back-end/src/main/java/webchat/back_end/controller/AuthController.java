package webchat.back_end.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import webchat.back_end.dto.auth.LoginRequestDTO;
import webchat.back_end.dto.auth.RegisterRequestDTO;

import webchat.back_end.dto.auth.UserResponseDTO;
import webchat.back_end.service.AuthService;
import webchat.back_end.service.JWTService;

import java.io.IOException;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private JWTService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO req) throws IOException, NoSuchAlgorithmException {
        try {
            authService.register(req);
            return ResponseEntity.ok("Register Success");
        }catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO req, HttpServletResponse response) {
        try {
            String token_login = authService.loginToken(req);
            // Set cookie
            ResponseCookie cookie = ResponseCookie.from("token", token_login)
                    .httpOnly(true)
                    .secure(false) // ตั้งเป็น true ถ้าใช้ HTTPS
                    .path("/")
                    .maxAge(Duration.ofHours(3))
                    .sameSite("Lax")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body("Login success");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }

    }

    @PostMapping("/logout")
        public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie deleteCookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body("Logged out");
    }

    @GetMapping("/personal")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String userId = authentication.getName();
            UserResponseDTO user = authService.findByUserId(userId);
            return ResponseEntity.ok(user);
        }catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
    }

}
