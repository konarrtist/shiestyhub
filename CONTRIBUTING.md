# Contributing to Bunkerfy

Thank you for your interest in contributing to Bunkerfy! This document provides guidelines and information for contributors.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/bunkerfy/issues)
2. If not, create a new issue with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `feature request` label
3. Describe the feature and its benefits
4. Include mockups or examples if possible

### Pull Requests

1. Fork the repository
2. Create a feature branch from `main`
3. Make your changes following our coding standards
4. Write or update tests if applicable
5. Update documentation as needed
6. Submit a pull request

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/bunkerfy.git

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add user online status indicator
fix: resolve transaction timeout issue
docs: update README with new features
style: format code with prettier
refactor: simplify marketplace filtering
```

## Questions?

Feel free to open an issue for any questions about contributing.

Thank you for helping make Bunkerfy better!
