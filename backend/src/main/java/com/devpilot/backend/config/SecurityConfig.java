package com.devpilot.backend.config;

import com.devpilot.backend.security.GithubOAuth2UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.endpoint.OAuth2AccessTokenResponseClient;
import org.springframework.security.oauth2.client.endpoint.OAuth2AuthorizationCodeGrantRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.*;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor

public class SecurityConfig {
    private final GithubOAuth2UserService githubOAuth2UserService;
   
    
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, AuthenticationSuccessHandler oauth2SuccessHandler
    , AuthenticationFailureHandler oauth2FailerHandler, OAuth2AccessTokenResponseClient<OAuth2AuthorizationCodeGrantRequest> authorizationCodeTokenResponseClient
    ) throws Exception {
        
        http.cors(Customizer.withDefaults()).csrf(AbstractHttpConfigurer::disable).sessionManagement
                        (session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers
                                        ("/api/auth/login-url", "/oauth2/**", "/login/oauth2/**", "/error")
                                .permitAll().
                                requestMatchers(HttpMethod.OPTIONS, "/**")
                                .permitAll().
                                requestMatchers("/api/**")
                                .authenticated()
                                .anyRequest()
                                .permitAll()).
                exceptionHandling(
                        ex -> ex.authenticationEntryPoint(new
                                HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .oauth2Login
                        (oauth ->
                                oauth.userInfoEndpoint
                                                (userInfo ->
                                                        userInfo.userService(githubOAuth2UserService))
                                        .successHandler(oauth2SuccessHandler)
                                        .failureHandler(oauth2FailerHandler)
                                        .tokenEndpoint(tokenEndpoint ->tokenEndpoint.accessTokenResponseClient(authorizationCodeTokenResponseClient))
                        )
                .logout(logout -> logout.logoutUrl("/api/auth/logout").
                        logoutSuccessHandler(((
                        request, response,
                        authentication
                ) -> response.setStatus(HttpStatus.NO_CONTENT.value()))).
                        invalidateHttpSession(true).clearAuthentication(true).
                        deleteCookies("DEVPILOT_SESSION"));
        return http.build();
    }
    
    @Bean
    AuthenticationSuccessHandler oauth2SuccessHandler(@Value ("${app.frontend_url}") String frontend) {
        SimpleUrlAuthenticationSuccessHandler successHandler = new SimpleUrlAuthenticationSuccessHandler();
        successHandler.setDefaultTargetUrl(frontend+"/auth/callback");
        return successHandler;
    }
    
    @Bean
    AuthenticationFailureHandler oauth2FailerHandler(@Value("${app.frontend_url}") String frontend) {
        SimpleUrlAuthenticationFailureHandler handler = new SimpleUrlAuthenticationFailureHandler();
        handler.setDefaultFailureUrl(frontend+"/login?error=oauth_failed");
        return handler;
    }
}
