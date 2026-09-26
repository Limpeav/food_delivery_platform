package com.example.fooddelivery.upload;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.upload.dto.UploadResponse;
import com.example.fooddelivery.upload.service.UploadService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class UploadServiceTest {

    private UploadService uploadService;

    @BeforeEach
    void setUp(@TempDir Path tempDir) {
        uploadService = new UploadService(tempDir.toString());
    }

    @Test
    void storeImage_ValidImage_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "food.jpg",
                "image/jpeg",
                "dummy image content".getBytes()
        );

        UploadResponse response = uploadService.storeImage(file);

        assertNotNull(response);
        assertNotNull(response.getUrl());
        assertTrue(response.getUrl().startsWith("/uploads/"));
        assertTrue(response.getUrl().endsWith(".jpg"));
        assertEquals("food.jpg", response.getOriginalFileName());
        assertEquals("image/jpeg", response.getContentType());
        assertTrue(response.getSize() > 0);
    }

    @Test
    void storeImage_EmptyFile_ThrowsBadRequestException() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.png",
                "image/png",
                new byte[0]
        );

        assertThrows(BadRequestException.class, () -> uploadService.storeImage(emptyFile));
    }

    @Test
    void storeImage_InvalidContentType_ThrowsBadRequestException() {
        MockMultipartFile textFile = new MockMultipartFile(
                "file",
                "test.txt",
                "text/plain",
                "hello world".getBytes()
        );

        assertThrows(BadRequestException.class, () -> uploadService.storeImage(textFile));
    }

    @Test
    void storeImage_OversizedFile_ThrowsBadRequestException() {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile largeFile = new MockMultipartFile(
                "file",
                "large.png",
                "image/png",
                largeBytes
        );

        assertThrows(BadRequestException.class, () -> uploadService.storeImage(largeFile));
    }
}
