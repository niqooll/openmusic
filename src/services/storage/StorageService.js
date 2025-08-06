const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    // Create directory if it doesn't exist
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
      console.log(`Created directory: ${folder}`);
    }
  }

  writeFile(file, meta) {
    return new Promise((resolve, reject) => {
      const maxSize = 512000; // 512KB - exact limit
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const originalName = meta.filename || 'upload';
      const filename = `${timestamp}-${randomStr}-${originalName}`;
      const filePath = path.resolve(this._folder, filename);

      const fileStream = fs.createWriteStream(filePath);
      let fileSize = 0;

      // Handle file stream errors
      file.on('error', (error) => {
        console.error('File read error:', error);
        fileStream.destroy();
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(new Error('File read error'));
      });

      // Handle write stream errors
      fileStream.on('error', (error) => {
        console.error('File write error:', error);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(new Error('Failed to write file'));
      });

      // Process data chunks
      file.on('data', (chunk) => {
        fileSize += chunk.length;
        
        // Check size limit during streaming
        if (fileSize > maxSize) {
          console.log(`File size exceeded: ${fileSize} > ${maxSize}`);
          file.destroy();
          fileStream.destroy();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error('Payload content length greater than maximum allowed: 512000'));
          return;
        }
      });

      // Handle end of file stream
      file.on('end', () => {
        fileStream.end();
      });

      // Handle successful write completion
      fileStream.on('finish', () => {
        console.log(`File uploaded successfully: ${filename} (${fileSize} bytes)`);
        resolve(filename);
      });

      // Start piping the file
      file.pipe(fileStream);
    });
  }
}

module.exports = StorageService;