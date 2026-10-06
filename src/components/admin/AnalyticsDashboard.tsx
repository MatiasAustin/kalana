"use client";

import { useState, useTransition } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Calendar,
  Download,
  RefreshCw,
  CreditCard,
  Truck,
  Tag,
  Coffee,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  ChevronRight,
  Filter,
} from "lucide-react";
import { AnalyticsData, getAnalyticsData, exportAnalyticsCSV } from "@/lib/actions/analytics";
import Link from "next/link";

interface AnalyticsDashboardProps {
  initialData: AnalyticsData;
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData>(initialData);
  const [timeRange, setTimeRange] = useState<string>(initialData.timeRange || "30d");
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "customers" | "space">("overview");
  const [chartMetric, setChartMetric] = useState<"revenue" | "orders">("revenue");
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExporting, setIsExporting] = useState(false);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
    startTransition(async () => {
      try {
        const updated = await getAnalyticsData(newRange);
        setData(updated);
      } catch (err) {
        console.error("Failed to update analytics:", err);
      }
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const updated = await getAnalyticsData(timeRange);
        setData(updated);
      } catch (err) {
        console.error("Failed to refresh analytics:", err);
      }
    });
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const csvString = await exportAnalyticsCSV(timeRange);
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `kalana-analytics-${timeRange}-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to export analytics CSV:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const { kpis, timeline, topProducts, salesByBlend, orderStatusDistribution, paymentStatusDistribution, customerSegments, topCustomers, spaceMetrics, marketingMetrics } = data;

  // Chart max value calculation for scaling
  const maxChartValue = Math.max(
    ...timeline.map((t) => (chartMetric === "revenue" ? t.revenue : t.ordersCount)),
    chartMetric === "revenue" ? 100000 : 1
  );

  return (
    <div className="space-y-8">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analytics & Telemetry</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              Live Database
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Real-time store performance, sales revenue, customer intelligence, and space metrics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="inline-flex bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-medium">
            {[
              { id: "7d", label: "7 Days" },
              { id: "30d", label: "30 Days" },
              { id: "90d", label: "90 Days" },
              { id: "year", label: "This Year" },
              { id: "all", label: "All Time" },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleTimeRangeChange(option.id)}
                disabled={isPending}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeRange === option.id
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh database telemetry"
            className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-black" : ""}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-800 bg-white hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Sales</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <DollarSign className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            IDR {kpis.grossSales.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpis.grossSalesGrowth >= 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{kpis.grossSalesGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-rose-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {kpis.grossSalesGrowth}%
              </span>
            )}
            <span className="text-[11px] text-gray-400">vs prior</span>
          </div>
        </div>

        {/* Net Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Sales</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <BarChart3 className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            IDR {kpis.netSales.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpis.netSalesGrowth >= 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{kpis.netSalesGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-rose-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {kpis.netSalesGrowth}%
              </span>
            )}
            <span className="text-[11px] text-gray-400">after discounts</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <ShoppingCart className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            {kpis.totalOrders} <span className="text-xs font-normal text-gray-400">orders</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpis.totalOrdersGrowth >= 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{kpis.totalOrdersGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-rose-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {kpis.totalOrdersGrowth}%
              </span>
            )}
            <span className="text-[11px] text-gray-400">{data.periodLabel}</span>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Order Value</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <CreditCard className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            IDR {kpis.averageOrderValue.toLocaleString("id-ID")}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpis.aovGrowth >= 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{kpis.aovGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-rose-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {kpis.aovGrowth}%
              </span>
            )}
            <span className="text-[11px] text-gray-400">per order</span>
          </div>
        </div>

        {/* Units Sold */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Units Sold</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <Package className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            {kpis.unitsSold} <span className="text-xs font-normal text-gray-400">items</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            {kpis.unitsSoldGrowth >= 0 ? (
              <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                <TrendingUp className="w-3 h-3 mr-0.5" />
                +{kpis.unitsSoldGrowth}%
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-medium text-rose-600">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                {kpis.unitsSoldGrowth}%
              </span>
            )}
            <span className="text-[11px] text-gray-400">packaged coffee</span>
          </div>
        </div>

        {/* Repeat Customer Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Repeat Rate</span>
            <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100">
              <Users className="w-4 h-4 text-gray-700" />
            </div>
          </div>
          <div className="text-xl font-bold tracking-tight text-gray-900">
            {kpis.repeatCustomerRate}%
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-[11px] text-gray-500">
              {kpis.totalCustomers} total customer accounts
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Chart: Revenue & Volume Timeline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Performance Over Time</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {data.periodLabel} timeline distribution ({data.comparisonLabel})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setChartMetric("revenue")}
                className={`px-3 py-1 rounded-md transition-all ${
                  chartMetric === "revenue"
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Revenue (IDR)
              </button>
              <button
                onClick={() => setChartMetric("orders")}
                className={`px-3 py-1 rounded-md transition-all ${
                  chartMetric === "orders"
                    ? "bg-white text-gray-900 shadow-sm font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Orders Count
              </button>
            </div>
          </div>
        </div>

        {/* SVG Interactive Chart */}
        <div className="relative w-full h-64 pt-4">
          {timeline.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No activity recorded for this period.
            </div>
          ) : (
            <div className="h-full flex items-end gap-2 sm:gap-3 px-2 border-b border-gray-100 pb-2">
              {timeline.map((point, index) => {
                const currentVal = chartMetric === "revenue" ? point.revenue : point.ordersCount;
                const heightPercent = Math.max(8, Math.round((currentVal / maxChartValue) * 100));

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    onMouseEnter={() => setHoveredPoint(point)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute bottom-full mb-3 z-30 bg-black text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap min-w-[140px]">
                      <div className="font-semibold text-gray-200 border-b border-gray-800 pb-1 mb-1">
                        {point.label} ({point.date})
                      </div>
                      <div className="text-emerald-400 font-medium">
                        Revenue: IDR {point.revenue.toLocaleString("id-ID")}
                      </div>
                      <div className="text-gray-300">Orders: {point.ordersCount}</div>
                      <div className="text-gray-300">Units: {point.unitsSold} pcs</div>
                    </div>

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[42px] rounded-t-md transition-all duration-300 ${
                        chartMetric === "revenue"
                          ? currentVal > 0
                            ? "bg-gray-900 group-hover:bg-black"
                            : "bg-gray-100"
                          : currentVal > 0
                          ? "bg-amber-600 group-hover:bg-amber-700"
                          : "bg-gray-100"
                      }`}
                    />

                    {/* X-axis Label */}
                    <span className="text-[10px] text-gray-400 mt-2 truncate w-full text-center group-hover:text-black font-medium">
                      {point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Hover summary info */}
        <div className="flex items-center justify-between pt-4 mt-2 text-xs text-gray-500 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-900 inline-block" />
              Total Recorded Revenue: <strong className="text-gray-900 ml-1">IDR {kpis.grossSales.toLocaleString("id-ID")}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              Discounts Given: <strong className="text-gray-900 ml-1">IDR {kpis.totalDiscounts.toLocaleString("id-ID")}</strong>
            </span>
          </div>
          <span className="text-gray-400">Hover over any bar to inspect daily orders</span>
        </div>
      </div>

      {/* Navigation Tabs for Deep Dive */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {[
            { id: "overview", label: "Pipeline & Operations", icon: BarChart3 },
            { id: "products", label: "Product & Blend Sales", icon: Package },
            { id: "customers", label: "Customer Intelligence", icon: Users },
            { id: "space", label: "Space & Workshops", icon: Coffee },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 inline-flex items-center gap-2 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-black text-black font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-black" : "text-gray-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & PIPELINE */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Status Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Order Fulfillment Status</h3>
              <Link href="/admin/orders" className="text-xs text-blue-600 hover:underline inline-flex items-center">
                Orders list <ChevronRight className="w-3 h-3 ml-0.5" />
              </Link>
            </div>
            <div className="space-y-4">
              {orderStatusDistribution.map((item) => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-gray-700">{item.status}</span>
                    <span className="text-gray-500">
                      {item.count} orders ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === "COMPLETED"
                          ? "bg-emerald-500"
                          : item.status === "PROCESSING"
                          ? "bg-blue-500"
                          : item.status === "PENDING"
                          ? "bg-amber-400"
                          : "bg-rose-400"
                      }`}
                      style={{ width: `${Math.max(item.percentage, item.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Payment Reconciliation</h3>
              <span className="text-xs text-gray-400">Total: {kpis.totalOrders}</span>
            </div>
            <div className="space-y-4">
              {paymentStatusDistribution.map((item) => (
                <div key={item.status} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-gray-900">{item.status}</span>
                    <span className="font-medium text-gray-700">{item.count} orders</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">
                    IDR {item.amount.toLocaleString("id-ID")}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div
                      className={`h-1.5 rounded-full ${
                        item.status === "PAID"
                          ? "bg-emerald-600"
                          : item.status === "UNPAID"
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marketing & Space Summary */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Promotions & Vouchers</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500">Active Coupons</div>
                  <div className="text-lg font-bold text-gray-900 mt-1">
                    {marketingMetrics.activeDiscountsCount}
                  </div>
                  <Link href="/admin/marketing/discounts" className="text-[11px] text-blue-600 hover:underline mt-1 block">
                    Manage vouchers
                  </Link>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500">Total Claimed</div>
                  <div className="text-lg font-bold text-emerald-600 mt-1">
                    {marketingMetrics.totalDiscountRedemptions} uses
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Saved: Rp {marketingMetrics.totalDiscountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Space & Community</h3>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Upcoming Events</span>
                <span className="font-semibold text-gray-900">{spaceMetrics.upcomingEvents} sessions</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50">
                <span className="text-gray-500">Total Workshop Capacity</span>
                <span className="font-semibold text-gray-900">{spaceMetrics.totalCapacity} attendees</span>
              </div>
              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-gray-500">Est. Space Revenue</span>
                <span className="font-semibold text-emerald-700">
                  IDR {spaceMetrics.estimatedRevenue.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT & BLEND SALES */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* Blend breakdown cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salesByBlend.map((blend) => (
              <div key={blend.name} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Blend Family</span>
                  <h4 className="text-lg font-bold text-gray-900 mt-1">{blend.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{blend.unitsSold} units ordered</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-900">
                    IDR {blend.revenue.toLocaleString("id-ID")}
                  </div>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                    {blend.percentageShare}% of sales
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Products Table */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Product & Variant Leaderboard</h3>
              <span className="text-xs text-gray-500">{topProducts.length} variants tracked</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium w-12">#</th>
                    <th className="px-6 py-3 font-medium">Product & Variant</th>
                    <th className="px-6 py-3 font-medium">SKU</th>
                    <th className="px-6 py-3 font-medium text-right">Units Sold</th>
                    <th className="px-6 py-3 font-medium text-right">Gross Revenue</th>
                    <th className="px-6 py-3 font-medium text-right">Sales Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No product sales recorded in this period.
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((prod, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{prod.productName}</div>
                          <div className="text-xs text-gray-500">{prod.variantName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                            {prod.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {prod.unitsSold} pcs
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          IDR {prod.totalRevenue.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs font-medium text-gray-700">{prod.percentageShare}%</span>
                            <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-gray-900 h-1.5 rounded-full"
                                style={{ width: `${prod.percentageShare}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CUSTOMER INTELLIGENCE */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* Customer Segments Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customerSegments.map((seg) => (
              <div key={seg.type} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                    {seg.type} Customers
                  </span>
                  <span className="text-xs text-gray-400">{seg.customerCount} registered</span>
                </div>
                <div className="text-xl font-bold text-gray-900">
                  IDR {seg.totalRevenue.toLocaleString("id-ID")}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{seg.ordersCount} orders placed</span>
                  <span className="font-semibold text-gray-700">{seg.percentageShare}% of store revenue</span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Spending Customers Leaderboard */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Top Customers (Lifetime Value)</h3>
                <p className="text-xs text-gray-500 mt-0.5">Highest spending patrons and cafe wholesale partners</p>
              </div>
              <Link href="/admin/customers" className="text-xs text-blue-600 hover:underline">
                View all customers
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Type</th>
                    <th className="px-6 py-3 font-medium text-center">Orders</th>
                    <th className="px-6 py-3 font-medium text-right">Total Spent</th>
                    <th className="px-6 py-3 font-medium text-right">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {topCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                        No customer transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    topCustomers.map((cust) => (
                      <tr key={cust.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{cust.name}</div>
                          <div className="text-xs text-gray-500">{cust.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            cust.customerType === "WHOLESALE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}>
                            {cust.customerType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-semibold text-gray-900">
                          {cust.ordersCount}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          IDR {cust.totalSpent.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-right text-xs text-gray-500">
                          {cust.lastOrderDate}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SPACE & WORKSHOPS */}
      {activeTab === "space" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Space Utilization & Capacity</h3>
            <p className="text-xs text-gray-500">
              Community workshops and sensory tasting sessions hosted at KALANA Space Cikampek.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500">Total Workshops</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{spaceMetrics.totalEvents}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500">Seat Capacity</span>
                <div className="text-xl font-bold text-gray-900 mt-1">{spaceMetrics.totalCapacity} seats</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500">Upcoming Sessions</span>
                <div className="text-xl font-bold text-emerald-600 mt-1">{spaceMetrics.upcomingEvents}</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-xs text-gray-500">Projected Ticket Value</span>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  IDR {spaceMetrics.estimatedRevenue.toLocaleString("id-ID")}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/admin/space/workshops"
                className="inline-flex items-center text-xs font-semibold text-black hover:underline"
              >
                Go to Space Management <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">About KALANA Telemetry</h3>
            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <p>
                Data pada panel Analytics terhubung langsung ke database Turso dan mencerminkan seluruh pesanan yang masuk melalui kasir checkout storefront maupun pemesanan manual admin.
              </p>
              <p>
                Metrik <strong>Net Sales</strong> mengecualikan diskon voucher dan pesanan berstatus CANCELLED / REFUNDED untuk memberikan kalkulasi omzet bersih yang akurat bagi tim keuangan KALANA.
              </p>
              <p>
                Gunakan tombol <strong>Export CSV</strong> di bagian atas untuk mengunduh laporan penjualan berkala yang kompatibel dengan Microsoft Excel, Google Sheets, dan software akuntansi.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
