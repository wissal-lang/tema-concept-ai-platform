interface StatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  new: { bg: "bg-blue-50", text: "text-[#2563EB]", dot: "bg-[#2563EB]", label: "Nouvelle" },
  in_progress: { bg: "bg-amber-50", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]", label: "En cours" },
  waiting: { bg: "bg-amber-50", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]", label: "En attente d'info" },
  quote_sent: { bg: "bg-slate-100", text: "text-[#64748B]", dot: "bg-[#64748B]", label: "Devis envoyé" },
  completed: { bg: "bg-green-50", text: "text-[#22C55E]", dot: "bg-[#22C55E]", label: "Traitée" },
  closed: { bg: "bg-slate-100", text: "text-[#64748B]", dot: "bg-[#64748B]", label: "Clôturée" },
  pending: { bg: "bg-amber-50", text: "text-[#F59E0B]", dot: "bg-[#F59E0B]", label: "En attente" },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.new;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
