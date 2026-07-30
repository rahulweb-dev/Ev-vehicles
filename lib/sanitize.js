import sanitizeHtml from "sanitize-html";

/**
 * Sanitize article HTML content on the server before saving to MongoDB.
 * Allows the rich-text tags editors produce but strips scripts, event handlers,
 * and dangerous attributes that could XSS readers.
 */
export function sanitizeArticleContent(html) {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags: [
      // Structure
      "h1","h2","h3","h4","h5","h6","p","div","section","article",
      "blockquote","pre","code","kbd","samp",
      // Lists
      "ul","ol","li","dl","dt","dd",
      // Inline
      "strong","b","em","i","u","s","del","ins","mark","small","sub","sup","span",
      // Media
      "img","figure","figcaption","picture","source","video","iframe",
      // Table
      "table","thead","tbody","tfoot","tr","th","td","caption","colgroup","col",
      // Links & misc
      "a","br","hr","details","summary",
    ],
    allowedAttributes: {
      "*":      ["class","id","style"],
      "a":      ["href","target","rel","title"],
      "img":    ["src","alt","width","height","loading","decoding","srcset","sizes"],
      "iframe": ["src","width","height","frameborder","allowfullscreen","loading","title","allow"],
      "video":  ["src","controls","width","height","poster","preload","loop","muted","autoplay"],
      "source": ["src","type","srcset","media"],
      "th":     ["scope","colspan","rowspan"],
      "td":     ["colspan","rowspan"],
      "ol":     ["start","type"],
      "li":     ["value"],
      "details":["open"],
    },
    allowedIframeDomains: ["www.youtube.com","youtube.com","player.vimeo.com","www.google.com"],
    allowedSchemes:       ["http","https","mailto","tel"],
    allowedSchemesByTag: {
      img: ["http","https","data"],
    },
    transformTags: {
      // Force external links to open safely
      a(tagName, attribs) {
        const href = attribs.href || "";
        const isExternal = /^https?:\/\//.test(href) && !href.includes("evradar.in");
        return {
          tagName,
          attribs: {
            ...attribs,
            ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
          },
        };
      },
    },
  });
}

/** Escape plain text for safe embedding in HTML attributes. */
export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
