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

1. `entry.html` — choose AI autonomous clearance.
2. `dashboard.html` — see the multi-item plan and only the items needing attention.
3. `item-setup.html` — authorise price floor, strategy and deadline.
4. `price-plan.html` — seller mode explains the current plan; demo mode opens the price engine controls.
5. `offer-engine.html` — seller mode is an offer inbox; demo mode simulates low / recoverable / qualified offers.
6. `results.html` — review the plan outcome.

All market, signal and buyer values are simulated for the concept demo.
