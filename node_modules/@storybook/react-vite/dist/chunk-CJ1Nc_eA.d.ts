import { CompatibleString, StorybookConfig, TypescriptOptions } from "storybook/internal/types";
import { BuilderOptions, StorybookConfigVite } from "@storybook/builder-vite";
import docgenTypescript from "@joshwooding/vite-plugin-react-docgen-typescript";

//#region code/frameworks/react-vite/.dts-emit/code/frameworks/react-vite/src/types.d.ts
type FrameworkName = CompatibleString<'@storybook/react-vite'>;
type BuilderName = CompatibleString<'@storybook/builder-vite'>;
type FrameworkOptions = {
  builder?: BuilderOptions;
  strictMode?: boolean;
  /**
   * Use React's legacy root API to mount components
   *
   * React has introduced a new root API with React 18.x to enable a whole set of new features (e.g.
   * concurrent features) If this flag is true, the legacy Root API is used to mount components to
   * make it easier to migrate step by step to React 18.
   *
   * @default false
   */
  legacyRootApi?: boolean;
};
type StorybookConfigFramework = {
  framework: FrameworkName | {
    name: FrameworkName;
    options: FrameworkOptions;
  };
  core?: StorybookConfig['core'] & {
    builder?: BuilderName | {
      name: BuilderName;
      options: BuilderOptions;
    };
  };
  features?: StorybookConfig['features'] & {
    /**
     * Enable the experimental `.test` function in CSF Next
     *
     * @see https://storybook.js.org/docs/api/main-config/main-config-features#experimentaltestsyntax
     */
    experimentalTestSyntax?: boolean;
  };
};
type TypescriptOptions$1 = TypescriptOptions & {
  /**
   * Sets the type of Docgen when working with React and TypeScript
   *
   * @default `'react-docgen'`
   */
  reactDocgen: 'react-docgen-typescript' | 'react-docgen' | false; /** Configures `@joshwooding/vite-plugin-react-docgen-typescript` */
  reactDocgenTypescriptOptions: Parameters<typeof docgenTypescript>[0];
};
/** The interface for Storybook configuration in `main.ts` files. */
type StorybookConfig$1 = Omit<StorybookConfig, keyof StorybookConfigVite | keyof StorybookConfigFramework | 'typescript'> & StorybookConfigVite & StorybookConfigFramework & {
  typescript?: Partial<TypescriptOptions$1>;
};
//#endregion
export { StorybookConfig$1 as n, FrameworkOptions as t };