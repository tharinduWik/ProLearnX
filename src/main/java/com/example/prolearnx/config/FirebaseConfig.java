package com.example.prolearnx.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    
    @Value("${firebase.config-file}")
    private String firebaseConfigPath;
    
    @Value("${firebase.bucket-name}")
    private String bucketName;
    
    @PostConstruct
    public void initialize() {
        try {
            // Load the Firebase service account file
            InputStream serviceAccount = new ClassPathResource(firebaseConfigPath).getInputStream();
            
            // Initialize Firebase only if not already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(bucketName)
                    .build();
                    
                FirebaseApp.initializeApp(options);
                System.out.println("Firebase initialization successful");
            }
        } catch (IOException e) {
            System.err.println("Firebase initialization failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
