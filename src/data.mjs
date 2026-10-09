// All site content lives here. tools/build.mjs turns it into the pages.
// Rule: nothing goes in this file that the businesses have not said themselves.
// See NOTES.md for what was left out and why.

export const site = {
  name: 'North Shore Projects',
  url: 'https://northshoreprojects.com.au',
  email: 'northshoreprojects@gmail.com',
  // Shared line for tiling, painting and cleaning. Removals has its own.
  phone: '0433 333 332',
  phoneHref: '+61433333332',
  leadWebhook: 'https://droam8.app.n8n.cloud/webhook/lead-submission',
};

// Google ratings and review counts are copied from each business's own Google listing
// (matched by phone number and address). They go stale: re-check and update the date.
// A listing with no reviews gets `google.count: 0` and nothing is shown for it.
export const reviewsCheckedOn = '9 October 2026';
const gmaps = (name, placeId) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Chatswood NSW')}&query_place_id=${placeId}`;

export const services = [
  {
    id: 'tiling',
    name: 'Tiling',
    fullName: 'Tiling and waterproofing',
    business: 'North Shore Tiling',
    // On the home hero the panel reads "Tiling" while it waits and "Tiling and waterproofing" when open.
    panelMore: ' and waterproofing',
    summary: 'Bathrooms, kitchens, floors and outdoor areas',
    lead: 'North Shore Tiling does tiling and waterproofing for bathrooms, kitchens, laundries, living areas and outdoor spaces. Wet areas are waterproofed before any tile goes down.',
    photo: 'croydon-vanity-evening',
    photoNote: '',
    offers: [
      ['Waterproofing', 'Membranes for bathrooms, laundries and showers.'],
      ['Bathroom tiling', 'Walls, floors and shower recesses.'],
      ['Kitchen splashbacks', 'Behind benches, sinks and cooktops.'],
      ['Floor tiling', 'Living areas, hallways and entries.'],
      ['Outdoor and pool areas', 'Patios, pool surrounds and alfresco areas.'],
    ],
    phone: '0433 333 332',
    phoneHref: '+61433333332',
    email: 'northshoretiling8@gmail.com',
    website: 'northshoretiles.com.au',
    websiteHref: 'https://northshoretiles.com.au',
    instagram: 'northshoretiling',
    formspree: 'https://formspree.io/f/xojkgngr',
    google: { rating: '5.0', count: 13, url: gmaps('North Shore Tiling', 'ChIJ_fHtd_l782ERJdWryIB9yMQ') },
    // Word for word from the Google listing. Excerpts, never edited.
    reviews: [
      'Angus and the team from North Shore Tiling were beyond professional, reliable, and easy to deal with from start to finish. They recently completed our bathroom renovation and the quality of the tiling exceeded our expectations.',
      'They turned up on time, gave a clear quote with no surprises, and finished the kitchen splashback ahead of schedule.',
      'We\u2019ve used a few tilers over the years and these guys are easily the best. Fair pricing, excellent communication, and the attention to detail on our floor tiling was next level.',
      'They provided excellent advice, completed our bathroom & kitchen on time, and left the area spotless.',
    ],
    gallery: ['croydon-vanity-mirror', 'croydon-full-view', 'marble-5', 'croydon-basin', 'ashfield-bathroom', 'croydon-shower', 'ashfield-kitchen', 'marble-2', 'croydon-bathroom'],
    clips: true,
    title: 'Tiling and waterproofing, North Shore Sydney | North Shore Projects',
    description: 'Bathroom, kitchen, floor and outdoor tiling with waterproofing, from the North Shore Tiling team. See recent work and ask for a free quote.',
  },
  {
    id: 'painting',
    name: 'Painting',
    fullName: 'Painting',
    business: 'North Shore Painting',
    summary: 'Interiors, exteriors, cabinets and commercial',
    lead: 'North Shore Painting does interior and exterior painting for homes, offices and strata buildings.',
    photo: 'paint-living',
    photoNote: '',
    offers: [
      ['Interior painting', 'Walls, ceilings, trim and doors.'],
      ['Exterior painting', 'Facades, eaves and trim.'],
      ['Feature walls', 'Accent walls and decorative finishes.'],
      ['Cabinet repainting', 'Kitchen and bathroom cabinets, sprayed.'],
      ['Commercial painting', 'Offices, shops and strata common areas.'],
      ['Colour advice', 'Help choosing colours before work starts.'],
    ],
    phone: '0433 333 332',
    phoneHref: '+61433333332',
    email: 'northshorepainting@gmail.com',
    website: 'northshorepaints.com.au',
    websiteHref: 'https://northshorepaints.com.au',
    instagram: 'north.shore.painting',
    formspree: 'https://formspree.io/f/xpqyvyae',
    google: { rating: null, count: 0, url: gmaps('North Shore Painting', 'ChIJ4X7tNv6pEmsR4WndTn4mLso') },
    reviews: [],
    gallery: ['paint-open-plan', 'paint-lounge', 'paint-kitchen', 'paint-bedroom', 'paint-living'],
    clips: false,
    title: 'House painters, North Shore Sydney | North Shore Projects',
    description: 'Interior and exterior painting, cabinet repainting and commercial work from the North Shore Painting team. Ask for a free quote.',
  },
  {
    id: 'cleaning',
    name: 'Cleaning',
    fullName: 'Cleaning',
    business: 'North Shore Cleaning',
    summary: 'House, end of lease, office, carpet and windows',
    lead: 'North Shore Cleaning does regular and one-off cleaning for homes, rentals and workplaces.',
    photo: 'ashfield-sink',
    photoNote: 'stand-in',
    offers: [
      ['House cleaning', 'Regular or one-off, every room.'],
      ['End of lease cleaning', 'For the final inspection when you move out.'],
      ['Office cleaning', 'Offices, shops and strata common areas.'],
      ['Carpet cleaning', 'Steam cleaning and stain removal.'],
      ['Window cleaning', 'Inside and out.'],
      ['Spring cleaning', 'Inside cupboards and behind appliances.'],
    ],
    phone: '0433 333 332',
    phoneHref: '+61433333332',
    email: 'northshorecleans@gmail.com',
    website: 'northshorecleans.com.au',
    websiteHref: 'https://northshorecleans.com.au',
    instagram: 'northshorecleans',
    formspree: 'https://formspree.io/f/xreynygg',
    google: { rating: '5.0', count: 4, url: gmaps('North Shore Cleaning', 'ChIJUwptZAqpEmsRo9xIz5PL8xY') },
    reviews: [
      'North Shore Cleaning were fantastic, they did my end of lease clean with ease and no issues at all! Definitely recommend!!',
      'The team showed up on time, were friendly and professional, and did an amazing job\u2014my home has never looked this clean!',
      'The team arrived on time, fully equipped, and worked efficiently to make my apartment look spotless.',
    ],
    gallery: [],
    clips: false,
    title: 'House and office cleaning, North Shore Sydney | North Shore Projects',
    description: 'House, end of lease, office, carpet and window cleaning from the North Shore Cleaning team. Ask for a free quote.',
  },
  {
    id: 'removals',
    name: 'Removals',
    fullName: 'Removals',
    business: 'North Shore Removals',
    summary: 'Homes, apartments, offices and single items',
    lead: 'North Shore Removals does house, apartment and office moves, and single items when that is all you need shifted.',
    photo: 'ashfield-living',
    photoNote: 'stand-in',
    offers: [
      ['House and apartment moves', 'Furniture and boxes, loaded, moved and placed.'],
      ['Office relocations', 'Desks, files and IT equipment.'],
      ['Furniture delivery', 'One piece or a full load, from a shop or between addresses.'],
      ['Packing', 'Boxes, wrapping and labelling.'],
      ['Pianos and heavy items', 'Pianos, safes and pool tables.'],
      ['Local and interstate', 'Across the North Shore, and further when you need it.'],
    ],
    phone: '0451 488 266',
    phoneHref: '+61451488266',
    email: 'northshoreremovals1@gmail.com',
    website: 'northshoreremovals.com',
    websiteHref: 'https://northshoreremovals.com',
    instagram: 'northshoreremovals',
    formspree: 'https://formspree.io/f/mojkgkpn',
    google: { rating: '5.0', count: 239, url: gmaps('North Shore Removals', 'ChIJi1nQ_MCeZ6URGVbmK9L98_A') },
    reviews: [
      'They were very careful, efficient and helpful. We did a 2-bedroom move from Cremorne to Lane Cove in under 4 hours.',
      'They were incredibly careful with all of our furniture and handled everything with great attention and respect.',
      'Communication was excellent throughout, which made a stressful move feel surprisingly easy.',
      'On the day of our move they were punctual, friendly & polite (including to our family & friends who were helping us out), professional and very efficient.',
    ],
    gallery: [],
    clips: false,
    title: 'Removalists, North Shore Sydney | North Shore Projects',
    description: 'House, apartment and office moves, furniture delivery and packing from the North Shore Removals team. Ask for a free quote.',
  },
];

// Alt text describes what is in the frame. It never names a client.
export const photos = {
  'croydon-vanity-evening': 'Backlit oval mirror glowing over a walnut vanity with a stone basin and brushed gold tap',
  'croydon-vanity-mirror': 'Floating walnut vanity with a stone top and backlit oval mirror on porcelain wall tiles',
  'croydon-basin': 'Round stone basin with a wall-mounted brushed gold mixer under a backlit mirror',
  'croydon-walnut-vanity': 'Bathroom with a fluted walnut vanity, a backlit mirror and a brushed gold towel rail',
  'croydon-bathroom': 'Bathroom with large porcelain tiles, a freestanding bath and a walk-in shower',
  'croydon-bath': 'Floating walnut vanity and backlit oval mirror, seen from the doorway',
  'croydon-shower': 'Walk-in shower with a brushed gold rain shower and tiled corner shelves',
  'croydon-full-view': 'Freestanding bath with a brushed gold filler beside a frameless glass shower',
  'marble-1': 'Shower with marble wall tiles, a tiled niche and black fixtures',
  'marble-2': 'Marble-tiled bathroom with a timber vanity and oval mirror',
  'marble-3': 'Marble-tiled bathroom with a timber vanity under the window',
  'marble-4': 'Timber vanity and oval mirror against marble wall tiles',
  'marble-5': 'Marble-tiled shower with black fixtures behind a frameless glass screen',
  'ashfield-bathroom': 'Bathroom with marble wall tiles, a black rain shower and a glass screen',
  'ashfield-shower': 'Two black shower heads on a marble-tiled wall beside a timber-framed window',
  'ashfield-wall': 'Marble-tiled bathroom wall with a black towel rail and white vanity',
  'ashfield-corner': 'Corner where two marble-tiled walls meet beside a window',
  'ashfield-vanity': 'Timber mirror cabinet above a white basin on marble wall tiles',
  'ashfield-kitchen': 'L-shaped kitchen with a white tiled splashback and tiled floor',
  'ashfield-splashback': 'Kitchen with white splashback tiles and beige floor tiles',
  'ashfield-sink': 'Stainless steel kitchen sink and tap under a window',
  'ashfield-bedroom': 'Empty bedroom with white walls and a timber-look floor',
  'ashfield-living': 'Empty living room with a timber-look floor and glazed timber doors',
  'ashfield-living-wide': 'Wide view of an empty living room with a timber-look floor',
  'paint-open-plan': 'Open-plan living room with white walls and ceiling, opening to a deck',
  'paint-living': 'Living room with white walls and ceiling, a timber feature wall and doors to the garden',
  'paint-lounge': 'Lounge with white walls under a raked ceiling and a large painting above the sofa',
  'paint-kitchen': 'Kitchen and dining area with white walls and a timber island bench',
  'paint-bedroom': 'Bedroom with white walls, a raked ceiling and doors to a balcony',
};

export const projects = [
  {
    id: 'croydon-park',
    title: 'Bathroom, Croydon Park',
    service: 'tiling',
    text: 'Large porcelain tiles on the walls and floor, a walk-in shower, a freestanding bath and brushed gold tapware.',
    photos: ['croydon-vanity-evening', 'croydon-bathroom', 'croydon-shower', 'croydon-vanity-mirror', 'croydon-full-view', 'croydon-basin', 'croydon-walnut-vanity', 'croydon-bath'],
  },
  {
    id: 'ashfield',
    title: 'Bathroom, kitchen and floors, Ashfield',
    service: 'tiling',
    text: 'Marble wall tiles in the bathroom, a tiled splashback and floor in the kitchen, and new floors through the living areas.',
    photos: ['ashfield-bathroom', 'ashfield-shower', 'ashfield-kitchen', 'ashfield-vanity', 'ashfield-wall', 'ashfield-splashback', 'ashfield-living', 'ashfield-corner', 'ashfield-bedroom'],
  },
  {
    id: 'marble-bathroom',
    title: 'Marble bathroom',
    service: 'tiling',
    text: 'Marble tiles on the walls, a walk-in shower with black fixtures and a timber vanity.',
    photos: ['marble-5', 'marble-2', 'marble-1', 'marble-4', 'marble-3'],
  },
  {
    id: 'interior-repaint',
    title: 'Interior repaint',
    service: 'painting',
    text: 'Walls, ceilings and trim through the living areas, kitchen and bedroom.',
    photos: ['paint-open-plan', 'paint-lounge', 'paint-kitchen', 'paint-living', 'paint-bedroom'],
  },
];

// The slideshow on the home page: [photo, project id]
export const homeSlides = [
  ['croydon-vanity-mirror', 'croydon-park'],
  ['marble-5', 'marble-bathroom'],
  ['paint-open-plan', 'interior-repaint'],
  ['croydon-full-view', 'croydon-park'],
  ['ashfield-bathroom', 'ashfield'],
  ['paint-lounge', 'interior-repaint'],
  ['croydon-shower', 'croydon-park'],
  ['ashfield-kitchen', 'ashfield'],
  ['paint-kitchen', 'interior-repaint'],
  ['croydon-bathroom', 'croydon-park'],
];

// Phone clips from the tiling team's Instagram stories. Always muted.
export const clips = [
  { id: 'ashfield-clip', label: 'Ashfield bathroom, finished' },
  { id: 'marble-clip-1', label: 'Shower floor and glass screen' },
  { id: 'marble-clip-2', label: 'Floor tiles laid to a centre drain' },
  { id: 'marble-clip-4', label: 'Large floor and wall tiles in a shower' },
];

export const suburbs = [
  'Artarmon', 'Chatswood', 'Cremorne', 'Crows Nest', 'Gordon', 'Killara', 'Lane Cove', 'Lindfield', 'Mosman',
  'Neutral Bay', 'North Sydney', 'Pymble', 'Roseville', 'St Ives', 'Turramurra', 'Wahroonga', 'Willoughby',
];

// A real sequence, so it is numbered on the page. Tiling, painting and cleaning share one;
// removals works on an hourly rate with a time estimate, so it has its own.
export const steps = [
  ['Get in touch', 'Tell us what the job is, by phone or with the form.'],
  ['Visit and quote', 'We look at the job and give you a written quote. Quotes are free.'],
  ['The work', 'We book the dates with you, then do the job.'],
  ['Walkthrough', 'We go through the finished job with you before we call it done.'],
];
export const removalsSteps = [
  ['Get in touch', 'Tell us what is moving, from where and to where.'],
  ['Rate and time estimate', 'Removals are charged by the hour. We give you the rate and an estimate of how long your move will take.'],
  ['Moving day', 'The crew protects your furniture, then loads and moves everything.'],
  ['Unloaded and placed', 'Furniture and boxes go where you want them before the crew leaves.'],
];
// On pages that cover all four teams.
export const sharedSteps = [
  ['Get in touch', 'Tick the teams you need and tell us what the job is.'],
  ['Each team replies', 'By phone or email, to ask anything they need to know.'],
  ['A price', 'Tiling, painting and cleaning give a written quote. Removals gives an hourly rate and a time estimate.'],
  ['The work', 'Dates are booked with you, team by team.'],
];

// The review slider on the home page: [service id, index into that service's reviews]
export const homeReviews = [
  ['removals', 0], ['tiling', 0], ['cleaning', 1], ['tiling', 2], ['removals', 2], ['tiling', 1], ['cleaning', 0], ['removals', 3],
];

// Removals hourly rates, copied from the table on northshoreremovals.com (read 9 Oct 2026).
// These are the only prices on the site. Re-read the source before changing a number.
export const removalsRates = {
  intro: 'Removals are charged by the hour. These are the rates on northshoreremovals.com as at 9 October 2026.',
  rows: [
    // crew, minimum booking, weekday, weekend
    ['2 men + truck', '3 hour minimum', '$180', '$190'],
    ['3 men + truck', '3 hour minimum', '$240', '$250'],
    ['4 men + truck', '4 hour minimum', '$310', '$320'],
    ['Extra man', '', '+$60', '+$60'],
  ],
  note: 'All prices plus GST. The final price depends on your move.',
};
