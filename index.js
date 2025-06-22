require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const WHAPI_TOKEN = process.env.WHAPI_TOKEN;
const MY_NUMBER = process.env.PHONE_ID;

// Criando instância de conexão com a Whapi
const api = axios.create({
  baseURL: `https://gate.whapi.cloud`,
  headers: {
    'Authorization': `Bearer ${WHAPI_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

app.get('/', (req, res) => {
  res.json({
    message: "Chatbot rodando"
  });
});

// Rota de webhook para receber mensagens
app.post('/webhook', async (req, res) => {
  const messageData = req.body;

  // Exemplo de resposta automática
  try {
    if (messageData.messages && messageData.messages[0]) {
      const msg = messageData.messages[0];
      const from = msg.from;
      const text = msg.text?.body || '';
      
      console.log(from);

      // Previnindo resposta para o próprio número
      if (msg.from === MY_NUMBER) {
        console.log('Mensagem vinda do próprio número. Ignorando...');
        return res.sendStatus(200);
      }

      if (text.toLowerCase().includes('oi') || text.toLowerCase().includes('olá') || text.toLowerCase().includes('bom dia') || text.toLowerCase().includes('boa tarde') || text.toLowerCase().includes('boa noite')) {
        await api.post(`/messages/text`, {
            to: from,
            body: `Oi! Tudo bem? Como posso te ajudar hoje?`
        });
    } else {
        await api.post(`/messages/text`, {
            to: from,
            body: `Seja bem vindo ao canal de comunicação automatizada da Secretaria Municipal de Saúde de Neópolis - SE. 🏥 👨🏻‍⚕️\n\nPor enquanto este número está sendo utilizado somente para disparo de notificações sobre chegada de exames, mas logo estaremos disponibilizando funções para auxiliar nossos pacientes! 😉`
        });
    }

    }
    res.sendStatus(200);
  } catch (err) {
    console.error('Erro ao enviar resposta:', err.message);
    res.sendStatus(500);
  }
});

app.post('/sendMessage', async (req, res) => {
    const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Parâmetros "to" e "message" são obrigatórios.' });
  }

  try {
    const response = await api.post('/messages/text', {
      to,
      body: message
    });

    console.log(`Mensagem enviada para ${to}: ${message}`);
    res.status(200).json({ success: true, data: response.data });

  } catch (err) {
    console.error('Erro ao enviar mensagem:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Erro ao enviar mensagem',
      details: err.response?.data || err.message
    });
  }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
