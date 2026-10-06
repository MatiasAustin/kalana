import { ArrowUpRight, ArrowDownRight, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { orders, products, customers } from '@/lib/db/schema';
import { desc, sum, count, eq } from 'drizzle-orm';

export default async function AdminOverview() {
  const allOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
  }).catch((err) => {
    console.error('Failed to load orders for overview:', err);
    return [];
  });

  const allProducts = await db.query.products.findMany().catch((err) => {
    console.error('Failed to load products for overview:', err);
    return [];
  });
  const allCustomers = await db.query.customers.findMany().catch((err) => {
    console.error('Failed to load customers for overview:', err);
    return [];
  });

  // Basic Stats
  const totalSales = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalOrders = allOrders.length;
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  const totalProducts = allProducts.length;

  const recentOrders = allOrders.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <select className="border border-gray-300 rounded-md text-sm py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black">
          <option>All Time</option>
          <option>Today</option>
          <option>This Month</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Sales" 
          value={`IDR ${totalSales.toLocaleString('id-ID')}`} 
          trend="" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <KPICard 
          title="Total Orders" 
          value={totalOrders.toString()} 
          trend="" 
          isPositive={true} 
          icon={ShoppingCart} 
        />
        <KPICard 
          title="Average Order Value" 
          value={`IDR ${Math.round(avgOrderValue).toLocaleString('id-ID')}`} 
          trend="" 
          isPositive={true} 
          icon={Package} 
        />
        <KPICard 
          title="Total Products" 
          value={totalProducts.toString()} 
          trend="" 
          isPositive={true} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">No orders yet.</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">IDR {order.total.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low Stock (Dummy for now, can be updated later) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-sm font-medium text-gray-900">Top Products</h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {allProducts.slice(0, 3).map(product => (
                <div key={product.id} className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.status}</p>
                  </div>
                  <Link href={`/admin/products/edit/${product.id}`} className="text-xs text-blue-600 hover:underline">
                    Edit
                  </Link>
                </div>
              ))}
            </div>
            <Link href="/admin/products" className="block text-center mt-6 text-sm font-medium text-gray-700 hover:text-black">
              View All Products
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className="p-2 bg-gray-50 rounded-md">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={isPositive ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {trend}
          </span>
          <span className="text-gray-500 ml-2">vs last period</span>
        </div>
      )}
    </div>
  );
}
