package com.example.texttosql.controller;

import com.example.texttosql.model.User;
import com.example.texttosql.service.UserAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserAuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");

        Map<String, Object> response = new HashMap<>();
        if (username == null || email == null || password == null) {
            response.put("error", "Username, email and password are required.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<String> tokenOpt = authService.register(username, email, password);
        if (tokenOpt.isEmpty()) {
            response.put("error", "Username or email is already taken.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        response.put("success", true);
        response.put("token", tokenOpt.get());
        response.put("username", username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        Map<String, Object> response = new HashMap<>();
        if (username == null || password == null) {
            response.put("error", "Username and password are required.");
            return ResponseEntity.badRequest().body(response);
        }

        Optional<String> tokenOpt = authService.login(username, password);
        if (tokenOpt.isEmpty()) {
            response.put("error", "Invalid username/email or password.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        response.put("success", true);
        response.put("token", tokenOpt.get());
        // Retrieve actual username if logged in by email
        Optional<User> userOpt = authService.findByUsername(username);
        String finalUsername = userOpt.isPresent() ? userOpt.get().getUsername() : username;
        response.put("username", finalUsername);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(HttpServletRequest request) {
        String username = (String) request.getAttribute("username");
        Map<String, Object> response = new HashMap<>();
        if (username == null) {
            response.put("error", "Not authenticated.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        Optional<User> userOpt = authService.findByUsername(username);
        if (userOpt.isEmpty()) {
            response.put("error", "User session expired or not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        User user = userOpt.get();
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        return ResponseEntity.ok(response);
    }
}
