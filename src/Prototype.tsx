import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { Carousel, MobileScroll } from "./mobile";

const tabOptions = [
  ["home", "homewei.svg", "h1.svg", "Home"],
  ["search", "searchwei.svg", "sx.svg", "Search"],
  ["library", "liwei.svg", "lx.svg", "Library"],
  ["radio", "rawei.svg", "rx.svg", "Radio"],
] as const;

const trendingFilters = [
  ["downtempo", "Downtempo", "dx.svg", "dw.svg"],
  ["all-genres", "All Genres", "ax.svg", "aw.svg"],
  ["dancehall", "Dancehall", "dx2.svg", "dw2.svg"],
  ["trap", "Trap", "tx.svg", "tw.svg"],
  ["folk", "Folk", "fx.svg", "fw.svg"],
  ["jazz", "Jazz", "jx.svg", "jw.svg"],
] as const;

const featuredCards = [
  ["featured-used-to-this.png", "Used to This by Maybe"],
  ["featured-walk-up.png", "Walk Up to Your House by SPELLLING"],
  ["featured-bass-persuades.png", "Bass Persuades by Miley Cyrus"],
] as const;

type PlayerVariant = "default" | "maybe";

// The supplied long screenshot is the current source of truth. The runtime
// still owns the device frame; this screen only provides the scrollable image.
export default function Prototype() {
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerVariant, setPlayerVariant] = useState<PlayerVariant>("default");
  const [playerClosing, setPlayerClosing] = useState(false);
  const [playerEntered, setPlayerEntered] = useState(false);
  const [playerDragging, setPlayerDragging] = useState(false);
  const [playerSnapping, setPlayerSnapping] = useState(false);
  const [playerDragY, setPlayerDragY] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsClosing, setCommentsClosing] = useState(false);
  const [commentsEntered, setCommentsEntered] = useState(false);
  const [commentsDragging, setCommentsDragging] = useState(false);
  const [commentsSnapping, setCommentsSnapping] = useState(false);
  const [commentsDragY, setCommentsDragY] = useState(0);
  const [activeTab, setActiveTab] = useState("home");
  const [activeTrendingFilter, setActiveTrendingFilter] = useState("downtempo");
  const [homeScrollTop, setHomeScrollTop] = useState(0);
  const [statusBarDarkIcons, setStatusBarDarkIcons] = useState(false);
  const [settledTab, setSettledTab] = useState("home");
  const [motionStyle, setMotionStyle] = useState({ left: 0, top: 0, width: 64, height: 44, scaleX: 1, scaleY: 1 });
  const navRef = useRef<HTMLElement | null>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const targetRef = useRef({ left: 0, top: 0, width: 64, height: 44 });
  const motionRef = useRef({ left: 0, top: 0, width: 64, height: 44, scaleX: 1, scaleY: 1 });
  const velocityRef = useRef({ left: 0, top: 0, width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const activeIdRef = useRef("home");
  const closeTimerRef = useRef<number | null>(null);
  const playerSnapTimerRef = useRef<number | null>(null);
  const playerDragRef = useRef({ pointerId: -1, startY: 0, startedAt: 0 });
  const commentsTimerRef = useRef<number | null>(null);
  const commentsSnapTimerRef = useRef<number | null>(null);
  const commentsDragRef = useRef({ pointerId: -1, startY: 0, startedAt: 0 });
  const statusImagesRef = useRef(new Map<string, HTMLImageElement>());

  const openPlayer = (variant: PlayerVariant) => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (playerSnapTimerRef.current !== null) window.clearTimeout(playerSnapTimerRef.current);
    setPlayerVariant(variant);
    setPlayerClosing(false);
    setPlayerEntered(false);
    setPlayerDragging(false);
    setPlayerSnapping(false);
    setPlayerDragY(0);
    setPlayerOpen(true);
  };

  const closePlayer = () => {
    if (!playerOpen || playerClosing) return;
    setPlayerClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setPlayerOpen(false);
      setPlayerClosing(false);
      setPlayerEntered(false);
      setPlayerDragging(false);
      setPlayerSnapping(false);
      setPlayerDragY(0);
      closeTimerRef.current = null;
    }, 480);
  };

  const beginPlayerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      playerClosing ||
      commentsOpen ||
      (event.target instanceof Element && event.target.closest("button, .comments-page"))
    ) return;
    playerDragRef.current = { pointerId: event.pointerId, startY: event.clientY, startedAt: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    setPlayerSnapping(false);
    setPlayerDragging(true);
  };

  const movePlayerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!playerDragging || playerDragRef.current.pointerId !== event.pointerId) return;
    const distance = Math.max(0, event.clientY - playerDragRef.current.startY);
    if (distance > 0) event.preventDefault();
    setPlayerDragY(distance);
  };

  const endPlayerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!playerDragging || playerDragRef.current.pointerId !== event.pointerId) return;
    const distance = Math.max(playerDragY, event.clientY - playerDragRef.current.startY, 0);
    const elapsed = Math.max(1, performance.now() - playerDragRef.current.startedAt);
    const velocity = distance / elapsed;
    setPlayerDragY(distance);
    setPlayerDragging(false);
    playerDragRef.current.pointerId = -1;

    if (distance >= 72 || velocity >= 0.55) {
      closePlayer();
      return;
    }

    setPlayerSnapping(true);
    setPlayerDragY(0);
    playerSnapTimerRef.current = window.setTimeout(() => {
      setPlayerSnapping(false);
      playerSnapTimerRef.current = null;
    }, 280);
  };

  const openComments = () => {
    if (commentsTimerRef.current !== null) window.clearTimeout(commentsTimerRef.current);
    if (commentsSnapTimerRef.current !== null) window.clearTimeout(commentsSnapTimerRef.current);
    setCommentsEntered(false);
    setCommentsDragging(false);
    setCommentsSnapping(false);
    setCommentsDragY(0);
    setCommentsClosing(false);
    setCommentsOpen(true);
  };

  const closeComments = () => {
    if (!commentsOpen || commentsClosing) return;
    setCommentsClosing(true);
    commentsTimerRef.current = window.setTimeout(() => {
      setCommentsOpen(false);
      setCommentsClosing(false);
      setCommentsEntered(false);
      setCommentsDragging(false);
      setCommentsSnapping(false);
      setCommentsDragY(0);
      commentsTimerRef.current = null;
    }, 500);
  };

  const beginCommentsDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (commentsClosing || (event.target instanceof Element && event.target.closest("button"))) return;
    commentsDragRef.current = { pointerId: event.pointerId, startY: event.clientY, startedAt: performance.now() };
    event.currentTarget.setPointerCapture(event.pointerId);
    setCommentsSnapping(false);
    setCommentsDragging(true);
  };

  const moveCommentsDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!commentsDragging || commentsDragRef.current.pointerId !== event.pointerId) return;
    const distance = Math.max(0, event.clientY - commentsDragRef.current.startY);
    if (distance > 0) event.preventDefault();
    setCommentsDragY(distance);
  };

  const endCommentsDrag = (event: ReactPointerEvent<HTMLElement>) => {
    if (!commentsDragging || commentsDragRef.current.pointerId !== event.pointerId) return;
    const distance = Math.max(commentsDragY, event.clientY - commentsDragRef.current.startY, 0);
    const elapsed = Math.max(1, performance.now() - commentsDragRef.current.startedAt);
    const velocity = distance / elapsed;
    setCommentsDragY(distance);
    setCommentsDragging(false);
    commentsDragRef.current.pointerId = -1;

    if (distance >= 72 || velocity >= 0.55) {
      closeComments();
      return;
    }

    setCommentsSnapping(true);
    setCommentsDragY(0);
    commentsSnapTimerRef.current = window.setTimeout(() => {
      setCommentsSnapping(false);
      commentsSnapTimerRef.current = null;
    }, 280);
  };

  useEffect(() => {
    if (!playerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (commentsOpen) closeComments();
        else closePlayer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [commentsOpen, playerOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current !== null) window.clearTimeout(closeTimerRef.current);
    if (playerSnapTimerRef.current !== null) window.clearTimeout(playerSnapTimerRef.current);
    if (commentsTimerRef.current !== null) window.clearTimeout(commentsTimerRef.current);
    if (commentsSnapTimerRef.current !== null) window.clearTimeout(commentsSnapTimerRef.current);
  }, []);

  const stopSpring = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startSpring = () => {
    if (rafRef.current !== null) return;
    let previousTime = performance.now();
    const tick = (time: number) => {
      const dt = Math.min((time - previousTime) / 1000, 0.032);
      previousTime = time;
      const target = targetRef.current;
      const current = motionRef.current;
      const velocity = velocityRef.current;
      const spring = (value: number, speed: number, destination: number) => {
        const nextSpeed = (speed + (destination - value) * 560 * dt) * Math.exp(-27 * dt);
        return [value + nextSpeed * dt, nextSpeed] as const;
      };
      const [left, leftSpeed] = spring(current.left, velocity.left, target.left);
      const [top, topSpeed] = spring(current.top, velocity.top, target.top);
      const [width, widthSpeed] = spring(current.width, velocity.width, target.width);
      const [height, heightSpeed] = spring(current.height, velocity.height, target.height);
      velocityRef.current = { left: leftSpeed, top: topSpeed, width: widthSpeed, height: heightSpeed };
      const stretch = Math.min(Math.abs(leftSpeed) / 155, 0.22);
      const squash = Math.min(stretch * 0.42 + Math.abs(topSpeed) / 1100, 0.1);
      const next = { left, top, width, height, scaleX: 1 + stretch, scaleY: 1 - squash };
      motionRef.current = next;
      setMotionStyle(next);
      const settled = Math.abs(target.left - left) < 0.18 && Math.abs(target.top - top) < 0.18 &&
        Math.abs(leftSpeed) < 0.22 && Math.abs(topSpeed) < 0.22 && Math.abs(width - target.width) < 0.18;
      if (settled) {
        const finalState = { ...target, scaleX: 1, scaleY: 1 };
        motionRef.current = finalState;
        velocityRef.current = { left: 0, top: 0, width: 0, height: 0 };
        setMotionStyle(finalState);
        rafRef.current = null;
        setSettledTab(activeIdRef.current);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const measureActiveTab = () => {
    const nav = navRef.current;
    const button = tabRefs.current[activeTab];
    if (!nav || !button) return;
    const navRect = nav.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();
    // getBoundingClientRect is in the device's transformed viewport space.
    // Convert back to the nav's local CSS space before positioning jn.svg so
    // it is not scaled twice by the phone preview runtime.
    const scaleX = nav.offsetWidth / navRect.width;
    const scaleY = nav.offsetHeight / navRect.height;
    const nextBounds = {
      left: (buttonRect.left - navRect.left) * scaleX,
      top: (buttonRect.top - navRect.top) * scaleY,
      width: buttonRect.width * scaleX,
      height: buttonRect.height * scaleY,
    };
    targetRef.current = nextBounds;
    if (motionRef.current.width === 64 && motionRef.current.left === 0 && motionRef.current.top === 0 && settledTab === "home" && activeTab === "home") {
      motionRef.current = { ...nextBounds, scaleX: 1, scaleY: 1 };
      setMotionStyle(motionRef.current);
    }
    startSpring();
  };

  useLayoutEffect(measureActiveTab, [activeTab]);

  useEffect(() => {
    window.addEventListener("resize", measureActiveTab);
    return () => window.removeEventListener("resize", measureActiveTab);
  }, [activeTab]);

  useEffect(() => () => stopSpring(), []);

  useEffect(() => {
    const scroll = document.querySelector<HTMLDivElement>(".long-image-shell .mobile-scroll");
    if (!scroll) return;

    const syncDiffusion = () => setHomeScrollTop(scroll.scrollTop);
    syncDiffusion();
    scroll.addEventListener("scroll", syncDiffusion, { passive: true });
    return () => scroll.removeEventListener("scroll", syncDiffusion);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const source = commentsOpen
      ? (playerVariant === "maybe" ? "/assets/music/maybe-comments-page.png" : "/assets/music/comments-page.png")
      : playerOpen
        ? (playerVariant === "maybe" ? "/assets/music/maybe-player-detail.png" : "/assets/music/player-detail.png")
        : "/assets/music/long-home-clean.png";
    let image = statusImagesRef.current.get(source);
    if (!image) {
      image = new Image();
      image.src = source;
      statusImagesRef.current.set(source, image);
    }

    const updateStatusBarTone = () => {
      if (cancelled) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;

      const scaleX = image.naturalWidth / 375;
      const scaleY = playerOpen ? image.naturalHeight / 844 : scaleX;
      const sampleY = Math.max(0, Math.min(image.naturalHeight - 1, (playerOpen ? 22 : homeScrollTop + 22) * scaleY));
      const ranges = [[38, 88], [270, 352]] as const;
      canvas.width = ranges.reduce((total, [start, end]) => total + end - start, 0);
      canvas.height = 1;
      let destinationX = 0;

      for (const [start, end] of ranges) {
        const width = end - start;
        context.drawImage(image, start * scaleX, sampleY, width * scaleX, Math.max(1, scaleY), destinationX, 0, width, 1);
        destinationX += width;
      }

      const pixels = context.getImageData(0, 0, canvas.width, 1).data;
      let luminance = 0;
      let samples = 0;

      for (let index = 0; index < pixels.length; index += 16) {
        const alpha = pixels[index + 3] / 255;
        const red = (pixels[index] / 255) * alpha;
        const green = (pixels[index + 1] / 255) * alpha;
        const blue = (pixels[index + 2] / 255) * alpha;
        luminance += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        samples += 1;
      }

      setStatusBarDarkIcons(samples > 0 && luminance / samples > 0.62);
    };

    if (image.complete && image.naturalWidth > 0) updateStatusBarTone();
    else image.addEventListener("load", updateStatusBarTone, { once: true });

    return () => {
      cancelled = true;
      image.removeEventListener("load", updateStatusBarTone);
    };
  }, [commentsOpen, homeScrollTop, playerOpen, playerVariant]);

  const selectTab = (id: string) => {
    if (id === activeTab) return;
    activeIdRef.current = id;
    setActiveTab(id);
    startSpring();
  };

  return (
    <div className="app-shell long-image-shell">
      <MobileScroll className="app-scroll long-scroll">
        <main className="long-image-content" aria-label="Music home long screenshot">
          <div className="hero-original-clear" aria-hidden="true" />
          <div className="hero-banner-carousel">
            <Carousel
              contentClassName="hero-banner-track"
              ariaLabel="Featured music"
              showScrollbar={false}
            >
              {featuredCards.map(([asset, label], index) => index === 0 ? (
                <button
                  className="hero-banner-card-action"
                  type="button"
                  key={asset}
                  aria-label={`Open ${label}`}
                  onClick={() => openPlayer("maybe")}
                >
                  <img className="hero-banner-card" src={`/assets/music/featured/${asset}`} alt={label} draggable={false} />
                </button>
              ) : (
                <img className="hero-banner-card" key={asset} src={`/assets/music/featured/${asset}`} alt={label} draggable={false} />
              ))}
            </Carousel>
          </div>
          <div className="album-original-clear" aria-hidden="true" />
          <img
            className="recently-see-more"
            src="/assets/music/see-more.svg"
            alt="See more"
            draggable={false}
          />
          <div className="album-banner-carousel">
            <Carousel
              contentClassName="album-banner-track"
              ariaLabel="Recently played albums"
              showScrollbar={false}
            >
              <img
                className="album-banner-overlay"
                src="/assets/music/album-banner.png"
                alt="Recently played albums"
                draggable={false}
              />
            </Carousel>
          </div>
          <div className="trend-nav-original-clear" aria-hidden="true" />
          <div className="trend-nav-carousel">
            <Carousel
              contentClassName="trend-nav-track"
              ariaLabel="Trending genres"
              showScrollbar={false}
            >
              {trendingFilters.map(([id, label, selectedAsset, idleAsset]) => {
                const selected = activeTrendingFilter === id;

                return (
                  <button
                    className="trend-filter-button"
                    type="button"
                    key={id}
                    aria-label={label}
                    aria-pressed={selected}
                    onClick={() => setActiveTrendingFilter(id)}
                  >
                    <img
                      src={`/assets/music/trending/${selected ? selectedAsset : idleAsset}`}
                      alt=""
                      draggable={false}
                    />
                  </button>
                );
              })}
            </Carousel>
          </div>
          <img
            className="long-home-image"
            src="/assets/music/long-home-clean.png"
            alt="Music home screen"
            draggable={false}
          />
        </main>
      </MobileScroll>
      <img
        className="home-diffusion"
        src="/assets/music/home-diffusion.png"
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ transform: `translate3d(0, ${-homeScrollTop}px, 0)` }}
      />
      <div
        className="player-glass-shell"
        role="button"
        tabIndex={0}
        aria-label="Open full player"
        onClick={() => openPlayer("default")}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPlayer("default");
          }
        }}
      >
        <img className="player-banner-overlay" src="/assets/music/player-banner.png" alt="Music player" draggable={false} />
      </div>
      <nav ref={navRef} className="tab-glass-shell tab-interactive-shell" aria-label="Main navigation">
        <img
          className="tab-selected-moving"
          src="/assets/music/tabs/jn.svg"
          alt=""
          aria-hidden="true"
          style={{
            transform: `translate3d(${motionStyle.left - (motionStyle.width * (motionStyle.scaleX - 1)) / 2}px, ${motionStyle.top + (motionStyle.height * (1 - motionStyle.scaleY)) / 2}px, 0) scale(${motionStyle.scaleX}, ${motionStyle.scaleY})`,
            width: motionStyle.width,
            height: motionStyle.height,
          }}
        />
        {tabOptions.map(([id, idle, selected, label]) => {
          const isActive = settledTab === id;
          return (
            <button
              key={id}
              className="tab-action"
              type="button"
              aria-label={label}
              aria-pressed={activeTab === id}
              ref={(node) => { tabRefs.current[id] = node; }}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => {
                selectTab(id);
                requestAnimationFrame(() => (document.activeElement as HTMLElement | null)?.blur());
              }}
            >
              <img
                className={`tab-icon tab-icon-idle${isActive ? "" : " is-visible"}`}
                src={`/assets/music/tabs/${idle}`}
                alt=""
                aria-hidden="true"
              />
              <img
                className={`tab-icon tab-icon-selected${isActive ? " is-visible" : ""}`}
                src={`/assets/music/tabs/${selected}`}
                alt=""
                aria-hidden="true"
              />
            </button>
          );
        })}
      </nav>
      {playerOpen && (
        <section
          className={`player-detail-page${playerVariant === "maybe" ? " is-maybe" : ""}${playerEntered ? " has-entered" : ""}${playerDragging ? " is-dragging" : ""}${playerSnapping ? " is-snapping" : ""}${playerClosing ? " is-closing" : ""}${commentsOpen ? " has-comments" : ""}${commentsClosing ? " comments-closing" : ""}`}
          aria-label="Now playing"
          aria-modal="true"
          role="dialog"
          style={{ "--player-drag-y": `${playerDragY}px` } as CSSProperties}
          onPointerDown={beginPlayerDrag}
          onPointerMove={movePlayerDrag}
          onPointerUp={endPlayerDrag}
          onPointerCancel={endPlayerDrag}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && !playerClosing) setPlayerEntered(true);
          }}
        >
          <img
            className="player-detail-image"
            src={playerVariant === "maybe" ? "/assets/music/maybe-player-detail.png" : "/assets/music/player-detail.png"}
            alt={playerVariant === "maybe" ? "Now playing: Used to This by Maybe" : "Now playing: The Boat I Row by Tame Impala"}
            draggable={false}
          />
          <div className="status-bar-mask status-bar-mask-player" aria-hidden="true" />
          {playerVariant === "default" && (
            <img
              className="player-detail-album"
              src="/assets/music/player-album.png"
              alt="Happier Than Ever album cover"
              draggable={false}
            />
          )}
          <button className="player-detail-comment" type="button" aria-label="Open comments" onClick={openComments}>
            <img src="/assets/music/comment.svg" alt="Comment" draggable={false} />
          </button>
          <button
            className="player-detail-close"
            type="button"
            aria-label="Close player"
            onClick={closePlayer}
          >
            <img src="/assets/music/player-exit.svg" alt="" aria-hidden="true" draggable={false} />
          </button>
          <div className="bottom-home-indicator-mask bottom-home-indicator-mask-player" aria-hidden="true" />
          {commentsOpen && (
            <section
              className={`comments-page${commentsEntered ? " has-entered" : ""}${commentsDragging ? " is-dragging" : ""}${commentsSnapping ? " is-snapping" : ""}${commentsClosing ? " is-closing" : ""}`}
              aria-label="Comments"
              aria-modal="true"
              role="dialog"
              style={{ "--comments-drag-y": `${commentsDragY}px` } as CSSProperties}
              onPointerDown={beginCommentsDrag}
              onPointerMove={moveCommentsDrag}
              onPointerUp={endCommentsDrag}
              onPointerCancel={endCommentsDrag}
              onAnimationEnd={() => {
                if (!commentsClosing) setCommentsEntered(true);
              }}
            >
              <img
                className="comments-page-image"
                src={playerVariant === "maybe" ? "/assets/music/maybe-comments-page.png" : "/assets/music/comments-page.png"}
                alt={playerVariant === "maybe" ? "Comments for Used to This by Maybe" : "Comments"}
                draggable={false}
              />
              <div className="status-bar-mask status-bar-mask-comments" aria-hidden="true" />
              <button className="comments-page-close" type="button" aria-label="Close comments" onClick={closeComments}>
                <img src="/assets/music/comments-down.svg" alt="" aria-hidden="true" draggable={false} />
              </button>
              <div className="bottom-home-indicator-mask bottom-home-indicator-mask-comments" aria-hidden="true" />
            </section>
          )}
        </section>
      )}
      <div className={`status-bar-overlay${statusBarDarkIcons ? " is-dark-icons" : ""}`} aria-hidden="true">
        <img src="/assets/music/status-bar-fixed.svg" alt="" draggable={false} />
      </div>
    </div>
  );
}
