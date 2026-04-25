import { escapeHtml, loadNewsFromFirestore, newsFilterOptions, sortNewsItems } from '../shared/news-store.js';

function renderTeaserList(items) {
  const teaserList = document.querySelector('[data-news-teaser-list]');
  if (!teaserList) return;

  const teaserItems = items.slice(0, 4);
  teaserList.innerHTML = teaserItems.map((item) => `
    <article class="news-card news-list-item" data-news-card data-category="${escapeHtml(item.category)}" data-news-id="${escapeHtml(item.id)}">
      <span>${escapeHtml(item.category)}</span>
      <h3>${escapeHtml(item.title)}</h3>
      <time datetime="${escapeHtml(item.date)}">${escapeHtml(item.date)}</time>
    </article>
  `).join('');
}

function renderNewsCards(list, items) {
  list.innerHTML = items.map((item) => `
    <article class="news-card" data-news-card data-category="${escapeHtml(item.category)}" data-news-id="${escapeHtml(item.id)}">
      <div class="news-card-title">
        <span>${escapeHtml(item.category)}</span>
        <h2>${escapeHtml(item.title)}</h2>
      </div>
      <time datetime="${escapeHtml(item.date)}">${escapeHtml(item.date)}</time>
    </article>
  `).join('');
}

function ensureFilterTabs(tabs) {
  if (!tabs || tabs.children.length) return;

  tabs.innerHTML = newsFilterOptions.map((category, index) => `
    <button
      type="button"
      role="tab"
      aria-selected="${index === 0 ? 'true' : 'false'}"
      class="${index === 0 ? 'is-active' : ''}"
      data-filter="${category}"
    >
      ${category}
    </button>
  `).join('');
}

export async function initNewsPage() {
  const result = await loadNewsFromFirestore();
  const items = sortNewsItems(result.items);

  renderTeaserList(items);

  const tabs = Array.from(document.querySelectorAll('[data-news-tabs] button'));
  const tabsContainer = document.querySelector('[data-news-tabs]');
  const indexView = document.querySelector('[data-news-index]');
  const detailView = document.querySelector('[data-news-detail]');
  const detailBack = document.querySelector('[data-news-detail-back]');
  const detailCategory = document.querySelector('[data-news-detail-category]');
  const detailTitle = document.querySelector('[data-news-detail-title]');
  const detailDate = document.querySelector('[data-news-detail-date]');
  const detailBody = document.querySelector('[data-news-detail-body]');
  const list = document.querySelector('[data-news-list]');
  const pager = document.querySelector('[data-news-pager]');

  if (tabsContainer) ensureFilterTabs(tabsContainer);
  const allTabs = Array.from(document.querySelectorAll('[data-news-tabs] button'));

  if (!list || !pager) return;

  renderNewsCards(list, items);

  const cards = Array.from(list.querySelectorAll('[data-news-card]'));
  const itemsById = new Map(items.map((item) => [item.id, item]));
  const prevButton = pager.querySelector('[data-news-page="prev"]');
  const nextButton = pager.querySelector('[data-news-page="next"]');
  const status = pager.querySelector('[data-news-page-status]');
  const pageSize = Math.max(1, Number(pager.dataset.pageSize) || 4);
  const state = {
    filter: allTabs.find((tab) => tab.classList.contains('is-active'))?.dataset.filter || '全部',
    page: 1
  };

  function matchingCards() {
    return cards.filter((card) => state.filter === '全部' || card.dataset.category === state.filter);
  }

  function renderNewsPage() {
    const visibleCards = matchingCards();
    const totalPages = Math.max(1, Math.ceil(visibleCards.length / pageSize));
    state.page = Math.min(Math.max(state.page, 1), totalPages);

    const pageStart = (state.page - 1) * pageSize;
    const currentPageCards = new Set(visibleCards.slice(pageStart, pageStart + pageSize));

    cards.forEach((card) => {
      const shouldHide = !currentPageCards.has(card);
      card.classList.toggle('is-hidden', shouldHide);
      card.hidden = shouldHide;
    });

    if (status) status.textContent = `${state.page} / ${totalPages}`;
    if (prevButton) prevButton.disabled = state.page === 1;
    if (nextButton) nextButton.disabled = state.page === totalPages;
  }

  function openNewsDetail(card) {
    if (!indexView || !detailView || !detailTitle || !detailDate || !detailBody) return;

    const article = itemsById.get(card.dataset.newsId);
    if (!article) return;

    if (detailCategory) {
      detailCategory.textContent = article.category;
      detailCategory.dataset.category = article.category;
    }

    detailTitle.textContent = article.title;
    detailDate.textContent = article.date;
    detailDate.setAttribute('datetime', article.date);
    detailBody.innerHTML = article.body || '<p>详细内容正在整理中，请稍后再查看。</p>';

    indexView.hidden = true;
    detailView.hidden = false;
    document.title = `【${article.category}】${article.title} - 鸿禧墨魂+30`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function closeNewsDetail() {
    if (!indexView || !detailView) return;
    detailView.hidden = true;
    indexView.hidden = false;
    document.title = '江湖快报 - 鸿禧墨魂+30';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cards.forEach((card) => {
    card.setAttribute('role', 'button');
    card.tabIndex = 0;
    card.addEventListener('click', () => openNewsDetail(card));
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openNewsDetail(card);
    });
  });

  detailBack?.addEventListener('click', closeNewsDetail);

  allTabs.forEach((button) => {
    button.addEventListener('click', () => {
      allTabs.forEach((tab) => {
        tab.classList.remove('is-active');
        tab.setAttribute('aria-selected', 'false');
      });

      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');
      state.filter = button.dataset.filter || '全部';
      state.page = 1;
      renderNewsPage();
    });
  });

  prevButton?.addEventListener('click', () => {
    state.page -= 1;
    renderNewsPage();
  });

  nextButton?.addEventListener('click', () => {
    state.page += 1;
    renderNewsPage();
  });

  renderNewsPage();
}
