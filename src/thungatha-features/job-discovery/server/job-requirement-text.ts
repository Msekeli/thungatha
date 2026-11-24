import { parseFragment } from "parse5";

type HtmlNode = {
  nodeName: string;
  tagName?: string;
  value?: string;
  childNodes?: HtmlNode[];
};

const BLOCK_TAGS = new Set([
  "address",
  "article",
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "li",
  "main",
  "ol",
  "p",
  "pre",
  "section",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);
const IGNORED_TAGS = new Set(["script", "style", "template", "noscript"]);

function htmlToStructuredText(markup: string) {
  const root = parseFragment(markup) as unknown as HtmlNode;
  const output: string[] = [];

  function visit(node: HtmlNode) {
    const tag = node.tagName?.toLowerCase();
    if (tag && IGNORED_TAGS.has(tag)) return;

    if (node.nodeName === "#text") {
      if (node.value) output.push(node.value);
      return;
    }

    if (tag === "br" || tag === "hr") {
      output.push("\n");
      return;
    }
    if (tag === "li") output.push("\n• ");
    else if (tag && BLOCK_TAGS.has(tag)) output.push("\n");

    for (const child of node.childNodes ?? []) visit(child);

    if (tag && BLOCK_TAGS.has(tag)) output.push("\n");
  }

  visit(root);
  return output
    .join("")
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n+ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sourceSegments(description: string) {
  const text = htmlToStructuredText(description);
  const blocks = text.split(/\n+/);
  const segments = /<\/?[a-z][^>]*>/i.test(description)
    ? blocks
    : blocks.flatMap((block) => block.split(/(?<=[.!?;])\s+/));

  return segments
    .map((part) =>
      part
        .replace(/^[•▪◦*-]\s*/, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((part) => part.length > 0);
}
