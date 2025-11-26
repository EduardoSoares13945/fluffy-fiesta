// Camada de dados (mock) para separar front/back
// Futuramente, trocar implementações por chamadas HTTP reais

export type Game = {
  id: number;
  titulo: string;
  plataforma: string;
  genero: string;
  ano?: number;
  nota?: number; // 0 a 10
};

// "Banco" em memória (mock)
let db: Game[] = [
  {
    id: Date.now() - 2,
    titulo: 'The Witcher 3',
    plataforma: 'PC',
    genero: 'RPG',
    ano: 2015,
    nota: 10,
  },
  {
    id: Date.now() - 1,
    titulo: 'Hades',
    plataforma: 'Switch',
    genero: 'Roguelike',
    ano: 2020,
    nota: 9.5,
  },
];

const delay = (ms = 200) => new Promise((res) => setTimeout(res, ms));

export async function listarJogos(): Promise<Game[]> {
  await delay();
  // retorna cópia para evitar mutação externa
  return db.map((g) => ({ ...g }));
}

export type CreateGameDTO = Omit<Game, 'id'>;
export type UpdateGameDTO = Partial<Omit<Game, 'id'>>;

export async function criarJogo(data: CreateGameDTO): Promise<Game> {
  await delay();
  const novo: Game = { id: Date.now(), ...data };
  db = [novo, ...db];
  return { ...novo };
}

export async function atualizarJogo(id: number, data: UpdateGameDTO): Promise<Game> {
  await delay();
  let atualizado: Game | null = null;
  db = db.map((j) => {
    if (j.id === id) {
      atualizado = { ...j, ...data };
      return atualizado;
    }
    return j;
  });
  if (!atualizado) throw new Error('Jogo não encontrado');
  return { ...(atualizado as Game) };
}

export async function excluirJogo(id: number): Promise<void> {
  await delay();
  db = db.filter((j) => j.id !== id);
}
