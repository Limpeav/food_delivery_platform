package com.example.fooddelivery.upload.controller;

import com.example.fooddelivery.common.response.ApiResponse;
import com.example.fooddelivery.upload.dto.UploadResponse;
import com.example.fooddelivery.upload.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Endpoints for uploading media assets (food photos, restaurant logos, avatars)")
public class UploadController {

    private final UploadService uploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image file (JPEG, PNG, WEBP, GIF, max 5MB)")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(@RequestParam("file") MultipartFile file) {
        UploadResponse response = uploadService.storeImage(file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Image uploaded successfully", response));
    }
}
