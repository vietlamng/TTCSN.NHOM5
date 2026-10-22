package com.hlptt.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    public String uploadFile(MultipartFile file) {
        try {
            String publicId = "hlptt_uploads/" + UUID.randomUUID().toString();

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", publicId,
                            "overwrite", true
                    )
            );

            return (String) uploadResult.get("secure_url");

        } catch (IOException e) {
            throw new RuntimeException("Không thể upload file: " + e.getMessage(), e);
        }
    }
}