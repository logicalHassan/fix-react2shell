# audit-react2shell

**audit-react2shell** is a high-performance CLI security auditor designed
to secure the front-end ecosystem. It recursively scans your local
machine or your entire GitHub organization to identify and auto-patch
critical Next.js and React vulnerabilities (including the December 2025
Flight protocol exploits).

## Key Features

-   **Fleet-Wide Scanning**: Scan hundreds of projects across your
    entire hard drive in seconds.
-   **Zero-Clone GitHub Audit**: Audit remote repositories via the
    GitHub API without downloading a single byte of source code.
-   **Interactive Patching**: Selectively update vulnerable projects to
    safe, verified versions using your preferred package manager (npm or
    yarn).
-   **Monorepo Support**: Automatically detects individual
    `package.json` files within complex directory structures.

## Installation

Since this is an open-source tool, you can run it directly via `npx` or
install it globally:

``` bash
# Run without installing
npx audit-react2shell

# Or install globally
npm install -g audit-react2shell
```

## Usage

### 1. Local Audit (Default)

Scan your current directory (and all sub-directories) for vulnerable
Next.js versions:

``` bash
audit-react2shell scan
```

Target a specific directory:

``` bash
audit-react2shell scan ~/path/to/projects
```

### 2. Auto-Patch Mode

Find vulnerabilities and enter an interactive menu to fix them
immediately. This command updates your `package.json` and lock files to
the safest available version.

``` bash
audit-react2shell scan --fix
```

### 3. GitHub Cloud Audit

Audit your entire GitHub profile or a specific organization. Requires a
GitHub Personal Access Token (PAT) with repo read permissions.

``` bash
# Audit your personal repositories
audit-react2shell github

# Audit a specific organization
audit-react2shell github --org your-org-name
```

## How it Works

The tool compares your `package.json` dependencies against a hardcoded
map of known vulnerable ranges and their corresponding safe patches:

| Current Version Range | Recommended Safe Version |
| :--- | :--- |
| `13.3.0` to `14.2.x` | **14.2.35** |
| `15.0.x` | **15.0.7** |
| `15.1.x` | **15.1.11** |
| `15.2.x` | **15.2.8** |
| `15.3.x` | **15.3.8** |
| `15.4.x` | **15.4.10** |
| `15.5.x` | **15.5.9** |
| `16.0.x` | **16.0.10** |
| `Canary` | **15.6.0-canary.60** |

## Security & Privacy

-   **Local Data**: No project data or source code is uploaded to any
    server.
-   **GitHub Tokens**: Used only for the current session and never
    stored on disk.
-   **Safe Patching**: Uses exact version locking (`--save-exact` /
    `--exact`) to ensure verified safe versions.

## Configuration (For Developers)

Project structure:

``` plaintext
audit-react2shell/
├── bin/
│   └── index.js       # CLI Command Definitions
├── lib/
│   ├── scanner.js     # Recursive File System Logic
│   ├── auditor.js     # Version Validation & Logic
│   ├── github.js      # API Integration
│   └── patcher.js     # Dependency Update Engine
└── package.json
```

## 🤝 Contributing

1.  Fork the repository.
2.  Update `NEXT_RULES` in `lib/auditor.js` as new CVEs are released.
3.  Submit a Pull Request.

Built for the community by developers who care about a secure web.