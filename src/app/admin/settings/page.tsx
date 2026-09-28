import { Store, CreditCard, Truck, Users, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SettingCard 
          title="Store Details" 
          description="Manage your business name, contact info, and currency." 
          icon={Store} 
          href="/admin/settings/store" 
        />
        <SettingCard 
          title="Payments" 
          description="Enable and manage your store's payment providers." 
          icon={CreditCard} 
          href="/admin/settings/payments" 
        />
        <SettingCard 
          title="Shipping and Delivery" 
          description="Manage where you ship, how much you charge, and local delivery." 
          icon={Truck} 
          href="/admin/settings/shipping" 
        />
        <SettingCard 
          title="Users and Permissions" 
          description="Manage what staff can see or do in your store." 
          icon={Users} 
          href="/admin/settings/users" 
        />
        <SettingCard 
          title="General Settings" 
          description="SEO, Social media, and other configurations." 
          icon={SettingsIcon} 
          href="/admin/settings/general" 
        />
      </div>
    </div>
  );
}

function SettingCard({ title, description, icon: Icon, href }: any) {
  return (
    <Link href={href} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group">
      <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
        <Icon className="w-6 h-6 text-gray-600 group-hover:text-black" />
      </div>
      <div>
        <h3 className="text-lg font-medium text-gray-900 group-hover:text-black">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
    </Link>
  );
}
