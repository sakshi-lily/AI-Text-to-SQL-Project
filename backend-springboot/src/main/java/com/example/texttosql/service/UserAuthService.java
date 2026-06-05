package com.example.texttosql.service;

import com.example.texttosql.config.JwtUtil;
import com.example.texttosql.model.User;
import com.example.texttosql.repository.UserRepository;
import com.example.texttosql.security.PasswordHasher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class UserAuthService {

    @Autowired
    private UserRepository userRepository;

    public Optional<String> register(String username, String email, String password) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return Optional.empty();
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(PasswordHasher.hash(password));
        userRepository.save(user);
        return Optional.of(JwtUtil.generateToken(username));
    }

    public Optional<String> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (PasswordHasher.verify(password, user.getPassword())) {
                return Optional.of(JwtUtil.generateToken(user.getUsername()));
            }
        }
        return Optional.empty();
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}
