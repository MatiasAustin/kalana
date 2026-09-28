import { Bell, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search products, orders, customers, pages..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 ml-6">
        <Link 
          href="/" 
          target="_blank" 
          className="text-sm font-medium text-gray-600 hover:text-black flex items-center"
        >
          View Store
          <ExternalLink className="ml-1 h-4 w-4" />
        </Link>
        
        <button className="text-gray-400 hover:text-gray-500 relative">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>

        <div className="relative">
          <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition duration-150 ease-in-out">
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
              M
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
