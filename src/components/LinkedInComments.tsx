"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: string;
  user_name: string;
  content: string;
  created_at: string;
};

export default function LinkedInComments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch comments from Supabase
  useEffect(() => {
    async function fetchComments() {
      const { data, error } = await supabase
        .from("blog_comments")
        .select("*")
        .eq("post_slug", slug)
        .order("created_at", { ascending: false });

      if (data) {
        setComments(data);
      }
      setIsLoading(false);
    }
    fetchComments();
  }, [slug]);

  const handlePost = async () => {
    if (!newComment.trim()) return;

    // Optimistic UI update
    const optimisticComment: Comment = {
      id: Date.now().toString(),
      user_name: userName,
      content: newComment,
      created_at: new Date().toISOString(),
    };
    setComments([optimisticComment, ...comments]);
    setNewComment("");

    // Write to Supabase
    await supabase.from("blog_comments").insert([
      {
        post_slug: slug,
        user_name: userName,
        content: newComment,
      },
    ]);
  };

  return (
    <div className="mt-16 pt-8 border-t border-neutral-800">
      <h2 className="text-2xl font-bold text-white mb-6">Discussion</h2>
      
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
        
        {/* Name Input */}
        <div className="mb-4">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Your Name (Optional)"
            className="bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-emerald-500 w-full max-w-xs"
          />
        </div>

        {/* Input Area */}
        <div className="flex gap-4 mb-8">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 text-emerald-400 font-bold uppercase">
            {userName.charAt(0) || "G"}
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
        {isLoading ? (
          <p className="text-neutral-500 text-sm">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-neutral-500 text-sm">No comments yet. Be the first to start the discussion!</p>
        ) : (
          <div className="flex flex-col gap-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-700 text-neutral-400 uppercase font-bold text-sm">
                  {comment.user_name.charAt(0)}
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="bg-neutral-950/50 border border-neutral-800 rounded-2xl p-4 rounded-tl-none">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-neutral-200">{comment.user_name}</h4>
                        <p className="text-xs text-neutral-500">Reader</p>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-300 mt-3">{comment.content}</p>
                  </div>
                  
                  {/* Static Reaction Bar (Mockup for now) */}
                  <div className="flex items-center gap-1 mt-1 px-2">
                    <ReactionButton icon="👍" label="Like" />
                    <ReactionButton icon="👏" label="Celebrate" />
                    <ReactionButton icon="❤️" label="Support" />
                    <ReactionButton icon="💡" label="Insightful" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReactionButton({ icon, label }: { icon: string, label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200">
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
