# Tessera — frontend

Next.js 15 (App Router) + React 19 dashboard for a Discord bot. Config is editable from
both slash commands and this site; both write through one service so they cannot drift.

One bot serving N guilds — the tenant is always `guild_id`, never global state.

Mock data first, real API later. The workspace is `bot-frontend/` (here), `bot-api/`
(REST API + discord.js bot, empty). The specs live here in `docs-markdown/`, written in
Portuguese and shared with `bot-api`.

Specs in [docs-markdown/](docs-markdown/), gitignored — they are notes, not artifacts:

- `especificacao-tecnica.md` — stack, folder layout, full DB schema, security
- `claude-design-prompt.md` — design system: tokens, components, every screen
- `notas-arquitetura.md` — why each piece exists
- `estado-do-projeto.md` — what is built, what is next, and the traps already hit

Decisions already closed live in `estado-do-projeto.md` under "Decisões fechadas" —
stack, schema conventions, session model, the single-writer rule. Do not reopen them.
One of them shapes components here: an optimistic-lock clash arrives as **HTTP 409** and
must surface as a conflict state in the SaveBar.

The design itself is a Claude Design project, read through the `DesignSync` tool, and it
is the source of truth over the brief where the two disagree. Project id
`54608759-e838-4999-9e68-044665494aae`; files `Foundations.dc.html`, `Components.dc.html`,
`Shell.dc.html`, `Auth.dc.html`. It is a plain project, not a design system, so it never
shows up in `list_projects` — that id is the only way back to it.

## Rules

**Comments only in CSS, and even there the bare minimum.** No section banners, no
restating what a rule does. `.ts`, `.tsx` and `.mjs` files carry **zero** comments — no
exceptions, not even for a line that exists to prevent a defect. That reasoning goes in
"What the code cannot say for itself" below, next to the file it belongs to.

This is enforced, not a convention: `house/no-comments` in `eslint.config.mjs` is a local
flat-config rule that errors on every comment and allows only tool directives
(`eslint-*`, `@ts-*`, `prettier-ignore`).

**No `any`.** Type everything. `unknown` plus a narrow, never `any`. No
`@ts-expect-error` without an adjacent reason. `eslint` runs `strictTypeChecked`, so
`||` on a nullable is an error — use `??`, and `Boolean(a) || Boolean(b)` when you
genuinely want falsy-or, since `a ?? b` is **not** the same test.

**Colors and sizes come from tokens.** `app/globals.css` is the only file allowed to
contain a literal color. Use `bg-surface`, `text-text-muted`, `text-h1` — never
`bg-slate-900`, `text-[14px]`, or a raw hex in a component. There are exactly two
sanctioned exceptions, both of which stop being exceptions the moment you copy them
somewhere else:

- `ActivityChart`'s fallback palette — ECharts cannot read a CSS variable, and the
  fallback only fires if the token is missing. Those hexes must stay equal to the tokens.
- `DiscordPreview` — the whole component is a facsimile of Discord's message surface. Its
  colours and its `text-[15px]`/`text-[14px]` sizes are **Discord's**, and following our
  theme or our type scale would make the preview lie.

**`cn()` has to be told what our type scale is.** `tailwind-merge` classifies an unknown
`text-*` value as a colour, so `cn('text-overline', 'text-on-dark')` used to drop
`text-overline` and leave the element at the inherited 14px. That is why the leaderboard
initials overflowed their circles, and it was silently eating the type step in `Avatar`,
`Field`, `Badge` and `Button` — every place a size token and a colour token met inside
`cn`. `lib/utils/cn.ts` now registers the eleven `--text-*` steps with
`extendTailwindMerge`, and `cn.test.ts` pins each one. **Add a step to the `@theme` block
and you must add it to `FONT_SIZES` too ** — nothing else will tell you.

**Tailwind classes must be complete literal strings.** The scanner reads source as
text, so `bg-{variant}` is never emitted. Map variants to full class strings.

**Prefer the canonical class over an arbitrary value.** Tailwind v4 covers far more than
v3 with bare values: `duration-120` not `duration-[120ms]`, `mt-0.75` not `mt-[3px]`,
`max-w-120` not `max-w-[480px]`, `backdrop-blur-xs` not `backdrop-blur-[4px]`,
`bg-size-[…]` not the v3 `bg-[length:…]`. Arbitrary syntax is a last resort, and every
surviving one is deliberate: `w-[calc(100vw-2rem)]`, `transition-[width]`,
`max-h-[inherit]`, `bg-size-[200%_100%]` have no canonical form.

**`text-text-subtle` is for icons and disabled text. Nothing a user has to read.** In the
light theme `--text-subtle` (`#94a3b8`) measures 2.56:1 on white — under even the 3:1 that
large text is allowed — so the search button, every placeholder, timestamps, counts and
"No roles" all moved to `text-text-muted` (4.76:1). What kept `text-subtle` is icon
`className`s, `isDisabled ?` branches (disabled text is exempt from WCAG 1.4.3), and the
`NumberInput` stepper chevrons, which have to stay pixel-identical to the `Select` trigger's.

Left deliberately, because they are token values the design file fixes and it wins:
`text-primary` on `primary-subtle` (4.07 light / 4.16 dark, the active nav item),
`text-muted` on `surface-sunken` (4.34 both, badges), and `primary-fg` on `primary` (3.76
dark, the primary button). All three are marginal; `--text-subtle` was not.

**A status colour used as _text_ takes the `-fg` token, never the base.** `--success` and
`--warning` are tuned to be seen as a fill or an icon, and in the light theme they fail as
text on a white surface: `text-success` measures 3.30:1 and `text-warning` 3.19:1, both under
the 4.5:1 that WCAG 1.4.3 asks of body text. `text-success-fg` and `text-warning-fg` measure
9.11:1 and 9.07:1 in light and stay legible in dark, on both `surface` and `*-subtle`. Icons
are exempt — they answer to the 3:1 of 1.4.11, and every icon tile in the app clears it.
`text-danger` is the one base colour that does pass as text (4.83:1 light), but the `-fg` rule
is applied to it too so the pair never reads as two different weights of red.

**Status colors are reserved.** `success` / `warning` / `danger` / `info` mean state.
Chart series use `chart-1..4` in that fixed order.

**LF line endings**, enforced by `.editorconfig` and Prettier.

**Check the official docs before writing, for any doubt.** React at react.dev, Next.js at
nextjs.org/docs, Tailwind at tailwindcss.com/docs, Radix at radix-ui.com/primitives/docs,
ECharts at echarts.apache.org/en/option.html, MDN for plain CSS. Never reason from memory
about how a tool behaves. When the package is already installed, its own `node_modules`
is the most reliable doc of all — grep the `.mjs` for the data attribute or CSS variable
name rather than guessing it.

**Prove a fix against the generated output, never the source.** Grep `.next/static/css/`
for the Tailwind rule and the rendered HTML for the markup — the source file only proves
what you wrote, not what the browser gets. Two traps that produced wrong answers here:
`grep -c` counts matching _lines_, and SSR HTML is a single line, so it reports 1 for
everything — use `grep -o … | wc -l`; and Tailwind escapes dots in selectors
(`.gap-1\.5{`), so an unescaped pattern finds nothing.

**Better than grepping output: write the test.** `yarn test` runs jsdom, so a claim about
rendered markup, an aria attribute, an active nav item or a chart series can be asserted
instead of argued. There is no browser here — a passing test is the only honest evidence
about behaviour, and even it says nothing about how the page _looks_.

**A class existing in the CSS does not mean it is honoured.** `h-10` on a sidebar nav item
generated `height: 40px` correctly and still rendered at ~22px, because `flex-shrink`
defaults to `1` and a bounded column flex container squeezes its children below their
declared height — `overflow-y-auto` does not prevent it. Flex and grid children that must
keep their size carry `shrink-0`, and `SidebarNav.test.tsx` asserts it. When the CSS is
right and the layout is still wrong, suspect the parent's sizing before anything else.

**Never run `next build` while a dev server is up.** Both write to `.next/`. The
production build leaves a `page.js` that requires `./vendor-chunks/<pkg>.js`, dev then
rewrites that folder without it, and the static-paths worker dies with
`Cannot find module './vendor-chunks/@radix-ui.js'`. That message means a mixed `.next`,
never a missing dependency; the fix is deleting `.next`. Check the port first
(`Get-NetTCPConnection -LocalPort 3000 -State Listen`), and delete `.next` after any
build so the next `yarn dev` starts clean.

**Do not run `git init`** or any git command unless asked.

## The app shell

`components/layout/AppShell.tsx` is the skeleton every signed-in route renders into. It
takes `guild`, `guilds`, `user`, `plan` and `botOnline` as props and never imports the
mocks itself. The route's `layout.tsx` loads them, which is why swapping a source is a
one-file edit: `guild`, `guilds` and `user` already come from the API, while `plan`,
`botOnline`, `preferences` and `sessions` are still mock because no endpoint serves them.

`lib/navigation.ts` is the single source of navigation: the sidebar items, the breadcrumb,
the active state and the command palette results all come from it. A new route is declared
there, not in each component.

Routes live in `app/(authenticated)/servers/[guildId]/`. The parentheses are a Next route
group — invisible in the URL. `(public)` is its pair for the marketing pages, and
`(shell)` inside `[guildId]` is what lets `/setup` escape the `AppShell`: the shell layout
sits on `(shell)/layout.tsx`, so anything outside that group renders bare. That is the
App Router replacement for SvelteKit's `+page@.svelte`.

`components/layout/ScreenStub.tsx` is gone from every route now that all 19 screens exist.
The component is still there for the next route that gets scaffolded.

Data loading is per-file. Next has no `load` inheritance, so a page that needs the guild
calls `resolveGuild()` itself even though the layout above it already did — that is normal,
not duplication to factor out. The repeat costs nothing because `loadGuilds` in
`lib/guild-access.ts` is wrapped in React's `cache()`: every call inside one request hits
`GET /guilds` once.

**A guild's identity is real; everything inside it is still mock.** `resolveGuild` asks the
API who the signed-in user actually administers, so `/servers/<id>` only opens for a guild
the bot is in. Three outcomes, and the middle one is the point: guild in `managed` renders,
guild in `available` (the user is an admin but the bot never joined) redirects to
`/servers/add` instead of a dead end, and anything else is a 404. The screens below still
read `lib/mock` — wiring those to real config is per module, and `welcome` is the only one
whose backend exists.

## Auth screens

`/login`, `/auth/discord/callback` and `/logout` are built; the OAuth exchange behind them
is not, because `bot-api` is empty. The seam is the URL, which is what a real OAuth flow
uses anyway: `?error=access_denied|session_expired|unknown` on `/login` and
`?error=invalid_grant|invalid_state` on the callback drive the failure states. `?as=signed-in`
is the one piece of pure scaffolding — it stands in for a session until sessions exist, and
it dies with the first middleware. `/servers?state=loading|empty` is the same trick for the
two states a mock array can never reach on its own.

Copy for those states lives in `lib/auth.ts`, not in the components, so the page maps URL
to error and the component only renders one.

Discord blurple is `--discord`, never `--primary`. In dark theme `--primary` is `#6b77f5`
while Discord's brand blue stays `#5865f2`; the sign-in button must be Discord's color, so
the token does not flip with the theme.

`/` is the marketing landing and it **contains** the sign-in card, in the hero's right
column. There is no split-screen brand panel any more — `BrandPanel.tsx` was deleted with
the redesign, and `app/page.tsx`'s redirect to `/login` went with it. `/login` renders the
same `LandingScreen` with `signInFirst`, which only reorders the hero so the card sits
above the copy below `lg`; on desktop the card is already beside it. That is why `/login`
survives as a real route instead of a redirect: it is where `?error=` lands, and every
existing link to it (the callback, the legal pages, `/logout`) keeps working untouched.

`BrandMark.tsx` is the only place the logo mark is chosen. The design file draws an
`orbit` glyph and still says "Orbit" throughout, both left over from the discarded name;
the mark renders `Grid2x2` instead — four tiles, which is what _tessera_ means — and every
wordmark reads `BRAND.name`. Swapping the glyph is one import.

## Placeholders que não podem ir ao ar

Três valores na landing são inventados e **só são aceitáveis enquanto o site não é público**:
`TRUST_STATS` em `lib/marketing.ts` (12.400 servidores, 4.1M membros, 99,9% de uptime),
`BRAND.supportUrl` (`discord.gg/placeholder`) e `BRAND.statusUrl`. A lista completa, com o que
cada um precisa virar, está em `docs-markdown/estado-do-projeto.md`, em **"A remover antes de
fechar o projeto"**. Ao mexer em qualquer um desses arquivos, conferir se a pendência ainda
vale.

O convite do bot saiu dessa lista: ele é montado em `lib/discord-invite.ts` a partir de
`NEXT_PUBLIC_DISCORD_CLIENT_ID`, com o inteiro de permissões derivado dos bits da doc oficial.
Não voltar a hardcodar client id em `lib/brand.ts`.

**O inteiro de permissões é calculado, nunca digitado.** A tabela de bits do Discord mora em
`lib/discord-permissions.ts` e `INVITE_PERMISSIONS` sai de `permissionMask(permissionsExcept(...))`.
O número cru (`8866461766385655`) não diz a ninguém o que está sendo pedido, e conferir exigia
uma calculadora; a lista de nomes diz. Mudar o que o convite pede é editar `REFUSED_PERMISSIONS`,
e há teste que ancora o valor resultante — se ele mudar sem querer, a suíte avisa.

**O bit 47 não existe, e a tabela deixa o buraco à mostra.** O Discord define 0–46 e 48–52; quem
tentar simplificar para "todos os bits até 52 menos o 3" vai pedir uma permissão inexistente. Há
teste que falha se alguém ocupar o 47 ou abrir um segundo buraco.

**Permissão trocada no convite só vale para quem instalar depois.** O Discord grava as permissões
no cargo do bot na hora da instalação; servidor que já tem a Tessera continua com as permissões
antigas até ser reconvidado.

## Public pages

`components/marketing/` holds the landing, and `lib/marketing.ts` holds everything it says:
nav links, trust figures, module blurbs, help cards, FAQ, footer columns. Copy goes there,
not into the components, for the same reason `lib/auth.ts` owns the sign-in error strings.

`NAV_LINKS` and `FOOTER_COLUMNS` are `as const` on purpose. `typedRoutes` checks
`<Link href>` against a literal union, so widening those arrays to `{ href: string }` breaks
every internal link in the header and footer. Each entry carries `external`, and the
components narrow on it — external links render a plain `<a rel="external">`, internal ones
a `<Link>`. `/#features` type-checks because Next's `Suffix` accepts `?…` and `#…` after a
known route.

The nav is deliberately only the four destinations that exist: Features (an anchor),
Pricing, Docs and Support. The design draws Commands and Changelog too; a link with no
destination is worse than a shorter nav.

**Docs are a real route now, not an outside link.** `BRAND.docsUrl` used to be a
placeholder domain reached from seven places, and the module header pointed all eleven
modules at its root. It is gone: `/docs` is internal and typed, and the module header links
to `/docs/modules/<id>`. `BRAND.statusUrl` stayed external, because a status page genuinely
lives off this app.

`/pricing` renders from `PLANS` in `lib/billing.ts` — the same source the in-app billing
screen reads, so a price can never disagree between the two. The "Save 17%" badge is
`yearlySavingsPercent(findPlan('pro'))`, computed, not typed in.

`Section` and `SectionIntro` own the 1200px container, the 80px vertical rhythm and the
`scroll-mt-22` that keeps an anchored section clear of the 64px sticky header. A marketing
section that sets its own padding will drift out of step with the others.

## Documentation

`/docs` is nineteen pages in four groups, under `app/(public)/docs/`. The content lives in
`lib/docs/pages/` as typed data and the chrome in `components/docs/`.

**Docs get their own header, and the sidebar is pinned to the viewport edge.** The first pass
reused `PublicHeader` and centred everything in the marketing 1200px container, which put two
stacked bars above the page and left the sidebar floating in the middle of a wide screen with
empty gutters on both sides. `DocsHeader` replaces it: one 64px bar with the brand, the search
and the dashboard link, no marketing nav. The sidebar is a full-height rail flush left with a
`border-r`, and the article sits directly after it capped at `max-w-200` rather than centred in
what is left — a docs layout either caps the whole thing including the sidebar, or pins the
sidebar and left-aligns. Doing half of each is what looked wrong.

**A signed-in user must be able to get back.** The docs are public pages, so the header would
otherwise offer "Sign in" to someone who arrived from their own dashboard — a dead end, and the
exact failure a placeholder docs link was supposed to stop being. `AppShell` writes the current
guild to `tessera:last-guild`, and `useDashboardHref()` reads it through `useSyncExternalStore`
so the button is `/servers/<id>` when known and `/servers` when not. The store hook is what
keeps this legal: reading `localStorage` in an effect and calling `setState` is what
`react-hooks/set-state-in-effect` forbids, and the server snapshot returning `null` is what
stops the href from mismatching on hydration.

**The content is placeholder, the structure is not.** Nothing here was invented: the module
pages carry the real field labels and help strings harvested from the eleven module screens,
the command tables are generated from `mockCommands` grouped by `COMMAND_CATEGORIES`, and
the module list is `mockModules`. That matters because generic filler — a `/command1` that
does a thing — does not stress a layout. Real docs content is the most irregular content in
a product: code blocks that overflow, option tables, headings of wildly different lengths.
A layout tuned against uniform filler breaks the day real text arrives, which is the same
mistake as measuring one viewport and writing the number down.

**No MDX, and the reason is the config registry.** The larger half of this documentation —
every option table, every command row — will be _generated_ from the declaration that
already produces the slash command option, the dashboard form and the API validation.
Generating a typed object is trivial; generating Markdown is string templating and hoping.
The prose half is small enough to live in the same typed structure. If prose grows, MDX can
come in for those pages alone without the shell changing. `DocBlock` is the union that makes
this work: `paragraph`, `heading`, `list`, `steps`, `code`, `callout`, `options`, `commands`,
`table`. `options` and `commands` are the two the registry will fill.

`Inline` is a three-token markup language — `` `code` ``, `**bold**` and `[label](href)` —
and nothing more, because anything richer is a request for MDX. A link starting `/docs`
renders as a `<Link>`, everything else as `<a rel="external">`. A test walks every string in
every page and fails if an internal link points at a slug that does not exist.

**The shell is a `layout.tsx`, so navigation only swaps the article.** Header, search and
sidebar are rendered once and stay mounted; `docs/loading.tsx` therefore covers only the
content column. That is why `DocsNavTree` reads `usePathname()` instead of taking an
`activeSlug` prop — a layout cannot know the current page on the server, and the alternative
is re-rendering the whole shell on every click. The page returns a fragment of `<main>` plus
the table-of-contents `<aside>`, both siblings inside the layout's flex row.

The search index is built on the server and handed down as a prop rather than imported by
the client component, so the full text of nineteen pages never enters the client bundle —
only nineteen titles, summaries and keyword strings. Search requires every term to match and
ranks title hits above body hits.

`ModulePage` takes `moduleId` explicitly. Deriving it from `usePathname()` worked in the
browser and returned `null` under jsdom, taking twelve `WelcomeScreen` tests down with it —
and a component that reads its own identity out of the URL is harder to test than one that
is told.

## Where things live

```
app/                     routes; `page.tsx` is a server component by default
components/
├─ ui/                   primitives                       @/components/ui
├─ auth/                 brand mark, Discord button
├─ marketing/            the public landing and its sections
├─ docs/                 the documentation shell, nav, search and block renderer
├─ discord/              Discord-shaped domain pieces
├─ layout/               the app shell
└─ providers/            Theme and Sidebar context
lib/
├─ auth.ts               sign-in and callback error copy
├─ brand.ts              product name and outbound URLs
├─ marketing.ts          landing copy: nav, features, FAQ, footer
├─ navigation.ts         the nav registry
├─ docs/                 documentation content as typed data, plus nav and search
├─ mock/                 fake data, one file per entity
├─ types/                one file per domain
└─ utils/                cn, contrast, format
tests/setup.ts           jsdom polyfills for the whole suite
```

There is deliberately no `lib/config/`. In this product "config" already means the module
config registry — one field declaration that generates the slash command option, the
dashboard form, the API validation and the JSONB shape. That name is reserved for it, and
it will be shared with `bot-api` rather than living here.

Only route files import from `lib/mock`. Components take data as props. That is what
makes swapping in the real API one file per route instead of a sweep through the tree.
The one exception is `lib/docs/pages/commands.ts`, which reads `mockCommands` because the
command reference _is_ that list rendered as a table — when the config registry lands, that
import becomes the registry and nothing else about the page changes.

A screen with interactivity is split in two: `page.tsx` stays a server component that
reads `params`/`searchParams` and hands plain data to a sibling `'use client'` component
(`LoginScreen`, `ServerPicker`, `OverviewScreen`, `SetupWizard`). Do not make `page.tsx`
itself a client component to save a file — that pulls the whole route out of RSC.

## Layers and floating surfaces

Five z-index steps, and nothing may invent a sixth:

| Step   | What sits there                                              |
| ------ | ------------------------------------------------------------ |
| `z-30` | in-page sticky chrome — page header, `SaveBar`, PublicHeader |
| `z-40` | the modal scrim (`Dialog` / `Drawer` overlay)                |
| `z-50` | the modal surface itself, `CommandPalette`, `MobileNav`      |
| `z-60` | popovers, selects and menus — they open **from** a modal     |
| `z-70` | tooltips, which sit above everything                         |

A popover below `z-50` renders behind any open dialog, and because both are portalled to
`body` they are siblings — there is no stacking context to save you. That is exactly the
bug `Select` (`z-30`) and `Popover` (`z-40`) shipped with.

Floating surfaces carry `border-border-strong`, not `border-border`. Dark theme sets
`--elevation-1..3` to `none`, so a popover over a dialog has no shadow to separate it and
both paint `--surface-raised` — without the stronger border the panel is invisible.

**A scrollable list inside a popover inside a dialog needs `modal` on the popover.**
Radix's Dialog mounts `react-remove-scroll` with `shards: [contentRef]`, and its
`shouldPrevent` listener sits on `document` in the bubble phase. A portalled popover is not
inside that shard, so every wheel event over it gets `preventDefault()` and the list looks
frozen. `react-remove-scroll` only runs the **last** lock on its stack, so
`<Popover.Root modal>` pushes its own lock and hands the wheel back. `RolePicker` and
`ChannelPicker` both set it. Verified by dispatching a real wheel event: `scrollTop` 0 → 106.

## Form controls

`Field` owns the anatomy — label, hint above the control, error or help below, never both
at once — and publishes `controlId`, `describedBy`, `invalid` and `disabled` through the
React context in `components/ui/field-context.tsx`. Controls read that context and wire
their own `id`, `aria-invalid` and `aria-describedby`.

Bordered controls kill the global focus outline with `focus-visible:outline-none` and show
focus on their own border instead. The base rule in `globals.css` is
`outline: 2px solid var(--ring); outline-offset: 2px`, which on a control that already turns
its border `--primary` on focus reads as a fat doubled ring. Anything that opts out **must**
supply the border itself — `Input` and `Textarea` already had `focus:border-primary`;
`Select`'s trigger and both pickers only had `data-[state=open]`, so they gained
`focus-visible:border-primary` in the same change. Drop the outline without adding the
border and the control becomes invisible to keyboard users.

**A `Switch` in a table row has no name unless you give it one.** The `label` prop renders a
real `<label htmlFor>`; without it the control is a nameless `role="switch"` and a screen
reader announces only "on". Five of them shipped that way — the module cards and the rows in
logging, scheduled and custom-commands — and they now pass `aria-label` naming the row
("Log Message deleted", "Enable /rules"). `CommandsScreen` solves the same problem with an
`sr-only` `<label for>` next to the switch, which is equally fine.

`Checkbox` draws 16x16 but its hit area is 24x24, through `before:-inset-1`. It was already
conformant — the nearest two checkboxes on the commands table are 44px apart, so WCAG 2.5.8's
spacing exception applied — but 16px is a mean target for a mouse and the padding costs
nothing visually.

**No native browser widget is allowed inside an input.** Chrome paints them in its own
palette, ignores every token, and cannot be restyled — the number stepper was the first one
caught, and a sweep found three more: the blue clear cross on `type="search"` (six screens),
the black clock on `type="time"` and the tan-bordered swatch on `type="color"`. The base
layer in `globals.css` removes all of them, and each removal ships with a replacement that
still works: `NumberInput` draws its own chevrons, `SearchInput` draws the clear button
(also bound to Escape), and `DateTimeInput` draws the calendar icon and reopens the native
picker through `showPicker()`. **Adding a new `type=` to an input means checking what the UA
draws into it first.** The shared `fieldIconButton` class in `components/ui/field-icon-button.ts`
is what makes those trailing buttons a 24x24 target; it lives in its own module because
`react-refresh/only-export-components` refuses a non-component export from `Input.tsx`.

`Input`'s `trailing` slot is `pointer-events-none` so decorative text does not eat clicks at
the right edge, and re-enables them for `[&_button]` so an interactive trailing control still
works. It was dead code until `SearchInput` needed it, which is why its padding was `pr-16`.

**24x24 is the hit area, not the drawing.** `Checkbox`, the field icon buttons, `Switch` and
the `Docs` link in the module header all grow through a transparent `before:` box —
`before:-inset-1` for the square ones, `before:inset-x-0 before:-inset-y-0.5` for the 20px-tall
ones — so nothing moves visually. `getBoundingClientRect` cannot see that growth, so measure
these by hit test (`document.elementFromPoint` a few px outside the visible box), never by the
rect. Measure at the **edge midpoints**, not the corners: a round 24px target satisfies 2.5.8
by its diameter and its square corners fall outside the shape.

**`Checkbox` uses `rounded-xs` (4px), and that is the only thing separating it from a radio.**
Both are `size-4 border border-border-strong`; at the old `rounded-sm` (6px on a 16px box) the
checkbox read as a circle, so "pick many" and "pick one" looked identical. `--radius-xs` exists
for this. The check glyph is `text-primary-fg`, not `text-white`.

Placeholders are `text-muted`. `text-subtle` fails 1.4.3 on light (2.56:1) and survives only on
disabled text and decorative icons — both exempt. The placeholder leaked past the first sweep
because `Input`'s base string carries `disabled:text-text-subtle` on the same line, which the
sweep read as a disabled state and skipped.

A new control (Select, Switch, ChannelPicker, RolePicker) plugs in by calling
`useFieldState()` and accepting an explicit prop that overrides it. Never re-implement
labels or error rendering inside a control. `Field.test.tsx` pins that contract.

## Account is a panel, not a route

There is no `/account` page. The account settings open as a modal panel over whatever screen
you are on, from the user menu in the topbar, and Escape puts you back exactly where you were.
It used to be a route outside the guild scope, which meant it could not use `AppShell` — the
shell needs a `Guild` and an account does not have one — so it grew its own header with a back
link, a theme toggle and a sign-out button. That page was an orphan: it looked like a different
product and it stranded you.

`AppShell` owns `accountOpen` the same way it already owned `paletteOpen`, and hands
`onOpenAccount` down through `Topbar` to `UserMenu`. The item is a `DropdownMenu.Item` with
`onSelect`, not a `Link`.

**`AccountPanel` stays mounted while it is closed.** Radix unmounts only the dialog content, so
the `useConfigDraft` draft, the revoked-session list and the selected tab all live in the panel
component and survive a close and reopen — you do not lose an unsaved change by pressing Escape.
Move that state inside the dialog content and it resets every time.

**Focus has to be handed back by hand.** The dropdown closes before the dialog opens, so at open
time `document.activeElement` is `body` and Radix's default restore returns focus to nothing.
`AppShell` keeps a ref on the menu trigger, passes it to `UserMenu` as `triggerRef` and to the
panel as `returnFocusTo`, and the panel's `onCloseAutoFocus` prevents the default and focuses it.

The rail is a real `role="tablist"` with roving tabindex — only the selected tab is `tabIndex={0}`,
arrows move and wrap, Home and End jump to the ends. Tabs, not one long scroll: six sections and
about 1800px of content do not belong in a modal that you scroll. `SaveBar` gained a `className`
so the panel can cancel the negative margins it uses to bleed to the edges of a page.

## Loading skeletons

`Skeleton` is `animate-pulse` — Tailwind 4.3.3 defines it as `pulse 2s cubic-bezier(0.4, 0, 0.6, 1)
infinite` over `@keyframes pulse { 50% { opacity: .5 } }`. It replaced a custom `animate-shimmer`
that swept `background-position`, which repaints instead of compositing and cost more on a page
carrying a hundred pieces. The keyframe has no `to`, so under `prefers-reduced-motion` — where the
global rule clamps every animation to 0.01ms and one iteration — the block settles at **opacity 1**
and stays readable rather than freezing half-faded.

**The fill is `bg-border`, and that is not a colour picked by eye.** `bg-surface-hover` reads at
1.15:1 on a dark card but **1.05:1 on a light one**, where `--surface` is pure white — the skeleton
was invisible in the light theme. `--border` lands at 1.23 light / 1.26 dark, the only token that
carries the same weight in both. `ModuleSkeleton.test.tsx` re-derives that ratio from
`globals.css`, so changing either token fails the test instead of quietly blanking the skeleton.

**`loading.tsx` covers a segment's children, not just its `page`.** Measured, not assumed: with a
marker file at `(shell)/loading.tsx`, navigating to `/team` renders it. So the two segments that
have children — `(shell)` (overview) and `modules` — cannot use `loading.tsx` without their
skeleton leaking onto the three screens that have none yet. They scope it with `<Suspense>`
inside `page.tsx` instead: the default export is sync and wraps an async child that awaits
`params`. The five leaf module routes are safe and use plain `loading.tsx`.

Skeletons mirror the **box model** of what they replace, never a hardcoded height — `FieldSkeleton`
carries `Field`'s own `mb-0.5`/`mb-1.5` around a 20px label and a 16px hint, so it lands on 62px
(label + control) or 80px (label + hint + control) on its own, and follows the tokens if they move.
Every card was checked against the real screen by measuring both and diffing each card's top and
height. Thirteen of the seventeen match block for block — overview, automod, economy, tickets,
reaction roles, giveaways, custom commands, scheduled, commands, members, cases, audit and
modules' header block; welcome and moderation match in total with cards inside 2px; levels and
logging still drift 4px.

**There are two skeleton vocabularies, one per page shape, and each lives beside the component it
mirrors.** `components/modules/ModuleSkeleton.tsx` sits with `ModulePage` and covers the eleven
module screens; `components/management/PageSkeleton.tsx` sits with `PageHeader` and covers the
management ones. The second exports `ManagementPageSkeleton` (the h1 + description header, with an
optional action), `PanelSkeleton` (the `rounded-lg border bg-surface shadow-1` card both the tables
and the audit list share) and `TableSkeleton`/`TableRowSkeleton` on top of it. `TableSkeleton`
started out taking a `rowContent(column)` callback and that was wrong — every column holds
something different and the checkbox column carries its own padding — so it is a thin shell taking
`head` and `children` and each screen declares its own cells. Column widths get declared once as a
`COLUMNS` array and read by both the head and the body, because a table whose header and rows
disagree is worse than no skeleton.

The one thing a skeleton cannot match is content whose size depends on data, and it shows up as a
short card, never a misplaced one. The modules grid draws uniform cards while real descriptions
wrap to one or two lines, costing one row's 20px.

**Commands has two regimes, and a number measured in one is worthless in the other.** Its table is
`min-w-220`, so above roughly 1500px of viewport it stretches and nothing wraps — skeleton and
screen both come to 1775, exactly. Below that the table sits at its min-width and scrolls: the
column labels wrap to two lines (head 53 rather than 44) and four of the 24 descriptions wrap
(79 rather than 63), which is the whole of the 73px the skeleton runs short there. An earlier pass
read the narrow regime as the only one and forced the head cells to `h-7` to cover the wrapped
labels; that made the wide regime — the one a dashboard is actually used at — 9px too long, and
the fix was to drop the override and let the head take its height from the checkbox's
`mt-0.75 size-4`, which is what really drives it. Measure at more than one width before
writing a number down.

**A text bar is not the line box it sits in, and drawing it as one glues the lines together.**
The first pass gave the page title `h-9` and its description `h-5.5` — exactly `text-h1`'s and
`text-body`'s line-heights — so the two bars touched and read as one block. Text has leading; a
solid bar does not. `TextSkeleton` takes the type token instead of a height and renders the line
box at the token's line-height with a bar of roughly the font size centred inside it, so stacked
lines separate on their own and the total still equals the real line-height. `ModuleSkeleton.test.tsx`
re-derives every box height from the `--text-*--line-height` tokens in `globals.css`, so the table
cannot drift from the type scale.

Two traps when matching a text block, both found by measuring rather than reading: an **inline**
`<span>` in a block with body line-height gets a 22px line box even when it is `text-caption`, and
`inline-flex` badges do the same to their row. Where the real markup does that, the skeleton
overrides the box height and says so with the override rather than padding a neighbour.

**To look at a skeleton, add `?state=loading` to the screen** — the same URL switch `/servers`
already uses for the states a mock array cannot reach. Each of the nineteen routes reads
`searchParams` and returns its skeleton instead of the screen, so it renders frozen inside the
real shell: sidebar, breadcrumb and theme toggle keep working, and it survives a resize. That is
the only practical way to review one, because the mock data resolves in the same tick and the
genuine fallback never lasts long enough to see without throttling the network. The pages share
`GuildPageProps` from `lib/types/page.ts` instead of restating the params/query pair seventeen
times; the three that never read `guildId` — commands, cases and audit — take
`Pick<GuildPageProps, 'searchParams'>` rather than accepting a param they ignore.

**The shell paints the skeleton itself while a navigation is in flight, because `loading.tsx`
cannot in development.** Next hard-disables prefetching in dev — `client/components/links.js`
returns early from `onLinkVisibilityChanged` (_"requires compiling the target page"_) and
`client/app-dir/link.js` does the same on hover. Without a prefetch the router holds no
`loading.tsx` boundary, so it waits for the whole server response and keeps the old screen up
until it lands. Measured before the fix: click at 0s, URL still on the old route at 3.5s, no
skeleton anywhere, content at 5s. `loading.tsx` and the `<Suspense>` boundaries are still right
and still carry production — this covers the gap the dev server leaves.

`NavigationProvider` holds the href the user clicked plus the pathname they clicked it from, and
derives `pendingHref` during render: the moment `usePathname()` no longer equals the pathname at
click time the navigation has landed and the value falls back to `null`. Deriving beats an effect
here — `react-hooks/set-state-in-effect` rejects the effect version, and it would cost a cascading
render on every navigation. `NavItem` calls `start(href)` from `onClick`, which is an event
handler and free to write state. `AppShell`'s `ShellMain` swaps `children` for
`routeSkeleton(pendingHref)`, and `routeSkeleton` returns `null` for the three screens without
one, so those keep the old behaviour of holding the previous page. `SidebarNav` and `Breadcrumbs`
read `pendingHref ?? pathname` so the highlight and the trail name the screen that is loading
rather than the one being replaced.

That is why the seventeen dashboard skeletons live in `components/skeletons/` instead of beside
their routes — the shell is a client component and has to import all of them to choose one.
`DocsSkeleton` sits in the same folder for consistency and is the one the shell never reads:
`/docs` is outside `AppShell`, so its `loading.tsx` is the whole mechanism.

**`holdSkeleton()` is scaffolding and comes out when `bot-api` exists.** The seventeen dashboard
routes await it — the two docs routes do not, because their content is compiled in and there is no
future request to stand in for. It makes the transition last long enough to inspect; measured with
a 25ms poll, the skeleton appears
**28ms** after the click and the real screen replaces it at **3143ms**. `lib/skeleton-hold.ts`
returns 0 outside `NODE_ENV=development`, so nothing ships, and `SKELETON_HOLD_MS` overrides the
wait (`0` turns it off) without touching a file. It skips `?state=loading` so the frozen preview
stays instant. It stands in for latency that does not exist yet — the mock data is already in the
process. Once the routes call the API, delete the helper and every `await holdSkeleton(query)`
with it; the pending skeleton above stays, and then shows for exactly as long as the request takes.

## Typed routes

`typedRoutes: true` in `next.config.ts` makes `<Link href>` reject any path that is not a
real route — it caught `/account` and `/logout` before they existed. A plain `string`
never satisfies it, so `guildHref()` returns the template literal type
`` GuildHref = `/servers/${string}` ``, which does. That return type is load-bearing:
widen it to `string` and every guild link in the app stops type-checking.

`ComponentPropsWithoutRef<typeof Link>['href']` looks like the way to type a passthrough
`href` prop and is not — `Link` is generic, so extracting props without a type argument
resolves the route parameter to `unknown` and rejects everything. Use `LinkProps<T>['href']`
with the component generic over `T` (see `Button`), or the concrete `GuildHref`.

The route types live in `.next/types/`, so they are only correct after a build. A brand
new route reads as invalid until `yarn build` regenerates them.

**An optional catch-all does not give you its own base path.** `docs/[[...slug]]` generates
only `` `/docs/${OptionalCatchAllSlug<T>}` ``, and `OptionalCatchAllSlug<''>` is `''`, so
`/docs/` type-checks and bare `/docs` does not — it is in no `StaticRoutes` union because no
`page.tsx` sits at that segment. Splitting it into `docs/page.tsx` plus a required
`docs/[...slug]` fixes the types and is better routing anyway: `/docs` becomes a static
route and the catch-all can carry `dynamicParams = false`.

That flag is what makes an unknown slug a real 404. With a `loading.tsx` above it the
response has already started streaming by the time `notFound()` runs, so the status is
stuck at 200 and only the body says "not found" — `/docs/nope` returned 200 until
`dynamicParams = false` moved the rejection into the router, before any of it is sent.

Deleting a route folder does not remove it from `.next/dev/server/app-paths-manifest.json`
while the dev server is up. A renamed `[[...slug]]` kept shadowing its replacement and every
nested path 404'd against correct code. Touching `next.config.ts` makes Next restart itself
and rewrite the manifest, which beats killing a dev server someone else is using.

## The chart

ECharts, not a React wrapper. `ActivityChart.tsx` owns the instance in a ref;
`activity-option.ts` is a **pure function** that turns points plus a palette into the
option object. That split is the point: `activity-option.test.ts` asserts three series
with three distinct data arrays and three distinct colors without touching the DOM, which
is exactly the defect that shipped three times in the LayerChart version.

`SVGRenderer`, not canvas. It renders real DOM nodes, so `ActivityChart.test.tsx` can
count the paths and compare their `d` attributes — jsdom has no canvas at all, so the
canvas renderer would be untestable here.

`grid.containLabel` is deprecated in ECharts 6 and **silently ignored** unless you also
`use(LegacyGridContainLabel)`; ignoring it clips the axis labels. The v6 spelling is
`outerBoundsMode: 'same'` + `outerBoundsContain: 'axisLabel'`, which is what the option
uses. ECharts logs the deprecation to stdout — read the test output, do not scroll past it.

ECharts cannot resolve `var(--chart-1)`, so `readPalette()` reads the computed custom
properties off `<html>` and the option is rebuilt whenever `useTheme().resolved` changes.
Dropping that dependency leaves the chart in the previous theme's colors.

The library is ~190 kB. `OverviewScreen` pulls it through `next/dynamic` with `ssr: false`
and a Skeleton fallback, which took that route's first load from 313 kB to 124 kB. Import
it statically and the whole dashboard pays for the chart before it is on screen.

## Module screens

All 11 follow one skeleton, so they read as one product rather than eleven forms. The
skeleton is three components in `components/modules/`, and a new module screen is mostly
a matter of filling them in:

- `ModulePage` — icon tile, `h1`, description, Docs link and the master enable switch;
  optional `aside` becomes a sticky 380px right column at `xl`. It dims and disables the
  body when the module is off, so a screen never has to handle that itself.
- `SettingsSection` — one Card with an `h4`, an optional description and children stacked
  at `gap-5`. That gap is the 20px rhythm the brief asks for; do not vary it per screen.
- `SaveBar` — sticky at the bottom of the content area, bleeding to the page edge with
  `-mx-6 sm:-mx-8`. It respects the sidebar because it lives inside the content column,
  not at the viewport edge.

State comes from `useConfigDraft`, which owns draft-vs-saved, the dirty flag and the
changed-key count that the SaveBar prints. It compares **deeply**: a shallow compare
reports a nested edit as clean and quietly loses the user's work, and editing a value
back to its original has to clear the bar or the bar cries wolf.

The conflict state is the HTTP 409 from "Decisões fechadas". **No `welcome` ele já é real**:
`useConfigDraft` recebe um `save` opcional e, quando ele existe, o 409 volta com o estado que
está de fato gravado, guardado para o `resolveConflict('reload')` usar. As outras dez telas não
passam `save` e continuam no caminho falso, onde `armConflict()` arma o estado à mão para
revisão de design. Ligar uma delas é passar o `save` — nada mais muda.

`save()` devolve `SaveState`, não `void`, e isso não é decoração: ele **resolve** tanto no
sucesso quanto no conflito, então um `.then(() => toast.success(...))` cantava vitória em cima
de um 409. Quem chama tem que olhar o retorno. Erro de validação é o único que vira `throw`,
porque aí não há estado novo para mostrar — só uma mensagem.

**A tela segue o registry, e não o contrário.** O `welcome` do dashboard mostrava DM para quem
entra e mensagem de despedida; o registry não declara nenhum dos dois, e declarava `pingMode` e
`deleteAfter` que a tela não mostrava. Ganhou o registry, que é a especificação: um campo é
declarado uma vez e de lá saem a opção do slash, o formulário e a validação. DM e despedida não
foram descartados como produto — voltam no dia em que forem declarados, e nesse dia o slash
ganha os dois junto, de graça.

**O `MessageDraft` da UI mapeia no trio do registry, e é isso que salva o editor rico.**
`mode: 'embed'` é `useEmbed: true`, `text` é `message`, `embed` é `embed`. A conversão mora em
`lib/modules/welcome.ts` (`toWelcomeConfig` / `toWelcomePatch`) e tem teste de ida e volta. Sem
esse mapeamento a escolha seria entre perder o editor ou inflar o registry com um tipo que o
slash command não consegue exibir.

**A tela oferece só as variáveis que o bot substitui de verdade.** O `mockVariables` lista dez;
o `renderMessage` do bot troca `{user}` e `{server}`, e mais nada. Oferecer `{memberCount}` num
seletor que insere um token que vai sair literal na mensagem é mentir para quem configura. O
`welcomeVariables(guildName)` devolve as duas, com o nome real do servidor como exemplo.

`MessageComposer` + `DiscordPreview` are the pair behind any screen that posts a message
(welcome, goodbye, level-up, tickets, scheduled). Variable substitution lives in
`lib/message-variables.ts` as pure functions so the preview's correctness is testable
without a DOM.

All eleven screens exist. The nine after `welcome` and `moderation` follow the same
shape, and four of them put their real logic in a pure module so it can be tested without
a DOM: `lib/automod.ts` (which rules a pasted message would trip), `lib/levels.ts` (the XP
curve), `lib/schedule.ts` (weekday set to cron), and `commandNameError` in the
custom-commands screen. Anything with judgement in it belongs in one of those, not inside
a component.

`SegmentedControl` replaced the five hand-rolled segmented button groups. It is generic
over the value type, so the options array needs no `as` casts — adding them is an eslint
error, not a style preference.

`NumberInput`'s stepper is ours because the native one cannot be styled — only removed.
`globals.css` strips `::-webkit-inner-spin-button` and sets `appearance: textfield`, and the
component draws two chevrons that reproduce `ChevronsUpDown` exactly: `-mb-1` / `-mt-1` pull
two `size-4` glyphs to the same 4px gap the single icon has, `right-1.75` on a `w-7` column
puts the right edge 13px from the border. Those numbers came from measuring the Select
trigger in the browser, not from taste — a picker and a number field sit next to each other
in the AutoMod dialog and any drift shows.

The chevrons are `tabIndex={-1}` under an `aria-hidden` wrapper. `type="number"` already
gives keyboard users Up/Down and screen readers a `spinbutton` with min and max, so making
them tabbable would add two dead stops per field — twenty on the Economy screen — for
behaviour that already exists.

Numeric settings use `NumberInput`, never a bare `type="number"` with `Number(value) || n`.
That coercion cannot be cleared: wiping "3" to type "12" lands on 1 mid-keystroke and
produces 112. `NumberInput` holds the typed text until it parses and clamps on blur.

## Testing

Vitest + jsdom + Testing Library. `yarn test` must stay green.

`tests/setup.ts` polyfills what jsdom lacks and ECharts needs: `ResizeObserver`,
`matchMedia` (which `ThemeProvider` calls on mount), and a canvas 2d context whose only
real method is `measureText` — ECharts measures text through canvas even under the SVG
renderer, and without it the console fills with jsdom "Not implemented" noise.

jsdom has no layout engine, so every element measures 0×0 and ECharts refuses to draw.
`ActivityChart.test.tsx` defines `clientWidth`/`clientHeight` on `HTMLElement.prototype`
before rendering. Any future chart test needs the same.

Mock `next/navigation` with `vi.hoisted` for anything that reads `usePathname`, as
`SidebarNav.test.tsx` does, so one file can assert several routes.

## Folder conventions

Checked against the official docs, not from memory. The App Router conventions we use:

| Convention      | Syntax                                                                     | Where                                    |
| --------------- | -------------------------------------------------------------------------- | ---------------------------------------- |
| Dynamic segment | `[guildId]`                                                                | `servers/[guildId]/`                     |
| Route group     | `(group)`                                                                  | `(authenticated)`, `(public)`, `(shell)` |
| Reserved files  | `page` `layout` `loading` `error` `not-found` `route` `template` `default` | lowercase, always                        |

A route group is **the documented way** to keep some routes out of a layout — the docs list
"opting specific route segments into sharing a layout, while keeping others out" as a use
case, and there is no other mechanism. Next has no equivalent of SvelteKit's `+page@.svelte`
breakout. That is why `(shell)` exists: the `AppShell` sits on `(shell)/layout.tsx`, so
`/setup` renders bare by being outside the group.

Screen components live next to their `page.tsx` (`AuditScreen.tsx`, `MemberDrawer.tsx`,
`*.test.tsx`). The docs call this colocation and it is safe: a folder is not routable
without a `page` or `route` file. The optional `_folder` private convention exists to avoid
colliding with future reserved names — every reserved name is lowercase and ours are
PascalCase, so there is nothing to collide with.

## Management screens

The eight non-module screens (`commands`, `members`, `cases`, `audit`, `team`, `billing`,
`settings`, `account`) share `components/management/PageHeader.tsx` instead of
`ModulePage` — they have no master switch, so the switch-and-dim behaviour would be dead
weight. `settings` and `account` still use `useConfigDraft` + `SaveBar`, which work fine
outside a module as long as the page root keeps the `p-6 sm:p-8` padding the bar bleeds
against.

`components/ui/Drawer.tsx` is the detail panel for `members` and `cases`. It always
renders a `Dialog.Title`, `sr-only` when a custom `header` is passed, because Radix warns
without one. Parents give it `key={selected?.id}` so a second row opens on a fresh tab
state instead of inheriting the previous member's.

`lib/time.ts` exports `MOCK_NOW`, a frozen instant every screen reads timestamps against.
A live `Date.now()` renders one string on the server and another in the browser, which is
a hydration mismatch. Every fixture keeps a real ISO string; only the _reference point_ is
frozen. `absoluteTime` formats in UTC for the same reason.

Plan limits carry a `kind`: a `quota` fills up and turns red near the top, an `allowance`
is something the plan grants you. Audit retention is an allowance — rendering 365/365 as a
full danger bar reads as "you are out of retention" when it means the opposite.

`findNavItem` is an exact path match and cannot see a detail route like `/cases/42`.
`findActiveNavItem` takes the longest nav path the URL sits under, and drives both the
sidebar highlight and the breadcrumbs. Overview has an empty path, so it is exact-only —
otherwise it would prefix-match every route in the app.

## What the code cannot say for itself

Comments are banned (see Rules), so the reasons live here.

`SessionProvider` has **four** states, not three, and the fourth is the point. `loading`,
`anonymous`, `signed-in` and `unconfirmed` — the last one meaning the hint cookie says there
is a session but `/auth/me` could not be reached. The first version collapsed that into
`anonymous`, and the result was the landing telling a signed-in person to sign in whenever the
API was down. A network failure is not an answer; only a **401** is. So `unconfirmed` keeps
the dashboard shortcut on offer and shows no account control at all — never the "Sign in"
button, because that is the assertion we cannot make. The truth then comes from `/servers`,
which is server-rendered and either works or redirects to login.

`LogoutScreen`'s toast carries an explicit `id`. Without it the sign-out toast rendered
**twice** — measured, 2 with the id removed and 1 with it back. `reactStrictMode: true` makes
React mount, run effects, clean up and run them again in development, and a toast with no id
is a new toast every call. `sonner/dist/index.mjs` merges into the existing toast when one
with the same id is still on screen, so the id makes the effect idempotent. The other
`toast.success` calls in `AccountPanel` are in click handlers, not effects, and are left
alone — two clicks there genuinely are two actions.

Economy's live summary lines exist to be **checked against the field above them**, not
admired. `/pay` reads "Of every 100 sent, 5 is burned and 95 arrives" on a base of 100 so
the burned figure is literally the number in the percent field; it used to say "Sending
1,000 delivers 950", where 1,000 came from nowhere and the reader had to derive 50. `/daily`
names day 1 and day 7 because the weekly total hides a x21 (0+1+...+6) that nobody can infer
from a field labelled "Streak bonus" — a reader computing it by hand gets 1,925, not 2,275.
If a derived number cannot be traced back to a visible input in one step, it is decoration.

Every input holding an amount of currency carries the symbol through `NumberInput`'s
`leading`; cooldowns and percentages do not. That is what stops "Amount 250" from being
ambiguous between coins, minutes and percent.

`lib/levels.ts` — `totalXpForLevel` is the XP to _reach_ a level and is quadratic in the
level number, so doubling the level costs four times the XP. `curve` is the knob the form
exposes. Zero XP per message is a valid setting, so nothing may divide by it.

`lib/schedule.ts` — `nextRuns` is deliberately relative and approximate. The exact clock
belongs to the server timezone, which the browser does not have. It is a sanity check on
the schedule, not a promise about wall time. An empty days array with a large count must
not spin forever.

`lib/message-variables.ts` — `{user}` is a prefix of `{user.mention}`. A naive regex, or
replacing in the wrong order, turns `{user.mention}` into `novato.mention}` and the preview
lies about what will be posted. Longest token first.

`lib/team.ts` — `assignableRoles` never returns `owner`. That seat is the Discord server
owner and cannot be handed over from this dashboard.

`components/modules/EscalationTable.tsx` — warn and kick take no duration; Discord ends
them the moment they land, so offering a duration field would be a lie. Two rules at the
same warning count is silently lossy — only the first ever runs — and the form has to say
so because the data model cannot prevent it.

`lib/automod.ts` — `untestableTriggers` exists because `spam` needs message history.
Reporting it as "would not fire" against one pasted message would tell the user their rule
is broken when it is not. `caps` needs a length floor: "OK" is 100% capitals and entirely
normal.

`components/providers/ThemeProvider.tsx` — the `dark` class is applied inside the store
subscription, not in the effect that follows the render. React runs effects child-first, so
a chart reading `getComputedStyle` in its own effect would see the previous theme's tokens
and paint light grid lines on a dark background until the next reload. `ThemeProvider.test.tsx`
locks the ordering: a child effect must already see the new class.

`app/globals.css` — `brand-mesh` paints `background-image` only, with no base colour, so it
can sit as an `absolute inset-0` overlay inside a section that already owns its background.
The gradient itself is `--mesh`, defined once per theme, so the hero and the closing CTA
follow light and dark instead of being pinned dark the way the old brand panel was.

`--text-display` (48px) and `--text-display-sm` (30px) are the landing's two h1 steps, and
both carry `font-weight: 700` in the token. That is not decoration: `text-display-sm
lg:text-display` works only because neither needs a separate `font-bold`, and adding one
would race the font-size utility for the same property at equal specificity.

`app/globals.css` — the `thin-scroll` utility. Chromium treats `scrollbar-width` and
`::-webkit-scrollbar` as mutually exclusive: set either standard property on an element
and the webkit width is ignored. `scrollbar-color` is **inherited**, and `html` sets it,
so the utility has to reset it to `auto` for the 5px to take effect. That is why the rule
is split across an `@supports selector(::-webkit-scrollbar)` branch — Firefox has no
webkit pseudo-element and keeps `thin`.

Measured on the collapsed rail: default scrollbar reserves 30px of the 64px, `thin`
reserves 20px, the webkit path reserves 10px. The collapsed nav items are a fixed
`size-10` centred with `mx-auto` rather than `w-full`, so the active pill stays a 40x40
square whatever the gutter does.

`lib/hooks/useShortcut.ts` — the search hint reads `Ctrl K` on Windows and Linux and
`⌘K` on Apple. MDN sanctions platform sniffing for exactly this case, but its snippet uses
`navigator.platform`, which TypeScript's DOM lib marks deprecated and `strictTypeChecked`
rejects. `navigator.userAgentData` is not the answer either: Safari does not implement it,
and Safari is where Mac detection matters most. So the check is a `userAgent` regex. It
runs through `useSyncExternalStore` with a non-Apple server snapshot, so the server always
renders `Ctrl K` and only an Apple client swaps it after hydration.

## React patterns the lint rules enforce

`eslint-plugin-react-hooks` v7 ships `set-state-in-effect` and `purity`, and both are
errors here. Three consequences worth knowing before writing a component:

Deriving state from a prop goes in the render body, not an effect — `NumberInput` and
`CommandPalette` keep a `lastValue`/`wasOpen` state and compare during render. An effect
would paint the stale value once and then repaint.

Reading an external store — `localStorage`, `matchMedia`, a DOM attribute set before React
boots — goes through `useSyncExternalStore` with a server snapshot. `ThemeProvider` and
`SidebarProvider` both do this. The server snapshots mirror what the `PRE_PAINT` script in
`app/layout.tsx` assumes.

`Date.now()` and `crypto.randomUUID()` cannot appear in a component body, even inside a
function only ever called from a handler. `lib/utils/id.ts` holds `newId`, which is where
every generated list-row id comes from.

## Fast Refresh boundaries

`react-refresh/only-export-components` is an error, using the plugin's `next` preset so the
framework's own exports (`metadata`, `generateStaticParams`, `dynamic`, …) are allowed. A
file that exports a component **and** anything else stops being a refresh boundary, and
editing it full-reloads the page instead of hot-swapping.

That is why contexts and their hooks live apart from the provider that fills them:
`theme-context.ts` holds the context, `useTheme` and `isDark`; `ThemeProvider.tsx` holds
only the component. Same split for `sidebar-context.ts` and `tooltip-provider.ts`. Screen
helpers went to `lib/` for the same reason — `commandNameError` to `lib/commands.ts`,
`formatCountdown` to `lib/time.ts`.

## Things that look removable but are not

The inline `PRE_PAINT` script in `app/layout.tsx` sets the `dark` class and the
`data-sidebar` attribute before first paint. Moving it into a component, making it async,
or dropping `dangerouslySetInnerHTML` for a `<Script>` brings back a white flash and a
sidebar that paints at 260px then snaps to 64px, on every load.

`app/globals.css` uses `@theme inline` for the semantic tokens. Without `inline`, Tailwind
freezes the value at build time and `bg-surface` stops following the theme.

Raw elevation values are named `--elevation-1..3`, not `--shadow-*`. Tailwind owns the
`--shadow-*` namespace to generate `shadow-1`, `shadow-2`, `shadow-3`; reusing the name
for the raw value makes the mapping in `@theme inline` self-referential.

`--danger-on` is white in light and `#0f172a` in dark, and the two are not interchangeable.
White on the dark theme's `--danger` (`#f87171`) measures 2.77:1 and fails WCAG 1.4.3;
dark text on it measures 6.45:1. Light theme is the other way round — white on `#dc2626`
is 4.83:1. `Reset all XP` is the button that made this visible.

`--switch-off` is `#64748b`, not `border-strong`. `border-strong` scores 1.5:1 against
the surface and fails WCAG 1.4.11, which needs 3:1 for UI components.

`--chart-1..4` order is load-bearing. Teal next to pink fails deuteranopia separation;
amber between them is what makes the set pass. Assign in order, never cycle, never
substitute a value.

The sidebar's collapsed state is CSS, not React. The pre-paint script stamps
`data-sidebar="collapsed"` on `<html>` and the `sidebar-collapsed` variant in
`globals.css` does the rest. `useSidebar().collapsed` exists only for behaviour that CSS
cannot express: showing the tooltip while collapsed, and flipping the toggle's icon.

`--on-light` and `--on-dark` are the only color tokens that do **not** flip with the theme.

`readableTextOn()` picks between them by luminance, and the threshold is **0.1985**, not the
0.45 it shipped with. 0.45 is the midpoint of the lightness range and has nothing to do with
contrast; the real crossover is where white and `--on-light` tie, which solves to
`sqrt(1.05 * (L(on-light) + 0.05)) - 0.05`. With 0.45, fifteen of the twenty-six avatar and
role colours in the mocks got the _worse_ of the two — `#38bdf8` was handed white at 2.14:1
when dark text gives 8.33:1. `contrast.test.ts` re-derives the tie from the tokens in
`globals.css` and asserts the function flips there, so changing `--on-light` fails the test
instead of silently rotting the threshold.
They are text over a color that comes from data — a server avatar, a Discord role color —
and `readableTextOn()` in `lib/utils/contrast.ts` picks between them by luminance.

`Tooltip` takes `asChild`. A nav item is an `<a>` and Radix's `Tooltip.Trigger` renders a
`<button>`; without `asChild` the link would nest inside a button.

`TooltipProvider` in the root layout is required, not decorative. Radix's tooltip root
reads that context and throws without it. The same shape of bug already shipped once:
`<Toaster />` outside `<ThemeProvider>` crashed the prerender, and only `yarn build`
caught it — `tsc` and `eslint` both passed.

Radix's `Select.Content` needs `position="popper"` for `--radix-select-trigger-width` to
exist at all. Without it the dropdown ignores the trigger's width.

The Inter subset covers latin + latin-ext and **not** General Punctuation. Measured by
comparing `measureText` under `14px Inter` against a font that does not exist: `—` (U+2014)
and `–` (U+2013) come from a fallback face, while `’` `“` `…` `−` `·` are all in Inter. Em
dashes therefore render in whatever the OS supplies, which is why they sit slightly off
next to Inter text. Re-subsetting is the fix; nothing in the CSS can reach it.

Economy's currency symbol is a free `maxLength={3}` text field, not a picker, because
servers want their own emoji. The mock used to default to `◈` (U+25C8) — also outside the
subset, also drawn by whatever font the OS picks, which is why it looked alien and differed
per machine. It now defaults to an emoji, and `SYMBOL_PRESETS` offers six that render
everywhere. Emoji always resolve through the system emoji face, so they are the safe
choice; geometric symbols are not.

Fonts are self-hosted in `public/fonts/`, never a CDN. Inter is a variable font subset
to latin + latin-ext; `font-optical-sizing: auto` on `body` drives its `opsz` axis and
must stay. Re-subsetting needs `--layout-features='*'` or kerning and ligatures are lost.

## Commands

```bash
yarn dev        # dev server
yarn build      # production build; also regenerates .next/types
yarn check      # tsc --noEmit, must stay at 0 errors
yarn lint       # prettier --check + eslint
yarn format     # prettier --write
yarn test       # vitest run
yarn test:watch # vitest
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
