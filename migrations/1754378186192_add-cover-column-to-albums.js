/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addColumn('albums', {
    cover: {
      type: 'TEXT',
      nullable: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('albums', 'cover');
};