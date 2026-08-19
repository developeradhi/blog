"use client";

import { useState } from "react";

type Comment = {
  id: string;
  author: string;
  role: string;
  content: string;
  time: string;
  reactions: { like: number; celebrate: number; support: number; insightful: number };
  replies: number;
};

const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "Mark Chen",
    role: "Full Stack Engineer",
    content: "Excellent post! The section on Next.js Static Exports was highly relevant and detailed. #Nextjs #WebDev",
    time: "3h • Edited",
    reactions: { like: 12, celebrate: 4, support: 2, insightful: 3 },
    replies: 6,
  },
  {
    id: "2",
    author: "Elena Rossi",
    role: "UI/UX Designer",
    content: "Thanks Adarsh! The dark mode styling tips were super helpful.",
    time: "2h",
    reactions: { like: 5, celebrate: 0, support: 1, insightful: 0 },
    replies: 0,
  }
];

export default function LinkedInComments() {
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [activeReactions, setActiveReactions] = useState<Record<string, string | null>>({});

  const handleReaction = (commentId: string, type: 'like' | 'celebrate' | 'support' | 'insightful') => {
    setActiveReactions(prev => ({
      ...prev,
      [commentId]: prev[commentId] === type ? null : type
    }));
  };

  const handlePost = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: "Guest User",
      role: "Software Enthusiast",
      content: newComment,
      time: "Just now",
      reactions: { like: 0, celebrate: 0, support: 0, insightful: 0 },
      replies: 0
    };
    setComments([comment, ...comments]);
    setNewComment("");
  };

  return (
    <div className="mt-16 pt-8 border-t border-neutral-800">
      <h2 className="text-2xl font-bold text-white mb-6">Comments</h2>
      
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
        {/* Input Area */}
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 text-emerald-400 font-bold">
            G
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-4 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all resize-none min-h-[100px]"
            />
            <div className="flex justify-end mt-3">
              <button 
                onClick={handlePost}
                className="bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold py-2 px-6 rounded-full text-sm transition-colors"
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Comments Feed */}
        <div className="flex flex-col gap-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0 border border-neutral-700"></div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 rounded-tl-none">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-200">{comment.author}</h4>
                      <p className="text-xs text-neutral-500">{comment.role}</p>
                    </div>
                    <span className="text-xs text-neutral-500">{comment.time}</span>
                  </div>
                  <p className="text-sm text-neutral-300 mt-3">{comment.content}</p>
                </div>
                
                {/* Reaction Bar */}
                <div className="flex items-center gap-1 mt-1 px-2">
                  <ReactionButton 
                    icon="👍" label="Like" 
                    active={activeReactions[comment.id] === 'like'} 
                    onClick={() => handleReaction(comment.id, 'like')} 
                  />
                  <ReactionButton 
                    icon="👏" label="Celebrate" 
                    active={activeReactions[comment.id] === 'celebrate'} 
                    onClick={() => handleReaction(comment.id, 'celebrate')} 
                  />
                  <ReactionButton 
                    icon="❤️" label="Support" 
                    active={activeReactions[comment.id] === 'support'} 
                    onClick={() => handleReaction(comment.id, 'support')} 
                  />
                  <ReactionButton 
                    icon="💡" label="Insightful" 
                    active={activeReactions[comment.id] === 'insightful'} 
                    onClick={() => handleReaction(comment.id, 'insightful')} 
                  />
                  
                  <span className="text-xs text-neutral-500 ml-auto flex gap-2">
                    <span>{Object.values(comment.reactions).reduce((a, b) => a + b, 0)} Reactions</span>
                    <span>•</span>
                    <span>{comment.replies} Replies</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReactionButton({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
