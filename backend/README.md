# Food Delivery Platform - Backend Service

Production-ready Spring Boot backend for the Food Delivery Platform.

## Technology Stack
- **Java 25** (`temurin-25.jdk` runtime, Java 21 bytecode target)
- **Spring Boot 3.4.3**
- **Spring Security** + Stateless JWT authentication
- **Spring Data JPA & Hibernate**
- **PostgreSQL 14+** (Native on `localhost:5432`, DB: `food_delivery`)
- **Redis 6+** (Native on `localhost:6379`)
- **WebSocket** (STOMP over SockJS)
- **Lombok 1.18.38**
- **JUnit 5 & Mockito** (15 tests passing)
- **SpringDoc OpenAPI / Swagger**

## Running Locally (No Docker)
1. Ensure PostgreSQL is active:
   ```bash
   createdb food_delivery
   ```
2. Ensure Redis is active:
   ```bash
   brew services start redis
   redis-cli ping  # PONG
   ```
3. Run test suite:
   ```bash
   mvn test
   ```
4. Package and launch:
   ```bash
   mvn clean package -DskipTests
   java -jar target/food-delivery-backend-1.0.0.jar
   ```
5. Server starts on `http://localhost:8080`.
   - Swagger Documentation: `http://localhost:8080/swagger-ui/index.html`
   - Seeded credentials are automatically populated on startup by `DataInitializer.java`.
