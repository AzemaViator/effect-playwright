import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

const rootDir = process.cwd();
const reportPath = path.join(rootDir, "PLAYWRIGHT_CORE_API_COVERAGE.md");

const EVENT_EMITTER_METHODS = new Set([
  "addListener",
  "off",
  "on",
  "once",
  "prependListener",
  "removeAllListeners",
  "removeListener",
]);

const OUT_OF_SCOPE_METHODS = new Set([
  "routeFromHAR",
  "startTracing",
  "stopTracing",
  "tracing",
  "video",
]);

const coverageAreas = [
  {
    label: "Browser",
    coreInterface: "Browser",
    wrapperInterface: "PlaywrightBrowserService",
    wrapperFile: "src/browser.ts",
    fallback: "browser.use((raw) => ...)",
  },
  {
    label: "BrowserContext",
    coreInterface: "BrowserContext",
    wrapperInterface: "PlaywrightBrowserContextService",
    wrapperFile: "src/browser-context.ts",
    fallback: "context.use((raw) => ...)",
  },
  {
    label: "Page",
    coreInterface: "Page",
    wrapperInterface: "PlaywrightPageService",
    wrapperFile: "src/page.ts",
    fallback: "page.use((raw) => ...)",
  },
  {
    label: "Frame",
    coreInterface: "Frame",
    wrapperInterface: "PlaywrightFrameService",
    wrapperFile: "src/frame.ts",
    fallback: "frame.use((raw) => ...)",
  },
  {
    label: "Locator",
    coreInterface: "Locator",
    wrapperInterface: "PlaywrightLocatorService",
    wrapperFile: "src/locator.ts",
    fallback: "locator.use((raw) => ...)",
  },
];

const reportExcludedMethods = [
  "startTracing",
  "stopTracing",
  "tracing",
  "video",
  "routeFromHAR",
];

const coreTypesSource = parseTypeScriptSource(
  path.join(rootDir, "node_modules/playwright-core/types/types.d.ts"),
);

const playwrightSource = parseTypeScriptSource(
  path.join(rootDir, "src/playwright.ts"),
);
const playwrightServiceMembers = new Set(
  getInterfaceMemberNames(playwrightSource, "PlaywrightService"),
);
const playwrightLifecycleEntrypoints = [
  "launch",
  "launchScoped",
  "launchPersistentContext",
  "launchPersistentContextScoped",
  "connectCDP",
  "connectCDPScoped",
].filter((name) => playwrightServiceMembers.has(name));

const coverage = coverageAreas.map((area) =>
  computeCoverage(area, coreTypesSource, rootDir),
);

const lines = [
  "# Playwright Core API Coverage",
  "",
  "This report tracks `effect-playwright` coverage of **Playwright core automation APIs**.",
  "",
  "## Scope",
  "",
  "Included:",
  "- Browser lifecycle and connection (`BrowserType`, `Browser`, `BrowserContext`)",
  "- Page, frame, locator automation",
  "- Common runtime artifacts used by events (request/response/dialog/download/worker/file chooser)",
  "",
  "Excluded from scope:",
  "- `@playwright/test` (test runner, fixtures, reporters)",
  "- Tracing/video/HAR-focused APIs",
  "- Codegen / UI mode / runner tooling",
  "",
  "## Coverage Summary",
  "",
  "| Area | Coverage | Notes |",
  "| --- | --- | --- |",
  `| \`Playwright\` service lifecycle entrypoints | Implemented (${playwrightLifecycleEntrypoints.length}/6) | ${playwrightLifecycleEntrypoints.map((name) => `\`${name}\``).join(", ")} |`,
  ...coverage.map((area) => {
    const status = area.missingInScope.length === 0 ? "Implemented" : "Partial";
    return `| \`${area.label}\` core automation | ${status} (${area.coveredInScope.length}/${area.inScopeCore.length}) | High-value APIs wrapped; remainder available via \`${area.fallback}\` |`;
  }),
  "",
  "## Detailed Mapping",
  "",
  "### `Playwright` service",
  "",
  "Covered directly:",
  ...playwrightLifecycleEntrypoints.map((name) => `- \`${name}\`(...)`),
  "",
  ...coverage.flatMap((area) => [
    `### \`${area.label}\``,
    "",
    `Covered directly (${area.coveredInScope.length}/${area.inScopeCore.length}):`,
    `- ${toInlineCodeList(area.coveredInScope)}`,
    "",
    "Fallback coverage:",
    `- Unsupported methods via \`${area.fallback}\``,
    "",
  ]),
  "## Direct Missing APIs (Core Scope)",
  "",
  "The lists below are a direct name-level diff between Playwright interfaces in `playwright-core@1.58.2` and this library's service interfaces.",
  "",
  "Rules used for this report:",
  "- `on`/`off`/`once` style emitter APIs are treated as intentionally replaced by `eventStream`.",
  `- Tracing/video/HAR-specific APIs are listed separately as excluded (${reportExcludedMethods.map((name) => `\`${name}\``).join(", ")}).`,
  "- Everything else below is a direct wrapper gap (still accessible through `use`).",
  "",
  ...coverage.flatMap((area) => [
    `### ${area.label}`,
    "",
    `Missing direct wrappers in core scope (${area.missingInScope.length}):`,
    "",
    toInlineCodeList(area.missingInScope),
    "",
    ...(area.missingExcluded.length > 0
      ? [
          `Missing direct wrappers excluded from this report scope (${area.missingExcluded.length}):`,
          "",
          toInlineCodeList(area.missingExcluded),
          "",
        ]
      : []),
  ]),
  "## Gap Policy",
  "",
  "Not every core Playwright method is wrapped one-by-one. This is intentional to keep the public API small and aligned with Effect:",
  "- High-frequency methods get first-class Effect APIs.",
  "- Remaining methods stay available through typed escape hatches (`use`).",
  "",
];

fs.writeFileSync(reportPath, `${lines.join("\n")}\n`);
console.log(`Wrote ${path.relative(rootDir, reportPath)}`);

function parseTypeScriptSource(absolutePath) {
  const contents = fs.readFileSync(absolutePath, "utf8");
  return ts.createSourceFile(
    absolutePath,
    contents,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function getInterfaceDeclaration(sourceFile, interfaceName) {
  let found;

  const visit = (node) => {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.getText(sourceFile) === interfaceName
    ) {
      found = node;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (found === undefined) {
    throw new Error(
      `Could not find interface '${interfaceName}' in ${sourceFile.fileName}`,
    );
  }

  return found;
}

function getInterfaceMemberNames(sourceFile, interfaceName) {
  const iface = getInterfaceDeclaration(sourceFile, interfaceName);
  const names = new Set();

  for (const member of iface.members) {
    if (member.name === undefined) {
      continue;
    }

    if (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name)) {
      names.add(member.name.text);
    }
  }

  return [...names].sort((a, b) => a.localeCompare(b));
}

function computeCoverage(area, coreSource, root) {
  const wrapperSource = parseTypeScriptSource(
    path.join(root, area.wrapperFile),
  );
  const coreMethods = getInterfaceMemberNames(coreSource, area.coreInterface);
  const wrapperMethods = getInterfaceMemberNames(
    wrapperSource,
    area.wrapperInterface,
  );
  const wrapperSet = new Set(wrapperMethods);

  const covered = coreMethods.filter((name) => wrapperSet.has(name));
  const isExcluded = (name) =>
    EVENT_EMITTER_METHODS.has(name) || OUT_OF_SCOPE_METHODS.has(name);

  const inScopeCore = coreMethods.filter((name) => !isExcluded(name));
  const coveredInScope = covered.filter((name) => !isExcluded(name));
  const missingInScope = inScopeCore.filter((name) => !wrapperSet.has(name));
  const missingExcluded = coreMethods.filter(
    (name) => isExcluded(name) && !wrapperSet.has(name),
  );

  return {
    ...area,
    coveredInScope,
    inScopeCore,
    missingExcluded,
    missingInScope,
  };
}

function toInlineCodeList(items) {
  if (items.length === 0) {
    return "_None_";
  }

  return items.map((item) => `\`${item}\``).join(", ");
}
