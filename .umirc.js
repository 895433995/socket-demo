export default {
  treeShaking: true,
  targets: {
    ie: 9,
  },
  plugins: [
    [
      'umi-plugin-react',
      {
        antd: true,
        dva: false,
        library: 'react',
        dynamicImport: false,
        title: 'socket-demo',
        routes: {
          exclude: [/components\//],
        },
        hardSource: false,
        pwa: false,
        hd: false,
        fastClick: false,
      },
    ],
  ],
};
