import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Contexts
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { SocketProvider } from '@/contexts/SocketContext';

// Components
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VendorDashboard from '@/pages/VendorDashboard';
import Items from '@/pages/Items';
import ItemDetail from '@/pages/ItemDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Orders from '@/pages/Orders';
import Notifications from '@/pages/Notifications';
import OrderDetail from '@/pages/OrderDetail';
import OrderTracking from '@/pages/OrderTracking';
import Profile from '@/pages/Profile';
import VendorProfile from '@/pages/VendorProfile';
import VendorItems from '@/pages/VendorItems';
import VendorOrders from '@/pages/VendorOrders';
import VendorAnalytics from '@/pages/VendorAnalytics';
import NotFound from '@/pages/NotFound';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Layout><Home /></Layout>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/items" element={<Layout><Items /></Layout>} />
                  <Route path="/items/:itemId" element={<Layout><ItemDetail /></Layout>} />

                  {/* Protected user routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><Dashboard /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><Cart /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><Checkout /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><Orders /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderId"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><OrderDetail /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/orders/:orderId/tracking"
                    element={
                      <ProtectedRoute requiredRole="user">
                        <Layout><OrderTracking /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Layout><Notifications /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Layout><Profile /></Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Protected vendor routes */}
                  <Route
                    path="/vendor/dashboard"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <Layout><VendorDashboard /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/profile"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <Layout><VendorProfile /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/items"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <Layout><VendorItems /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/orders"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <Layout><VendorOrders /></Layout>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/vendor/analytics"
                    element={
                      <ProtectedRoute requiredRole="vendor">
                        <Layout><VendorAnalytics /></Layout>
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all route */}
                  <Route path="/404" element={<Layout><NotFound /></Layout>} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>

                {/* Toast notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
              </div>
            </Router>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
