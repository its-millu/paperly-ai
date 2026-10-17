
import Link from "next/link";

const features = [
  {
    number: "01",
    icon: "✳",
    title: "Personalized for you",
    description:
      "Choose your interests and discover a daily selection of stories that matter to you.",
  },
  {
    number: "02",
    icon: "◉",
    title: "Less noise, more signal",
    description:
      "Spend less time scrolling through endless feeds and more time understanding the world.",
  },
  {
    number: "03",
    icon: "↗",
    title: "Original sources",
    description:
      "Follow available links to publishers and explore the full stories behind the headlines.",
  },
  {
    number: "04",
    icon: "♡",
    title: "Learns from feedback",
    description:
      "Like stories, skip irrelevant ones, and help shape the editions you receive in the future.",
  },
  {
    number: "05",
    icon: "▤",
    title: "Your daily edition",
    description:
      "Enjoy an editorial newspaper layout designed for a calmer, more focused reading experience.",
  },
  {
    number: "06",
    icon: "↓",
    title: "Keep your newspaper",
    description:
      "Save past editions and download newspaper-style PDFs when those features are available.",
  },
];

const steps = [
  {
    number: "01",
    title: "Choose your interests",
    description:
      "Tell Paperly which topics you care about, from AI and technology to science, business, and world news.",
  },
  {
    number: "02",
    title: "Get your daily edition",
    description:
      "Discover a curated collection of relevant stories arranged into your personal newspaper.",
  },
  {
    number: "03",
    title: "Make it yours",
    description:
      "Read, explore original sources, skip stories, and use your feedback to improve future editions.",
  },
];

const faqs = [
  {
    question: "What is Paperly AI?",
    answer:
      "Paperly AI is a personalized newspaper experience that brings relevant news stories together in one place.",
  },
  {
    question: "How does personalization work?",
    answer:
      "You select your interests and can react to stories. Your preferences and feedback can help guide future recommendations.",
  },
  {
    question: "Can I read the original articles?",
    answer:
      "Yes. When a source link is available, you can follow it to the publisher's original article.",
  },
  {
    question: "Can I download a newspaper PDF?",
    answer:
      "Paperly is designed to support downloadable newspaper-style PDF editions. Actual downloads depend on the PDF feature being implemented in the app.",
  },
  {
    question: "Can I revisit previous editions?",
    answer:
      "Paperly is designed to support edition history so you can return to previous newspapers when that feature is implemented.",
  },
];

export default function HomePage() {
  return (
    <main className="paperly">
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <header className="site-nav">
        <Link href="/" className="brand" aria-label="Paperly home">
          <span className="brand-icon">p.</span>
          <span>
            paperly<span className="brand-dot">.</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="nav-login">
            Log in
          </Link>
          <Link href="/login" className="button button-small">
            Get started <span>↗</span>
          </Link>
        </div>
      </header>

      <section className="hero section-shell">
        <div className="hero-copy reveal">
          <div className="eyebrow">
            <span className="pulse-dot" />
            YOUR PERSONAL AI NEWSPAPER
          </div>

          <h1>
            The world is loud.
            <br />
            <span className="gradient-text">Your paper isn&apos;t.</span>
          </h1>

          <p className="hero-subtitle">
            A more thoughtful way to stay informed. Discover stories shaped
            around your interests in your own daily newspaper.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="button">
              Create my newspaper <span>↗</span>
            </Link>
            <a href="#how-it-works" className="text-button">
              See how it works <span>↓</span>
            </a>
          </div>

          <div className="hero-note">
            <span className="note-icon">✳</span>
            <div>
              <strong>Your interests. Your edition.</strong>
              <span>Less noise. More signal.</span>
            </div>
          </div>
        </div>

        <div className="hero-art reveal">
          <div className="art-halo art-halo-one" />
          <div className="art-halo art-halo-two" />

          <div className="floating-pill floating-pill-top hide-on-mobile">
  <span className="pill-symbol">✳</span>
  <span>
    <strong>Made for you</strong>
    <small>Personalized reading</small>
  </span>
</div>

          <article className="newspaper">
            <div className="newspaper-meta">
              <span>YOUR DAILY EDITION</span>
              <span className="live-label">
                <i /> PERSONAL
              </span>
            </div>

            <div className="newspaper-brand">
              <span>p.</span>paperly
            </div>

            <p className="newspaper-date">A MORE THOUGHTFUL MORNING</p>
            <div className="paper-divider" />

            <div className="cover-story">
              <span className="story-kicker">
                <i /> THE BIG IDEA
              </span>
              <h2>
                A new era
                <br />
                of intelligence
              </h2>
              <p>The ideas shaping what comes next.</p>
              <div className="cover-art" aria-hidden="true">
                <div className="cover-grid" />
                <div className="cover-sphere sphere-one" />
                <div className="cover-sphere sphere-two" />
                <span>01</span>
              </div>
            </div>

            <div className="mini-story">
              <span className="mini-number">02</span>
              <div>
                <span className="mini-category">TECHNOLOGY</span>
                <h3>Ideas that move the future forward</h3>
                <small>4 min read</small>
              </div>
            </div>

            <div className="mini-story">
              <span className="mini-number">03</span>
              <div>
                <span className="mini-category">SCIENCE & CULTURE</span>
                <h3>Curiosity, one discovery at a time</h3>
                <small>6 min read</small>
              </div>
            </div>

            <div className="newspaper-footer">
              <span>YOUR WORLD, CONSIDERED.</span>
              <span>✳ PAPERLY AI</span>
            </div>
          </article>

          {/* <div className="floating-pill floating-pill-bottom hide-on-mobile">
            <span className="check-icon">✓</span>
            <span>
              <strong>Your daily ritual</strong>
              <small>A little more informed</small>
            </span>
          </div> */}

          <span className="decor-star decor-star-one">✳</span>
          <span className="decor-star decor-star-two">✦</span>
        </div>
      </section>

      <section className="trust-strip section-shell">
        <div className="trust-item">
          <span>01</span>
          <div>
            <strong>Curated around you</strong>
            <p>Stories that match your interests.</p>
          </div>
        </div>
        <div className="trust-separator" />
        <div className="trust-item">
          <span>02</span>
          <div>
            <strong>Clarity over clutter</strong>
            <p>A calmer way to read the news.</p>
          </div>
        </div>
        <div className="trust-separator" />
        <div className="trust-item">
          <span>03</span>
          <div>
            <strong>Yours to revisit</strong>
            <p>Designed for daily reading.</p>
          </div>
        </div>
      </section>

      <section className="intro-section section-shell">
        <div className="intro-heading">
          <span className="section-label">A DIFFERENT KIND OF NEWS</span>
          <h2>
            Stay curious.
            <br />
            <span className="gradient-text">Skip the chaos.</span>
          </h2>
        </div>
        <div className="intro-content">
          <p>
            Keeping up with the world shouldn&apos;t mean opening twenty tabs
            or scrolling through an endless stream of headlines.
          </p>
          <p>
            Paperly brings your interests into one thoughtful reading
            experience, helping you spend more time understanding what
            matters and less time searching for it.
          </p>
          <Link href="/login" className="inline-link">
            Find your perspective <span>↗</span>
          </Link>
        </div>
      </section>

      <section className="features-section section-shell" id="features">
        <div className="section-heading">
          <span className="section-label">THOUGHTFULLY DESIGNED FOR YOU</span>
          <h2>
            Your news.
            <br />
            <span className="gradient-text">Your way.</span>
          </h2>
          <p>
            Everything you need for a more personal, focused reading ritual.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature) => (
            <article className="feature-card" key={feature.number}>
              <div className="feature-card-top">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-number">{feature.number}</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="feature-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="how-section section-shell" id="how-it-works">
        <div className="how-copy">
          <span className="section-label">THREE SIMPLE STEPS</span>
          <h2>
            A better way
            <br />
            <span className="gradient-text">to stay in the know.</span>
          </h2>
          <p>
            No complicated setup. Just your interests, your edition, and a
            more considered way to read.
          </p>
          <Link href="/login" className="button">
            Build my edition <span>↗</span>
          </Link>
        </div>

        <div className="steps-list">
          {steps.map((step) => (
            <article className="step-card" key={step.number}>
              <span className="step-number">{step.number}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
              <span className="step-arrow">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="personal-section section-shell">
        <div className="interest-visual">
          <div className="interest-orbit orbit-a" />
          <div className="interest-orbit orbit-b" />

          <div className="interest-panel">
            <span className="section-label">YOUR READING WORLD</span>
            <h3>What moves you?</h3>
            <p>Your edition starts with what you&apos;re curious about.</p>

            <div className="interest-tags">
              <span>✳ Artificial Intelligence</span>
              <span>◉ Technology</span>
              <span>↗ Business</span>
              <span>⌁ Science</span>
              <span>♡ Culture</span>
              <span>◎ World news</span>
            </div>

            <div className="interest-panel-footer">
              <i /> YOUR INTERESTS, YOUR EDITION
            </div>
          </div>
          <span className="interest-decoration decoration-a">✳</span>
          <span className="interest-decoration decoration-b">✦</span>
        </div>

        <div className="personal-copy">
          <span className="section-label">BUILT AROUND YOUR CURIOSITY</span>
          <h2>
            Not another feed.
            <br />
            <span className="gradient-text">A better point of view.</span>
          </h2>
          <p>
            Your interests aren&apos;t the same as everyone else&apos;s.
            Your newspaper shouldn&apos;t be either.
          </p>
          <p>
            Start with the topics you care about. Give feedback as you read.
            Your preferences can help guide a more relevant selection of
            stories over time.
          </p>
          <Link href="/login" className="inline-link">
            Make it personal <span>↗</span>
          </Link>
        </div>
      </section>

      <section className="edition-section section-shell">
        <div className="edition-copy">
          <span className="section-label">MORE THAN A MOMENT</span>
          <h2>
            Read today.
            <br />
            <span className="gradient-text">Keep the perspective.</span>
          </h2>
          <p>
            Discover stories, follow links to original publishers, and build
            a reading habit that feels like your own.
          </p>

          <ul className="edition-checklist">
            <li><span>✓</span> A clean newspaper-inspired layout</li>
            <li><span>✓</span> Links to available original sources</li>
            <li><span>✓</span> A design made for focused reading</li>
            <li><span>✓</span> Support for a downloadable edition</li>
          </ul>

          <Link href="/login" className="button">
            Start reading smarter <span>↗</span>
          </Link>
        </div>

        <div className="edition-visual">
          <div className="edition-back edition-back-two">
            <span>YOUR WORLD, CONSIDERED.</span>
          </div>
          <div className="edition-back edition-back-one">
            <span>THE DAILY EDITION</span>
          </div>
          <div className="edition-front">
            <div className="edition-masthead">paperly<span>.</span></div>
            <p className="edition-date">YOUR PERSONAL DAILY EDITION</p>
            <div className="paper-divider" />
            <div className="edition-cover-story">
              <span>THE BIG IDEA</span>
              <h3>A clearer view of a changing world.</h3>
              <p>The ideas and discoveries worth making time for.</p>
              <div className="edition-cover-art">
                <div />
                <div />
                <div />
              </div>
            </div>
            <div className="edition-mini">
              <span>02 / TECHNOLOGY</span>
              <strong>What&apos;s shaping tomorrow?</strong>
            </div>
            <div className="edition-mini">
              <span>03 / SCIENCE</span>
              <strong>New questions, new discoveries.</strong>
            </div>
            <div className="edition-bottom">✳ MADE FOR YOUR CURIOSITY</div>
          </div>
          {/* <div className="edition-float">
            <span>↓</span> A paper worth keeping
          </div> */}
        </div>
      </section>

      <section className="faq-section section-shell" id="faq">
        <div className="faq-heading">
          <span className="section-label">GOOD QUESTIONS</span>
          <h2>
            Curious?
            <br />
            <span className="gradient-text">We&apos;ve got you.</span>
          </h2>
          <p>A few things to know before creating your first edition.</p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => (
            <details className="faq-item" key={faq.question}>
              <summary>
                <span className="faq-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="faq-question">{faq.question}</span>
                <span className="faq-toggle">+</span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="final-cta section-shell">
        <div className="final-cta-symbol">✳</div>
        <span className="section-label">A BETTER MORNING STARTS HERE</span>
        <h2>
          Your next edition
          <br />
          <span className="gradient-text">is waiting.</span>
        </h2>
        <p>
          Make space for the stories that matter to you.
          Start building a more thoughtful reading habit today.
        </p>
        <Link href="/login" className="button final-button">
          Create my newspaper <span>↗</span>
        </Link>
        <span className="final-note">YOUR WORLD. YOUR DAILY PAPER.</span>
      </section>

      <footer className="site-footer section-shell">
        <Link href="/" className="brand footer-brand">
          <span className="brand-icon">p.</span>
          <span>
            paperly<span className="brand-dot">.</span>
          </span>
        </Link>

        <p>Your world. Your daily paper.</p>

        <nav aria-label="Footer navigation">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link href="/login">Log in</Link>
          <Link href="/login">Get started</Link>
        </nav>

        <span className="copyright">© 2026 PAPERLY AI</span>
      </footer>
    </main>
  );
}