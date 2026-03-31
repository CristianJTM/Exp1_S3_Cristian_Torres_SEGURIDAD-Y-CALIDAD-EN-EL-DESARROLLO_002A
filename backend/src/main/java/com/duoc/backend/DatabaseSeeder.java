package com.duoc.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("duoc2026")
    private String seedPassword;

    public DatabaseSeeder(
            UserRepository userRepository,
            PetRepository petRepository,
            PatientRepository patientRepository,
            AppointmentRepository appointmentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.patientRepository = patientRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Usuarios
        if (userRepository.count() == 0) {
            String hash = passwordEncoder.encode(seedPassword);
            userRepository.save(new User("admin", "admin@admin.cl", hash));
            userRepository.save(new User("user", "user@user.cl", hash));
            userRepository.save(new User("vet", "vet@vet.cl", hash));
        }

        // Mascotas
        if (petRepository.count() == 0) {
            petRepository.save(new Pet("Max", "Perro", "Golden Retriever", 3, "Macho", "Santiago", List.of()));
            petRepository.save(new Pet("Rocky", "Perro", "Golden Retriever", 2, "Macho", "Santiago", List.of()));
            petRepository.save(new Pet("Marley", "Perro", "Golden Retriever", 5, "Macho", "Santiago", List.of()));
        }

        // Pacientes
        if (patientRepository.count() == 0) {
            patientRepository.save(new Patient("Firulais", "Perro", "Labrador", 5, "Juan Perez"));
        }

        // Citas
        if (appointmentRepository.count() == 0) {
            appointmentRepository.save(new Appointment(1, LocalDate.now(), LocalTime.now(), "Control", "Dr. Test"));
        }
    }
}
