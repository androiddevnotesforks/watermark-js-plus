# Contributing to watermark-js-plus

Thank you for helping improve `watermark-js-plus`. Contributions to code, tests, documentation, examples, and issue triage are welcome.

By participating, you agree to follow the project [Code of Conduct](CODE_OF_CONDUCT.md).

## Choose the right channel

- Use [GitHub Discussions](https://github.com/zhensherlock/watermark-js-plus/discussions) for usage questions, integration help, ideas, and showcases.
- Use [GitHub Issues](https://github.com/zhensherlock/watermark-js-plus/issues/new/choose) for reproducible bugs, concrete feature proposals, and documentation problems.
- Search existing issues and discussions before opening a new one.

A bug report must include the affected browser, operating system, build tool, watermark type, package version, and a public minimal reproduction. These details let maintainers reproduce the problem without guessing about the reporter's framework setup.

## Development setup

This repository uses npm and the Node.js version declared in [.nvmrc](.nvmrc).

```bash
git clone https://github.com/zhensherlock/watermark-js-plus.git
cd watermark-js-plus
nvm use
npm install
```

Run the library watcher and documentation site together:

```bash
npm run dev
```

You can also run `npm run src:dev` or `npm run docs:dev` when working on only one part of the project.

## Making a change

1. Create a focused branch from the current default branch.
2. Keep the change limited to one problem or feature.
3. Add or update tests for behavior changes.
4. Update both `docs/en` and `docs/zh` when changing user-facing APIs or documentation.
5. Use a [Conventional Commit](https://www.conventionalcommits.org/) message such as `fix: prevent duplicate watermark nodes` or `docs: clarify blind watermark decoding`.

Do not edit generated release notes unless the change is specifically part of a release.

## Verification

Run the checks relevant to your change before opening a pull request:

```bash
npm run lint
npm test
npm run build
npm run docs:build
```

For a small source change, run the closest Jest test first. For example:

```bash
npm test -- tests/core/watermark.test.ts --runInBand
```

If a test depends on browser behavior, also describe the browsers and operating systems you tested manually in the pull request.

## Pull requests

- Link the related issue or discussion when one exists.
- Explain the problem, the chosen solution, and any tradeoffs.
- Include a minimal demo, screenshots, or recordings for visible behavior changes.
- Call out breaking changes and migration steps explicitly.
- Keep unrelated formatting, dependency, or generated-file changes out of the pull request.
- Make sure the pull request template is complete and CI passes.

Maintainers may ask for a smaller reproduction or additional tests before reviewing an implementation. This keeps reviews focused and makes future regressions easier to diagnose.
