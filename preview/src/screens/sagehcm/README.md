# Sage Work — vision prototype

Teambridge as the workforce-management module inside **Sage HCM**, fully
white-labelled. The argument this prototype makes, in one click: Sage's
product switcher today offers HR / Payroll / Recruiting / **Scheduling** /
Self Service. Replace *Scheduling* with **Work**, and a Sage customer gets
the whole of Teambridge without ever leaving Sage.

## Routes

| Hash | Screen |
| --- | --- |
| `#/sage-hcm` | Sage HCM → Self Service home (the host product) |
| `#/sage-hcm/work` | Sage Work → Home (Teambridge, white-labelled) |
| `#/sage-hcm/work/<view>` | Any Work view — `schedule`, `people`, `pay`, `workflows`, … |

Deep links work, so any screen can be dropped into a deck or a demo script.

## The walkthrough

1. **Land in Self Service.** A rebuild of the surface a Sage customer
   already lives in — profile, tasks, policies, engagement feed, right-rail
   widgets. Three things on this page are already fed by Work: the top feed
   post, the first two notifications, and the *Who's working* widget. The
   module is present before you ever open it.
2. **Open the switcher** (hamburger, top-left, or the module header on the
   rail). HR, Payroll, Recruiting, **Work**, Self Service.
3. **Click Work.** Same top bar. Same rail. Same everything Sage owns — and
   underneath it, the entire Teambridge product.

## How the white-label works

| Concern | Where |
| --- | --- |
| Sage chrome (top bar, module rail, product switcher) | `SageHcmChrome.jsx` + `sagehcm.css` |
| The switcher's module list — *Scheduling → Work* | `modules.js` |
| Teambridge's IA re-expressed in Sage's rail | `workNav.js` |
| Layout + palette overrides for the embed | `sagework.css` |
| Product naming (`Teambridge` ⇄ `Sage Work`) | `../brand.js` |

Three deliberate decisions:

- **One nav, not two.** `Act1Dashboard` takes a `hideNav` prop. Sage's rail
  carries Teambridge's IA (`workNav.js` uses the Act1 view ids verbatim), so
  the rail drives the embedded product directly with no translation layer.
- **The AI layer repaints, not the product.** `sagework.css` remaps Alloy's
  purple family and the `--ai-grad-*` gradient to Sage green, scoped to
  `[data-sage-module="work"]`. Recolouring the *family* rather than chasing
  individual rules means future Teambridge work stays in sync automatically.
- **Nova's demo rail stands down here.** It's Teambridge-branded and floats
  above everything, which would break the exact illusion this prototype
  exists to prove. Sage Work's own in-product agent panel carries the AI.

The named agents (Nova, Atlas, Iris, Leo, Sofia) are kept as-is — they read
as agent personas rather than a vendor's name, the way an assistant's name
does. If Sage wants its own roster, that's a data change in
`preview/src/data/agents.js`, not a structural one.
