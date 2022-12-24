module.exports = {
  packagerConfig: {
    icon: './images/logo/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: './images/logo/icon.ico',
        setupIcon: './images/logo/icon.ico',
        options: {}
      },
    },
    {
      name: '@electron-forge/maker-zip',
      config: {
        options: {
          icon: './images/logo/icon.png',
        }
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'marisukukise',
          homepage: 'https://github.com/marisukukise/japReader',
          icon: './images/logo/icon.png',
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/marisukukise/japReader',
          icon: './images/logo/icon.png',
        }
      },
    },
  ],
};
