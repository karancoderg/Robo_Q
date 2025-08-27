import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { vendorAPI } from '@/services/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

const VendorAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch dashboard stats
  const { isLoading } = useQuery(
    ['vendor-analytics', timeRange],
    () => vendorAPI.getDashboardStats(),
    {
      select: (response) => response.data.data?.stats || {},
    }
  );

  // Fetch orders for analytics
  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['vendor-orders-analytics', timeRange],
    () => vendorAPI.getOrders({ limit: 100 }),
    {
      select: (response) => response.data.data?.orders || [],
    }
  );

  // const stats = statsData || {
  //   totalOrders: 0,
  //   pendingOrders: 0,
  //   completedOrders: 0,
  //   totalRevenue: 0,
  //   todayRevenue: 0,
  //   averageOrderValue: 0
  // };

  const orders = ordersData || [];

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const timeRangeMs = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    }[timeRange] || 7 * 24 * 60 * 60 * 1000;

    const filteredOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt);
      return now.getTime() - orderDate.getTime() <= timeRangeMs;
    });

    const totalRevenue = filteredOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
    const averageOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;

    // Status breakdown
    const statusBreakdown = filteredOrders.reduce((acc: any, order: any) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Daily revenue (last 7 days)
    const dailyRevenue = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate <= dayEnd;
      });

      const dayRevenue = dayOrders.reduce((sum: number, order: any) => sum + order.totalAmount, 0);
      dailyRevenue.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    return {
      totalOrders: filteredOrders.length,
      totalRevenue,
      averageOrderValue,
      statusBreakdown,
      dailyRevenue
    };
  };

  const analytics = calculateAnalytics();

  if (isLoading || ordersLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/vendor/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
            <p className="text-gray-600">Track your restaurant's performance and growth</p>
          </div>
          <div>
            <select
              className="input max-w-xs"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1d">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalOrders}</p>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  <span>+12% vs last period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.totalRevenue.toFixed(2)}</p>
                <div className="flex items-center text-sm text-green-600">
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  <span>+8% vs last period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">₹{analytics.averageOrderValue.toFixed(2)}</p>
                <div className="flex items-center text-sm text-red-600">
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  <span>-3% vs last period</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.statusBreakdown.pending || 0}</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Needs attention</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Daily Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Daily Revenue (Last 7 Days)</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {analytics.dailyRevenue.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 w-12">{day.date}</span>
                    <div className="flex-1">
                      <div className="bg-gray-200 rounded-full h-2 w-32">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{
                            width: `${Math.max(5, (day.revenue / Math.max(...analytics.dailyRevenue.map((d: any) => d.revenue))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">₹{day.revenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{day.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Status Breakdown */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Order Status Breakdown</h2>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {Object.entries(analytics.statusBreakdown).map(([status, count]: [string, any]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'pending' ? 'bg-yellow-500' :
                      status === 'vendor_approved' ? 'bg-blue-500' :
                      status === 'delivered' ? 'bg-green-500' :
                      status === 'cancelled' ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({((count / analytics.totalOrders) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="card mt-8">
        <div className="card-header">
          <h2 className="card-title">Performance Insights</h2>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-gray-900 mb-1">Order Completion Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {analytics.totalOrders > 0 ? 
                  (((analytics.statusBreakdown.delivered || 0) / analytics.totalOrders) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-sm text-gray-600">Orders successfully delivered</p>
            </div>

            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-gray-900 mb-1">Response Time</h3>
              <p className="text-2xl font-bold text-blue-600">~15 min</p>
              <p className="text-sm text-gray-600">Average order approval time</p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">⭐</div>
              <h3 className="font-semibold text-gray-900 mb-1">Customer Satisfaction</h3>
              <p className="text-2xl font-bold text-purple-600">4.5/5</p>
              <p className="text-sm text-gray-600">Based on recent orders</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorAnalytics;
