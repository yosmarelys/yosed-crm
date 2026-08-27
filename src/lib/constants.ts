export const ROLES = ["ADMIN", "VENTAS", "DISENO", "CAMPANAS"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Administrador",
  VENTAS: "Ventas",
  DISENO: "Diseño",
  CAMPANAS: "Campañas",
};

export const INVOICE_STATUSES = ["PAID", "PENDING", "OVERDUE"] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  PAID: "Pagada",
  PENDING: "Pendiente",
  OVERDUE: "Vencida",
};

export const LEAD_STAGES = [
  "NUEVO",
  "CONTACTADO",
  "INTERESADO",
  "AGENDADO",
  "GANADO",
  "PERDIDO",
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

export const LEAD_STAGE_LABEL: Record<LeadStage, string> = {
  NUEVO: "Nuevo",
  CONTACTADO: "Contactado",
  INTERESADO: "Interesado",
  AGENDADO: "Agendado",
  GANADO: "Ganado",
  PERDIDO: "Perdido",
};

export const CAMPAIGN_STATUSES = ["PLANEADA", "ACTIVA", "PAUSADA", "FINALIZADA"] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export const CAMPAIGN_STATUS_LABEL: Record<CampaignStatus, string> = {
  PLANEADA: "Planeada",
  ACTIVA: "Activa",
  PAUSADA: "Pausada",
  FINALIZADA: "Finalizada",
};

export const DESIGN_STATUSES = [
  "SOLICITADO",
  "EN_DISENO",
  "REVISION",
  "APROBADO",
  "ENTREGADO",
] as const;
export type DesignStatus = (typeof DESIGN_STATUSES)[number];

export const DESIGN_STATUS_LABEL: Record<DesignStatus, string> = {
  SOLICITADO: "Solicitado",
  EN_DISENO: "En diseño",
  REVISION: "Revisión",
  APROBADO: "Aprobado",
  ENTREGADO: "Entregado",
};

export const DESIGN_PRIORITIES = ["BAJA", "MEDIA", "ALTA", "URGENTE"] as const;
export type DesignPriority = (typeof DESIGN_PRIORITIES)[number];

export const DESIGN_PRIORITY_LABEL: Record<DesignPriority, string> = {
  BAJA: "Baja",
  MEDIA: "Media",
  ALTA: "Alta",
  URGENTE: "Urgente",
};
