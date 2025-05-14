import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import MenuPage from "./pages/MenuPage";
import CustomersPage from "./pages/CustomersPage";
import ReportsPage from "./pages/ReportsPage";
import CouponsPage from "./pages/CouponsPage";
import ReviewsPage from "./pages/ReviewsPage";
import SettingsPage from "./pages/SettingsPage";
import DatabaseInfo from "./pages/DatabaseInfo";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import PlansPage from "./pages/PlansPage";
import CheckoutPage from "./pages/CheckoutPage";
import { AuthProvider } from "./contexts/AuthContext";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminClients from "./pages/admin/AdminClients";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminReports from "./pages/admin/AdminReports";
import AdminNotifications from "./pages/admin/AdminNotifications";
import CustomerRestaurantView from "./pages/CustomerRestaurantView";
import CustomerOrderTracking from "./pages/CustomerOrderTracking";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RestaurantProvider>
          <AdminAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/plans" element={<PlansPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Customer-facing restaurant routes */}
                <Route path="/r/:restaurantSlug" element={<CustomerRestaurantView />} />
                <Route path="/r/:restaurantSlug/pedido/:orderId" element={<CustomerOrderTracking />} />
                <Route path="/r/:restaurantSlug/*" element={<NotFound />} />
                
                {/* Legacy route - redirect to new format */}
                <Route path="/menu/:restaurantId" element={<MenuPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/subscriptions" 
                  element={
                    <AdminRoute>
                      <AdminSubscriptions />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/clients" 
                  element={
                    <AdminRoute>
                      <AdminClients />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/plans" 
                  element={
                    <AdminRoute>
                      <AdminPlans />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/support" 
                  element={
                    <AdminRoute>
                      <AdminSupport />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/reports" 
                  element={
                    <AdminRoute>
                      <AdminReports />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/notifications" 
                  element={
                    <AdminRoute>
                      <AdminNotifications />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/settings" 
                  element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  } 
                />
                
                {/* Database Info Route */}
                <Route
                  path="/database-info"
                  element={
                    <PrivateRoute>
                      <DatabaseInfo />
                    </PrivateRoute>
                  }
                />
                
                {/* Protected Restaurant Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <PrivateRoute>
                      <OrdersPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <PrivateRoute>
                      <ProductsPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <PrivateRoute>
                      <CustomersPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <PrivateRoute>
                      <ReportsPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/coupons" 
                  element={
                    <PrivateRoute>
                      <CouponsPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/reviews" 
                  element={
                    <PrivateRoute>
                      <ReviewsPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <PrivateRoute>
                      <SettingsPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminAuthProvider>
        </RestaurantProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
