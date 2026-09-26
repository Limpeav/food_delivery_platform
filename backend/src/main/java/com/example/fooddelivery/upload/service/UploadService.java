package com.example.fooddelivery.upload.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.upload.dto.UploadResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class UploadService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final Path rootLocation;

    public UploadService(@Value("${app.upload.dir:uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize upload folder: {}", e.getMessage());
        }
    }

    public UploadResponse storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty image file");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file size exceeds maximum limit of 5MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = getFileExtension(originalFilename);
        String generatedFileName = UUID.randomUUID().toString() + extension;

        Path destinationFile = this.rootLocation.resolve(generatedFileName).normalize().toAbsolutePath();
        if (!destinationFile.getParent().equals(this.rootLocation.toAbsolutePath())) {
            // Security check against directory traversal
            throw new BadRequestException("Cannot store file outside target upload directory");
        }

        try (InputStream inputStream = file.getInputStream()) {
            Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            log.info("Uploaded image stored successfully: {} (size: {} bytes)", generatedFileName, file.getSize());

            return UploadResponse.builder()
                    .url("/uploads/" + generatedFileName)
                    .fileName(generatedFileName)
                    .originalFileName(originalFilename)
                    .size(file.getSize())
                    .contentType(contentType)
                    .build();
        } catch (IOException e) {
            log.error("Failed to store file {}: {}", generatedFileName, e.getMessage());
            throw new BadRequestException("Failed to store image file: " + e.getMessage());
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex).toLowerCase();
        }
        return ".jpg";
    }
}
