import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import { BrandCloudScene } from "./BrandCloudScene";
import { ProofThreeScene } from "./ProofThreeScene";

const benefits = [
  {
    title: "Sell your contract faster.",
    highlight: "faster",
    icon: "/assets/benefit-loop.svg",
    description: "Most of our sellers find a buyer within 30 days.",
  },
  {
    title: "Keep more money from your sale.",
    highlight: "more money",
    icon: "/assets/price-icon.svg",
    description: "We use advanced market data to help you set the right price, negotiate with confidence, and take home more.",
  },
  {
    title: "Reach more DVC buyers.",
    highlight: "DVC buyers",
    icon: "/assets/benefit-reach.svg",
    description: "Get your contract seen on a leading DVC resale search platform, where active buyers are already comparing ownership options.",
  },
  {
    title: "Manage your sale in one place.",
    highlight: "in one place",
    icon: "/assets/benefit-guidance.svg",
    description: "Our seller portal makes it easy to track progress and see what comes next, without digging through your inbox.",
  },
];

const reviews = [
  ["/assets/reviewer-1.png", "I just checked DVC For Less every day or two for a few months to find the right deal I wanted."],
  ["/assets/reviewer-2.png", "Stalk DVCForLess.com and then pounce."],
  ["/assets/reviewer-3.png", "DVC For Less is a GREAT site…so much info."],
  ["/assets/reviewer-4.png", "The easiest place to compare the contracts that actually fit us."],
  ["/assets/reviewer-5.png", "We kept coming back until the right listing appeared."],
  ["/assets/reviewer-2.png", "The filters made it easy to understand the real resale market."],
  ["/assets/reviewer-3.png", "This was the first place we sent friends who were ready to buy."],
  ["/assets/reviewer-1.png", "Clear details, no guessing, and every contract in one place."],
];

const journeySteps = [
  { title: "Set the asking price", description: "Your specialist reviews your contract against current market activity and recommends an asking price." },
  { title: "Go to Market", description: "Your listing is presented to active DVC buyers with the ownership details they need to decide." },
  { title: "Consider your offers", description: "We explain every offer clearly and help you compare price, timing, and terms." },
  { title: "Complete the sale", description: "We coordinate the paperwork and closing details so your transfer can finish smoothly." },
];

const faqs: Array<{ question: string; answer: string[] }> = [
  {
    question: "Does getting an estimate commit me to selling?",
    answer: ["No. The estimate gives you a starting point based on recent DVC resale activity. You can review the result, talk with a specialist, or leave and return later."],
  },
  {
    question: "What happens when I continue with my estimate?",
    answer: [
      "We bring the details from your estimate into a short series of questions about your contract. You can review the information, add another contract if needed, and tell us how to reach you.",
      "After you submit the details, a DVC For Less specialist reviews them and contacts you to discuss the sale. Submitting your information does not publish a listing.",
    ],
  },
  {
    question: "How is my recommended listing price determined?",
    answer: ["We look at your resort, contract size, Use Year, available points, deed expiration when applicable, and recent resale activity. A specialist then reviews the estimate against current listings and the details of your contract before recommending an asking price."],
  },
  {
    question: "How much does it cost to sell with DVC For Less?",
    answer: ["Our standard commission is 9.5% of the final sale price. For contracts listed with us during our introductory period, the commission is 8.5%."],
  },
  {
    question: "How long does it take to sell a DVC contract?",
    answer: [
      "Most well-priced DVC contracts find a buyer within 30 days. Your resort, contract size, available points, asking price, and current buyer demand can make that time shorter or longer.",
      "After you accept an offer and the sale agreement is signed, most transactions close in about six to eight weeks. Disney's review, title work, and the return of documents and funds can affect the closing date.",
    ],
  },
  {
    question: "Can I sell a contract that still has a loan balance?",
    answer: ["In many cases, yes. We will need to know the approximate balance so your specialist can help you understand the expected proceeds and what will need to be paid when the sale closes."],
  },
  {
    question: "What happens to my upcoming reservations?",
    answer: ["An upcoming reservation may affect when or how you sell the contract. Tell us about any scheduled stays when you share your contract details, and your specialist will explain the available options before the contract is listed."],
  },
  {
    question: "Do banked or borrowed points affect my contract's value?",
    answer: ["Yes. Buyers consider how many points are currently available and when future points become available. That is why the valuation asks for three years of point availability rather than only the contract's annual point allotment."],
  },
  {
    question: "Can I sell more than one contract?",
    answer: ["Yes. You can submit more than one contract at the same time. Because each contract has its own deed, points, Use Year, and point availability, we review and list each one separately. You can follow all of your sales from the same DVC For Less Seller Dashboard."],
  },
  {
    question: "What is Disney's Right of First Refusal?",
    answer: [
      "After you accept an offer, Disney has the right to purchase your contract at the same price and terms. Disney currently responds in about 20 to 30 days.",
      "If Disney waives that right, the sale continues with your original buyer. If Disney exercises it, Disney takes the buyer's place. Your agreed price and terms do not change, although some of the closing paperwork may be handled differently.",
    ],
  },
  {
    question: "When will I receive the proceeds from my sale?",
    answer: ["The title company disburses the proceeds after the transaction closes and the required documents and funds have been received."],
  },
];

const owlStoryFrames = Array.from(
  { length: 14 },
  (_, index) => `/assets/owl-sprites-14-trimmed/owl-sprite-${String(index + 1).padStart(2, "0")}.png`,
);

const clampProgress = (value: number) => Math.min(1, Math.max(0, value));

function SectionKicker({ children }: { children: string }) {
  return (
    <div className="section-kicker">
      <span>{children}</span>
      <img src="/assets/section-underline.svg" alt="" />
    </div>
  );
}

function WhySellSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isVisible = useInView(sectionRef, { once: true, amount: 0.28 });
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  return (
    <section className="why-feature-section content-section" id="why-sell" ref={sectionRef}>
      <div className="why-feature-sticky">
        <div className="section-inner why-feature-inner">
          <SectionKicker>Why Sell with us?</SectionKicker>
          <h2 className="section-title why-feature-title"><span>Everything we know about DVC resale,</span><span>working for you.</span></h2>
          <div className="feature-card-grid">
            {benefits.map((benefit, index) => (
              <div className={`feature-float-shell feature-float-shell-${index + 1} ${selectedCard === index ? "is-selected" : ""}`} key={benefit.title}>
                <FeatureShowcaseCard benefit={benefit} index={index} visible={isVisible} selected={selectedCard === index} onSelect={() => setSelectedCard(index)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureShowcaseCard({ benefit, index, visible, selected, onSelect }: { benefit: (typeof benefits)[number]; index: number; visible: boolean; selected: boolean; onSelect: () => void }) {
  const reduceMotion = useReducedMotion();
  const [animationMode, setAnimationMode] = useState<"idle" | "playing" | "settled" | "looping">(reduceMotion ? "settled" : "idle");
  const startTimerRef = useRef(0);
  const settleTimerRef = useRef(0);
  const title = benefit.title.replace(/\.$/, "");
  const highlightAt = title.toLowerCase().indexOf(benefit.highlight.toLowerCase());
  const titleBefore = title.slice(0, highlightAt);
  const titleHighlight = title.slice(highlightAt, highlightAt + benefit.highlight.length);
  const titleAfter = title.slice(highlightAt + benefit.highlight.length);

  useEffect(() => {
    window.clearTimeout(startTimerRef.current);
    window.clearTimeout(settleTimerRef.current);
    if (reduceMotion) {
      setAnimationMode("settled");
      return;
    }
    if (!visible) {
      setAnimationMode("idle");
      return;
    }

    const settleDurations = [5400, 4600, 4500, 5200];
    startTimerRef.current = window.setTimeout(() => {
      setAnimationMode("playing");
      settleTimerRef.current = window.setTimeout(() => setAnimationMode("settled"), settleDurations[index]);
    }, index * 260);

    return () => {
      window.clearTimeout(startTimerRef.current);
      window.clearTimeout(settleTimerRef.current);
    };
  }, [index, reduceMotion, visible]);

  const replayAnimation = () => {
    window.clearTimeout(startTimerRef.current);
    window.clearTimeout(settleTimerRef.current);
    if (!reduceMotion) setAnimationMode("looping");
  };

  const settleAnimation = () => {
    window.clearTimeout(startTimerRef.current);
    window.clearTimeout(settleTimerRef.current);
    setAnimationMode("settled");
  };

  return (
    <motion.article
      className={`feature-showcase-card feature-showcase-card-${index + 1} is-${animationMode} ${selected ? "is-selected" : ""}`}
      initial={reduceMotion ? false : { opacity: 0, x: -56, y: 26, scale: 0.985 }}
      animate={reduceMotion || visible ? { opacity: 1, x: 0, y: 0, scale: 1 } : { opacity: 0, x: -56, y: 26, scale: 0.985 }}
      transition={{ duration: 0.95, delay: reduceMotion ? 0 : index * 0.2, ease: [0.16, 1, 0.3, 1] }}
      onPointerEnter={replayAnimation}
      onPointerLeave={settleAnimation}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
    >
      <BenefitMotion index={index} animationMode={animationMode} />
      <div className="feature-showcase-copy">
        <h3>
          {index === 0 ? <>{titleBefore.trim()}<br /><span>{titleHighlight}</span>{titleAfter}</> : <>{titleBefore}<span>{titleHighlight}</span>{titleAfter}</>}
        </h3>
        <p>{benefit.description}</p>
      </div>
    </motion.article>
  );
}

function BenefitMotion({ index, animationMode }: { index: number; animationMode: "idle" | "playing" | "settled" | "looping" }) {
  return (
    <div className={`flat-feature-motion flat-feature-motion-${index + 1}`} aria-hidden="true">
      {index === 0 && (
        <div className="flat-offer-animation">
          <div className="flat-folder">
            <span className="flat-folder-back" />
            <span className="flat-offer-sheet flat-offer-sheet-a"><small>$16,•••</small><i /><i /><i /></span>
            <span className="flat-offer-sheet flat-offer-sheet-b"><small>$17,•••</small><i /><i /><i /></span>
            <span className="flat-offer-sheet flat-offer-sheet-c"><small>$16,•••</small><i /><i /><i /></span>
            <span className="flat-offer-sheet flat-offer-sheet-d"><small>$17,•••</small><i /><i /><i /></span>
            <span className="flat-offer-sheet flat-offer-sheet-picked"><b>BEST</b><small>$17,400</small><i /><i /></span>
            <span className="flat-folder-front" />
          </div>
          <span className="flat-offer-scanner"><i /><i /><i /><b /></span>
          <div className="flat-offer-timer">
            <span>BUYER FOUND IN</span>
            <OfferDayCounter animationMode={animationMode} />
          </div>
        </div>
      )}
      {index === 1 && (
        <div className="flat-price-animation">
          <div className="flat-price-track"><span className="flat-price-zone flat-price-zone-low" /><span className="flat-price-zone flat-price-zone-right" /><span className="flat-price-zone flat-price-zone-high" /><i /></div>
          <div className="flat-price-labels"><span>Low</span><strong>Right price</strong><span>High</span></div>
          <div className="flat-coin-pocket">
            <small>ESTIMATED RETURN</small>
            <span className="flat-continuous-coins">{Array.from({ length: 6 }, (_, coin) => <i className={`flat-continuous-coin-${coin + 1}`} key={coin}>$</i>)}</span>
          </div>
        </div>
      )}
      {index === 2 && (
        <div className="flat-buyer-animation">
          <span className="flat-contract-core"><small>DVC RESALE</small><strong>CONTRACT</strong><i /><i /><i /><em>Owner signature</em></span>
          {[1, 2, 3, 4, 5, 6].map((node) => <i className={`flat-person flat-person-${node}`} key={node}><b /></i>)}
          <span className="flat-search-ring flat-search-ring-a" />
          <span className="flat-search-ring flat-search-ring-b" />
          <span className="flat-search-ring flat-search-ring-c" />
        </div>
      )}
      {index === 3 && (
        <div className="flat-dashboard-animation">
          <span className="flat-task flat-task-a"><i className="flat-sign-document"><b /></i><small>SIGN</small></span>
          <span className="flat-task flat-task-b"><i className="flat-price-calculator"><em>$15,200</em><b /><b /><b /><b /></i><small>PRICE</small></span>
          <span className="flat-task flat-task-c"><i className="flat-offer-stack"><b /><b /><b /></i><small>OFFER</small></span>
          <span className="flat-dashboard">
            <i className="flat-dashboard-nav" />
            <span className="flat-dashboard-head"><b /><i /></span>
            <span className="flat-dashboard-chart"><i /></span>
            <span className="flat-dashboard-metrics"><b /><b /><b /></span>
          </span>
        </div>
      )}
    </div>
  );
}

function OfferDayCounter({ animationMode }: { animationMode: "idle" | "playing" | "settled" | "looping" }) {
  const reduceMotion = useReducedMotion();
  const [day, setDay] = useState(reduceMotion || animationMode === "settled" ? 18 : 1);

  useEffect(() => {
    if (reduceMotion || animationMode === "settled") {
      setDay(18);
      return;
    }
    if (animationMode === "idle") {
      setDay(1);
      return;
    }

    let timer = 0;
    let currentDay = 1;
    setDay(currentDay);
    const advance = () => {
      if (currentDay === 18) {
        timer = window.setTimeout(() => {
          currentDay = 1;
          setDay(currentDay);
          timer = window.setTimeout(advance, 100);
        }, 3000);
        return;
      }

      currentDay += 1;
      setDay(currentDay);
      const delay = currentDay < 10 ? 90 : currentDay < 15 ? 150 : 260;
      timer = window.setTimeout(advance, delay);
    };

    timer = window.setTimeout(advance, 280);
    return () => window.clearTimeout(timer);
  }, [animationMode, reduceMotion]);

  return (
    <strong className={day === 18 ? "is-found" : ""}>
      <b>{String(day).padStart(2, "0")}</b><em>days</em><i>FOUND</i>
    </strong>
  );
}

function ProofCardOne() {
  const copyRef = useRef<HTMLElement>(null);
  const copyVisible = useInView(copyRef, { once: true, amount: 0.4 });
  const paragraphs = [
    "DVC For Less averages more than 60,000 visits a month.",
    "Buyers come here to compare resorts, points, Use Years, available points, and prices before deciding which contract to pursue.",
    "When you sell with us, your contract becomes part of the marketplace they are already using.",
  ];
  return (
    <div className="proof-card proof-card-marketplace">
      <video className="marketplace-video" autoPlay muted loop playsInline preload="metadata" poster="/assets/resort-grand-californian.png">
        <source src="/assets/proof-ferris-wheel.mp4" type="video/mp4" />
      </video>
      <div className="marketplace-shade" />
      <article className="proof-copy-card" ref={copyRef}>
        <h3>60,000 +</h3>
        <h4>visits a month</h4>
        <div className="proof-copy-paragraphs">
          {paragraphs.map((paragraph, index) => (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={copyVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
              transition={{ duration: 0.55, delay: index * 0.5, ease: [0.22, 1, 0.36, 1] }}
              key={paragraph}
            >
              {paragraph}
            </motion.p>
          ))}
        </div>
      </article>
    </div>
  );
}

function ReviewBubble({ avatar, quote, index, progress }: { avatar: string; quote: string; index: number; progress: MotionValue<number> }) {
  const start = 0.18 + index * 0.06;
  const opacity = useTransform(progress, [start, Math.min(start + 0.1, 0.96)], [0, 1]);
  const x = useTransform(progress, [start, Math.min(start + 0.1, 0.96)], [34, 0]);

  return (
    <motion.div className={`review-bubble review-${index + 1}`} style={{ opacity, x }}>
      <span className="quote-mark">“</span><img src={avatar} alt="" /><em>{quote}</em><span className="quote-mark closing">”</span>
    </motion.div>
  );
}

function ProofCardTwo({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="proof-card proof-card-community">
      <ProofThreeScene progress={progress} />
      <div className="review-bubbles" aria-label="DVC owner comments">
        {reviews.map(([avatar, quote], index) => <ReviewBubble avatar={avatar} quote={quote} index={index} progress={progress} key={quote} />)}
      </div>
      <article className="community-copy-card">
        <h3><strong>DVC Owners</strong> recommend us.</h3>
        <p>When someone asks where to search the resale market, DVC For Less is often part of the answer. People recommend it in Reddit threads and Disney forums, return throughout their search, and tell other buyers to start here.</p>
      </article>
    </div>
  );
}

function ProofScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const firstGrow = useTransform(scrollYProgress, [0, 0.32, 0.66, 1], [1.82, 1, 0.42, 0.42]);
  const secondGrow = useTransform(scrollYProgress, [0, 0.32, 0.66, 1], [0.22, 1, 1.62, 1.62]);

  return (
    <section className="proof-scroll" ref={sectionRef} aria-label="Why DVC owners choose DVC For Less">
      <div className="proof-sticky">
        <div className="proof-stage proof-stage-desktop">
          <motion.div className="proof-position proof-position-first" style={{ flexGrow: reduceMotion ? 1 : firstGrow }}>
            <ProofCardOne />
          </motion.div>
          <motion.div className="proof-position proof-position-second" style={{ flexGrow: reduceMotion ? 1 : secondGrow }}>
            <ProofCardTwo progress={scrollYProgress} />
          </motion.div>
          <div className="proof-progress" aria-hidden="true"><motion.span style={{ scaleX: scrollYProgress }} /></div>
        </div>
        <div className="proof-mobile-stack">
          <ProofCardOne />
          <ProofCardTwo progress={scrollYProgress} />
        </div>
      </div>
    </section>
  );
}

function ProgressBrandStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const firstHeadingLineOne = "DVC For Less has spent years";
  const firstHeadingLineTwo = "helping people navigate the DVC resale market.";
  const firstHeading = `${firstHeadingLineOne} ${firstHeadingLineTwo}`;
  const secondHeading = "We’re DVC owners, too.";
  const [firstTypedLength, setFirstTypedLength] = useState(reduceMotion ? firstHeading.length : 0);
  const [secondTypedLength, setSecondTypedLength] = useState(reduceMotion ? secondHeading.length : 0);
  const [owlFrame, setOwlFrame] = useState(reduceMotion ? owlStoryFrames.length - 1 : 0);

  const firstOpacity = useTransform(scrollYProgress, [0, 0.055, 0.39, 0.49], [0, 1, 1, 0]);
  const firstY = useTransform(scrollYProgress, [0, 0.075, 0.39, 0.49], [34, 0, 0, -105]);
  const firstBodyOpacity = useTransform(scrollYProgress, [0.22, 0.29, 0.4, 0.48], [0, 1, 1, 0]);
  const firstBodyY = useTransform(scrollYProgress, [0.22, 0.29], [18, 0]);
  const secondOpacity = useTransform(scrollYProgress, [0.48, 0.58, 0.9, 0.985], [0, 1, 1, 0]);
  const secondY = useTransform(scrollYProgress, [0.48, 0.58, 0.9, 0.985], [145, 0, 0, -80]);
  const secondBodyOpacity = useTransform(scrollYProgress, [0.72, 0.8, 0.92, 0.98], [0, 1, 1, 0]);
  const secondBodyY = useTransform(scrollYProgress, [0.72, 0.8], [18, 0]);
  const branchOpacity = useTransform(scrollYProgress, [0.4, 0.48, 0.91, 0.98], [0, 1, 1, 0]);
  const branchX = useTransform(scrollYProgress, [0.4, 0.56], [-110, 0]);
  const branchY = useTransform(scrollYProgress, [0.4, 0.56], [80, 0]);
  const owlOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.91, 0.98], [0, 1, 1, 0]);
  const owlLeft = useTransform(scrollYProgress, [0.4, 0.66], ["88%", "30%"]);
  const owlTop = useTransform(scrollYProgress, [0.4, 0.5, 0.66], ["12%", "28%", "76%"]);
  const owlScale = useTransform(scrollYProgress, [0.4, 0.66], [0.42, 0.76]);
  const owlRotate = useTransform(scrollYProgress, [0.4, 0.66], [8, 0]);

  useEffect(() => {
    owlStoryFrames.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    const firstTypingProgress = clampProgress((value - 0.07) / 0.2);
    const secondTypingProgress = clampProgress((value - 0.58) / 0.16);
    const flightProgress = clampProgress((value - 0.4) / 0.26);
    const nextFirstLength = Math.floor(firstTypingProgress * firstHeading.length);
    const nextSecondLength = Math.floor(secondTypingProgress * secondHeading.length);
    const nextFrame = Math.min(owlStoryFrames.length - 1, Math.floor(flightProgress * owlStoryFrames.length));
    setFirstTypedLength((current) => current === nextFirstLength ? current : nextFirstLength);
    setSecondTypedLength((current) => current === nextSecondLength ? current : nextSecondLength);
    setOwlFrame((current) => current === nextFrame ? current : nextFrame);
  });

  const firstLineTyped = firstHeadingLineOne.slice(0, Math.min(firstTypedLength, firstHeadingLineOne.length));
  const secondLineTyped = firstHeadingLineTwo.slice(0, Math.max(0, firstTypedLength - firstHeadingLineOne.length - 1));
  const secondTyped = secondHeading.slice(0, secondTypedLength);
  const firstHighlight = "DVC For Less";
  const secondHighlightStart = secondHeading.indexOf("too");

  return (
    <section className="brand-statement content-section" ref={sectionRef} aria-label="Our experience as DVC owners and resale specialists">
      <div className="brand-statement-sticky">
        <BrandCloudScene progress={scrollYProgress} />

        <motion.article className="brand-story-copy brand-story-copy-first" style={reduceMotion ? undefined : { opacity: firstOpacity, y: firstY }}>
          <h2 aria-label={firstHeading}>
            <span className="brand-heading-line brand-heading-line-first">
              {firstTypedLength > 0 && <span className="brand-highlight">{firstLineTyped.slice(0, Math.min(firstHighlight.length, firstLineTyped.length))}</span>}
              {firstLineTyped.length > firstHighlight.length && firstLineTyped.slice(firstHighlight.length)}
              {!reduceMotion && firstTypedLength > 0 && firstTypedLength <= firstHeadingLineOne.length && <i className="type-cursor" aria-hidden="true" />}
            </span>
            <span className="brand-heading-line">
              {secondLineTyped}
              {!reduceMotion && firstTypedLength > firstHeadingLineOne.length && firstTypedLength < firstHeading.length && <i className="type-cursor" aria-hidden="true" />}
            </span>
          </h2>
          <motion.p style={reduceMotion ? undefined : { opacity: firstBodyOpacity, y: firstBodyY }}>
            As your broker, we put that experience, our audience of active DVC buyers, and the tools we have built behind your contract.
          </motion.p>
        </motion.article>

        <motion.div className="brand-story-branch" style={reduceMotion ? undefined : { opacity: branchOpacity, x: branchX, y: branchY }} aria-hidden="true">
          <img src="/assets/owl-tree-options-v2/option-d-side-tree-section.png" alt="" />
        </motion.div>

        <motion.div className="brand-story-owl" style={reduceMotion ? undefined : { opacity: owlOpacity, left: owlLeft, top: owlTop, scale: owlScale, rotate: owlRotate }} aria-hidden="true">
          <img src={owlStoryFrames[owlFrame]} alt="" />
        </motion.div>

        <motion.article className="brand-story-copy brand-story-copy-second" style={reduceMotion ? undefined : { opacity: secondOpacity, y: secondY }}>
          <h2 aria-label={secondHeading}>
            {secondTyped.slice(0, secondHighlightStart)}
            {secondTyped.length > secondHighlightStart && <span className="brand-highlight">{secondTyped.slice(secondHighlightStart)}</span>}
            {!reduceMotion && secondTypedLength > 0 && secondTypedLength < secondHeading.length && <i className="type-cursor" aria-hidden="true" />}
          </h2>
          <motion.p style={reduceMotion ? undefined : { opacity: secondBodyOpacity, y: secondBodyY }}>
            We understand the value of what you own and help you sell it with the same care we’d want for our own membership.
          </motion.p>
        </motion.article>
      </div>
    </section>
  );
}

function BrandStatementSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const initialStage = reduceMotion ? "second-ready" : "waiting";
  const stageRef = useRef(initialStage);
  const engagedRef = useRef(false);
  const touchStartYRef = useRef(0);
  const [storyStage, setStoryStage] = useState(initialStage);
  const [firstTypedLength, setFirstTypedLength] = useState(reduceMotion ? 78 : 0);
  const [secondTypedLength, setSecondTypedLength] = useState(reduceMotion ? 23 : 0);
  const [firstBodyVisible, setFirstBodyVisible] = useState(Boolean(reduceMotion));
  const [secondBodyVisible, setSecondBodyVisible] = useState(Boolean(reduceMotion));
  const [secondCopyVisible, setSecondCopyVisible] = useState(Boolean(reduceMotion));
  const [owlFrame, setOwlFrame] = useState(reduceMotion ? owlStoryFrames.length - 1 : 0);
  const [owlFlightProgress, setOwlFlightProgress] = useState(reduceMotion ? 1 : 0);

  const firstHeadingLineOne = "DVC For Less has spent years";
  const firstHeadingLineTwo = "helping people navigate the DVC resale market.";
  const firstHeading = `${firstHeadingLineOne} ${firstHeadingLineTwo}`;
  const secondHeading = "We’re DVC owners, too.";

  useEffect(() => {
    owlStoryFrames.forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      stageRef.current = "second-ready";
      setStoryStage("second-ready");
      setFirstTypedLength(firstHeading.length);
      setSecondTypedLength(secondHeading.length);
      setFirstBodyVisible(true);
      setSecondBodyVisible(true);
      setSecondCopyVisible(true);
      setOwlFrame(owlStoryFrames.length - 1);
      setOwlFlightProgress(1);
      return;
    }

    let disposed = false;
    let animationFrame = 0;
    let intentUnlockTimer = 0;
    let wheelSessionTimer = 0;
    let lastScrollY = window.scrollY;
    const timers = new Set<number>();
    let intentLocked = false;
    let wheelSessionMode: "idle" | "consume" | "release" = "idle";

    const changeStage = (stage: string) => {
      stageRef.current = stage;
      setStoryStage(stage);
    };

    const setScrollLocked = (locked: boolean) => {
      window.dispatchEvent(new CustomEvent<boolean>("dvc:scroll-lock", { detail: locked }));
    };

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!disposed) callback();
      }, delay);
      timers.add(timer);
      return timer;
    };

    const clearStorySequence = () => {
      cancelAnimationFrame(animationFrame);
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };

    const lockIntentUntilQuiet = (delay = 300) => {
      intentLocked = true;
      window.clearTimeout(intentUnlockTimer);
      intentUnlockTimer = window.setTimeout(() => {
        intentLocked = false;
      }, delay);
    };

    const sectionIsActive = () => {
      const bounds = sectionRef.current?.getBoundingClientRect();
      return Boolean(bounds && bounds.top <= 4 && bounds.bottom >= window.innerHeight * 0.45);
    };

    const playFirstStory = () => {
      clearStorySequence();
      engagedRef.current = true;
      lockIntentUntilQuiet();
      setScrollLocked(true);
      changeStage("first-playing");
      setFirstTypedLength(0);
      setFirstBodyVisible(false);
      const startedAt = performance.now();
      const typingStart = 520;
      const typingDuration = 1720;

      const tick = (now: number) => {
        if (disposed) return;
        const progress = clampProgress((now - startedAt - typingStart) / typingDuration);
        setFirstTypedLength(Math.min(firstHeading.length, Math.floor(progress * firstHeading.length)));
        if (progress < 1) {
          animationFrame = requestAnimationFrame(tick);
          return;
        }
        setFirstBodyVisible(true);
        schedule(() => {
          changeStage("first-ready");
          setScrollLocked(false);
        }, 380);
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const playSecondStory = () => {
      clearStorySequence();
      lockIntentUntilQuiet(360);
      setScrollLocked(true);
      changeStage("second-playing");
      setSecondTypedLength(0);
      setSecondBodyVisible(false);
      setSecondCopyVisible(false);
      setOwlFrame(0);
      setOwlFlightProgress(0);
      const startedAt = performance.now();
      const flightDuration = 1580;
      const secondCopyStart = 860;
      const secondTypingDuration = 1580;
      const secondBodyStart = secondCopyStart + secondTypingDuration + 170;
      const sequenceDuration = secondBodyStart + 440;
      let copyHasEntered = false;
      let bodyHasEntered = false;

      const tick = (now: number) => {
        if (disposed) return;
        const elapsed = now - startedAt;
        const flightProgress = clampProgress(elapsed / flightDuration);
        const easedFlight = flightProgress * flightProgress * (3 - 2 * flightProgress);
        setOwlFlightProgress(easedFlight);
        setOwlFrame(Math.min(owlStoryFrames.length - 1, Math.floor(flightProgress * owlStoryFrames.length)));

        if (elapsed >= secondCopyStart && !copyHasEntered) {
          copyHasEntered = true;
          setSecondCopyVisible(true);
        }
        if (elapsed >= secondCopyStart) {
          const typingProgress = clampProgress((elapsed - secondCopyStart) / secondTypingDuration);
          setSecondTypedLength(Math.min(secondHeading.length, Math.floor(typingProgress * secondHeading.length)));
        }
        if (elapsed >= secondBodyStart && !bodyHasEntered) {
          bodyHasEntered = true;
          setSecondBodyVisible(true);
        }

        if (elapsed < sequenceDuration) {
          animationFrame = requestAnimationFrame(tick);
          return;
        }
        changeStage("second-ready");
        setScrollLocked(false);
      };

      animationFrame = requestAnimationFrame(tick);
    };

    const returnToFirstStory = () => {
      clearStorySequence();
      lockIntentUntilQuiet();
      setScrollLocked(true);
      changeStage("returning-first");
      setFirstTypedLength(firstHeading.length);
      setFirstBodyVisible(true);
      setSecondCopyVisible(false);
      setSecondBodyVisible(false);
      schedule(() => {
        changeStage("first-ready");
        setScrollLocked(false);
        lockIntentUntilQuiet(260);
      }, 460);
    };

    const finishPlayingStory = (lockAfter = true) => {
      const stage = stageRef.current;
      clearStorySequence();
      if (stage === "second-playing") {
        setOwlFlightProgress(1);
        setOwlFrame(owlStoryFrames.length - 1);
        setSecondCopyVisible(true);
        setSecondTypedLength(secondHeading.length);
        setSecondBodyVisible(true);
        changeStage("second-ready");
      } else {
        setFirstTypedLength(firstHeading.length);
        setFirstBodyVisible(true);
        setSecondCopyVisible(false);
        setSecondBodyVisible(false);
        changeStage("first-ready");
      }
      setScrollLocked(false);
      if (lockAfter) lockIntentUntilQuiet(280);
      else intentLocked = false;
    };

    const handleIntent = (direction: 1 | -1, preventDefault: () => void) => {
      if (!sectionIsActive()) return;
      if (intentLocked) {
        preventDefault();
        lockIntentUntilQuiet();
        return;
      }
      const stage = stageRef.current;
      const isPlaying = stage === "first-playing" || stage === "second-playing" || stage === "returning-first";

      if (isPlaying) {
        preventDefault();
        finishPlayingStory();
        return;
      }

      if (stage === "waiting") {
        if (direction > 0) {
          preventDefault();
          playFirstStory();
        }
        return;
      }
      if (stage === "first-ready") {
        if (direction > 0) {
          preventDefault();
          playSecondStory();
        } else {
          engagedRef.current = false;
        }
        return;
      }
      if (stage === "second-ready") {
        if (direction < 0) {
          preventDefault();
          returnToFirstStory();
        } else {
          engagedRef.current = false;
        }
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 5) return;
      const direction = event.deltaY > 0 ? 1 : -1;
      window.clearTimeout(wheelSessionTimer);
      wheelSessionTimer = window.setTimeout(() => {
        wheelSessionMode = "idle";
      }, 280);

      if (wheelSessionMode === "consume") {
        if (sectionIsActive()) event.preventDefault();
        return;
      }
      if (wheelSessionMode === "release") return;

      const stage = stageRef.current;
      if (stage === "second-playing" && direction > 0 && sectionIsActive()) {
        finishPlayingStory(false);
        engagedRef.current = false;
        wheelSessionMode = "release";
        const releaseDistance = Math.min(520, Math.max(180, Math.abs(event.deltaY) * 0.55));
        window.setTimeout(() => window.scrollBy({ top: releaseDistance, behavior: "smooth" }), 24);
        return;
      }

      const consumesGesture = sectionIsActive() && (
        stage === "first-playing"
        || stage === "returning-first"
        || (stage === "waiting" && direction > 0)
        || (stage === "first-ready" && direction > 0)
        || (stage === "second-ready" && direction < 0)
        || (stage === "second-playing" && direction < 0)
      );
      wheelSessionMode = consumesGesture ? "consume" : "release";
      handleIntent(direction, () => event.preventDefault());
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) return;
      const delta = touchStartYRef.current - event.touches[0].clientY;
      if (Math.abs(delta) < 26) return;
      handleIntent(delta > 0 ? 1 : -1, () => event.preventDefault());
      touchStartYRef.current = event.touches[0].clientY;
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isMovingDown = currentScrollY >= lastScrollY;
      lastScrollY = currentScrollY;
      const bounds = sectionRef.current?.getBoundingClientRect();
      const enteredStory = Boolean(bounds && bounds.top <= 4 && bounds.bottom > 80);

      if (stageRef.current === "waiting" && isMovingDown && enteredStory) {
        playFirstStory();
        return;
      }
      if (!engagedRef.current && enteredStory) {
        const isReturningFromAbove = stageRef.current === "first-ready" && isMovingDown;
        const isReturningFromBelow = stageRef.current === "second-ready" && !isMovingDown;
        if (isReturningFromAbove || isReturningFromBelow) {
          engagedRef.current = true;
          return;
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      disposed = true;
      setScrollLocked(false);
      cancelAnimationFrame(animationFrame);
      window.clearTimeout(intentUnlockTimer);
      window.clearTimeout(wheelSessionTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reduceMotion]);

  const firstLineTyped = firstHeadingLineOne.slice(0, Math.min(firstTypedLength, firstHeadingLineOne.length));
  const secondLineTyped = firstHeadingLineTwo.slice(0, Math.max(0, firstTypedLength - firstHeadingLineOne.length - 1));
  const secondTyped = secondHeading.slice(0, secondTypedLength);
  const firstHighlight = "DVC For Less";
  const secondHighlightStart = secondHeading.indexOf("too");
  const secondHighlightEnd = secondHighlightStart + "too".length;
  const firstStoryVisible = storyStage === "first-playing" || storyStage === "first-ready" || storyStage === "returning-first";
  const secondSequenceVisible = storyStage === "second-playing" || storyStage === "second-ready";
  const owlArc = Math.sin(Math.PI * owlFlightProgress) * 8;
  const owlStyle = {
    left: `${88 - owlFlightProgress * 58}%`,
    top: `${12 + owlFlightProgress * 64.5 - owlArc}%`,
    transform: `translate(-50%, -50%) scale(${0.42 + owlFlightProgress * 0.26}) rotate(${8 - owlFlightProgress * 8}deg)`,
  };

  return (
    <section className="brand-statement content-section" ref={sectionRef} data-story-stage={storyStage} aria-label="Our experience as DVC owners and resale specialists">
      <div className="brand-statement-sticky">
        <BrandCloudScene open={storyStage !== "waiting"} duration={2800} />

        <motion.article
          className="brand-story-copy brand-story-copy-first"
          initial={false}
          animate={{ opacity: firstStoryVisible ? 1 : 0, y: firstStoryVisible ? 0 : storyStage === "waiting" ? 34 : -125 }}
          transition={{ duration: storyStage === "second-playing" ? 0.72 : 0.48, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 aria-label={firstHeading}>
            <span className="brand-heading-line brand-heading-line-first">
              {firstTypedLength > 0 && (
                <span className="brand-highlight">{firstLineTyped.slice(0, Math.min(firstHighlight.length, firstLineTyped.length))}</span>
              )}
              {firstLineTyped.length > firstHighlight.length && firstLineTyped.slice(firstHighlight.length)}
              {!reduceMotion && firstTypedLength > 0 && firstTypedLength <= firstHeadingLineOne.length && <i className="type-cursor" aria-hidden="true" />}
            </span>
            <span className="brand-heading-line">
              {secondLineTyped}
              {!reduceMotion && firstTypedLength > firstHeadingLineOne.length && firstTypedLength < firstHeading.length && <i className="type-cursor" aria-hidden="true" />}
            </span>
          </h2>
          <motion.p
            initial={false}
            animate={{ opacity: firstBodyVisible ? 1 : 0, y: firstBodyVisible ? 0 : 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            As your broker, we put that experience, our audience of active DVC buyers, and the tools we have built behind your contract.
          </motion.p>
        </motion.article>

        <motion.div
          className="brand-story-branch"
          initial={false}
          animate={{ opacity: secondSequenceVisible ? 1 : 0, x: secondSequenceVisible ? 0 : -110, y: secondSequenceVisible ? 0 : 80 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          <img src="/assets/owl-tree-options-v2/option-d-side-tree-section.png" alt="" />
        </motion.div>

        <motion.div className="brand-story-owl" initial={false} animate={{ opacity: secondSequenceVisible ? 1 : 0 }} style={owlStyle} transition={{ duration: 0.24 }} aria-hidden="true">
          <img src={owlStoryFrames[owlFrame]} alt="" />
        </motion.div>

        <motion.article
          className="brand-story-copy brand-story-copy-second"
          initial={false}
          animate={{ opacity: secondCopyVisible ? 1 : 0, y: secondCopyVisible ? 0 : 145 }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 aria-label={secondHeading}>
            {secondTyped.slice(0, secondHighlightStart)}
            {secondTyped.length > secondHighlightStart && (
              <span className="brand-highlight">{secondTyped.slice(secondHighlightStart, secondHighlightEnd)}</span>
            )}
            {secondTyped.length > secondHighlightEnd && secondTyped.slice(secondHighlightEnd)}
            {!reduceMotion && secondTypedLength > 0 && secondTypedLength < secondHeading.length && <i className="type-cursor" aria-hidden="true" />}
          </h2>
          <motion.p
            initial={false}
            animate={{ opacity: secondBodyVisible ? 1 : 0, y: secondBodyVisible ? 0 : 18 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            We understand the value of what you own and help you sell it with the same care we’d want for our own membership.
          </motion.p>
        </motion.article>
      </div>
    </section>
  );
}

function JourneyScene({ index, progress }: { index: number; progress: MotionValue<number> }) {
  const enterAt = index === 0 ? 0 : 0.22 + (index - 1) * 0.25;
  const exitAt = index === 3 ? 1 : 0.22 + index * 0.25;
  const crossfade = 0.035;
  const opacity = useTransform(progress, (value) => {
    const enter = index === 0 ? 1 : clampProgress((value - enterAt) / crossfade);
    const exit = index === 3 ? 1 : clampProgress((exitAt + crossfade - value) / crossfade);
    return Math.min(enter, exit);
  });
  const entrance = useTransform(progress, (value) => index === 0 ? 1 : clampProgress((value - enterAt) / crossfade));
  const y = useTransform(entrance, (value) => 28 * (1 - value));
  const scale = useTransform(entrance, (value) => 0.975 + value * 0.025);

  return (
    <motion.div className={`journey-scene journey-scene-${index + 1}`} style={{ opacity, y, scale }} aria-hidden={index !== 0}>
      {index === 0 && (
        <>
          <article className="journey-agent-card">
            <h3>Meet your<br />listing agent</h3>
            <div><img src="/assets/journey-lila.png" alt="" /><span><strong>Lila Vidal</strong><small>DVC For Less<br />Listing Agent</small></span></div>
            <ul><li>Review the current market</li><li>Confirm your contract details</li><li>Recommend your asking price</li></ul>
          </article>
          <div className="journey-mini-statuses">
            <span><i>✓</i><b>Agent assigned</b></span>
            <span><i>✓</i><b>Points verified</b></span>
            <span><i>1</i><b>Sign your listing agreement</b></span>
          </div>
        </>
      )}
      {index === 1 && (
        <>
          <article className="journey-note"><small>Step 02</small><h3>We’re preparing<br />your listing</h3><p>We organize the details buyers need to evaluate your contract.</p></article>
          <article className="journey-listing-card">
            <small>DVC FOR LESS</small><h3>Your listing is live</h3>
            <div><img src="/assets/journey-saratoga.png" alt="" /><span><strong>Saratoga Springs Resort &amp; Spa</strong><small>200 pts · Feb UY · $19,500</small></span></div>
            <dl><dt>Price per point</dt><dd>$97.50</dd><dt>Listed on</dt><dd>November 15, 2025</dd><dt>Listing ID</dt><dd>DFL-2025-0471</dd></dl>
          </article>
        </>
      )}
      {index === 2 && (
        <>
          <article className="journey-offer-alert"><img src="/assets/journey-saratoga-alt.png" alt="" /><div><h3>You have 2 offers to review</h3><p>Your highest offer is $112/pt. Review each offer and share your feedback with Lila.</p><button type="button" tabIndex={-1}>Review offers</button></div></article>
          <article className="journey-offer-card offer-one"><small>OFFER AMOUNT</small><strong>$17,200</strong><span>$86 per point</span></article>
          <article className="journey-offer-card offer-two"><small>OFFER AMOUNT</small><strong>$17,500</strong><span>$87.50 per point</span></article>
        </>
      )}
      {index === 3 && (
        <article className="journey-complete-card">
          <span className="sale-complete-pill">● Sale completed</span>
          <div className="completion-message"><img src="/assets/journey-icon-8.svg" alt="" /><span><h3>Congratulations!</h3><p>Your sale is complete and your proceeds have been sent.</p></span></div>
          <div className="sale-summary"><h4>Sale summary</h4><dl><dt>Sale price</dt><dd>$18,500</dd><dt>Commission</dt><dd>−$1,295</dd><dt>Closing costs</dt><dd>−$2,255</dd><dt>Net proceeds</dt><dd>$14,950</dd></dl></div>
        </article>
      )}
    </motion.div>
  );
}

function JourneySection({ hasEstimate, onOpenCalculator, onContinueEstimate }: { hasEstimate: boolean; onOpenCalculator: () => void; onContinueEstimate: () => void }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  const snapTimerRef = useRef(0);
  const wheelAccumulatorRef = useRef(0);
  const touchStartRef = useRef(0);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const lineProgress = useTransform(scrollYProgress, [0, 1], ["12.5%", "100%"]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let isSnapping = false;
    let accumulatorReset = 0;
    let gestureReleaseTimer = 0;
    let gestureLocked = false;
    let lastScrollY = window.scrollY;
    let hasEnteredPinnedStage = false;
    let entryGuardUntil = 0;

    const setScrollLocked = (locked: boolean) => {
      window.dispatchEvent(new CustomEvent<boolean>("dvc:scroll-lock", { detail: locked }));
    };

    const sectionIsPinned = () => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= 1 && bounds.bottom >= window.innerHeight - 1;
    };

    const releaseGestureAfterPause = (delay = 300) => {
      window.clearTimeout(gestureReleaseTimer);
      gestureReleaseTimer = window.setTimeout(() => {
        gestureLocked = false;
        wheelAccumulatorRef.current = 0;
      }, delay);
    };

    const moveToStep = (nextStep: number) => {
      const bounds = section.getBoundingClientRect();
      const sectionTop = window.scrollY + bounds.top;
      const runway = Math.max(0, section.offsetHeight - window.innerHeight);
      const target = sectionTop + runway * (nextStep / (journeySteps.length - 1));
      isSnapping = true;
      gestureLocked = true;
      setScrollLocked(true);
      stepRef.current = nextStep;
      setStep(nextStep);
      window.scrollTo({ top: target, behavior: "smooth" });
      window.clearTimeout(snapTimerRef.current);
      snapTimerRef.current = window.setTimeout(() => {
        isSnapping = false;
        lastScrollY = window.scrollY;
        setScrollLocked(false);
        releaseGestureAfterPause(260);
      }, 620);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!sectionIsPinned()) return;
      if (performance.now() < entryGuardUntil) {
        event.preventDefault();
        releaseGestureAfterPause(420);
        return;
      }
      const direction = event.deltaY > 0 ? 1 : -1;
      const currentStep = stepRef.current;
      const exitingForward = direction > 0 && currentStep === journeySteps.length - 1;
      const exitingBackward = direction < 0 && currentStep === 0;
      if (exitingForward || exitingBackward) return;

      event.preventDefault();
      if (isSnapping || gestureLocked) {
        releaseGestureAfterPause();
        return;
      }
      wheelAccumulatorRef.current += event.deltaY;
      window.clearTimeout(accumulatorReset);
      accumulatorReset = window.setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 180);
      if (Math.abs(wheelAccumulatorRef.current) < 52) return;

      const stepDelta = Math.abs(wheelAccumulatorRef.current) >= 820 ? 2 : 1;
      const nextStep = Math.max(0, Math.min(journeySteps.length - 1, currentStep + direction * stepDelta));
      wheelAccumulatorRef.current = 0;
      moveToStep(nextStep);
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartRef.current = event.touches[0]?.clientY ?? 0;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!sectionIsPinned()) return;
      if (performance.now() < entryGuardUntil) {
        releaseGestureAfterPause(420);
        return;
      }
      const endY = event.changedTouches[0]?.clientY ?? touchStartRef.current;
      const delta = touchStartRef.current - endY;
      if (Math.abs(delta) < 46 || isSnapping || gestureLocked) return;
      const direction = delta > 0 ? 1 : -1;
      const currentStep = stepRef.current;
      const stepDelta = Math.abs(delta) >= 260 ? 2 : 1;
      const nextStep = Math.max(0, Math.min(journeySteps.length - 1, currentStep + direction * stepDelta));
      if (nextStep !== currentStep) moveToStep(nextStep);
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY >= lastScrollY ? 1 : -1;
      lastScrollY = currentScrollY;
      const pinned = sectionIsPinned();
      if (pinned && !hasEnteredPinnedStage) {
        hasEnteredPinnedStage = true;
        entryGuardUntil = performance.now() + 920;
        gestureLocked = true;
        wheelAccumulatorRef.current = 0;
        stepRef.current = 0;
        setStep(0);
        releaseGestureAfterPause(720);
        return;
      }
      if (isSnapping || gestureLocked || !pinned) return;

      const bounds = section.getBoundingClientRect();
      const sectionTop = currentScrollY + bounds.top;
      const runway = Math.max(0, section.offsetHeight - window.innerHeight);
      const currentStep = stepRef.current;
      const currentAnchor = sectionTop + runway * (currentStep / (journeySteps.length - 1));
      const distanceFromAnchor = currentScrollY - currentAnchor;
      if (Math.abs(distanceFromAnchor) < 48) return;

      const exitingForward = direction > 0 && currentStep === journeySteps.length - 1;
      const exitingBackward = direction < 0 && currentStep === 0;
      if (exitingForward || exitingBackward) return;
      const anchorDistance = runway / (journeySteps.length - 1);
      const stepDelta = Math.abs(distanceFromAnchor) >= anchorDistance * 0.8 ? 2 : 1;
      moveToStep(Math.max(0, Math.min(journeySteps.length - 1, currentStep + direction * stepDelta)));
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      setScrollLocked(false);
      window.clearTimeout(accumulatorReset);
      window.clearTimeout(gestureReleaseTimer);
      window.clearTimeout(snapTimerRef.current);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="journey-scroll journey-section content-section" id="selling-journey" ref={sectionRef}>
      <div className="journey-sticky">
        <div className="section-inner journey-section-inner">
          <div className="journey-heading-row"><SectionKicker>Your selling journey</SectionKicker><h2 className="section-title">What happens<br />after you decide to sell?</h2></div>
          <div className="journey-visual">
            {journeySteps.map((_, index) => <JourneyScene index={index} progress={scrollYProgress} key={index} />)}
          </div>
          <div className="journey-description-window">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.24 }}>{journeySteps[step].description}</motion.p>
            </AnimatePresence>
          </div>
          <div className="journey-stepper" aria-label={`Selling process, step ${step + 1} of 4`}>
            <span className="journey-line-base" aria-hidden="true" />
            <motion.span className="journey-line-progress" style={{ width: lineProgress }} aria-hidden="true" />
            <div className="journey-steps">
              {journeySteps.map((item, index) => (
                <div className={index <= step ? "journey-step is-past" : "journey-step"} key={item.title}>
                  <span>0{index + 1}</span><i /><strong>{item.title}</strong>
                </div>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="section-cta journey-cta"
            onClick={hasEstimate ? onContinueEstimate : onOpenCalculator}
          >
            {hasEstimate ? "Continue With My Estimate" : "Get My Estimate"}
          </button>
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const isVisible = useInView(sectionRef, { once: true, amount: 0.16 });
  return (
    <section className="faq-section content-section" ref={sectionRef}>
      <div className="faq-inner">
        <h2>Questions about selling your DVC contract</h2>
        <p>Clear answers for the questions owners ask most often.</p>
        <div className="faq-list">
          {faqs.map(({ question, answer }, index) => (
            <motion.div
              className={openFaq === index ? "faq-item is-open" : "faq-item"}
              initial={reduceMotion ? false : { opacity: 0, x: index % 2 === 0 ? -16 : 16, y: 13 }}
              animate={reduceMotion || isVisible ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: index % 2 === 0 ? -16 : 16, y: 13 }}
              transition={{ duration: 0.48, delay: reduceMotion ? 0 : index * 0.11, ease: [0.22, 1, 0.36, 1] }}
              key={question}
            >
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <span>{question}</span><i className="faq-toggle" aria-hidden="true"><b /><b /></i>
              </button>
              <AnimatePresence initial={false}>
                {openFaq === index && (
                  <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    {answer.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection({ onContinueEstimate }: { onContinueEstimate: () => void }) {
  return (
    <section className="final-cta-section">
      <div className="final-cta-inner">
        <span className="eyebrow light">Your next step</span>
        <h2>You have your estimate.<br />Let’s take a closer look.</h2>
        <p>Share the remaining details about your ownership. A DVC For Less specialist will review your contract and contact you to discuss the price, timing, and what you want the sale to accomplish.</p>
        <div className="final-estimate-card">
          <img src="/assets/resort-animal-kingdom.png" alt="Animal Kingdom Villas" />
          <div><strong>Animal Kingdom Villas</strong><span>150 points · January Use Year</span></div>
          <b>$15,000 – $15,400</b>
        </div>
        <button type="button" className="section-cta" onClick={onContinueEstimate}>Continue With My Estimate</button>
      </div>
    </section>
  );
}

function SiteFooter({ hasEstimate, onOpenCalculator, onContinueEstimate }: { hasEstimate: boolean; onOpenCalculator: () => void; onContinueEstimate: () => void }) {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand"><img src="/assets/dvc-logo.svg" alt="DVC For Less" /><p>A clearer way to understand, buy, and sell Disney Vacation Club resale contracts.</p></div>
        <nav aria-label="Footer navigation">
          <a href="#why-sell">Why Sell with us</a>
          <a href="#selling-journey">Your Selling Journey</a>
          <a href="mailto:help@dvcforless.com">Contact</a>
          <button type="button" className="footer-estimate-button" onClick={hasEstimate ? onContinueEstimate : onOpenCalculator}>
            {hasEstimate ? "Continue With My Estimate" : "Get My Estimate"}
          </button>
        </nav>
        <div className="footer-contact"><span>Questions?</span><a href="tel:+18333823326">(833) 382-3326</a><a href="mailto:help@dvcforless.com">help@dvcforless.com</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 DVC For Less</span><span>Independent Disney Vacation Club resale resource.</span></div>
    </footer>
  );
}

export function ContentSections({ hasEstimate, onOpenCalculator, onContinueEstimate }: { hasEstimate: boolean; onOpenCalculator: () => void; onContinueEstimate: () => void }) {
  return (
    <>
      <WhySellSection />
      <BrandStatementSection />
      <ProofScrollSection />
      <JourneySection hasEstimate={hasEstimate} onOpenCalculator={onOpenCalculator} onContinueEstimate={onContinueEstimate} />
      <FaqSection />
      {hasEstimate && <FinalCtaSection onContinueEstimate={onContinueEstimate} />}
      <SiteFooter hasEstimate={hasEstimate} onOpenCalculator={onOpenCalculator} onContinueEstimate={onContinueEstimate} />
    </>
  );
}
