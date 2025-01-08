// @ts-check
const cp = require("child_process");

const baseConfig = {
  authors: "Andrey Allyson",
  description: "None",
};

/**
 *
 * @param {string} command
 * @returns {Promise<string>}
 */
function exec(command) {
  return new Promise((resolve, reject) => {
    cp.exec(command, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) return reject(stderr);

      resolve(stdout);
    });
  });
}

/**@type {import('@electron-forge/shared-types').ForgeConfig} */
module.exports = {
  packagerConfig: {
    name: "Gerador de Escalas",
    icon: "public/assets/icon/favicon.ico",
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: baseConfig,
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
      config: baseConfig,
    },
    {
      name: "@electron-forge/maker-deb",
      config: baseConfig,
    },
    {
      name: "@electron-forge/maker-rpm",
      config: baseConfig,
    },
  ],
  hooks: {
    prePackage: async () => {
      await exec("npm run build:prod").catch((e) => console.error(e));
    },
  },
};
