package com.example.texttosql.security;

import com.example.texttosql.config.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class JwtFilter implements Filter {

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        String path = httpRequest.getRequestURI();

        // Allow CORS Preflights
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        // Permit access to auth routes and DB connector setup APIs
        if (path.startsWith("/api/auth/") || 
            path.equals("/api/db/connect") || 
            path.equals("/api/db/test") || 
            path.equals("/api/db/status")) {
            chain.doFilter(request, response);
            return;
        }

        // Validate Bearer auth header
        String authHeader = httpRequest.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Unauthorized: Authorization Bearer token is missing.\"}");
            return;
        }

        String token = authHeader.substring(7);
        String username = JwtUtil.validateTokenAndGetSubject(token);
        if (username == null) {
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            httpResponse.setContentType("application/json");
            httpResponse.getWriter().write("{\"error\": \"Unauthorized: Invalid or expired access token.\"}");
            return;
        }

        // Store user in request attributes
        httpRequest.setAttribute("username", username);
        chain.doFilter(request, response);
    }
}
