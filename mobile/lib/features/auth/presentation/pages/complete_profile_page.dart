import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/utils/cambodia_phone_validator.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../shared/models/user_model.dart';
import '../bloc/auth_bloc.dart';
import '../bloc/auth_event.dart';
import '../bloc/auth_state.dart';

class CompleteProfilePage extends StatefulWidget {
  const CompleteProfilePage({super.key});

  @override
  State<CompleteProfilePage> createState() => _CompleteProfilePageState();
}

class _CompleteProfilePageState extends State<CompleteProfilePage> {
  final TextEditingController _phoneController = TextEditingController();
  final FocusNode _phoneFocusNode = FocusNode();
  bool _isPhoneValid = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _phoneController.addListener(_onPhoneChanged);
  }

  @override
  void dispose() {
    _phoneController.removeListener(_onPhoneChanged);
    _phoneController.dispose();
    _phoneFocusNode.dispose();
    super.dispose();
  }

  void _onPhoneChanged() {
    final text = _phoneController.text.trim();
    if (text.isEmpty) {
      setState(() {
        _isPhoneValid = false;
        _errorMessage = null;
      });
      return;
    }

    final isValid = CambodiaPhoneValidator.isValid(text);
    setState(() {
      _isPhoneValid = isValid;
      _errorMessage = isValid ? null : CambodiaPhoneValidator.getValidationError(text);
    });
  }

  void _onSubmit() {
    if (!_isPhoneValid) return;
    FocusScope.of(context).unfocus();
    final rawPhone = _phoneController.text.trim();
    context.read<AuthBloc>().add(AuthCompletePhoneRequested(phoneNumber: rawPhone));
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          context.go(RouteNames.home);
        } else if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.error,
              behavior: SnackBarBehavior.floating,
            ),
          );
        }
      },
      builder: (context, state) {
        UserModel? user;
        if (state is AuthPhoneRequired) {
          user = state.user;
        } else if (state is AuthAuthenticated) {
          user = state.user;
        }

        final isLoading = state is AuthLoading;

        return Scaffold(
          backgroundColor: Colors.white,
          appBar: AppBar(
            backgroundColor: Colors.white,
            elevation: 0,
            leading: null,
            automaticallyImplyLeading: false,
            actions: [
              TextButton(
                onPressed: isLoading
                    ? null
                    : () {
                        context.read<AuthBloc>().add(AuthLogoutRequested());
                      },
                child: Text(
                  'Sign Out',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: AppDimensions.sm),
            ],
          ),
          body: SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: AppDimensions.xxl),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Brand Icon / Logo
                    Center(
                      child: Container(
                        width: 64,
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(AppDimensions.radiusXl),
                          boxShadow: [AppColors.primaryGlow],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.restaurant_rounded,
                            color: Colors.white,
                            size: 34,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xl),

                    // Title & Subtitle
                    Center(
                      child: Text(
                        'Complete your profile',
                        style: AppTextStyles.h2.copyWith(
                          fontWeight: FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xs),
                    Center(
                      child: Text(
                        "One more step before you start ordering.",
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xxl),

                    // User Profile Card
                    if (user != null)
                      Container(
                        padding: const EdgeInsets.all(AppDimensions.md),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
                          border: Border.all(color: AppColors.border),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(
                              radius: 28,
                              backgroundColor: AppColors.primaryLight,
                              backgroundImage: user.profileImageUrl != null &&
                                      user.profileImageUrl!.isNotEmpty
                                  ? CachedNetworkImageProvider(user.profileImageUrl!)
                                  : null,
                              child: user.profileImageUrl == null ||
                                      user.profileImageUrl!.isEmpty
                                  ? Text(
                                      user.name.isNotEmpty
                                          ? user.name.substring(0, 1).toUpperCase()
                                          : 'C',
                                      style: AppTextStyles.h3.copyWith(
                                        color: AppColors.primary,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: AppDimensions.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    user.name.isNotEmpty ? user.name : 'Customer',
                                    style: AppTextStyles.bodyLarge.copyWith(
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.textPrimary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    user.email,
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: AppDimensions.xxl),

                    // Phone Number Input Section
                    Text(
                      "What's your phone number?",
                      style: AppTextStyles.bodyLarge.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.xs),
                    Text(
                      "We'll use your phone number for delivery and order updates.",
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: AppDimensions.md),

                    // Cambodian Phone Number Input Field
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(AppDimensions.radiusMd),
                        border: Border.all(
                          color: _errorMessage != null
                              ? AppColors.error
                              : (_phoneFocusNode.hasFocus
                                  ? AppColors.primary
                                  : AppColors.border),
                          width: _phoneFocusNode.hasFocus ? 1.5 : 1.0,
                        ),
                      ),
                      child: Row(
                        children: [
                          // Cambodia prefix badge
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppDimensions.md,
                              vertical: AppDimensions.sm,
                            ),
                            decoration: const BoxDecoration(
                              color: AppColors.background,
                              borderRadius: BorderRadius.horizontal(
                                left: Radius.circular(AppDimensions.radiusMd - 1),
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Text('🇰🇭', style: TextStyle(fontSize: 20)),
                                const SizedBox(width: AppDimensions.xs),
                                Text(
                                  '+855',
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.textPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            width: 1,
                            height: 32,
                            color: AppColors.border,
                          ),
                          // Phone input
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              focusNode: _phoneFocusNode,
                              keyboardType: TextInputType.phone,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(10),
                              ],
                              decoration: InputDecoration(
                                hintText: '12 345 678',
                                hintStyle: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textMuted,
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                  horizontal: AppDimensions.md,
                                  vertical: AppDimensions.md,
                                ),
                                border: InputBorder.none,
                              ),
                              style: AppTextStyles.bodyLarge.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                              onSubmitted: (_) => _onSubmit(),
                            ),
                          ),
                        ],
                      ),
                    ),

                    if (_errorMessage != null) ...[
                      const SizedBox(height: AppDimensions.xs),
                      Text(
                        _errorMessage!,
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.error,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],

                    const SizedBox(height: AppDimensions.xxl),

                    // Continue Button
                    CraveryButton(
                      text: 'Continue',
                      onPressed: _isPhoneValid && !isLoading ? _onSubmit : null,
                      isLoading: isLoading,
                    ),

                    const SizedBox(height: AppDimensions.lg),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
