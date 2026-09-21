import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../../../../app/router/route_names.dart';
import '../../../../app/theme/app_colors.dart';
import '../../../../app/theme/app_dimensions.dart';
import '../../../../app/theme/app_text_styles.dart';
import '../../../../core/widgets/cravery_button.dart';
import '../../../../core/widgets/cravery_empty_state.dart';
import '../../../../core/widgets/cravery_error_state.dart';
import '../../../../core/widgets/skeleton_loader.dart';
import '../../../../shared/models/address_model.dart';
import '../bloc/address_bloc.dart';
import '../bloc/address_event.dart';
import '../bloc/address_state.dart';

class AddressesPage extends StatefulWidget {
  const AddressesPage({super.key});

  @override
  State<AddressesPage> createState() => _AddressesPageState();
}

class _AddressesPageState extends State<AddressesPage> {
  @override
  void initState() {
    super.initState();
    context.read<AddressBloc>().add(AddressFetchRequested());
  }

  void _showDeleteDialog(BuildContext context, AddressModel address) {
    showDialog(
      context: context,
      builder: (dialogCtx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppDimensions.radiusLg)),
        title: Text('Delete Address?', style: AppTextStyles.h3),
        content: Text(
          'Are you sure you want to remove "${address.label} - ${address.addressLine}"?',
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
              context.read<AddressBloc>().add(AddressDeleteRequested(address.id));
            },
            child: Text('Delete', style: AppTextStyles.labelMedium.copyWith(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Addresses'),
        centerTitle: false,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'Add Address',
            onPressed: () {
              context.push(RouteNames.addressNew);
            },
          ),
        ],
      ),
      body: BlocConsumer<AddressBloc, AddressState>(
        listener: (context, state) {
          if (state is AddressActionSuccess) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.success,
                behavior: SnackBarBehavior.floating,
              ),
            );
          } else if (state is AddressError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: AppColors.error,
                behavior: SnackBarBehavior.floating,
              ),
            );
          }
        },
        buildWhen: (prev, curr) => curr is AddressLoading || curr is AddressLoaded || curr is AddressError,
        builder: (context, state) {
          if (state is AddressLoading) {
            return _buildSkeleton();
          }

          if (state is AddressError) {
            return CraveryErrorState(
              message: state.message,
              onRetry: () => context.read<AddressBloc>().add(AddressFetchRequested()),
            );
          }

          if (state is AddressLoaded) {
            if (state.addresses.isEmpty) {
              return CraveryEmptyState(
                title: 'No Saved Addresses',
                description: 'Add your home, office, or favorite delivery locations for quick checkout.',
                buttonText: 'Add New Address',
                icon: Icons.location_off_outlined,
                onButtonPressed: () {
                  context.push(RouteNames.addressNew);
                },
              );
            }

            return RefreshIndicator(
              color: AppColors.primary,
              onRefresh: () async {
                context.read<AddressBloc>().add(AddressFetchRequested());
              },
              child: ListView.separated(
                padding: const EdgeInsets.all(AppDimensions.md),
                itemCount: state.addresses.length,
                separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.md),
                itemBuilder: (context, index) {
                  final address = state.addresses[index];
                  return _buildAddressCard(address);
                },
              ),
            );
          }

          return const SizedBox.shrink();
        },
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(AppDimensions.md),
        decoration: BoxDecoration(
          color: Colors.white,
          border: const Border(top: BorderSide(color: AppColors.border)),
        ),
        child: SafeArea(
          child: CraveryButton(
            text: 'Add New Address',
            icon: Icons.add_location_alt_outlined,
            onPressed: () {
              context.push(RouteNames.addressNew);
            },
          ),
        ),
      ),
    );
  }

  Widget _buildAddressCard(AddressModel address) {
    IconData labelIcon;
    switch (address.label.toLowerCase()) {
      case 'home':
        labelIcon = Icons.home_rounded;
        break;
      case 'office':
      case 'work':
        labelIcon = Icons.work_rounded;
        break;
      default:
        labelIcon = Icons.location_on_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(AppDimensions.md),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppDimensions.radiusLg),
        border: Border.all(
          color: address.isDefault ? AppColors.primary : AppColors.border,
          width: address.isDefault ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Label + Default chip + Options
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: address.isDefault
                      ? AppColors.primary.withValues(alpha: 0.1)
                      : AppColors.surface,
                  borderRadius: BorderRadius.circular(AppDimensions.radiusSm),
                ),
                child: Icon(labelIcon, color: address.isDefault ? AppColors.primary : AppColors.textSecondary, size: 20),
              ),
              const SizedBox(width: AppDimensions.sm),
              Expanded(
                child: Row(
                  children: [
                    Text(address.label, style: AppTextStyles.h4),
                    if (address.isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(AppDimensions.radiusFull),
                        ),
                        child: Text(
                          'DEFAULT',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.edit_outlined, size: 20, color: AppColors.textSecondary),
                tooltip: 'Edit',
                onPressed: () {
                  context.push(RouteNames.addressEditPath(address.id), extra: address);
                },
              ),
              IconButton(
                icon: const Icon(Icons.delete_outline_rounded, size: 20, color: AppColors.error),
                tooltip: 'Delete',
                onPressed: () => _showDeleteDialog(context, address),
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.sm),

          // Recipient name & Phone
          Text(
            '${address.recipientName} • ${address.phoneNumber}',
            style: AppTextStyles.labelMedium.copyWith(color: AppColors.textPrimary),
          ),
          const SizedBox(height: 4),

          // Address Line & City
          Text(
            '${address.addressLine}, ${address.city}',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
          ),

          // Set as Default button if not already
          if (!address.isDefault) ...[
            const SizedBox(height: AppDimensions.sm),
            const Divider(height: 1, color: AppColors.border),
            const SizedBox(height: AppDimensions.xs),
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                style: TextButton.styleFrom(padding: EdgeInsets.zero),
                onPressed: () {
                  context.read<AddressBloc>().add(AddressSetDefaultRequested(address.id));
                },
                child: Text('Set as Default', style: AppTextStyles.labelSmall.copyWith(color: AppColors.primary)),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildSkeleton() {
    return Padding(
      padding: const EdgeInsets.all(AppDimensions.md),
      child: Column(
        children: const [
          SkeletonLoader(height: 120, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 120, borderRadius: AppDimensions.radiusLg),
          SizedBox(height: AppDimensions.md),
          SkeletonLoader(height: 120, borderRadius: AppDimensions.radiusLg),
        ],
      ),
    );
  }
}
