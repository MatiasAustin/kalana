import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  FileText, 
  Settings, 
  Image as ImageIcon,
  BarChart,
  Megaphone,
  Coffee,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Overview', href: '/admin', icon: LayoutDashboard },
  { 
    name: 'Sales', 
    icon: ShoppingBag,
    subItems: [
      { name: 'Orders', href: '/admin/orders' },
      { name: 'Draft Orders', href: '/admin/orders/draft' },
      { name: 'Abandoned Checkouts', href: '/admin/orders/abandoned' },
    ]
  },
  { 
    name: 'Products', 
    icon: Coffee,
    subItems: [
      { name: 'All Products', href: '/admin/products' },
      { name: 'Collections', href: '/admin/products/collections' },
      { name: 'Inventory', href: '/admin/products/inventory' },
      { name: 'Product Reviews', href: '/admin/products/reviews' },
    ]
  },
  { 
    name: 'Content', 
    icon: FileText,
    subItems: [
      { name: 'Homepage', href: '/admin/content/homepage' },
      { name: 'Pages', href: '/admin/content/pages' },
      { name: 'Navigation', href: '/admin/content/navigation' },
      { name: 'Announcements', href: '/admin/content/announcements' },
      { name: 'Blog / Journal', href: '/admin/content/blog' },
    ]
  },
  { 
    name: 'Space', 
    icon: Coffee, // You might want a different icon for Space
    subItems: [
      { name: 'Events', href: '/admin/space/events' },
      { name: 'Workshops', href: '/admin/space/workshops' },
      { name: 'Location', href: '/admin/space/location' },
    ]
  },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { 
    name: 'Marketing', 
    icon: Megaphone,
    subItems: [
      { name: 'Discounts', href: '/admin/marketing/discounts' },
      { name: 'Campaigns', href: '/admin/marketing/campaigns' },
      { name: 'Email Capture', href: '/admin/marketing/email' },
    ]
  },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Media', href: '/admin/media', icon: ImageIcon },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Sales': true,
    'Products': true,
  });

  const toggleSection = (name: string) => {
    setOpenSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <aside className="w-64 bg-[#F9F9F9] border-r border-gray-200 h-screen flex flex-col sticky top-0 overflow-y-auto hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">KALANA</h1>
        <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Admin</p>
      </div>

      <nav className="flex-1 px-4 pb-6 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === pathname || (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.href)));
          
          if (item.subItems) {
            const isOpen = openSections[item.name];
            return (
              <div key={item.name} className="mb-2">
                <button
                  onClick={() => toggleSection(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive ? "text-black" : "text-gray-600 hover:text-black hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen ? "rotate-180" : "")} />
                </button>
                
                {isOpen && (
                  <div className="mt-1 space-y-1 pl-11">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={cn(
                            "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                            isSubActive ? "bg-gray-200/50 text-black" : "text-gray-500 hover:text-black hover:bg-gray-100"
                          )}
                        >
                          {subItem.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href!}
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors mb-2",
                isActive ? "bg-gray-200/50 text-black" : "text-gray-600 hover:text-black hover:bg-gray-100"
              )}
            >
              <item.icon className={cn(
                "mr-3 h-5 w-5 flex-shrink-0",
                isActive ? "text-black" : "text-gray-400 group-hover:text-black"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
