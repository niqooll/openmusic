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
      const maxSize = 512000; // 512KB - EXACT limit as per requirement
      
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const originalName = meta.filename || 'upload';
      const filename = `${timestamp}-${randomStr}-${originalName}`;
      const filePath = path.resolve(this._folder, filename);

      console.log(`Starting file upload: ${filename}`);
      console.log('File headers:', meta.headers);

      const fileStream = fs.createWriteStream(filePath);
      let fileSize = 0;
      let sizeExceeded = false;

      fileStream.on('error', (error) => {
        console.error('Write stream error:', error);
        // Clean up file on error
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(new Error('Failed to write file'));
      });

      fileStream.on('finish', () => {
        console.log(`File upload finished: ${filename} (${fileSize} bytes)`);
        
        // Final size check after writing is complete
        if (sizeExceeded || fileSize > maxSize) {
          console.log(`File too large: ${fileSize} bytes > ${maxSize} bytes`);
          // Clean up oversized file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error('Payload content length greater than maximum allowed: 512000'));
          return;
        }
        
        resolve(filename);
      });

      file.on('error', (error) => {
        console.error('File stream error:', error);
        fileStream.destroy();
        // Clean up partial file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        reject(new Error('File stream error'));
      });

      file.on('data', (chunk) => {
        fileSize += chunk.length;
        console.log(`Received chunk: ${chunk.length} bytes, total: ${fileSize} bytes`);
        
        // Check size during streaming to prevent large files
        if (fileSize > maxSize) {
          console.log(`Size exceeded during streaming: ${fileSize} > ${maxSize}`);
          sizeExceeded = true;
          fileStream.destroy();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error('Payload content length greater than maximum allowed: 512000'));
          return;
        }
      });

      file.on('end', () => {
        console.log('File stream ended, finalizing...');
        fileStream.end();
      });

      // Start piping the file
      file.pipe(fileStream);
    });
  }
}

module.exports = StorageService;