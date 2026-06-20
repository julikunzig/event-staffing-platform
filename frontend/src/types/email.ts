export type EmailSettingsTab = "smtp" | "templates" | "history";

export interface EmailSettings {
  from_name: string;
  from_email: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  use_tls: boolean;
  use_ssl: boolean;
  is_active: boolean;
  last_test_at: string;
  last_test_success: boolean | null;
  last_test_message: string;
}

export interface EmailTemplate {
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
}

export interface EmailDeliveryLog {
  id: number;
  company_id: number;
  template_id: number | null;
  recipient_email: string;
  subject: string;
  status: string;
  provider: string;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

export interface EmailHistoryFilters {
  recipient_email: string;
  subject: string;
  status: string;
  page: number;
  page_size: number;
}

export const EMPTY_EMAIL_SETTINGS: EmailSettings = {
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
  last_test_success: null,
  last_test_message: "",
};

export const EMPTY_TEMPLATE: EmailTemplate = {
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

export const DEFAULT_VARIABLES = [
  "employee_name",
  "event_name",
  "event_date",
  "company_name",
  "payment_amount",
  "password_reset_link",
];
