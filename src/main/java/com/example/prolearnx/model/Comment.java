package com.example.prolearnx.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.util.Date;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String postId;
    private String userId;
    private String content;
    private Date createdAt;
    private Date updatedAt;
}