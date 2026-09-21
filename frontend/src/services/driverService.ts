import { deliveryService } from './deliveryService';
import { Driver, DriverDashboardStats } from '@/types';

export const driverService = {
  ...deliveryService,
  getDashboardStats: (): Promise<DriverDashboardStats> => deliveryService.getDriverDashboard(),
  getMyProfile: (): Promise<Driver> => deliveryService.getMyDriverProfile(),
};

export default driverService;
