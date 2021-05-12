module.exports = context => ({
  map: {
    inline: false
  },
  plugins: {
    'postcss-import': {
      from: 'src/styles/main.pcss'
    },
    'postcss-url': {
      url: 'copy',
      useHash: true
    },
    'postcss-nesting': {},
    'postcss-custom-media': {},
    'autoprefixer': {},
    'cssnano': context.env === 'production' ? {} : false,
  }
});
