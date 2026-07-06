## Commands

- Use npm; `.npmrc` sets `legacy-peer-deps=true`, and `.nvmrc` asks for Node `v22`.
- Install with `npm install`. PR CI intentionally deletes `package-lock.json` and `node_modules` before `npm i`; release publish is the path that uses `npm ci`.
- Quick checks: `npm run lint`, `npm run build:types`, `npm test -- tests/utils/index.test.ts --runInBand`.
- Full PR-shaped verification: `npm run build`, `npm test`, then `npm run docs:build`.
- `npm run build` cleans `dist`, runs `tsc` declaration emit, then Rollup production builds. It can also rewrite root `stats.html` via the Rollup visualizer.
- `npm run dev` runs Rollup watch and VitePress docs together; use `npm run src:dev` or `npm run docs:dev` when only one side is needed.

## Architecture

- Public library exports start in `src/index.ts`: it imports `src/style` and exports `Watermark`, `BlindWatermark`, `ImageWatermark`, and all public types.
- `src/index.ie.ts` is the IE/polyfill entrypoint; it imports `core-js`, `whatwg-fetch`, `src/utils/polyfill`, then re-exports `src/index.ts`.
- Main package outputs come from `rollup.config.js`: root builds use `src/index.ts`, IE builds use `src/index.ie.ts`, and preserve-module ES builds write under `dist/es` and `dist/ie/es`.
- Core flow: `Watermark` owns DOM insertion and mutation protection, `BlindWatermark` subclasses it with blind defaults/decoder, `ImageWatermark` mutates a provided `<img>` `src`, `WatermarkCanvas` draws content, and `src/core/layout` only switches between default and grid layout.
- Keep `src/types/package.json`; its only purpose is making TypeScript happy under `moduleResolution=node16+`.

## Tests

- Jest uses `ts-jest` with `testEnvironment: "jsdom"` and always collects coverage into `coverage/`.
- Focus a file with `npm test -- tests/core/watermark.test.ts --runInBand`.
- Some core image/blind/watermark tests load remote COS images; `tests/core/image.test.ts` also sleeps twice for 10 seconds and has a 10 minute timeout, so it is not a fast smoke test.
- Image imports in tests are handled by `tests/transformer/image.transformer.js`.

## Style And Hooks

- ESLint only targets `src/**/*.{ts,js}`; Rollup also runs ESLint with `throwOnWarning: true`, so warnings can fail `npm run build`.
- Formatting is Prettier-enforced: 2 spaces, single quotes, no semicolons, trailing commas, LF.
- `tsconfig.json` is strict, ES5 + DOM, `noUnusedLocals`, and `emitDeclarationOnly` to `dist/types`.
- Husky pre-commit only checks Node `>=16` and runs `npx lint-staged`; lint-staged only lints staged `src/**/*.{ts,js}` files.
- Commit messages are Conventional Commits via commitlint; allowed types are in `commitlint.config.js`.

## Docs

- VitePress config is `docs/.vitepress/config.mts` with `base: "/watermark-js-plus/"`.
- Docs are mirrored under `docs/en` and `docs/zh`; update both locales for user-facing API changes.
