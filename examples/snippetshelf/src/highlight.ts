import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import type { Language } from "./api/snippets";

// Shiki loads only the languages and themes listed here, and the JavaScript
// regex engine replaces the WebAssembly one, so the bundle stays small
// (APP-18). This module is imported lazily, so its code is a separate chunk.
let highlighter: Promise<HighlighterCore> | undefined;

function load(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
    langs: [import("shiki/langs/rust.mjs"), import("shiki/langs/typescript.mjs")],
    engine: createJavaScriptRegexEngine(),
  });
  return highlighter;
}

/**
 * The code as a HTML syntax tree, with both themes' colours as CSS variables
 * on each token. React renders the tree, so no HTML string reaches the page
 * and the Content-Security-Policy needs no inline styles (EMB-6).
 */
export async function highlight(code: string, language: Language) {
  const loaded = await load();
  return loaded.codeToHast(code, {
    lang: language,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
