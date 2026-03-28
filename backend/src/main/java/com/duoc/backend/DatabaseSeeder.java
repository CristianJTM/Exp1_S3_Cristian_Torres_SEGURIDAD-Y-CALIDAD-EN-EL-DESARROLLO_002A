package com.duoc.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    @Value("duoc2026")
    private String seedPassword;

    public DatabaseSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args){
        if(userRepository.count() > 0){
            return;
        }

        String hash = passwordEncoder.encode(seedPassword);
        userRepository.save(new User("admin", "admin@admin.cl", hash));
    }

}
