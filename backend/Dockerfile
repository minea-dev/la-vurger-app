# --- STAGE 1: Build ---
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -Dmaven.test.skip=true

# --- STAGE 2: Runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

# S3 Fallback Variables (Todas las variantes posibles para blindar el arranque)
ENV AWS_ACCESS_KEY_ID=mock-access-key-value
ENV AWS_SECRET_ACCESS_KEY=mock-secret-access-key-value
ENV AWS_SECRET_KEY=mock-secret-access-key-value
ENV AWS_REGION=eu-west-3
ENV AWS_S3_REGION=eu-west-3
ENV AWS_S3_BUCKET_NAME=lavurger-prod-bucket
ENV AWS_BUCKET_NAME=lavurger-prod-bucket

ENTRYPOINT ["java", "-jar", "app.jar"]
