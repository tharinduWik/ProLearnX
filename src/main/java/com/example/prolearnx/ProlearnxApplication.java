package com.example.prolearnx;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.core.MongoTemplate;

@SpringBootApplication
public class ProlearnxApplication implements CommandLineRunner {

    @Autowired
    private MongoTemplate mongoTemplate;

    public static void main(String[] args) {
        SpringApplication.run(ProlearnxApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        try {
            System.out.println("MongoDB connection successful!");
            System.out.println("MongoDB database: " + mongoTemplate.getDb().getName());
        } catch (Exception e) {
            System.err.println("MongoDB connection failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
