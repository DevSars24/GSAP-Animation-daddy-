/*
=============================================================================
  GSAP (GreenSock Animation Platform) - Flow Notes
  Author  : Ayush Chaudhari
  Topic   : GSAP Core Concepts
  Status  : In Progress — more notes coming as I go deeper
=============================================================================
*/


// =============================================================================
// 1. WHAT IS GSAP?
// =============================================================================

/*
  GSAP is a JavaScript animation library used to create high-performance
  animations for web applications.

  It can animate:
    - DOM elements
    - CSS properties
    - SVG graphics
    - Scroll-based interactions (via ScrollTrigger plugin)

  Why GSAP over CSS animations?
    - Smooth performance (uses requestAnimationFrame internally)
    - Powerful timeline control — sequence without manual delays
    - ScrollTrigger plugin for scroll-based animations
    - Works consistently across all browsers
    - Can animate any numeric property, not just CSS
*/


// =============================================================================
// 2. CORE ANIMATION IDEA
// =============================================================================

/*
  Animation = Changing property values over time.

  GSAP modifies:
    - position     ->  x, y
    - scale        ->  scale, scaleX, scaleY
    - rotation     ->  rotation, rotationX, rotationY
    - opacity      ->  0 to 1
    - colors       ->  backgroundColor, color
    - transforms   ->  skewX, skewY

  IMPORTANT RULE:
    Always animate using transforms (x, y, scale, rotation, opacity).
    Avoid layout properties like top, left, width, height.
    Reason: transforms run on the GPU — no layout recalculation, no jank.
*/


// =============================================================================
// 3. THREE CORE METHODS
// =============================================================================

// gsap.to() — animate FROM current state TO the values you define
gsap.to(".box", {
  x: 200,
  opacity: 0.5,
  scale: 1.2,
  duration: 1,
  ease: "power2.out"
});

// gsap.from() — animate FROM the values you define TO current state
// great for entrance animations
gsap.from(".heading", {
  y: -50,
  opacity: 0,
  duration: 1,
  ease: "power3.out"
});

// gsap.fromTo() — you define BOTH start and end explicitly
gsap.fromTo(".box",
  { x: -100, opacity: 0 },   // from (start state)
  { x: 100,  opacity: 1, duration: 1 }  // to (end state)
);

// gsap.set() — set values instantly, no animation
gsap.set(".box", { opacity: 0, y: 30 });


// =============================================================================
// 4. BASIC CONCEPTS
// =============================================================================

/*
  A. TARGET
     The element you want to animate.
     Can be a CSS selector, class, id, or JS reference.

       gsap.to(".box", { ... })
       gsap.to("#hero", { ... })
       gsap.to(myElement, { ... })

  B. PROPERTIES
     What you want to change — x, y, opacity, scale, rotation, etc.

  C. DURATION
     How long the animation runs — in seconds.
     Default is 0.5 if not specified.

  D. DELAY
     How long to wait before the animation starts — in seconds.

  E. EASE
     Defines the motion style — how it accelerates or decelerates.
     This is what makes animations feel natural, not robotic.

  F. REPEAT
     How many times to repeat. -1 means infinite loop.

  G. YOYO
     If true, animation plays forward then reverses back on repeat.
*/

// Example using all of the above
gsap.to(".card", {
  x: 300,
  opacity: 0,
  duration: 1.2,
  delay: 0.5,
  ease: "power2.inOut",
  repeat: -1,
  yoyo: true
});


// =============================================================================
// 5. EASING TYPES
// =============================================================================

/*
  Easing controls HOW the animation moves through time.
  Same animation, completely different feeling.

  Linear        ->  constant speed, feels robotic
  power2.in     ->  starts slow, ends fast  (accelerating)
  power2.out    ->  starts fast, ends slow  (decelerating — most natural)
  power2.inOut  ->  slow at both ends       (smooth, cinematic)
  bounce.out    ->  bounces at the end      (physical, weighty)
  elastic.out   ->  overshoots then settles (spring-like)
  expo.out      ->  very sharp deceleration (high-end UI feel)
  back.out      ->  slight overshoot        (satisfying pop)

  Rule: .out eases work best for entrances — natural deceleration.
        .in eases work best for exits — natural acceleration.

  Visualize all eases: https://gsap.com/docs/v3/Eases/
*/

gsap.from(".card",  { y: 40, opacity: 0, ease: "power2.out"   });  // natural
gsap.from(".icon",  { scale: 0, opacity: 0, ease: "back.out(1.7)" });  // pop
gsap.from(".title", { y: 60, opacity: 0, ease: "expo.out"     });  // dramatic


// =============================================================================
// 6. TIMELINE  (most important concept)
// =============================================================================

/*
  Timeline = Animation sequence controller.
  Ek ke baad ek animations chalane ka system — without manual delays.

  Why use Timeline:
    - No need for manual delays (delay stacking is fragile)
    - Controls order of animations cleanly
    - Allows overlapping with the position parameter
    - Can pause, reverse, restart, seek at any point
    - Change one duration — everything else adjusts automatically
*/

// without Timeline — messy, fragile
gsap.from(".nav",   { opacity: 0, duration: 0.6 });
gsap.from(".hero",  { opacity: 0, duration: 0.6, delay: 0.5 });   // breaks if .nav changes
gsap.from(".cards", { opacity: 0, duration: 0.6, delay: 1 });     // breaks if anything above changes

// with Timeline — clean, maintainable
const tl = gsap.timeline({
  defaults: { duration: 0.8, ease: "power2.out" }  // shared defaults for all children
});

tl.from(".nav",   { y: -30, opacity: 0 })
  .from(".hero",  { y: 20,  opacity: 0 }, "-=0.2")  // starts 0.2s before previous ends
  .from(".cards", { y: 20,  opacity: 0 }, "-=0.2");

/*
  Position Parameter — controls WHEN each animation starts:

    default      ->  starts after previous ends (sequential)
    "-=0.3"      ->  starts 0.3s BEFORE previous ends (overlap)
    "+=0.3"      ->  starts 0.3s AFTER previous ends (gap)
    "<"          ->  starts at SAME TIME as previous (sync)
    "<0.2"       ->  starts 0.2s after the START of previous
    2            ->  starts at exactly 2 seconds into timeline
*/

// Playback controls
tl.play();
tl.pause();
tl.reverse();
tl.restart();
tl.seek(1.5);       // jump to 1.5s mark
tl.progress(0.5);   // jump to 50% of timeline
tl.timeScale(2);    // play at 2x speed
tl.kill();          // destroy and clean up


// =============================================================================
// 7. STAGGER
// =============================================================================

/*
  Used when animating multiple elements.
  Instead of all animating at the same time,
  they go one after another with a time gap.

  Used in:
    - Card / grid reveals
    - Navbar items
    - Text word or letter animations
    - Image galleries
    - List item entrances
*/

// basic stagger
gsap.from(".card", {
  y: 40,
  opacity: 0,
  duration: 0.6,
  ease: "power2.out",
  stagger: 0.15   // 0.15s gap between each element
});

// stagger as a config object — more control
gsap.from(".item", {
  y: 30,
  opacity: 0,
  duration: 0.6,
  stagger: {
    amount: 0.8,       // total time spread across ALL elements
    from: "center",    // start from center, not the first element
    ease: "power1.inOut"
  }
});


// =============================================================================
// 8. SCROLLTRIGGER
// =============================================================================

/*
  ScrollTrigger connects animations with scroll position.
  Most modern portfolio websites use this.

  Features:
    - Trigger animation when element enters the viewport
    - Pin sections in place during scroll
    - Scrub — animation tied directly to scroll movement
    - Parallax effects
    - Scroll storytelling

  Always register the plugin before using it.
*/

gsap.registerPlugin(ScrollTrigger);

// basic ScrollTrigger
gsap.from(".section", {
  scrollTrigger: {
    trigger: ".section",              // element that triggers the animation
    start: "top 80%",                 // [trigger edge] [viewport edge]
    end: "top 30%",
    toggleActions: "play none none reverse",
    // toggleActions: onEnter onLeave onEnterBack onLeaveBack
    // options: "play" "pause" "resume" "reverse" "restart" "reset" "none"
    markers: true                     // shows debug lines — REMOVE before deploying
  },
  y: 60,
  opacity: 0,
  duration: 0.8,
  ease: "power2.out"
});

// scrub — animation tied to scroll position directly
gsap.from(".hero-text", {
  scrollTrigger: {
    trigger: ".hero",
    start: "top top",
    end: "bottom top",
    scrub: 1    // animation lags 1 second behind scroll — feels smooth
  },
  y: 100,
  opacity: 0
});

// pin — sticks element in place while scrolling past it
gsap.to(".panel", {
  scrollTrigger: {
    trigger: ".panel",
    start: "top top",
    end: "+=500",     // pin for 500px of scroll distance
    pin: true,
    scrub: true
  },
  x: -300
});


// =============================================================================
// 9. PERFORMANCE RULES
// =============================================================================

/*
  USE (GPU composited — no layout recalculation):
    x, y, scaleX, scaleY, rotation, skewX, skewY, opacity

  AVOID (causes layout recalculation every frame — slow):
    width, height, top, left, right, bottom, margin, padding

  Other rules:
    - Plan animation flow before writing code
    - Keep animations subtle — less is more
    - Avoid too many bounce or elastic effects
    - Always remove markers: true before deploying
    - Use Timeline instead of stacking delays
    - Use gsap.set() for initial states instead of CSS
*/


// =============================================================================
// more things to come — will update in further notes
// =============================================================================
