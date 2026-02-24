let currentPage = 1
// biome-ignore lint/correctness/noUndeclaredVariables: global set by prior <script> tag in HTML
const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE)

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

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

function renderMessages(messages) {
  return messages
    .map(
      (msg) => `
    <div class="message ${msg.role}">
      <div class="message-role">${msg.role === 'user' ? 'You' : 'Assistant'}</div>
      <div class="message-content">${escapeHtml(msg.content)}</div>
    </div>
  `
    )
    .join('')
}

function renderPage(page) {
  currentPage = page
  const container = document.getElementById('conversations-container')
  // biome-ignore lint/correctness/noUndeclaredVariables: global set by prior <script> tag in HTML
  const start = (page - 1) * ITEMS_PER_PAGE
  // biome-ignore lint/correctness/noUndeclaredVariables: global set by prior <script> tag in HTML
  const end = Math.min(start + ITEMS_PER_PAGE, conversations.length)
  // biome-ignore lint/correctness/noUndeclaredVariables: global set by prior <script> tag in HTML
  const pageConversations = conversations.slice(start, end)

  // biome-ignore lint/correctness/noUndeclaredVariables: global set by prior <script> tag in HTML
  if (conversations.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <p>No conversations found.</p>
        <p>Start a conversation with: <code>askimo "your question"</code></p>
      </div>
    `
    return
  }

  const rows = pageConversations
    .map((conv, idx) => {
      const globalIndex = start + idx
      return `
      <tr class="conversation-row" data-index="${globalIndex}">
        <td class="id">
          <span class="id-text">${escapeHtml(conv.id)}</span>
          <button class="copy-btn" data-id="${escapeHtml(conv.id)}" title="Copy ID">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </td>
        <td class="provider">${escapeHtml(conv.provider)}</td>
        <td class="model">${escapeHtml(conv.model)}</td>
        <td class="date">${formatDate(conv.createdAt)}</td>
        <td class="messages">${conv.messageCount}</td>
        <td class="preview">${escapeHtml(conv.preview)}</td>
      </tr>
      <tr class="conversation-detail" data-index="${globalIndex}">
        <td colspan="6">
          <div class="detail-content">
            ${renderMessages(conv.messages)}
          </div>
        </td>
      </tr>
    `
    })
    .join('')

  const pagination =
    totalPages > 1
      ? `
    <div class="pagination">
      <button class="page-btn" onclick="renderPage(1)" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="11 17 6 12 11 7"></polyline>
          <polyline points="18 17 13 12 18 7"></polyline>
        </svg>
      </button>
      <button class="page-btn" onclick="renderPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <span class="page-info">Page ${currentPage} of ${totalPages}</span>
      <button class="page-btn" onclick="renderPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <button class="page-btn" onclick="renderPage(${totalPages})" ${currentPage === totalPages ? 'disabled' : ''}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="13 17 18 12 13 7"></polyline>
          <polyline points="6 17 11 12 6 7"></polyline>
        </svg>
      </button>
    </div>
  `
      : ''

  container.innerHTML = `
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
        ${rows}
      </tbody>
    </table>
    ${pagination}
  `

  attachEventListeners()
}

function attachEventListeners() {
  // Accordion behavior
  document.querySelectorAll('.conversation-row').forEach((row) => {
    row.addEventListener('click', (e) => {
      if (e.target.closest('.copy-btn')) return

      const index = row.dataset.index
      const detailRow = document.querySelector(`.conversation-detail[data-index="${index}"]`)
      const isExpanded = row.classList.contains('expanded')

      document.querySelectorAll('.conversation-row.expanded').forEach((r) => {
        r.classList.remove('expanded')
      })
      document.querySelectorAll('.conversation-detail.expanded').forEach((d) => {
        d.classList.remove('expanded')
      })

      if (!isExpanded) {
        row.classList.add('expanded')
        detailRow.classList.add('expanded')
      }
    })
  })

  // Copy button functionality
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation()
      const id = btn.dataset.id

      try {
        await navigator.clipboard.writeText(id)
        btn.classList.add('copied')
        btn.innerHTML =
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>'

        setTimeout(() => {
          btn.classList.remove('copied')
          btn.innerHTML =
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
        }, 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    })
  })
}

// Initial render
renderPage(1)
