package com.example.fooddelivery.util;

import com.example.fooddelivery.common.util.GeoUtils;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeoUtilsTest {

    @Test
    void calculateDistanceKm_SameLocation_ReturnsZero() {
        double dist = GeoUtils.calculateDistanceKm(11.5564, 104.9282, 11.5564, 104.9282);
        assertEquals(0.0, dist, 0.0001);
    }

    @Test
    void calculateDistanceKm_KnownPoints_ReturnsAccurateDistance() {
        // Distance between Central Market Phnom Penh (11.5696, 104.9210) and Independence Monument (11.5539, 104.9282) ~ 1.9 km
        double dist = GeoUtils.calculateDistanceKm(11.5696, 104.9210, 11.5539, 104.9282);
        assertTrue(dist > 1.5 && dist < 2.5, "Distance should be approximately 1.9km, but was " + dist);
    }
}
