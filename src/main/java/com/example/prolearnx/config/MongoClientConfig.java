package com.example.prolearnx.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

@Configuration
public class MongoClientConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String connectionString;

    @Override
    protected String getDatabaseName() {
        return "prolearnx";
    }

    @Bean
    public SSLContext sslContext() throws Exception {
        // Create a trust-all SSL context to avoid certificate validation issues
        SSLContext sslContext = SSLContext.getInstance("TLS");
        TrustManager[] trustManagers = new TrustManager[]{
                new X509TrustManager() {
                    public X509Certificate[] getAcceptedIssuers() { return new X509Certificate[0]; }
                    public void checkClientTrusted(X509Certificate[] certs, String authType) {}
                    public void checkServerTrusted(X509Certificate[] certs, String authType) {}
                }
        };
        sslContext.init(null, trustManagers, new SecureRandom());
        return sslContext;
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        try {
            ConnectionString connString = new ConnectionString(connectionString);
            
            builder.applyConnectionString(connString)
                .applyToSslSettings(ssl -> {
                    ssl.enabled(true);
                    ssl.invalidHostNameAllowed(true);
                    try {
                        ssl.context(sslContext());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                })
                .applyToConnectionPoolSettings(pool -> {
                    pool.minSize(5);
                    pool.maxSize(20);
                    pool.maxWaitTime(15000, TimeUnit.MILLISECONDS);
                    pool.maxConnectionIdleTime(300000, TimeUnit.MILLISECONDS);
                    pool.maxConnectionLifeTime(900000, TimeUnit.MILLISECONDS);
                })
                .applyToSocketSettings(socket -> {
                    socket.connectTimeout(30000, TimeUnit.MILLISECONDS);
                    socket.readTimeout(180000, TimeUnit.MILLISECONDS);
                })
                .applyToServerSettings(server -> {
                    server.heartbeatFrequency(20000, TimeUnit.MILLISECONDS);
                    server.minHeartbeatFrequency(8000, TimeUnit.MILLISECONDS);
                })
                .applyToClusterSettings(cluster -> {
                    cluster.serverSelectionTimeout(60000, TimeUnit.MILLISECONDS);
                    cluster.localThreshold(15, TimeUnit.MILLISECONDS);
                });
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Failed to configure MongoDB client", e);
        }
    }
}
