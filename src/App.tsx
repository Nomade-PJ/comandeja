
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import { AuthProvider } from "./contexts/AuthContext";
import { RestaurantProvider } from "./contexts/RestaurantContext";
import PrivateRoute from "./components/PrivateRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RestaurantProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/r/:restaurantId" element={<MenuPage />} />
              
              {/* Protected Routes */}
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
        </RestaurantProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
