export interface MockPost {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  timestamp: string;
}

export interface MockReel {
  id: string;
  creator: string;
  avatar: string;
  caption: string;
  bgGradient: string; // Tailwind class representing dynamic short video content
  emoji: string;
  likes: string;
  comments: string;
}

export const INSTAGRAM_POSTS: MockPost[] = [
  {
    id: 'ig-1',
    author: 'coding_mind',
    avatar: '💻',
    content: 'Just deployed the new shield core service. Fully built on TypeScript. Feels good to reclaim deep-focus mornings!',
    image: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    likes: 420,
    commentsCount: 22,
    timestamp: '4 hours ago'
  },
  {
    id: 'ig-2',
    author: 'travel_mapper',
    avatar: '✈️',
    content: 'Sipping matcha in Kyoto. No algorithms, no reels, just pure local attention.',
    likes: 1204,
    commentsCount: 98,
    timestamp: '6 hours ago'
  }
];

export const INSTAGRAM_REELS: MockReel[] = [
  {
    id: 'reel-ig-1',
    creator: 'viral_pranks_inc',
    avatar: '🤪',
    caption: 'When you try to code after 3 hours of short-term scrolling 😂 #relatable #viral #shorts',
    bgGradient: 'from-amber-500 to-red-500',
    emoji: '🔥',
    likes: '124K',
    comments: '1,290'
  },
  {
    id: 'reel-ig-2',
    creator: 'unboxing_gadgets',
    avatar: '📱',
    caption: 'This 1$ gadget can destroy your dopamine receptors instantly! #dopamine #tech #review',
    bgGradient: 'from-blue-600 to-indigo-900',
    emoji: '⚡',
    likes: '89K',
    comments: '812'
  }
];

export const YOUTUBE_VIDEOS = [
  {
    id: 'yt-1',
    title: 'How to Build Absolute Focus Muscle (No Apps, Real Science)',
    channel: 'Stanford Focus Lab',
    views: '2.4M views',
    duration: '22:15',
    thumbnailColor: 'bg-emerald-800',
    timestamp: '2 weeks ago'
  },
  {
    id: 'yt-2',
    title: 'Why 10-Second Reels Are Shrinking Your Prefrontal Cortex',
    channel: 'Brain Chemistry Insights',
    views: '890K views',
    duration: '14:02',
    thumbnailColor: 'bg-indigo-950',
    timestamp: '5 days ago'
  },
  {
    id: 'yt-3',
    title: 'The Unfair Advantage of Long-Form Audio Sessions in 2026',
    channel: 'Deep Work Mastery',
    views: '150K views',
    duration: '45:10',
    thumbnailColor: 'bg-violet-900',
    timestamp: '1 day ago'
  }
];

export const YOUTUBE_SHORTS: MockReel[] = [
  {
    id: 'short-yt-1',
    creator: 'alpha_motivate',
    avatar: '🦁',
    caption: 'Andrew Tate explains why you are broke because of 5 minutes of sleep! #motivation #success #grind',
    bgGradient: 'from-slate-700 to-slate-950 border-r-4 border-emerald-500',
    emoji: '🏆',
    likes: '452K',
    comments: '12K'
  },
  {
    id: 'short-yt-2',
    creator: 'looping_dance',
    avatar: '💃',
    caption: 'Check out this satisfying satisfying satisfying sound compilation! Part 42.',
    bgGradient: 'from-pink-500 to-purple-600',
    emoji: '🎶',
    likes: '1.2M',
    comments: '45K'
  }
];

export const FACEBOOK_POSTS: MockPost[] = [
  {
    id: 'fb-1',
    author: 'Uncle Robert',
    avatar: '🧔',
    content: 'Back in my day we did not have "Shorts". If we wanted quick dopamine, we ran away from the neighbors dog. Kids these days are on their phones too much. Shared from Android.',
    likes: 12,
    commentsCount: 34,
    timestamp: 'Yesterday at 17:42'
  },
  {
    id: 'fb-2',
    author: 'Healthy Habits Hub',
    avatar: '🥗',
    content: 'Did you know? Setting clear barriers like PIN overrides can reduce social spending times by up to 68%! Real science.',
    likes: 310,
    commentsCount: 45,
    timestamp: '3 hours ago'
  }
];

export const FACEBOOK_REELS: MockReel[] = [
  {
    id: 'reel-fb-1',
    creator: 'Daily Woodworking Hacks',
    avatar: '🪚',
    caption: 'Satisfying table joint restoration that you will scroll for 20 minutes to see complete 🪵',
    bgGradient: 'from-cyan-700 via-teal-800 to-emerald-950',
    emoji: '🪵',
    likes: '23K',
    comments: '702'
  },
  {
    id: 'reel-fb-2',
    creator: 'Cringe Drama Compilation',
    avatar: '🎭',
    caption: 'Gold digger gets a lesson from billionaire undercover sweeper! (Wait for the twist...) 😱',
    bgGradient: 'from-indigo-600 via-rose-700 to-purple-900',
    emoji: '🍿',
    likes: '110K',
    comments: '2.4K'
  }
];

export const FOCUS_QUOTES = [
  "You cannot find peace by avoiding life, but you can find focus by avoiding Reels.",
  "Dopamine cascades make you a spectator. Create something instead.",
  "Your attention is the most valuable commodity. Stop gifting it for free.",
  "Can you tolerate 10 minutes of boredom? That is where deep thought is born.",
  "Discipline isn't punishment. It is the high-contrast wall protecting your potential.",
  "Every blocked short-video is an extra minute of high-grade cognitive fuel.",
  "Focus is not about saying yes to task, it is saying no to a thousand Reels."
];
