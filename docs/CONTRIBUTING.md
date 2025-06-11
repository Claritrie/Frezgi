# Contributing to Frezgi

Thank you for your interest in contributing to Frezgi! We welcome contributions from everyone.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally: `git clone https://github.com/YOUR-USERNAME/Frezgi.git`
3. Create a new branch for your feature or bug fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites
- A modern web browser
- A text editor or IDE
- Git for version control
- Node LTS v22.16.0


### Local Development
Since Frezgi is a static Vue.js application:

1. Clone the repository:
   ```bash
   git clone https://github.com/Claritrie/Frezgi.git
   cd Frezgi
   ```

2. Open `index.html` in your browser or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000

   # Node.js
   npx http-server

   # PHP
   php -S localhost:8000
   ```

3. Navigate to `http://localhost:8000` to see the application


### Developer Setup

- install dependencies `npm ci` **NB** If you have a Macbook with the M Chip set please run the following script after installation `npm run mac-arm:setup`,
- install system specific libraries for playwright with `npm run playwright-setup`
- create an `.env` in the `Vue` directory and copy the values from .env.template. You can use `https://www.frezgi.com` as the URL if you wish
- run the dev server while watching for changes for `npm run dev`
- run tests with `npm run test`

> Note: A _run_tests.sh has been provided to automate this setup but that's up to you. If you don't care about your current envs, use `echo -e "y\ny" | sh _run_tests.sh` (answering yes to both prompts) **at your own risk**.

### File Structure
```
Frezgi/
├── index.html          # Main application file
├── assets/
│   ├── index-*.js      # Compiled Vue.js application
│   └── index-*.css     # Compiled styles
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

## How to Contribute

### Branch Naming Convention
Use descriptive branch names:
- `feature/add-export-functionality`
- `fix/node-dragging-bug`
- `docs/update-readme`
- `refactor/simplify-color-system`

### Workflow (GitHub Flow)
We use **GitHub Flow** - a simple, branch-based workflow that's perfect for open source projects:

#### Why GitHub Flow?
- **Simple**: Only one main branch + feature branches
- **Fast**: No complex branch hierarchies to navigate
- **Contributor-friendly**: Easy for new contributors to understand
- **Continuous deployment**: Perfect for web applications like Frezgi
- **Industry standard**: Used by most successful open source projects

#### The Process:
1. **Create a branch** from `main` for your feature/fix
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make commits** with clear, descriptive messages
   ```bash
   git add .
   git commit -m "Add export functionality for argument tries"
   ```

3. **Push and open a Pull Request** early for discussion
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Iterate** based on feedback and reviews

5. **Merge** when approved and all checks pass

#### Branch Protection
- `main` branch is protected and always deployable
- **Only project admins/maintainers can commit directly to `main`**
- **All contributors must use Pull Requests** - no exceptions
- At least one review required before merging
- No direct pushes to `main` allowed for contributors
- Automated checks must pass before merging

### Types of Contributions

#### 🐛 Bug Fixes
- Fix existing functionality that isn't working as expected
- Include steps to reproduce the bug in your PR description

#### ✨ New Features
- Add new functionality to the decision-making tool
- Consider user experience and accessibility
- Update documentation if needed

#### 📚 Documentation
- Improve README, code comments, or other documentation
- Help make the project more accessible to new contributors

#### 🎨 UI/UX Improvements
- Enhance the visual design or user experience
- Ensure changes work across different browsers
- Consider accessibility guidelines

#### 🔧 Refactoring
- Improve code structure without changing functionality
- Optimize performance
- Simplify complex code

## Pull Request Process

### Before Submitting
- [ ] Test your changes in multiple browsers
- [ ] Ensure the application still works as expected
- [ ] Check that your code follows the project's style
- [ ] Update documentation if necessary

### PR Requirements
1. **Clear title** describing the change
2. **Detailed description** explaining:
   - What changes you made
   - Why you made them
   - How to test them
3. **Screenshots** for UI changes
4. **Link related issues** using `Fixes #123` or `Closes #123`

### Review Process
- All PRs require at least one review
- Maintainers may request changes
- Once approved, maintainers will merge your PR
- Your contribution will be acknowledged in the project

## Coding Standards

### HTML/CSS
- Use semantic HTML elements
- Follow consistent indentation (2 spaces)
- Use meaningful class names
- Ensure responsive design

### JavaScript/Vue.js
- Use clear, descriptive variable names
- Add comments for complex logic
- Follow Vue.js best practices
- Ensure accessibility (ARIA labels, keyboard navigation)

### Commit Messages
Write clear commit messages:
```
Add export functionality for argument tries

- Implement JSON export feature
- Add export button to UI
- Include timestamp in exported data

Fixes #42
```

## Reporting Issues

### Bug Reports
Use the bug report template and include:
- Steps to reproduce
- Expected vs actual behavior
- Browser and version
- Screenshots if applicable

### Feature Requests
Use the feature request template and include:
- Clear description of the feature
- Use case or problem it solves
- Possible implementation ideas

### Questions
For questions about using Frezgi:
- Check existing issues first
- Use GitHub Discussions if available
- Be specific about what you're trying to achieve

## Recognition

Contributors will be:
- Listed in the project's contributors
- Acknowledged in release notes for significant contributions
- Invited to join the project as a maintainer for ongoing contributions

## Getting Help

- Create an issue for bugs or feature requests
- Ask questions in pull request discussions
- Reach out to maintainers for guidance

## License

By contributing to Frezgi, you agree that your contributions will be licensed under the same GPL 3.0 License that covers the project.

---

Thank you for contributing to Frezgi! 🎉
