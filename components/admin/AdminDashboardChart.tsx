import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AdminDashboardChartStats {
  salesMonths?: string[];
  salesData?: number[];
  categoryLabels?: string[];
  categoryData?: number[];
  orderStatusLabels?: string[];
  orderStatusData?: number[];
  usersData?: number[];
  productsData?: number[];
  ordersData?: number[];
  revenueData?: number[];
}

export default function AdminDashboardChart({
  stats,
}: {
  stats: AdminDashboardChartStats;
}) {
  // Dynamic chart data from stats
  const barData = {
    labels: stats.salesMonths || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Sales",
        data: stats.salesData || [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
      },
    ],
  };

  const usersData = {
    labels: stats.salesMonths || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Users",
        data: stats.usersData || [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(16, 185, 129, 0.5)",
      },
    ],
  };

  const productsData = {
    labels: stats.salesMonths || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Products",
        data: stats.productsData || [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(251, 191, 36, 0.5)",
      },
    ],
  };

  const ordersData = {
    labels: stats.salesMonths || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Orders",
        data: stats.ordersData || [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(239, 68, 68, 0.5)",
      },
    ],
  };

  const revenueData = {
    labels: stats.salesMonths || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Revenue",
        data: stats.revenueData || [0, 0, 0, 0, 0, 0],
        backgroundColor: "rgba(99, 102, 241, 0.5)",
      },
    ],
  };

  const pieData = {
    labels: stats.categoryLabels || [
      "Skincare",
      "Makeup",
      "Haircare",
      "Fragrance",
    ],
    datasets: [
      {
        label: "Product Categories",
        data: stats.categoryData || [0, 0, 0, 0],
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(251, 191, 36, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const doughnutData = {
    labels: stats.orderStatusLabels || ["Completed", "Pending", "Cancelled"],
    datasets: [
      {
        label: "Order Status",
        data: stats.orderStatusData || [0, 0, 0],
        backgroundColor: [
          "rgba(16, 185, 129, 0.7)",
          "rgba(59, 130, 246, 0.7)",
          "rgba(239, 68, 68, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Monthly Sales</h3>
        <Bar
          data={barData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Monthly Sales" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Users</h3>
        <Bar
          data={usersData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Users" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Products</h3>
        <Bar
          data={productsData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Products" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Orders</h3>
        <Bar
          data={ordersData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Orders" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Revenue</h3>
        <Bar
          data={revenueData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Revenue" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Product Categories</h3>
        <Pie
          data={pieData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Product Categories" },
            },
          }}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col items-center">
        <h3 className="font-semibold mb-4">Order Status</h3>
        <Doughnut
          data={doughnutData}
          options={{
            ...chartOptions,
            plugins: {
              ...chartOptions.plugins,
              title: { display: true, text: "Order Status" },
            },
          }}
        />
      </div>
    </div>
  );
}
