/* ClearOut prototype modes
   Default: seller-facing experience. Add ?mode=demo to expose the rule sandbox. */
(function () {
  const params = new URLSearchParams(window.location.search);
  const isDemo = params.get('mode') === 'demo';
  document.documentElement.dataset.prototypeMode = isDemo ? 'demo' : 'user';

  function withMode(path) {
    const url = new URL(path, window.location.href);
    if (isDemo) url.searchParams.set('mode', 'demo');
    else url.searchParams.delete('mode');
    return url.pathname.split('/').pop() + url.search;
  }

  function sectionByText(text) {
    return Array.from(document.querySelectorAll('.section-title')).find(el => el.textContent.replace(/\s+/g, '').includes(text.replace(/\s+/g, '')));
  }

  function hideSection(titleText) {
    const title = sectionByText(titleText);
    if (!title) return;
    title.classList.add('mode-hidden');
    const next = title.nextElementSibling;
    if (next) next.classList.add('mode-hidden');
  }

  function injectAfter(target, html) {
    if (!target) return;
    target.insertAdjacentHTML('afterend', html);
  }

  function addModeToggle() {
    const switcher = document.createElement('a');
    const toggleUrl = new URL(window.location.href);
    if (isDemo) toggleUrl.searchParams.delete('mode');
    else toggleUrl.searchParams.set('mode', 'demo');
    switcher.className = 'prototype-mode-toggle';
    switcher.href = toggleUrl.pathname.split('/').pop() + toggleUrl.search;
    switcher.textContent = isDemo ? '退出演示模式' : '查看演示模式';
    switcher.title = isDemo ? '返回卖家真实界面' : '查看规则与模拟数据控制台';
    document.body.appendChild(switcher);
  }

  function preserveModeInNavigation() {
    document.querySelectorAll('[onclick*="location.href"]').forEach(el => {
      const code = el.getAttribute('onclick') || '';
      const match = code.match(/location\.href\s*=\s*'([^']+)'/);
      if (!match) return;
      el.setAttribute('onclick', `location.href='${withMode(match[1])}'`);
    });
  }

  function setupPricePlanUserMode() {
    if (isDemo) return;
    document.getElementById('demoParameterSection')?.classList.add('mode-hidden');
    document.getElementById('calculationSection')?.classList.add('mode-hidden');
    const pricePlanCard = document.getElementById('pricePlanCard');
    injectAfter(pricePlanCard, `
      <div class="mode-user-panel">
        <div class="mode-user-panel__eyebrow">AI 正在按你的规则管理价格</div>
        <div class="mode-user-panel__row"><span>下次检查</span><b>明日 09:00</b></div>
        <div class="mode-user-panel__row"><span>检查节奏</span><b>每 72 小时一次</b></div>
        <div class="mode-user-panel__note">系统会综合收藏、有效报价和同类供给更新公开价；不会低于你的保护底价。</div>
        <button class="btn btn-secondary btn-block" onclick="location.href='${withMode('item-setup.html')}'">调整底价或策略</button>
      </div>`);
    const actionRow = document.getElementById('planActions');
    if (actionRow) {
      actionRow.innerHTML = `<button class="btn pause-plan-btn" style="flex:1;" onclick="showToast('自动调价已暂停：商品保持在售，AI 不再更新公开价或处理自动报价')">暂停自动调价</button><button class="btn btn-secondary" style="flex:1;" onclick="location.href='${withMode('item-setup.html')}'">调整计划</button>`;
    }
  }

  function setupOfferUserMode() {
    if (isDemo) return;
    const navTitle = document.querySelector('.navbar h1');
    if (navTitle) navTitle.textContent = 'Yamaha F310 · 报价明细';
    const contextCard = document.querySelector('.scroll > .card');
    const simulatorTitle = sectionByText('买家提交结构化报价');
    const logTitle = sectionByText('处理记录');
    if (simulatorTitle) {
      simulatorTitle.classList.add('mode-hidden');
      simulatorTitle.nextElementSibling?.classList.add('mode-hidden');
    }
    if (logTitle) {
      logTitle.classList.add('mode-hidden');
      logTitle.nextElementSibling?.classList.add('mode-hidden');
    }
    injectAfter(contextCard, `
      <div class="mode-user-inbox">
        <div class="section-title">今日只需要你处理 1 笔交易</div>
        <div class="mode-inbox-card mode-inbox-card--positive">
          <div class="mode-inbox-card__top"><span class="mode-status">候选交易</span><span>刚刚</span></div>
          <b>买家报价 ¥560 · 明日 18:00 自提</b>
          <p>报价在你的可接受范围内。AI 已完成筛选，等待你确认交接。</p>
          <div class="mode-inbox-card__actions"><button class="btn btn-secondary" onclick="showToast('已暂不接受：商品恢复计划运行')">暂不接受</button><button class="btn btn-primary" onclick="showToast('已确认交易：请与买家确认自提细节')">确认交易</button></div>
        </div>
        <div class="section-title">AI 已处理</div>
        <div class="mode-inbox-card mode-inbox-card--quiet"><b>¥350 · 已自动拒绝</b><p>低于可挽回线，无需你处理。</p></div>
        <div class="mode-inbox-card mode-inbox-card--waiting"><b>¥430 · 已还价 ¥486</b><p>等待买家回应；每位买家仅一次 AI 还价。</p></div>
        <div class="mode-user-tip">AI 不会替你承诺现实交易。含特殊取货、打包或换物条件的报价，会直接交还给你处理。</div>
      </div>`);
  }

  function setupResultsUserMode() {
    if (isDemo) return;
    document.getElementById('resultsMetricsSection')?.classList.add('mode-hidden');
    document.getElementById('resultsDemoNote')?.classList.add('mode-hidden');
  }

  function addDemoBadge() {
    if (!isDemo) return;
    const device = document.querySelector('.device');
    if (!device) return;
    const badge = document.createElement('div');
    badge.className = 'demo-mode-badge';
    badge.textContent = '演示模式 · 模拟数据与公式控制台已开启';
    device.prepend(badge);
  }

  function installStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .mode-hidden{display:none!important}
      .prototype-mode-toggle{position:fixed;top:18px;right:20px;z-index:9999;background:#1B1B1D;color:#fff;border-radius:999px;padding:10px 14px;font:600 13px/1 -apple-system,BlinkMacSystemFont,"PingFang SC",sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.18)}
      .prototype-mode-toggle:hover{background:#FF4B10}
      .demo-mode-badge{position:absolute;left:18px;right:18px;top:8px;z-index:20;background:#1B1B1D;color:#fff;border-radius:999px;text-align:center;padding:7px 10px;font-size:11px;font-weight:700;letter-spacing:.02em}
      .mode-user-panel{background:#FFF7E8;border:1px solid #FFD9A3;border-radius:16px;padding:16px;margin:18px 0 0}
      .mode-user-panel__eyebrow{color:#DE3900;font-size:13px;font-weight:800;margin-bottom:11px}
      .mode-user-panel__row{display:flex;justify-content:space-between;padding:8px 0;border-top:1px solid rgba(222,57,0,.12);font-size:13px;color:#5D5A55}
      .mode-user-panel__row b{color:#1B1B1D}
      .mode-user-panel__note{font-size:12px;line-height:1.55;color:#77716A;margin:10px 0 14px}
      .mode-user-inbox{margin-top:10px}
      .mode-inbox-card{border-radius:16px;border:1px solid #E6E2DA;background:#fff;padding:15px;margin:9px 0}
      .mode-inbox-card--positive{border-color:#8DD9B6;background:#F3FBF7}
      .mode-inbox-card--quiet{background:#FAFAF8}
      .mode-inbox-card--waiting{border-color:#FFD49D;background:#FFF9EE}
      .mode-inbox-card__top{display:flex;justify-content:space-between;color:#77716A;font-size:11px;margin-bottom:9px}
      .mode-status{color:#0D8A5A;font-weight:800}
      .mode-inbox-card b{display:block;font-size:15px;color:#1B1B1D}
      .mode-inbox-card p{font-size:12px;line-height:1.55;color:#77716A;margin:7px 0 0}
      .mode-inbox-card__actions{display:flex;gap:9px;margin-top:14px}
      .mode-inbox-card__actions .btn{flex:1}
      .mode-user-tip{font-size:11.5px;line-height:1.6;color:#8B857E;padding:8px 2px 18px}
      @media(max-width:680px){.prototype-mode-toggle{display:none}}
    `;
    document.head.appendChild(style);
  }

  function init() {
    installStyles();
    preserveModeInNavigation();
    addModeToggle();
    addDemoBadge();
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === 'price-plan.html') setupPricePlanUserMode();
    if (page === 'offer-engine.html') setupOfferUserMode();
    if (page === 'results.html') setupResultsUserMode();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
