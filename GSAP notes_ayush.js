# GSAP (GreenSock Animation Platform) - flow

Author: Ayush  Chaudhari

// 1. WHAT IS GSAP?

GSAP is a JavaScript animation library used to create high-performance
animations for web applications.

It animates:
- DOM elements
- CSS properties
- SVG graphics
- Scroll-based interactions

Wtf we use GSAP?
- Smooth performance (uses requestAnimationFrame)
- Powerful timeline control
- ScrollTrigger plugin
- Works consistently across browsers


// 2. CORE ANIMATION IDEA


Animation = Change property values over time.
GSAP modifies:
- position (x, y)
- scale
- rotation
- opacity
- colors
- size
- transforms

Important:
Always animate using transforms (x, y, scale, rotate)
Avoid layout properties like top/left for performance.



// 3. BASIC CONCEPTS


A. Target
   The element you want to animate.

B. Properties
   What you want to change (x, opacity, scale, etc.)

C. Duration
   How long animation runs.

D. Delay
   When animation starts.

E. Ease
   Defines motion style (linear, bounce, elastic, etc.)


// 4. EASING TYPES


Linear        → constant speed
Ease In       → starts slow
Ease Out      → ends slow
Ease In-Out   → smooth both sides
Bounce        → playful
Elastic       → spring-like
Power         → natural motion

Good animations feel natural, not robotic.



// 5. TIMELINE (MOST IMPORTANT)


Timeline = Animation sequence controller.( changes ko bhi bolte hai);

Why use timeline://(most imp)
- No need for manual delays
- Controls order of animations
- Allows overlapping animations
- Can pause, reverse, restart

// 6. STAGGER

Used when animating multiple elements.

Instead of all elements animating together,
they animate one after another.

Used in:
- Card reveals
- Text animations
- Image galleries
- Navbar items


// 7. SCROLLTRIGGER 


ScrollTrigger connects animations with scroll position.

Features:
- Start animation when element enters viewport
- Pin sections during scroll
- Scrub (animation tied to scroll movement)
- Parallax effects
- Scroll storytelling

Most modern portfolio websites use ScrollTrigger.



// 8. PERFORMANCE RULES


 Use transform and opacity
 Avoid animating width/height repeatedly
 Plan animation flow before writing code
 Keep animations subtle
 Avoid too many bounce effects
// more things to came will se in furthur notes



