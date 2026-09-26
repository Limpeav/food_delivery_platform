export type Role = 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DRIVER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
  businessStatus?: string;
  statusMessage?: string;
}

export interface CustomerRegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phoneNumber?: string;
}

export interface RestaurantOnboardingRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  restaurantName: string;
  description?: string;
  restaurantPhone?: string;
  address: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  categoryId: number;
}

export interface DriverOnboardingRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword?: string;
}

export interface Address {
  id: number;
  userId: number;
  label: string;
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface RestaurantCategory {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  createdAt: string;
}

export type RestaurantStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface Restaurant {
  id: number;
  ownerId: number;
  ownerName: string;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  deliveryFee: number;
  minimumOrder: number;
  rating: number;
  reviewCount: number;
  status: RestaurantStatus;
  createdAt: string;
}

export interface MenuCategory {
  id: number;
  restaurantId: number;
  name: string;
  description?: string;
  displayOrder: number;
  active: boolean;
}

export interface FoodItem {
  id: number;
  restaurantId: number;
  restaurantName: string;
  menuCategoryId: number;
  menuCategoryName: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  preparationTime: number;
  available: boolean;
  rating: number;
  createdAt: string;
}

export interface CartItem {
  id: number;
  foodItemId: number;
  foodName: string;
  foodImageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  selectedOptions?: string;
  specialInstructions?: string;
}

export interface Cart {
  id: number | null;
  restaurantId: number | null;
  restaurantName: string | null;
  restaurantDeliveryFee: number;
  restaurantMinimumOrder: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  totalItems: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DRIVER_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'ONLINE_PAYMENT';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export type DeliveryStatus =
  | 'WAITING_FOR_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'GOING_TO_RESTAURANT'
  | 'FOOD_PICKED_UP'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id: number;
  foodItemId: number;
  foodName: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  selectedOptions?: string;
  specialInstructions?: string;
}

export interface Order {
  id: number;
  customerId: number;
  customerName: string;
  customerPhone?: string;

  restaurantId: number;
  restaurantName: string;
  restaurantPhone: string;
  restaurantAddress: string;
  restaurantLatitude: number;
  restaurantLongitude: number;

  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;

  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalAmount: number;

  status: OrderStatus;
  couponCode?: string;
  notes?: string;
  items: OrderItem[];

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionReference?: string;

  deliveryId?: number;
  deliveryStatus?: DeliveryStatus;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  driverLatitude?: number;
  driverLongitude?: number;

  createdAt: string;
  updatedAt?: string;
}

export interface Delivery {
  id: number;
  orderId: number;
  driverId?: number;
  driverName?: string;
  driverPhone?: string;
  status: DeliveryStatus;
  restaurantName: string;
  restaurantAddress: string;
  restaurantPhone: string;
  restaurantLatitude: number;
  restaurantLongitude: number;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  totalAmount: number;
  deliveryFee: number;
  pickupTime?: string;
  pickedUpTime?: string;
  deliveredTime?: string;
  createdAt: string;
}

export interface Driver {
  id: number;
  userId: number;
  name: string;
  email: string;
  phoneNumber?: string;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  online: boolean;
  approved: boolean;
  rating: number;
  currentLatitude?: number;
  currentLongitude?: number;
}

export interface DriverDashboardStats {
  online: boolean;
  approved: boolean;
  rating: number;
  activeDelivery?: Delivery | null;
  completedDeliveries: number;
  todayEarnings: number;
  totalEarnings: number;
}

export interface RestaurantDashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  rating: number;
  reviewCount: number;
  topSellingFoods: { foodName: string; totalQuantity: number; totalRevenue: number }[];
}

export interface AdminDashboardStats {
  totalCustomers: number;
  totalRestaurants: number;
  totalDrivers: number;
  totalOrders: number;
  todayOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalRevenue: number;
  pendingRestaurants: number;
  pendingDrivers: number;
  orderStatusDistribution: Record<string, number>;
}

export interface Review {
  id: number;
  customerId: number;
  customerName: string;
  restaurantId: number;
  restaurantName: string;
  foodItemId?: number;
  foodItemName?: string;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export interface Coupon {
  id: number;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount: number;
  maximumDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  expirationDate: string;
  active: boolean;
}

export interface Promotion {
  id: number;
  restaurantId: number;
  restaurantName: string;
  foodItemId?: number;
  foodItemName?: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export type NotificationType = 'ORDER' | 'PAYMENT' | 'DELIVERY' | 'RESTAURANT' | 'SYSTEM';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  referenceId?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
