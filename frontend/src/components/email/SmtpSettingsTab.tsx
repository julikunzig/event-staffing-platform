import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Mail, Send, Clock, Info, ShieldCheck, ShieldAlert } from "lucide-react";
import { EMPTY_EMAIL_SETTINGS } from "@/types/email";
import type { EmailSettings } from "@/types/email";

interface Props {
  companyId: number;
}

export default function SmtpSettingsTab({ companyId }: Props) {
  const [form, setForm] = useState<EmailSettings>(EMPTY_EMAIL_SETTINGS);
  const [testEmail, setTestEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    loadSmtpSettings();
  }, [companyId]);

  const loadSmtpSettings = async () => {
    try {
      const res = await api.get(`/companies/${companyId}/email-settings`);

      if (res.data) {
        setForm({
          from_name: res.data.from_name || "",
          from_email: res.data.from_email || "",
          smtp_host: res.data.smtp_host || "",
          smtp_port: res.data.smtp_port || 587,
          smtp_username: res.data.smtp_username || "",
          smtp_password: "",
          use_tls: res.data.use_tls ?? true,
          use_ssl: res.data.use_ssl ?? false,
          is_active: res.data.is_active ?? true,
          last_test_at: res.data.last_test_at || "",
          last_test_success: res.data.last_test_success,
          last_test_message: res.data.last_test_message || "",
        });
      }
    } catch (error) {
      showError(getApiError(error, "Error al cargar la configuración SMTP."));
    }
  };

  const update = (field: keyof EmailSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const showSuccess = (text: string) => {
    setMessageType("success");
    setMessage(text);
  };

  const showError = (text: string) => {
    setMessageType("error");
    setMessage(text);
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validateSave = () => {
    if (!form.from_name.trim()) return "El nombre del remitente es obligatorio.";
    if (!form.from_email.trim()) return "El correo remitente es obligatorio.";
    if (!validateEmail(form.from_email)) return "El correo remitente no tiene un formato válido.";
    if (!form.smtp_host.trim()) return "El host SMTP es obligatorio.";
    if (!form.smtp_port || Number(form.smtp_port) <= 0) return "El puerto SMTP debe ser mayor a 0.";
    return "";
  };

  const save = async () => {
    setMessage("");

    const validationError = validateSave();
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        from_name: form.from_name.trim(),
        from_email: form.from_email.trim(),
        smtp_host: form.smtp_host.trim(),
        smtp_port: Number(form.smtp_port),
        smtp_username: form.smtp_username.trim() || null,
        use_tls: form.use_tls,
        use_ssl: form.use_ssl,
        is_active: form.is_active,
      };

      if (form.smtp_password.trim()) {
        payload.smtp_password = form.smtp_password;
      }

      await api.put(`/companies/${companyId}/email-settings`, payload);
      showSuccess("Configuración guardada correctamente.");
      await loadSmtpSettings();
    } catch (error) {
      showError(getApiError(error, "Error al guardar la configuración."));
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    setMessage("");

    if (!testEmail.trim()) {
      showError("El correo destino es obligatorio.");
      return;
    }

    if (!validateEmail(testEmail)) {
      showError("El correo destino no tiene un formato válido.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/companies/${companyId}/email-settings/test`, {
        test_email: testEmail.trim(),
      });

      if (res.data?.success === false) {
        showError(res.data.message || "No se pudo enviar el correo de prueba.");
      } else {
        showSuccess(res.data.message || "Correo de prueba enviado.");
      }

      await loadSmtpSettings();
    } catch (error) {
      showError(getApiError(error, "Error al enviar correo de prueba."));
    } finally {
      setLoading(false);
    }
  };

  const domainCheck = getDomainCheck(form.from_email, form.smtp_host);

  return (
    <>
      {message && <div style={messageType === "success" ? successBox : errorBox}>{message}</div>}

      <div style={grid}>
        <section style={card}>
          <CardTitle icon={<Mail size={17} />}>Configuración SMTP</CardTitle>

          <h3 style={sectionTitle}>Datos del remitente</h3>

          <div style={twoCols}>
            <Field label="Nombre remitente" required>
              <input
                value={form.from_name}
                onChange={(e) => update("from_name", e.target.value)}
                style={input}
                placeholder="Kalirio Staff Platform"
              />
            </Field>

            <Field label="Correo remitente" required>
              <input
                value={form.from_email}
                onChange={(e) => update("from_email", e.target.value)}
                style={input}
                placeholder="no-reply@empresa.com"
              />
            </Field>
          </div>

          <h3 style={sectionTitle}>Servidor</h3>

          <div style={serverGrid}>
            <Field label="SMTP Host" required>
              <input
                value={form.smtp_host}
                onChange={(e) => update("smtp_host", e.target.value)}
                style={input}
                placeholder="mail.empresa.com"
              />
            </Field>

            <Field label="Puerto" required>
              <input
                type="number"
                value={form.smtp_port}
                onChange={(e) => update("smtp_port", Number(e.target.value))}
                style={input}
              />
            </Field>
          </div>

          <div style={twoCols}>
            <Field label="Usuario SMTP">
              <input
                value={form.smtp_username}
                onChange={(e) => update("smtp_username", e.target.value)}
                style={input}
                placeholder="usuario"
              />
            </Field>

            <Field label="Contraseña SMTP">
              <input
                type="password"
                value={form.smtp_password}
                onChange={(e) => update("smtp_password", e.target.value)}
                style={input}
                placeholder="Dejar vacío para conservar"
              />
            </Field>
          </div>

          <div style={checks}>
            <Check label="Usar TLS" checked={form.use_tls} onChange={(v: boolean) => update("use_tls", v)} />
            <Check label="Usar SSL" checked={form.use_ssl} onChange={(v: boolean) => update("use_ssl", v)} />
            <Check label="Activo" checked={form.is_active} onChange={(v: boolean) => update("is_active", v)} />
          </div>

          <button onClick={save} disabled={loading} style={primaryButton}>
            {loading ? "Procesando..." : "Guardar configuración"}
          </button>
        </section>

        <section style={card}>
          <CardTitle icon={<Send size={17} />}>Correo de prueba</CardTitle>

          <Field label="Correo destino" required>
            <input
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              style={input}
              placeholder="correo@ejemplo.com"
            />
          </Field>

          <button
            onClick={sendTest}
            disabled={loading || !testEmail.trim()}
            style={{
              ...darkButton,
              opacity: loading || !testEmail.trim() ? 0.55 : 1,
              cursor: loading || !testEmail.trim() ? "not-allowed" : "pointer",
            }}
          >
            Enviar correo de prueba
          </button>

          <div style={divider} />

          <h3 style={compactTitle}>
            <span style={smallIconCircle}><Clock size={15} /></span>
            Última prueba
          </h3>

          <div style={statusBox}>
            <Row label="Estado" value={getStatus(form.last_test_success)} />
            <Row label="Fecha" value={form.last_test_at ? new Date(form.last_test_at).toLocaleString() : "—"} />
            <Row label="Mensaje" value={form.last_test_message || "—"} />
          </div>

          <div style={divider} />

          <h3 style={compactTitle}>
            <span style={smallIconCircle}>
              {domainCheck.ok ? <ShieldCheck size={15} /> : <ShieldAlert size={15} />}
            </span>
            Entregabilidad y Anti-Spam
          </h3>

          <div style={deliverabilityBox}>
            <div style={deliverabilityItem}>
              <strong>Estado SMTP</strong>
              <span>{form.is_active ? "✓ Activo" : "⚠ Inactivo"}</span>
            </div>

            <div style={deliverabilityItem}>
              <strong>Correo remitente</strong>
              <span>{form.from_email || "—"}</span>
            </div>

            <div style={domainCheck.ok ? domainOkBox : domainWarnBox}>
              {domainCheck.message}
            </div>

            <div style={deliverabilityTips}>
              <div>✓ Utilizar un correo del mismo dominio del SMTP.</div>
              <div>⚠ Configurar SPF en el DNS del dominio.</div>
              <div>⚠ Configurar DKIM en el DNS del dominio.</div>
              <div>⚠ Configurar DMARC en el DNS del dominio.</div>
              <div>⚠ Evitar asuntos con palabras típicas de spam.</div>
            </div>
          </div>
        </section>
      </div>

      <div style={hintBox}>
        <Info size={15} />
        <span>
          Para desarrollo con MailHog usa: Host <b>mailhog</b>, Puerto <b>1025</b>, TLS <b>No</b>, SSL <b>No</b>.
        </span>
      </div>
    </>
  );
}

function Field({ label, children, required = false }: any) {
  return (
    <label style={field}>
      <span>
        {label}
        {required && <span style={requiredMark}> *</span>}
      </span>
      {children}
    </label>
  );
}

function Check({ label, checked, onChange }: any) {
  return (
    <label style={check}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function CardTitle({ icon, children }: any) {
  return (
    <div style={cardTitle}>
      <span style={iconCircle}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{children}</h2>
    </div>
  );
}

function Row({ label, value }: any) {
  return (
    <div style={row}>
      <strong>{label}:</strong>
      <span>{value}</span>
    </div>
  );
}

function getStatus(value: boolean | null) {
  if (value === true) return "Correcto";
  if (value === false) return "Error";
  return "Sin pruebas";
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

function getDomainCheck(fromEmail: string, smtpHost: string) {
  if (!fromEmail || !smtpHost || !fromEmail.includes("@")) {
    return {
      ok: false,
      message: "Completa el correo remitente y el host SMTP para validar el dominio.",
    };
  }

  const emailDomain = fromEmail.split("@")[1]?.toLowerCase().trim();
  const normalizedSmtp = smtpHost.toLowerCase().replace(/^smtp\./, "").replace(/^mail\./, "").trim();

  if (!emailDomain) {
    return { ok: false, message: "El correo remitente no tiene un dominio válido." };
  }

  const ok = normalizedSmtp === emailDomain || normalizedSmtp.endsWith(`.${emailDomain}`) || smtpHost.toLowerCase().includes(emailDomain);

  if (ok) {
    return { ok: true, message: "✓ El dominio del remitente parece coincidir con el servidor SMTP." };
  }

  return {
    ok: false,
    message: "⚠ El dominio del remitente no parece coincidir con el SMTP. Esto puede aumentar la probabilidad de spam.",
  };
}

const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1.2fr .8fr", gap: 14 };
const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.08)", border: "1px solid #e5e7eb" };
const cardTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 9, paddingBottom: 8, borderBottom: "1px solid #e5e7eb", marginBottom: 10 };
const iconCircle: React.CSSProperties = { width: 30, height: 30, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" };
const smallIconCircle: React.CSSProperties = { width: 28, height: 28, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" };
const compactTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 9, fontSize: 15, margin: "0 0 10px", fontWeight: 800 };
const sectionTitle: React.CSSProperties = { fontSize: 13, margin: "10px 0 6px", fontWeight: 800 };
const twoCols: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 };
const serverGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "2fr 1fr", gap: 10, marginBottom: 8 };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 500, color: "#475467" };
const requiredMark: React.CSSProperties = { color: "#dc2626" };
const input: React.CSSProperties = { width: "100%", height: 34, padding: "6px 10px", border: "1px solid #d0d5dd", borderRadius: 9, fontSize: 14, fontWeight: 400 };
const checks: React.CSSProperties = { display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" };
const check: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 };
const primaryButton: React.CSSProperties = { marginTop: 10, padding: "9px 14px", borderRadius: 10, border: "none", background: "#2db84b", color: "#fff", fontWeight: 800, cursor: "pointer" };
const darkButton: React.CSSProperties = { marginTop: 10, padding: "9px 14px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 800 };
const divider: React.CSSProperties = { height: 1, background: "#e5e7eb", margin: "12px 0 10px" };
const statusBox: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, display: "grid", gap: 6, fontSize: 13 };
const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "82px 1fr", gap: 8 };
const successBox: React.CSSProperties = { marginBottom: 10, padding: 10, borderRadius: 10, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: 13 };
const errorBox: React.CSSProperties = { marginBottom: 10, padding: 10, borderRadius: 10, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontSize: 13 };
const hintBox: React.CSSProperties = { marginTop: 10, padding: 10, borderRadius: 12, background: "#fff", border: "1px solid #e5e7eb", display: "flex", gap: 8, alignItems: "center", fontSize: 12 };
const deliverabilityBox: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, background: "#fafafa", display: "flex", flexDirection: "column", gap: 10 };
const deliverabilityItem: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, fontSize: 13 };
const deliverabilityTips: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#475467" };
const domainOkBox: React.CSSProperties = { padding: 8, borderRadius: 9, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: 12 };
const domainWarnBox: React.CSSProperties = { padding: 8, borderRadius: 9, background: "#fffbeb", color: "#92400e", border: "1px solid #fde68a", fontSize: 12 };
