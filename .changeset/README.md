# Changesets

This folder holds pending release notes managed by [Changesets](https://changesets.dev).

## Adding a changeset

Run this in any PR that changes user-facing behavior of a released package:

```bash
pnpm changeset
```

Pick the packages, the bump type and write one line for the changelog. Commit the
generated file with your PR. Refactors, tests and internal tooling do not need one.

## Released packages

| Package | Published to |
| --- | --- |
| `vite-plugin-react-vitrine` | npm |
| `vitrine` | VS Code Marketplace, as a VSIX |

Examples, fixtures, compatibility lanes and private `@vitrine/*` packages are not
released.

## Versioning

Both packages follow [Semantic Versioning](https://semver.org). While they are on `0.x`:

| Change | Bump |
| --- | --- |
| Breaking change | minor (`0.1.0` -> `0.2.0`) |
| New feature or bug fix | patch (`0.1.0` -> `0.1.1`) |

`1.0.0` is released once the `@preview` syntax, `preview()` options and plugin options
are considered stable.

## Releasing

Merging to `main` updates a "Version Packages" PR that applies pending changesets.
Merging that PR publishes the npm package and tags both packages.
