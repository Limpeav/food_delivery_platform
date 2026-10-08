package com.example.fooddelivery.user.repository;

import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<User> findByGoogleSubject(String googleSubject);

    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByPhoneNumber(String phoneNumber);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE u.phoneNumber IN :phones")
    java.util.List<User> findAllByPhoneNumberIn(@org.springframework.data.repository.query.Param("phones") java.util.Collection<String> phones);

    default Optional<User> findByPhoneLookup(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return Optional.empty();
        }
        java.util.Set<String> variants = com.example.fooddelivery.common.util.CambodiaPhoneValidator.getLookupVariants(phone);
        java.util.List<User> list = findAllByPhoneNumberIn(variants);
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    default boolean existsByPhoneLookup(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        java.util.Set<String> variants = com.example.fooddelivery.common.util.CambodiaPhoneValidator.getLookupVariants(phone);
        return !findAllByPhoneNumberIn(variants).isEmpty();
    }

    Page<User> findByRole(Role role, Pageable pageable);

    long countByRole(Role role);
}
