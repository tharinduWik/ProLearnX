package com.example.prolearnx.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.connection.SslSettings;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.MongoTransactionManager;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.util.concurrent.TimeUnit;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    @Value("${spring.data.mongodb.uri}")
    private String connectionString;

    @Value("${spring.data.mongodb.database:prolearnx}")
    private String databaseName;

    @Override
    protected String getDatabaseName() {
        return databaseName;
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        // Parse connection string
        ConnectionString connString = new ConnectionString(connectionString);

        builder
            .applyConnectionString(connString)
            .applyToSslSettings(sslBuilder -> 
                sslBuilder.enabled(true).invalidHostNameAllowed(true)
            )
            .applyToConnectionPoolSettings(pool -> 
                pool.minSize(5)
                    .maxSize(20)
                    .maxWaitTime(15000, TimeUnit.MILLISECONDS)
                    .maxConnectionIdleTime(300000, TimeUnit.MILLISECONDS)
                    .maxConnectionLifeTime(900000, TimeUnit.MILLISECONDS)
            )
            .applyToSocketSettings(socket -> 
                socket.connectTimeout(30000, TimeUnit.MILLISECONDS)
                      .readTimeout(180000, TimeUnit.MILLISECONDS)
            )
            .applyToServerSettings(server -> 
                server.heartbeatFrequency(20000, TimeUnit.MILLISECONDS)
                      .minHeartbeatFrequency(8000, TimeUnit.MILLISECONDS)
            )
            .applyToClusterSettings(cluster -> 
                cluster.serverSelectionTimeout(60000, TimeUnit.MILLISECONDS)
                       .localThreshold(15, TimeUnit.MILLISECONDS)
            );
    }

    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        return new MongoTemplate(mongoDbFactory());
    }
    
    @Bean
    public MongoTransactionManager transactionManager(MongoDatabaseFactory dbFactory) {
        return new MongoTransactionManager(dbFactory);
    }
}
