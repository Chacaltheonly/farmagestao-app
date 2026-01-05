
export type Role = 'COLABORADOR' | 'GESTOR';

export interface User {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  role: Role;
  // Novos campos de jornada
  inicioJornada: string; // HH:mm
  inicioAlmoco: string; // HH:mm
  retornoAlmoco: string; // HH:mm
  fimJornada: string; // HH:mm
}

export interface PontoRecord {
  id: string;
  userId: string;
  userName: string;
  tipo: 'Entrada' | 'Saída Almoço' | 'Retorno Almoço' | 'Saída Final' | 'Início Int. 15m' | 'Retorno Int. 15m';
  data: string;
  hora: string;
  lat: number;
  lng: number;
  status: 'Válido' | 'Fora do Raio';
  isTrocaPlantao?: boolean;
}

export interface FeriasRequest {
  id: string;
  userId: string;
  userName: string;
  dataInicio: string;
  dataFim: string;
  status: 'Pendente' | 'Aprovado' | 'Negado';
  dataSolicitacao: string;
}

export interface AppConfig {
  pharmacyLat: number;
  pharmacyLng: number;
  allowedRadiusMeters: number;
}

export interface VendaRecord {
  data: string;
  anoMes: string; // yyyy-mm
  colaboradorEmail: string;
  vendasLiquidas: number;
  cmv: number;
  cupons: number;
  itensVendidos: number;
  parceirosUnidades: number;
}

export interface ResultadoComparativo {
  label: string;
  atual: number;
  anoAnterior: number;
  anoRetrasado: number;
  unidade: string;
  isPositiveBetter: boolean;
}
