package com.devpilot.backend.security;

import com.devpilot.backend.Entity.User;
import com.devpilot.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GithubOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final UserService userService;
    private final DefaultOAuth2UserService defaultOAuth2UserService = new DefaultOAuth2UserService();
    
    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest)  throws OAuth2AuthenticationException{
        OAuth2User githubUser = defaultOAuth2UserService.loadUser(userRequest);
        
        String accessToken = userRequest.getAccessToken().getTokenValue();
        String scope = String.join(",",
                        userRequest.getAccessToken().getScopes());
        User user = userService.upsertFromGitHub(githubUser.getAttributes(),accessToken,scope);
        return new AppUserPrincipal(user,githubUser.getAttributes());
    }
}
