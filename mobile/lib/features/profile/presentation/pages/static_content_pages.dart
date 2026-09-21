import 'package:flutter/material.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';

// ==========================================
// 1. HELP CENTER PAGE
// ==========================================
class HelpCenterPage extends StatelessWidget {
  const HelpCenterPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Help & Support'),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero Banner
            Container(
              padding: const EdgeInsets.all(AppDimensions.lg),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                gradient: const LinearGradient(
                  colors: [AppColors.primary, Color(0xFFFF7A45)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.support_agent_rounded, color: Colors.white, size: 36),
                  const SizedBox(height: AppDimensions.sm),
                  Text(
                    'How can we help you?',
                    style: AppTextStyles.h2.copyWith(color: Colors.white),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Our 24/7 dedicated customer care team is here to assist you with your orders.',
                    style: AppTextStyles.bodyMedium.copyWith(color: Colors.white.withValues(alpha: 0.9)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppDimensions.lg),

            // Quick Contact Options
            Text('Contact Us', style: AppTextStyles.h3),
            const SizedBox(height: AppDimensions.sm),
            Row(
              children: [
                Expanded(
                  child: _buildContactOption(
                    context,
                    icon: Icons.chat_bubble_outline_rounded,
                    title: 'Live Chat',
                    subtitle: 'Telegram Support',
                    color: const Color(0xFF0088CC),
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Opening @CraverySupport on Telegram...')),
                      );
                    },
                  ),
                ),
                const SizedBox(width: AppDimensions.sm),
                Expanded(
                  child: _buildContactOption(
                    context,
                    icon: Icons.phone_in_talk_outlined,
                    title: 'Hotline',
                    subtitle: '+855 23 888 999',
                    color: AppColors.success,
                    onTap: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Calling customer hotline +855 23 888 999...')),
                      );
                    },
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.xl),

            // Frequently Asked Questions
            Text('Frequently Asked Questions', style: AppTextStyles.h3),
            const SizedBox(height: AppDimensions.sm),
            _buildFaqItem(
              'How do I track my delivery in real-time?',
              'Once a restaurant prepares your food and assigns a driver, go to Orders > Track Delivery. You will see a live map with the driver\'s live GPS coordinates powered by WebSocket.',
            ),
            _buildFaqItem(
              'Can I cancel an order after placing it?',
              'You can cancel your order as long as it is still in "PENDING" or "CONFIRMED" status. Once food preparation begins, orders cannot be cancelled.',
            ),
            _buildFaqItem(
              'How does KHQR Online Payment work?',
              'During checkout, select KHQR Online Payment. You will be provided with an official Bakong KHQR code. Scan with any Cambodian banking app (ABA, Wing, ACLEDA, etc.). The system verifies transaction status automatically.',
            ),
            _buildFaqItem(
              'What if my food arrives cold or items are missing?',
              'Please reach out via Live Chat within 2 hours of delivery with your order ID and photos. Our team will issue a refund or redelivery voucher.',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildContactOption(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
      child: Container(
        padding: const EdgeInsets.all(AppDimensions.md),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: AppDimensions.sm),
            Text(title, style: AppTextStyles.labelLarge),
            Text(subtitle, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppDimensions.sm),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Theme(
        data: ThemeData(dividerColor: Colors.transparent),
        child: ExpansionTile(
          title: Text(question, style: AppTextStyles.labelMedium),
          childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          children: [
            Text(answer, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }
}

// ==========================================
// 2. PRIVACY POLICY PAGE
// ==========================================
class PrivacyPolicyPage extends StatelessWidget {
  const PrivacyPolicyPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Privacy Policy'),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.lg),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Cravery Customer Privacy Policy', style: AppTextStyles.h2),
              const SizedBox(height: 4),
              Text('Last updated: September 2026', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
              const SizedBox(height: AppDimensions.lg),
              _buildPolicySection(
                '1. Information We Collect',
                'When you use Cravery as a Customer, we collect your name, email, delivery addresses, telephone number, GPS location for delivery calculation, and order transaction history.',
              ),
              _buildPolicySection(
                '2. How We Use Your Data',
                'Your information is used strictly to fulfill food delivery orders, communicate live delivery updates, verify payments, and recommend relevant restaurants in your neighborhood.',
              ),
              _buildPolicySection(
                '3. Location Services',
                'Cravery requests device location access only to recommend nearby restaurants and provide precision drop-off locations to assigned delivery drivers.',
              ),
              _buildPolicySection(
                '4. Payment Information Security',
                'We do not store your raw bank credentials or credit card numbers. All electronic payments occur via encrypted Bakong KHQR protocols and secured Spring Boot REST services.',
              ),
              _buildPolicySection(
                '5. Contact Data Privacy Officer',
                'If you wish to request deletion of your account or data copy, email privacy@cravery.delivery.',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPolicySection(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.h4),
          const SizedBox(height: 4),
          Text(body, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5)),
        ],
      ),
    );
  }
}

// ==========================================
// 3. TERMS OF SERVICE PAGE
// ==========================================
class TermsOfServicePage extends StatelessWidget {
  const TermsOfServicePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Terms of Service'),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppDimensions.md),
        child: Container(
          padding: const EdgeInsets.all(AppDimensions.lg),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Cravery Customer Agreement', style: AppTextStyles.h2),
              const SizedBox(height: 4),
              Text('Effective Date: September 2026', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
              const SizedBox(height: AppDimensions.lg),
              _buildTermsSection(
                '1. Platform Description',
                'Cravery connects hungry customers with certified local dining establishments and independent delivery drivers.',
              ),
              _buildTermsSection(
                '2. Order Placement & Acceptance',
                'An order is accepted once the restaurant confirms receipt. Restaurants reserve the right to decline orders during peak rush hours or item stockouts.',
              ),
              _buildTermsSection(
                '3. Delivery Guidelines',
                'Customers must ensure that the provided delivery address and telephone number are accurate and accessible. Drivers will attempt contact up to 3 times upon arrival.',
              ),
              _buildTermsSection(
                '4. Pricing & Delivery Charges',
                'All menu prices are determined by partner restaurants. Delivery fees and applicable taxes are clearly displayed before order placement.',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTermsSection(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: AppTextStyles.h4),
          const SizedBox(height: 4),
          Text(body, style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary, height: 1.5)),
        ],
      ),
    );
  }
}

// ==========================================
// 4. SETTINGS PAGE
// ==========================================
class SettingsPage extends StatefulWidget {
  const SettingsPage({super.key});

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  bool _orderNotifications = true;
  bool _promoNotifications = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('App Settings'),
        centerTitle: false,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppDimensions.md),
        children: [
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                SwitchListTile(
                  activeThumbColor: AppColors.primary,
                  title: Text('Order Status Updates', style: AppTextStyles.labelMedium),
                  subtitle: Text('Receive alerts when driver picks up or delivers food', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
                  value: _orderNotifications,
                  onChanged: (val) => setState(() => _orderNotifications = val),
                ),
                const Divider(height: 1, color: AppColors.border),
                SwitchListTile(
                  activeThumbColor: AppColors.primary,
                  title: Text('Promotional Notifications', style: AppTextStyles.labelMedium),
                  subtitle: Text('Get notified of discount codes and flash sales', style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
                  value: _promoNotifications,
                  onChanged: (val) => setState(() => _promoNotifications = val),
                ),
              ],
            ),
          ),
          const SizedBox(height: AppDimensions.md),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
              border: Border.all(color: AppColors.border),
            ),
            child: ListTile(
              leading: const Icon(Icons.cleaning_services_rounded, color: AppColors.textSecondary),
              title: Text('Clear Image Cache', style: AppTextStyles.labelMedium),
              trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted),
              onTap: () {
                PaintingBinding.instance.imageCache.clear();
                PaintingBinding.instance.imageCache.clearLiveImages();
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Image cache cleared successfully')),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
