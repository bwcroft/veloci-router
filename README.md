# nodejs-toolkit

Welcome to **nodejs-toolkit**, a modern monorepo designed to house a collection of Node.js packages in one place. This repository serves as the central hub for maintaining, upgrading, and evolving reusable packages with ease and consistency.

---

## Purpose

The primary goals of **nodejs-toolkit** are to:

- **Centralize package development:** Keep related Node.js utilities, helpers, and libraries together in a single monorepo.
- **Streamline maintenance:** Simplify upgrades for shared dependencies like linters, testing frameworks, and build tools by managing them in one place.
- **Enforce modern standards:** Push forward beyond CommonJS and fully embrace ECMAScript Modules (ESM) as the new standard for all packages.
- **Ensure consistency:** Guarantee all packages adhere to the same coding style, linting rules, and testing approach.

---

## Why a Monorepo?

Managing multiple packages across separate repositories can become a challenge—version mismatches, inconsistent configurations, and duplicated efforts slow down development and upgrades. By consolidating everything into a monorepo, **nodejs-toolkit** provides:

- **Unified dependency management:** Shared devDependencies and configurations.
- **Cross-package collaboration:** Easier to develop packages that depend on one another.
- **Simplified CI/CD:** Single pipeline to build, test, and publish.
- **Consistent developer experience:** One setup, one set of rules for all projects.

---

## Embracing ESM (ECMAScript Modules)

This monorepo is fully committed to modern JavaScript standards. As such:

- All packages use **ESM syntax** (`import` / `export`) exclusively.
- The repository's tooling and build processes are optimized around ESM.
- No CommonJS (`require` / `module.exports`) is used, ensuring forward compatibility and leveraging the full benefits of the module system native to Node.js and browsers.
- This approach encourages writing cleaner, more maintainable, and future-proof code.

---

## Included Packages

*(This section can be updated as packages are added)*

- Example package — Description of what the package does.
- Another package — Description here.

---

## Getting Started

1. Clone the repository.
2. Run `pnpm install` (or the preferred package manager) at the root to install dependencies.
3. Use workspace commands to build, test, and develop packages.
4. All packages are ESM-ready, so import them using `import` syntax.

---

## Contribution

Contributions and suggestions are welcome. Please open issues or pull requests to help improve the toolkit!

---

## License

MIT License

---

Thank you for using **nodejs-toolkit** — a step forward into the future of Node.js development!
