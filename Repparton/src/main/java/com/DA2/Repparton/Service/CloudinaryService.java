package com.DA2.Repparton.Service;



import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) throws IOException {
        System.out.println("CLOUDINARY INFO:");
        System.out.println(cloudinary.config.cloudName);
        System.out.println(cloudinary.config.apiKey);
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
        return uploadResult.get("secure_url").toString();
    }
    public String deleteFileByUrl(String fileUrl) throws IOException {
        // Ví dụ: https://res.cloudinary.com/demo/image/upload/v1710000000/my_folder/my_image.jpg
        String publicId = extractPublicIdFromUrl(fileUrl);
        if (publicId == null) {
            throw new IllegalArgumentException("Invalid Cloudinary URL format");
        }

        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        return result.get("result").toString(); // thường là "ok", "not found", v.v.
    }

    private String extractPublicIdFromUrl(String url) {
        try {
            String[] parts = url.split("/");
            // Tìm index của "/upload/"
            int uploadIndex = -1;
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("upload")) {
                    uploadIndex = i;
                    break;
                }
            }

            if (uploadIndex == -1 || uploadIndex + 1 >= parts.length) {
                return null;
            }

            // Lấy tất cả các phần từ sau "upload" đến trước phần mở rộng
            StringBuilder publicIdBuilder = new StringBuilder();
            for (int i = uploadIndex + 1; i < parts.length; i++) {
                String part = parts[i];
                if (i == parts.length - 1 && part.contains(".")) {
                    publicIdBuilder.append(part, 0, part.lastIndexOf(".")); // loại bỏ đuôi mở rộng (.jpg, .png, ...)
                } else {
                    publicIdBuilder.append(part);
                }

                if (i < parts.length - 1) {
                    publicIdBuilder.append("/");
                }
            }

            return publicIdBuilder.toString();
        } catch (Exception e) {
            return null;
        }
    }
}
