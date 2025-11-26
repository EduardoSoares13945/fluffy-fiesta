require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3333;
const HOST_ENV = process.env.HOST || 'localhost';
const LISTEN_HOST = (HOST_ENV === 'localhost' || HOST_ENV === '127.0.0.1') ? HOST_ENV : '0.0.0.0';

app.use(cors());
app.use(express.json());

let games = [
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

function validarJogo(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.titulo?.trim()) {
    errors.push('Título é obrigatório');
  }
  
  if (data.ano !== undefined && data.ano !== null) {
    const ano = Number(data.ano);
    if (!Number.isInteger(ano) || ano < 1970 || ano > 2100) {
      errors.push('Ano deve ser inteiro entre 1970 e 2100');
    }
  }
  
  if (data.nota !== undefined && data.nota !== null) {
    const nota = Number(data.nota);
    if (isNaN(nota) || nota < 0 || nota > 10) {
      errors.push('Nota deve estar entre 0 e 10');
    }
  }
  
  return errors;
}

app.get('/games', (req, res) => {
  res.json(games);
});

app.get('/games/:id', (req, res) => {
  const id = Number(req.params.id);
  const game = games.find((g) => g.id === id);
  
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
  
  res.json(game);
});

app.post('/games', (req, res) => {
  const errors = validarJogo(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  const novoJogo = {
    id: Date.now(),
    titulo: req.body.titulo?.trim() || '',
    plataforma: req.body.plataforma?.trim() || '',
    genero: req.body.genero?.trim() || '',
    ano: req.body.ano !== undefined ? Number(req.body.ano) : undefined,
    nota: req.body.nota !== undefined ? Number(req.body.nota) : undefined,
  };
  
  games = [novoJogo, ...games];
  res.status(201).json(novoJogo);
});

app.put('/games/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = games.findIndex((g) => g.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
  
  const errors = validarJogo(req.body, true);
  
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  
  const atualizado = {
    ...games[index],
    ...(req.body.titulo !== undefined && { titulo: req.body.titulo.trim() }),
    ...(req.body.plataforma !== undefined && { plataforma: req.body.plataforma.trim() }),
    ...(req.body.genero !== undefined && { genero: req.body.genero.trim() }),
    ...(req.body.ano !== undefined && { ano: Number(req.body.ano) }),
    ...(req.body.nota !== undefined && { nota: Number(req.body.nota) }),
  };
  
  games[index] = atualizado;
  res.json(atualizado);
});

app.delete('/games/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = games.findIndex((g) => g.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Jogo não encontrado' });
  }
  
  games.splice(index, 1);
  res.status(204).send();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, LISTEN_HOST, () => {
  console.log(`Backend rodando em http://${HOST_ENV}:${PORT}`);
  console.log(`Jogos iniciais: ${games.length}`);
});
