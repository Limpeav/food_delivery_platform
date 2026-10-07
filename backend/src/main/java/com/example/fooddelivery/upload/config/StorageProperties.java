package com.example.fooddelivery.upload.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {
    private String type = "local";
    private String dir = "uploads";
    private S3Properties s3 = new S3Properties();

    @Getter
    @Setter
    public static class S3Properties {
        private String endpoint;
        private String bucket = "cravery-uploads";
        private String accessKey;
        private String secretKey;
        private String region = "us-east-1";
        private String publicUrl;
    }
}
