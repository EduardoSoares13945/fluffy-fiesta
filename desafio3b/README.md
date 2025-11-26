# Backend - CRUD de Jogos (Node.js + Express)

API REST para gerenciar jogos, compatível com o frontend React Native.

## Tecnologias

- Node.js
- Express
- CORS

## Endpoints

### GET /games
Lista todos os jogos.

**Resposta:** `200 OK`
```json
[
  {
    "id": 1234567890,
    "titulo": "The Witcher 3",
    "plataforma": "PC",
    "genero": "RPG",
    "ano": 2015,
    "nota": 10
  }
]
```

### GET /games/:id
Busca um jogo específico.

**Resposta:** `200 OK` ou `404 Not Found`

### POST /games
Cria um novo jogo.

**Body:**
```json
{
  "titulo": "Hades",
  "plataforma": "Switch",
  "genero": "Roguelike",
  "ano": 2020,
  "nota": 9.5
}
```

**Resposta:** `201 Created`

### PUT /games/:id
Atualiza um jogo existente.

**Body:** (campos opcionais)
```json
{
  "titulo": "Hades II",
  "nota": 10
}
```

**Resposta:** `200 OK` ou `404 Not Found`

### DELETE /games/:id
Exclui um jogo.

**Resposta:** `204 No Content` ou `404 Not Found`

### GET /health
Verifica se o servidor está rodando.

## Validações

- **Título:** obrigatório (apenas na criação)
- **Ano:** inteiro entre 1970 e 2100
- **Nota:** número entre 0 e 10

## Como executar

### Instalar dependências
```powershell
npm install
```

### Rodar em desenvolvimento (com nodemon)
```powershell
npm run dev
```

### Rodar em produção
```powershell
npm start
```

O servidor inicia em `http://localhost:3000`.

## Testar com dispositivo físico

Se estiver testando o app React Native em um celular físico:

1. Descubra o IP da sua máquina:
   ```powershell
   ipconfig
   ```
   Procure por "IPv4" (ex.: 192.168.1.10)

2. Altere `API_URL` em `desafio3F/src/services/api.ts`:
   ```typescript
   const API_URL = 'http://192.168.1.10:3000';
   ```

3. Certifique-se de que o celular e o PC estão na mesma rede Wi-Fi.
