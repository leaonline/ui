# Agent Instructions

## Scope

This repository provides the `leaonline:ui` Meteor package: shared Blaze components and
lazy-loaded task renderers used by lea.online applications. Read [README.md](./README.md) and
[DOMAIN.md](./DOMAIN.md) before changing behavior or public interfaces.

Keep this package reusable and host-application agnostic. Application routing, authentication,
persistence, and product-specific workflows belong in consuming applications.

## Structure

- `components/` contains reusable Blaze templates, normally with colocated HTML, JavaScript, and
  CSS. Register shared components through `Components` and preserve lazy loading.
- `renderers/` contains the `TaskRenderers` registry, renderer groups, page/factory renderers, and
  item renderers. Renderer names, template names, schemas, callbacks, and initialization options
  are public contracts.
- `utils/` contains framework helpers; `tests/` and colocated `*.tests.js` files contain tests.
- `package.js` defines Meteor compatibility and dependencies; `test-proxy/` is the test harness.

## Change Rules

- Reuse domain and item definitions from `leaonline:corelib`; do not duplicate domain models or
  scoring rules here.
- Keep UI feedback provisional. The consuming app/server owns identity, sessions, durable
  responses, progress, achievements, and other authoritative state.
- Preserve distinct response states, including absent input, `null`, and `__undefined__`. Pages may
  contain zero, one, or multiple independently identified items.
- Preserve accessibility: readable text, TTS behavior, keyboard and touch operation, visible focus,
  predictable controls, and feedback that does not rely only on color or sound.
- Keep Blaze reactive work scoped to template lifecycles and clean up side effects on destruction.
- Avoid breaking renderer/component keys or data contracts. Document intentional API changes in
  `README.md` and cover behavior changes with tests.
- Match the existing style: ES modules, single quotes, two-space indentation, and no required
  semicolons. Run Biome rather than reformatting unrelated files.

## Validation

From `test-proxy/`:

```sh
meteor npm install
meteor npm run setup
meteor npm run lint
meteor npm run test
```

Use `meteor npm run test:watch` while developing. Import new test files from `ui-tests.js` so the
Meteor package runner executes them. Do not publish the package or change release versions unless
explicitly requested.
