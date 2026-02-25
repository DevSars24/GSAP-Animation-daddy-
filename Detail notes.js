
/*
=============================================================================
  GSAP (GreenSock Animation Platform) - Complete Flow Notes
  Author  : Ayush Chaudhari
  Topic   : GSAP Core Concepts — Deep Dive
  Status  : In Progress — more notes coming as I go deeper
=============================================================================

  INDEX:
  1.  What is GSAP?
  2.  Core Animation Idea
  3.  How GSAP Works Internally
  4.  Three Core Methods
  5.  All Animatable Properties
  6.  Basic Concepts — Target, Duration, Delay, Repeat, Yoyo
  7.  Easing — Deep Dive
  8.  Timeline — Deep Dive  (most important)
  9.  Stagger — Deep Dive
  10. ScrollTrigger — Deep Dive
  11. Performance Rules
  12. Callbacks
  13. Utility Methods
  14. Responsive Animations
  15. GSAP with CSS Variables
  16. Animating SVG
  17. GSAP Plugins Overview
  18. Common Mistakes
  19. Debugging Tips
  20. How to Include GSAP in a Project
  21. Real World Patterns

=============================================================================
*/


// =============================================================================
// 1. WHAT IS GSAP?
// =============================================================================

/*
  GSAP (GreenSock Animation Platform) is a professional-grade JavaScript
  animation library. It is the industry standard for web animations, used
  by companies like Google, Apple, Nike, NASA, and Activision.

  It can animate literally anything that has a numeric value:
    - DOM elements (divs, images, buttons, headings)
    - CSS properties (colors, transforms, borders)
    - SVG (paths, shapes, morphing)
    - Canvas objects
    - JavaScript objects (any plain object with number values)
    - WebGL / Three.js values
    - Scroll position

  Why GSAP over CSS animations?

    CSS animations are fine for simple hover effects.
    But they break down when you need:
      - Sequenced animations without manual delays
      - Scroll-based control
      - Reverse playback
      - Dynamic values based on user interaction
      - Precise timing and overlap control
      - Animations on JS objects (not just DOM)

    GSAP solves all of this, and does it faster than CSS in most cases.

  Why GSAP over other JS libraries (Anime.js, Motion One, etc.)?
    - Most battle-tested library — exists since 2008
    - Best performance benchmarks
    - Largest community and documentation
    - ScrollTrigger plugin is unmatched
    - Professional support from GreenSock team
*/


// =============================================================================
// 2. CORE ANIMATION IDEA
// =============================================================================

/*
  Animation = Changing property values over time.

  At its simplest, GSAP takes a starting value and an ending value,
  and smoothly interpolates between them over a set duration.

  Starting value  →  interpolate  →  Ending value
       0          →  0.25 0.5 0.75 →     1

  GSAP modifies:
    position     ->  x, y  (translateX, translateY under the hood)
    scale        ->  scale, scaleX, scaleY
    rotation     ->  rotation (degrees), rotationX, rotationY (3D)
    opacity      ->  0 (invisible) to 1 (fully visible)
    skew         ->  skewX, skewY
    colors       ->  backgroundColor, color, borderColor
    borders      ->  borderRadius, borderWidth
    filters      ->  CSS filter values (blur, brightness, contrast)
    custom props ->  any CSS variable or JS object property

  THE GOLDEN RULE:
    Always animate using transforms and opacity.
    Never animate layout properties for performance-critical animations.

    Transform properties  ->  handled by GPU, zero layout impact
    Layout properties     ->  force full page layout recalc every frame

    Safe to animate:      x, y, scale, rotation, skew, opacity
    Avoid animating:      top, left, width, height, margin, padding, fontSize
*/


// =============================================================================
// 3. HOW GSAP WORKS INTERNALLY
// =============================================================================

/*
  Understanding this helps you write better animations.

  GSAP uses requestAnimationFrame (rAF) — a browser API that calls
  a function before every screen repaint (usually 60 times per second).

  Each frame, GSAP:
    1. Checks how much time has passed since the animation started
    2. Applies the easing function to get the current progress (0 to 1)
    3. Calculates the interpolated value for each property
    4. Applies those values to the target element
    5. Checks if the animation is complete

  This is why GSAP is smooth — it's synced with the browser's repaint cycle.
  This is also why animating layout properties is bad — it forces the browser
  to recalculate layout before every repaint, which is expensive.

  GSAP also batches DOM reads and writes to avoid layout thrashing.
  It caches computed styles and only reads them when absolutely necessary.

  Result: GSAP is often faster than native CSS animations for complex sequences
  because CSS still recalculates styles when you chain multiple animations.
*/


// =============================================================================
// 4. THREE CORE METHODS
// =============================================================================

// ---- gsap.to() ----
// Animate FROM the element's current state TO the values you define.
// Most commonly used method — good for everything.

gsap.to(".box", {
  x: 200,            // move 200px to the right
  opacity: 0.5,      // fade to 50% opacity
  scale: 1.2,        // grow to 120%
  duration: 1,       // over 1 second
  ease: "power2.out"
});

// gsap.to() on multiple elements at once
gsap.to(".card", { y: -10, duration: 0.3 });  // animates ALL .card elements


// ---- gsap.from() ----
// Animate FROM the values you define TO the element's current state.
// Perfect for entrance / reveal animations.
// The element appears to be in its natural position — it just arrives there.

gsap.from(".heading", {
  y: -50,       // starts 50px above natural position
  opacity: 0,   // starts invisible
  duration: 1,
  ease: "power3.out"
  // ends at the element's natural y position and opacity: 1
});

// common pattern — hide elements with gsap.set first, then reveal with from()
gsap.set(".card", { opacity: 0, y: 30 });   // set initial hidden state
// ... later, when you want to reveal:
gsap.to(".card", { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" });


// ---- gsap.fromTo() ----
// You define BOTH the start and end values explicitly.
// Most control — use when you need to be 100% sure of both states.
// Avoids surprises from existing CSS styles affecting the start state.

gsap.fromTo(".box",
  { x: -100, opacity: 0, scale: 0.8 },            // from (start state)
  { x: 100,  opacity: 1, scale: 1, duration: 1 }  // to (end state)
);


// ---- gsap.set() ----
// Set values instantly — no animation, no duration.
// Use this instead of CSS for setting initial states of animated elements.
// Ensures GSAP tracks the values from the start.

gsap.set(".hero", { opacity: 0, y: 60 });
gsap.set(".overlay", { backgroundColor: "rgba(0,0,0,0)" });

// set on multiple elements with different values using a function
gsap.set(".item", {
  x: (index) => index * 100   // each .item gets a different x value
});


// =============================================================================
// 5. ALL ANIMATABLE PROPERTIES
// =============================================================================

/*
  TRANSFORM PROPERTIES (recommended — GPU accelerated):

    x           ->  translateX in pixels         gsap.to(".el", { x: 100 })
    y           ->  translateY in pixels         gsap.to(".el", { y: -50 })
    xPercent    ->  translateX in %              gsap.to(".el", { xPercent: -50 })
    yPercent    ->  translateY in %              gsap.to(".el", { yPercent: -50 })
    scale       ->  uniform scale                gsap.to(".el", { scale: 1.5 })
    scaleX      ->  horizontal scale only        gsap.to(".el", { scaleX: 2 })
    scaleY      ->  vertical scale only          gsap.to(".el", { scaleY: 0 })
    rotation    ->  rotate in degrees            gsap.to(".el", { rotation: 360 })
    rotationX   ->  3D X axis rotation           gsap.to(".el", { rotationX: 90 })
    rotationY   ->  3D Y axis rotation           gsap.to(".el", { rotationY: 180 })
    skewX       ->  horizontal skew in degrees   gsap.to(".el", { skewX: 20 })
    skewY       ->  vertical skew in degrees     gsap.to(".el", { skewY: 10 })

  OPACITY:
    opacity     ->  0 (invisible) to 1 (visible) gsap.to(".el", { opacity: 0 })
    autoAlpha   ->  opacity + visibility toggle  gsap.to(".el", { autoAlpha: 0 })
    // autoAlpha is smarter than opacity — it also sets visibility: hidden at 0
    // so the element is removed from accessibility tree and tab order

  CSS PROPERTIES (use carefully — some trigger layout):
    backgroundColor   ->  gsap.to(".el", { backgroundColor: "#ff0000" })
    color             ->  gsap.to(".el", { color: "rgb(255,0,0)" })
    borderRadius      ->  gsap.to(".el", { borderRadius: "50%" })
    borderColor       ->  gsap.to(".el", { borderColor: "#000" })
    boxShadow         ->  gsap.to(".el", { boxShadow: "0 10px 30px rgba(0,0,0,0.3)" })
    filter            ->  gsap.to(".el", { filter: "blur(10px)" })
    clipPath          ->  gsap.to(".el", { clipPath: "inset(0 0 0 0)" })
    width             ->  AVOID unless necessary
    height            ->  AVOID unless necessary
    padding           ->  AVOID unless necessary
    margin            ->  AVOID unless necessary

  CONTROL PROPERTIES (not visual, but control animation behavior):
    duration      ->  how long in seconds             { duration: 1.5 }
    delay         ->  wait before starting            { delay: 0.5 }
    ease          ->  motion curve                    { ease: "power2.out" }
    repeat        ->  how many times (-1 = infinite)  { repeat: -1 }
    yoyo          ->  reverse on repeat               { yoyo: true }
    repeatDelay   ->  wait between repeats            { repeatDelay: 1 }
    stagger       ->  delay between multiple targets  { stagger: 0.1 }
    paused        ->  start paused                    { paused: true }
    reversed      ->  start reversed                  { reversed: true }
    overwrite     ->  handle conflicting tweens       { overwrite: "auto" }
*/


// =============================================================================
// 6. BASIC CONCEPTS — DEEP DIVE
// =============================================================================

// ---- TARGET ----
// Target is the thing you want to animate.
// GSAP accepts many different target types:

gsap.to(".box", { x: 100 });                          // CSS class (all matching elements)
gsap.to("#hero", { x: 100 });                         // CSS id
gsap.to("div", { x: 100 });                           // HTML tag (all divs)
gsap.to(document.querySelector(".box"), { x: 100 });  // direct DOM reference
gsap.to([el1, el2, el3], { x: 100 });                 // array of elements
gsap.to(".box, .card", { x: 100 });                   // multiple selectors
gsap.to(myObject, { value: 100 });                    // plain JS object

// animating a plain JS object — useful for custom rendering
const obj = { progress: 0 };
gsap.to(obj, {
  progress: 1,
  duration: 2,
  onUpdate: () => {
    // use obj.progress to drive something custom (canvas, WebGL, counter)
    console.log(obj.progress);
  }
});

// animated number counter example
const counter = { value: 0 };
gsap.to(counter, {
  value: 1500,
  duration: 2,
  ease: "power1.out",
  onUpdate: () => {
    document.querySelector(".counter").textContent = Math.round(counter.value);
  }
});


// ---- DURATION ----
// In seconds. Default is 0.5 if not specified.
// There is no "right" duration — depends on the element size and context.

// General guidelines:
//   Micro interactions (hover, click)     ->  0.15 - 0.3s
//   UI element entrances                  ->  0.4 - 0.8s
//   Page section reveals                  ->  0.6 - 1.2s
//   Hero / cinematic animations           ->  1 - 2s
//   Scroll-scrubbed (no fixed duration)   ->  scrub controls it


// ---- DELAY ----
// How long to wait before starting, in seconds.
// Prefer Timeline over stacking delays — see section 8.

gsap.from(".title", { opacity: 0, duration: 1, delay: 0.3 });

// repeat delay — wait between each repeat
gsap.to(".dot", {
  scale: 1.3,
  duration: 0.5,
  repeat: -1,
  yoyo: true,
  repeatDelay: 1   // wait 1 second between each cycle
});


// ---- REPEAT AND YOYO ----
// repeat: 2    ->  plays 3 times total (original + 2 repeats)
// repeat: -1   ->  infinite loop
// yoyo: true   ->  reverses direction on alternate repeats

// breathing effect example
gsap.to(".logo", {
  scale: 1.05,
  duration: 1.5,
  repeat: -1,
  yoyo: true,
  ease: "sine.inOut"   // sine is perfect for smooth looping
});


// ---- OVERWRITE ----
// What happens when two tweens try to animate the same property on the same element?
// By default, both run and they fight each other.

// overwrite: "auto"  ->  GSAP figures out which properties conflict and kills only those
// overwrite: true    ->  kills ALL previous tweens on the target
// overwrite: false   ->  lets all tweens run (default, can cause conflicts)

// common pattern — hover animations
element.addEventListener("mouseenter", () => {
  gsap.to(element, { scale: 1.05, duration: 0.3, overwrite: "auto" });
});
element.addEventListener("mouseleave", () => {
  gsap.to(element, { scale: 1, duration: 0.3, overwrite: "auto" });
});


// =============================================================================
// 7. EASING — DEEP DIVE
// =============================================================================

/*
  Easing is the most important thing for making animations feel good.
  Two animations with the same duration can feel completely different
  depending on the ease applied.

  Ease = a mathematical function that maps linear time (0-1) to
  a custom progress curve (also 0-1, but with acceleration/deceleration).

  LINEAR TIME:      0 --- 0.25 --- 0.5 --- 0.75 --- 1
  EASE OUT CURVE:   0 ---  0.6 --- 0.85 --- 0.95 --- 1
  (starts fast, decelerates)

  Every ease family has three variants:
    .in      ->  slow start, fast end   (like accelerating from rest)
    .out     ->  fast start, slow end   (like braking to a stop) — most natural for entrances
    .inOut   ->  slow start AND end     (smooth, cinematic feel)

  RULE OF THUMB:
    Entrances (elements coming in)  ->  use .out  (decelerates to rest)
    Exits (elements going away)     ->  use .in   (accelerates away)
    Transitions between states      ->  use .inOut (smooth both ways)
*/

// ---- POWER EASES ---- (most commonly used)
// power1 = subtle  |  power2 = natural  |  power3 = snappy  |  power4 = dramatic

gsap.from(".el", { y: 40, ease: "power1.out" });   // very gentle
gsap.from(".el", { y: 40, ease: "power2.out" });   // natural — use this 80% of the time
gsap.from(".el", { y: 40, ease: "power3.out" });   // snappy, confident
gsap.from(".el", { y: 40, ease: "power4.out" });   // very dramatic, fast then crawls to stop


// ---- BACK EASE ---- (slight overshoot then settles)
// Good for button interactions, card appearances, icon reveals
// The number controls how much it overshoots

gsap.from(".btn", { scale: 0.8, ease: "back.out(1.7)" });   // default overshoot
gsap.from(".btn", { scale: 0.8, ease: "back.out(3)" });     // more overshoot
gsap.from(".btn", { scale: 0.8, ease: "back.out(0.5)" });   // less overshoot


// ---- ELASTIC EASE ---- (spring / rubber band feel)
// Two parameters: amplitude (how far it overshoots) and period (how fast it oscillates)
// Use sparingly — one or two per page max

gsap.from(".icon", { scale: 0, ease: "elastic.out(1, 0.3)" });    // default spring
gsap.from(".icon", { scale: 0, ease: "elastic.out(1.5, 0.4)" });  // bigger spring
gsap.from(".icon", { scale: 0, ease: "elastic.out(0.5, 0.5)" });  // softer spring


// ---- BOUNCE EASE ---- (dropped ball bouncing)
// Use for playful/game-like UI
gsap.from(".ball", { y: -200, ease: "bounce.out" });


// ---- EXPO EASE ---- (extreme version of power)
// Very fast then almost stops — great for dramatic reveals
gsap.from(".hero-title", { x: -100, opacity: 0, ease: "expo.out" });


// ---- CIRC EASE ---- (circular motion curve, very smooth)
gsap.from(".panel", { opacity: 0, ease: "circ.inOut" });


// ---- SINE EASE ---- (the most subtle ease, like a sine wave)
// Perfect for smooth infinite loops (breathing, floating, pulsing)
gsap.to(".floating", {
  y: -15,
  repeat: -1,
  yoyo: true,
  duration: 2,
  ease: "sine.inOut"
});


// ---- STEPS EASE ---- (frame-by-frame / digital feel)
// Useful for sprite sheet animations or typewriter effects
gsap.to(".sprite", { backgroundPosition: "-500px 0", ease: "steps(5)", duration: 1 });


// ---- CUSTOM EASE ---- (draw your own curve)
// Requires CustomEase plugin
gsap.registerPlugin(CustomEase);
CustomEase.create("myEase", "M0,0 C0.14,0 0.242,0.438 0.272,0.561 0.313,0.728 0.354,0.963 0.362,1");
gsap.to(".el", { x: 200, ease: "myEase" });

// Visualize and create custom eases: https://gsap.com/docs/v3/Eases/


// =============================================================================
// 8. TIMELINE — DEEP DIVE  (most important concept)
// =============================================================================

/*
  Timeline = A container for multiple animations that you control as one unit.
  Ek ke baad ek animations chalane ka system — without manual delays.

  Think of it like a video editor timeline — you can place animations
  at exact positions, overlap them, and control the whole thing at once.

  Why Timeline over individual tweens with delays?

    PROBLEM with delays:
      If you change the duration of the first animation,
      you have to manually update every delay after it.
      This is fragile, time-consuming, and easy to mess up.

    SOLUTION with Timeline:
      Each animation's position is relative to the previous one.
      Change one thing — everything adjusts automatically.
*/

// ---- CREATING A TIMELINE ----

const tl = gsap.timeline();

// basic sequential — each starts after the previous ends
tl.from(".nav",     { y: -30, opacity: 0, duration: 0.6 })
  .from(".hero",    { y: 20,  opacity: 0, duration: 0.8 })
  .from(".tagline", { y: 20,  opacity: 0, duration: 0.6 })
  .from(".cta-btn", { scale: 0.8, opacity: 0, duration: 0.5 });


// ---- TIMELINE DEFAULTS ----
// Avoid repeating the same properties on every animation

const tl2 = gsap.timeline({
  defaults: {
    duration: 0.7,
    ease: "power2.out",
    opacity: 0      // every animation will start from opacity 0 unless overridden
  }
});

tl2.from(".nav",     { y: -30 })       // inherits duration, ease, opacity from defaults
   .from(".hero",    { y: 20 })
   .from(".tagline", { y: 20 })
   .from(".cta-btn", { scale: 0.8, duration: 0.4 });  // overrides duration for this one


// ---- POSITION PARAMETER (most important timeline concept) ----
// Third argument to .to() / .from() / .fromTo() on a timeline
// Controls WHEN the animation starts relative to the rest of the timeline

const tl3 = gsap.timeline();

tl3.from(".a", { x: -100, duration: 1 })
   // ↑ starts at 0s, ends at 1s

   .from(".b", { x: -100, duration: 1 })
   // default (no position param) -> starts at 1s (after .a ends)

   .from(".c", { x: -100, duration: 1 }, "+=0.5")
   // += -> starts 0.5s AFTER .b ends (gap between them)

   .from(".d", { x: -100, duration: 1 }, "-=0.3")
   // -= -> starts 0.3s BEFORE .c ends (overlap)

   .from(".e", { x: -100, duration: 1 }, "<")
   // < -> starts at SAME TIME as .d started (perfectly synced)

   .from(".f", { x: -100, duration: 1 }, "<0.2")
   // <0.2 -> starts 0.2s after .e STARTED (slight offset from sync)

   .from(".g", { x: -100, duration: 1 }, ">")
   // > -> starts when .f ENDS (same as default but explicit)

   .from(".h", { x: -100, duration: 1 }, 2)
   // absolute -> starts at exactly 2 seconds into the timeline

   .from(".i", { x: -100, duration: 1 }, "myLabel")
   // starts at the position of a named label


// ---- LABELS ----
// Named positions in the timeline you can reference and seek to

const tl4 = gsap.timeline();

tl4.addLabel("start", 0)
   .from(".logo", { opacity: 0 }, "start")
   .from(".nav-items", { y: -20, opacity: 0, stagger: 0.1 }, "start+=0.3")
   .addLabel("heroReady", "+=0.2")
   .from(".hero-title", { y: 40, opacity: 0 }, "heroReady")
   .from(".hero-sub",   { y: 30, opacity: 0 }, "heroReady+=0.2");

// seeking to a label
tl4.seek("heroReady");


// ---- NESTED TIMELINES ----
// A timeline can contain other timelines.
// This is powerful for organizing complex animation sequences.

function createNavAnimation() {
  const tl = gsap.timeline();
  tl.from(".logo", { opacity: 0, x: -20 })
    .from(".nav-links", { opacity: 0, y: -10, stagger: 0.1 }, "<0.1");
  return tl;
}

function createHeroAnimation() {
  const tl = gsap.timeline();
  tl.from(".hero-title", { y: 60, opacity: 0 })
    .from(".hero-sub",   { y: 40, opacity: 0 }, "-=0.3")
    .from(".hero-cta",   { scale: 0.9, opacity: 0 }, "-=0.2");
  return tl;
}

// master timeline — combines everything
const master = gsap.timeline();
master.add(createNavAnimation())
      .add(createHeroAnimation(), "-=0.4");


// ---- TIMELINE PLAYBACK ----

const tl5 = gsap.timeline({ paused: true });
tl5.from(".menu-item", { x: -40, opacity: 0, stagger: 0.08 });

tl5.play();              // play forward from current position
tl5.pause();             // pause at current position
tl5.reverse();           // play backward from current position
tl5.restart();           // go back to start and play
tl5.seek(1.5);           // jump to 1.5s mark (no play, just position)
tl5.seek("heroReady");   // seek to label
tl5.progress(0);         // jump to 0% (start)
tl5.progress(0.5);       // jump to 50%
tl5.progress(1);         // jump to 100% (end)
tl5.timeScale(1.5);      // play 1.5x faster
tl5.timeScale(0.5);      // play in slow motion
tl5.kill();              // destroy the timeline and free memory

// reading timeline state
console.log(tl5.duration());     // total duration
console.log(tl5.time());         // current time position
console.log(tl5.progress());     // current progress 0-1
console.log(tl5.isActive());     // is it currently playing?
console.log(tl5.paused());       // is it paused?
console.log(tl5.reversed());     // is it reversed?

// toggle play/pause
document.querySelector(".play-btn").addEventListener("click", () => {
  tl5.paused() ? tl5.play() : tl5.pause();
});

// toggle forward/backward
document.querySelector(".toggle-btn").addEventListener("click", () => {
  tl5.reversed() ? tl5.play() : tl5.reverse();
});


// ---- TIMELINE CALLBACKS ----

const tl6 = gsap.timeline({
  onStart:           ()  => console.log("timeline started"),
  onComplete:        ()  => console.log("timeline finished"),
  onUpdate:          ()  => console.log("current time:", tl6.time()),
  onRepeat:          ()  => console.log("repeated"),
  onReverseComplete: ()  => console.log("reversed to start"),
});


// =============================================================================
// 9. STAGGER — DEEP DIVE
// =============================================================================

/*
  Stagger = applying a time offset between each element in a group animation.
  Instead of all elements animating at exactly the same time,
  they cascade one after another.

  This is what makes list reveals, card grids, and text animations look polished.
  Without stagger, the same animation looks flat and robotic.

  Use stagger for:
    - Card or grid reveals
    - Navbar menu items
    - Text word or letter animations
    - Image gallery entrances
    - List item reveals
    - Form field entrances
    - Any group of repeated elements
*/

// ---- BASIC STAGGER ----
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.6,
  ease: "power2.out",
  stagger: 0.1   // 0.1s delay between each .card element
});

// stagger with overlap — all elements animate but offset
// total animation time = duration + (stagger * (numElements - 1))
gsap.from(".item", {
  y: 30,
  opacity: 0,
  duration: 0.5,
  stagger: 0.08   // fast cascade — good for long lists
});


// ---- STAGGER AS OBJECT ---- (more control)
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.6,
  stagger: {
    amount: 0.8,          // total time spread across ALL elements
                          // 4 cards -> each gets 0.8/4 = 0.2s offset
    from: "center",       // where to start the cascade
                          // "start" | "end" | "center" | "edges" | "random" | index number
    ease: "power1.inOut"  // ease applied to the stagger distribution itself
                          // (different from the animation ease)
  }
});

// stagger from a specific index
gsap.from(".item", {
  scale: 0,
  opacity: 0,
  stagger: {
    amount: 1,
    from: 2   // start cascade from the third element (index 2)
  }
});

// random stagger — each element gets a random delay
gsap.from(".particle", {
  y: -100,
  opacity: 0,
  stagger: {
    amount: 1.5,
    from: "random"
  }
});


// ---- 2D GRID STAGGER ----
// For grid layouts where elements have both row and column positions
// GSAP calculates distance from the "from" point in 2D space

gsap.from(".grid-item", {
  scale: 0,
  opacity: 0,
  duration: 0.4,
  ease: "back.out(1.7)",
  stagger: {
    amount: 1.2,
    grid: [4, 5],        // [rows, columns] — must match your actual grid
    from: "center",      // start wave from center of grid
    ease: "power2.inOut"
  }
});

// grid stagger from a corner
gsap.from(".tile", {
  scale: 0,
  opacity: 0,
  duration: 0.3,
  stagger: {
    amount: 1,
    grid: [6, 6],
    from: 0    // index 0 = top-left corner
  }
});


// ---- STAGGER WITH FUNCTION-BASED VALUES ----
// Each element can get a different value using a function
// Function receives: index, target element, all targets array

gsap.from(".item", {
  x: (index) => index % 2 === 0 ? -100 : 100,   // alternating left/right
  opacity: 0,
  duration: 0.6,
  stagger: 0.1
});

gsap.from(".item", {
  y: (index, target) => {
    return target.dataset.row * 50;   // use data attribute to determine offset
  },
  opacity: 0,
  stagger: 0.1
});


// =============================================================================
// 10. SCROLLTRIGGER — DEEP DIVE
// =============================================================================

/*
  ScrollTrigger is a GSAP plugin that connects animations to scroll position.
  It is the main reason GSAP is used on modern portfolio and agency websites.

  What it can do:
    - Trigger an animation when an element scrolls into view
    - Scrub — tie animation progress directly to scroll distance
    - Pin — lock an element in place while user scrolls
    - Parallax effects — move elements at different speeds
    - Horizontal scroll panels
    - Scroll-based storytelling
    - Progress bars
    - Counter animations on scroll

  Always register before use:
    gsap.registerPlugin(ScrollTrigger);
*/

gsap.registerPlugin(ScrollTrigger);


// ---- BASIC SCROLLTRIGGER ----

gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",               // element that activates the trigger
    start: "top 80%",                  // when trigger's TOP hits 80% down the viewport
    end: "top 30%",                    // when trigger's TOP hits 30% down the viewport
    toggleActions: "play none none reverse",
    markers: true                      // REMOVE IN PRODUCTION
  },
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out"
});

/*
  START and END values explained:
  Each takes two keywords: "[trigger edge] [viewport edge]"

  Trigger edges:  "top" "center" "bottom"  or pixel/percentage values
  Viewport edges: "top" "center" "bottom"  or percentage from top (e.g., "80%")

  Common combinations:
    "top 80%"        ->  trigger's top hits 80% down the viewport  (early trigger)
    "top center"     ->  trigger's top hits center of viewport     (mid trigger)
    "top top"        ->  trigger's top hits top of viewport        (late trigger, used for pin)
    "center center"  ->  trigger's center hits viewport center
    "bottom bottom"  ->  trigger's bottom hits viewport bottom
    "top+=100 80%"   ->  100px below trigger's top, at 80% of viewport
*/


// ---- TOGGLEACTIONS ----
/*
  toggleActions: "onEnter onLeave onEnterBack onLeaveBack"

  Each of the four positions takes one of these values:
    "play"     ->  play the animation
    "pause"    ->  pause at current position
    "resume"   ->  resume from current position
    "reverse"  ->  play backward
    "restart"  ->  restart from beginning
    "reset"    ->  jump to start but don't play
    "complete" ->  jump to end
    "none"     ->  do nothing

  Common presets:
    "play none none none"    ->  play once, never reverse
    "play none none reverse" ->  play in, reverse out (most common)
    "play pause resume none" ->  pause when you leave, resume when you come back
    "restart none none none" ->  restart every time you enter
*/

gsap.from(".el", {
  scrollTrigger: {
    trigger: ".el",
    start: "top 75%",
    toggleActions: "play none none reverse"
  },
  opacity: 0, y: 40, duration: 0.8
});


// ---- SCRUB ----
/*
  scrub ties the animation progress to scroll position.
  Instead of playing at its own speed, it follows your scroll.

  scrub: true    ->  instant response (no lag between scroll and animation)
  scrub: 1       ->  animation lags 1 second behind scroll (smooth feel)
  scrub: 2       ->  2 second lag (heavier, more cinematic)
  scrub: 0.5     ->  0.5 second lag (snappier but still smooth)
*/

gsap.to(".parallax-bg", {
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: 1
  },
  y: 200    // moves 200px down as you scroll through the section
});

// scrub with a timeline
const scrubTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".story-section",
    start: "top top",
    end: "+=2000",   // scroll 2000px while pinned
    scrub: 1,
    pin: true
  }
});

scrubTl.from(".text-1", { opacity: 0, y: 40 })
        .from(".text-2", { opacity: 0, y: 40 })
        .from(".image",  { scale: 0.8, opacity: 0 });


// ---- PIN ----
/*
  pin: true  ->  pins the trigger element (or specified element) in place
                 while the user scrolls through the trigger zone.
  After the end point is reached, the element unpins and continues naturally.
  GSAP automatically adds spacing below the pinned element so page flow isn't broken.
*/

// basic pin
gsap.to(".sticky-section", {
  scrollTrigger: {
    trigger: ".sticky-section",
    start: "top top",
    end: "+=600",   // stays pinned for 600px of scroll
    pin: true,
    scrub: true
  },
  backgroundColor: "#000",
  color: "#fff"
});

// pin a parent, animate children inside while scrubbing
const panelTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".panel-wrapper",
    start: "top top",
    end: "+=1500",
    pin: true,
    scrub: 1
  }
});

panelTl.from(".panel-1 .content", { opacity: 0, y: 40 })
       .to(".panel-1", { opacity: 0 })
       .from(".panel-2 .content", { opacity: 0, y: 40 })
       .to(".panel-2", { opacity: 0 })
       .from(".panel-3 .content", { opacity: 0, y: 40 });


// ---- SCROLLTRIGGER CALLBACKS ----

gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",
    start: "top 80%",
    end: "bottom 20%",
    onEnter:      (self) => console.log("entered! progress:", self.progress),
    onLeave:      (self) => console.log("left going down"),
    onEnterBack:  (self) => console.log("entered scrolling back up"),
    onLeaveBack:  (self) => console.log("left going back to top"),
    onUpdate:     (self) => console.log("scroll progress:", self.progress.toFixed(2)),
    onToggle:     (self) => console.log("active:", self.isActive)
  },
  opacity: 0, y: 40
});


// ---- SCROLLTRIGGER.BATCH ----
/*
  More efficient than creating individual ScrollTriggers for each element in a list.
  Batches elements that trigger at the same time and animates them together.
  Perfect for long lists, cards, blog post grids.
*/

ScrollTrigger.batch(".card", {
  onEnter: (elements) => {
    gsap.from(elements, {
      y: 40,
      opacity: 0,
      stagger: 0.08,
      duration: 0.6,
      ease: "power2.out"
    });
  },
  onLeave: (elements) => {
    gsap.to(elements, { opacity: 0.3, duration: 0.3 });
  },
  onEnterBack: (elements) => {
    gsap.to(elements, { opacity: 1, duration: 0.3 });
  },
  start: "top 85%",
  batchMax: 5   // maximum elements per batch
});


// ---- STANDALONE SCROLLTRIGGER (no animation) ----
// Use ScrollTrigger just to run code at scroll positions

ScrollTrigger.create({
  trigger: ".section",
  start: "top 50%",
  onEnter: () => {
    document.body.classList.add("dark-mode");
  },
  onLeaveBack: () => {
    document.body.classList.remove("dark-mode");
  }
});


// ---- SCROLLTRIGGER UTILITY METHODS ----

ScrollTrigger.refresh();          // recalculate all trigger positions (call after layout changes)
ScrollTrigger.kill();             // kill all ScrollTrigger instances
ScrollTrigger.getAll();           // returns array of all instances
ScrollTrigger.getById("myId");    // get a specific instance by id

// kill a specific instance
const st = ScrollTrigger.create({ trigger: ".el", start: "top 80%" });
st.kill();

// scroll to a position programmatically
window.scrollTo({ top: 500, behavior: "smooth" });

// get current scroll position
console.log(ScrollTrigger.scrollerProxy);


// =============================================================================
// 11. PERFORMANCE RULES
// =============================================================================

/*
  RULE 1 — Only animate GPU-composited properties:

    Safe (GPU):           x, y, scaleX, scaleY, rotation, skewX, skewY, opacity
    Avoid (CPU layout):   top, left, right, bottom, width, height, margin, padding

    Every frame, the browser does:
      1. JavaScript   ->  calculate new values
      2. Style        ->  apply new values
      3. Layout       ->  calculate positions and sizes  (EXPENSIVE — avoid triggering)
      4. Paint        ->  draw pixels                    (somewhat expensive)
      5. Composite    ->  combine layers                 (cheap — GPU handles this)

    transform and opacity skip steps 3 and 4 entirely.
    Everything else triggers at least step 3.

  RULE 2 — Use will-change for elements you know will animate

    .animated-el {
      will-change: transform, opacity;
    }

    This tells the browser to put this element on its own compositor layer in advance.
    Don't abuse it — too many will-change layers uses more GPU memory.

  RULE 3 — Use autoAlpha instead of opacity when hiding elements completely

    gsap.to(".el", { autoAlpha: 0 })
    // Sets opacity: 0 AND visibility: hidden
    // visibility: hidden removes element from tab order and accessibility tree
    // opacity: 0 alone keeps it in the tab order (accessible even when invisible)

  RULE 4 — Kill animations you no longer need

    gsap.killTweensOf(".el");    // kill all tweens on an element
    tl.kill();                   // kill a timeline

  RULE 5 — Use gsap.context() in component-based frameworks

    Prevents memory leaks when components unmount.
    See section 14 for full example.

  RULE 6 — Prefer ScrollTrigger.batch() over individual ScrollTriggers for lists

    100 cards = 100 separate ScrollTrigger instances = heavy
    ScrollTrigger.batch() = much more efficient

  RULE 7 — Use invalidateOnRefresh for responsive layouts

    When window resizes, ScrollTrigger.refresh() recalculates trigger positions.
    But animation start values may also need recalculation.
    invalidateOnRefresh: true tells GSAP to recalculate those too.
*/


// =============================================================================
// 12. CALLBACKS — DEEP DIVE
// =============================================================================

/*
  Callbacks let you run code at specific points in an animation.
  They are functions you pass as properties to gsap.to() / timeline / scrollTrigger.
*/

// ---- TWEEN CALLBACKS ----
gsap.to(".box", {
  x: 300,
  duration: 1,
  onStart:           () => console.log("started"),
  onComplete:        () => console.log("finished"),
  onUpdate:          () => console.log("frame update"),           // every frame
  onRepeat:          () => console.log("repeated"),
  onReverseComplete: () => console.log("reversed to beginning"),
});

// passing params to callbacks
gsap.to(".box", {
  x: 300,
  duration: 1,
  onComplete: onAnimComplete,
  onCompleteParams: [".box", "some value"]
});

function onAnimComplete(selector, value) {
  console.log("done animating", selector, value);
}

// using onUpdate to read current values
const tween = gsap.to(".box", {
  x: 300,
  duration: 2,
  onUpdate: () => {
    console.log("current x:", gsap.getProperty(".box", "x").toFixed(1));
  }
});

// practical callback example — show content after animation
gsap.from(".modal", {
  scale: 0.8,
  opacity: 0,
  duration: 0.4,
  ease: "back.out(1.7)",
  onComplete: () => {
    document.querySelector(".modal-content").focus();  // focus for accessibility
  }
});

// chaining animations without timeline using onComplete
gsap.from(".step-1", {
  opacity: 0, y: 20, duration: 0.6,
  onComplete: () => {
    gsap.from(".step-2", {
      opacity: 0, y: 20, duration: 0.6,
      onComplete: () => {
        gsap.from(".step-3", { opacity: 0, y: 20, duration: 0.6 });
      }
    });
  }
});
// NOTE: Use Timeline instead of this pattern — it's much cleaner.
// The above is just to show that onComplete can be chained.


// =============================================================================
// 13. UTILITY METHODS
// =============================================================================

// ---- KILL METHODS ----
gsap.killTweensOf(".box");          // kill all active tweens on .box
gsap.killTweensOf(".box", "x,y");   // kill only x and y tweens on .box
gsap.killTweensOf([el1, el2]);      // kill tweens on multiple elements

// ---- GET METHODS ----
const tweens = gsap.getTweensOf(".box");       // returns array of active tweens
const x = gsap.getProperty(".box", "x");       // get current x value
const opacity = gsap.getProperty(".box", "opacity");

// ---- GSAP.UTILS ----

// clamp — keeps a value within a range
const clamped = gsap.utils.clamp(0, 100, 150);     // returns 100
const clamped2 = gsap.utils.clamp(0, 100, -20);    // returns 0

// mapRange — maps a value from one range to another
// useful for connecting scroll progress to animation progress
const mapped = gsap.utils.mapRange(0, 1, 0, 500, 0.25);   // returns 125

// wrap — cycles through an array
const color = gsap.utils.wrap(["red", "green", "blue"], 4);  // returns "red" (wraps around)

// toArray — converts NodeList or selector to array
const cards = gsap.utils.toArray(".card");
cards.forEach(card => {
  gsap.from(card, { opacity: 0, y: 20 });
});

// random — generates a random value in a range
const randomX = gsap.utils.random(-100, 100);              // random between -100 and 100
const randomColor = gsap.utils.random(["red","blue","green"]);  // random from array

// pipe — chain utility functions together
const transform = gsap.utils.pipe(
  gsap.utils.clamp(0, 100),
  gsap.utils.mapRange(0, 100, 0, 1)
);
console.log(transform(150));  // clamps to 100, then maps to 1

// ---- TICKER ----
// gsap.ticker runs a callback every frame (synced with rAF)
// Use for frame-by-frame custom logic (game loops, WebGL updates)

gsap.ticker.add((time, deltaTime, frame) => {
  // runs every frame
  // time = total elapsed time in seconds
  // deltaTime = time since last frame in ms
  // frame = frame count
  myRenderer.update(deltaTime);
});

// remove a ticker callback
const myCallback = () => {};
gsap.ticker.add(myCallback);
gsap.ticker.remove(myCallback);

// change ticker FPS (default is 60)
gsap.ticker.fps(30);


// =============================================================================
// 14. RESPONSIVE ANIMATIONS
// =============================================================================

/*
  Animations calculated at page load can break when the window resizes.
  These patterns handle responsiveness correctly.
*/

// ---- SCROLLTRIGGER.REFRESH ----
// Recalculates all ScrollTrigger positions after layout changes
window.addEventListener("resize", () => {
  ScrollTrigger.refresh();
});


// ---- INVALIDATEONREFRESH ----
// If your animation's FROM values depend on layout (e.g., element position),
// use invalidateOnRefresh: true to recalculate them on resize.

gsap.from(".el", {
  scrollTrigger: {
    trigger: ".el",
    start: "top 80%",
    invalidateOnRefresh: true
  },
  x: () => window.innerWidth * 0.3,   // function-based value — recalculates on refresh
  opacity: 0
});


// ---- GSAP.MATCHMEDIA ----
// Run completely different animations for different breakpoints
// Automatically cleans up the right animations when breakpoint changes

const mm = gsap.matchMedia();

mm.add("(min-width: 1024px)", () => {
  // desktop animations
  gsap.from(".hero-title", { x: -200, opacity: 0, duration: 1 });
  gsap.from(".hero-image", { x: 200,  opacity: 0, duration: 1 }, "<");

  // return cleanup function
  return () => {
    // optional: code to run when this breakpoint is deactivated
  };
});

mm.add("(min-width: 768px) and (max-width: 1023px)", () => {
  // tablet animations
  gsap.from(".hero-title", { y: -50, opacity: 0, duration: 0.8 });
});

mm.add("(max-width: 767px)", () => {
  // mobile animations — simpler, less motion
  gsap.from(".hero-title", { y: 30, opacity: 0, duration: 0.6 });
});

// prefers-reduced-motion — respect accessibility settings
mm.add("(prefers-reduced-motion: no-preference)", () => {
  // only run these if user hasn't requested reduced motion
  gsap.from(".animated-element", { y: 60, opacity: 0, duration: 1 });
});


// ---- GSAP.CONTEXT — cleanup for React/Vue ----
// Scopes all GSAP animations to a container element
// Makes cleanup (revert) easy on component unmount

// React example
import { useEffect, useRef } from "react";

function MyComponent() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".card", { y: 40, opacity: 0, stagger: 0.1 });
      gsap.from(".title", { y: 20, opacity: 0 });
    }, containerRef);  // scope to this component's DOM

    return () => ctx.revert();  // cleanup: kills all tweens and reverts styles
  }, []);

  return <div ref={containerRef}>...</div>;
}


// =============================================================================
// 15. GSAP WITH CSS VARIABLES
// =============================================================================

// GSAP can animate CSS custom properties (variables)
// Useful when many elements share a variable value

document.documentElement.style.setProperty("--progress", "0");

gsap.to(document.documentElement, {
  "--progress": 1,
  duration: 2,
  ease: "power2.out",
  // your CSS can use var(--progress) to drive multiple things at once
});

// scroll progress bar example
gsap.to(document.documentElement, {
  "--scroll-progress": 1,
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});

// in CSS:
// .progress-bar { width: calc(var(--scroll-progress) * 100%) }


// =============================================================================
// 16. ANIMATING SVG
// =============================================================================

/*
  GSAP works great with SVG — far better than CSS for SVG animation.
  SVG has its own coordinate system and transform origin rules.
  GSAP handles these automatically.
*/

// animate SVG elements just like DOM elements
gsap.from("#svg-circle", {
  scale: 0,
  opacity: 0,
  duration: 0.8,
  ease: "back.out(1.7)",
  transformOrigin: "center center"  // GSAP normalizes SVG transform origin
});

// draw SVG paths (requires DrawSVGPlugin — club membership)
gsap.from("#path", { drawSVG: "0%", duration: 2, ease: "power2.inOut" });

// morph SVG shapes (requires MorphSVGPlugin — club membership)
gsap.to("#shape-1", { morphSVG: "#shape-2", duration: 1 });

// stroke dashoffset technique — free alternative to DrawSVG
// Step 1: in CSS  ->  stroke-dasharray: 1000; stroke-dashoffset: 1000;
// Step 2: animate dashoffset to 0
gsap.to("#line-path", {
  strokeDashoffset: 0,
  duration: 2,
  ease: "power2.inOut"
});

// animating SVG attributes directly
gsap.to("#circle", {
  attr: { cx: 300, cy: 200, r: 80 },   // animates SVG attributes (not CSS)
  duration: 1
});


// =============================================================================
// 17. GSAP PLUGINS OVERVIEW
// =============================================================================

/*
  FREE PLUGINS (included with GSAP, just register):

    ScrollTrigger   ->  scroll-based animations, scrub, pin, parallax
                        gsap.registerPlugin(ScrollTrigger)

    Draggable       ->  make elements draggable with inertia, bounds, snapping
                        gsap.registerPlugin(Draggable)

    TextPlugin      ->  animate text content character by character
                        gsap.registerPlugin(TextPlugin)
                        gsap.to(".el", { duration: 2, text: "New text here" })

    EaselPlugin     ->  animate EaselJS / CreateJS canvas objects

    PixiPlugin      ->  animate Pixi.js display objects

    CSSPlugin       ->  handles CSS properties (auto-included, always active)

    MotionPathPlugin ->  animate elements along an SVG path
                        gsap.registerPlugin(MotionPathPlugin)
                        gsap.to(".car", { motionPath: "#road", duration: 3 })

    Flip            ->  animate between layout states smoothly
                        gsap.registerPlugin(Flip)
                        const state = Flip.getState(".cards")
                        // rearrange DOM...
                        Flip.from(state, { duration: 0.6, ease: "power2.inOut" })

    Observer        ->  unified input detection (scroll, touch, wheel, drag)
                        gsap.registerPlugin(Observer)

  CLUB PLUGINS (require paid membership — professional projects):

    SplitText       ->  split text into chars/words/lines for animation
    DrawSVG         ->  animate SVG stroke drawing
    MorphSVGPlugin  ->  morph between SVG shapes
    ScrambleText    ->  scramble/unscramble text effect
    CustomEase      ->  draw custom ease curves (actually free now)
    CustomBounce    ->  create custom bounce eases
    GSDevTools      ->  visual debugger for GSAP timelines
    InertiaPlugin   ->  physics-based deceleration (used with Draggable)
    Physics2DPlugin ->  2D physics (gravity, velocity, acceleration)
    PhysicsPropsPlugin ->  animate properties with physics
*/


// =============================================================================
// 18. COMMON MISTAKES
// =============================================================================

/*
  1. FORGETTING TO REGISTER PLUGINS
     ScrollTrigger, TextPlugin, Flip — all need explicit registration.

       gsap.registerPlugin(ScrollTrigger);            // single
       gsap.registerPlugin(ScrollTrigger, Flip, Draggable);  // multiple

  2. ANIMATING LAYOUT PROPERTIES
       Bad:   gsap.to(".el", { width: 200, left: 100 })
       Good:  gsap.to(".el", { scaleX: 2, x: 100 })

  3. LEAVING markers: true IN PRODUCTION
     Debug markers render on screen for users. Always remove before deploying.

  4. STACKING DELAYS INSTEAD OF USING TIMELINE
       Bad:   gsap.from(".a", { delay: 0 }); gsap.from(".b", { delay: 0.5 })
       Good:  const tl = gsap.timeline(); tl.from(".a",...).from(".b",...)

  5. NOT CLEANING UP IN REACT/VUE
       Bad:   useEffect(() => { gsap.from(".el", { ... }) })
       Good:  useEffect(() => {
                const ctx = gsap.context(() => { gsap.from(".el", {...}) }, ref)
                return () => ctx.revert()
              })

  6. RUNNING GSAP BEFORE DOM IS READY
       Bad:   gsap.from(".hero", { ... })   // at top of script
       Good:  document.addEventListener("DOMContentLoaded", () => {
                gsap.from(".hero", { ... })
              })

  7. OVERUSING ELASTIC AND BOUNCE
     More than one or two springy effects per page feels chaotic.
     Use them sparingly for one focal element.

  8. ANIMATING display: none ELEMENTS
     GSAP cannot animate elements that are display: none.
     Use autoAlpha (which uses opacity + visibility) instead.
     Or set display to block before animating.

  9. CONFLICTING TWEENS ON HOVER
     Without overwrite, hovering in and out quickly creates fighting tweens.
       gsap.to(".btn", { scale: 1.05, duration: 0.3, overwrite: "auto" })

  10. NOT USING invalidateOnRefresh FOR RESPONSIVE SCRUB ANIMATIONS
      Function-based values in ScrollTrigger need invalidateOnRefresh: true
      to recalculate when the window resizes.
*/


// =============================================================================
// 19. DEBUGGING TIPS
// =============================================================================

/*
  1. USE markers: true IN SCROLLTRIGGER
     Shows exactly where start and end points are on screen.

  2. LOG TIMELINE PROGRESS
     const tl = gsap.timeline({ onUpdate: () => console.log(tl.progress()) })

  3. SLOW DOWN ANIMATIONS TO SEE WHAT'S HAPPENING
     gsap.globalTimeline.timeScale(0.1);   // 10x slower — great for debugging

  4. CHECK IF ELEMENT EXISTS BEFORE ANIMATING
     if (document.querySelector(".el")) {
       gsap.from(".el", { opacity: 0 })
     }

  5. USE GSAP DEVTOOLS (club plugin)
     Visual timeline debugger — shows all tweens, lets you scrub in real time.

  6. LOG ACTIVE TWEENS ON AN ELEMENT
     console.log(gsap.getTweensOf(".el"))

  7. CHECK FOR CSS CONFLICTS
     If animation isn't working, check if CSS is overriding with !important.
     GSAP writes inline styles — CSS with !important wins over inline.

  8. USE gsap.getProperty() TO VERIFY CURRENT VALUES
     console.log(gsap.getProperty(".el", "x"))
     console.log(gsap.getProperty(".el", "opacity"))

  9. TRANSFORM ORIGIN ISSUES WITH SVG
     SVG elements have different transform origin defaults.
     Always set transformOrigin explicitly for SVG animations.
     gsap.from("#svg-el", { rotation: 180, transformOrigin: "center center" })
*/

// useful debug snippet — slow everything down
gsap.globalTimeline.timeScale(0.2);    // 5x slower
// gsap.globalTimeline.timeScale(1);   // back to normal when done


// =============================================================================
// 20. HOW TO INCLUDE GSAP IN A PROJECT
// =============================================================================

/*
  OPTION A — CDN (best for learning and quick prototypes)
  Add these script tags before your own JS, inside <body> before </body>

    Core only:
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>

    With ScrollTrigger:
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

    With multiple plugins:
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/Draggable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/TextPlugin.min.js"></script>

  OPTION B — npm (for real projects using Vite, Webpack, React, Vue, etc.)

    Install:
    npm install gsap

    Import in your JS file:
    import gsap from "gsap"
    import { ScrollTrigger } from "gsap/ScrollTrigger"
    import { Draggable } from "gsap/Draggable"
    import { Flip } from "gsap/Flip"

    Register plugins after import:
    gsap.registerPlugin(ScrollTrigger, Draggable, Flip)

  NOTE: When using CDN, ScrollTrigger is a separate script tag.
        When using npm, each plugin is a separate import.
        Always call gsap.registerPlugin() before using any plugin.
        registerPlugin() is safe to call multiple times — no harm in registering twice.
*/


// =============================================================================
// 21. REAL WORLD PATTERNS
// =============================================================================

// ---- PAGE LOAD INTRO ANIMATION ----
document.addEventListener("DOMContentLoaded", () => {
  const intro = gsap.timeline({
    defaults: { ease: "power2.out", duration: 0.8 }
  });

  intro
    .from(".navbar",      { y: -60, opacity: 0 })
    .from(".hero-title",  { y: 40,  opacity: 0 }, "-=0.4")
    .from(".hero-sub",    { y: 30,  opacity: 0 }, "-=0.5")
    .from(".hero-cta",    { y: 20,  opacity: 0, scale: 0.95 }, "-=0.4")
    .from(".hero-image",  { x: 60,  opacity: 0 }, "-=0.7");
});


// ---- SCROLL REVEAL FOR SECTIONS ----
gsap.registerPlugin(ScrollTrigger);

document.querySelectorAll(".section").forEach((section) => {
  gsap.from(section.querySelectorAll(".reveal"), {
    scrollTrigger: {
      trigger: section,
      start: "top 75%",
      toggleActions: "play none none reverse"
    },
    y: 50,
    opacity: 0,
    duration: 0.7,
    ease: "power2.out",
    stagger: 0.1
  });
});


// ---- HOVER ANIMATION PATTERN ----
document.querySelectorAll(".card").forEach((card) => {
  const tl = gsap.timeline({ paused: true });
  tl.to(card, { y: -8, duration: 0.3, ease: "power2.out" })
    .to(card.querySelector(".card-overlay"), { opacity: 1, duration: 0.2 }, 0)
    .to(card.querySelector(".card-btn"), { y: 0, opacity: 1, duration: 0.3 }, 0.1);

  card.addEventListener("mouseenter", () => tl.play());
  card.addEventListener("mouseleave", () => tl.reverse());
});


// ---- SCROLL PROGRESS BAR ----
gsap.to(".progress-bar", {
  scaleX: 1,
  ease: "none",
  transformOrigin: "left center",
  scrollTrigger: {
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    scrub: true
  }
});
// CSS: .progress-bar { transform-origin: left; scaleX: 0; position: fixed; top: 0 }


// ---- ANIMATED COUNTER ----
function animateCounter(selector, endValue) {
  const el = document.querySelector(selector);
  const obj = { value: 0 };

  gsap.to(obj, {
    value: endValue,
    duration: 2,
    ease: "power1.out",
    scrollTrigger: {
      trigger: selector,
      start: "top 80%",
      once: true   // only trigger once
    },
    onUpdate: () => {
      el.textContent = Math.round(obj.value).toLocaleString();
    }
  });
}

animateCounter(".users-count", 12500);
animateCounter(".projects-count", 340);


// ---- MAGNETIC BUTTON EFFECT ----
document.querySelectorAll(".magnetic-btn").forEach((btn) => {
  btn.addEventListener("mousemove", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(btn, {
      x: x * 0.3,
      y: y * 0.3,
      duration: 0.3,
      ease: "power2.out",
      overwrite: "auto"
    });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.5)" });
  });
});


// ---- HORIZONTAL SCROLL SECTION ----
const panels = gsap.utils.toArray(".panel");

gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: "none",
  scrollTrigger: {
    trigger: ".horizontal-section",
    pin: true,
    scrub: 1,
    start: "top top",
    end: () => "+=" + document.querySelector(".horizontal-section").offsetWidth
  }
});


// =============================================================================
// more things to come — will update in further notes
// =============================================================================
