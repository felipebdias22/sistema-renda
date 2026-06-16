export type Nicho = {
  id: string;
  nome: string;
  criado_em: string;
};

export type Pais = {
  id: string;
  nome: string;
  codigo: string;
  criado_em: string;
};

export type Video = {
  id: string;
  titulo: string;
  descricao: string | null;
  vimeo_url: string;
  nicho_id: string | null;
  pais_id: string | null;
  ativo: boolean;
  criado_em: string;
  capa_url?: string | null;
  views?: string | null;
  engajamento?: string | null;
  nicho?: Nicho | null;
  pais?: Pais | null;
  thumb?: string | null;
};

export type Agente = {
  id: string;
  nome: string;
  descricao: string | null;
  video_tutorial_url: string;
  link_agente: string;
  ativo: boolean;
  ordem: number;
  criado_em: string;
  thumb?: string | null;
};

export type Ganho = {
  id: string;
  user_id: string;
  data: string; // YYYY-MM-DD
  valor_usd: number;
  cotacao: number;
  valor_brl: number;
  criado_em: string;
};

export type RoteiroResult = {
  titulo: string;
  descricao: string;
  roteiro: string;
};
