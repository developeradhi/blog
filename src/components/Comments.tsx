"use client";

import Giscus from "@giscus/react";

export default function Comments() {
  return (
    <div className="mt-16 pt-8 border-t border-neutral-800">
      <h2 className="text-2xl font-bold text-white mb-6">Discussion</h2>
      <Giscus
        id="comments"
        repo="developeradhi/blog"
        repoId="R_kgDOMmX1XQ" 
        category="General"
        categoryId="DIC_kwDOMmX1Xc4Cg8P5"
        mapping="pathname"
        term="Welcome to @giscus/react component!"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme="transparent_dark"
        lang="en"
        loading="lazy"
      />
    </div>
  );
}
