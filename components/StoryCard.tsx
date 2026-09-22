import Link from "next/link";
import type { Article } from "@/lib/data";

export function StoryCard({ story, compact = false }: { story: Article; compact?: boolean }) {
  return (
    <article className={"storyCard accent-" + story.accent + (compact ? " compact" : "")}>
      {!compact && <Link className="storyImageWrap" href={"/article/" + story.slug}>
        <img className="storyImage" src={story.image} alt="" />
      </Link>}
      <div className="storyMeta"><span>{story.section}</span><span>{story.country}</span></div>
      <Link href={"/article/" + story.slug}><h3>{story.title}</h3></Link>
      <p>{story.dek}</p>
      <div className="byline">{story.author} · {story.readTime}</div>
    </article>
  );
}
