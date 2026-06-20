import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Mail,
  Send,
  Clock,
  Info,
  History,
  FileText,
  Plus,
  Save,
  Trash2,
  Eye,
  Wand2,
  Heading,
  List,
  Link,
  MousePointerClick,
} from "lucide-react";

type Tab = "smtp" | "templates" | "history";

type EmailTemplate = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  subject: string;
  html_body: string;
  text_body: string | null;
  variables: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type EmailDeliveryLog = {
  id: number;
  company_id: number;
  template_id: number | null;
  recipient_email: string;
  subject: string;
  status: string;
  provider: string;
  error_message: string | null;
  html_body?: string | null;
  text_body?: string | null;
  variables_json?: Record<string, any> | null;
  sent_at: string | null;
  created_at: string;
};

type EmailDeliveryLogResponse = {
  items: EmailDeliveryLog[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

const emptyTemplate: EmailTemplate = {
  id: 0,
  company_id: 0,
  code: "",
  name: "",
  subject: "",
  html_body: "",
  text_body: "",
  variables: [],
  is_active: true,
  created_at: "",
  updated_at: "",
};

const defaultVariables = [
  "employee_name",
  "event_name",
  "event_date",
  "company_name",
  "payment_amount",
  "password_reset_link",
];

export default function EmailSettingsPage() {
  const { user } = useAuth();
  const companyId = user?.company_id || 1;

  const [tab, setTab] = useState<Tab>("smtp");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  const [form, setForm] = useState({
    from_name: "",
    from_email: "",
    smtp_host: "",
    smtp_port: 587,
    smtp_username: "",
    smtp_password: "",
    use_tls: true,
    use_ssl: false,
    is_active: true,
    last_test_at: "",
    last_test_success: null as boolean | null,
    last_test_message: "",
  });

  const [testEmail, setTestEmail] = useState("");

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<EmailTemplate>(emptyTemplate);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateTestEmail, setTemplateTestEmail] = useState("");
  const textBodyRef = useRef<HTMLTextAreaElement | null>(null);
  const htmlBodyRef = useRef<HTMLTextAreaElement | null>(null);
  const [activeEditor, setActiveEditor] = useState<"text" | "html">("text");

  const [logs, setLogs] = useState<EmailDeliveryLog[]>([]);
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState("");
  const [historyTemplateId, setHistoryTemplateId] = useState("");
  const [historyDateFrom, setHistoryDateFrom] = useState("");
  const [historyDateTo, setHistoryDateTo] = useState("");
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize, setHistoryPageSize] = useState(25);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPages, setHistoryPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<EmailDeliveryLog | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    loadEmailSettings();
  }, [companyId]);

  useEffect(() => {
    if (tab === "templates") loadTemplates();
    if (tab === "history") {
      loadTemplates();
      loadHistory();
    }
  }, [tab, companyId, historyPage, historyPageSize]);

  const loadEmailSettings = async () => {
    try {
      const res = await api.get(`/companies/${companyId}/email-settings`);

      if (res.data) {
        setForm((prev) => ({
          ...prev,
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
        }));
      }
    } catch (error) {
      showError(getApiError(error, "Error al cargar la configuración."));
    }
  };

  const loadTemplates = async () => {
	  try {
		const res = await api.get(`/companies/${companyId}/email-templates`);

		const list = Array.isArray(res.data)
		  ? res.data
		  : Array.isArray(res.data?.items)
			? res.data.items
			: [];

		setTemplates(list);

		if (!selectedTemplate && list.length > 0) {
		  setSelectedTemplate(list[0]);
		  setTemplateForm(normalizeTemplate(list[0]));
		}
	  } catch (error) {
		console.error("Error cargando plantillas:", error);
		showError(getApiError(error, "Error al cargar plantillas."));
	  }
	};

  const loadHistory = async () => {
	  try {
		const params = new URLSearchParams();

		params.append("page", String(historyPage));
		params.append("page_size", String(historyPageSize));

		if (historySearch.trim()) params.append("search", historySearch.trim());
		if (historyStatus) params.append("status", historyStatus);
		if (historyTemplateId) params.append("template_id", historyTemplateId);
		if (historyDateFrom) params.append("date_from", `${historyDateFrom}T00:00:00`);
		if (historyDateTo) params.append("date_to", `${historyDateTo}T23:59:59`);

		const res = await api.get(
		  `/companies/${companyId}/email-delivery-logs?${params.toString()}`
		);

		const data = res.data;

		if (Array.isArray(data)) {
		  setLogs(data);
		  setHistoryTotal(data.length);
		  setHistoryPages(1);
		  return;
		}

		setLogs(Array.isArray(data?.items) ? data.items : []);
		setHistoryTotal(data?.total || 0);
		setHistoryPages(data?.pages || 1);
		setHistoryPage(data?.page || 1);
	  } catch (error) {
		console.error("Error cargando historial:", error);
		showError(getApiError(error, "Error al cargar historial."));
	  }
	};

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateTemplate = (field: string, value: any) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const showSuccess = (text: string) => {
    setMessageType("success");
    setMessage(text);
  };

  const showError = (text: string) => {
    setMessageType("error");
    setMessage(text);
  };

  const clearMessage = () => setMessage("");

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const validateSave = () => {
    if (!form.from_name.trim()) return "El nombre remitente es obligatorio.";
    if (!form.from_email.trim()) return "El correo remitente es obligatorio.";
    if (!validateEmail(form.from_email)) return "El correo remitente no tiene un formato válido.";
    if (!form.smtp_host.trim()) return "El host SMTP es obligatorio.";
    if (!form.smtp_port || Number(form.smtp_port) <= 0) return "El puerto SMTP debe ser mayor a 0.";
    return "";
  };

  const validateTemplate = () => {
    if (!templateForm.code.trim()) return "El código de la plantilla es obligatorio.";
    if (!templateForm.name.trim()) return "El nombre de la plantilla es obligatorio.";
    if (!templateForm.subject.trim()) return "El asunto de la plantilla es obligatorio.";
    if (!templateForm.html_body.trim()) return "El HTML de la plantilla es obligatorio.";
    return "";
  };

  const save = async () => {
    clearMessage();

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

      if (form.smtp_password.trim()) payload.smtp_password = form.smtp_password;

      await api.put(`/companies/${companyId}/email-settings`, payload);
      showSuccess("Configuración guardada correctamente.");
    } catch (error) {
      showError(getApiError(error, "Error al guardar la configuración."));
    } finally {
      setLoading(false);
    }
  };

  const sendTest = async () => {
    clearMessage();

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

      if (res.data?.success === false) showError(res.data.message || "No se pudo enviar el correo de prueba.");
      else showSuccess(res.data.message || "Correo de prueba enviado.");

      await loadEmailSettings();
      if (tab === "history") await loadHistory();
    } catch (error) {
      showError(getApiError(error, "Error al enviar correo de prueba."));
    } finally {
      setLoading(false);
    }
  };

  const newTemplate = () => {
    clearMessage();
    setSelectedTemplate(null);
    setTemplateForm({
      ...emptyTemplate,
      variables: [...defaultVariables],
      subject: "Hola {{employee_name}}",
      text_body:
        "Hola {{employee_name}}\n\nEste es un ejemplo de plantilla para {{company_name}}.\n\nGracias.",
      html_body: plainTextToHtml(
        "Hola {{employee_name}}\n\nEste es un ejemplo de plantilla para {{company_name}}.\n\nGracias."
      ),
    });
  };

  const selectTemplate = (template: EmailTemplate) => {
    clearMessage();
    setSelectedTemplate(template);
    setTemplateForm(normalizeTemplate(template));
  };

  const saveTemplate = async () => {
    clearMessage();

    const validationError = validateTemplate();
    if (validationError) {
      showError(validationError);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        code: templateForm.code.trim().toUpperCase(),
        name: templateForm.name.trim(),
        subject: templateForm.subject.trim(),
        html_body: templateForm.html_body,
        text_body: templateForm.text_body?.trim() || null,
        variables: normalizeVariables(templateForm.variables),
        is_active: templateForm.is_active,
      };

      if (selectedTemplate?.id) {
        const res = await api.put(
          `/companies/${companyId}/email-templates/${selectedTemplate.id}`,
          payload
        );

        setSelectedTemplate(res.data);
        setTemplateForm(normalizeTemplate(res.data));
        showSuccess("Plantilla actualizada correctamente.");
      } else {
        const res = await api.post(`/companies/${companyId}/email-templates`, payload);

        setSelectedTemplate(res.data);
        setTemplateForm(normalizeTemplate(res.data));
        showSuccess("Plantilla creada correctamente.");
      }

      await loadTemplates();
    } catch (error) {
      showError(getApiError(error, "Error al guardar plantilla."));
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async () => {
    clearMessage();

    if (!selectedTemplate?.id) {
      showError("Selecciona una plantilla para eliminar.");
      return;
    }

    if (!window.confirm("¿Seguro que deseas eliminar esta plantilla?")) return;

    setLoading(true);

    try {
      await api.delete(`/companies/${companyId}/email-templates/${selectedTemplate.id}`);
      setSelectedTemplate(null);
      setTemplateForm(emptyTemplate);
      showSuccess("Plantilla eliminada correctamente.");
      await loadTemplates();
    } catch (error) {
      showError(getApiError(error, "Error al eliminar plantilla."));
    } finally {
      setLoading(false);
    }
  };

  const sendTemplateTest = async () => {
    clearMessage();

    if (!selectedTemplate?.id) {
      showError("Primero guarda la plantilla antes de enviar una prueba.");
      return;
    }

    if (!templateTestEmail.trim()) {
      showError("El correo destino de prueba es obligatorio.");
      return;
    }

    if (!validateEmail(templateTestEmail)) {
      showError("El correo destino de prueba no tiene un formato válido.");
      return;
    }

    setLoading(true);

    try {
      const variablesPayload = Object.fromEntries(
        normalizeVariables(templateForm.variables).map((variable) => [
          variable,
          getVariableExample(variable),
        ])
      );

      const res = await api.post(
        `/companies/${companyId}/email-templates/${selectedTemplate.id}/test`,
        {
          to_email: templateTestEmail.trim(),
          variables: variablesPayload,
        }
      );

      if (res.data?.success) showSuccess(res.data.message || "Correo de prueba enviado correctamente.");
      else showError(res.data?.message || "No se pudo enviar el correo de prueba.");

      await loadHistory();
    } catch (error) {
      showError(getApiError(error, "Error al enviar prueba de plantilla."));
    } finally {
      setLoading(false);
    }
  };

  const generateHtmlFromText = () => {
    clearMessage();

    if (!templateForm.text_body?.trim()) {
      showError("Primero escribe contenido en Texto plano.");
      return;
    }

    updateTemplate("html_body", plainTextToHtml(templateForm.text_body));
    showSuccess("HTML generado desde texto plano.");
  };

  const insertAtCursor = (
    field: "text_body" | "html_body",
    value: string,
    ref: React.RefObject<HTMLTextAreaElement | null>
  ) => {
    const current = (templateForm[field] || "") as string;
    const element = ref.current;
    const start = element?.selectionStart ?? current.length;
    const end = element?.selectionEnd ?? current.length;
    const nextValue = `${current.slice(0, start)}${value}${current.slice(end)}`;

    setTemplateForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    window.setTimeout(() => {
      element?.focus();
      const position = start + value.length;
      element?.setSelectionRange(position, position);
    }, 0);
  };

  const appendVisualBlock = (type: "title" | "paragraph" | "list" | "link" | "button") => {
    let textBlock = "";
    let htmlBlock = "";

    if (type === "title") {
      textBlock = "\n\nTítulo de la sección";
      htmlBlock = "\n<h2>Título de la sección</h2>";
    }

    if (type === "paragraph") {
      textBlock = "\n\nEscribe aquí un nuevo párrafo.";
      htmlBlock = "\n<p>Escribe aquí un nuevo párrafo.</p>";
    }

    if (type === "list") {
      textBlock = "\n\n- Primer punto\n- Segundo punto\n- Tercer punto";
      htmlBlock = `\n<ul>
  <li>Primer punto</li>
  <li>Segundo punto</li>
  <li>Tercer punto</li>
</ul>`;
    }

    if (type === "link") {
      textBlock = "\n\nVer más: {{link}}";
      htmlBlock = `\n<p>
  <a href="{{link}}" style="color:#2563eb;text-decoration:underline;">
    Ver más
  </a>
</p>`;
    }

    if (type === "button") {
      textBlock = "\n\nAcción: {{link}}";
      htmlBlock = `\n<p>
  <a href="{{link}}" style="display:inline-block;background:#2db84b;color:#ffffff;padding:10px 18px;text-decoration:none;border-radius:8px;font-weight:bold;">
    Ver detalles
  </a>
</p>`;
    }

    if (activeEditor === "html") {
      insertAtCursor("html_body", htmlBlock, htmlBodyRef);
      return;
    }

    insertAtCursor("text_body", textBlock, textBodyRef);
  };

  const insertVariableIntoTemplate = (variable: string) => {
    const token = `{{${variable}}}`;

    if (activeEditor === "html") {
      insertAtCursor("html_body", token, htmlBodyRef);
    } else {
      insertAtCursor("text_body", token, textBodyRef);
    }

    navigator.clipboard?.writeText(token);
  };

  const openLogDetail = async (log: EmailDeliveryLog) => {
    clearMessage();
    setDetailLoading(true);

    try {
      const res = await api.get(`/companies/${companyId}/email-delivery-logs/${log.id}`);
      setSelectedLog(res.data || log);
    } catch (error) {
      console.error("Error cargando detalle del envío:", error);
      showError(getApiError(error, "Error al cargar detalle del correo."));
    } finally {
      setDetailLoading(false);
    }
  };

  const resendSelectedLog = async () => {
    if (!selectedLog?.id) return;

    clearMessage();
    setResending(true);

    try {
      const res = await api.post(
        `/companies/${companyId}/email-delivery-logs/${selectedLog.id}/resend`
      );

      showSuccess("Correo reenviado. Se creó un nuevo registro en Enviados.");
      setSelectedLog(res.data || selectedLog);
      await loadHistory();
    } catch (error) {
      console.error("Error reenviando correo:", error);
      showError(getApiError(error, "Error al reenviar correo."));
    } finally {
      setResending(false);
    }
  };

  const applyHistoryFilters = () => {
    setHistoryPage(1);
    setTimeout(() => loadHistory(), 0);
  };

  const clearHistoryFilters = () => {
    setHistorySearch("");
    setHistoryStatus("");
    setHistoryTemplateId("");
    setHistoryDateFrom("");
    setHistoryDateTo("");
    setHistoryPage(1);
    setTimeout(() => loadHistory(), 0);
  };

  const filteredTemplates = useMemo(() => {
    const search = templateSearch.trim().toLowerCase();

    return templates.filter((template) => {
      if (!search) return true;

      return (
        template.name.toLowerCase().includes(search) ||
        template.code.toLowerCase().includes(search) ||
        template.subject.toLowerCase().includes(search)
      );
    });
  }, [templates, templateSearch]);

  const goToPage = (nextPage: number) => {
    setHistoryPage(Math.min(Math.max(nextPage, 1), historyPages));
  };

  const previewHtml = renderWithExamples(templateForm.html_body, templateForm.variables);

  return (
    <div style={page}>
      <div style={headerRow}>
        <div>
          <h1 style={title}>Configuración de correo</h1>
          <p style={subtitle}>
            Administra el SMTP de la empresa, plantillas e historial de envíos.
          </p>
        </div>
      </div>

      <div style={tabs}>
        <button onClick={() => setTab("smtp")} style={tab === "smtp" ? activeTab : inactiveTab}>
          SMTP
        </button>
        <button
          onClick={() => setTab("templates")}
          style={tab === "templates" ? activeTab : inactiveTab}
        >
          Plantillas
        </button>
        <button onClick={() => setTab("history")} style={tab === "history" ? activeTab : inactiveTab}>
          Enviados
        </button>
      </div>

      {message && <div style={messageType === "success" ? successBox : errorBox}>{message}</div>}

      {tab === "smtp" && (
        <>
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
                <span style={smallIconCircle}>
                  <Clock size={15} />
                </span>
                Última prueba
              </h3>

              <div style={statusBox}>
                <Row label="Estado" value={getStatus(form.last_test_success)} />
                <Row label="Fecha" value={form.last_test_at ? new Date(form.last_test_at).toLocaleString() : "—"} />
                <Row label="Mensaje" value={form.last_test_message || "—"} />
              </div>

              <div style={divider} />

              <h3 style={sectionTitle}>Entregabilidad y Anti-Spam</h3>

              <div style={deliverabilityBox}>
                <div style={deliverabilityItem}>
                  <strong>Estado SMTP</strong>
                  <span>{form.is_active ? "✓ Activo" : "⚠ Inactivo"}</span>
                </div>

                <div style={deliverabilityItem}>
                  <strong>Correo remitente</strong>
                  <span>{form.from_email || "—"}</span>
                </div>

                <div style={domainCheckBox}>
                  {getDomainCheckMessage(form.smtp_host, form.from_email)}
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
      )}

      {tab === "templates" && (
        <div style={templateLayout}>
          <aside style={stickyCard}>
            <div style={listHeader}>
              <CardTitleInline icon={<FileText size={17} />}>Plantillas</CardTitleInline>
              <button onClick={newTemplate} style={smallButton}>
                <Plus size={15} />
                Nueva
              </button>
            </div>

            <Field label="Buscar plantilla">
              <input
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                style={input}
                placeholder="Buscar..."
              />
            </Field>

            <div style={templateList}>
              {filteredTemplates.length === 0 && (
                <div style={emptyState}>No hay plantillas para mostrar.</div>
              )}

              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => selectTemplate(template)}
                  style={
                    selectedTemplate?.id === template.id
                      ? selectedTemplateButton
                      : templateButton
                  }
                >
                  <strong>{template.name}</strong>
                  <span>{template.code}</span>
                  <small>{template.is_active ? "Activa" : "Inactiva"}</small>
                </button>
              ))}
            </div>
          </aside>

          <main style={card}>
            <div style={stickyEditorHeader}>
              <CardTitleInline icon={<FileText size={17} />}>
                {selectedTemplate?.id ? "Editar plantilla" : "Nueva plantilla"}
              </CardTitleInline>

              <div style={actionsRow}>
                <button onClick={saveTemplate} disabled={loading} style={primaryButtonSmall}>
                  <Save size={15} />
                  Guardar
                </button>

                {selectedTemplate?.id ? (
                  <button onClick={deleteTemplate} disabled={loading} style={dangerButtonSmall}>
                    <Trash2 size={15} />
                    Eliminar
                  </button>
                ) : null}
              </div>
            </div>

            <div style={templateEditorGrid}>
              <Field label="Código" required>
                <input
                  value={templateForm.code}
                  onChange={(e) => updateTemplate("code", e.target.value.toUpperCase())}
                  style={input}
                  placeholder="WELCOME_USER"
                />
              </Field>

              <Field label="Nombre" required>
                <input
                  value={templateForm.name}
                  onChange={(e) => updateTemplate("name", e.target.value)}
                  style={input}
                  placeholder="Bienvenida de usuario"
                />
              </Field>
            </div>

            <Field label="Asunto" required>
              <input
                value={templateForm.subject}
                onChange={(e) => updateTemplate("subject", e.target.value)}
                style={input}
                placeholder="Bienvenido {{employee_name}}"
              />
            </Field>

            <div style={visualEditorBox}>
              <div>
                <h3 style={sectionTitle}>Editor visual rápido</h3>
                <p style={visualHelp}>
                  Usa estos botones para agregar bloques comunes sin escribir HTML manualmente.
                </p>
              </div>

              <div style={visualToolbar}>
                <button type="button" style={toolButton} onClick={() => appendVisualBlock("title")}>
                  <Heading size={15} />
                  Título
                </button>

                <button type="button" style={toolButton} onClick={() => appendVisualBlock("paragraph")}>
                  <FileText size={15} />
                  Párrafo
                </button>

                <button type="button" style={toolButton} onClick={() => appendVisualBlock("list")}>
                  <List size={15} />
                  Lista
                </button>

                <button type="button" style={toolButton} onClick={() => appendVisualBlock("link")}>
                  <Link size={15} />
                  Enlace
                </button>

                <button type="button" style={toolButton} onClick={() => appendVisualBlock("button")}>
                  <MousePointerClick size={15} />
                  Botón
                </button>
              </div>
            </div>

            <div style={editorSpacing}>
              <Field label="Texto plano / contenido editable">
                <textarea
                  ref={textBodyRef}
                  value={templateForm.text_body || ""}
                  onFocus={() => setActiveEditor("text")}
                  onClick={() => setActiveEditor("text")}
                  onKeyUp={() => setActiveEditor("text")}
                  onChange={(e) => updateTemplate("text_body", e.target.value)}
                  style={plainTextArea}
                  placeholder="Escribe el contenido normal y luego genera HTML."
                />
              </Field>

              <button onClick={generateHtmlFromText} type="button" style={secondaryButton}>
                <Wand2 size={15} />
                Generar HTML desde texto
              </button>
            </div>

            <div style={editorPreviewGrid}>
              <div>
                <Field label="HTML generado / editable" required>
                  <textarea
                    ref={htmlBodyRef}
                    value={templateForm.html_body}
                    onFocus={() => setActiveEditor("html")}
                    onClick={() => setActiveEditor("html")}
                    onKeyUp={() => setActiveEditor("html")}
                    onChange={(e) => updateTemplate("html_body", e.target.value)}
                    style={htmlArea}
                  />
                </Field>
              </div>

              <div>
                <div style={previewTitle}>
                  <Eye size={15} />
                  Vista previa
                </div>

                <div
                  style={previewBox}
                  dangerouslySetInnerHTML={{
                    __html: previewHtml || "<p>Sin contenido.</p>",
                  }}
                />
              </div>
            </div>

            <div style={templateEditorGrid}>
              <Field label="Variables">
                <input
                  value={normalizeVariables(templateForm.variables).join(", ")}
                  onChange={(e) => updateTemplate("variables", parseVariables(e.target.value))}
                  style={input}
                  placeholder="employee_name, company_name"
                />
              </Field>

              <div style={activeRow}>
                <Check
                  label="Plantilla activa"
                  checked={templateForm.is_active}
                  onChange={(v: boolean) => updateTemplate("is_active", v)}
                />
              </div>
            </div>

            <div style={divider} />

            <h3 style={sectionTitle}>Enviar prueba de plantilla</h3>

            <div style={testTemplateRow}>
              <input
                value={templateTestEmail}
                onChange={(e) => setTemplateTestEmail(e.target.value)}
                style={input}
                placeholder="correo@ejemplo.com"
              />

              <button
                onClick={sendTemplateTest}
                disabled={loading || !selectedTemplate?.id}
                style={{
                  ...darkButtonNoMargin,
                  opacity: loading || !selectedTemplate?.id ? 0.55 : 1,
                  cursor: loading || !selectedTemplate?.id ? "not-allowed" : "pointer",
                }}
              >
                Enviar prueba
              </button>
            </div>
          </main>

          <aside style={stickyCard}>
            <CardTitleInline icon={<Info size={17} />}>Variables</CardTitleInline>

            <p style={sideHelp}>
              Haz clic sobre una variable para copiarla e insertarla donde tengas el cursor activo.
            </p>

            <div style={variablesBox}>
              {normalizeVariables(templateForm.variables).map((variable) => (
                <button
                  key={variable}
                  style={variableChip}
                  onClick={() => insertVariableIntoTemplate(variable)}
                  type="button"
                >
                  {"{{" + variable + "}}"}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      {tab === "history" && (
        <section style={card}>
          <CardTitle icon={<History size={17} />}>Enviados</CardTitle>

          <div style={historyFilters}>
            <Field label="Buscar">
              <input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                style={input}
                placeholder="Destinatario, asunto o error"
              />
            </Field>

            <Field label="Estado">
              <select value={historyStatus} onChange={(e) => setHistoryStatus(e.target.value)} style={input}>
                <option value="">Todos</option>
                <option value="success">Correcto</option>
                <option value="failed">Error</option>
                <option value="pending">Pendiente</option>
              </select>
            </Field>

            <Field label="Plantilla">
              <select value={historyTemplateId} onChange={(e) => setHistoryTemplateId(e.target.value)} style={input}>
                <option value="">Todas</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Desde">
              <input
                type="date"
                value={historyDateFrom}
                onChange={(e) => setHistoryDateFrom(e.target.value)}
                style={input}
              />
            </Field>

            <Field label="Hasta">
              <input
                type="date"
                value={historyDateTo}
                onChange={(e) => setHistoryDateTo(e.target.value)}
                style={input}
              />
            </Field>

            <Field label="Por página">
              <select
                value={historyPageSize}
                onChange={(e) => {
                  setHistoryPageSize(Number(e.target.value));
                  setHistoryPage(1);
                }}
                style={input}
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </Field>

            <div style={historyActions}>
              <button onClick={applyHistoryFilters} style={secondaryButton}>
                Buscar
              </button>

              <button onClick={clearHistoryFilters} style={secondaryButton}>
                Limpiar
              </button>

              <button onClick={loadHistory} style={secondaryButton}>
                Actualizar
              </button>
            </div>
          </div>

          {logs.length === 0 ? (
            <div style={emptyState}>No hay correos registrados para los filtros seleccionados.</div>
          ) : (
            <div style={logsTable}>
              <div style={logsHeader}>
                <span>Fecha</span>
                <span>Destinatario</span>
                <span>Plantilla</span>
                <span>Asunto</span>
                <span>Estado</span>
                <span>Error</span>
              </div>

              {logs.map((log) => (
                <div key={log.id} style={logsRow} onClick={() => openLogDetail(log)} title="Ver detalle del envío">
                  <span>{formatDate(log.created_at)}</span>
                  <span>{log.recipient_email}</span>
                  <span>{getTemplateName(templates, log.template_id)}</span>
                  <span>{log.subject}</span>
                  <span style={getLogStatusStyle(log.status)}>{translateStatus(log.status)}</span>
                  <span title={log.error_message || ""}>{log.error_message || "—"}</span>
                </div>
              ))}
            </div>
          )}

          <div style={pagination}>
            <button onClick={() => goToPage(historyPage - 1)} disabled={historyPage <= 1} style={pageButton}>
              Anterior
            </button>

            <span>
              Página <strong>{historyPage}</strong> de <strong>{historyPages}</strong> · {historyTotal} registros
            </span>

            <button
              onClick={() => goToPage(historyPage + 1)}
              disabled={historyPage >= historyPages}
              style={pageButton}
            >
              Siguiente
            </button>
          </div>
        </section>
      )}


      {selectedLog && (
        <div style={modalOverlay} onClick={() => setSelectedLog(null)}>
          <div style={modalCard} onClick={(event) => event.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h2 style={modalTitle}>Detalle del correo</h2>
                <p style={modalSubtitle}>{selectedLog.recipient_email}</p>
              </div>

              <div style={modalActions}>
                <button onClick={resendSelectedLog} disabled={resending} style={primaryButtonSmall}>
                  <Send size={15} />
                  {resending ? "Reenviando..." : "Reenviar"}
                </button>

                <button onClick={() => setSelectedLog(null)} style={secondaryButton}>
                  Cerrar
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={emptyState}>Cargando detalle...</div>
            ) : (
              <div style={detailGrid}>
                <div style={detailSection}>
                  <h3 style={sectionTitle}>Información</h3>
                  <Row label="Estado" value={translateStatus(selectedLog.status)} />
                  <Row label="Fecha" value={formatDate(selectedLog.created_at)} />
                  <Row label="Proveedor" value={selectedLog.provider || "—"} />
                  <Row label="Plantilla" value={getTemplateName(templates, selectedLog.template_id)} />
                  <Row label="Asunto" value={selectedLog.subject} />
                </div>

                <div style={detailSection}>
                  <h3 style={sectionTitle}>Error</h3>
                  <pre style={codeBlock}>{selectedLog.error_message || "Sin error registrado."}</pre>
                </div>

                <div style={detailSection}>
                  <h3 style={sectionTitle}>Variables utilizadas</h3>
                  <pre style={codeBlock}>{formatJson(selectedLog.variables_json)}</pre>
                </div>

                <div style={detailSection}>
                  <h3 style={sectionTitle}>Texto enviado</h3>
                  <pre style={codeBlock}>{selectedLog.text_body || "Sin texto plano registrado."}</pre>
                </div>

                <div style={detailSectionWide}>
                  <h3 style={sectionTitle}>Vista HTML enviada</h3>
                  <div
                    style={sentHtmlPreview}
                    dangerouslySetInnerHTML={{ __html: selectedLog.html_body || "<p>Sin HTML registrado.</p>" }}
                  />
                </div>

                <div style={detailSectionWide}>
                  <h3 style={sectionTitle}>Código HTML enviado</h3>
                  <pre style={codeBlockLarge}>{selectedLog.html_body || "Sin HTML registrado."}</pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
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

function CardTitleInline({ icon, children }: any) {
  return (
    <div style={inlineTitle}>
      <span style={iconCircleSmall}>{icon}</span>
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

function normalizeTemplate(template: EmailTemplate): EmailTemplate {
  return {
    ...template,
    text_body: template.text_body || "",
    variables: template.variables || [],
  };
}

function parseVariables(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeVariables(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function getVariableExample(variable: string) {
  const examples: Record<string, string> = {
    employee_name: "Juan Pérez",
    event_name: "Evento de prueba",
    event_date: "2026-01-15",
    company_name: "Event Staffing Platform",
    payment_amount: "$150.00",
    password_reset_link: "http://localhost:5173/reset-password/demo",
    user_name: "Juan Pérez",
    username: "juan@email.com",
    password: "Temporal123!",
    login_url: "http://localhost:5173/login",
    start_time: "08:00 AM",
    address: "123 Main St",
    city: "Miami",
    state: "FL",
    zip_code: "33101",
    role_name: "Server",
    hourly_rate: "20.00",
    dress_code: "Camisa negra y pantalón negro",
    roles: "• Server: 2 cupos — $20/hora\n• Bartender: 1 cupo — $25/hora",
    response: "Aceptada",
    reason: "Cambio operativo",
    location: "Miami Convention Center",
    shift_start: "08:00 AM",
    shift_end: "04:00 PM",
    title: "Nueva noticia",
    summary: "Resumen de la noticia",
    link: "http://localhost:5173/news",
    period: "Enero 2026",
    amount: "$350.00",
    payment_date: "2026-01-20",
  };

  return examples[variable] || `Ejemplo ${variable}`;
}

function renderWithExamples(html: string, variables: string[] | null | undefined) {
  let rendered = html || "";

  normalizeVariables(variables).forEach((variable) => {
    rendered = rendered.replaceAll(`{{${variable}}}`, getVariableExample(variable));
  });

  return rendered;
}

function plainTextToHtml(text: string) {
  const escaped = escapeHtml(text.trim());
  const blocks = escaped.split(/\n\s*\n/g);

  const body = blocks
    .map((block, index) => {
      const withBreaks = block.replace(/\n/g, "<br />");

      if (index === 0 && block.length <= 90) {
        return `<h2>${withBreaks}</h2>`;
      }

      return `<p>${withBreaks}</p>`;
    })
    .join("\n");

  return `
<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;">
  ${body}
</div>
`.trim();
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
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

function getTemplateName(templates: EmailTemplate[], templateId: number | null) {
  if (!templateId) return "—";
  const template = templates.find((item) => item.id === templateId);
  return template ? template.name : `ID ${templateId}`;
}

function formatJson(value: any) {
  if (!value) return "Sin variables registradas.";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function getDomainFromEmail(email: string) {
  const parts = email.trim().split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : "";
}

function getDomainFromHost(host: string) {
  return host.trim().toLowerCase().replace(/^smtp\./, "").replace(/^mail\./, "");
}

function getDomainCheckMessage(smtpHost: string, fromEmail: string) {
  const smtpDomain = getDomainFromHost(smtpHost);
  const emailDomain = getDomainFromEmail(fromEmail);

  if (!smtpDomain || !emailDomain) {
    return "⚠ Completa SMTP Host y Correo remitente para validar el dominio.";
  }

  if (
    smtpDomain === emailDomain ||
    smtpDomain.endsWith(`.${emailDomain}`) ||
    emailDomain.endsWith(`.${smtpDomain}`)
  ) {
    return "✓ El dominio del remitente coincide con el servidor SMTP.";
  }

  return "⚠ El dominio del remitente no parece coincidir con el SMTP. Esto puede aumentar la probabilidad de spam.";
}

const page: React.CSSProperties = {
  padding: "12px 24px",
  maxWidth: 1500,
};

const headerRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
};

const title: React.CSSProperties = {
  fontSize: 23,
  fontWeight: 800,
  margin: 0,
};

const subtitle: React.CSSProperties = {
  color: "#667085",
  margin: "4px 0 0",
  fontSize: 14,
};

const tabs: React.CSSProperties = {
  display: "flex",
  gap: 8,
  marginBottom: 12,
};

const activeTab: React.CSSProperties = {
  padding: "7px 15px",
  borderRadius: 10,
  border: "1px solid #2db84b",
  background: "#2db84b",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const inactiveTab: React.CSSProperties = {
  padding: "7px 15px",
  borderRadius: 10,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#344054",
  fontWeight: 800,
  cursor: "pointer",
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr .8fr",
  gap: 16,
};

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 14,
  padding: 14,
  boxShadow: "0 1px 4px rgba(0,0,0,.08)",
  border: "1px solid #e5e7eb",
};

const stickyCard: React.CSSProperties = {
  ...card,
  position: "sticky",
  top: 12,
  maxHeight: "calc(100vh - 24px)",
  overflowY: "auto",
};

const cardTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  paddingBottom: 8,
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 10,
};

const inlineTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const iconCircle: React.CSSProperties = {
  width: 31,
  height: 31,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#16a34a",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
};

const iconCircleSmall: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#16a34a",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
};

const smallIconCircle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#16a34a",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
};

const compactTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  fontSize: 15,
  margin: "0 0 10px",
  fontWeight: 800,
};

const sectionTitle: React.CSSProperties = {
  fontSize: 14,
  margin: "10px 0 6px",
  fontWeight: 800,
};

const twoCols: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 8,
};

const serverGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: 10,
  marginBottom: 8,
};

const field: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 4,
  fontSize: 12,
  fontWeight: 500,
  color: "#475467",
};

const requiredMark: React.CSSProperties = {
  color: "#dc2626",
};

const input: React.CSSProperties = {
  width: "100%",
  height: 34,
  padding: "6px 10px",
  border: "1px solid #d0d5dd",
  borderRadius: 9,
  fontSize: 14,
  fontWeight: 400,
};

const plainTextArea: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  padding: "8px 10px",
  border: "1px solid #d0d5dd",
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 400,
  resize: "vertical",
};

const htmlArea: React.CSSProperties = {
  width: "100%",
  minHeight: 340,
  padding: "8px 10px",
  border: "1px solid #d0d5dd",
  borderRadius: 9,
  fontSize: 13,
  fontWeight: 400,
  fontFamily: "monospace",
  resize: "vertical",
};

const checks: React.CSSProperties = {
  display: "flex",
  gap: 14,
  marginTop: 8,
  flexWrap: "wrap",
};

const check: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 13,
  fontWeight: 600,
};

const primaryButton: React.CSSProperties = {
  marginTop: 10,
  padding: "9px 15px",
  borderRadius: 10,
  border: "none",
  background: "#2db84b",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const primaryButtonSmall: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 9,
  border: "none",
  background: "#2db84b",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const secondaryButton: React.CSSProperties = {
  marginTop: 8,
  padding: "8px 12px",
  borderRadius: 9,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#344054",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const darkButton: React.CSSProperties = {
  marginTop: 10,
  padding: "9px 15px",
  borderRadius: 10,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 800,
};

const darkButtonNoMargin: React.CSSProperties = {
  ...darkButton,
  marginTop: 0,
};

const dangerButtonSmall: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 9,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
};

const smallButton: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 9,
  border: "none",
  background: "#2db84b",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
};

const divider: React.CSSProperties = {
  height: 1,
  background: "#e5e7eb",
  margin: "12px 0 10px",
};

const statusBox: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  display: "grid",
  gap: 6,
  fontSize: 13,
};

const row: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "82px 1fr",
  gap: 8,
};

const successBox: React.CSSProperties = {
  marginBottom: 10,
  padding: 9,
  borderRadius: 10,
  background: "#f0fdf4",
  color: "#166534",
  border: "1px solid #bbf7d0",
  fontSize: 13,
};

const errorBox: React.CSSProperties = {
  marginBottom: 10,
  padding: 9,
  borderRadius: 10,
  background: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  fontSize: 13,
};

const hintBox: React.CSSProperties = {
  marginTop: 10,
  padding: 10,
  borderRadius: 12,
  background: "#fff",
  border: "1px solid #e5e7eb",
  display: "flex",
  gap: 8,
  alignItems: "center",
  fontSize: 13,
};

const deliverabilityBox: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fafafa",
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const deliverabilityItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 13,
};

const domainCheckBox: React.CSSProperties = {
  padding: 9,
  borderRadius: 10,
  background: "#fff",
  border: "1px solid #e5e7eb",
  fontSize: 12,
  color: "#475467",
};

const deliverabilityTips: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 12,
  color: "#475467",
};

const templateLayout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "290px minmax(620px, 1fr) 250px",
  gap: 14,
  alignItems: "start",
};

const listHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: 10,
  borderBottom: "1px solid #e5e7eb",
  marginBottom: 10,
};

const templateList: React.CSSProperties = {
  display: "grid",
  gap: 8,
  marginTop: 10,
};

const templateButton: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  display: "grid",
  gap: 3,
};

const selectedTemplateButton: React.CSSProperties = {
  ...templateButton,
  border: "1px solid #2db84b",
  background: "#f0fdf4",
};

const stickyEditorHeader: React.CSSProperties = {
  position: "sticky",
  top: 12,
  zIndex: 20,
  background: "#fff",
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 10,
  marginBottom: 10,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const templateEditorGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginBottom: 8,
};

const editorSpacing: React.CSSProperties = {
  marginTop: 8,
};

const visualEditorBox: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 10,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fafafa",
};

const visualHelp: React.CSSProperties = {
  color: "#667085",
  fontSize: 12,
  margin: "0 0 10px",
};

const visualToolbar: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const toolButton: React.CSSProperties = {
  padding: "7px 10px",
  borderRadius: 9,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#344054",
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
};

const editorPreviewGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
  marginTop: 10,
};

const previewTitle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 12,
  fontWeight: 800,
  color: "#344054",
  marginBottom: 4,
};

const previewBox: React.CSSProperties = {
  minHeight: 340,
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 14,
  background: "#fff",
  overflow: "auto",
  fontSize: 14,
};

const activeRow: React.CSSProperties = {
  display: "flex",
  alignItems: "end",
  paddingBottom: 8,
};

const actionsRow: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const testTemplateRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
  alignItems: "center",
};

const sideHelp: React.CSSProperties = {
  color: "#667085",
  fontSize: 12,
  lineHeight: 1.4,
  margin: "10px 0 0",
};

const variablesBox: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 10,
};

const variableChip: React.CSSProperties = {
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#166534",
  borderRadius: 999,
  padding: "5px 9px",
  fontSize: 12,
  fontWeight: 800,
  cursor: "pointer",
};


const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  zIndex: 1000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
};

const modalCard: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  width: "min(1120px, 96vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  boxShadow: "0 20px 60px rgba(0,0,0,.25)",
  border: "1px solid #e5e7eb",
  padding: 16,
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  borderBottom: "1px solid #e5e7eb",
  paddingBottom: 12,
  marginBottom: 12,
};

const modalTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 800,
};

const modalSubtitle: React.CSSProperties = {
  margin: "4px 0 0",
  color: "#667085",
  fontSize: 13,
};

const modalActions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "center",
};

const detailGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 12,
};

const detailSection: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 12,
  background: "#fff",
};

const detailSectionWide: React.CSSProperties = {
  ...detailSection,
  gridColumn: "1 / -1",
};

const codeBlock: React.CSSProperties = {
  margin: 0,
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  background: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 10,
  fontSize: 12,
  maxHeight: 220,
  overflow: "auto",
};

const codeBlockLarge: React.CSSProperties = {
  ...codeBlock,
  maxHeight: 360,
};

const sentHtmlPreview: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 10,
  padding: 14,
  background: "#fff",
  maxHeight: 360,
  overflow: "auto",
};

const historyFilters: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.2fr 150px 190px 140px 140px 120px auto",
  gap: 10,
  alignItems: "end",
  marginBottom: 12,
};

const historyActions: React.CSSProperties = {
  display: "flex",
  gap: 8,
  alignItems: "end",
  flexWrap: "wrap",
};

const logsTable: React.CSSProperties = {
  display: "grid",
  gap: 0,
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  overflow: "hidden",
};

const logsHeader: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "165px 220px 180px 1fr 110px 1fr",
  gap: 10,
  background: "#f9fafb",
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 800,
  color: "#344054",
};

const logsRow: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "165px 220px 180px 1fr 110px 1fr",
  gap: 10,
  padding: "10px 12px",
  fontSize: 12,
  borderTop: "1px solid #e5e7eb",
  alignItems: "center",
  cursor: "pointer",
};

const statusPill: React.CSSProperties = {
  borderRadius: 999,
  padding: "4px 8px",
  fontWeight: 800,
  fontSize: 12,
  width: "fit-content",
};

const pagination: React.CSSProperties = {
  marginTop: 12,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: 13,
  color: "#475467",
};

const pageButton: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 9,
  border: "1px solid #d0d5dd",
  background: "#fff",
  color: "#344054",
  fontWeight: 800,
  cursor: "pointer",
};

const emptyState: React.CSSProperties = {
  border: "1px dashed #d0d5dd",
  borderRadius: 12,
  padding: 14,
  color: "#667085",
  fontSize: 13,
};