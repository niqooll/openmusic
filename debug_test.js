// Debug script untuk test API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAddSong() {
  try {
    console.log('🧪 Testing Add Song...');
    
    // Test payload yang mungkin digunakan oleh Postman
    const payload = {
      title: "Test Song",
      year: 2023,
      genre: "Pop",
      performer: "Test Artist",
      duration: 240
      // Tidak ada albumId - ini yang mungkin menyebabkan masalah
    };
    
    console.log('📤 Request payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/songs`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Status Code:', response.status);
    console.log('📤 Response:', JSON.stringify(response.data, null, 2));
    console.log('📋 Headers:', response.headers);
    
  } catch (error) {
    console.log('❌ Error Status:', error.response?.status);
    console.log('❌ Error Response:', JSON.stringify(error.response?.data, null, 2));
    console.log('❌ Error Message:', error.message);
  }
}

async function testAddSongWithAlbum() {
  try {
    console.log('\n🧪 Testing Add Song with Album...');
    
    // Pertama buat album
    const albumPayload = {
      name: "Test Album",
      year: 2023
    };
    
    console.log('📤 Creating album first...');
    const albumResponse = await axios.post(`${BASE_URL}/albums`, albumPayload);
    console.log('✅ Album created:', albumResponse.data);
    
    const albumId = albumResponse.data.data.albumId;
    
    // Kemudian buat song dengan albumId
    const songPayload = {
      title: "Test Song with Album",
      year: 2023,
      genre: "Rock",
      performer: "Test Band",
      duration: 180,
      albumId: albumId
    };
    
    console.log('📤 Request payload:', JSON.stringify(songPayload, null, 2));
    
    const response = await axios.post(`${BASE_URL}/songs`, songPayload);
    
    console.log('✅ Status Code:', response.status);
    console.log('📤 Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('❌ Error Status:', error.response?.status);
    console.log('❌ Error Response:', JSON.stringify(error.response?.data, null, 2));
  }
}

// Jalankan tests
async function runTests() {
  console.log('🚀 Starting API Debug Tests...\n');
  
  await testAddSong();
  await testAddSongWithAlbum();
  
  console.log('\n✅ Debug tests completed!');
}

runTests().catch(console.error);