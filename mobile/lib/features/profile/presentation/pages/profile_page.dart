import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/user_model.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';
import '../bloc/profile_bloc.dart';
import '../bloc/profile_state.dart';
import 'edit_profile_sheet.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  @override
  void initState() {
    super.initState();
    context.read<ProfileBloc>().add(ProfileFetchRequested());
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusLg)),
        title: Text('Log Out?', style: AppTextStyles.h3),
        content: Text(
          'Are you sure you want to log out of your Cravery customer account?',
          style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(),
            child: Text('Cancel', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textSecondary)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusMd)),
            ),
            onPressed: () {
              Navigator.of(dialogCtx).pop();
              context.read<AuthBloc>().add(AuthLogoutRequested());
            },
            child: Text('Log Out', style: AppTextStyles.labelMedium.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _openEditProfileSheet(BuildContext context, UserModel user) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppDimensions.radiusXl)),
      ),
      builder: (_) => EditProfileSheet(user: user),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Account Profile'),
        centerTitle: false,
      ),
      body: BlocConsumer<ProfileBloc, ProfileState>(
        listener: (context, state) {
          if (state is ProfileActionSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        },
        buildWhen: (prev, curr) => curr is ProfileLoading || curr is ProfileLoaded || curr is ProfileError,
        builder: (context, state) {
          if (state is ProfileLoading) {
            return _buildSkeleton();
          }

          if (state is ProfileError) {
            return CraveryErrorState(
              message: state.message,
              onRetry: () => context.read<ProfileBloc>().add(ProfileFetchRequested()),
            );
          }

          if (state is ProfileLoaded) {
            final user = state.user;
            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                context.read<ProfileBloc>().add(ProfileFetchRequested());
              },
              child: ListView(
                padding: const EdgeInsets.all(AppDimensions.md),
                children: [
                  // User Profile Card
                  _buildUserHeaderCard(context, user),
                  const SizedBox(height: AppDimensions.lg),

                  // Section 1: Account
                  Text('Account Settings', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textMuted)),
                  const SizedBox(height: AppDimensions.xs),
                  _buildSectionContainer([
                    _buildSettingsTile(
                      icon: Icons.location_on_outlined,
                      title: 'Saved Delivery Addresses',
                      subtitle: 'Home, work, and drop-off points',
                      onTap: () => context.push(RouteNames.addresses),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildSettingsTile(
                      icon: Icons.notifications_none_rounded,
                      title: 'Notifications',
                      subtitle: 'Order updates and promotional offers',
                      onTap: () => context.push(RouteNames.notifications),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildSettingsTile(
                      icon: Icons.lock_outline_rounded,
                      title: 'Change Password',
                      subtitle: 'Update your login credentials',
                      onTap: () => context.push(RouteNames.changePassword),
                    ),
                  ]),
                  const SizedBox(height: AppDimensions.lg),

                  // Section 2: App & Preferences
                  Text('Preferences & Support', style: AppTextStyles.labelMedium.copyWith(color: AppColors.textMuted)),
                  const SizedBox(height: AppDimensions.xs),
                  _buildSectionContainer([
                    _buildSettingsTile(
                      icon: Icons.settings_outlined,
                      title: 'Settings',
                      subtitle: 'App preferences and cache',
                      onTap: () => context.push(RouteNames.settings),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildSettingsTile(
                      icon: Icons.help_outline_rounded,
                      title: 'Help Center',
                      subtitle: 'FAQs, contact hotline, telegram support',
                      onTap: () => context.push(RouteNames.helpCenter),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildSettingsTile(
                      icon: Icons.privacy_tip_outlined,
                      title: 'Privacy Policy',
                      subtitle: 'How we safeguard your customer data',
                      onTap: () => context.push(RouteNames.privacyPolicy),
                    ),
                    const Divider(height: 1, color: AppColors.border),
                    _buildSettingsTile(
                      icon: Icons.description_outlined,
                      title: 'Terms of Service',
                      subtitle: 'Customer platform usage terms',
                      onTap: () => context.push(RouteNames.termsOfService),
                    ),
                  ]),
                  const SizedBox(height: AppDimensions.xl),

                  // Log Out Button
                  Container(
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                      border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                    ),
                    child: ListTile(
                      leading: const Icon(Icons.logout_rounded, color: AppColors.error),
                      title: Text(
                        'Log Out',
                        style: AppTextStyles.labelLarge.copyWith(color: AppColors.error),
                      ),
                      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.error),
                      onTap: () => _showLogoutDialog(context),
                    ),
                  ),
                  const SizedBox(height: AppDimensions.xl),

                  // App Version Footer
                  Center(
                    child: Column(
                      children: [
                        Text(
                          'Cravery Food Delivery',
                          style: AppTextStyles.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMuted),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Customer Mobile App v1.0.0 • Spring Boot Connected',
                          style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppDimensions.xxl),
                ],
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildUserHeaderCard(BuildContext context, UserModel user) {
    final initials = user.name.isNotEmpty
        ? user.name.trim().split(' ').map((e) => e.isNotEmpty ? e[0] : '').take(2).join().toUpperCase()
        : 'C';

    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 32,
            backgroundColor: AppColors.primary,
            child: Text(
              initials,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w800,
                color: Colors.white,
              ),
            ),
          ),
          const SizedBox(width: AppDimensions.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user.name,
                  style: AppTextStyles.h3.copyWith(fontSize: 18),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 2),
                Text(
                  user.email,
                  style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                if (user.phoneNumber != null && user.phoneNumber!.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  Text(
                    user.phoneNumber!,
                    style: AppTextStyles.caption.copyWith(color: AppColors.textMuted),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
            tooltip: 'Edit Profile',
            onPressed: () => _openEditProfileSheet(context, user),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionContainer(List<Widget> children) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(children: children),
    );
  }

  Widget _buildSettingsTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
        ),
        child: Icon(icon, color: AppColors.textSecondary, size: 20),
      ),
      title: Text(title, style: AppTextStyles.labelMedium),
      subtitle: Text(subtitle, style: AppTextStyles.caption.copyWith(color: AppColors.textMuted)),
      trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textMuted, size: 20),
      onTap: onTap,
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: const [
          SkeletonLoader(height: 100, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.lg),
          SkeletonLoader(height: 180, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.lg),
          SkeletonLoader(height: 220, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
