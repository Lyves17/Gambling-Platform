import {
  Coins,
  Dices,
  RefreshCw,
  Bomb,
  ShieldCheck,
  Disc,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Grid,
  Zap,
  Rocket,
  Crown,
  Club
} from "lucide-react"

export const GAMES = [
  {
    title: "Coin Flip",
    description: "Heads or Tails? 50/50 chance to double your money. Win 1.95x payout instantly.",
    icon: Coins,
    href: "/games/coin-flip",
    color: "text-yellow-400",
    gradient: "from-yellow-400/20 to-yellow-600/5",
    category: "Casual"
  },
  {
    title: "Dice Roll",
    description: "Predict High (4-6) or Low (1-3) to win 2x. Verified fair randomization.",
    icon: Dices,
    href: "/games/dice-roll",
    color: "text-blue-400",
    gradient: "from-blue-400/20 to-blue-600/5",
    category: "Casual"
  },
  {
    title: "Slots",
    description: "Spin 3 reels. Match bells, cherries, or sevens for up to 25x multiplier.",
    icon: RefreshCw,
    href: "/games/slots",
    color: "text-purple-400",
    gradient: "from-purple-400/20 to-purple-600/5",
    category: "Casino"
  },
  {
    title: "Mines",
    description: "Grid of 25 tiles. Reveal gems to increase your multiplier, but don't hit a mine!",
    icon: Bomb,
    href: "/games/mines",
    color: "text-red-400",
    gradient: "from-red-400/20 to-red-600/5",
    category: "Casual"
  },
  {
    title: "Blackjack",
    description: "Beat the dealer to 21. Dealer stands on 17. Pays 1:1, Blackjack pays 3:2.",
    icon: ShieldCheck,
    href: "/games/blackjack",
    color: "text-green-400",
    gradient: "from-green-400/20 to-green-600/5",
    category: "Cards"
  },
  {
    title: "Roulette",
    description: "Predict where the ball lands. Bet on Red/Black (2x) or exact numbers (12x).",
    icon: Disc,
    href: "/games/roulette",
    color: "text-red-500",
    gradient: "from-red-500/20 to-red-600/5",
    category: "Casino"
  },
  {
    title: "Hi-Lo",
    description: "Guess if the next card is Higher or Lower. A game of streaks and probability.",
    icon: ArrowUp,
    href: "/games/hilo",
    color: "text-blue-400",
    gradient: "from-blue-400/20 to-blue-600/5",
    category: "Cards"
  },
  {
    title: "Plinko",
    description: "Drop the ball through the pegs. Target the edges for max 100x payout.",
    icon: ArrowDown,
    href: "/games/plinko",
    color: "text-pink-500",
    gradient: "from-pink-500/20 to-pink-600/5",
    category: "Casual"
  },
  {
    title: "Crash",
    description: "Multiplier rises to infinity. Cash out before the crash to secure your gains.",
    icon: TrendingUp,
    href: "/games/crash",
    color: "text-orange-500",
    gradient: "from-orange-500/20 to-orange-600/5",
    category: "Live"
  },
  {
    title: "Keno",
    description: "Pick lucky numbers from 1-40. Match 5 for a massive 100x jackpot payout.",
    icon: Grid,
    href: "/games/keno",
    color: "text-teal-400",
    gradient: "from-teal-400/20 to-teal-600/5",
    category: "Casino"
  },
  {
    title: "Wheel",
    description: "Spin the lucky wheel for instant multipliers from 1.5x up to 50x.",
    icon: Zap,
    href: "/games/wheel",
    color: "text-yellow-500",
    gradient: "from-yellow-500/20 to-yellow-600/5",
    category: "Casual"
  },
  {
    title: "Limbo",
    description: "Set your target payout. If the result is higher, you win instantly. Simple & fast.",
    icon: Rocket,
    href: "/games/limbo",
    color: "text-indigo-400",
    gradient: "from-indigo-400/20 to-indigo-600/5",
    category: "Live"
  },
  {
    title: "Baccarat",
    description: "Player or Banker? Bet on the hand closest to 9. Classic high-stakes card game.",
    icon: Crown,
    href: "/games/baccarat",
    color: "text-red-600",
    gradient: "from-red-600/20 to-red-800/5",
    category: "Cards"
  },
  {
    title: "Video Poker",
    description: "Draw and Hold. Build the best logic hand. Jacks or Better pays out.",
    icon: Club,
    href: "/games/video-poker",
    color: "text-blue-600",
    gradient: "from-blue-600/20 to-blue-800/5",
    category: "Cards"
  },
]
