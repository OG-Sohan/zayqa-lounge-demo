export const DEMO_ADMIN = { email: "demo@grabweb.com", password: "zayqa2026" } as const;

export const isDemoAdmin = (email: string, password: string) =>
  email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
