package com.example.prolearnx.service;

import com.example.prolearnx.model.Post;
import com.example.prolearnx.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private FirebaseStorageService firebaseStorageService;
    
    public Post createPost(String userId, String description, MultipartFile[] files, boolean isVideo) throws IOException {
        if (files.length > 3) {
            throw new RuntimeException("Maximum 3 media files allowed per post");
        }
        
        List<String> mediaUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            // Video validation for size and duration would happen here
            String url = firebaseStorageService.uploadFile(file);
            mediaUrls.add(url);
        }
        
        Post post = new Post();
        post.setUserId(userId);
        post.setDescription(description);
        post.setMediaUrls(mediaUrls);
        post.setVideo(isVideo);
        post.setLikesCount(0);
        post.setCreatedAt(new Date());
        post.setUpdatedAt(new Date());
        
        return postRepository.save(post);
    }
    
    public Post createPostWithUrls(String userId, String description, List<String> mediaUrls, boolean isVideo) {
        if (mediaUrls.size() > 3) {
            throw new RuntimeException("Maximum 3 media files allowed per post");
        }
        
        Post post = new Post();
        post.setUserId(userId);
        post.setDescription(description);
        post.setMediaUrls(mediaUrls);
        post.setVideo(isVideo);
        post.setLikesCount(0);
        post.setCreatedAt(new Date());
        post.setUpdatedAt(new Date());
        
        return postRepository.save(post);
    }
    
    public List<Post> getAllPosts() {
        return postRepository.findByOrderByCreatedAtDesc();
    }
    
    public List<Post> getUserPosts(String userId) {
        return postRepository.findByUserId(userId);
    }
    
    public Post getPostById(String postId) {
        return postRepository.findById(postId)
            .orElseThrow(() -> new RuntimeException("Post not found"));
    }
    
    public void deletePost(String postId) {
        Post post = getPostById(postId);
        // Delete associated media files
        for (String mediaUrl : post.getMediaUrls()) {
            firebaseStorageService.deleteFile(mediaUrl);
        }
        postRepository.deleteById(postId);
    }
}