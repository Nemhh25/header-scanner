export interface HeaderCheck {
  header: string;
  weight: number;
  description: string;
  validate: (value: string | undefined) => boolean;
  recommendation: string;
}

export const checks: HeaderCheck[] = [
  {
    header: "content-security-policy",
    weight: 20,
    description: "Previne XSS e injeção de código, controlando quais fontes de conteúdo o navegador pode carregar.",
    validate: (value) => !!value,
    recommendation: "Defina uma Content-Security-Policy restritiva.",
  },
  {
    header: "strict-transport-security",
    weight: 15,
    description: "Força o navegador a sempre usar HTTPS com esse site, prevenindo ataques de downgrade.",
    validate: (value) => !!value,
    recommendation: "Adicione Strict-Transport-Security com max-age de pelo menos 6 meses.",
  },
  {
    header: "x-content-type-options",
    weight: 10,
    description: "Impede que o navegador tente 'adivinhar' o tipo de um arquivo carregado.",
    validate: (value) => value === "nosniff",
    recommendation: "Defina X-Content-Type-Options como 'nosniff'.",
  },
  {
    header: "x-frame-options",
    weight: 15,
    description: "Previne Clickjacking, impedindo que seu site seja carregado dentro de um iframe em outro domínio.",
    validate: (value) => value === "deny" || value === "sameorigin",
    recommendation: "Defina X-Frame-Options como 'DENY' ou 'SAMEORIGIN'.",
  },
  {
    header: "referrer-policy",
    weight: 10,
    description: "Controla quanta informação da página de origem é enviada ao clicar em links externos.",
    validate: (value) => !!value && value !== "unsafe-url",
    recommendation: "Defina Referrer-Policy como 'strict-origin-when-cross-origin'.",
  },
  {
    header: "permissions-policy",
    weight: 10,
    description: "Controla quais APIs do navegador (câmera, microfone, geolocalização) o site pode usar.",
    validate: (value) => !!value,
    recommendation: "Defina uma Permissions-Policy restringindo APIs sensíveis não utilizadas.",
  },
];