package com.example.prolearnx.util;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Component
public class FirebaseStorageUtil {

    public String uploadFile(MultipartFile file) throws IOException {
        // Get a reference to the storage service
        Storage storage = StorageClient.getInstance().bucket().getStorage();
        
        // Create a unique file name
        String fileName = "post_" + UUID.randomUUID().toString() + "_" + file.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");
        String bucketName = StorageClient.getInstance().bucket().getName();
        BlobId blobId = BlobId.of(bucketName, fileName);
        
        // Create blob metadata
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();
        
        // Upload the file
        Blob blob = storage.create(blobInfo, file.getBytes());
        
        // Return the file's public URL
        return String.format("https://storage.googleapis.com/%s/%s", bucketName, fileName);
    }
    
    public boolean deleteFile(String fileUrl) {
        try {
            String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
            String bucketName = StorageClient.getInstance().bucket().getName();
            BlobId blobId = BlobId.of(bucketName, fileName);
            
            // Delete the file
            return StorageClient.getInstance().bucket().getStorage().delete(blobId);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
