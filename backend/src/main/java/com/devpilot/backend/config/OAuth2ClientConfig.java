package  com.devpilot.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.http.converter.FormHttpMessageConverter;
import org.springframework.http.converter.HttpMessageConverters;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.oauth2.client.endpoint.RestClientAuthorizationCodeTokenResponseClient;
import org.springframework.security.oauth2.client.http.OAuth2ErrorResponseErrorHandler;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.http.converter.OAuth2AccessTokenResponseHttpMessageConverter;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
@EnableWebSecurity
public class OAuth2ClientConfig {
    
    /**
     * JDK HttpClient – no Netty 8KB header limit.
     * Avoids TooLongHttpHeaderException from github.com CSP headers.
     */
    @Bean
    RestClient.Builder restClientBuilder() {
        java.net.http.HttpClient jdkClient = java.net.http.HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        
        return RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(jdkClient));
    }
    @Bean
    OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest>
    authorizationCodeTokenResponseClient() {
        
        return new RestClientAuthorizationCodeTokenResponseClient();
    }
    
    @Bean
    OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
        RestTemplate restTemplate = new RestTemplate();
        restTemplate.setErrorHandler(new OAuth2ErrorResponseErrorHandler());
        
        DefaultOAuth2UserService userService = new DefaultOAuth2UserService();
        userService.setRestOperations(restTemplate);
        return userService;
    }
}