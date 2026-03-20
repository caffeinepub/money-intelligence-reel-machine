import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { formatToScript } from "@/lib/scriptUtils";
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import ReelCanvas from "./components/ReelCanvas";
import { useGenerateScript } from "./hooks/useQueries";

const SAMPLE_LINES = [
  "Most Indians spend 90% before saving anything.",
  "Your salary disappears — EMIs, rent, groceries.",
  "The wealthy save first. Then spend what's left.",
  "Start a ₹500/month SIP today. Watch it grow.",
  "Small habits build massive wealth over time.",
  "Follow Money Intelligence India for more insights",
];

const STRUCTURE_LABELS = [
  { label: "Hook", color: "#FFD700" },
  { label: "Problem", color: "#F87171" },
  { label: "Insight", color: "#60A5FA" },
  { label: "Solution", color: "#34D399" },
  { label: "Closure", color: "#A78BFA" },
  { label: "CTA", color: "#FFD700" },
];

const TOPICS_PER_PAGE = 10;

interface Reel {
  hook: string;
  problem: string;
  insight: string;
  solution: string;
  closure: string;
  cta: string;
}

interface TopicData {
  id: number;
  topic: string;
  reels: Reel[];
}

const TOPICS_DATA: TopicData[] = [
  {
    id: 1,
    topic: "EMI Trap",
    reels: [
      {
        hook: "EMI makes you feel rich…",
        problem: "But your bank balance says otherwise.",
        insight: "EMI is future income already spent.",
        solution: "Reduce EMIs before upgrading lifestyle.",
        closure: "EMI comfort = financial pressure.",
        cta: "Follow for real money truths.",
      },
      {
        hook: "EMI is not affordability…",
        problem: "It's delayed financial stress.",
        insight: "You're committing future salary blindly.",
        solution: "Buy only what you can afford upfront.",
        closure: "If EMI is needed… you can't afford it.",
        cta: "Follow for clarity.",
      },
    ],
  },
  {
    id: 2,
    topic: "Salary Disappears",
    reels: [
      {
        hook: "Salary comes… disappears in 10 days?",
        problem: "You don't know where it went.",
        insight: "You're not tracking money.",
        solution: "Track every rupee for 30 days.",
        closure: "Awareness changes everything.",
        cta: "Follow for control.",
      },
    ],
  },
  {
    id: 3,
    topic: "Emergency Fund",
    reels: [
      {
        hook: "One emergency can destroy you…",
        problem: "If you have zero backup.",
        insight: "Savings = survival.",
        solution: "Build 3–6 months expense fund.",
        closure: "No savings = high risk life.",
        cta: "Follow for security.",
      },
    ],
  },
  {
    id: 4,
    topic: "Credit Card Trap",
    reels: [
      {
        hook: "Swipe now… regret later.",
        problem: "Credit feels like free money.",
        insight: "Interest makes it expensive.",
        solution: "Always pay full bill.",
        closure: "Credit is a tool, not income.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 5,
    topic: "Needs vs Wants",
    reels: [
      {
        hook: "You don't need it…",
        problem: "You just want it.",
        insight: "Wants are endless.",
        solution: "Control impulse buying.",
        closure: "Needs build life, wants drain money.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 6,
    topic: "Lifestyle Inflation",
    reels: [
      {
        hook: "Income increased…",
        problem: "Expenses increased faster.",
        insight: "That's lifestyle inflation.",
        solution: "Keep expenses stable.",
        closure: "Grow wealth, not lifestyle.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 7,
    topic: "Tracking Money",
    reels: [
      {
        hook: "What gets tracked grows…",
        problem: "You track nothing.",
        insight: "That's why money disappears.",
        solution: "Track daily expenses.",
        closure: "Numbers don't lie.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 8,
    topic: "Debt Free Life",
    reels: [
      {
        hook: "Debt-free is real freedom…",
        problem: "Most people stay stuck.",
        insight: "Debt kills options.",
        solution: "Clear loans aggressively.",
        closure: "No debt = peace.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 9,
    topic: "Impulse Buying",
    reels: [
      {
        hook: "You didn't plan it…",
        problem: "But you still bought it.",
        insight: "That's impulse spending.",
        solution: "Wait 24 hours before buying.",
        closure: "Control emotion, save money.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 10,
    topic: "Financial Discipline",
    reels: [
      {
        hook: "Discipline beats income…",
        problem: "Most people ignore it.",
        insight: "Habits build wealth.",
        solution: "Stay consistent.",
        closure: "Discipline = freedom.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 11,
    topic: "Pay Yourself First",
    reels: [
      {
        hook: "You pay bills first…",
        problem: "You forget yourself.",
        insight: "That's why you stay broke.",
        solution: "Save before spending.",
        closure: "You are your first priority.",
        cta: "Follow.",
      },
      {
        hook: "If you don't pay yourself…",
        problem: "No one else will.",
        insight: "Savings is self-respect.",
        solution: "Auto-save monthly.",
        closure: "Future depends on you.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 12,
    topic: "Small Expenses Kill Wealth",
    reels: [
      {
        hook: "It's just ₹100…",
        problem: "You say this daily.",
        insight: "Small adds up big.",
        solution: "Track daily spends.",
        closure: "Leaks sink wealth.",
        cta: "Follow.",
      },
      {
        hook: "Your coffee is costing lakhs…",
        problem: "Over time.",
        insight: "Compounding works both ways.",
        solution: "Cut unnecessary habits.",
        closure: "Small matters.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 13,
    topic: "Impulse Buying",
    reels: [
      {
        hook: "You didn't plan it…",
        problem: "But still bought it.",
        insight: "Emotion > logic.",
        solution: "Wait 24 hours.",
        closure: "Control impulse.",
        cta: "Follow.",
      },
      {
        hook: "Flash sale fooled you…",
        problem: "You didn't need it.",
        insight: "Marketing controls you.",
        solution: "Pause before buying.",
        closure: "Think before spend.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 14,
    topic: "Saving Feels Hard",
    reels: [
      {
        hook: "Saving feels painful…",
        problem: "Spending feels easy.",
        insight: "That's psychology.",
        solution: "Automate savings.",
        closure: "Make it invisible.",
        cta: "Follow.",
      },
      {
        hook: "You hate saving…",
        problem: "Because it's discipline.",
        insight: "Comfort kills growth.",
        solution: "Start small.",
        closure: "Grow slowly.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 15,
    topic: "Money Stress",
    reels: [
      {
        hook: "Money stress never ends…",
        problem: "Habits don't change.",
        insight: "Income is not issue.",
        solution: "Fix behavior.",
        closure: "Control = peace.",
        cta: "Follow.",
      },
      {
        hook: "You earn but still stressed…",
        problem: "No control.",
        insight: "Money needs direction.",
        solution: "Plan finances.",
        closure: "Clarity brings peace.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 16,
    topic: "No Budget",
    reels: [
      {
        hook: "No budget?",
        problem: "Then no savings.",
        insight: "Money needs plan.",
        solution: "Create simple budget.",
        closure: "Plan wins.",
        cta: "Follow.",
      },
      {
        hook: "You guess your spending…",
        problem: "That's the mistake.",
        insight: "Numbers don't lie.",
        solution: "Track monthly.",
        closure: "Clarity = control.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 17,
    topic: "Banks Profit From You",
    reels: [
      {
        hook: "Banks want you in debt…",
        problem: "That's their business.",
        insight: "Interest is profit.",
        solution: "Be smart.",
        closure: "Don't fund them.",
        cta: "Follow.",
      },
      {
        hook: "You think bank helps you…",
        problem: "They earn from you.",
        insight: "Loans = business.",
        solution: "Borrow wisely.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 18,
    topic: "Fake Rich Lifestyle",
    reels: [
      {
        hook: "You look rich…",
        problem: "But you're broke.",
        insight: "Lifestyle ≠ wealth.",
        solution: "Build assets.",
        closure: "Reality matters.",
        cta: "Follow.",
      },
      {
        hook: "Big phone… empty account…",
        problem: "Fake image.",
        insight: "Status costs money.",
        solution: "Live real.",
        closure: "Wealth is silent.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 19,
    topic: "No Investing",
    reels: [
      {
        hook: "You don't invest…",
        problem: "Money stays stuck.",
        insight: "Inflation eats it.",
        solution: "Start small.",
        closure: "Grow money.",
        cta: "Follow.",
      },
      {
        hook: "Saving is not enough…",
        problem: "No growth.",
        insight: "Money must multiply.",
        solution: "Invest early.",
        closure: "Time matters.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 20,
    topic: "Financial Discipline",
    reels: [
      {
        hook: "Discipline beats income…",
        problem: "People ignore it.",
        insight: "Habits build wealth.",
        solution: "Stay consistent.",
        closure: "Discipline wins.",
        cta: "Follow.",
      },
      {
        hook: "You want results…",
        problem: "But no discipline.",
        insight: "That's the gap.",
        solution: "Fix routine.",
        closure: "Consistency = success.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 21,
    topic: "You Are Poor (Truth)",
    reels: [
      {
        hook: "You're not unlucky…",
        problem: "You're financially careless.",
        insight: "Habits made you broke.",
        solution: "Fix habits.",
        closure: "Truth hurts but works.",
        cta: "Follow.",
      },
      {
        hook: "You say you're trying…",
        problem: "But nothing changes.",
        insight: "Trying is not discipline.",
        solution: "Set strict rules.",
        closure: "Action creates results.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 22,
    topic: "Salary Slave",
    reels: [
      {
        hook: "You're not employed…",
        problem: "You're trapped.",
        insight: "Salary dependence is risky.",
        solution: "Build side income.",
        closure: "One income is dangerous.",
        cta: "Follow.",
      },
      {
        hook: "Your job feels safe…",
        problem: "But it's not.",
        insight: "One decision can end it.",
        solution: "Create backup.",
        closure: "Security is illusion.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 23,
    topic: "Fake Rich People",
    reels: [
      {
        hook: "Big phone… big car…",
        problem: "Empty account.",
        insight: "Image is fake.",
        solution: "Focus on assets.",
        closure: "Wealth is real.",
        cta: "Follow.",
      },
      {
        hook: "You're impressed by lifestyle…",
        problem: "Not by reality.",
        insight: "Debt hides truth.",
        solution: "Think deeper.",
        closure: "Not everything is real.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 24,
    topic: "EMI = Modern Slavery",
    reels: [
      {
        hook: "EMI is modern slavery…",
        problem: "You don't realize it.",
        insight: "You work for past buys.",
        solution: "Reduce EMIs.",
        closure: "Freedom matters.",
        cta: "Follow.",
      },
      {
        hook: "Every EMI locks you…",
        problem: "Into future stress.",
        insight: "Income already spent.",
        solution: "Avoid unnecessary loans.",
        closure: "Stay free.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 25,
    topic: "Friends Keep You Broke",
    reels: [
      {
        hook: "Your friends decide your future…",
        problem: "Bad habits spread.",
        insight: "Environment controls you.",
        solution: "Upgrade circle.",
        closure: "Growth needs change.",
        cta: "Follow.",
      },
      {
        hook: "Broke circle = broke life…",
        problem: "You normalize it.",
        insight: "Standards matter.",
        solution: "Choose better company.",
        closure: "Level up.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 26,
    topic: "You Don't Need More Money",
    reels: [
      {
        hook: "You don't need more money…",
        problem: "You need control.",
        insight: "Habits matter.",
        solution: "Fix discipline.",
        closure: "Money follows behavior.",
        cta: "Follow.",
      },
      {
        hook: "More income won't fix you…",
        problem: "Spending will increase.",
        insight: "Lifestyle grows.",
        solution: "Control expenses.",
        closure: "Fix basics first.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 27,
    topic: "Social Media Lifestyle",
    reels: [
      {
        hook: "Instagram made you poor…",
        problem: "You copy fake lives.",
        insight: "Comparison costs money.",
        solution: "Focus on reality.",
        closure: "Stop chasing.",
        cta: "Follow.",
      },
      {
        hook: "You see luxury daily…",
        problem: "And feel behind.",
        insight: "It's curated.",
        solution: "Ignore noise.",
        closure: "Stay grounded.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 28,
    topic: "Expensive Habits",
    reels: [
      {
        hook: "Your habits are expensive…",
        problem: "You ignore it.",
        insight: "Daily adds yearly.",
        solution: "Audit routine.",
        closure: "Habits decide wealth.",
        cta: "Follow.",
      },
      {
        hook: "Daily ₹200 waste…",
        problem: "Huge yearly loss.",
        insight: "Compounding works.",
        solution: "Cut habits.",
        closure: "Save smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 29,
    topic: "No Savings = No Respect",
    reels: [
      {
        hook: "No savings?",
        problem: "No security.",
        insight: "Dependence grows.",
        solution: "Start saving.",
        closure: "Money = respect.",
        cta: "Follow.",
      },
      {
        hook: "You earn but save nothing…",
        problem: "That's risky.",
        insight: "Life is unpredictable.",
        solution: "Build backup.",
        closure: "Stay secure.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 30,
    topic: "Weekend Spending",
    reels: [
      {
        hook: "Weekend = broke again…",
        problem: "Overspending habits.",
        insight: "Fun costs future.",
        solution: "Plan spending.",
        closure: "Balance matters.",
        cta: "Follow.",
      },
      {
        hook: "2 days of fun…",
        problem: "5 days of stress.",
        insight: "Short-term thinking.",
        solution: "Control weekends.",
        closure: "Think long-term.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 31,
    topic: "Buy Now Pay Later",
    reels: [
      {
        hook: "Buy now pay later?",
        problem: "Pay later = pain.",
        insight: "Trap system.",
        solution: "Avoid BNPL.",
        closure: "Delay doesn't remove cost.",
        cta: "Follow.",
      },
      {
        hook: "Feels easy now…",
        problem: "Hard later.",
        insight: "Future burden.",
        solution: "Pay upfront.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 32,
    topic: "Spending Addiction",
    reels: [
      {
        hook: "You're not a spender…",
        problem: "You're addicted.",
        insight: "Dopamine hit.",
        solution: "Control habits.",
        closure: "Break pattern.",
        cta: "Follow.",
      },
      {
        hook: "Shopping makes you happy…",
        problem: "Temporary feeling.",
        insight: "Cost is real.",
        solution: "Replace habits.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 33,
    topic: "Rich vs Middle Class Thinking",
    reels: [
      {
        hook: "Rich think different…",
        problem: "Middle class play safe.",
        insight: "Safety limits growth.",
        solution: "Learn mindset.",
        closure: "Thinking matters.",
        cta: "Follow.",
      },
      {
        hook: "You choose safety…",
        problem: "They choose growth.",
        insight: "Risk is needed.",
        solution: "Take smart risks.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 34,
    topic: "Daily Money Waste",
    reels: [
      {
        hook: "You waste money daily…",
        problem: "Call it small.",
        insight: "Small becomes big.",
        solution: "Track spending.",
        closure: "Stop lying.",
        cta: "Follow.",
      },
      {
        hook: "Daily leaks…",
        problem: "Big loss later.",
        insight: "Invisible damage.",
        solution: "Fix habits.",
        closure: "Save more.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 35,
    topic: "Financial Illiteracy",
    reels: [
      {
        hook: "Nobody taught you money…",
        problem: "You never learned.",
        insight: "Ignorance costs.",
        solution: "Learn basics.",
        closure: "Knowledge = power.",
        cta: "Follow.",
      },
      {
        hook: "You earn but don't understand money…",
        problem: "That's dangerous.",
        insight: "Financial literacy matters.",
        solution: "Educate yourself.",
        closure: "Grow smarter.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 36,
    topic: "Fear of Investing",
    reels: [
      {
        hook: "You fear investing…",
        problem: "But not spending.",
        insight: "That's backwards.",
        solution: "Start small.",
        closure: "Risk is everywhere.",
        cta: "Follow.",
      },
      {
        hook: "You avoid markets…",
        problem: "But waste money daily.",
        insight: "Fear is selective.",
        solution: "Learn basics.",
        closure: "Grow confidence.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 37,
    topic: "Comfort Zone Kills Growth",
    reels: [
      {
        hook: "Comfort feels safe…",
        problem: "But keeps you stuck.",
        insight: "Growth needs discomfort.",
        solution: "Take small risks.",
        closure: "Move forward.",
        cta: "Follow.",
      },
      {
        hook: "You avoid risk…",
        problem: "You avoid growth.",
        insight: "Safe = slow.",
        solution: "Step out.",
        closure: "Progress matters.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 38,
    topic: "Pretending to Be Rich",
    reels: [
      {
        hook: "You act rich…",
        problem: "But live broke.",
        insight: "Lifestyle is fake.",
        solution: "Build assets.",
        closure: "Reality wins.",
        cta: "Follow.",
      },
      {
        hook: "Looking rich is easy…",
        problem: "Being rich is hard.",
        insight: "Focus wrong.",
        solution: "Think long-term.",
        closure: "Be real.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 39,
    topic: "No Financial Plan",
    reels: [
      {
        hook: "No plan?",
        problem: "No growth.",
        insight: "Money needs direction.",
        solution: "Create plan.",
        closure: "Clarity wins.",
        cta: "Follow.",
      },
      {
        hook: "You guess finances…",
        problem: "That's the issue.",
        insight: "Random money life.",
        solution: "Plan monthly.",
        closure: "Stay focused.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 40,
    topic: "Money = Freedom",
    reels: [
      {
        hook: "Money is not everything…",
        problem: "But lack of it is.",
        insight: "Freedom needs money.",
        solution: "Build income.",
        closure: "Freedom grows.",
        cta: "Follow.",
      },
      {
        hook: "No money…",
        problem: "No options.",
        insight: "Money buys time.",
        solution: "Earn + save.",
        closure: "Stay free.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 41,
    topic: "Customer with Zero Savings",
    reels: [
      {
        hook: "A customer earned well…",
        problem: "But saved nothing.",
        insight: "Income ≠ wealth.",
        solution: "Start saving.",
        closure: "Reality check.",
        cta: "Follow.",
      },
      {
        hook: "Big salary…",
        problem: "No backup.",
        insight: "Risky life.",
        solution: "Build fund.",
        closure: "Stay secure.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 42,
    topic: "Credit Card Disaster",
    reels: [
      {
        hook: "5 credit cards…",
        problem: "All maxed out.",
        insight: "Trap system.",
        solution: "Clear debt.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
      {
        hook: "Minimum payments…",
        problem: "Endless cycle.",
        insight: "Interest grows.",
        solution: "Pay full.",
        closure: "Break trap.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 43,
    topic: "EMI Overload",
    reels: [
      {
        hook: "70% salary gone…",
        problem: "EMIs.",
        insight: "Lifestyle mistake.",
        solution: "Reduce loans.",
        closure: "Free income.",
        cta: "Follow.",
      },
      {
        hook: "Too many EMIs…",
        problem: "No growth.",
        insight: "Future locked.",
        solution: "Cut liabilities.",
        closure: "Stay free.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 44,
    topic: "Salary Gone in 10 Days",
    reels: [
      {
        hook: "Salary gone in 10 days…",
        problem: "No control.",
        insight: "No tracking.",
        solution: "Budget early.",
        closure: "Control money.",
        cta: "Follow.",
      },
      {
        hook: "You don't know expenses…",
        problem: "That's why broke.",
        insight: "Awareness missing.",
        solution: "Track daily.",
        closure: "Fix habits.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 45,
    topic: "Rich Look, Broke Reality",
    reels: [
      {
        hook: "Looks rich…",
        problem: "Actually broke.",
        insight: "Debt hidden.",
        solution: "Build assets.",
        closure: "Be real.",
        cta: "Follow.",
      },
      {
        hook: "Lifestyle fools people…",
        problem: "Reality hurts.",
        insight: "Image ≠ wealth.",
        solution: "Focus inside.",
        closure: "Stay grounded.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 46,
    topic: "No Savings Panic",
    reels: [
      {
        hook: "Job loss = panic…",
        problem: "No savings.",
        insight: "No backup.",
        solution: "Build fund.",
        closure: "Stay ready.",
        cta: "Follow.",
      },
      {
        hook: "Emergency comes…",
        problem: "You struggle.",
        insight: "Savings missing.",
        solution: "Start today.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 47,
    topic: "FD Only Mindset",
    reels: [
      {
        hook: "Only FD?",
        problem: "No growth.",
        insight: "Inflation wins.",
        solution: "Diversify.",
        closure: "Grow money.",
        cta: "Follow.",
      },
      {
        hook: "Safe but slow…",
        problem: "Money stuck.",
        insight: "Needs growth.",
        solution: "Invest smart.",
        closure: "Balance risk.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 48,
    topic: "High Income, No Wealth",
    reels: [
      {
        hook: "High salary…",
        problem: "Zero wealth.",
        insight: "Spending high.",
        solution: "Save + invest.",
        closure: "Keep money.",
        cta: "Follow.",
      },
      {
        hook: "Income doesn't matter…",
        problem: "Retention matters.",
        insight: "Wealth = what you keep.",
        solution: "Control expenses.",
        closure: "Grow smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 49,
    topic: "Impulse EMI Buying",
    reels: [
      {
        hook: "Bought on EMI…",
        problem: "Regret later.",
        insight: "Emotion buy.",
        solution: "Wait first.",
        closure: "Control urge.",
        cta: "Follow.",
      },
      {
        hook: "Easy EMI…",
        problem: "Hard future.",
        insight: "Trap system.",
        solution: "Think twice.",
        closure: "Stay smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 50,
    topic: "No Retirement Planning",
    reels: [
      {
        hook: "45 and no plan…",
        problem: "Late start.",
        insight: "Time lost.",
        solution: "Start now.",
        closure: "Future matters.",
        cta: "Follow.",
      },
      {
        hook: "You ignore retirement…",
        problem: "Big mistake.",
        insight: "Time is key.",
        solution: "Invest early.",
        closure: "Secure future.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 51,
    topic: "Family Money Conflicts",
    reels: [
      {
        hook: "He saves… she spends…",
        problem: "Constant fights.",
        insight: "No financial alignment.",
        solution: "Plan together.",
        closure: "Money needs teamwork.",
        cta: "Follow.",
      },
      {
        hook: "Same house… different habits…",
        problem: "Financial stress.",
        insight: "No communication.",
        solution: "Discuss money openly.",
        closure: "Clarity builds peace.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 52,
    topic: "Bonus Misuse",
    reels: [
      {
        hook: "Bonus came…",
        problem: "Gone in 2 days.",
        insight: "No planning.",
        solution: "Split before spending.",
        closure: "Discipline matters.",
        cta: "Follow.",
      },
      {
        hook: "Extra money feels free…",
        problem: "So you waste it.",
        insight: "No allocation.",
        solution: "Save first.",
        closure: "Use wisely.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 53,
    topic: "No Insurance Risk",
    reels: [
      {
        hook: "Medical emergency came…",
        problem: "No insurance.",
        insight: "Savings wiped out.",
        solution: "Get coverage.",
        closure: "Risk is real.",
        cta: "Follow.",
      },
      {
        hook: "You ignore insurance…",
        problem: "Until it's late.",
        insight: "One event changes everything.",
        solution: "Protect yourself.",
        closure: "Stay covered.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 54,
    topic: "Multiple Loan Trap",
    reels: [
      {
        hook: "Loan + card + EMI…",
        problem: "Salary gone.",
        insight: "Over-leveraged life.",
        solution: "Reduce debt.",
        closure: "Too many loans = no life.",
        cta: "Follow.",
      },
      {
        hook: "Stacking loans…",
        problem: "No control.",
        insight: "Interest grows.",
        solution: "Clear high interest first.",
        closure: "Stay free.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 55,
    topic: "Saving After Spending",
    reels: [
      {
        hook: "I save what's left…",
        problem: "Nothing left.",
        insight: "Wrong order.",
        solution: "Save first.",
        closure: "Priority matters.",
        cta: "Follow.",
      },
      {
        hook: "Spending first…",
        problem: "Saving never happens.",
        insight: "Behavior issue.",
        solution: "Reverse process.",
        closure: "Pay yourself first.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 56,
    topic: "No Expense Tracking",
    reels: [
      {
        hook: "What do you spend monthly?",
        problem: "You don't know.",
        insight: "Blind spending.",
        solution: "Track daily.",
        closure: "Awareness wins.",
        cta: "Follow.",
      },
      {
        hook: "No tracking…",
        problem: "No control.",
        insight: "Money disappears.",
        solution: "Write expenses.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 57,
    topic: "Cash vs Card Psychology",
    reels: [
      {
        hook: "Same person… different spending…",
        problem: "Card vs cash.",
        insight: "No pain of paying.",
        solution: "Use cash mindset.",
        closure: "Spend less.",
        cta: "Follow.",
      },
      {
        hook: "Swipe feels easy…",
        problem: "Payment feels hard.",
        insight: "Psychology trick.",
        solution: "Stay aware.",
        closure: "Control spending.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 58,
    topic: "Wrong Priorities",
    reels: [
      {
        hook: "Expensive phone…",
        problem: "No savings.",
        insight: "Wrong priorities.",
        solution: "Fix basics first.",
        closure: "Needs first.",
        cta: "Follow.",
      },
      {
        hook: "Luxury before security…",
        problem: "Big mistake.",
        insight: "Risky life.",
        solution: "Build foundation.",
        closure: "Then upgrade.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 59,
    topic: "Late Payment Damage",
    reels: [
      {
        hook: "Missed one EMI…",
        problem: "Score dropped.",
        insight: "Small mistake, big impact.",
        solution: "Pay on time.",
        closure: "Discipline matters.",
        cta: "Follow.",
      },
      {
        hook: "Delay payments…",
        problem: "Future cost.",
        insight: "Credit damage.",
        solution: "Stay consistent.",
        closure: "Build trust.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 60,
    topic: "Quiet Wealth Builders",
    reels: [
      {
        hook: "Simple man…",
        problem: "No flashy life.",
        insight: "High savings.",
        solution: "Stay consistent.",
        closure: "Quiet wealth wins.",
        cta: "Follow.",
      },
      {
        hook: "Not showing off…",
        problem: "Still growing rich.",
        insight: "Discipline matters.",
        solution: "Focus inside.",
        closure: "Be patient.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 61,
    topic: "Saving is Overhyped",
    reels: [
      {
        hook: "Saving won't make you rich…",
        problem: "Too slow.",
        insight: "Growth matters.",
        solution: "Invest.",
        closure: "Think bigger.",
        cta: "Agree?",
      },
      {
        hook: "Saving alone is useless…",
        problem: "No multiplication.",
        insight: "Money must grow.",
        solution: "Invest smart.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 62,
    topic: "Job is Not Safe",
    reels: [
      {
        hook: "Job is not security…",
        problem: "You feel safe.",
        insight: "One decision ends it.",
        solution: "Build backup.",
        closure: "Stay ready.",
        cta: "Follow.",
      },
      {
        hook: "You trust salary…",
        problem: "Too much.",
        insight: "Risk exists.",
        solution: "Diversify income.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 63,
    topic: "Middle Class Mindset Trap",
    reels: [
      {
        hook: "Middle class stays same…",
        problem: "Thinking doesn't change.",
        insight: "Safe mindset.",
        solution: "Take risks.",
        closure: "Grow mindset.",
        cta: "Follow.",
      },
      {
        hook: "Playing safe…",
        problem: "No growth.",
        insight: "Comfort kills.",
        solution: "Step out.",
        closure: "Think bigger.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 64,
    topic: "Buying House Debate",
    reels: [
      {
        hook: "Buying house isn't always smart…",
        problem: "Huge EMI burden.",
        insight: "Opportunity cost.",
        solution: "Evaluate first.",
        closure: "Think logically.",
        cta: "Agree?",
      },
      {
        hook: "Rent vs buy…",
        problem: "Depends on situation.",
        insight: "No fixed rule.",
        solution: "Calculate.",
        closure: "Decide wisely.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 65,
    topic: "Car is Liability",
    reels: [
      {
        hook: "Your car is not asset…",
        problem: "It drains money.",
        insight: "Depreciation.",
        solution: "Buy wisely.",
        closure: "Status costs.",
        cta: "Follow.",
      },
      {
        hook: "New car excitement…",
        problem: "Long-term cost.",
        insight: "Maintenance + EMI.",
        solution: "Think twice.",
        closure: "Be smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 66,
    topic: "Expensive Education Myth",
    reels: [
      {
        hook: "Expensive degree ≠ success…",
        problem: "People chase brand.",
        insight: "Skills matter more.",
        solution: "Focus on learning.",
        closure: "Degree ≠ income.",
        cta: "Follow.",
      },
      {
        hook: "College name impresses…",
        problem: "Skills build money.",
        insight: "Reality different.",
        solution: "Upgrade yourself.",
        closure: "Be practical.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 67,
    topic: "Credit Card Power vs Trap",
    reels: [
      {
        hook: "Credit card is powerful…",
        problem: "If used right.",
        insight: "Most misuse it.",
        solution: "Stay disciplined.",
        closure: "Tool or trap.",
        cta: "Follow.",
      },
      {
        hook: "Card can help…",
        problem: "Or destroy.",
        insight: "Depends on you.",
        solution: "Control usage.",
        closure: "Stay smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 68,
    topic: "Rich vs Saving Mindset",
    reels: [
      {
        hook: "Rich don't save like you…",
        problem: "They invest.",
        insight: "Different thinking.",
        solution: "Learn investing.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
      {
        hook: "Saving is safe…",
        problem: "But slow.",
        insight: "Growth matters.",
        solution: "Take calculated risks.",
        closure: "Think bigger.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 69,
    topic: "Passion vs Money",
    reels: [
      {
        hook: "Follow passion?",
        problem: "Can make you broke.",
        insight: "Money matters.",
        solution: "Balance both.",
        closure: "Be practical.",
        cta: "Follow.",
      },
      {
        hook: "Passion without income…",
        problem: "Stressful life.",
        insight: "Reality check.",
        solution: "Build income first.",
        closure: "Then passion.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 70,
    topic: "Budget vs Discipline",
    reels: [
      {
        hook: "You don't need budget…",
        problem: "You need discipline.",
        insight: "Tools don't fix habits.",
        solution: "Control behavior.",
        closure: "Discipline wins.",
        cta: "Follow.",
      },
      {
        hook: "Budget fails…",
        problem: "Because you do.",
        insight: "Consistency missing.",
        solution: "Fix routine.",
        closure: "Stay consistent.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 71,
    topic: "Investing is Simple",
    reels: [
      {
        hook: "Investing is not complex…",
        problem: "You overthink.",
        insight: "Basics enough.",
        solution: "Start small SIP.",
        closure: "Action matters.",
        cta: "Follow.",
      },
      {
        hook: "You delay investing…",
        problem: "Fear and confusion.",
        insight: "Time is key.",
        solution: "Start today.",
        closure: "Grow early.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 72,
    topic: "Money Buys Happiness",
    reels: [
      {
        hook: "Money CAN buy happiness…",
        problem: "Lack causes stress.",
        insight: "Comfort matters.",
        solution: "Build stability.",
        closure: "Balance life.",
        cta: "Agree?",
      },
      {
        hook: "No money…",
        problem: "No peace.",
        insight: "Reality check.",
        solution: "Earn + save.",
        closure: "Stay secure.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 73,
    topic: "Good vs Bad EMI",
    reels: [
      {
        hook: "EMI is not always bad…",
        problem: "Depends usage.",
        insight: "Productive vs waste.",
        solution: "Choose wisely.",
        closure: "Think smart.",
        cta: "Follow.",
      },
      {
        hook: "Loan for asset…",
        problem: "Better than lifestyle.",
        insight: "Difference matters.",
        solution: "Use wisely.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 74,
    topic: "Comfort vs Growth",
    reels: [
      {
        hook: "People want comfort…",
        problem: "Not growth.",
        insight: "Comfort traps you.",
        solution: "Choose discomfort.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
      {
        hook: "Easy life feels good…",
        problem: "But no progress.",
        insight: "Growth needs effort.",
        solution: "Push yourself.",
        closure: "Win later.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 75,
    topic: "Saving 10% is Low",
    reels: [
      {
        hook: "10% saving is too low…",
        problem: "Future needs more.",
        insight: "Inflation rising.",
        solution: "Increase saving.",
        closure: "Think long-term.",
        cta: "Follow.",
      },
      {
        hook: "You save little…",
        problem: "Future risk.",
        insight: "More needed.",
        solution: "Boost savings.",
        closure: "Secure future.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 76,
    topic: "Talk About Money",
    reels: [
      {
        hook: "Not talking about money…",
        problem: "Big mistake.",
        insight: "Ignorance grows.",
        solution: "Discuss openly.",
        closure: "Awareness wins.",
        cta: "Follow.",
      },
      {
        hook: "Money is taboo…",
        problem: "That hurts you.",
        insight: "Knowledge needed.",
        solution: "Start talking.",
        closure: "Grow smarter.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 77,
    topic: "One Income Risk",
    reels: [
      {
        hook: "One income is dangerous…",
        problem: "No backup.",
        insight: "High risk.",
        solution: "Build side income.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
      {
        hook: "Single salary life…",
        problem: "Fragile system.",
        insight: "Needs support.",
        solution: "Diversify income.",
        closure: "Be secure.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 78,
    topic: "Rich Are Not Lucky",
    reels: [
      {
        hook: "Rich are not lucky…",
        problem: "They think different.",
        insight: "Habits matter.",
        solution: "Change mindset.",
        closure: "Build wealth.",
        cta: "Follow.",
      },
      {
        hook: "Luck is excuse…",
        problem: "Action missing.",
        insight: "Consistency wins.",
        solution: "Stay disciplined.",
        closure: "Grow daily.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 79,
    topic: "Financial Freedom is Hard",
    reels: [
      {
        hook: "Freedom is not easy…",
        problem: "Needs discipline.",
        insight: "Most quit early.",
        solution: "Stay consistent.",
        closure: "Worth it.",
        cta: "Follow.",
      },
      {
        hook: "You want freedom…",
        problem: "No effort.",
        insight: "Mismatch.",
        solution: "Work daily.",
        closure: "Win later.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 80,
    topic: "You Are the Problem",
    reels: [
      {
        hook: "Your finances are bad…",
        problem: "Because of you.",
        insight: "Habits define results.",
        solution: "Take control.",
        closure: "Change now.",
        cta: "Follow.",
      },
      {
        hook: "Blaming others…",
        problem: "Won't fix money.",
        insight: "Responsibility needed.",
        solution: "Own it.",
        closure: "Improve life.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 81,
    topic: "Money Disappears Fast",
    reels: [
      {
        hook: "Your money disappears…",
        problem: "You don't know where.",
        insight: "No tracking.",
        solution: "Track daily.",
        closure: "Awareness wins.",
        cta: "Follow.",
      },
      {
        hook: "Salary comes… gone fast…",
        problem: "No control.",
        insight: "Habits bad.",
        solution: "Fix spending.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 82,
    topic: "Credit Card Misuse",
    reels: [
      {
        hook: "Using credit card wrong?",
        problem: "Debt grows.",
        insight: "Interest trap.",
        solution: "Pay full.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
      {
        hook: "Swipe feels easy…",
        problem: "Payment hurts.",
        insight: "Trap system.",
        solution: "Control usage.",
        closure: "Stay smart.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 83,
    topic: "Saving Alone is Not Enough",
    reels: [
      {
        hook: "Saving alone won't grow wealth…",
        problem: "No growth.",
        insight: "Inflation eats money.",
        solution: "Invest.",
        closure: "Multiply money.",
        cta: "Follow.",
      },
      {
        hook: "Money sitting idle…",
        problem: "Losing value.",
        insight: "Time matters.",
        solution: "Invest early.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 84,
    topic: "Too Many EMIs",
    reels: [
      {
        hook: "Too many EMIs?",
        problem: "Future locked.",
        insight: "Income already spent.",
        solution: "Reduce loans.",
        closure: "Stay free.",
        cta: "Follow.",
      },
      {
        hook: "Every EMI adds pressure…",
        problem: "No flexibility.",
        insight: "Debt trap.",
        solution: "Cut liabilities.",
        closure: "Gain control.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 85,
    topic: "Salary Illusion",
    reels: [
      {
        hook: "Your salary is lying…",
        problem: "False security.",
        insight: "Can stop anytime.",
        solution: "Build backup.",
        closure: "Stay ready.",
        cta: "Follow.",
      },
      {
        hook: "Monthly income feels safe…",
        problem: "But risky.",
        insight: "One change ends it.",
        solution: "Diversify income.",
        closure: "Be secure.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 86,
    topic: "Late Investing Mistake",
    reels: [
      {
        hook: "Starting late?",
        problem: "Time lost.",
        insight: "Compounding missed.",
        solution: "Start now.",
        closure: "No more delay.",
        cta: "Follow.",
      },
      {
        hook: "You keep delaying…",
        problem: "Big loss.",
        insight: "Time is key.",
        solution: "Act today.",
        closure: "Grow early.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 87,
    topic: "Spending Blindly",
    reels: [
      {
        hook: "You spend without thinking…",
        problem: "No awareness.",
        insight: "Habit issue.",
        solution: "Pause before buying.",
        closure: "Control spending.",
        cta: "Follow.",
      },
      {
        hook: "Daily spending…",
        problem: "No tracking.",
        insight: "Money leaks.",
        solution: "Fix habits.",
        closure: "Save more.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 88,
    topic: "No Emergency Backup",
    reels: [
      {
        hook: "One emergency…",
        problem: "Life disturbed.",
        insight: "No backup.",
        solution: "Build fund.",
        closure: "Stay ready.",
        cta: "Follow.",
      },
      {
        hook: "Unexpected events…",
        problem: "Financial stress.",
        insight: "Savings missing.",
        solution: "Prepare early.",
        closure: "Be safe.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 89,
    topic: "Lifestyle Inflation Trap",
    reels: [
      {
        hook: "Income increased…",
        problem: "Expenses increased.",
        insight: "Lifestyle inflation.",
        solution: "Control upgrades.",
        closure: "Grow wealth.",
        cta: "Follow.",
      },
      {
        hook: "More money…",
        problem: "More spending.",
        insight: "Cycle trap.",
        solution: "Stay disciplined.",
        closure: "Save more.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 90,
    topic: "Debt Stress Cycle",
    reels: [
      {
        hook: "Debt creates stress…",
        problem: "Never ending.",
        insight: "Interest grows.",
        solution: "Clear high interest.",
        closure: "Stay free.",
        cta: "Follow.",
      },
      {
        hook: "Loan pressure daily…",
        problem: "Mental stress.",
        insight: "Debt trap.",
        solution: "Reduce loans.",
        closure: "Live better.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 91,
    topic: "Money Habits Matter",
    reels: [
      {
        hook: "Your habits decide money…",
        problem: "Not salary.",
        insight: "Daily actions.",
        solution: "Fix routine.",
        closure: "Grow wealth.",
        cta: "Follow.",
      },
      {
        hook: "Bad habits…",
        problem: "No growth.",
        insight: "Consistency needed.",
        solution: "Build discipline.",
        closure: "Win daily.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 92,
    topic: "Zero Savings Risk",
    reels: [
      {
        hook: "Zero savings?",
        problem: "High risk.",
        insight: "No safety.",
        solution: "Start saving.",
        closure: "Be secure.",
        cta: "Follow.",
      },
      {
        hook: "No backup…",
        problem: "One problem = collapse.",
        insight: "Dangerous life.",
        solution: "Build fund.",
        closure: "Stay safe.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 93,
    topic: "Costly Financial Mistakes",
    reels: [
      {
        hook: "One mistake costs lakhs…",
        problem: "Ignoring money.",
        insight: "Time lost.",
        solution: "Act early.",
        closure: "Avoid regret.",
        cta: "Follow.",
      },
      {
        hook: "You delay decisions…",
        problem: "Big loss.",
        insight: "Time matters.",
        solution: "Start now.",
        closure: "Grow faster.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 94,
    topic: "Control Your Money",
    reels: [
      {
        hook: "Control money…",
        problem: "Or stay broke.",
        insight: "Habits matter.",
        solution: "Plan spending.",
        closure: "Freedom comes.",
        cta: "Follow.",
      },
      {
        hook: "Money controls you…",
        problem: "If careless.",
        insight: "Awareness missing.",
        solution: "Take charge.",
        closure: "Win control.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 95,
    topic: "30 Day Money Tracking",
    reels: [
      {
        hook: "Do this for 30 days…",
        problem: "Track everything.",
        insight: "Awareness grows.",
        solution: "Write daily.",
        closure: "Control improves.",
        cta: "Follow.",
      },
      {
        hook: "Tracking changes life…",
        problem: "You ignore it.",
        insight: "Numbers matter.",
        solution: "Start today.",
        closure: "Stay aware.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 96,
    topic: "Rich vs Broke Difference",
    reels: [
      {
        hook: "Rich vs broke…",
        problem: "Thinking gap.",
        insight: "Habits differ.",
        solution: "Learn mindset.",
        closure: "Change thinking.",
        cta: "Follow.",
      },
      {
        hook: "Same income…",
        problem: "Different results.",
        insight: "Behavior matters.",
        solution: "Fix habits.",
        closure: "Grow smarter.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 97,
    topic: "Money is Emotional",
    reels: [
      {
        hook: "Money is emotional…",
        problem: "Not logical.",
        insight: "Decisions flawed.",
        solution: "Stay disciplined.",
        closure: "Think clearly.",
        cta: "Follow.",
      },
      {
        hook: "You spend emotionally…",
        problem: "Then regret.",
        insight: "Impulse issue.",
        solution: "Pause first.",
        closure: "Control emotions.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 98,
    topic: "Income vs Expenses",
    reels: [
      {
        hook: "Income is not problem…",
        problem: "Expenses are.",
        insight: "Lifestyle issue.",
        solution: "Cut costs.",
        closure: "Save more.",
        cta: "Follow.",
      },
      {
        hook: "You earn enough…",
        problem: "Spend too much.",
        insight: "Balance missing.",
        solution: "Control spending.",
        closure: "Stay stable.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 99,
    topic: "Financial Reset",
    reels: [
      {
        hook: "Restart finances today…",
        problem: "You're stuck.",
        insight: "Change possible.",
        solution: "Reset habits.",
        closure: "Start fresh.",
        cta: "Follow.",
      },
      {
        hook: "Bad past decisions…",
        problem: "Don't matter now.",
        insight: "Future open.",
        solution: "Take control.",
        closure: "Move ahead.",
        cta: "Follow.",
      },
    ],
  },
  {
    id: 100,
    topic: "Final Wake Up Call",
    reels: [
      {
        hook: "Ignore this… regret later.",
        problem: "No planning.",
        insight: "Time won't wait.",
        solution: "Start now.",
        closure: "Future depends today.",
        cta: "Follow.",
      },
      {
        hook: "You think there's time…",
        problem: "There isn't much.",
        insight: "Delay costs.",
        solution: "Act fast.",
        closure: "Win early.",
        cta: "Follow.",
      },
    ],
  },
];

function reelToLines(reel: Reel): string[] {
  return [
    reel.hook,
    reel.problem,
    reel.insight,
    reel.solution,
    reel.closure,
    reel.cta,
  ];
}

export default function App() {
  const [topic, setTopic] = useState("");
  const [content, setContent] = useState("");
  const [scriptLines, setScriptLines] = useState<string[]>(SAMPLE_LINES);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [reelKey, setReelKey] = useState(0);
  const [scriptGenerated, setScriptGenerated] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topicPage, setTopicPage] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const [isCanvasPlaying, setIsCanvasPlaying] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const bgAudioCtxRef = useRef<AudioContext | null>(null);
  const bgMusicIntervalRef = useRef<number | null>(null);

  const speakLine = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel")),
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 0.95;
    utter.pitch = 1;
    utter.volume = 1;
    speechRef.current = utter;
    window.speechSynthesis.speak(utter);
  };

  const speakLineRef = useRef(speakLine);
  speakLineRef.current = speakLine;
  const handleLineChange = useCallback(
    (lineIndex: number) => {
      if (!isSpeakingRef.current) return;
      const line = scriptLines[lineIndex];
      if (line) speakLineRef.current(line);
    },
    [scriptLines],
  );

  // ── Background Music: 3 rotating styles ──────────────────
  // Style 0: Calm ambient (long sine pads, slow movement)
  // Style 1: Slightly emotional (piano-like sine+triangle, minor feel)
  // Style 2: Light motivational (subtle rhythmic pulse)
  const bgMusicStyleRef = useRef<number>(0);

  const startBgMusic = () => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
    if (bgAudioCtxRef.current) {
      try {
        bgAudioCtxRef.current.close();
      } catch {
        /* ignore */
      }
      bgAudioCtxRef.current = null;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    bgAudioCtxRef.current = ctx;

    // Randomly select one style per reel
    const style = Math.floor(Math.random() * 3);
    bgMusicStyleRef.current = style;

    // Master gain — music always at 30% so voice is dominant
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Soft low-pass filter to keep everything non-distracting
    const lpf = ctx.createBiquadFilter();
    lpf.type = "lowpass";
    lpf.frequency.setValueAtTime(1200, ctx.currentTime);
    lpf.connect(masterGain);

    const scheduleNote = (
      time: number,
      freq: number,
      duration: number,
      type: OscillatorType,
      peakVol: number,
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(0, time);
      gain.gain.linearRampToValueAtTime(
        peakVol,
        time + Math.min(0.5, duration * 0.25),
      );
      gain.gain.linearRampToValueAtTime(peakVol * 0.7, time + duration * 0.7);
      gain.gain.linearRampToValueAtTime(0, time + duration);
      osc.connect(gain);
      gain.connect(lpf);
      osc.start(time);
      osc.stop(time + duration + 0.05);
    };

    let loopDuration = 8;

    if (style === 0) {
      // ── Style 0: Calm ambient — long, slow sine pads ────────
      // C major: C4 E4 G4 played slowly as drones
      const ambientNotes = [261.63, 329.63, 392.0, 523.25];
      const noteDur = 4.0;
      const scheduleLoop = (startTime: number) => {
        ambientNotes.forEach((freq, i) => {
          scheduleNote(startTime + i * 0.6, freq, noteDur, "sine", 0.08);
        });
        // Soft bass pad
        scheduleNote(startTime, 130.81, noteDur * 2, "sine", 0.1);
      };
      loopDuration = 4;
      scheduleLoop(ctx.currentTime);
      scheduleLoop(ctx.currentTime + loopDuration);
      bgMusicIntervalRef.current = window.setInterval(() => {
        if (bgAudioCtxRef.current === ctx && ctx.state !== "closed") {
          scheduleLoop(ctx.currentTime + loopDuration);
        }
      }, loopDuration * 1000);
    } else if (style === 1) {
      // ── Style 1: Emotional piano — sine+triangle, minor chord feel ──
      // Am - F - C - G (soft piano simulation)
      const progressions = [
        { freqs: [220.0, 261.63, 329.63], dur: 2.2 }, // Am
        { freqs: [174.61, 220.0, 261.63], dur: 2.2 }, // F
        { freqs: [261.63, 329.63, 392.0], dur: 2.2 }, // C
        { freqs: [196.0, 246.94, 293.66], dur: 2.2 }, // G
      ];
      loopDuration = progressions.reduce((s, c) => s + c.dur, 0);
      const scheduleLoop = (startTime: number) => {
        let t = startTime;
        for (const chord of progressions) {
          for (const freq of chord.freqs) {
            scheduleNote(t, freq, chord.dur, "sine", 0.07);
            // Add triangle layer half a beat later for "piano" attack
            scheduleNote(t + 0.05, freq, chord.dur * 0.6, "triangle", 0.04);
          }
          // Soft bass note
          scheduleNote(t, chord.freqs[0] / 2, chord.dur, "sine", 0.09);
          t += chord.dur;
        }
      };
      scheduleLoop(ctx.currentTime);
      scheduleLoop(ctx.currentTime + loopDuration);
      bgMusicIntervalRef.current = window.setInterval(() => {
        if (bgAudioCtxRef.current === ctx && ctx.state !== "closed") {
          scheduleLoop(ctx.currentTime + loopDuration);
        }
      }, loopDuration * 1000);
    } else {
      // ── Style 2: Light motivational — subtle rhythmic pulse ──
      // C major pentatonic, gentle off-beat pulse pattern
      const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0];
      const stepDur = 0.5;
      const pattern = [0, 2, 4, 2, 1, 3, 4, 3]; // indices into pentatonic
      loopDuration = pattern.length * stepDur;
      const scheduleLoop = (startTime: number) => {
        pattern.forEach((noteIdx, i) => {
          const freq = pentatonic[noteIdx];
          // Alternating octaves for gentle rhythm feel
          const octave = i % 3 === 0 ? 0.5 : 1;
          scheduleNote(
            startTime + i * stepDur,
            freq * octave,
            stepDur * 0.8,
            "sine",
            0.07,
          );
          // Very soft harmonic
          scheduleNote(
            startTime + i * stepDur,
            freq * 1.5 * octave,
            stepDur * 0.5,
            "sine",
            0.025,
          );
        });
        // Bass pulse every beat
        for (let b = 0; b < 4; b++) {
          scheduleNote(
            startTime + b * stepDur,
            130.81,
            stepDur * 0.6,
            "sine",
            0.08,
          );
        }
      };
      scheduleLoop(ctx.currentTime);
      scheduleLoop(ctx.currentTime + loopDuration);
      bgMusicIntervalRef.current = window.setInterval(() => {
        if (bgAudioCtxRef.current === ctx && ctx.state !== "closed") {
          scheduleLoop(ctx.currentTime + loopDuration);
        }
      }, loopDuration * 1000);
    }
  };

  const stopBgMusic = (fadeDuration = 0.75) => {
    if (bgMusicIntervalRef.current) {
      clearInterval(bgMusicIntervalRef.current);
      bgMusicIntervalRef.current = null;
    }
    if (bgAudioCtxRef.current) {
      const ctx = bgAudioCtxRef.current;
      try {
        // Route everything through a fade-out gain for smooth ending
        const fadeGain = ctx.createGain();
        fadeGain.gain.setValueAtTime(1, ctx.currentTime);
        fadeGain.gain.linearRampToValueAtTime(
          0,
          ctx.currentTime + fadeDuration,
        );
        fadeGain.connect(ctx.destination);
      } catch {
        /* ignore */
      }
      const closeDelay = Math.ceil((fadeDuration + 0.1) * 1000);
      setTimeout(() => {
        if (bgAudioCtxRef.current === ctx) {
          ctx.close().catch(() => {});
          bgAudioCtxRef.current = null;
        }
      }, closeDelay);
    }
  };

  const stopVoice = () => {
    stopBgMusic();
    window.speechSynthesis.cancel();
    isSpeakingRef.current = false;
    setIsSpeaking(false);
  };

  const startVoiceWithCanvas = (lines: string[]) => {
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    startBgMusic();
    // canvas onLineChange(0) fires right when animation starts and will speak line 0
    // If canvas not playing, speak sequentially as fallback
    if (!isCanvasPlaying && lines.length > 0) {
      speakLine(lines[0]);
      const speakNext = (index: number) => {
        if (!isSpeakingRef.current) return;
        if (index >= lines.length) {
          isSpeakingRef.current = false;
          setIsSpeaking(false);
          return;
        }
        const utter = new SpeechSynthesisUtterance(lines[index]);
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find(
            (v) =>
              v.lang.startsWith("en") &&
              (v.name.includes("Google") ||
                v.name.includes("Natural") ||
                v.name.includes("Samantha") ||
                v.name.includes("Daniel")),
          ) ||
          voices.find((v) => v.lang.startsWith("en")) ||
          voices[0];
        if (preferred) utter.voice = preferred;
        utter.rate = 0.95;
        utter.pitch = 1;
        utter.volume = 1;
        utter.onend = () => {
          setTimeout(() => speakNext(index + 1), 750);
        };
        utter.onerror = () => {
          setTimeout(() => speakNext(index + 1), 750);
        };
        window.speechSynthesis.speak(utter);
      };
      if (lines.length > 1) {
        const firstUtter = speechRef.current;
        if (firstUtter) {
          firstUtter.onend = () => {
            setTimeout(() => speakNext(1), 750);
          };
          firstUtter.onerror = () => {
            setTimeout(() => speakNext(1), 750);
          };
        }
      }
    }
  };

  const generateScript = useGenerateScript();

  const totalTopicPages = Math.ceil(TOPICS_DATA.length / TOPICS_PER_PAGE);
  const visibleTopics = TOPICS_DATA.slice(
    topicPage * TOPICS_PER_PAGE,
    (topicPage + 1) * TOPICS_PER_PAGE,
  );

  // ──────────────────────────────────────────────────────────
  // Select topic — pick random reel
  // ──────────────────────────────────────────────────────────
  const handleSelectTopic = (topicData: TopicData) => {
    const randomIndex = Math.floor(Math.random() * topicData.reels.length);
    const reel = topicData.reels[randomIndex];
    const lines = reelToLines(reel);
    setSelectedTopicId(topicData.id);
    setScriptLines(lines);
    setScriptGenerated(true);
    setReelKey((k) => k + 1);
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setAutoPlay(true);
    toast.success(`"${topicData.topic}" reel ready!`);
  };

  // ──────────────────────────────────────────────────────────
  // Generate Script (AI) — uses topic input
  // ──────────────────────────────────────────────────────────
  const handleGenerateScript = async () => {
    if (!topic.trim()) {
      toast.error("Enter a topic first");
      return;
    }
    try {
      const lines = await generateScript.mutateAsync(topic.trim());
      setScriptLines(lines);
      setScriptGenerated(true);
      setSelectedTopicId(null);
      setReelKey((k) => k + 1);
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setAutoPlay(true);
      toast.success("Script ready! Starting preview...");
    } catch {
      const fallback = [
        `Here's the truth about ${topic}.`,
        "Most people get this completely wrong.",
        `Understanding ${topic} can change your finances.`,
        "Take one small step today — start now.",
        "Knowledge is the best investment you'll make.",
        "Follow Money Intelligence India for more insights",
      ];
      setScriptLines(fallback);
      setScriptGenerated(true);
      setSelectedTopicId(null);
      setReelKey((k) => k + 1);
      isSpeakingRef.current = true;
      setIsSpeaking(true);
      setAutoPlay(true);
      toast.success("Script ready! Starting preview...");
    }
  };

  // ──────────────────────────────────────────────────────────
  // Use My Script — takes user input DIRECTLY, no AI
  // ──────────────────────────────────────────────────────────
  const handleUseMyScript = () => {
    if (!content.trim()) {
      toast.error("Enter your script first");
      return;
    }
    const lines = formatToScript(content.trim());
    setScriptLines(lines);
    setScriptGenerated(true);
    setSelectedTopicId(null);
    setReelKey((k) => k + 1);
    isSpeakingRef.current = true;
    setIsSpeaking(true);
    setAutoPlay(true);
    toast.success("Your script is ready! Starting preview...");
  };

  const handleEditLine = (i: number) => {
    setEditingIndex(i);
    setEditValue(scriptLines[i]);
  };

  const handleSaveEdit = () => {
    if (editingIndex === null) return;
    const updated = [...scriptLines];
    updated[editingIndex] = editValue;
    setScriptLines(updated);
    setEditingIndex(null);
    setReelKey((k) => k + 1);
  };

  const isLoading = generateScript.isPending;

  return (
    <div className="min-h-screen" style={{ background: "#070A12" }}>
      <Toaster position="top-center" />

      {/* Gold Brand Bar */}
      <div
        className="w-full text-center py-2 text-xs font-bold tracking-widest"
        style={{
          background:
            "linear-gradient(90deg, #C9A227, #E1C15A, #FFD700, #E1C15A, #C9A227)",
          color: "#070A12",
        }}
      >
        ✦ MONEY INTELLIGENCE INDIA ✦
      </div>

      {/* Sticky Header */}
      <header
        className="sticky top-0 z-50 w-full px-3 py-2.5 flex items-center justify-between"
        style={{
          background: "rgba(7, 10, 18, 0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #222C3C",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#E1C15A" }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#070A12" }} />
          </div>
          <span className="font-bold text-base tracking-tight gold-text">
            M.I. REEL MACHINE
          </span>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-primary/40 text-primary shrink-0"
        >
          9:16
        </Badge>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-3 py-4">
        {/* Input Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className="rounded-2xl p-4 card-glow"
            style={{ background: "#121A24", border: "1px solid #222C3C" }}
          >
            <h2
              className="font-bold text-base mb-0.5"
              style={{ color: "#F2F4F8" }}
            >
              Create Your Reel
            </h2>
            <p className="text-xs mb-4" style={{ color: "#A6AFBF" }}>
              Pick a topic or paste your own script → Preview &amp; Download
            </p>

            <Tabs defaultValue="topics">
              <TabsList
                className="w-full mb-4 p-1"
                style={{ background: "#0B1220", border: "1px solid #222C3C" }}
                data-ocid="input.tab"
              >
                <TabsTrigger
                  value="topics"
                  className="flex-1 font-semibold text-sm data-[state=active]:text-primary-foreground"
                  data-ocid="input.topics.tab"
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Topics
                </TabsTrigger>
                <TabsTrigger
                  value="topic"
                  className="flex-1 font-semibold text-sm data-[state=active]:text-primary-foreground"
                  data-ocid="input.topic.tab"
                >
                  <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                  AI Script
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="flex-1 font-semibold text-sm"
                  data-ocid="input.content.tab"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  My Script
                </TabsTrigger>
              </TabsList>

              {/* ── Topics Tab ── */}
              <TabsContent value="topics" className="space-y-2">
                <p className="text-xs mb-3" style={{ color: "#A6AFBF" }}>
                  Select a topic — a reel script will be picked instantly.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {visibleTopics.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTopic(t)}
                      className="text-left px-3 py-3 rounded-xl transition-all text-sm font-medium min-h-[52px] flex items-center justify-between gap-2"
                      style={{
                        background:
                          selectedTopicId === t.id
                            ? "rgba(225,193,90,0.15)"
                            : "#0B1220",
                        border:
                          selectedTopicId === t.id
                            ? "1px solid #E1C15A88"
                            : "1px solid #222C3C",
                        color: selectedTopicId === t.id ? "#E1C15A" : "#F2F4F8",
                      }}
                    >
                      <span>{t.topic}</span>
                      {t.reels.length > 1 && (
                        <span
                          className="text-xs shrink-0 px-1.5 py-0.5 rounded-full"
                          style={{
                            background: "rgba(225,193,90,0.12)",
                            color: "#E1C15A",
                            border: "1px solid #E1C15A33",
                          }}
                        >
                          {t.reels.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalTopicPages > 1 && (
                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setTopicPage((p) => p - 1)}
                      disabled={topicPage === 0}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: "#0B1220",
                        border: "1px solid #222C3C",
                        color: "#F2F4F8",
                      }}
                      data-ocid="topics.pagination_prev"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <span className="text-xs" style={{ color: "#A6AFBF" }}>
                      Page {topicPage + 1} of {totalTopicPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setTopicPage((p) => p + 1)}
                      disabled={topicPage >= totalTopicPages - 1}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        background: "#0B1220",
                        border: "1px solid #222C3C",
                        color: "#F2F4F8",
                      }}
                      data-ocid="topics.pagination_next"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </TabsContent>

              {/* ── Topic Tab (AI) ── */}
              <TabsContent value="topic" className="space-y-3">
                <Input
                  id="topic-input"
                  placeholder="e.g. Save 20% of your salary"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateScript()}
                  className="text-base h-12 py-3 px-4 text-foreground"
                  style={{
                    background: "#0B1220",
                    border: "1px solid #222C3C",
                    fontSize: "16px",
                  }}
                  data-ocid="topic.input"
                />
                {/* Quick chips */}
                <div className="flex flex-wrap gap-2">
                  {[
                    "Save 20% salary",
                    "EMI trap",
                    "Mutual funds SIP",
                    "Emergency fund",
                  ].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setTopic(s)}
                      className="flex items-center py-2 px-4 rounded-full transition-colors text-sm min-h-[44px]"
                      style={{
                        background:
                          topic === s ? "rgba(225,193,90,0.15)" : "#1A2535",
                        border:
                          topic === s
                            ? "1px solid #E1C15A88"
                            : "1px solid #2A3850",
                        color: topic === s ? "#E1C15A" : "#A6AFBF",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <Button
                  onClick={handleGenerateScript}
                  disabled={isLoading || !topic.trim()}
                  className="w-full font-bold h-14 text-base mt-1"
                  style={{ background: "#E1C15A", color: "#070A12" }}
                  data-ocid="topic.submit_button"
                >
                  {generateScript.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Script...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate Script
                    </>
                  )}
                </Button>
              </TabsContent>

              {/* ── My Script Tab ── */}
              <TabsContent value="content" className="space-y-3">
                <p className="text-xs" style={{ color: "#A6AFBF" }}>
                  Paste your content below. It will be split into reel-ready
                  lines exactly as written — no AI changes.
                </p>
                <Textarea
                  id="content-textarea"
                  placeholder="Paste your script here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="resize-none text-foreground"
                  style={{
                    background: "#0B1220",
                    border: "1px solid #222C3C",
                    fontSize: "16px",
                  }}
                  data-ocid="content.textarea"
                />
                <Button
                  onClick={handleUseMyScript}
                  disabled={!content.trim()}
                  className="w-full font-bold h-14 text-base"
                  style={{ background: "#E1C15A", color: "#070A12" }}
                  data-ocid="content.submit_button"
                >
                  <Pencil className="w-5 h-5 mr-2" />
                  Use My Script → Preview
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>

        {/* Reel Preview */}
        <AnimatePresence>
          {scriptGenerated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div
                className="rounded-2xl p-4 card-glow"
                style={{ background: "#121A24", border: "1px solid #222C3C" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2
                      className="font-bold text-base"
                      style={{ color: "#F2F4F8" }}
                    >
                      Reel Preview
                    </h2>
                    <p className="text-xs" style={{ color: "#A6AFBF" }}>
                      9:16 vertical · 1080×1920 export
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isSpeaking ? (
                      <button
                        type="button"
                        onClick={() => startVoiceWithCanvas(scriptLines)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: "#1A4B3A",
                          color: "#4ADE80",
                          border: "1px solid #2D7A5A",
                        }}
                        data-ocid="voice.primary_button"
                      >
                        🔊 Play Voice
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopVoice}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: "#3A1A1A",
                          color: "#F87171",
                          border: "1px solid #7A2D2D",
                        }}
                        data-ocid="voice.secondary_button"
                      >
                        ⏹ Stop Voice
                      </button>
                    )}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs" style={{ color: "#A6AFBF" }}>
                        Live
                      </span>
                    </div>
                  </div>
                </div>
                <ReelCanvas
                  key={reelKey}
                  lines={scriptLines}
                  autoPlay={autoPlay}
                  onAutoPlayStarted={() => {
                    setAutoPlay(false);
                    setIsCanvasPlaying(true);
                  }}
                  onLineChange={handleLineChange}
                  onPlayComplete={() => setIsCanvasPlaying(false)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Script Lines Editor */}
        <AnimatePresence mode="wait">
          {scriptLines.length > 0 && (
            <motion.div
              key={reelKey}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 rounded-2xl p-4 card-glow"
              style={{ background: "#121A24", border: "1px solid #222C3C" }}
              data-ocid="script.panel"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm" style={{ color: "#F2F4F8" }}>
                  Script Lines
                  <span
                    className="ml-2 text-xs font-normal"
                    style={{ color: "#A6AFBF" }}
                  >
                    (tap to edit)
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    stopVoice();
                    setScriptLines(SAMPLE_LINES);
                    setSelectedTopicId(null);
                    setReelKey((k) => k + 1);
                  }}
                  className="flex items-center gap-1 text-xs transition-colors"
                  style={{ color: "#A6AFBF" }}
                  data-ocid="script.secondary_button"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              </div>

              <div className="space-y-2">
                {scriptLines.map((line, i) => {
                  const labelInfo = STRUCTURE_LABELS[i] || STRUCTURE_LABELS[5];
                  const isCTA = i === scriptLines.length - 1;

                  return (
                    <div
                      key={`${reelKey}-${line.slice(0, 20)}-${i}`}
                      className="flex gap-2 items-start"
                      data-ocid={`script.item.${i + 1}`}
                    >
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full mt-1 shrink-0"
                        style={{
                          background: `${labelInfo.color}22`,
                          color: labelInfo.color,
                          border: `1px solid ${labelInfo.color}44`,
                        }}
                      >
                        {labelInfo.label}
                      </span>

                      {editingIndex === i ? (
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleSaveEdit()
                            }
                            autoFocus
                            className="flex-1 text-sm"
                            style={{
                              background: "#0B1220",
                              border: "1px solid #E1C15A",
                              fontSize: "16px",
                            }}
                            data-ocid="script.input"
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveEdit}
                            className="h-10 w-10 p-0"
                            style={{ background: "#E1C15A", color: "#070A12" }}
                            data-ocid="script.save_button"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleEditLine(i)}
                          className="flex-1 text-left text-sm px-3 py-3 rounded-lg transition-colors hover:opacity-80 min-h-[52px] flex items-center"
                          style={{
                            background: isCTA
                              ? "rgba(225,193,90,0.1)"
                              : "#0B1220",
                            border: isCTA
                              ? "1px solid #E1C15A44"
                              : "1px solid #222C3C",
                            color: isCTA ? "#E1C15A" : "#F2F4F8",
                            fontWeight: isCTA ? 700 : 400,
                          }}
                          data-ocid={`script.edit_button.${i + 1}`}
                        >
                          {line}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer
        className="mt-10 pb-8 text-center px-4"
        style={{ borderTop: "1px solid #222C3C", paddingTop: "1.5rem" }}
      >
        <p className="text-xs" style={{ color: "#A6AFBF" }}>
          © {new Date().getFullYear()}. Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
            style={{ color: "#E1C15A" }}
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
