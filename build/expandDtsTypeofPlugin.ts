import type { Plugin } from 'vite'
import { Project } from 'ts-morph'
import { writeFileSync } from 'fs'
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

        // Plan phase: compute all changes in memory without writing to disk.
        // If anything throws here, nothing has been written.
        const pending = new Map<string, string>()
        for (const sourceFile of project.getSourceFiles()) {
          const newContent = processSourceFile(sourceFile, checker)
          if (newContent !== null) {
            pending.set(sourceFile.getFilePath(), newContent)
          }
        }

        // Commit phase: write all planned changes at once.
        for (const [filePath, content] of pending) {
          writeFileSync(filePath, content)
        }

        console.log(`\n[expand-dts-typeof] Done. Modified ${pending.size} file(s).`)
      },
    },
  }
}
