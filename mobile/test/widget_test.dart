import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:cravery_customer/core/widgets/cravery_button.dart';
import 'package:cravery_customer/core/widgets/cravery_rating_badge.dart';
import 'package:cravery_customer/core/widgets/cravery_status_badge.dart';

void main() {
  group('Core Widgets Smoke Tests', () {
    testWidgets('CraveryButton displays text and triggers callback', (tester) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CraveryButton(
              text: 'Order Now',
              onPressed: () {
                tapped = true;
              },
            ),
          ),
        ),
      );

      expect(find.text('Order Now'), findsOneWidget);

      await tester.tap(find.byType(CraveryButton));
      await tester.pump();

      expect(tapped, isTrue);
    });

    testWidgets('CraveryButton displays spinner when isLoading is true', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CraveryButton(
              text: 'Processing',
              isLoading: true,
              onPressed: () {},
            ),
          ),
        ),
      );

      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      expect(find.text('Processing'), findsNothing);
    });

    testWidgets('CraveryRatingBadge displays rating formatted', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CraveryRatingBadge(
              rating: 4.85,
              reviewCount: 120,
            ),
          ),
        ),
      );

      expect(find.text('4.8'), findsOneWidget);
      expect(find.text('(120)'), findsOneWidget);
    });

    testWidgets('CraveryStatusBadge formats status text nicely', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: Column(
              children: [
                CraveryStatusBadge(status: 'OUT_FOR_DELIVERY'),
                CraveryStatusBadge(status: 'DELIVERED'),
              ],
            ),
          ),
        ),
      );

      expect(find.text('Out for Delivery'), findsOneWidget);
      expect(find.text('Delivered'), findsOneWidget);
    });
  });
}
