export interface Client {
  id: number;
  name: string;
  email: string;
  company_name: string;
  phone: string;
  slug: string;
  domain: string;
  is_active?: boolean;
}

export interface ClientPayload {
  name: string;
  company_name: string;
  email: string;
  phone: string;
  slug: string;
  domain: string;
}
