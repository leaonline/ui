# Components Refactor Test Plan

## Objective

Verify that the current extraction of component logic into utility modules is
behaviorally identical to the committed inline implementations. The tests must
protect the existing Blaze templates, DOM attributes, accessibility attributes,
CSS classes, TTS inputs, lazy-image behavior, and reactive wiring without
introducing a new public contract or changing runtime behavior.

This plan covers only `components/`. The only expected change outside that
directory when the tests are implemented is adding the required test-module
imports to the existing `ui-tests.js` entry point.

## Non-breaking rules

- Treat the committed pre-refactor implementations in `HEAD` as the behavioral
  oracle. Derive expected values with `git show HEAD:components/<path>`; do not
  replace an old result with a cleaner or more desirable result.
- Make test-only changes while executing this plan. If a test exposes a
  production regression, preserve the failing test and handle the smallest
  parity-restoring production fix separately.
- Preserve exact returned attribute keys, values, class-token order, class
  spacing, truthy/falsy behavior, and fallback precedence.
- Do not rename templates, component registry keys, data properties, extracted
  utility methods, CSS classes, or accessibility attributes.
- Do not turn current `undefined`, `null`, empty-string, or boolean results into
  one another.
- Restore every replaced browser global or stub in `afterEach`. Always remove
  programmatically rendered Blaze views and their host elements.
- Do not add snapshots. Use explicit Chai assertions so every preserved
  behavior is visible in the test.

## Current test baseline

The refactor introduces these utility modules:

- `actionButton/ActionButtonUtils.js`
- `common/ButtonUtils.js`
- `icon/IconUtils.js`
- `image/ImageUtils.js`
- `routeButton/RouteButtonUtils.js`
- `soundbutton/SoundButtonUtils.js`
- `text/TextUtils.js`

The existing test files for ActionButton, Image, RouteButton, SoundButton, and
Text are empty and should be populated rather than replaced. Button and Icon
need new colocated test files. There is currently no executed component test
coverage.

## Test structure

### Pure utility tests

Follow the existing package convention: `*.tests.js`, Mocha `describe`/`it`,
and Chai `expect`. Prefer small table-driven cases where inputs differ only by
one option. Assert complete returned objects for attribute builders and exact
primitive/array results for selectors and tokenizers.

| Priority | Test file | Required characterization |
| --- | --- | --- |
| P0 | `common/tests/ButtonUtils.tests.js` | Cover missing icon, default/left position, and right position. Assert exact falsy results as well as `true`/`false`, because the original helpers did not coerce their return values. |
| P0 | `actionButton/tests/ActionButtonUtils.tests.js` | Cover minimal and option-rich button attributes; Bootstrap type/outline, block, active, icon and custom classes; label-to-ARIA fallback; optional `href` and `disabled`; and `data-*` forwarding. Cover group attributes with sound enabled/disabled, sound-button defaults and `sound: false`, icon placement helpers retained by the module, and nullish `iconClass` fallback. |
| P0 | `routeButton/tests/RouteButtonUtils.tests.js` | Call `getAttributes` and `getGroupAttributes` by the exact names used by the Blaze adapter. Cover the always-present empty `href`, optional target, grouped/ungrouped spacing, size/block/active/custom classes, `data-*` forwarding, wrapper classes, and conditional `role="group"`. |
| P0 | `soundbutton/tests/SoundButtonUtils.tests.js` | Cover the `ttsReady`/explicit-disabled matrix, retained boolean `disabled` value, TTS/text attributes, Bootstrap type, block mode, `sm`-before-`lg` precedence, outline/border behavior, active/custom classes, title, and ARIA label. |
| P0 | `text/tests/TextUtils.tests.js` | Call `getTokens` by the exact adapter name. Cover normal, repeated, leading, and trailing whitespace without filtering empty tokens. Cover regular/bold wrapper classes and custom-class fallback. |
| P0 | `icon/tests/IconUtils.tests.js` | Cover the default `far` style, explicit `far` and `fas`, the existing `far` precedence when both are set, fixed-width/pulse/spin/scale classes, and title/`aria-title` propagation. |
| P0 | `image/tests/ImageUtils.tests.js` | Cover absolute HTTP and relative sources, using the current `Components.contentPath()` value without mutating global configuration. Cover generated ID/title/alt/ARIA/size attributes, shadow/custom classes, `cors` versus `crossorigin` precedence, `data-*`/`aria-*` forwarding, and generated-attribute precedence on collisions. |

For each attribute builder, use one minimal fixture and one option-rich fixture,
then add only the edge cases needed to prove fallback or precedence behavior.
This keeps the suite compact while locking down the full pre-refactor contract.

### Blaze adapter smoke tests

Add `components/tests/ComponentRefactor.tests.js` as a client-only suite. Import
the six changed registration modules and render each template into a dedicated
host with `Blaze.renderWithData`. Wait for `Tracker.afterFlush`, assert only
observable DOM behavior, and call `Blaze.remove(view)` during cleanup.

| Priority | Component | Required smoke assertion |
| --- | --- | --- |
| P0 | `routeButton` | A grouped route button renders without a helper exception and retains wrapper ID/title/classes/`role`, link attributes, label, and icon position. This is the contract test for the adapter-to-`getGroupAttributes` wiring. |
| P0 | `actionButton` | The wrapper and button retain their attributes, label, optional icon position, and sound-disabled rendering. Utility unit tests cover sound-button data mapping separately. |
| P0 | `text` | The wrapper class and rendered token sequence match the source string, including repeated-whitespace splitting behavior. |
| P0 | `icon` | The initial reactive state reaches the `<i>` element with the expected classes and accessibility attributes. |
| P0 | `soundbutton` | A button renders with stable type, TTS/text data, title, ARIA, and base classes. Do not invoke the real TTS engine in this smoke test. |
| P1 | `image` | A deterministic `IntersectionObserver` fake receives the rendered image. Simulating intersection copies `data-src` to `src`, sets `data-loaded`, removes `data-src`, and unobserves the image. Removing the Blaze view calls `disconnect`. Restore the original global afterward. |

The smoke suite exists only to catch import, method-name, helper, lifecycle, and
template wiring mistakes that isolated utility tests cannot detect. It must not
grow into end-to-end application coverage.

## Existing-test integration

Import every populated or added component test module from the existing
`ui-tests.js` entry point because Meteor does not discover files nested in
`tests/` directories automatically. Keep those imports grouped together and
do not modify or broaden renderer tests.

The pure utility suites may run in every environment supported by the package.
Guard the Blaze smoke suite with `Meteor.isClient`, and confirm that the test
runner reports client tests rather than only a server-side pass.

## Execution order

1. Record exact expectations from the committed inline implementations.
2. Populate the five empty utility test files.
3. Add the Button and Icon utility test files.
4. Run the utility tests and investigate every mismatch against `HEAD`; do not
   update an expectation merely to match the refactored implementation.
5. Add the client-only Blaze adapter smoke suite, starting with `routeButton`.
6. Register the component test imports in `ui-tests.js`.
7. Run formatting/static validation and the full package suite.

## Validation

From `test-proxy/`:

```sh
meteor npm run lint
meteor npm run test
```

Use `meteor npm run test:watch` while implementing. Before completion, verify:

- all component utility and smoke tests are actually counted;
- both server and browser results expected by the runner are present;
- there are no Blaze helper exceptions or leaked views/observers;
- `git diff --check` is clean; and
- production output remains identical to the committed behavior.

## Acceptance criteria

- Every extracted utility function used or retained by the refactor has direct
  characterization coverage.
- Each changed Blaze component has one focused adapter smoke test.
- The `routeButton` and `text` adapters are protected against utility-method
  name drift (`getGroupAttributes` and `getTokens`).
- Image observer behavior and destruction cleanup are deterministic and tested.
- No renderer, application workflow, server, DDP, persistence, or unrelated UI
  behavior is added to the scope.
- Implementing this plan does not change any component's runtime interface or
  observable behavior.

## Out of scope

- `renderers/`, application-level flows, E2E browser journeys, server methods,
  publications, and persistence
- broader coverage of untouched `Components.js` or `textgroup`
- cleanup of legacy class spacing, fallback semantics, accessibility naming,
  or duplicated helper functions
- test-runner, package dependency, bundler, or release-version changes
