const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3333';

export type Game = {
  id: number;
  titulo: string;
  plataforma: string;
  genero: string;
  ano?: number;
  nota?: number; // 0 a 10
};

export type CreateGameDTO = Omit<Game, 'id'>;
export type UpdateGameDTO = Partial<Omit<Game, 'id'>>;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || error.errors?.join(', ') || 'Erro na requisição');
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

export async function listarJogos(): Promise<Game[]> {
  const response = await fetch(`${API_URL}/games`);
  return handleResponse<Game[]>(response);
}

export async function criarJogo(data: CreateGameDTO): Promise<Game> {
  const response = await fetch(`${API_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Game>(response);
}

export async function atualizarJogo(id: number, data: UpdateGameDTO): Promise<Game> {
  const response = await fetch(`${API_URL}/games/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<Game>(response);
}

export async function excluirJogo(id: number): Promise<void> {
  const response = await fetch(`${API_URL}/games/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<void>(response);
}

