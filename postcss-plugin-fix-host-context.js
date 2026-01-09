// PostCSS plugin to handle :host-context() pseudo-classes for Ionic CSS
export default function fixHostContext() {
  return {
    postcssPlugin: 'postcss-fix-host-context',
    Once(root) {
      root.walkRules((rule) => {
        // Transform :host-context() to a valid selector
        if (rule.selector && rule.selector.includes(':host-context')) {
          // Replace :host-context([dir=rtl]) with [dir=rtl] for RTL support
          rule.selector = rule.selector.replace(
            /:host-context\(\[dir=rtl\]\)/g,
            '[dir=rtl]'
          );
          // Remove other :host-context() occurrences by replacing with empty string
          // This keeps the rest of the selector intact
          rule.selector = rule.selector.replace(
            /:host-context\([^)]+\)/g,
            ''
          );
        }
      });
    },
  };
}

fixHostContext.postcss = true;

