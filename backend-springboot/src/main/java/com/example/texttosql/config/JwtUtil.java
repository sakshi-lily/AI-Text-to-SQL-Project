package com.example.texttosql.config;

import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class JwtUtil {
    private static final String SECRET_KEY = "enterprise-ai-database-intelligence-platform-secret-signature-key-2026";
    
    public static String generateToken(String username) {
        long now = System.currentTimeMillis();
        long exp = now + 1000L * 60 * 60 * 24; // 24 hours
        String header = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payload = String.format("{\"sub\":\"%s\",\"iat\":%d,\"exp\":%d}", username, now / 1000L, exp / 1000L);
        
        String base64Header = Base64.getUrlEncoder().withoutPadding().encodeToString(header.getBytes(StandardCharsets.UTF_8));
        String base64Payload = Base64.getUrlEncoder().withoutPadding().encodeToString(payload.getBytes(StandardCharsets.UTF_8));
        
        String signatureInput = base64Header + "." + base64Payload;
        String signature = hmacSha256(signatureInput, SECRET_KEY);
        
        return base64Header + "." + base64Payload + "." + signature;
    }
    
    public static String validateTokenAndGetSubject(String token) {
        try {
            if (token == null) return null;
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            
            String header = parts[0];
            String payload = parts[1];
            String signature = parts[2];
            
            String calculatedSignature = hmacSha256(header + "." + payload, SECRET_KEY);
            if (!calculatedSignature.equals(signature)) return null;
            
            String decodedPayload = new String(Base64.getUrlDecoder().decode(payload), StandardCharsets.UTF_8);
            java.util.regex.Matcher subMatcher = java.util.regex.Pattern.compile("\"sub\":\"([^\"]+)\"").matcher(decodedPayload);
            java.util.regex.Matcher expMatcher = java.util.regex.Pattern.compile("\"exp\":(\\d+)").matcher(decodedPayload);
            
            if (subMatcher.find() && expMatcher.find()) {
                long exp = Long.parseLong(expMatcher.group(1));
                if (System.currentTimeMillis() / 1000L > exp) {
                    return null; // Expired
                }
                return subMatcher.group(1);
            }
        } catch (Exception e) {
            return null;
        }
        return null;
    }
    
    private static String hmacSha256(String data, String key) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error signing JWT", e);
        }
    }
}
