import Link from "next/link";
import { marketRows } from "@/lib/data";
import { getHomepageArticles, type PublishedArticle } from "@/lib/content";
import { NewsletterForm } from "@/components/NewsletterForm";

function MiniStory({ story }: { story: PublishedArticle }) {
  return (
    <article className={"miniStory accentLine-" + story.accent}>
      <div className="storyLabel">{story.section}</div>
      <Link href={"/article/" + story.slug}><h3>{story.title}</h3></Link>
      <p>{story.dek}</p>
      <div className="creditLine">{story.author}{story.isPrototype ? " · Prototype" : ""}</div>
    </article>
  );
}

export const revalidate = 60;

export default async function Home() {
  const articles = await getHomepageArticles(6);
  const lead = articles[0];

  return (
    <main className="semaHome">
      <section className="topStories">
        <article className="heroLead">
          <div className="storyLabel">{lead.section}{lead.isPrototype ? " / PROTOTYPE" : ""}</div>
          <Link href={"/article/" + lead.slug}><h1>{lead.title}</h1></Link>
          <p className="heroStandfirst">{lead.dek}</p>
          <div className="creditLine">{lead.author} · {lead.publishedAt}</div>
        </article>

        <Link className="heroPhoto" href={"/article/" + lead.slug}>
          <img src={lead.image} alt="" />
          <span>{lead.imageCredit}</span>
        </Link>

        <div className="topRail">
          <MiniStory story={articles[1]} />
          <MiniStory story={articles[2]} />
        </div>
      </section>

      <section className="viewBand">
        <div className="viewItem">
          <span>View /</span>
          <Link href={"/article/" + articles[3].slug}>{articles[3].title}</Link>
          <small>{articles[3].author}</small>
        </div>
        <div className="viewItem">
          <span>Signal /</span>
          <Link href={"/article/" + articles[4].slug}>{articles[4].title}</Link>
          <small>{articles[4].author}</small>
        </div>
      </section>

      <section className="glanceModule">
        <div className="moduleHeading">
          <h2>Africa at a Glance</h2>
          <span>Markets, climate, trade and logistics</span>
        </div>
        <div className="glanceBody">
          <div className="africaPanel">
            <div className="continentWord">AFRICA</div>
            <i className="mapDot dot1" /><i className="mapDot dot2" /><i className="mapDot dot3" /><i className="mapDot dot4" />
          </div>
          <ol className="glanceItems">
            <li><span>1</span><p><strong>Tanzania:</strong> logistics and quality aggregation increasingly determine export economics.</p></li>
            <li><span>2</span><p><strong>East Africa:</strong> rainfall becomes commercially useful when tied to crop calendars and procurement.</p></li>
            <li><span>3</span><p><strong>Regional trade:</strong> policy notices can change reachable demand before price charts catch up.</p></li>
            <li><span>4</span><p><strong>Input markets:</strong> credit, currency and dealer liquidity shape whether supply reaches farms.</p></li>
            <li><span>5</span><p><strong>Ports:</strong> food trade needs corridor intelligence, not just harvest reporting.</p></li>
            <li><span>6</span><p><strong>Markets:</strong> MARS connects price, freight, climate and verified events.</p></li>
          </ol>
        </div>
      </section>

      <section className="briefStrip" id="brief">
        <div className="briefStripCopy">
          <span className="storyLabel">THE MARS BRIEF</span>
          <h2>Africa&apos;s food economy before your first meeting.</h2>
          <p>A concise morning briefing for operators, exporters, investors, policy teams and anyone moving food across the continent.</p>
        </div>
        <NewsletterForm />
      </section>

      <section className="deskSection">
        <div className="deskHeader"><Link href="/markets">Markets</Link><span>Price, demand and the forces moving both.</span></div>
        <div className="deskGrid">
          <MiniStory story={articles[5]} />
          <div className="marketBoard">
            <div className="marketBoardHead"><span>Market Board</span><small>Prototype data</small></div>
            {marketRows.map(row => (
              <div className="marketBoardRow" key={row.name}><strong>{row.name}</strong><span>{row.value}</span><em className={row.direction === "up" ? "positive" : "negative"}>{row.move}</em></div>
            ))}
          </div>
          <div className="deskNote">
            <span className="storyLabel">WHY MARS</span>
            <h3>Price is only half the story.</h3>
            <p>Commodity intelligence becomes more useful when freight, rainfall, rules and counterparties sit next to the price.</p>
            <Link href="/markets">Open Markets →</Link>
          </div>
        </div>
      </section>

      <section className="deskSection">
        <div className="deskHeader"><Link href="/section/climate">Climate</Link><span>Weather as a market input.</span></div>
        <div className="featureGrid">
          <article className="featureStory">
            <img src={articles[1].image} alt="" />
            <div className="storyLabel">{articles[1].section}</div>
            <Link href={"/article/" + articles[1].slug}><h2>{articles[1].title}</h2></Link>
            <p>{articles[1].dek}</p>
          </article>
          <article className="colorPanel colorPanelBlue">
            <span className="storyLabel">CLIMATE SIGNAL</span>
            <h2>Local crop context beats generic weather alerts.</h2>
            <p>MARS connects rainfall anomalies with planting stages, road access and market exposure.</p>
            <Link href="/section/climate">Explore Climate →</Link>
          </article>
        </div>
      </section>

      <section className="deskSection">
        <div className="deskHeader"><Link href="/section/trade">Trade & Logistics</Link><span>Where opportunity meets movement.</span></div>
        <div className="threeUp">
          {[articles[2],articles[4],articles[0]].map(story => (
            <article className={"feedCard accentLine-" + story.accent} key={story.slug}>
              <img src={story.image} alt="" />
              <div className="storyLabel">{story.section}</div>
              <Link href={"/article/" + story.slug}><h3>{story.title}</h3></Link>
              <p>{story.dek}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grainxCallout">
        <div><span className="storyLabel">FROM INTELLIGENCE TO ACTION</span><h2>See demand. Find supply. Move.</h2></div>
        <p>MARS stays useful as an editorial product on its own. When a story reveals real commercial intent, Grain X becomes the action layer.</p>
        <a href="https://grainx.xyz" target="_blank" rel="noreferrer">Open Grain X ↗</a>
      </section>
    </main>
  );
}
