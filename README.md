# Askimo

A CLI tool for communicating with AI providers (Perplexity, OpenAI, Anthropic).

## Installation

```bash
npm install -g .
```

## Configuration

Create a config file at `~/.askimo/config`:

```
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

## Usage

### Ask a single question

```bash
askimo "What is the capital of France?"
```

The `ask` command is the default, so you can omit it:

```bash
askimo ask "What is the capital of France?"
```

### Provider flags

```bash
askimo "question" -p    # Use Perplexity (default)
askimo "question" -o    # Use OpenAI
askimo "question" -a    # Use Anthropic
```

### Continue a conversation

```bash
askimo "follow up question" -c 1    # Continue last conversation
askimo "follow up question" -c 2    # Continue second-to-last
```

### JSON output

```bash
askimo "question" --json
```

Returns structured JSON with provider, model, question, response, and sources (for Perplexity).

### Interactive chat

```bash
askimo chat
askimo chat -o              # Chat with OpenAI
askimo chat -c 1            # Continue last conversation
```

Type `exit` or press `Ctrl+C` to quit.

### List available models

```bash
askimo models               # List all providers
askimo models -p            # Perplexity only
askimo models -o            # OpenAI only
askimo models -a            # Anthropic only
```

## Features

- Streaming responses
- Conversation history (saved to `~/.askimo/conversations/`)
- Source citations (Perplexity)
- Multiple AI providers
- Configurable default models

## Development

```bash
npm install
npm test
npm run lint
```

## License

Apache-2.0
