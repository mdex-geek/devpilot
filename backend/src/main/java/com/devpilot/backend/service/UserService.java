package com.devpilot.backend.service;

import com.devpilot.backend.Entity.User;
import com.devpilot.backend.reposistory.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.encrypt.AesCbcBytesEncryptor;
import org.springframework.security.crypto.encrypt.TextEncryptor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service

public class UserService {
    public final UserRepository userRepository;

    public final AesCbcBytesEncryptor tokenEncryptor;
    
    public UserService(
            UserRepository userRepository,
            AesCbcBytesEncryptor tokenEncryptor
    ) {
        this.userRepository = userRepository;
        this.tokenEncryptor = tokenEncryptor;
    }

    @Transactional(readOnly = true)
    public User requiredById(UUID Id){
         return userRepository.findById(Id).orElseThrow(()-> new IllegalArgumentException("User not found"));
    }

    public String decryptAccessToken(User user){
        String storedToken = user.getAccessToken();
        byte[] encryptedToken;
        if (storedToken.startsWith("[") && storedToken.endsWith("]")) {
            String values = storedToken.substring(1, storedToken.length() - 1).trim();
            if (values.isEmpty()) {
                encryptedToken = new byte[0];
            } else {
                String[] parts = values.split(",");
                encryptedToken = new byte[parts.length];
                for (int i = 0; i < parts.length; i++) {
                    encryptedToken[i] = Byte.parseByte(parts[i].trim());
                }
            }
        } else {
            encryptedToken = Base64.getDecoder().decode(storedToken);
        }
        return new String(tokenEncryptor.decrypt(encryptedToken), StandardCharsets.UTF_8);
    }

    private static Long toLong(Object value){
        if( value instanceof Number number ){
            return number.longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }
    
    @Transactional
    public User upsertFromGitHub(Map<String, Object> attributes, String accessToken, String scope) {
        Long githubId = toLong(attributes.get("id"));
        String login = String.valueOf(attributes.get("login"));
        String name = attributes.get("name") !=null ? String.valueOf(attributes.get("name")): login;
        String avatarUrl = attributes.get("avatar_url") !=null ? String.valueOf(attributes.get("avatar_url")): null;
        String encryptionToken = Base64.getEncoder().encodeToString(
                tokenEncryptor.encrypt(accessToken.getBytes(StandardCharsets.UTF_8)));
        User user = userRepository.findByGithubId(githubId).orElseGet(User::new);
        
        user.setGithubId(githubId);
        user.setGithubUsername(login);
        user.setDisplayName(name);
        user.setAvatarUrl(avatarUrl);
        user.setAccessToken(encryptionToken);
        user.setTokenScopes(scope);
        return userRepository.save(user);
    }
}
