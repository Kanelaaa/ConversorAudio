import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const bodyParser = require('body-parser');
const { handleAudioConversion } = require('../audioProcessor/audioProcessor'); // Importando a função de descriptografar e processar áudio

const app = express();
const PORT = process.env.PORT || 3000;

// Cria pasta uploads se não existir
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


pp.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  try {
    const { mediaKey, fileUrl } = req.body; // Supondo que você esteja recebendo esses dados no body

    // Chama a função para descriptografar e processar o áudio
    await handleAudioConversion(mediaKey, fileUrl);

    res.status(200).send('Áudio processado com sucesso!');
  } catch (error) {
    console.error('Erro ao processar áudio:', error);
    res.status(500).send('Erro ao processar áudio.');
  }
});

// Rota principal
app.get("/", (req, res) => {
  res.send("Servidor de conversão está online 🚀");
});

// Endpoint de upload
app.post("/convert", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo foi enviado." });
    }

    console.log("Arquivo recebido:", req.file);

    const audioPath = req.file.path;
    res.json({ success: true, path: audioPath });
  } catch (err) {
    console.error("Erro interno:", err);
    res.status(500).send("Erro interno no servidor");
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
