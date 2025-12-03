  <p align="center">
    <img width="500" height="500" alt="Askimo" 
  src="https://github.com/user-attachments/assets/8bcd011c-5336-4a6f-9433-0af00669203f" />
  </p>

# Askimo

A CLI tool for communicating with AI providers.

**Supported providers:** Perplexity · OpenAI · Anthropic

---

## 📦 Installation

```bash
npm install -g askimo
```

## ⚙️ Configuration

Create a config file at `~/.askimo/config`:

```bash
# API Keys (at least one required)
PERPLEXITY_API_KEY=your-perplexity-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key

# Optional settings
DEFAULT_PROVIDER=perplexity
PERPLEXITY_MODEL=sonar
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-sonnet-4-20250514
```

---

## 🚀 Usage

### Quick question

```bash
askimo "What is the capital of France?"
```

### Choose a provider

| Flag | Provider |
|------|----------|
| `-p` | Perplexity (default) |
| `-o` | OpenAI |
| `-a` | Anthropic |

```bash
askimo "explain quantum computing" -o    # Use OpenAI
askimo "write a haiku" -a                # Use Anthropic
```

### Continue a conversation

```bash
askimo "tell me more" -c 1     # Continue last conversation
askimo "go deeper" -c 2        # Continue second-to-last
```

### JSON output

```bash
askimo "question" --json
```

### Interactive chat

```bash
askimo chat                # Start new chat
askimo chat -o             # Chat with OpenAI
askimo chat -c 1           # Continue last conversation
```

Type `exit` or `Ctrl+C` to quit.

### List models

```bash
askimo models              # All providers
askimo models -p           # Perplexity only
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| Streaming | Real-time response output |
| Citations | Source links with Perplexity |
| History | Conversations saved to `~/.askimo/conversations/` |
| Multi-provider | Switch between AI providers easily |

---

## 🛠️ Development

```bash
npm install
npm test
npm run lint
```

---

## 📄 License

Apache-2.0
