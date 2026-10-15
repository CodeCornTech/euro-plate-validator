# Changelog

Notable changes to **@codecorn/euro-plate-validator**. See also [GitHub releases](https://github.com/CodeCornTech/euro-plate-validator/releases).

## Upcoming release — publication pending

### 1.0.16

> Prepared in [PR #3](https://github.com/CodeCornTech/euro-plate-validator/pull/3). The GitHub release and npm publication are deferred until after the merge into `main`.

#### Added

- **Moldova (`MD`)** added to the country codes, names, flag lookups and default multi-country validation (30 supported countries total).
- Seven Moldovan plate variants proposed in [issue #2](https://github.com/CodeCornTech/euro-plate-validator/issues/2):
  - Current standard: `ABC 123`
  - Historical four-letter: `AB CD 123`
  - Chișinău (C): `C AB 123`
  - Chișinău (K): `K AB 123`
  - Diplomatic: `CD 123 AB`
  - Police (MAI): `MAI 1234`
  - Transnistria: `T 123 AB`
- Moldova display formats and Inputmask alternatives, with IT/EN country labels in the browser client.
- Matching Moldova regex patterns in the standalone PHP validator.
- Positive, negative and randomized Moldova test coverage; dedicated GitHub Actions regression step.
- English and Italian README documentation with format examples and an API usage snippet.

#### Fixed

- Preserve Inputmask alternative-mask arrays when normalizing mask patterns, instead of converting them to a comma-separated string.
- Add a TypeScript overload for `string | string[]` in the browser mask normalizer.

#### Notes

- This package validates **syntax only**, not actual registration, plate authenticity or legal recognition of regional plates.
- Lowercase input and valid compact forms without spaces are supported; hyphens are not accepted by the Moldova formats.
- Multiple country matches are possible in AUTO mode when patterns overlap.
- No Moldova motorcycle-specific format or new runtime dependency was added.

## Previous version highlights

### 1.0.15

- Improved Inputmask merging while retaining default definitions.
- Added uppercase-normalizing `L` letter token and safer restricted-letter masks.
- Improved placeholder derivation, mask application during country switching and client logging.

### 1.0.14

- See [GitHub release v1.0.14](https://github.com/CodeCornTech/euro-plate-validator/releases/tag/v1.0.14).

### 1.0.13

- Configurable inline, block or hidden validation status, with icon and text options.
- Improved handling of empty/partial input and country changes.

### 1.0.12

- Introduced `autoFocusOnInit` and `preserveInputAttrs`.
- Standardized `epv__*` CSS classes and updated Inputmask autoload and localization behavior.
