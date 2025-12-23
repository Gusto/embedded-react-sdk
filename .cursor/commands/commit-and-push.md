# Commit and push

This command commits current work in progress and pushes it to github

- Examine the git history and propose a name for the commit (naming in our codebase follows conventional commits, so it will need to be "fix/feat/chore/etc: some description of the change")
- Add all files
- Commit with the commit name discussed above
- If there are any build issues or failures, fix them, add the files, and commit again. Repeat until git commit is successful
- Push to a branch that is of the following shape based off of the current branch name `git push origin <current-branch-name>:<fix/feat/chore/etc>/<current-branch-name>`
