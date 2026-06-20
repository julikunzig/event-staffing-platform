import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { FileText, Info, Plus, Save, Send, Trash2, Wand2, Eye } from "lucide-react";
import { DEFAULT_VARIABLES, EMPTY_TEMPLATE, EmailTemplate } from "@/types/email";

interface Props {
  companyId: number;
}

export default function EmailTemplatesTab({ companyId }: Props) {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState<EmailTemplate>(EMPTY_TEMPLATE);
  const [templateTestEmail, setTemplateTestEmail] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    loadTemplates();
  }, [companyId]);

  const filteredTemplates = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return templates;

    return templates.filter((template) => {
      return (
        template.name.toLowerCase().includes(term) ||
        template.code.toLowerCase().includes(term) ||
        template.subject.toLowerCase().includes(term)
      );
    });
  }, [templates, search]);

  const loadTemplates = async () => {
    try {
      const res = await api.get(`/companies/${companyId}/email-templates`);
      const list = res.data || [];
      setTemplates(list);

      if (!selectedTemplate && list.length) {
        setSelectedTemplate(list[0]);
        setTemplateForm(normalizeTemplate(list[0]));
      }
    } catch (error) {
      showError(getApiError(error, "Error al cargar plantillas."));
    }
  };

  const updateTemplate = (field: keyof EmailTemplate, value: any) => {
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

  const validateTemplate = () => {
    if (!templateForm.code.trim()) return "El código de la plantilla es obligatorio.";
    if (!templateForm.name.trim()) return "El nombre de la plantilla es obligatorio.";
    if (!templateForm.subject.trim()) return "El asunto de la plantilla es obligatorio.";
    if (!templateForm.html_body.trim()) return "El contenido HTML es obligatorio.";
    return "";
  };

  const newTemplate = () => {
    clearMessage();
    setSelectedTemplate(null);
    const text = "Hola {{employee_name}}\n\nEste es un ejemplo de plantilla para {{company_name}}.\n\nGracias.";
    setTemplateForm({
      ...EMPTY_TEMPLATE,
      variables: [...DEFAULT_VARIABLES],
      subject: "Hola {{employee_name}}",
      text_body: text,
      html_body: plainTextToHtml(text),
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
        const res = await api.put(`/companies/${companyId}/email-templates/${selectedTemplate.id}`, payload);
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
      setTemplateForm(EMPTY_TEMPLATE);
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
        normalizeVariables(templateForm.variables).map((variable) => [variable, getVariableExample(variable)])
      );

      const res = await api.post(`/companies/${companyId}/email-templates/${selectedTemplate.id}/test`, {
        to_email: templateTestEmail.trim(),
        variables: variablesPayload,
      });

      if (res.data?.success) {
        showSuccess(res.data.message || "Correo de prueba enviado correctamente.");
      } else {
        showError(res.data?.message || "No se pudo enviar el correo de prueba.");
      }
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
    showSuccess("HTML generado desde el texto plano.");
  };

  const previewHtml = renderWithExamples(templateForm.html_body, templateForm.variables);

  return (
    <>
      {message && <div style={messageType === "success" ? successBox : errorBox}>{message}</div>}

      <div style={templateLayout}>
        <aside style={stickyCard}>
          <div style={listHeader}>
            <CardTitleInline icon={<FileText size={17} />}>Plantillas</CardTitleInline>
            <button onClick={newTemplate} style={smallButton}>
              <Plus size={15} />
              Nueva
            </button>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchInput}
            placeholder="Buscar plantilla..."
          />

          <div style={templateList}>
            {filteredTemplates.length === 0 && <div style={emptyState}>No hay plantillas para mostrar.</div>}

            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => selectTemplate(template)}
                style={selectedTemplate?.id === template.id ? selectedTemplateButton : templateButton}
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

            <div style={actionsRowNoMargin}>
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

          <div style={editorSpacing}>
            <Field label="Texto plano / contenido editable">
              <textarea
                value={templateForm.text_body || ""}
                onChange={(e) => updateTemplate("text_body", e.target.value)}
                style={plainTextArea}
                placeholder="Escribe aquí el contenido normal. Luego presiona Generar HTML."
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
                  value={templateForm.html_body}
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

              <div style={previewBox} dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Sin contenido.</p>" }} />
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
              <Send size={15} />
              Enviar prueba
            </button>
          </div>
        </main>

        <aside style={stickyCard}>
          <CardTitleInline icon={<Info size={17} />}>Variables</CardTitleInline>

          <p style={sideHelp}>Haz clic sobre una variable para copiarla y pegarla en el texto, asunto o HTML.</p>

          <div style={variablesBox}>
            {normalizeVariables(templateForm.variables).map((variable) => (
              <button key={variable} style={variableChip} onClick={() => copyVariable(variable)} type="button">
                {"{{" + variable + "}}"}
              </button>
            ))}
          </div>
        </aside>
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

function normalizeTemplate(template: EmailTemplate): EmailTemplate {
  return {
    ...template,
    text_body: template.text_body || "",
    variables: template.variables || [],
  };
}

function parseVariables(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeVariables(value: string[] | null | undefined) {
  return Array.isArray(value) ? value : [];
}

function copyVariable(variable: string) {
  navigator.clipboard?.writeText(`{{${variable}}}`);
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
      if (index === 0 && block.length <= 90) return `<h2>${withBreaks}</h2>`;
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

const card: React.CSSProperties = { background: "#fff", borderRadius: 14, padding: 14, boxShadow: "0 1px 4px rgba(0,0,0,.08)", border: "1px solid #e5e7eb" };
const stickyCard: React.CSSProperties = { ...card, position: "sticky", top: 12, maxHeight: "calc(100vh - 24px)", overflowY: "auto" };
const inlineTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 8 };
const iconCircleSmall: React.CSSProperties = { width: 28, height: 28, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0" };
const field: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 4, fontSize: 12, fontWeight: 500, color: "#475467" };
const requiredMark: React.CSSProperties = { color: "#dc2626" };
const input: React.CSSProperties = { width: "100%", height: 34, padding: "6px 10px", border: "1px solid #d0d5dd", borderRadius: 9, fontSize: 14, fontWeight: 400 };
const searchInput: React.CSSProperties = { ...input, marginBottom: 10 };
const plainTextArea: React.CSSProperties = { width: "100%", minHeight: 120, padding: "8px 10px", border: "1px solid #d0d5dd", borderRadius: 9, fontSize: 13, fontWeight: 400, resize: "vertical" };
const htmlArea: React.CSSProperties = { width: "100%", minHeight: 340, padding: "8px 10px", border: "1px solid #d0d5dd", borderRadius: 9, fontSize: 13, fontWeight: 400, fontFamily: "monospace", resize: "vertical" };
const check: React.CSSProperties = { display: "flex", alignItems: "center", gap: 7, fontSize: 13, fontWeight: 600 };
const primaryButtonSmall: React.CSSProperties = { padding: "8px 12px", borderRadius: 9, border: "none", background: "#2db84b", color: "#fff", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const secondaryButton: React.CSSProperties = { marginTop: 8, padding: "8px 12px", borderRadius: 9, border: "1px solid #d0d5dd", background: "#fff", color: "#344054", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const darkButtonNoMargin: React.CSSProperties = { padding: "9px 14px", borderRadius: 10, border: "none", background: "#111827", color: "#fff", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 6 };
const dangerButtonSmall: React.CSSProperties = { padding: "8px 12px", borderRadius: 9, border: "none", background: "#dc2626", color: "#fff", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 };
const smallButton: React.CSSProperties = { padding: "7px 10px", borderRadius: 9, border: "none", background: "#2db84b", color: "#fff", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 };
const divider: React.CSSProperties = { height: 1, background: "#e5e7eb", margin: "12px 0 8px" };
const successBox: React.CSSProperties = { marginBottom: 10, padding: 10, borderRadius: 10, background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontSize: 13 };
const errorBox: React.CSSProperties = { marginBottom: 10, padding: 10, borderRadius: 10, background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", fontSize: 13 };
const templateLayout: React.CSSProperties = { display: "grid", gridTemplateColumns: "290px minmax(620px, 1fr) 250px", gap: 14, alignItems: "start" };
const listHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, borderBottom: "1px solid #e5e7eb", marginBottom: 10 };
const templateList: React.CSSProperties = { display: "grid", gap: 8 };
const templateButton: React.CSSProperties = { width: "100%", textAlign: "left", padding: 10, borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", display: "grid", gap: 3 };
const selectedTemplateButton: React.CSSProperties = { ...templateButton, border: "1px solid #2db84b", background: "#f0fdf4" };
const stickyEditorHeader: React.CSSProperties = { position: "sticky", top: 12, zIndex: 20, background: "#fff", borderBottom: "1px solid #e5e7eb", paddingBottom: 10, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" };
const templateEditorGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 };
const editorSpacing: React.CSSProperties = { marginTop: 8 };
const editorPreviewGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 10 };
const previewTitle: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 800, color: "#344054", marginBottom: 4 };
const previewBox: React.CSSProperties = { minHeight: 340, border: "1px solid #e5e7eb", borderRadius: 10, padding: 14, background: "#fff", overflow: "auto", fontSize: 14 };
const activeRow: React.CSSProperties = { display: "flex", alignItems: "end", paddingBottom: 8 };
const variablesBox: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 };
const variableChip: React.CSSProperties = { border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534", borderRadius: 999, padding: "5px 9px", fontSize: 12, fontWeight: 800, cursor: "pointer" };
const actionsRowNoMargin: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center" };
const testTemplateRow: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" };
const sideHelp: React.CSSProperties = { color: "#667085", fontSize: 12, lineHeight: 1.4, margin: "10px 0 0" };
const sectionTitle: React.CSSProperties = { fontSize: 13, margin: "10px 0 6px", fontWeight: 800 };
const emptyState: React.CSSProperties = { border: "1px dashed #d0d5dd", borderRadius: 12, padding: 14, color: "#667085", fontSize: 13 };
