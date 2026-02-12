# Playwright Core API Coverage

This report tracks `effect-playwright` coverage of **Playwright core automation APIs**.

## Scope

Included:
- Browser lifecycle and connection (`BrowserType`, `Browser`, `BrowserContext`)
- Page, frame, locator automation
- Common runtime artifacts used by events (request/response/dialog/download/worker/file chooser)

Excluded from scope:
- `@playwright/test` (test runner, fixtures, reporters)
- Tracing/video/HAR-focused APIs
- Codegen / UI mode / runner tooling

## Coverage Summary

| Area | Coverage | Notes |
| --- | --- | --- |
| `Playwright` service lifecycle entrypoints | Implemented (6/6) | `launch`, `launchScoped`, `launchPersistentContext`, `launchPersistentContextScoped`, `connectCDP`, `connectCDPScoped` |
| `Browser` core automation | Partial (7/8) | High-value APIs wrapped; remainder available via `browser.use((raw) => ...)` |
| `BrowserContext` core automation | Partial (3/29) | High-value APIs wrapped; remainder available via `context.use((raw) => ...)` |
| `Page` core automation | Partial (15/97) | High-value APIs wrapped; remainder available via `page.use((raw) => ...)` |
| `Frame` core automation | Partial (14/60) | High-value APIs wrapped; remainder available via `frame.use((raw) => ...)` |
| `Locator` core automation | Partial (12/65) | High-value APIs wrapped; remainder available via `locator.use((raw) => ...)` |

## Detailed Mapping

### `Playwright` service

Covered directly:
- `launch`(...)
- `launchScoped`(...)
- `launchPersistentContext`(...)
- `launchPersistentContextScoped`(...)
- `connectCDP`(...)
- `connectCDPScoped`(...)

### `Browser`

Covered directly (7/8):
- `browserType`, `close`, `contexts`, `isConnected`, `newContext`, `newPage`, `version`

Fallback coverage:
- Unsupported methods via `browser.use((raw) => ...)`

### `BrowserContext`

Covered directly (3/29):
- `close`, `newPage`, `pages`

Fallback coverage:
- Unsupported methods via `context.use((raw) => ...)`

### `Page`

Covered directly (15/97):
- `click`, `close`, `evaluate`, `frames`, `getByLabel`, `getByRole`, `getByTestId`, `getByText`, `goto`, `locator`, `reload`, `title`, `url`, `waitForLoadState`, `waitForURL`

Fallback coverage:
- Unsupported methods via `page.use((raw) => ...)`

### `Frame`

Covered directly (14/60):
- `click`, `content`, `evaluate`, `getByLabel`, `getByRole`, `getByTestId`, `getByText`, `goto`, `locator`, `name`, `title`, `url`, `waitForLoadState`, `waitForURL`

Fallback coverage:
- Unsupported methods via `frame.use((raw) => ...)`

### `Locator`

Covered directly (12/65):
- `click`, `count`, `evaluate`, `fill`, `first`, `getAttribute`, `innerHTML`, `innerText`, `inputValue`, `last`, `nth`, `textContent`

Fallback coverage:
- Unsupported methods via `locator.use((raw) => ...)`

## Direct Missing APIs (Core Scope)

The lists below are a direct name-level diff between Playwright interfaces in `playwright-core@1.58.2` and this library's service interfaces.

Rules used for this report:
- `on`/`off`/`once` style emitter APIs are treated as intentionally replaced by `eventStream`.
- Tracing/video/HAR-specific APIs are listed separately as excluded (`startTracing`, `stopTracing`, `tracing`, `video`, `routeFromHAR`).
- Everything else below is a direct wrapper gap (still accessible through `use`).

### Browser

Missing direct wrappers in core scope (1):

`newBrowserCDPSession`

Missing direct wrappers excluded from this report scope (9):

`addListener`, `off`, `on`, `once`, `prependListener`, `removeAllListeners`, `removeListener`, `startTracing`, `stopTracing`

### BrowserContext

Missing direct wrappers in core scope (26):

`addCookies`, `addInitScript`, `backgroundPages`, `browser`, `clearCookies`, `clearPermissions`, `clock`, `cookies`, `exposeBinding`, `exposeFunction`, `grantPermissions`, `newCDPSession`, `request`, `route`, `routeWebSocket`, `serviceWorkers`, `setDefaultNavigationTimeout`, `setDefaultTimeout`, `setExtraHTTPHeaders`, `setGeolocation`, `setHTTPCredentials`, `setOffline`, `storageState`, `unroute`, `unrouteAll`, `waitForEvent`

Missing direct wrappers excluded from this report scope (9):

`addListener`, `off`, `on`, `once`, `prependListener`, `removeAllListeners`, `removeListener`, `routeFromHAR`, `tracing`

### Page

Missing direct wrappers in core scope (82):

`$`, `$$`, `$$eval`, `$eval`, `addInitScript`, `addLocatorHandler`, `addScriptTag`, `addStyleTag`, `bringToFront`, `check`, `clock`, `consoleMessages`, `content`, `context`, `coverage`, `dblclick`, `dispatchEvent`, `dragAndDrop`, `emulateMedia`, `evaluateHandle`, `exposeBinding`, `exposeFunction`, `fill`, `focus`, `frame`, `frameLocator`, `getAttribute`, `getByAltText`, `getByPlaceholder`, `getByTitle`, `goBack`, `goForward`, `hover`, `innerHTML`, `innerText`, `inputValue`, `isChecked`, `isClosed`, `isDisabled`, `isEditable`, `isEnabled`, `isHidden`, `isVisible`, `keyboard`, `mainFrame`, `mouse`, `opener`, `pageErrors`, `pause`, `pdf`, `press`, `removeLocatorHandler`, `request`, `requestGC`, `requests`, `route`, `routeWebSocket`, `screenshot`, `selectOption`, `setChecked`, `setContent`, `setDefaultNavigationTimeout`, `setDefaultTimeout`, `setExtraHTTPHeaders`, `setInputFiles`, `setViewportSize`, `tap`, `textContent`, `touchscreen`, `type`, `uncheck`, `unroute`, `unrouteAll`, `viewportSize`, `waitForEvent`, `waitForFunction`, `waitForNavigation`, `waitForRequest`, `waitForResponse`, `waitForSelector`, `waitForTimeout`, `workers`

Missing direct wrappers excluded from this report scope (9):

`addListener`, `off`, `on`, `once`, `prependListener`, `removeAllListeners`, `removeListener`, `routeFromHAR`, `video`

### Frame

Missing direct wrappers in core scope (46):

`$`, `$$`, `$$eval`, `$eval`, `addScriptTag`, `addStyleTag`, `check`, `childFrames`, `dblclick`, `dispatchEvent`, `dragAndDrop`, `evaluateHandle`, `fill`, `focus`, `frameElement`, `frameLocator`, `getAttribute`, `getByAltText`, `getByPlaceholder`, `getByTitle`, `hover`, `innerHTML`, `innerText`, `inputValue`, `isChecked`, `isDetached`, `isDisabled`, `isEditable`, `isEnabled`, `isHidden`, `isVisible`, `page`, `parentFrame`, `press`, `selectOption`, `setChecked`, `setContent`, `setInputFiles`, `tap`, `textContent`, `type`, `uncheck`, `waitForFunction`, `waitForNavigation`, `waitForSelector`, `waitForTimeout`

### Locator

Missing direct wrappers in core scope (53):

`all`, `allInnerTexts`, `allTextContents`, `and`, `ariaSnapshot`, `blur`, `boundingBox`, `check`, `clear`, `contentFrame`, `dblclick`, `describe`, `description`, `dispatchEvent`, `dragTo`, `elementHandle`, `elementHandles`, `evaluateAll`, `evaluateHandle`, `filter`, `focus`, `frameLocator`, `getByAltText`, `getByLabel`, `getByPlaceholder`, `getByRole`, `getByTestId`, `getByText`, `getByTitle`, `highlight`, `hover`, `isChecked`, `isDisabled`, `isEditable`, `isEnabled`, `isHidden`, `isVisible`, `locator`, `or`, `page`, `press`, `pressSequentially`, `screenshot`, `scrollIntoViewIfNeeded`, `selectOption`, `selectText`, `setChecked`, `setInputFiles`, `tap`, `toString`, `type`, `uncheck`, `waitFor`

## Gap Policy

Not every core Playwright method is wrapped one-by-one. This is intentional to keep the public API small and aligned with Effect:
- High-frequency methods get first-class Effect APIs.
- Remaining methods stay available through typed escape hatches (`use`).

