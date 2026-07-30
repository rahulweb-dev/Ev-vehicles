/**
 * /compare layout — public page, no sidebar.
 * The root layout already provides Navbar + Footer via ConditionalShell.
 * This layout passes children through so Next.js picks up
 * the compare-specific loading.js skeleton correctly.
 */
export default function CompareLayout({ children }) {
  return <>{children}</>;
}
