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
            
            // Create post with pre-uploaded media URLs
            Post createdPost = postService.createPostWithUrls(
                (String) postData.get("userId"),
                (String) postData.get("description"),
                mediaUrls,
                (Boolean) postData.get("isVideo")
            );
            
            return ResponseEntity.ok(createdPost);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error creating post: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Post>> getUserPosts(@PathVariable String userId) {
        return ResponseEntity.ok(postService.getUserPosts(userId));
    }
    
    @GetMapping("/{postId}")
    public ResponseEntity<Post> getPost(@PathVariable String postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }
    
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(@PathVariable String postId) {
        try {
            postService.deletePost(postId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }
}