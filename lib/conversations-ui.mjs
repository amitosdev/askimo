import hcat from 'hcat'
import { getAllConversations } from './conversation.mjs'

function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPreview(messages, maxLength = 100) {
  const firstUserMessage = messages.find((m) => m.role === 'user')
  if (!firstUserMessage) return 'No messages'

  const content = firstUserMessage.content
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength) + '...'
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const ITEMS_PER_PAGE = 20

function generateHtml(conversations) {
  // Prepare conversation data for client-side rendering
  const conversationsJson = JSON.stringify(
    conversations.map((conv) => ({
      id: conv.id,
      provider: conv.provider,
      model: conv.model,
      createdAt: conv.createdAt,
      messageCount: conv.messages.length,
      preview: getPreview(conv.messages),
      messages: conv.messages
    }))
  )

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Askimo Conversations</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      color: #e0e0e0;
      padding: 2rem;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #888;
      font-size: 1rem;
    }

    .stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .stat {
      background: rgba(255, 255, 255, 0.05);
      padding: 1rem 2rem;
      border-radius: 8px;
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #4fc3f7;
    }

    .stat-label {
      font-size: 0.85rem;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }

    th {
      background: rgba(79, 195, 247, 0.1);
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #4fc3f7;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }

    td {
      padding: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .conversation-row {
      cursor: pointer;
      transition: background 0.2s;
    }

    .conversation-row:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    .conversation-row.expanded {
      background: rgba(79, 195, 247, 0.1);
    }

    .conversation-detail {
      display: none;
    }

    .conversation-detail.expanded {
      display: table-row;
    }

    .conversation-detail td {
      padding: 0;
      background: rgba(0, 0, 0, 0.2);
    }

    .detail-content {
      padding: 1.5rem;
      max-height: 500px;
      overflow-y: auto;
    }

    .message {
      margin-bottom: 1rem;
      padding: 1rem;
      border-radius: 8px;
    }

    .message:last-child {
      margin-bottom: 0;
    }

    .message.user {
      background: rgba(79, 195, 247, 0.1);
      border-left: 3px solid #4fc3f7;
    }

    .message.assistant {
      background: rgba(129, 199, 132, 0.1);
      border-left: 3px solid #81c784;
    }

    .message-role {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
      color: #888;
    }

    .message.user .message-role {
      color: #4fc3f7;
    }

    .message.assistant .message-role {
      color: #81c784;
    }

    .message-content {
      white-space: pre-wrap;
      word-break: break-word;
      line-height: 1.6;
    }

    .id {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.85rem;
      color: #81c784;
    }

    .id-text {
      margin-right: 0.5rem;
    }

    .copy-btn {
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
      vertical-align: middle;
    }

    .copy-btn:hover {
      color: #4fc3f7;
      background: rgba(79, 195, 247, 0.1);
    }

    .copy-btn.copied {
      color: #81c784;
    }

    .provider {
      text-transform: capitalize;
      font-weight: 500;
    }

    .model {
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
      font-size: 0.85rem;
      color: #ffb74d;
    }

    .date {
      color: #888;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .messages {
      text-align: center;
      font-weight: 600;
    }

    .preview {
      color: #aaa;
      font-size: 0.9rem;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .empty {
      text-align: center;
      padding: 4rem;
      color: #666;
    }

    .usage {
      margin-top: 2rem;
      text-align: center;
      color: #666;
      font-size: 0.9rem;
    }

    code {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Courier New', monospace;
    }

    /* Pagination */
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      margin-top: 1.5rem;
      padding: 1rem;
    }

    .page-btn {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e0e0e0;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .page-btn:hover:not(:disabled) {
      background: rgba(79, 195, 247, 0.2);
      border-color: rgba(79, 195, 247, 0.3);
      color: #4fc3f7;
    }

    .page-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .page-info {
      color: #888;
      font-size: 0.9rem;
      padding: 0 1rem;
    }

    /* Scrollbar styling */
    .detail-content::-webkit-scrollbar {
      width: 8px;
    }

    .detail-content::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
    }

    .detail-content::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }

    .detail-content::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Askimo Conversations</h1>
      <p class="subtitle">Your AI conversation history</p>
    </header>

    <div class="stats">
      <div class="stat">
        <div class="stat-value">${conversations.length}</div>
        <div class="stat-label">Conversations</div>
      </div>
      <div class="stat">
        <div class="stat-value">${conversations.reduce((sum, c) => sum + c.messages.length, 0)}</div>
        <div class="stat-label">Total Messages</div>
      </div>
    </div>

    <div id="conversations-container">
      <!-- Rendered by JavaScript -->
    </div>

    <div class="usage">
      <p>Continue a conversation: <code>askimo --cid &lt;ID&gt; "your follow-up"</code></p>
    </div>
  </div>

  <script>
    const conversations = ${conversationsJson};
    const ITEMS_PER_PAGE = ${ITEMS_PER_PAGE};
    let currentPage = 1;
    const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE);

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }

    function formatDate(isoString) {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    function renderMessages(messages) {
      return messages.map(msg => \`
        <div class="message \${msg.role}">
          <div class="message-role">\${msg.role === 'user' ? 'You' : 'Assistant'}</div>
          <div class="message-content">\${escapeHtml(msg.content)}</div>
        </div>
      \`).join('');
    }

    function renderPage(page) {
      currentPage = page;
      const container = document.getElementById('conversations-container');
      const start = (page - 1) * ITEMS_PER_PAGE;
      const end = Math.min(start + ITEMS_PER_PAGE, conversations.length);
      const pageConversations = conversations.slice(start, end);

      if (conversations.length === 0) {
        container.innerHTML = \`
          <div class="empty">
            <p>No conversations found.</p>
            <p>Start a conversation with: <code>askimo "your question"</code></p>
          </div>
        \`;
        return;
      }

      const rows = pageConversations.map((conv, idx) => {
        const globalIndex = start + idx;
        return \`
          <tr class="conversation-row" data-index="\${globalIndex}">
            <td class="id">
              <span class="id-text">\${escapeHtml(conv.id)}</span>
              <button class="copy-btn" data-id="\${escapeHtml(conv.id)}" title="Copy ID">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
            </td>
            <td class="provider">\${escapeHtml(conv.provider)}</td>
            <td class="model">\${escapeHtml(conv.model)}</td>
            <td class="date">\${formatDate(conv.createdAt)}</td>
            <td class="messages">\${conv.messageCount}</td>
            <td class="preview">\${escapeHtml(conv.preview)}</td>
          </tr>
          <tr class="conversation-detail" data-index="\${globalIndex}">
            <td colspan="6">
              <div class="detail-content">
                \${renderMessages(conv.messages)}
              </div>
            </td>
          </tr>
        \`;
      }).join('');

      const pagination = totalPages > 1 ? \`
        <div class="pagination">
          <button class="page-btn" onclick="renderPage(1)" \${currentPage === 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
          </button>
          <button class="page-btn" onclick="renderPage(\${currentPage - 1})" \${currentPage === 1 ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span class="page-info">Page \${currentPage} of \${totalPages}</span>
          <button class="page-btn" onclick="renderPage(\${currentPage + 1})" \${currentPage === totalPages ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <button class="page-btn" onclick="renderPage(\${totalPages})" \${currentPage === totalPages ? 'disabled' : ''}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
        </div>
      \` : '';

      container.innerHTML = \`
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Provider</th>
              <th>Model</th>
              <th>Date</th>
              <th>Messages</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            \${rows}
          </tbody>
        </table>
        \${pagination}
      \`;

      attachEventListeners();
    }

    function attachEventListeners() {
      // Accordion behavior
      document.querySelectorAll('.conversation-row').forEach(row => {
        row.addEventListener('click', (e) => {
          if (e.target.closest('.copy-btn')) return;

          const index = row.dataset.index;
          const detailRow = document.querySelector('.conversation-detail[data-index="' + index + '"]');
          const isExpanded = row.classList.contains('expanded');

          document.querySelectorAll('.conversation-row.expanded').forEach(r => r.classList.remove('expanded'));
          document.querySelectorAll('.conversation-detail.expanded').forEach(d => d.classList.remove('expanded'));

          if (!isExpanded) {
            row.classList.add('expanded');
            detailRow.classList.add('expanded');
          }
        });
      });

      // Copy button functionality
      document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;

          try {
            await navigator.clipboard.writeText(id);
            btn.classList.add('copied');
            btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';

            setTimeout(() => {
              btn.classList.remove('copied');
              btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
            }, 2000);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
      });
    }

    // Initial render
    renderPage(1);
  </script>
</body>
</html>`
}

async function showConversationsInBrowser() {
  const conversations = await getAllConversations()
  const html = generateHtml(conversations)

  console.log('Opening conversations in browser...')
  hcat(html, { port: 0 })
}

export { showConversationsInBrowser, generateHtml }
