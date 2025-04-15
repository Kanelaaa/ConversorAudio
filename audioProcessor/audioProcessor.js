const crypto = require('crypto');
const fs = require('fs');
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg');

// Função para descriptografar o arquivo
async function decryptAudio(mediaKey, fileUrl) {
  // 1. Obter o arquivo .enc a partir do URL
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const encryptedBuffer = Buffer.from(response.data);

  // 2. Derivar a chave de criptografia com a mediaKey
  const mediaKeyBuffer = Buffer.from(mediaKey, 'base64');
  const iv = mediaKeyBuffer.slice(0, 16);
  const key = mediaKeyBuffer.slice(16, 32);

  // 3. Decrypt do arquivo .enc usando AES-256-CBC
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

  // 4. Salvar o arquivo descriptografado temporariamente
  const decryptedFilePath = 'temp_audio.ogg';
  fs.writeFileSync(decryptedFilePath, decryptedBuffer);
  
  return decryptedFilePath;
}

// Função para processar o áudio e converter
async function processAudio(decryptedFilePath) {
  return new Promise((resolve, reject) => {
    const outputFilePath = 'processed_audio.ogg';

    ffmpeg(decryptedFilePath)
      .output(outputFilePath)
      .on('end', () => {
        // Remover o arquivo temporário depois de processado
        fs.unlinkSync(decryptedFilePath);
        resolve(outputFilePath); // Retorna o caminho do áudio processado
      })
      .on('error', (err) => {
        reject(`Erro ao converter o áudio: ${err.message}`);
      })
      .run();
  });
}

// Função principal para descriptografar e processar o áudio
async function handleAudioConversion(mediaKey, fileUrl) {
  try {
    const decryptedFilePath = await decryptAudio(mediaKey, fileUrl);
    const processedFilePath = await processAudio(decryptedFilePath);
    console.log('Áudio processado e pronto para transcrição:', processedFilePath);
  } catch (error) {
    console.error('Erro ao processar o áudio:', error);
  }
}

// Teste da função com a URL e mediaKey que você tem
const mediaKey = 'rATWWzX8u7XrGSuA5RwE9JeNDRyi5b9vaLto4F/8jnA='; // Substitua com a sua mediaKey real
const fileUrl = 'https://mmg.whatsapp.net/v/t62.7117-24/19454903_637857949013627_4451417633537780116_n.enc?ccb=11-4&oh=01_Q5Aa1QG6hb3wGxufLoPkIv_yk5bcOvmSoDWfJNo_SkUigr2QnA&oe=6826029A&_nc_sid=5e03e0&mms3=true'; // Substitua com o URL real do áudio

handleAudioConversion(mediaKey, fileUrl);
