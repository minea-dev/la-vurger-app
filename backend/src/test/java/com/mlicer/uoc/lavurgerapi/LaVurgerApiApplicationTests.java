package com.mlicer.uoc.lavurgerapi;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class LaVurgerApiApplicationTests {

    @Test
    @Disabled("Disabled in CI/CD to prevent connection to the AWS production database")
    void contextLoads() {
    }

}
