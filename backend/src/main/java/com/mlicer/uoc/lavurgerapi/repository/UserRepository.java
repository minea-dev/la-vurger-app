package com.mlicer.uoc.lavurgerapi.repository;

import com.mlicer.uoc.lavurgerapi.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
}
