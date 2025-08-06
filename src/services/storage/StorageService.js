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
      // Validate file size first
      const maxSize = 512000; // 512KB
      
      if (meta.headers && meta.headers['content-length']) {
        const fileSize = parseInt(meta.headers['content-length'], 10);
        if (fileSize > maxSize) {
          reject(new Error('File size exceeds 512KB limit'));
          return;
        }
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const originalName = meta.filename || 'upload';
      const filename = `${timestamp}-${randomStr}-${originalName}`;
      const filePath = path.resolve(this._folder, filename);

      console.log(`Attempting to save file: ${filename}`);

      const fileStream = fs.createWriteStream(filePath);
      let fileSize = 0;

      fileStream.on('error', (error) => {
        console.error('Write stream error:', error);
        reject(new Error(`Failed to write file: ${error.message}`));
      });

      fileStream.on('finish', () => {
        console.log(`File saved successfully: ${filename} (${fileSize} bytes)`);
        
        // Double check file size after writing
        if (fileSize > maxSize) {
          // Clean up oversized file
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error('File size exceeds 512KB limit'));
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
        reject(new Error(`File stream error: ${error.message}`));
      });

      file.on('data', (chunk) => {
        fileSize += chunk.length;
        // Check size during streaming to prevent large files
        if (fileSize > maxSize) {
          fileStream.destroy();
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          reject(new Error('File size exceeds 512KB limit'));
          return;
        }
      });

      file.on('end', () => {
        console.log('File stream ended');
        fileStream.end();
      });

      // Start piping the file
      file.pipe(fileStream);
    });
  }
}

module.exports = StorageService;