

# Design Specification for Tim Robinson AI Consulting Website

## 1. Overall Aesthetic

The website will have a **modern, professional, and tech-forward aesthetic**. It will be clean, uncluttered, and easy to navigate, while incorporating dynamic elements to create a memorable and engaging user experience. The design will balance a sense of technological sophistication with the trustworthiness and approachability required for a consulting service targeting SMBs. The overall impression should be one of credibility, expertise, and innovation.



## 2. Color Palette

The color palette is designed to be modern, professional, and visually striking, drawing inspiration from the best practices in AI and tech website design.

| Role | Color | Hex Code | Notes |
| :--- | :--- | :--- | :--- |
| **Primary/Background** | Deep Navy Blue | `#0A192F` | Creates a sophisticated, focused atmosphere. A subtle gradient to a slightly lighter navy can add depth. |
| **Accent 1 (CTA & Links)** | Bright Cyan/Teal | `#64FFDA` | Used for primary call-to-action buttons, links, and key highlights to maximize visibility and user action. |
| **Accent 2 (Highlights)** | Bright Violet | `#8A2BE2` | For secondary highlights, icons, or graphical elements to complement the primary accent color. |
| **Text (Headings)** | Bright White | `#E6F1FF` | Ensures high contrast and readability for main titles and headlines. |
| **Text (Body)** | Light Slate Grey | `#CCD6F6` | A softer, off-white for body text to reduce eye strain during longer reading. |
| **UI Elements (Borders)** | Light Navy | `#1E2A47` | For borders on cards, forms, and other UI elements to create subtle separation. |



## 3. Typography

Typography will be clean, modern, and highly readable, creating a clear visual hierarchy.

| Element | Font Family | Weight | Style |
| :--- | :--- | :--- | :--- |
| **Headings (H1, H2, H3)** | Poppins | 600 (Semi-Bold) | Normal |
| **Body Text** | Inter | 400 (Regular) | Normal |
| **CTA / Button Text** | Poppins | 500 (Medium) | Normal |

- **Poppins** is chosen for headings due to its modern, geometric, and friendly appearance, which is great for making a strong first impression.
- **Inter** is selected for body text because of its excellent readability at smaller sizes, making it ideal for longer paragraphs of text.



## 4. Interactive Elements

Interactive elements will be used to create a dynamic and engaging user experience, reinforcing the tech-forward brand identity.

### a. Dynamic Background

- **Description:** A subtle, interactive particle network animation will be used as the background for the hero section of the homepage. The particles will be connected by faint lines, and the network will subtly shift and react to the user's mouse movement, creating a sense of depth and interactivity.
- **Inspiration:** This is directly inspired by the ClosedBy.ai website and the best practices seen in modern AI/tech websites.
- **Implementation:** This can be achieved using a JavaScript library such as `particles.js` or `tsParticles`, configured to be subtle and not distracting.

### b. On-Scroll Animations

- **Description:** As the user scrolls down the page, key elements will animate into view. This will be used to draw attention to important information and create a more dynamic and engaging narrative flow.
- **Examples:**
    - **Fade-in/Up:** Service descriptions, case study cards, and text blocks will gently fade in and slide up as they enter the viewport.
    - **Number Counters:** Key statistics (e.g., "20+ years of experience," ROI percentages in case studies) will animate from 0 to the final number.
    - **Graphic Reveals:** The "Funnel Transformation"-style graphic will animate in sequence to illustrate the value proposition.
- **Implementation:** A library like **AOS (Animate On Scroll)** or **ScrollReveal.js** will be used for easy and efficient implementation.

### c. Microinteractions

- **Description:** Small, subtle animations on interactive elements like buttons and links will provide visual feedback to the user.
- **Examples:**
    - **Button Hover:** CTA buttons will have a subtle glow or a slight upward shift on hover to indicate interactivity.
    - **Link Hover:** Links will have a smooth underline animation or a slight color change on hover.
    - **Icon Animations:** Icons in the "How I Help" section may have a subtle animation on hover to add a layer of polish.



## 5. Layout and Composition

- **Grid System:** A standard 12-column grid will be used to ensure a well-organized and responsive layout across all devices.
- **Spacing:** Generous white space will be used to create a clean, uncluttered look and improve readability.
- **Visual Hierarchy:** A clear visual hierarchy will be established using typography, color, and size to guide the user's attention to the most important information.
- **Card-Based Design:** Case studies, blog posts, and service descriptions will be presented in a card-based layout, which is modern, easy to scan, and works well on mobile devices.



## 6. AI Chatbot UI

- **Launcher Icon:** A clean, modern chat icon will be fixed to the bottom-right corner of the screen, using the primary accent color (`#64FFDA`) to be easily noticeable.
- **Chat Window:** The chat window will have a clean, minimalist design, consistent with the overall website aesthetic. It will use the dark navy background and light-colored text for readability.
- **Branding:** The chatbot will be branded with a small logo and a name (e.g., "Tim's AI Assistant") to give it a distinct personality.
- **Interactive Elements:** The chat interface will support rich media, including buttons and embedded widgets (for Calendly), to create a seamless and interactive user experience.

