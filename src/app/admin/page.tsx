import { ArrowUpRight, ArrowDownRight, Package, ShoppingCart, DollarSign, Users } from 'lucide-react';
import Link from 'next/link';

export default function AdminOverview() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <select className="border border-gray-300 rounded-md text-sm py-2 px-3 bg-white focus:outline-none focus:ring-1 focus:ring-black">
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
          <option>Custom</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Sales" 
          value="Rp 12,450,000" 
          trend="+12.5%" 
          isPositive={true} 
          icon={DollarSign} 
        />
        <KPICard 
          title="Orders" 
          value="142" 
          trend="+5.2%" 
          isPositive={true} 
          icon={ShoppingCart} 
        />
        <KPICard 
          title="Average Order Value" 
          value="Rp 87,670" 
          trend="-1.2%" 
          isPositive={false} 
          icon={Package} 
        />
        <KPICard 
          title="Products Sold" 
          value="328" 
          trend="+18.4%" 
          isPositive={true} 
          icon={Package} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Sales Graph (Placeholder) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Sales Over Time</h2>
            <div className="flex space-x-2">
              <button className="text-sm px-3 py-1 bg-gray-100 rounded-md font-medium text-gray-800">Gross Sales</button>
              <button className="text-sm px-3 py-1 hover:bg-gray-50 rounded-md font-medium text-gray-500">Net Sales</button>
              <button className="text-sm px-3 py-1 hover:bg-gray-50 rounded-md font-medium text-gray-500">Orders</button>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2 opacity-70">
            {/* Simple bar chart placeholder */}
            {[40, 55, 45, 70, 65, 80, 95].map((h, i) => (
              <div key={i} className="flex-1 bg-gray-200 rounded-t-sm" style={{ height: `${h}%` }}>
                <div className="w-full bg-black rounded-t-sm" style={{ height: `${h * 0.8}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Low Stock Alert</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">DAILY HOUSE</p>
                <p className="text-xs text-gray-500">500g</p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">12 units left</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <p className="text-sm font-medium text-gray-900">DAILY CREMA</p>
                <p className="text-xs text-gray-500">1000g</p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">8 units left</span>
            </div>
          </div>
          <Link href="/admin/products/inventory" className="block text-center text-sm text-black font-medium mt-4 hover:underline">
            Manage Inventory
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 font-medium text-black">#KALANA-1024</td>
                <td className="px-6 py-4 text-gray-600">John Doe</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Paid
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">Rp 178,000</td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                <td className="px-6 py-4 font-medium text-black">#KALANA-1023</td>
                <td className="px-6 py-4 text-gray-600">Sarah Smith</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-gray-900">Rp 350,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
            <Link href="/admin/products" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
              <tr>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium text-right">Units</th>
                <th className="px-6 py-3 font-medium text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4 font-medium text-black">DAILY HOUSE</td>
                <td className="px-6 py-4 text-right text-gray-600">145</td>
                <td className="px-6 py-4 text-right text-gray-900">Rp 4,500,000</td>
              </tr>
              <tr className="border-b border-gray-50">
                <td className="px-6 py-4 font-medium text-black">DAILY CREMA</td>
                <td className="px-6 py-4 text-right text-gray-600">89</td>
                <td className="px-6 py-4 text-right text-gray-900">Rp 3,200,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <QuickActionButton href="/admin/products/new" label="Add Product" />
          <QuickActionButton href="/admin/collections/new" label="Create Collection" />
          <QuickActionButton href="/admin/marketing/discounts/new" label="Create Discount" />
          <QuickActionButton href="/admin/space/events/new" label="Add Event" />
          <QuickActionButton href="/admin/content/homepage" label="Edit Homepage" />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon: Icon }: { title: string, value: string, trend: string, isPositive: boolean, icon: any }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="p-2 bg-gray-50 rounded-md text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-auto">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center mt-2">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
          <span className="text-sm text-gray-400 ml-2">vs last period</span>
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">
      {label}
    </Link>
  );
}
