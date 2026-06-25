interface StatusBadgeProps {
    status: string;
  }
  
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    new: { bg: "bg-blue-100", text: "text-blue-700", label: "Nouvelle" },
    in_progress: { bg: "bg-yellow-100", text: "text-yellow-700", label: "En cours" },
    waiting: { bg: "bg-orange-100", text: "text-orange-700", label: "En attente d'info" },
    quote_sent: { bg: "bg-purple-100", text: "text-purple-700", label: "Devis envoyé" },
    completed: { bg: "bg-green-100", text: "text-green-700", label: "Traitée" },
    closed: { bg: "bg-gray-100", text: "text-gray-700", label: "Clôturée" },
    pending: { bg: "bg-purple-100", text: "text-purple-700", label: "En attente" },
  };
  
  export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.new;
  
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }
  