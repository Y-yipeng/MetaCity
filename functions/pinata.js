// functions/pinata.js
const Busboy = require('busboy');
const axios = require('axios');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  return new Promise((resolve) => {
    const busboy = Busboy({ headers: event.headers });
    let fileBuffer = null;
    let fields = {};

    // 收集字段
    busboy.on('field', (fieldname, val) => {
      fields[fieldname] = val;
    });

    // 收集文件数据
    busboy.on('file', (fieldname, file, filename) => {
      const chunks = [];
      file.on('data', (data) => chunks.push(data));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    // 完成解析
    busboy.on('finish', async () => {
      try {
        // 检查文件是否存在
        if (!fileBuffer) {
          throw new Error('未上传文件');
        }

        // 构造 FormData
        const formData = new FormData();
        formData.append('file', fileBuffer, { filename: fields.productName || 'default' });

        // 调用 Pinata API
        const response = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              pinata_api_key: process.env.PINATA_API_KEY,
              pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
          }
        );

        // 返回成功响应
        resolve({
          statusCode: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ipfsHash: response.data.IpfsHash }),
        });
      } catch (error) {
        // 返回错误响应
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        });
      }
    });

    // 处理请求体
    busboy.end(
      event.isBase64Encoded ? 
        Buffer.from(event.body, 'base64') : 
        event.body
    );
  });
};