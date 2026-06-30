const styles = { Pending: "bg-yellow-50 text-yellow-700 border-yellow-200", Processing: "bg-blue-50 text-blue-700 border-blue-200", Paid: "bg-green-50 text-green-700 border-green-200", Failed: "bg-red-50 text-red-700 border-red-200", Cancelled: "bg-slate-100 text-slate-600 border-slate-200" };

export default function PaymentStatusBadge({ status = "Pending" }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${styles[status] || styles.Pending}`}>{status}</span>;
}
