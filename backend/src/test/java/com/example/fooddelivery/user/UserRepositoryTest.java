package com.example.fooddelivery.user;

import com.example.fooddelivery.admin.service.AdminService;
import com.example.fooddelivery.common.response.PageResponse;
import com.example.fooddelivery.user.dto.UserResponse;
import com.example.fooddelivery.user.entity.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class UserRepositoryTest {

    @Autowired
    private AdminService adminService;

    @Test
    void testGetUsers_NullRoleNullSearch() {
        PageResponse<UserResponse> res = adminService.getUsers(
                null,
                null,
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        assertNotNull(res);
        assertFalse(res.getContent().isEmpty());
        System.out.println("Default user list count: " + res.getTotalElements());
    }

    @Test
    void testGetUsers_WithSearchString() {
        PageResponse<UserResponse> res = adminService.getUsers(
                null,
                "limpeavhour",
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        assertNotNull(res);
        assertFalse(res.getContent().isEmpty());
        System.out.println("Found user via search: " + res.getContent().get(0).getEmail());
    }

    @Test
    void testGetUsers_WithRoleAndSearch() {
        PageResponse<UserResponse> res = adminService.getUsers(
                Role.CUSTOMER,
                "test",
                PageRequest.of(0, 20, Sort.by(Sort.Direction.DESC, "createdAt"))
        );
        assertNotNull(res);
        System.out.println("Role + search count: " + res.getTotalElements());
    }
}
