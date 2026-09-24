export const editorialSections = ["Markets", "Climate", "Trade", "Logistics", "Policy", "Finance", "Companies", "Technology"];
export const storyTypes = ["News", "Analysis", "Explainer", "Data", "Interview", "Opinion", "Briefing"];

export type ComposerBlock = { eyebrow: string; title: string; body: string[] };

export type ComposerDraft = {
  id?: string;
  status: string;
  correctionNote: string;
  title: string;
  slug: string;
  dek: string;
  kicker: string;
  section: string;
  storyType: string;
  region: string;
  country: string;
  commodity: string;
  featuredImageUrl: string;
  imageCredit: string;
  blocks: ComposerBlock[];
  sources: string;
  metaTitle: string;
  metaDescription: string;
  socialCopy: string;
  sponsorName: string;
  sponsorDisclosure: string;
  scheduledAt: string;
  includeInBrief: boolean;
  checks: {
    primarySource: boolean;
    figuresChecked: boolean;
    imageRights: boolean;
    headlineSupported: boolean;
  };
};

export function blankDraft(): ComposerDraft {
  return {
    status: "draft",
    correctionNote: "",
    title: "",
    slug: "",
    dek: "",
    kicker: "",
    section: "Markets",
    storyType: "News",
    region: "East Africa",
    country: "Tanzania",
    commodity: "",
    featuredImageUrl: "",
    imageCredit: "",
    blocks: [
      { eyebrow: "THE MOVE", title: "", body: [""] },
      { eyebrow: "WHY IT MATTERS", title: "", body: [""] },
      { eyebrow: "THE NUMBERS", title: "", body: [""] },
      { eyebrow: "WATCH", title: "", body: [""] },
    ],
    sources: "",
    metaTitle: "",
    metaDescription: "",
    socialCopy: "",
    sponsorName: "",
    sponsorDisclosure: "",
    scheduledAt: "",
    includeInBrief: true,
    checks: {
      primarySource: false,
      figuresChecked: false,
      imageRights: false,
      headlineSupported: false,
    },
  };
}

export function draftReadiness(draft: ComposerDraft) {
  const bodyReady = draft.blocks.some(block => block.title.trim() && block.body.some(p => p.trim()));
  const sourceCount = draft.sources.split("\n").filter(line => /^https?:\/\//i.test(line.trim().split("|")[0])).length;
  const checksReady = Object.values(draft.checks).every(Boolean);
  const missing = [
    !draft.title.trim() && "headline",
    !draft.dek.trim() && "standfirst",
    !bodyReady && "story body",
    !draft.featuredImageUrl.trim() && "featured image",
    !draft.imageCredit.trim() && "image credit",
    sourceCount < 1 && "at least one source",
    !draft.metaDescription.trim() && "SEO description",
    !checksReady && "editorial checklist",
    draft.status === "published" && draft.correctionNote.trim().length < 8 && "correction/update note",
  ].filter(Boolean) as string[];
  return { ready: missing.length === 0, missing, sourceCount };
}
