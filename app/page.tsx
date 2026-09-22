import Link from "next/link";
import { articles, marketRows } from "@/lib/data";
import { StoryCard } from "@/components/StoryCard";
import { NewsletterForm } from "@/components/NewsletterForm";

export default function Home() {
  const [lead, ...rest] = articles;
  return (
    <main>
      <section className="heroShell">
        <div className="heroKicker">MARS / INTELLIGENCE</div>
        <div className="heroGrid">
          <article className={"leadStory accent-" + lead.accent}>
            <div className="storyMeta"><span>{lead.section}</span><span>{lead.region}</span></div>
            <Link href={"/article/" + lead.slug}><h1>{lead.title}</h1></Link>
            <p className="leadDek">{lead.dek}</p>
            <div className="byline">{lead.author} · {lead.publishedAt}</div>
          </article>
          <Link className="heroImagePanel" href={"/article/" + lead.slug}>
            <img src={lead.image} alt="" />
            <span>{lead.imageCredit}</span>
          </Link>
          <div className="heroSide">
            <StoryCard story={rest[0]} compact />
            <StoryCard story={rest[1]} compact />
          </div>
        </div>
      </section>

      <section className="glance">
        <div className="sectionTitleRow">
          <h2>Africa at a glance</h2>
          <span>Signals worth watching now</span>
        </div>
        <div className="glanceGrid">
          <div className="glanceMap" aria-hidden="true">
            <div className="africaShape">AFRICA<span className="pulse p1" /><span className="pulse p2" /><span className="pulse p3" /></div>
          </div>
          <ol className="glanceList">
            <li><span>1</span><p><strong>Tanzania</strong> Export economics increasingly hinge on inland logistics and quality aggregation.</p></li>
            <li><span>2</span><p><strong>East Africa</strong> Climate anomalies matter most when layered against crop calendars.</p></li>
            <li><span>3</span><p><strong>Regional trade</strong> Policy notices can reprice reachable demand overnight.</p></li>
            <li><span>4</span><p><strong>Input markets</strong> Financing conditions can be as important as physical fertilizer supply.</p></li>
          </ol>
        </div>
      </section>

      <section className="newsGridSection">
        <div className="sectionTitleRow"><h2>Latest intelligence</h2><Link href="/search">Search all →</Link></div>
        <div className="storyGrid">
          {rest.slice(2).map(story => <StoryCard story={story} key={story.slug} />)}
        </div>
      </section>

      <section className="marketDesk">
        <div>
          <div className="eyebrowBlock">MARKET DESK</div>
          <h2>Price is only half the story.</h2>
          <p>MARS is designed to put commodity prices beside freight, weather, policy and verified trade events.</p>
          <Link className="textArrow" href="/section/markets">Open markets →</Link>
        </div>
        <div className="marketTable">
          <div className="marketTableHead"><span>Instrument</span><span>Last</span><span>Move</span></div>
          {marketRows.map(row => <div className="marketTableRow" key={row.name}>
            <strong>{row.name}</strong><span>{row.value}</span><em className={row.direction === "up" ? "positive" : "negative"}>{row.move}</em>
          </div>)}
          <small>Illustrative prototype data — not trading advice.</small>
        </div>
      </section>

      <section className="climateBand">
        <div className="climateCopy">
          <div className="eyebrowBlock">CLIMATE SIGNAL</div>
          <h2>Weather becomes useful when it meets a crop calendar.</h2>
          <p>The production data layer will connect rainfall anomalies, planting stages and market exposure instead of publishing generic forecasts.</p>
          <Link className="pillLink" href="/section/climate">Explore climate</Link>
        </div>
        <div className="climateGraphic" aria-label="Decorative climate anomaly visualization">
          {[34,68,45,88,55,72,41,91,63,52,78,47].map((h,i)=><i key={i} style={{height: h + "%"}} />)}
        </div>
      </section>

      <section className="grainxBand">
        <div><span className="miniLabel">ACTION LAYER</span><h2>Intelligence → opportunity.</h2></div>
        <p>When a story reveals real buying or selling intent, readers can move from analysis into Grain X without turning the newsroom into an ad.</p>
        <a className="grainxButton" href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
      </section>

      <section className="briefing" id="brief">
        <div className="briefingCopy">
          <span className="miniLabel">THE MARS BRIEF</span>
          <h2>The African food economy before your first meeting.</h2>
          <p>Markets, climate, trade, logistics and the one chart that matters. Built for operators, exporters, investors and policy teams.</p>
        </div>
        <NewsletterForm />
      </section>
    </main>
  );
}
