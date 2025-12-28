import { getApplications } from "../actions";
import { RefreshCcw } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const applications = await getApplications();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Loan Applications
          </h1>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Farmer Name</th>
                  <th className="px-6 py-4">Mobile Number</th>
                  <th className="px-6 py-4">Crop Type</th>
                  <th className="px-6 py-4">Loan Amount</th>
                  <th className="px-6 py-4">Risk Score</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app: any) => (
                  <tr key={app._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {app.farmerName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.mobileNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {app.cropType || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{app.loanAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.riskScore > 70
                            ? "bg-red-100 text-red-800"
                            : app.riskScore > 30
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {app.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === "Approved"
                            ? "bg-green-100 text-green-800"
                            : app.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : app.status === "Rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {applications.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-400"
                    >
                      No applications found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
