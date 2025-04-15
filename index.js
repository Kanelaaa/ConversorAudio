import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

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
