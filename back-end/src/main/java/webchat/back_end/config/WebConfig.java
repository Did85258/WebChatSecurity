//package webchat.back_end.config;
//
//
//import org.apache.catalina.filters.CorsFilter;
//import org.springframework.boot.web.servlet.FilterRegistrationBean;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.core.Ordered;
//import org.springframework.web.cors.CorsConfiguration;
//import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
//
//@Configuration
//public class WebConfig {
//
//    @Bean
//    public FilterRegistrationBean<CorsFilter> corsFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowCredentials(true);
//        config.addAllowedOrigin("http://localhost:3000"); // 🔥 frontend
//        config.addAllowedHeader("*");
//        config.addAllowedMethod("*");
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//
//        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter());
//        bean.setOrder(Ordered.HIGHEST_PRECEDENCE); // ✅ ให้มาก่อน security filter
//        return bean;
//    }
//}
//
