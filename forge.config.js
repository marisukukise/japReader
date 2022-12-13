module.exports = {
  makers: [{
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD,
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'marisukukise',
          homepage: 'https://github.com/marisukukise/japReader'
        }
      }
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/marisukukise/japReader'
        }
      }
    }, 
    {
      name: '@electron-forge/maker-zip'
    }
  ],
};