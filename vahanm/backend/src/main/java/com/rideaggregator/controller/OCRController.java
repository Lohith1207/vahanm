package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.service.OCRService;
import net.sourceforge.tess4j.TesseractException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/ocr")
@PreAuthorize("hasAnyRole('DRIVER', 'ADMIN')")
public class OCRController {

    private static final Logger logger = LoggerFactory.getLogger(OCRController.class);

    @Autowired
    private OCRService ocrService;

    @PostMapping("/verify-license")
    public ResponseEntity<ApiResponse<String>> verifyLicense(@RequestParam("file") MultipartFile file) {
        try {
            String extractedText = ocrService.extractTextFromImage(file);
            return ResponseEntity.ok(ApiResponse.success("License processed", extractedText));
        } catch (IOException | TesseractException e) {
            logger.error("Failed to process OCR file", e);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to process driver license: " + e.getMessage()));
        }
    }
}
