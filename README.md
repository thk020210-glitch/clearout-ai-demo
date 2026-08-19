# ClearOut prototype v2

This copy keeps the original HTML prototype unchanged and adds two presentation modes to one codebase.

## Seller mode (default)

Open `index.html`, or any page normally. This is the portfolio-facing seller experience: it shows the authorised outcome and hides calculation controls, synthetic signal inputs, and buyer-side test forms.

## Demo mode

Open the same page with `?mode=demo` appended to the URL, for example:

- `index.html?mode=demo`
- `price-plan.html?mode=demo`
- `offer-engine.html?mode=demo`

Demo mode retains the original calculation and offer simulation controls for an interview walkthrough. The desktop toggle in the top-right moves between modes while keeping the current page.

## Suggested walkthrough

`entry.html`'s primary "开启清售计划" button now always leads into the first-time onboarding flow — a new user (or a reviewer clicking through cold) cannot miss it:

1. `entry.html` — choose AI autonomous clearance → routes straight into onboarding.
2. `plan-setup.html` — create the plan from scratch: departure date, pickup preference, automation scope. 3 coachmark-guided steps.
3. `item-add.html` — add one item to the plan, with two parallel, always-visible entry points:
   - **拍照上传新商品** — photo upload → simulated AI recognition → generated listing → reference price → floor price → strategy → offer authorization.
   - **从已上架商品中选择** — pick one already-listed item (人体工学办公椅) and skip straight to pricing; the listing step is pre-filled since that information already exists. (The other two already-listed items, 显示器 / 厨房小家电套装, are shown for context but only the chair is interactive, matching the same "one deep case, others status-only" simplification used elsewhere in this prototype.)
   6 guided steps total regardless of which entry point is used.
4. `onboarding-complete.html` — an explicit "time skip" transition screen (D0 → day 14) that bridges into `dashboard.html`, with a short note explaining why the jump happens, and a recap of which item was just set up.
5. `dashboard.html` — the multi-item plan and only the items needing attention.
6. `item-setup.html` — authorise price floor, strategy and deadline (the guitar's existing deep-dive case).
7. `price-plan.html` — seller mode explains the current plan; demo mode opens the price engine controls.
8. `offer-engine.html` — seller mode is an offer inbox; demo mode simulates low / recoverable / qualified offers.
9. `results.html` — review the plan outcome.

All market, signal and buyer values are simulated for the concept demo.

Notes:
- The 4 items shown in `dashboard.html` (guitar / chair / monitor / kitchen set) are the same items referenced throughout onboarding — the story is: these were listed, optionally pulled into the clearance plan during onboarding, then the demo timeline skips ahead 14 days to where `dashboard.html` picks up (guitar already has a pending offer, kitchen set already paused, etc). The one item newly photographed in `item-add.html`'s "拍照上传" path is illustrative only and is **not** written into `dashboard.html`'s list. Only the departure date (if changed in `plan-setup.html`) is shared via the same `clearoutDepartureDate` localStorage key already used by `dashboard.html`.
- Guidance can be skipped at any point via "跳过引导" without leaving the page, or via the in-page "直接查看已配置好的计划" links back to `dashboard.html`.

## Pricing engine notes (August 2026)

Two fixes to the shared calc block (duplicated across `dashboard.html` / `entry.html` / `item-setup.html` / `offer-engine.html` / `price-plan.html` / `results.html`; only `price-plan.html`, plus `dashboard.html`'s live guitar price, actually call these functions today):

**1. Starting price (`P0`) now reacts to how much time is left, and stays AI-only.**
`calcP0` previously ignored `T` (total days remaining) — a 4-day plan and a 30-day plan produced an identical starting price. It now applies an urgency discount, `u(T) = clamp((14-T)/(14-7), 0, 1)`, anchored so `T=14` (the documented default demo scenario) is unaffected (still ¥688, displayed ¥690) and `T<=7` caps the discount. `dashboard.html`'s guitar price used to be static hardcoded text that only coincidentally matched `price-plan.html`'s default — it's now computed live from the same `calcP0`, reading the real departure date from `localStorage`, so both pages always agree.

A user-adjustable override on top of `P0` was prototyped and then deliberately removed: the product decision is that the seller sets floor price and strategy, and AI alone decides the actual starting number — matching PRD 04 页 ("AI 给出参考起点，卖家只需确认底线") more precisely than an override would. A seller who thinks the AI's number is off should use the existing "查看依据 › 补充成色/配件/取货条件" path (updates what the AI sees) or the always-available manual override of the *current* live price / pause button (PRD 04 页 权限矩阵) — not a pre-set input into the day-1 formula.

**2. Each strategy's decay curve now has the shape PRD 05 actually describes, not just a different speed.**
`calcPbase` computes the public price for any given day. The original formula, `F + (P0-F) × (剩余天数/T)^k`, applies the strategy exponent to the *remaining*-time ratio — for any `k>0` this is mathematically a front-loaded curve (steep early, flat late), regardless of which `k` a strategy used. That's backwards for `收益优先` ("长期维持高位售价，临近截止日期才加速降价" — PRD 05页), and it also meant `尽快售出`'s "curve" was really just a scaled-down copy of the same shape, not the genuinely inverse (drop-early-then-flatten) curve shown in the 销售策略 reference art.

Fixed in two parts:
- Applied the exponent to *elapsed* time instead: `P0 - (P0-F) × (elapsed/T)^k` where `elapsed = T - r`. Same anchor points (`P0` at day 1, `F` at the deadline), same `k_l` constants — only the shape in between changes. `收益优先` now drops ~¥0 from day 1→2 and ~¥40 on the final day (previously the reverse).
- `STRATEGY.fast.k_s` changed from `-0.25` to `-1.10`, so `尽快售出`'s `k` actually crosses below `1.0` (down to the existing clamp floor of `0.65` for mid/low liquidity) — the only way to produce a genuinely inverse curve rather than a milder version of the same one. No other strategy's `k_s`, and no `a_s`/`kappa_s`/`gamma_adj` for any strategy, changed.

`calcPtarget`, `calcPnext`, `stepCapForR`, and `offer-engine.html`'s L/C thresholds all consume `Pbase`/the resolved price as an opaque number and needed no changes for either fix.

## Round-4 fixes (August 2026)

Four smaller issues found while re-testing the above:

1. **`item-add.html`: strategy clicks now update the shown starting price.** The three strategy buttons in the "添加商品" onboarding flow previously only changed the description text — the "AI 定价参考" price didn't react at all, so a person couldn't tell what price a strategy would produce until after saving. Added a lean local copy of `calcP0` (this page doesn't need the full shared calc block) and wired it into both `setStrategy()` and the floor-price slider, matching `item-setup.html`'s existing behavior.
2. **`onboarding-complete.html`: removed the incorrect "time skip" framing.** The D0→day-14 timeline implied elapsed time had passed between plan creation and viewing the dashboard — but both moments are computed from the same fixed "today", so they're literally the same day; nothing was actually skipped. Replaced with a plain explanation of why `dashboard.html` shows more than just the one item just configured (other listed items, one pending offer), without any false claim about time passing.
3. **`price-plan.html` seller mode: removed a duplicate button.** "调整底价或策略" (in the info panel) and "调整计划" (in the bottom action row) went to the identical destination. Removed "调整计划"; "调整底价或策略" now sits in the bottom row alongside "暂停自动调价" (primary vs. muted styling — the same visual hierarchy, just consolidated into one row instead of two separate ones).
4. **Rebalanced the three strategy curves so they read as three genuinely different shapes.** `平衡出售`'s `k_s` moved from `0` to `-0.60`, landing `k≈1.0` — a straight line, matching "分段温和匀速降价" (PRD 05页) literally ("匀速" = constant rate = linear). Previously it sat much closer to `收益优先`'s curve family (both `k>1`) than to `尽快售出`'s (`k<1`), so it read as "a milder version of profit" rather than a true middle ground. Also smoothed `尽快售出`'s curve: for `k<1`, the instantaneous rate of price drop is mathematically unbounded right at day 1, and the chart's previously-uniform 28-point sampling was too sparse there to render it smoothly (the first rendered segment could be 2x+ steeper than the next one, reading as a visible kink). Switched to non-uniform sampling (36 points, biased toward the plan's start via `Math.pow(i/N, 1.3)`) — verified the first-segment jump drops from ~¥19 to ~¥8 with no visible effect on the other two (`k>1`) curves, which were never affected by this issue.
