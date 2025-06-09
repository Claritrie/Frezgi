![Banner Image](https://i.imgur.com/dlnsBR8.png)

# Frezgi

**Untangling Problems with Accessible Argument Mapping**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Live Demo](https://img.shields.io/badge/demo-live-green.svg)](https://frezgi.com)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](docs/CONTRIBUTING.md)

## Overview

Frezgi is a visual argument mapping tool that helps you map out complex arguments and decisions using an intuitive, interactive interface. Create argument tries with supporting, opposing, and exploring nodes to better understand problems and make informed choices.

![Preview](https://i.imgur.com/AEZWuXw.png)

### ✨ Features

- **Visual Argument Mapping**: Create interactive argument tries with drag-and-drop nodes
- **Multiple Node Types**: Support for supporting (👍), opposing (👎), and exploring (✋) arguments
- **Customizable Colors**: Personalize your argument maps with custom color schemes
- **No Registration Required**: Start mapping arguments immediately

### 🎯 Use Cases

- **Personal Decisions**: Career choices, major purchases, life changes
- **Business Planning**: Project evaluations, strategic decisions, risk assessment
- **Academic Research**: Argument analysis, thesis development, literature reviews
- **Team Collaboration**: Group decision-making, brainstorming sessions

## 🚀 Quick Start

### Online (Recommended)
Visit **[frezgi.com](https://frezgi.com)** to start using Frezgi immediately.

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Claritrie/Frezgi.git
   cd Frezgi
   ```

2. **Serve locally:**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server
   
   # PHP
   php -S localhost:8000
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000`

## 🎮 How to Use

1. **Start with the main resolution** - Double-click to edit the central question
2. **Add supporting arguments** - Hover over any node and click 👍
3. **Add opposing arguments** - Hover over any node and click 👎  
4. **Explore alternatives** - Hover over any node and click ✋
5. **Drag to organize** - Click and drag nodes to arrange your argument trie
6. **Customize colors** - Use the color panel (hover left edge) to personalize

## 🏗️ Project Structure

```
Frezgi/
├── index.html              # Main application
├── assets/                 # Compiled Vue.js application
│   ├── index-*.js         # Application logic
│   └── index-*.css        # Styles
├── docs/                   # Documentation
│   └── CONTRIBUTING.md     # Contribution guidelines
├── README.md              # This file
└── LICENSE                # MIT License
```

## 🛠️ Technology Stack

- **Frontend**: Vue.js 3 (compiled to vanilla JS)
- **Styling**: CSS3 with modern features
- **Deployment**: GitHub Pages
- **License**: MIT

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Whether you're fixing bugs, adding features, or improving documentation, your help makes Frezgi better.

### Quick Contribution Guide

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

📖 **Read the full [Contributing Guide](docs/CONTRIBUTING.md) for detailed instructions.**

### Types of Contributions Needed

- 🐛 **Bug fixes** - Help make Frezgi more reliable
- ✨ **New features** - Expand argument mapping capabilities  
- 📚 **Documentation** - Improve guides and examples
- 🎨 **UI/UX improvements** - Enhance user experience
- 🌍 **Accessibility** - Make Frezgi usable for everyone
- 🔧 **Performance** - Optimize for better speed

## 📋 Roadmap

- [ ] Toggle stance label names on lines
- [ ] Export to PNG
- [ ] Export to JSON/TRIE (rename as .trie file)
- [ ] Import from JSON/TRIE
- [ ] Local Storage (Preserve your arguments with browser storage)
- [ ] Undo/Redo functionality
- [ ] Offline web-app (Tauri port)
- [ ] Responsive Design (Works seamlessly on mobile devices too)
- [ ] Export to PDF
- [ ] Locking Mechanism
- [ ] Keyboard shortcuts
- [ ] Advanced templates
- [ ] Collaborative editing?

*See [Issues](https://github.com/Claritrie/Frezgi/issues) for detailed feature requests and bug reports.*

## 🐛 Bug Reports & Feature Requests

Found a bug or have an idea for improvement?

- 🐛 **Bug Report**: [Create a bug report](https://github.com/Claritrie/Frezgi/issues/new?template=bug_report.md)
- ✨ **Feature Request**: [Suggest a feature](https://github.com/Claritrie/Frezgi/issues/new?template=feature_request.md)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ **Use for any purpose** - Personal, commercial, educational
- ✅ **Modify and distribute** - Create your own versions
- ✅ **Include in proprietary software** - No copyleft restrictions
- ✅ **Sublicense** - Integrate into larger projects
- ⚠️ **Attribution required** - Must include copyright notice and license
- ⚠️ **No warranty** - Software provided "as is"

### Simple Summary:
You can do almost anything with this code, just keep the copyright notice and don't blame us if something goes wrong!

## 🙏 Acknowledgments

- Built with [Vue.js](https://vuejs.org/)
- Inspired by argument mapping methodologies
- Thanks to all [contributors](https://github.com/Claritrie/Frezgi/graphs/contributors)

## 📞 Support

- 📖 **Documentation**: Check the [docs](docs/) folder
- 💬 **Discussions**: Use GitHub Issues for questions
- 🐛 **Bug Reports**: Use the bug report template
- ✨ **Feature Requests**: Use the feature request template

---

**Made with ❤️ for better argument mapping and decision-making**

*Star ⭐ this repository if Frezgi helps you map better arguments!*

## Configuration Notes

### Asset Path Configuration

This project requires different asset path configurations depending on how you want to use it:

#### For GitHub Pages Deployment (Current Configuration)
The `index.html` file is currently configured for GitHub Pages deployment with absolute paths:

```html
<script type="module" crossorigin src="/assets/index-BywTncqB.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-BfVVlJSu.css">
```

#### For Local/Offline Use
If you want to run this project locally or offline, you need to modify the asset paths in `index.html` to use relative paths:

```html
<script type="module" crossorigin src="./assets/index-BywTncqB.js"></script>
<link rel="stylesheet" crossorigin href="./assets/index-BfVVlJSu.css">
```

### Switching Between Configurations
- **For deployment**: Use absolute paths (`/assets/`)
- **For local development**: Use relative paths (`./assets/`)
