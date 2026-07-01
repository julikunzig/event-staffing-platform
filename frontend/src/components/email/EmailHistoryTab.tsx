import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { History, RefreshCw } from "lucide-react";
import type { EmailDeliveryLog, EmailHistoryFilters } from "@/types/email";

interface Props {
  companyId: number;
}

export default function EmailHistoryTab({ companyId }: Props) {
  const [logs, setLogs] = useState<EmailDeliveryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [filters, setFilters] = useState<EmailHistoryFilters>({
    recipient_email: "",
    subject: "",
    status: "",
    page: 1,
    page_size: 25,
  });

  useEffect(() => {
    loadLogs();
  }, [companyId]);

  const loadLogs = async () => {
    setLoading(true);
    setMessage("");

    try {
      const res = await api.get(`/companies/${companyId}/email-delivery-logs?limit=200`);
      setLogs(res.data || []);
    } catch (error) {
      setMessage(getApiError(error, "Error al cargar historial de envíos."));
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (field: keyof EmailHistoryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [field]: value, page: field === "page" ? value : 1 }));
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const recipient = filters.recipient_email.trim().toLowerCase();
      const subject = filters.subject.trim().toLowerCase();

      if (recipient && !log.recipient_email.toLowerCase().includes(recipient)) return false;
      if (subject && !log.subject.toLowerCase().includes(subject)) return false;
      if (filters.status && log.status !== filters.status) return false;

      return true;
    });
  }, [logs, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / filters.page_size));
  const currentPage = Math.min(filters.page, totalPages);
  const start = (currentPage - 1) * filters.page_size;
  const paginatedLogs = filteredLogs.slice(start, start + filters.page_size);

  return (
    <section style={card}>
      <div style={headerRow}>
        <CardTitleInline icon={<History size={17} />}>Historial de envíos</CardTitleInline>

        <button onClick={loadLogs} style={refreshButton} disabled={loading}>
          <RefreshCw size={15} />
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {message && <div style={errorBox}>{message}</div>}

      <div style={filtersGrid}>
        <Field label="Destinatario">
          <input
            value={filters.recipient_email}
            onChange={(e) => updateFilter("recipient_email", e.target.value)}
            style={input}
            placeholder="correo@ejemplo.com"
          />
        </Field>

        <Field label="Asunto">
          <input
            value={filters.subject}
            onChange={(e) => updateFilter("subject", e.target.value)}
            style={input}
            placeholder="Buscar asunto..."
          />
        </Field>

        <Field label="Estado">
          <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} style={input}>
            <option value="">Todos</option>
            <option value="success">Correcto</option>
            <option value="failed">Error</option>
            <option value="pending">Pendiente</option>
          </select>
        </Field>

        <Field label="Por página">
          <select
            value={filters.page_size}
            onChange={(e) => updateFilter("page_size", Number(e.target.value))}
            style={input}
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </Field>
      </div>

      {filteredLogs.length === 0 ? (
        <div style={emptyState}>No hay correos registrados con los filtros seleccionados.</div>
      ) : (
        <>
          <div style={summaryRow}>
            Mostrando {paginatedLogs.length} de {filteredLogs.length} registros.
          </div>

          <div style={logsTable}>
            <div style={logsHeader}>
              <span>Fecha</span>
              <span>Destinatario</span>
              <span>Asunto</span>
              <span>Estado</span>
              <span>Error</span>
            </div>

            {paginatedLogs.map((log) => (
              <div key={log.id} style={logsRow}>
                <span>{formatDate(log.created_at)}</span>
                <span>{log.recipient_email}</span>
                <span>{log.subject}</span>
                <span style={getLogStatusStyle(log.status)}>{translateStatus(log.status)}</span>
                <span style={errorCell} title={log.error_message || ""}>{log.error_message || "—"}</span>
              </div>
            ))}
          </div>

          <div style={paginationRow}>
            <button
              style={paginationButton}
              onClick={() => updateFilter("page", Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1}
            >
              Anterior
            </button>

            <span>Página {currentPage} de {totalPages}</span>

            <button
              style={paginationButton}
              onClick={() => updateFilter("page", Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}

function Field({ label, children }: any) {
  return (
    <label style={field}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function CardTitleInline({ icon, children }: any) {
  return (
    <div style={inlineTitle}>
      <span style={iconCircleSmall}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{children}</h2>
    </div>
  );
}

function getApiError(error: any, fallback: string) {
  const detail = error?.response?.data?.detail;
  const message = error?.response?.data?.message;

  if (typeof detail === "string") return detail;
  if (typeof message === "string") return message;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        const field = Array.isArray(item.loc) ? item.loc.join(".") : "";
        return `${field}: ${item.msg}`;
      })
      .join(" | ");
  }

  return fallback;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function translateStatus(status: string) {
  if (status === "success") return "Correcto";
  if (status === "failed") return "Error";
  if (status === "pending") return "Pendiente";
  return status;
}

function getLogStatusStyle(status: string): React.CSSProperties {
  if (status === "success") return { ...statusPill, background: "#f0fdf4", color: "#166534" };
  if (status === "failed") return { ...statusPill, background: "#fef2f2", color: "#991b1b" };
  return { ...statusPill, background: "#fffbeb", color: "#92400e" };
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.08)", border: "1px solid #e5e7eb" };
const headerRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #e5e7eb", marginBottom: 12 };
const inlineTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const iconCircleSmall: React.CSSProperties = { width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 500, color: "#475467" };
const input: React.CSSProperties = { width: "100%", height: 34, padding: "6px 10px", border: "1px solid #d0d5dd", borderRadius: 9, fontSize: 14, fontWeight: 400, background: "#fff" };
const filtersGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.2fr 1.2fr .8fr .6fr", gap: 10, marginBottom: 12 };
const refreshButton: React.CSSProperties = { padding: "8px 12px", borderRadius: 9, border: "1px solid #d0d5dd", background: "#fff", color: "#344054", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const errorBox: React.CSSProperties = { marginBottom: 10, padding: 10, borderRadius: 10, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontSize: 13 };
const emptyState: React.CSSProperties = { border: "1px dashed #d0d5dd", borderRadius: 12, padding: 14, color: "#667085", fontSize: 13 };
const summaryRow: React.CSSProperties = { color: "#667085", fontSize: 12, marginBottom: 8 };
const logsTable: React.CSSProperties = { display: "grid", gap: 0, border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" };
const logsHeader: React.CSSProperties = { display: "grid", gridTemplateColumns: "180px 220px 1fr 110px 1fr", gap: 10, background: "#f9fafb", padding: "10px 12px", fontSize: 12, fontWeight: 800, color: "#344054" };
const logsRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "180px 220px 1fr 110px 1fr", gap: 10, padding: "10px 12px", fontSize: 12, borderTop: "1px solid #e5e7eb", alignItems: "center" };
const statusPill: React.CSSProperties = { borderRadius: 999, padding: "4px 8px", fontWeight: 800, fontSize: 12, width: "fit-content" };
const errorCell: React.CSSProperties = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" };
const paginationRow: React.CSSProperties = { marginTop: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 13 };
const paginationButton: React.CSSProperties = { padding: "7px 11px", borderRadius: 9, border: "1px solid #d0d5dd", background: "#fff", color: "#344054", fontWeight: 700, cursor: "pointer" };
