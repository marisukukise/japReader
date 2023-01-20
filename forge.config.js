module.exports = {
  packagerConfig: {
    icon: './images/logo/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: 'https://raw.githubusercontent.com/marisukukise/japReader/main/images/logo/icon.ico',
        setupIcon: './images/logo/icon.ico',
        authors: 'marisukukise',
        description: 'An Electron app that helps you read Japanese text',
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
