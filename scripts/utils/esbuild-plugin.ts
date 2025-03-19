import { Plugin } from "esbuild";

export interface ExternalsOptions {
  include?: string[];
}

export function externalsPlugin(options?: ExternalsOptions): Plugin {
  return {
    name: "externals-plugin",
    setup(build) {
      const isRelativeRegexp = /^\./;
      const isInternalRegexp = /^src\/.*/;

      const includeModules = options?.include;

      build.onResolve({ filter: /.*/ }, (args) => {
        const isRelative = isRelativeRegexp.test(args.path);

        if (isRelative) {
          return {
            external: false,
          };
        }

        const isInternal = isInternalRegexp.test(args.path);

        if (isInternal) {
          return {
            external: false,
          };
        }

        if (includeModules != null && includeModules.includes(args.path)) {
          return {
            external: false,
          };
        }

        return {
          external: true,
        };
      });
    },
  };
}

export function nativesPlugin(): Plugin {
  return {
    name: "natives-plugin",
    setup(build) {
      build.onResolve({ filter: /^dist\/native\/.*/ }, (args) => {
        return {
          path: args.path.replace("dist", "."),
          external: true,
        };
      });
    },
  };
}
