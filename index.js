const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('audio'), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = path.join('outputs', `${Date.now()}.mp3`);

  ffmpeg(inputPath)
    .toFormat('mp3')
    .on('end', () => {
      const file = fs.readFileSync(outputPath);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.send(file);
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    })
    .on('error', (err) => {
      console.error('Erro na conversão:', err);
      res.status(500).send('Erro na conversão do áudio.');
      fs.unlinkSync(inputPath);
    })
    .save(outputPath);
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
