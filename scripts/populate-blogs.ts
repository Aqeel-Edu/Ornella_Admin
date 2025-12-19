import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyALwOC0Bk2xUfoTJpGTi-8knQArE1GPdo8",
  authDomain: "ornella-f303f.firebaseapp.com",
  projectId: "ornella-f303f",
  storageBucket: "ornella-f303f.firebasestorage.app",
  messagingSenderId: "659357488733",
  appId: "1:659357488733:web:14daadb13897de75289fb4",
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const blogs = [
  // COLOR THEORY CATEGORY (4 blogs)
  {
    title: "Understanding Color Psychology in Interior Design",
    slug: "understanding-color-psychology-interior-design",
    excerpt: "Discover how colors affect mood, behavior, and perception in your home. Learn to use color psychology to create spaces that support your lifestyle and well-being.",
    content: `
      <h2>The Power of Color</h2>
      <p>Color is one of the most powerful tools in interior design, yet it's often chosen based solely on personal preference. Understanding color psychology helps you create spaces that not only look beautiful but also support your emotional and mental well-being.</p>
      
      <h2>Red: Energy and Passion</h2>
      <p>Red is stimulating and energizing, increasing heart rate and creating excitement. It works well in dining rooms where you want to encourage conversation and appetite. However, use it sparingly in bedrooms or offices where calm focus is needed. In Pakistani homes, red is often associated with celebration and tradition.</p>
      
      <h2>Blue: Calm and Productivity</h2>
      <p>Blue reduces stress, lowers blood pressure, and promotes calmness. It's ideal for bedrooms and bathrooms. Deeper blues work well in offices, enhancing focus and productivity. Light blues create airiness and serenity, perfect for small spaces.</p>
      
      <h2>Yellow: Happiness and Optimism</h2>
      <p>Yellow stimulates mental activity and generates cheerfulness. It's perfect for kitchens and breakfast nooks, creating a welcoming morning atmosphere. However, bright yellow can be overwhelming in large doses—use softer shades or as accents.</p>
      
      <h2>Green: Balance and Renewal</h2>
      <p>Green represents nature and promotes tranquility. It's restful for the eyes and works in nearly any room. Sage green is trendy in Pakistani homes, offering sophistication while remaining calming. Green is particularly good for home offices, balancing productivity with stress reduction.</p>
      
      <h2>Purple: Luxury and Creativity</h2>
      <p>Purple combines red's energy with blue's calm, creating a color associated with luxury and creativity. Deep purples add drama and sophistication, while lavender tones are soothing. Use in bedrooms, creative spaces, or as accent colors.</p>
      
      <h2>Orange: Enthusiasm and Warmth</h2>
      <p>Orange is energetic without red's intensity. It's social and inviting, perfect for living rooms or entertainment areas. Terracotta shades are popular in Pakistani design, adding warmth and earthiness.</p>
      
      <h2>Neutral Colors: Versatility and Calm</h2>
      <p>Whites, beiges, grays, and browns create peaceful backgrounds that let other elements shine. They're timeless, versatile, and make spaces feel larger. Layer different shades of neutrals for depth and interest.</p>
      
      <h2>Cultural Considerations</h2>
      <p>In Pakistani culture, certain colors carry specific meanings. Green represents Islam and prosperity, white symbolizes peace and purity, while gold suggests luxury and celebration. Consider these cultural associations when designing your space.</p>
      
      <h2>Practical Application</h2>
      <p>Choose colors based on room function. Active spaces like kitchens and living rooms can handle energizing colors, while bedrooms and studies benefit from calming hues. Test paint samples in your space before committing—lighting dramatically affects color perception.</p>
      
      <h2>Conclusion</h2>
      <p>Color psychology isn't about rigid rules but understanding how colors make you feel. Use this knowledge as a guide, but ultimately choose colors that resonate with you and support your lifestyle.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1541480601022-2308c0f02487?w=1200&q=80",
    altText: "Color wheel and paint swatches demonstrating color psychology in interior design",
    category: "Color Theory",
    tags: ["color psychology", "interior design", "color selection", "mood design", "home colors", "design principles"],
    publishedDate: Timestamp.fromDate(new Date("2025-01-18")),
    status: "published",
    readTime: 8,
    metaTitle: "Color Psychology in Interior Design - Ornella Blog",
    metaDescription: "Master color psychology for your home. Learn how different colors affect mood and behavior, and create spaces that support well-being in Pakistani homes.",
    keywords: ["color psychology", "interior design colors", "color meanings", "home color selection", "design psychology", "color effects mood"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Creating the Perfect Color Palette for Your Home",
    slug: "creating-perfect-color-palette-home",
    excerpt: "Learn professional techniques for selecting harmonious color schemes. Step-by-step guidance for creating cohesive color palettes that flow throughout your home.",
    content: `
      <h2>The Foundation of Good Design</h2>
      <p>A well-chosen color palette ties your entire home together, creating visual harmony and flow. Whether you prefer bold drama or subtle elegance, understanding color relationships helps you make confident choices.</p>
      
      <h2>Start with Inspiration</h2>
      <p>Find inspiration in items you love—a favorite fabric, artwork, rug, or even a photograph. Extract 3-5 colors from this piece to form your palette foundation. This ensures colors that naturally work together and reflect your taste.</p>
      
      <h2>The 60-30-10 Rule</h2>
      <p>Professional designers use this formula: 60% dominant color (usually walls), 30% secondary color (furniture and curtains), and 10% accent color (decorative items and artwork). This creates balance and prevents any color from overwhelming.</p>
      
      <h2>Monochromatic Schemes</h2>
      <p>Using different shades and tints of one color creates sophisticated, cohesive spaces. A room in various blues—navy curtains, sky blue walls, powder blue cushions—feels harmonious and calming. This approach works beautifully in Pakistani homes.</p>
      
      <h2>Analogous Color Schemes</h2>
      <p>Colors next to each other on the color wheel (like blue, blue-green, and green) create serene, comfortable spaces. These schemes are easy on the eyes and create natural harmony.</p>
      
      <h2>Complementary Colors</h2>
      <p>Opposite colors on the color wheel (like blue and orange) create vibrant, energetic spaces. Use one as the dominant color and the other as an accent to avoid overwhelming the space. This works well in contemporary Pakistani interiors.</p>
      
      <h2>Neutral Base, Bold Accents</h2>
      <p>Start with neutral walls and large furniture, then add color through easily changeable items like cushions, artwork, and accessories. This approach offers flexibility—swap accessories to refresh your space without major investment.</p>
      
      <h2>Consider Natural Light</h2>
      <p>Room orientation affects color appearance. North-facing rooms have cooler light and benefit from warm colors. South-facing rooms with warm light can handle cooler colors. Test your palette in your actual space at different times of day.</p>
      
      <h2>Create Flow Between Rooms</h2>
      <p>Maintain color continuity throughout your home. This doesn't mean every room must match, but carrying one or two colors from room to room creates cohesion. Perhaps your living room's accent color becomes the bedroom's main color.</p>
      
      <h2>Cultural and Personal Expression</h2>
      <p>Pakistani homes often feature rich colors reflecting cultural heritage—jewel tones, earthy terracottas, and vibrant textiles. Balance traditional preferences with modern color theory for spaces that honor both culture and contemporary design.</p>
      
      <h2>Test Before Committing</h2>
      <p>Paint large poster boards with your chosen colors and move them around your space. Live with them for several days, observing how they look in different lighting. This prevents costly mistakes and builds confidence in your choices.</p>
      
      <h2>Conclusion</h2>
      <p>Creating a color palette is part science, part art. Use these guidelines as a framework, but trust your instincts. Your home should reflect your personality while supporting comfort and functionality.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80",
    altText: "Coordinated color palette samples and swatches for home interior design",
    category: "Color Theory",
    tags: ["color palette", "color schemes", "design harmony", "home colors", "color coordination", "interior styling"],
    publishedDate: Timestamp.fromDate(new Date("2025-02-04")),
    status: "published",
    readTime: 9,
    metaTitle: "Create Perfect Color Palette Guide - Ornella Blog",
    metaDescription: "Learn to create harmonious color palettes for your home. Professional techniques including the 60-30-10 rule, color schemes, and coordination tips.",
    keywords: ["color palette home", "color schemes interior design", "color coordination", "harmonious colors", "home color planning", "design color selection"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Using Accent Colors to Transform Your Space",
    slug: "using-accent-colors-transform-space",
    excerpt: "Small pops of color can completely change a room's personality. Master the art of accent colors to add vibrancy, interest, and style to neutral spaces.",
    content: `
      <h2>The Power of Accent Colors</h2>
      <p>Accent colors are the jewelry of interior design—small doses that add personality, interest, and visual excitement. They're the easiest and most affordable way to update your space without major renovation.</p>
      
      <h2>What Are Accent Colors?</h2>
      <p>Accent colors typically represent about 10% of a room's color scheme. They appear in throw pillows, artwork, vases, lamps, or small furniture pieces. These pops of color draw the eye and create focal points in your space.</p>
      
      <h2>Choosing Your Accent Color</h2>
      <p>Select colors that complement your existing palette. For neutral rooms, almost any accent works—bold blues, vibrant yellows, or rich burgundies. If your room already has color, choose an accent that's either complementary (opposite on the color wheel) or analogous (adjacent on the wheel).</p>
      
      <h2>The Rule of Three</h2>
      <p>Repeat your accent color at least three times in a room at different heights. Perhaps emerald green appears in cushions on the sofa, a vase on the coffee table, and artwork on the wall. This creates cohesion and intentional design.</p>
      
      <h2>Seasonal Swaps</h2>
      <p>Change accent colors seasonally to refresh your space. Cool blues and greens for summer, warm oranges and reds for winter. In Pakistan, you might use festive colors during Eid or Independence Day. This keeps your home feeling current without permanent changes.</p>
      
      <h2>Bold vs. Subtle Accents</h2>
      <p>Bright, saturated colors make dramatic statements in neutral spaces. Softer, muted accents add subtle interest without overwhelming. Consider your personality and comfort level with color when choosing accent intensity.</p>
      
      <h2>Accent Walls</h2>
      <p>Painting one wall in a bold color creates instant impact. Choose the wall you want to emphasize—typically the one behind your bed, sofa, or in your entryway. This technique works beautifully in Pakistani homes, adding personality without commitment.</p>
      
      <h2>Metallic Accents</h2>
      <p>Gold, brass, copper, and silver act as neutral accent colors, adding warmth and luxury. In Pakistani design, gold accents particularly resonate, reflecting cultural appreciation for richness and celebration. Mix metals for a contemporary, collected look.</p>
      
      <h2>Patterns as Accents</h2>
      <p>Patterned items—a geometric rug, floral cushions, striped curtains—introduce multiple accent colors in one piece. Ensure at least one color in the pattern coordinates with your existing scheme for cohesion.</p>
      
      <h2>Budget-Friendly Updates</h2>
      <p>Accent colors are perfect for budget decorating. Inexpensive items like cushion covers, picture frames, or flowers provide color without significant investment. This allows experimentation without financial commitment.</p>
      
      <h2>Cultural Expression</h2>
      <p>Use accent colors to celebrate Pakistani heritage. Vibrant truck art-inspired cushions, traditional textile patterns, or Islamic geometric designs in bold colors add cultural pride and personal meaning to your space.</p>
      
      <h2>Conclusion</h2>
      <p>Accent colors are your design playground—experiment, play, and don't be afraid to try bold choices. They're easily changeable, making them the perfect way to express your evolving style and keep your home feeling fresh.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=1200&q=80",
    altText: "Living room with neutral base and vibrant accent colors in pillows and décor",
    category: "Color Theory",
    tags: ["accent colors", "color pops", "interior styling", "home décor", "color design", "room refresh"],
    publishedDate: Timestamp.fromDate(new Date("2025-02-13")),
    status: "published",
    readTime: 8,
    metaTitle: "Using Accent Colors in Interior Design - Ornella",
    metaDescription: "Transform your space with strategic accent colors. Learn placement techniques, color selection, and budget-friendly ways to add personality to your home.",
    keywords: ["accent colors interior design", "color pops home", "accent wall ideas", "home color accents", "decorating with color", "interior color tips"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    title: "Neutral Color Palettes: Creating Depth in Minimalist Spaces",
    slug: "neutral-color-palettes-creating-depth-minimalist-spaces",
    excerpt: "Neutral doesn't mean boring. Learn how to layer textures, tones, and materials to create rich, sophisticated spaces using neutral color palettes.",
    content: `
      <h2>The Sophistication of Neutrals</h2>
      <p>Neutral color palettes have dominated interior design for good reason—they're timeless, versatile, calming, and create the perfect backdrop for life. However, creating depth in neutral spaces requires understanding subtle color variations and layering techniques.</p>
      
      <h2>Understanding Neutral Undertones</h2>
      <p>Neutrals aren't simply beige or gray—they have warm or cool undertones. Beiges might lean pink, yellow, or green. Grays can be warm (with brown undertones) or cool (with blue undertones). Understanding these subtleties prevents clashing neutrals.</p>
      
      <h2>The Power of White</h2>
      <p>White isn't just one color—there are hundreds of white shades. Some lean warm (cream, ivory), others cool (stark white, blue-white). In Pakistan's bright sunlight, cooler whites prevent yellowing appearance, while warmer whites create coziness.</p>
      
      <h2>Layering Shades</h2>
      <p>Create depth by using multiple shades of the same neutral. A room might feature cream walls, taupe sofa, chocolate brown cushions, and ivory curtains. This tonal layering creates sophisticated dimension without introducing color.</p>
      
      <h2>Texture is Essential</h2>
      <p>In neutral spaces, texture becomes crucial for visual interest. Combine smooth (glass, polished metal), rough (jute, rattan), soft (velvet, chenille), and hard (wood, concrete) textures. This variation prevents neutral spaces from feeling flat or boring.</p>
      
      <h2>Natural Materials</h2>
      <p>Wood, stone, linen, wool, and leather introduce organic warmth to neutral palettes. These materials bring subtle color variations and textures that feel authentic and timeless. They're particularly effective in Pakistani homes where natural materials connect to cultural traditions.</p>
      
      <h2>The Importance of Lighting</h2>
      <p>Lighting dramatically affects neutrals. Layer ambient, task, and accent lighting to create depth and shadow. Warm LED bulbs (2700K-3000K) enhance neutral palettes, while cooler lights can make spaces feel stark.</p>
      
      <h2>Adding Visual Interest</h2>
      <p>Without color, create interest through pattern, scale variation, and architectural details. Mix large-scale patterns with small, combine different shapes, and highlight architectural features like moldings or exposed brick.</p>
      
      <h2>The 60-30-10 Rule with Neutrals</h2>
      <p>Apply this rule using different neutral shades: 60% light neutrals (walls), 30% medium neutrals (furniture), 10% dark neutrals (accents). This creates balance and prevents monotony.</p>
      
      <h2>Strategic Color Introduction</h2>
      <p>Neutral palettes provide the perfect backdrop for occasional color pops. A single piece of artwork, fresh flowers, or colorful books become focal points in neutral spaces. This flexibility is why neutrals remain popular.</p>
      
      <h2>Cultural Adaptation</h2>
      <p>Pakistani homes can embrace neutrals while honoring cultural aesthetics. Incorporate traditional crafts in neutral tones—cream-colored embroidery, natural wood carvings, or sand-colored pottery. This balances modern minimalism with cultural identity.</p>
      
      <h2>Maintenance and Practicality</h2>
      <p>Lighter neutrals show dirt more easily—important in Pakistan's dusty climate. Consider mid-tone neutrals (greige, taupe) for high-traffic areas. Darker neutrals hide stains but can make small spaces feel smaller.</p>
      
      <h2>Conclusion</h2>
      <p>Neutral color palettes offer sophistication, versatility, and timelessness. By understanding undertones, layering textures, and varying shades, you create rich, interesting spaces that feel anything but boring. Neutral is never neutral when done thoughtfully.</p>
    `,
    imageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    altText: "Sophisticated minimalist interior with layered neutral tones and varied textures",
    category: "Color Theory",
    tags: ["neutral colors", "minimalist design", "color layering", "texture design", "sophisticated interiors", "timeless design"],
    publishedDate: Timestamp.fromDate(new Date("2025-02-24")),
    status: "published",
    readTime: 9,
    metaTitle: "Neutral Color Palettes & Depth Guide - Ornella Blog",
    metaDescription: "Create sophisticated spaces with neutral colors. Learn about undertones, texture layering, and creating depth in minimalist Pakistani homes.",
    keywords: ["neutral color palette", "minimalist interior design", "neutral tones home", "texture layering", "sophisticated neutrals", "timeless home design"],
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
]

async function populateBlogs() {
  console.log("🚀 Starting blog population for Color Theory category...")

  try {
    for (const blog of blogs) {
      const docRef = await addDoc(collection(db, "blogs"), blog)
      console.log(`✅ Added blog: "${blog.title}" with ID: ${docRef.id}`)
    }

    console.log("\n🎉 Successfully populated all Color Theory blogs!")
    console.log(`📊 Total blogs added: ${blogs.length}`)
  } catch (error) {
    console.error("❌ Error populating blogs:", error)
  }
}

populateBlogs()
