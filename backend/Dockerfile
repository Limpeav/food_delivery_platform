# ==========================================
# Stage 1: Build the Spring Boot application
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first to leverage Docker layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Download dependencies (offline)
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the JAR
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# ==========================================
# Stage 2: Run the Spring Boot application
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runner

WORKDIR /app

# Create a non-root application user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the built JAR from builder stage
COPY --from=builder /app/target/food-delivery-backend-1.0.0.jar app.jar

# Create uploads directory and set correct ownership BEFORE switching user
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app/uploads

USER appuser

EXPOSE 8080

# Configure JVM options for container environments (auto-detect memory limits)
# -Xss512k: reduce thread stack size (saves ~1MB per thread on free tier)
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0 -XX:+ExitOnOutOfMemoryError -Xss512k"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
