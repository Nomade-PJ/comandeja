
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { useRestaurant, Order } from '@/contexts/RestaurantContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import OrderCard from '@/components/OrderCard';

const Dashboard = () => {
  const { orders, restaurant, updateOrderStatus } = useRestaurant();
  const navigate = useNavigate();
  
  // Filter recent orders (last 24 hours)
  const recentOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return orderDate >= yesterday;
  });
  
  // Get active orders
  const activeOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
  );
  
  // Calculate orders by status
  const ordersByStatus = orders.reduce((acc: Record<string, number>, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Handle status change
  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  return (
    <DashboardLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              R$ {totalRevenue.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Recent Orders</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/orders')}>
                View All
              </Button>
            </div>
            
            {activeOrders.length > 0 ? (
              <div className="space-y-4">
                {activeOrders.slice(0, 3).map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
                
                {activeOrders.length > 3 && (
                  <Button variant="ghost" className="w-full" onClick={() => navigate('/orders')}>
                    View {activeOrders.length - 3} more orders
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active orders at the moment.</p>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-6">Restaurant Management</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="p-8 h-auto flex flex-col items-center justify-center"
                onClick={() => navigate('/products')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
                <span className="font-medium">Manage Products</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="p-8 h-auto flex flex-col items-center justify-center"
                onClick={() => {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span className="font-medium">Restaurant Settings</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-lg font-bold mb-4">Restaurant Info</h2>
            
            {restaurant && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2">
                    {restaurant.logo && (
                      <img 
                        src={restaurant.logo} 
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    )}
                  </div>
                  <h3 className="font-bold text-xl">{restaurant.name}</h3>
                  <p className="text-gray-500">{restaurant.description}</p>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Restaurant URL</div>
                  <div className="text-gray-500 flex items-center">
                    <span className="bg-gray-100 px-3 py-2 rounded text-xs font-mono w-full truncate">
                      {window.location.origin}/r/{restaurant.id}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Contact</div>
                  <div className="text-gray-500">{restaurant.phone}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Address</div>
                  <div className="text-gray-500">{restaurant.address}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium mb-1">Hours</div>
                  <div className="text-gray-500">{restaurant.openingHours}</div>
                </div>
                
                <Button variant="outline" size="sm" className="w-full">
                  Edit Restaurant Info
                </Button>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-bold mb-4">Need Help?</h2>
            <p className="text-gray-500 mb-4">
              Our support team is ready to assist you with any questions or issues.
            </p>
            <Button variant="secondary" className="w-full">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
