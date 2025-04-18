package com.example.prolearnx.service;

import com.example.prolearnx.model.User;
import com.example.prolearnx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Optional;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    // Comment out or remove FirebaseStorageService if not implemented yet
    // @Autowired
    // private FirebaseStorageService firebaseStorageService;
    
    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already in use");
        }
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username already taken");
        }
        
        // Store password as plain text for now (NOT RECOMMENDED for production)
        // We'll implement proper password hashing later
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        return userRepository.save(user);
    }
    
    public User updateUser(String userId, User userDetails) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setUsername(userDetails.getUsername());
        user.setBio(userDetails.getBio());
        user.setUpdatedAt(new Date());
        
        return userRepository.save(user);
    }
    
    public User getUserById(String userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public boolean authenticateUser(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Basic string comparison for now (will be replaced with proper password checking later)
            return password.equals(user.getPassword());
        }
        return false;
    }
}