package com.mlicer.uoc.lavurgerapi.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageStorageServiceTest {

    @Mock
    private S3Client s3Client;

    @Mock
    private MultipartFile multipartFile;

    private ImageStorageService imageStorageService;

    @BeforeEach
    void setUp() {
        imageStorageService = new ImageStorageService(s3Client, "lavurger-bucket", "eu-west-3");
    }

    @Test
    @DisplayName("Should upload image successfully to S3 and return public URL")
    void shouldUploadImageSuccessfully() throws IOException {
        // GIVEN
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getOriginalFilename()).thenReturn("burger.png");
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("test data".getBytes()));
        when(multipartFile.getSize()).thenReturn(9L);

        // WHEN
        String url = imageStorageService.uploadImage(multipartFile);

        // THEN
        assertNotNull(url);
        assertTrue(url.contains("https://lavurger-bucket.s3.eu-west-3.amazonaws.com/"));
        assertTrue(url.endsWith(".png"));
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when file is empty")
    void shouldThrowExceptionWhenFileIsEmpty() {
        // GIVEN
        when(multipartFile.isEmpty()).thenReturn(true);

        // WHEN & THEN
        assertThrows(IllegalArgumentException.class, () -> imageStorageService.uploadImage(multipartFile));
        verifyNoInteractions(s3Client);
    }

    @Test
    @DisplayName("Should delete image from S3 parsing the key from URL")
    void shouldDeleteImageSuccessfully() {
        // GIVEN
        String url = "https://lavurger-bucket.s3.eu-west-3.amazonaws.com/unique-photo-id.jpg";

        // WHEN
        imageStorageService.deleteImage(url);

        // THEN
        verify(s3Client).deleteObject(any(DeleteObjectRequest.class));
    }
}