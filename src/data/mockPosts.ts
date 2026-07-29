import { SocialPost } from '../types';

export const INITIAL_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorName: 'Marcus Vance',
    authorBadge: 'PRO ATHLETE',
    timestamp: '2 hours ago',
    milestoneTitle: 'NEW PERSONAL RECORD: 140 KG BENCH PRESS 🏋️‍♂️',
    milestoneCategory: 'PR Record',
    workoutName: 'Upper Body Power & Hypertrophy',
    statsHighlight: [
      { label: 'Weight Lifted', value: '140 kg' },
      { label: 'Reps Completed', value: '3 Reps' },
      { label: '1RM Estimate', value: '151 kg' }
    ],
    caption: 'Smashed a huge personal record today after 6 weeks of dedicated strength block programming! Feeling unstoppable 💪⚡',
    reactions: {
      '🔥': { count: 18, userReacted: true },
      '💪': { count: 24, userReacted: false },
      '🏆': { count: 12, userReacted: false },
      '❤️': { count: 9, userReacted: false }
    },
    comments: [
      {
        id: 'c1',
        authorName: 'Elena Rostova',
        text: 'Absolute beast mode Marcus! Form looked rock solid ⚡',
        timestamp: '1 hour ago'
      },
      {
        id: 'c2',
        authorName: 'Dave Miller',
        text: 'Congrats brother! 150kg is right around the corner.',
        timestamp: '45 mins ago'
      }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Sarah Jenkins',
    authorBadge: 'STREAK MASTER',
    timestamp: '5 hours ago',
    milestoneTitle: '14-DAY CONSISTENT WORKOUT STREAK ACHIEVED 🔥',
    milestoneCategory: 'Streak',
    workoutName: 'Leg Day & Core Burner',
    statsHighlight: [
      { label: 'Active Days', value: '14 Days' },
      { label: 'Workouts Completed', value: '12 Sessions' },
      { label: 'Calories Burned', value: '6,450 kcal' }
    ],
    caption: 'Two full weeks without missing a single scheduled training session! Consistency beats intensity every time. Keep pushing team! 🙌',
    reactions: {
      '🔥': { count: 32, userReacted: false },
      '💪': { count: 15, userReacted: true },
      '🏆': { count: 8, userReacted: false },
      '❤️': { count: 21, userReacted: false }
    },
    comments: [
      {
        id: 'c3',
        authorName: 'Marcus Vance',
        text: 'Incredible discipline Sarah! Inspiring us all.',
        timestamp: '3 hours ago'
      }
    ]
  },
  {
    id: 'post-3',
    authorName: 'Dave Miller',
    authorBadge: 'VOLUME TITAN',
    timestamp: '1 day ago',
    milestoneTitle: '50,000 KG CUMULATIVE MONTHLY VOLUME MILESTONE 👑',
    milestoneCategory: 'Volume',
    workoutName: 'Full Body Compound Crusher',
    statsHighlight: [
      { label: 'Monthly Volume', value: '52,400 kg' },
      { label: 'Sets Logged', value: '184 Sets' },
      { label: 'Avg Heart Rate', value: '148 bpm' }
    ],
    caption: 'Crossed the 50 Ton mark for total volume moved this month! Big shoutout to the PulseFit live HR tracker for keeping me in optimal zone 4.',
    reactions: {
      '🔥': { count: 29, userReacted: false },
      '💪': { count: 31, userReacted: false },
      '🏆': { count: 19, userReacted: true },
      '❤️': { count: 14, userReacted: false }
    },
    comments: [
      {
        id: 'c4',
        authorName: 'Sarah Jenkins',
        text: '50 metric tons!! That is insane volume Dave! 🔥',
        timestamp: '18 hours ago'
      }
    ]
  }
];
