# Documentation Publishing Usage

## Quick Start

```bash
# Live publishing (production)
npm run docs:publish

# Dry-run (simulation only)
npm run docs:publish -- --dry-run
npm run docs:publish -- -d

# Interactive mode (step through each page)
npm run docs:publish -- --interactive
npm run docs:publish -- -i

# Dry-run + Interactive (safe testing)
npm run docs:publish -- --dry-run --interactive
npm run docs:publish -- -d -i
```

## Command Line Options

| Flag            | Short | Description                                  |
| --------------- | ----- | -------------------------------------------- |
| `--dry-run`     | `-d`  | Simulate publishing without making changes   |
| `--interactive` | `-i`  | Step through each page for review            |
| `--key=API_KEY` |       | Override README_API_KEY environment variable |

## Examples

### Production Publishing

```bash
# Publish all docs to ReadMe (live)
npm run docs:publish
```

### Testing & Validation

```bash
# Test what would be published (safe)
npm run docs:publish -- --dry-run

# Interactive review of what would be published
npm run docs:publish -- --dry-run --interactive
```

### Development & Debugging

```bash
# Interactive mode for selective publishing
npm run docs:publish -- --interactive

# Use custom API key
npm run docs:publish -- --key=your_api_key_here
```

## Environment Variables

- `README_API_KEY`: Your ReadMe API key (required)
- Can be set in `.env` file or passed via `--key` flag

## Automatic Cleanup

The `docs:publish` command automatically cleans up temporary files after completion. No manual cleanup required.

## GitHub Actions Integration

The workflow automatically uses:

- **PRs & Main Branch**: Dry-run validation only
- **NPM Releases**: Automatic live publishing
- **Manual Workflow**: Configurable via `dry_run` input
