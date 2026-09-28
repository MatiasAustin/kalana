import Link from 'next/link';
import { Search, Filter, Download, MoreHorizontal } from 'lucide-react';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { format } from 'date-fns';

export default async function OrdersPage() {
  const allOrders = await db.query.orders.findMany({
    with: {
      customer: true
    },
    orderBy: [desc(orders.createdAt)],
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders..." 
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
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Unfulfilled</span>
            <span className="hover:bg-gray-100 px-2 py-1 rounded cursor-pointer">Unpaid</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium w-8">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="px-6 py-3 font-medium">Order</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Payment</th>
                <th className="px-6 py-3 font-medium">Fulfillment</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                allOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 font-medium text-black">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy h:mm a") : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : "Guest"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        order.fulfillmentStatus === 'FULFILLED' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.fulfillmentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      IDR {order.total.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-sm text-gray-500">
          <span>Showing {allOrders.length} orders</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
