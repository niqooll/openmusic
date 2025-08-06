require('dotenv').config();
const amqp = require('amqplib');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistMailer = require('./consumer/PlaylistMailer');

const init = async () => {
  const playlistsService = new PlaylistsService();
  const mailer = new PlaylistMailer();

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  const queue = 'export:playlists';
  await channel.assertQueue(queue, {
    durable: true,
  });

  channel.consume(queue, async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlist = await playlistsService.getSongsFromPlaylist(playlistId);
      const result = await mailer.sendEmail(targetEmail, JSON.stringify({ playlist }));

      console.log(`Email ekspor untuk playlist ${playlistId} berhasil dikirim ke ${targetEmail}`);
      console.log(result);
    } catch (error) {
      console.error(`Gagal memproses pesan dari queue: ${error.message}`);
    } finally {
      channel.ack(message);
    }
  });

  console.log(`Consumer berjalan, menunggu pesan di queue: ${queue}`);
};

init();