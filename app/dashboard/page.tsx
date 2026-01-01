import { getApplications } from "@/app/actions";
import Link from "next/link";
import { Plus, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default async function DashboardPage() {
  const applications = await getApplications();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto p-8">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Your Applications
            </h1>
            <p className="text-slate-500 mt-1">
              Track the status of your loan requests.
            </p>
          </div>
          <Link
            href="/apply"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Application
          </Link>
        </header>

        {applications.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl shadow-sm border border-slate-200 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Applications Yet
            </h3>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              You haven&apos;t applied for any loans yet. Start a new
              application to get financial support.
            </p>
            <Link
              href="/apply"
              className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline"
            >
              Start Application
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-6 font-semibold text-slate-600 text-sm">
                    Application ID
                  </th>
                  <th className="p-6 font-semibold text-slate-600 text-sm">
                    Loan Type
                  </th>
                  <th className="p-6 font-semibold text-slate-600 text-sm">
                    Submitted Date
                  </th>
                  <th className="p-6 font-semibold text-slate-600 text-sm">
                    Status
                  </th>
                  <th className="p-6 font-semibold text-slate-600 text-sm md:text-right">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app: any) => (
                  <tr
                    key={app._id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="p-6 font-mono text-sm text-slate-500">
                      #{app._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="p-6 font-medium text-slate-800">
                      {app.type === "KCC"
                        ? "Kisan Credit Card"
                        : app.type === "Mechanization"
                        ? "Tractor Loan"
                        : "Dairy Loan"}
                    </td>
                    <td className="p-6 text-slate-500 text-sm">
                      {new Date(
                        app.updatedAt || app.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                          app.status === "Submitted"
                            ? "bg-blue-50 text-blue-700"
                            : app.status === "Draft"
                            ? "bg-yellow-50 text-yellow-700"
                            : app.status === "Approved"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {app.status === "Submitted" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {app.status === "Draft" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {app.status === "Approved" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {app.status === "Rejected" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {app.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {app.status === "Draft" ? (
                        <Link
                          href={`/apply`}
                          className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                          Resume
                        </Link>
                      ) : (
                        <button className="text-sm font-semibold text-slate-400 cursor-not-allowed">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
