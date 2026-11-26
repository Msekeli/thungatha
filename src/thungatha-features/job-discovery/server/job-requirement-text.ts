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
const HTML_TAG = /<\/?[a-z][^>]*>/i;

const DOUBLE_ENCODED_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

/** Decode one additional entity layer left behind by imported job feeds. */
function decodeCharacterReferences(value: string) {
  return value.replace(
    /&(#(?:x[\da-f]+|\d+)|[a-z][a-z\d]+);/gi,
    (match, reference: string) => {
      if (reference[0] === "#") {
        const hexadecimal = reference[1]?.toLowerCase() === "x";
        const codePoint = Number.parseInt(
          reference.slice(hexadecimal ? 2 : 1),
          hexadecimal ? 16 : 10,
        );
        if (
          !Number.isFinite(codePoint) ||
          codePoint <= 0 ||
          codePoint > 0x10ffff ||
          (codePoint >= 0xd800 && codePoint <= 0xdfff)
        ) {
          return "\uFFFD";
        }
        return String.fromCodePoint(codePoint);
      }
      return DOUBLE_ENCODED_ENTITIES[reference.toLowerCase()] ?? match;
    },
  );
}

function normalizeText(value: string) {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/[\t\f\v ]+/g, " ")
    .replace(/ *\n+ */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Produces the canonical readable representation of a job description.
 * parse5 decodes named, decimal and hexadecimal character references while
 * preserving block boundaries and preventing markup from leaking into text.
 */
export function jobDescriptionToText(description: string) {
  const root = parseFragment(description) as unknown as HtmlNode;
  const output: string[] = [];

  function visit(node: HtmlNode) {
    const tag = node.tagName?.toLowerCase();
    if (tag && IGNORED_TAGS.has(tag)) return;
    if (node.nodeName === "#text") {
      if (node.value) output.push(decodeCharacterReferences(node.value));
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
  return normalizeText(output.join(""));
}

export function sourceSegments(description: string) {
  const isHtml = HTML_TAG.test(description);
  const text = jobDescriptionToText(description);
  const blocks = text.split(/\n+/);
  const segments = isHtml
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
