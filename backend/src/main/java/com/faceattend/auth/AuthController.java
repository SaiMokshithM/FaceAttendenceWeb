package com.faceattend.auth;

import com.faceattend.common.ApiResponse;
import com.faceattend.security.JwtTokenProvider;
import com.faceattend.user.UserEntity;
import com.faceattend.user.UserRepository;
import jakarta.validation.Valid;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        Authentication auth = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        UserDetails userDetails = (UserDetails) auth.getPrincipal();
        UserEntity user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String role = user.getRole().name();
        String accessToken = tokenProvider.generateAccessToken(user.getEmail(), role);
        String refreshToken = tokenProvider.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(ApiResponse.ok("Login successful",
                new LoginResponse(accessToken, refreshToken, role, user.getId(), user.getEmail())));
    }

    // ── Refresh ───────────────────────────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<RefreshResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        if (!tokenProvider.validateToken(request.refreshToken())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid or expired refresh token."));
        }
        String email = tokenProvider.getEmailFromToken(request.refreshToken());
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        String newAccessToken = tokenProvider.generateAccessToken(user.getEmail(), user.getRole().name());
        return ResponseEntity.ok(ApiResponse.ok(new RefreshResponse(newAccessToken)));
    }

    // ── Logout (client-side token deletion; server-side: no stateful session) ─
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        return ResponseEntity.ok(ApiResponse.ok("Logged out successfully", null));
    }

    // ── Request/Response Records ──────────────────────────────────────────────
    public record LoginRequest(
            @jakarta.validation.constraints.Email @jakarta.validation.constraints.NotBlank String email,
            @jakarta.validation.constraints.NotBlank String password
    ) {}

    public record LoginResponse(
            String accessToken,
            String refreshToken,
            String role,
            UUID userId,
            String email
    ) {}

    public record RefreshRequest(
            @jakarta.validation.constraints.NotBlank String refreshToken
    ) {}

    public record RefreshResponse(String accessToken) {}
}
