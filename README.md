  <p align="center">
    <img width="400" height="400" alt="Askimo" 
  src="https://github.com/user-attachments/assets/cbf2ab5d-5a07-45a2-9109-6a7bc22ea878" />
  </p>

# Askimo

A CLI tool for communicating with AI providers.

**Supported providers:** Perplexity · OpenAI · Anthropic · xAI (Grok)

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
XAI_API_KEY=your-xai-key

# Optional settings
DEFAULT_PROVIDER=perplexity
PERPLEXITY_MODEL=sonar
OPENAI_MODEL=gpt-4o
ANTHROPIC_MODEL=claude-sonnet-4-20250514
XAI_MODEL=grok-4
```

---

## 🚀 Usage

### Quick question

```bash
askimo "What is the capital of France?"
```

### Choose a provider

| Flag | Provider             |
|------|----------------------|
| `-p` | Perplexity (default) |
| `-o` | OpenAI               |
| `-a` | Anthropic            |
| `-x` | xAI (Grok)           |

```bash
askimo "explain quantum computing" -o    # Use OpenAI
askimo "write a haiku" -a                # Use Anthropic
askimo "what's happening today?" -x      # Use xAI Grok
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

### Pipe content

```bash
cat code.js | askimo "explain this code"
echo "hello world" | askimo "translate to French"
```

### Read from file

```bash
askimo -f code.js "what does this do"
askimo -f error.log "find the bug"
```

### Interactive chat

```bash
askimo chat                # Start new chat
askimo chat -o             # Chat with OpenAI
askimo chat -x             # Chat with xAI Grok
askimo chat -c 1           # Continue last conversation
```

Type `exit` or `Ctrl+C` to quit.

### List models

```bash
askimo models              # All providers
askimo models -p           # Perplexity only
askimo models -x           # xAI only
```

---

## ✨ Features

| Feature        | Description                                       |
|----------------|---------------------------------------------------|
| Streaming      | Real-time response output                         |
| Piping         | Pipe content via stdin                            |
| File input     | Read content from files with `-f`                 |
| Citations      | Source links with Perplexity                      |
| History        | Conversations saved to `~/.askimo/conversations/` |
| Multi-provider | Switch between AI providers easily                |

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
