package com.example.prolearnx.controller;

import com.example.prolearnx.model.Post;
import com.example.prolearnx.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*") // Enable CORS for development
public class PostController {
    
    @Autowired
    private PostService postService;
    
    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("userId") String userId,
            @RequestParam("description") String description,
            @RequestParam(value = "isVideo", required = false, defaultValue = "false") boolean isVideo,
            @RequestParam("files") MultipartFile[] files) {
        try {
            // Debug output
            System.out.println("Received create post request");
            System.out.println("UserID: " + userId);
            System.out.println("Description: " + description);
            System.out.println("isVideo: " + isVideo);
            System.out.println("Number of files: " + (files != null ? files.length : 0));
            
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body("No files were uploaded");
            }
            
            // Log file details for debugging
            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                System.out.println("File " + i + ": " + file.getOriginalFilename() + 
                                   ", Size: " + file.getSize() + 
                                   ", Content Type: " + file.getContentType());
            }
            
            Post createdPost = postService.createPost(userId, description, files, isVideo);
            return ResponseEntity.ok(createdPost);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error uploading files: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating post: " + e.getMessage());
        }
    }
    
    @PostMapping("/with-urls")
    public ResponseEntity<?> createPostWithUrls(@RequestBody Map<String, Object> postData) {
        try {
            // Debug output
            System.out.println("Received create post with URLs request");
            System.out.println("UserID: " + postData.get("userId"));
            System.out.println("Description: " + postData.get("description"));
            System.out.println("isVideo: " + postData.get("isVideo"));
            
            @SuppressWarnings("unchecked")
            List<String> mediaUrls = (List<String>) postData.get("mediaUrls");
            System.out.println("Media URLs: " + mediaUrls);
            
            if (mediaUrls == null || mediaUrls.isEmpty()) {
                return ResponseEntity.badRequest().body("No media URLs provided");
            }
            
            // Make sure all required fields are present
            if (postData.get("userId") == null || postData.get("description") == null) {
                return ResponseEntity.badRequest().body("Missing required fields: userId or description");
            }
            
            // Default isVideo to false if not provided
            boolean isVideo = postData.get("isVideo") != null ? (Boolean) postData.get("isVideo") : false;
            
            // Create post with pre-uploaded media URLs
            // This operation might be taking too long, so log timing
            long startTime = System.currentTimeMillis();
            System.out.println("Starting to create post at: " + startTime);
            
            Post createdPost = postService.createPostWithUrls(
                (String) postData.get("userId"),
                (String) postData.get("description"),
                mediaUrls,
                isVideo
            );
            
            long endTime = System.currentTimeMillis();
            System.out.println("Post creation completed in: " + (endTime - startTime) + "ms");
            
            return ResponseEntity.ok(createdPost);
        } catch (ClassCastException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Invalid data format: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating post: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllPosts() {
        try {
            List<Post> posts = postService.getAllPosts();
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving posts: " + e.getMessage());
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPosts(@PathVariable String userId) {
        try {
            List<Post> posts = postService.getUserPosts(userId);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error retrieving user posts: " + e.getMessage());
        }
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPost(@PathVariable String postId) {
        try {
            Post post = postService.getPostById(postId);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(404).body("Post not found: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        try {
            postService.deletePost(postId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }
}