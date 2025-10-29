package com.DA2.filestorageservice.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    // Upload image file
    public String uploadImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("File must be an image");
        }

        // Upload to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
            ObjectUtils.asMap(
                "folder", "repparton/images",
                "resource_type", "image",
                "public_id", UUID.randomUUID().toString()
            )
        );

        return uploadResult.get("secure_url").toString();
    }

    // Upload audio file
    public String uploadAudio(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("audio/")) {
            throw new RuntimeException("File must be an audio file");
        }

        // Upload to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
            ObjectUtils.asMap(
                "folder", "repparton/audio",
                "resource_type", "video", // Cloudinary uses "video" for audio files
                "public_id", UUID.randomUUID().toString()
            )
        );

        return uploadResult.get("secure_url").toString();
    }

    // Upload video file
    public String uploadVideo(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("video/")) {
            throw new RuntimeException("File must be a video file");
        }

        // Upload to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
            ObjectUtils.asMap(
                "folder", "repparton/videos",
                "resource_type", "video",
                "public_id", UUID.randomUUID().toString()
            )
        );

        return uploadResult.get("secure_url").toString();
    }

    // Upload any file (auto-detect type)
    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new RuntimeException("Cannot determine file type");
        }

        // Route to appropriate upload method
        if (contentType.startsWith("image/")) {
            return uploadImage(file);
        } else if (contentType.startsWith("audio/")) {
            return uploadAudio(file);
        } else if (contentType.startsWith("video/")) {
            return uploadVideo(file);
        } else {
            throw new RuntimeException("Unsupported file type: " + contentType);
        }
    }

    // Upload multiple files
    public Map<String, String> uploadMultipleFiles(MultipartFile[] files) throws IOException {
        Map<String, String> results = new java.util.HashMap<>();
        
        for (int i = 0; i < files.length; i++) {
            try {
                String url = uploadFile(files[i]);
                results.put("file_" + i, url);
            } catch (Exception e) {
                results.put("file_" + i + "_error", e.getMessage());
            }
        }

        return results;
    }

    // Delete file from Cloudinary
    public void deleteFile(String publicId) throws IOException {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete file: " + e.getMessage());
        }
    }

    // Get file information
    public Map getFileInfo(String publicId) throws IOException {
        try {
            return cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get file info: " + e.getMessage());
        }
    }

    // // Generate transformation URL (resize, crop, etc.)
    // public String generateTransformationUrl(String publicId, int width, int height, String crop) {
    //     return cloudinary.url()
    //         .transformation(ObjectUtils.asMap(
    //             "width", width,
    //             "height", height,
    //             "crop", crop
    //         ))
    //         .generate(publicId);
    // }
}
