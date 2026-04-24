// Inlined pre-hydration theme setter — prevents flash of wrong theme.
// Must be rendered in <head> before the body to run synchronously.
export default function ThemeScript() {
  const code = `
(function() {
  try {
    var saved = localStorage.getItem('kopf-theme');
    var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = saved || (prefersLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
  `.trim();
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
