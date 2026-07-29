import React, { useState } from 'react';
import { 
  Users, Flame, Trophy, Award, Dumbbell, MessageSquare, Heart, Sparkles, 
  Plus, Send, Share2, ThumbsUp, Filter, CheckCircle2, Zap, X, UserCheck
} from 'lucide-react';
import { SocialPost, PostComment, UserProfile } from '../types';
import { INITIAL_SOCIAL_POSTS } from '../data/mockPosts';

interface SocialFeedViewProps {
  userProfile: UserProfile;
}

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({ userProfile }) => {
  // Feed State
  const [posts, setPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('pulsefit_social_posts');
    return saved ? JSON.parse(saved) : INITIAL_SOCIAL_POSTS;
  });

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Forms State
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState<string>('');

  // Create Post Form State
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'PR Record' | 'Streak' | 'Volume' | 'Workout Finished'>('PR Record');
  const [newWorkoutName, setNewWorkoutName] = useState('Anabolic Hypertrophy Session');
  const [newCaption, setNewCaption] = useState('');
  const [newStat1Label, setNewStat1Label] = useState('Weight / Score');
  const [newStat1Value, setNewStat1Value] = useState('100 kg');
  const [newStat2Label, setNewStat2Label] = useState('Reps / Duration');
  const [newStat2Value, setNewStat2Value] = useState('10 Reps');

  // Save posts helper
  const savePostsToStorage = (updated: SocialPost[]) => {
    setPosts(updated);
    localStorage.setItem('pulsefit_social_posts', JSON.stringify(updated));
  };

  // Toggle Reaction on Post
  const handleToggleReaction = (postId: string, emojiKey: string) => {
    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;

      const currentReaction = post.reactions[emojiKey] || { count: 0, userReacted: false };
      const newUserReacted = !currentReaction.userReacted;
      const newCount = newUserReacted ? currentReaction.count + 1 : Math.max(0, currentReaction.count - 1);

      return {
        ...post,
        reactions: {
          ...post.reactions,
          [emojiKey]: {
            count: newCount,
            userReacted: newUserReacted
          }
        }
      };
    });

    savePostsToStorage(updatedPosts);
  };

  // Add Comment to Post
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: PostComment = {
      id: `comment-${Date.now()}`,
      authorName: userProfile.name || 'You (Athlete)',
      text: commentInput.trim(),
      timestamp: 'Just now'
    };

    const updatedPosts = posts.map((post) => {
      if (post.id !== postId) return post;
      return {
        ...post,
        comments: [...post.comments, newComment]
      };
    });

    savePostsToStorage(updatedPosts);
    setCommentInput('');
  };

  // Create & Share New Post
  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim() || !newCaption.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: userProfile.name || 'Athlete',
      authorBadge: 'PULSE ATHLETE',
      timestamp: 'Just now',
      milestoneTitle: newMilestoneTitle.trim(),
      milestoneCategory: newCategory,
      workoutName: newWorkoutName.trim(),
      statsHighlight: [
        { label: newStat1Label, value: newStat1Value },
        { label: newStat2Label, value: newStat2Value }
      ],
      caption: newCaption.trim(),
      reactions: {
        '🔥': { count: 1, userReacted: true },
        '💪': { count: 0, userReacted: false },
        '🏆': { count: 0, userReacted: false },
        '❤️': { count: 0, userReacted: false }
      },
      comments: []
    };

    savePostsToStorage([newPost, ...posts]);
    setIsNewPostOpen(false);
    setNewMilestoneTitle('');
    setNewCaption('');
  };

  // Filtered Posts
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'All') return true;
    return post.milestoneCategory === selectedCategory;
  });

  const categoryBadgeColors: Record<string, string> = {
    'PR Record': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'Streak': 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    'Volume': 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    'Workout Finished': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header Banner */}
      <div className="bento-card border-amber-500/30 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-500/10 to-rose-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-rose-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Athlete Social Feed
                </span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-100 mt-0.5">
                Friend Workout Milestones
              </h1>
            </div>
          </div>

          <button
            onClick={() => setIsNewPostOpen(true)}
            className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs px-3.5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>Share Milestone</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {['All', 'PR Record', 'Streak', 'Volume', 'Workout Finished'].map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition border ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md scale-105'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat === 'PR Record' && '🏋️‍♂️ '}
              {cat === 'Streak' && '🔥 '}
              {cat === 'Volume' && '⚡ '}
              {cat === 'Workout Finished' && '💪 '}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Social Posts List */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bento-card hover:border-slate-700 transition space-y-3.5 shadow-xl"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center space-x-3">
                {/* Author Avatar / Initial Badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  {post.authorName.charAt(0)}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-100">{post.authorName}</span>
                    {post.authorBadge && (
                      <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {post.authorBadge}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {post.timestamp} {post.workoutName ? `• ${post.workoutName}` : ''}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border ${categoryBadgeColors[post.milestoneCategory] || 'bg-slate-800 text-slate-300'}`}>
                {post.milestoneCategory}
              </span>
            </div>

            {/* Milestone Title & Stats Banner */}
            <div className="space-y-2.5">
              <h3 className="text-base font-black text-slate-100 leading-snug">
                {post.milestoneTitle}
              </h3>

              {post.statsHighlight && post.statsHighlight.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-center font-mono">
                  {post.statsHighlight.map((stat, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">{stat.label}</span>
                      <span className="text-xs font-black text-amber-400">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Caption */}
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {post.caption}
              </p>
            </div>

            {/* Reactions Bar */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5">
                {['🔥', '💪', '🏆', '❤️', '⚡'].map((emoji) => {
                  const r = post.reactions[emoji] || { count: 0, userReacted: false };
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(post.id, emoji)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1 transition border ${
                        r.userReacted
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm scale-105'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <span>{emoji}</span>
                      {r.count > 0 && <span className="font-mono text-[11px] ml-0.5">{r.count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Comment Toggle Button */}
              <button
                onClick={() => setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>{post.comments.length} Comments</span>
              </button>
            </div>

            {/* Comments Thread Section */}
            {openCommentPostId === post.id && (
              <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-fade-in">
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-200">{comment.authorName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{comment.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{comment.text}</p>
                    </div>
                  ))}

                  {post.comments.length === 0 && (
                    <p className="text-xs text-slate-500 italic py-1 text-center">No comments yet. Be the first to congratulate them!</p>
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Write a congratulatory comment..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Comment</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}

        {filteredPosts.length === 0 && (
          <div className="bento-card text-center py-12 space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-slate-300">No milestone posts in this category</h3>
            <p className="text-xs text-slate-500">Share your latest workout milestone to ignite the social feed!</p>
            <button
              onClick={() => setIsNewPostOpen(true)}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition shadow"
            >
              Share Milestone Now
            </button>
          </div>
        )}
      </div>

      {/* SHARE NEW MILESTONE POST MODAL */}
      {isNewPostOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-extrabold text-slate-100">Share Workout Milestone</h3>
              </div>
              <button
                onClick={() => setIsNewPostOpen(false)}
                className="p-1.5 rounded-xl bg-slate-950 text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePostSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[10px] uppercase">Milestone Type</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="PR Record">🏋️‍♂️ Personal Record (PR)</option>
                  <option value="Streak">🔥 Workout Streak</option>
                  <option value="Volume">⚡ Volume / Tonnage Milestone</option>
                  <option value="Workout Finished">💪 Completed Workout Session</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[10px] uppercase">Milestone Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NEW SQUAT RECORD: 160 KG 🏋️‍♂️"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[10px] uppercase">Workout Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Lower Body Hypertrophy"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Stat 1 Label & Value</label>
                  <input
                    type="text"
                    value={newStat1Label}
                    onChange={(e) => setNewStat1Label(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-[11px] text-slate-400 mb-1"
                  />
                  <input
                    type="text"
                    value={newStat1Value}
                    onChange={(e) => setNewStat1Value(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300 text-[10px] uppercase">Stat 2 Label & Value</label>
                  <input
                    type="text"
                    value={newStat2Label}
                    onChange={(e) => setNewStat2Label(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-[11px] text-slate-400 mb-1"
                  />
                  <input
                    type="text"
                    value={newStat2Value}
                    onChange={(e) => setNewStat2Value(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300 text-[10px] uppercase">Caption / Story</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell your friends how the session felt and what drove you..."
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-black text-xs py-3 rounded-xl transition shadow-lg mt-2"
              >
                Post Milestone to Social Feed
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
