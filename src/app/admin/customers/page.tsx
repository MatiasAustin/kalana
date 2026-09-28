import Link from 'next/link';
import { Search, Filter, Plus } from 'lucide-react';

export default function CustomersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search customers..." 
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
          <div className="flex gap-2 text-sm text-gray-600">
            <span className="bg-gray-100 px-2 py-1 rounded">All</span>
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Retail</span>
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Wholesale</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 font-medium">Customer Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Orders</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium text-right">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              <CustomerRow 
                name="John Doe" 
                email="john@example.com" 
                orders={12} 
                type="Retail" 
                total="Rp 1,500,000" 
              />
              <CustomerRow 
                name="Sarah Smith" 
                email="sarah@cafesmith.com" 
                orders={4} 
                type="Wholesale" 
                total="Rp 12,000,000" 
              />
              <CustomerRow 
                name="Alex Morgan" 
                email="alex.m@example.com" 
                orders={1} 
                type="Retail" 
                total="Rp 120,000" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerRow({ name, email, orders, type, total }: any) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-6 py-4 font-medium text-black group-hover:underline">
        {name}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {email}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {orders}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          type === 'Wholesale' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {type}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-gray-900 font-medium">
        {total}
      </td>
    </tr>
  );
}
