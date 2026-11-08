package com.devpilot.backend.security;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.oauth2.core.user.OAuth2User;
import com.devpilot.backend.Entity.User;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
public class AppUserPrincipal implements OAuth2User {

    @Getter
    private final User user;
    private final Map<String, Object> attributes;
    
    public UUID getId() {
        return user.getId();
    }
    
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return AuthorityUtils.createAuthorityList("ROLE_USER");
    }
    
    @Override
    public String getName() {
        return user.getId().toString();
    }
}
