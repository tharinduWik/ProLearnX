package com.example.prolearnx.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

import javax.net.ssl.*;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig {
    
    @Value("${spring.data.mongodb.uri}")
    private String connectionString;
    
    @Value("${spring.data.mongodb.database}")
    private String databaseName;
    
    @Bean
    public SSLContext mongoSslContext() throws NoSuchAlgorithmException, KeyManagementException {
        SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
        TrustManager[] trustAllCerts = new TrustManager[] {
            new X509TrustManager() {
                public X509Certificate[] getAcceptedIssuers() { return null; }
                public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                public void checkServerTrusted(X509Certificate[] certs, String authType) {}
            }
        };
        sslContext.init(null, trustAllCerts, new SecureRandom());
        
        // Set as default SSLContext for all connections
        SSLContext.setDefault(sslContext);
        
        // Disable hostname verification for testing
        HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);
        
        return sslContext;
    }
    
    @Bean
    public MongoClient mongoClient() throws Exception {
        ConnectionString connString = new ConnectionString(connectionString);
        
        MongoClientSettings settings = MongoClientSettings.builder()
            .applyConnectionString(connString)
            .applyToSslSettings(ssl -> {
                ssl.enabled(true);
                ssl.invalidHostNameAllowed(true);
                try {
                    ssl.context(mongoSslContext());
                } catch (Exception e) {
                    throw new RuntimeException("Failed to create SSL context", e);
                }
            })
            .applyToSocketSettings(socket -> {
                socket.connectTimeout(10000, TimeUnit.MILLISECONDS);
                socket.readTimeout(30000, TimeUnit.MILLISECONDS);
            })
            .applyToConnectionPoolSettings(pool -> {
                pool.maxSize(10);
                pool.minSize(2);
                pool.maxWaitTime(20000, TimeUnit.MILLISECONDS);
            })
            .applyToServerSettings(server -> {
                server.heartbeatFrequency(10000, TimeUnit.MILLISECONDS);
            })
            .build();
            
        return MongoClients.create(settings);
    }
    
    @Bean
    public MongoDatabaseFactory mongoDatabaseFactory(MongoClient mongoClient) {
        return new SimpleMongoClientDatabaseFactory(mongoClient, databaseName);
    }
    
    @Bean
    @Primary
    public MongoTemplate mongoTemplate(MongoDatabaseFactory mongoDatabaseFactory) {
        return new MongoTemplate(mongoDatabaseFactory);
    }
    
    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }
}
