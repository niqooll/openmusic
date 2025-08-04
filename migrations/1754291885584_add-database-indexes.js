/* eslint-disable camelcase */

exports.up = (pgm) => {
  // Index untuk pencarian songs
  pgm.createIndex('songs', 'title', { method: 'gin', opclass: { title: 'gin_trgm_ops' } });
  pgm.createIndex('songs', 'performer', { method: 'gin', opclass: { performer: 'gin_trgm_ops' } });
  
  // Index untuk foreign keys
  pgm.createIndex('songs', 'album_id');
  pgm.createIndex('playlists', 'owner');
  pgm.createIndex('playlist_songs', 'playlist_id');
  pgm.createIndex('playlist_songs', 'song_id');
  pgm.createIndex('collaborations', ['playlist_id', 'user_id']);
  pgm.createIndex('playlist_song_activities', 'playlist_id');
  
  // Index untuk unique constraints
  pgm.createIndex('users', 'username');
};

exports.down = (pgm) => {
  pgm.dropIndex('songs', 'title');
  pgm.dropIndex('songs', 'performer');
  pgm.dropIndex('songs', 'album_id');
  pgm.dropIndex('playlists', 'owner');
  pgm.dropIndex('playlist_songs', 'playlist_id');
  pgm.dropIndex('playlist_songs', 'song_id');
  pgm.dropIndex('collaborations', ['playlist_id', 'user_id']);
  pgm.dropIndex('playlist_song_activities', 'playlist_id');
  pgm.dropIndex('users', 'username');
};