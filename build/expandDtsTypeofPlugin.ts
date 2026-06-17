import type { Plugin } from 'vite'
import { Project } from 'ts-morph'
import { processSourceFile } from './expandDtsTypeof'

export function expandDtsTypeofPlugin(distDir: string, tsconfigPath: string): Plugin {
  return {
    name: 'expand-dts-typeof',
    apply: 'build',
    closeBundle: {
      order: 'post',
      handler() {
        const project = new Project({
          tsConfigFilePath: tsconfigPath,
          skipAddingFilesFromTsConfig: true,
        })
        project.addSourceFilesAtPaths(`${distDir}/**/*.d.ts`)
        const checker = project.getTypeChecker().compilerObject

        let totalModified = 0
        for (const sourceFile of project.getSourceFiles()) {
          const modified = processSourceFile(sourceFile, checker)
          if (modified) {
            sourceFile.saveSync()
            totalModified++
          }
        }

        console.log(`\n[expand-dts-typeof] Done. Modified ${totalModified} file(s).`)
      },
    },
  }
}
