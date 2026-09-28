import Link from 'next/link';
import { Search, Filter, Download } from 'lucide-react';

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors">
            Create Order
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
              <OrderRow 
                id="#KALANA-1025" 
                date="Today at 14:30" 
                customer="Alex Morgan" 
                payment="Paid" 
                fulfillment="Unfulfilled" 
                total="Rp 120,000" 
              />
              <OrderRow 
                id="#KALANA-1024" 
                date="Yesterday at 11:20" 
                customer="John Doe" 
                payment="Paid" 
                fulfillment="Fulfilled" 
                total="Rp 178,000" 
              />
              <OrderRow 
                id="#KALANA-1023" 
                date="Sep 26 at 09:15" 
                customer="Sarah Smith" 
                payment="Pending" 
                fulfillment="Unfulfilled" 
                total="Rp 350,000" 
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrderRow({ id, date, customer, payment, fulfillment, total }: any) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer group">
      <td className="px-6 py-4">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-6 py-4 font-medium text-black group-hover:underline">
        {id}
      </td>
      <td className="px-6 py-4 text-gray-600">
        {date}
      </td>
      <td className="px-6 py-4 text-gray-900">
        {customer}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          payment === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {payment}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          fulfillment === 'Fulfilled' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {fulfillment}
        </span>
      </td>
      <td className="px-6 py-4 text-right text-gray-900">
        {total}
      </td>
    </tr>
  );
}
