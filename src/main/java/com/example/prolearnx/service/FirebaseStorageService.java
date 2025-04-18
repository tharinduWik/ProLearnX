package com.example.prolearnx.service;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class FirebaseStorageService {
    
    @Value("${firebase.bucket-name}")
    private String bucketName;
    
    @Value("${firebase.config-file}")
    private String configFile;
    
    private Storage storage;
    
    @PostConstruct
    public void initialize() throws IOException {
        try {
            // Load credentials
            InputStream serviceAccount = new ClassPathResource(configFile).getInputStream();
            
            // Initialize Firebase Admin SDK
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket(bucketName)
                    .build();
            
            // Check if Firebase is already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
            
            // Get Storage instance with appropriate scopes
            GoogleCredentials credentials = GoogleCredentials.fromStream(
                    new ClassPathResource(configFile).getInputStream())
                    .createScoped("https://www.googleapis.com/auth/cloud-platform");
            
            storage = StorageOptions.newBuilder()
                    .setCredentials(credentials)
                    .setProjectId("vehicle-service-manageme-4a48d")
                    .build()
                    .getService();
            
            System.out.println("Firebase initialized successfully with bucket: " + bucketName);
        } catch (Exception e) {
            System.err.println("Error initializing Firebase: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public String uploadFile(MultipartFile file) throws IOException {
        try {
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            
            // Replace spaces and special characters
            filename = filename.replaceAll("[^a-zA-Z0-9._-]", "_");
            
            BlobId blobId = BlobId.of(bucketName, filename);
            BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                    .setContentType(file.getContentType())
                    .build();
            
            System.out.println("Uploading file: " + filename + " to bucket: " + bucketName);
            
            // Upload the file to Firebase Storage
            Blob blob = storage.create(blobInfo, file.getBytes());
            
            // Return the public URL of the file
            String downloadUrl = "https://storage.googleapis.com/" + bucketName + "/" + filename;
            System.out.println("File uploaded successfully: " + downloadUrl);
            return downloadUrl;
        } catch (Exception e) {
            System.err.println("Error uploading file: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    public void deleteFile(String fileUrl) {
        try {
            // Extract file name from URL
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            BlobId blobId = BlobId.of(bucketName, fileName);
            boolean deleted = storage.delete(blobId);
            if (deleted) {
                System.out.println("File deleted successfully: " + fileName);
            } else {
                System.out.println("File could not be deleted: " + fileName);
            }
        } catch (Exception e) {
            System.err.println("Error deleting file: " + e.getMessage());
        }
    }
}