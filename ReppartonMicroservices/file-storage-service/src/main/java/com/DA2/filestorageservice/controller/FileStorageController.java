package com.DA2.filestorageservice.controller;

import com.DA2.filestorageservice.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*")
public class FileStorageController {

    @Autowired
    private FileStorageService fileStorageService;

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("File Storage Service is running");
    }

    // Upload image
    @PostMapping("/upload/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.uploadImage(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Image uploaded successfully",
                "url", url,
                "type", "image"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Upload audio
    @PostMapping("/upload/audio")
    public ResponseEntity<?> uploadAudio(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.uploadAudio(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Audio uploaded successfully",
                "url", url,
                "type", "audio"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Upload video
    @PostMapping("/upload/video")
    public ResponseEntity<?> uploadVideo(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.uploadVideo(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Video uploaded successfully",
                "url", url,
                "type", "video"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Upload any file (auto-detect)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileStorageService.uploadFile(file);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "File uploaded successfully",
                "url", url
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Upload multiple files
    @PostMapping("/upload/multiple")
    public ResponseEntity<?> uploadMultipleFiles(@RequestParam("files") MultipartFile[] files) {
        try {
            Map<String, String> results = fileStorageService.uploadMultipleFiles(files);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Files uploaded",
                "results", results
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Delete file
    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteFile(@RequestParam String publicId) {
        try {
            fileStorageService.deleteFile(publicId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "File deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get file info
    @GetMapping("/info")
    public ResponseEntity<?> getFileInfo(@RequestParam String publicId) {
        try {
            Map info = fileStorageService.getFileInfo(publicId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "info", info
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Generate transformation URL
    // @GetMapping("/transform")
    // public ResponseEntity<?> generateTransformationUrl(
    //         @RequestParam String publicId,
    //         @RequestParam(defaultValue = "300") int width,
    //         @RequestParam(defaultValue = "300") int height,
    //         @RequestParam(defaultValue = "fill") String crop) {
    //     try {
    //         String url = fileStorageService.generateTransformationUrl(publicId, width, height, crop);
    //         return ResponseEntity.ok(Map.of(
    //             "success", true,
    //             "transformedUrl", url
    //         ));
    //     } catch (Exception e) {
    //         return ResponseEntity.badRequest().body(Map.of(
    //             "success", false,
    //             "message", e.getMessage()
    //         ));
    //     }
    // }
}
