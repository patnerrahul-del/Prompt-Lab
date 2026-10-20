import React from 'react';

export default function App(): React.ReactElement {
  return (
    <div className="min-h-screen bg-background text-text-ivory flex flex-col items-center justify-center p-6">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-serif gold-gradient-text font-bold">
          AURUM PROMPTS
        </h1>
        <p className="text-text-muted text-sm md:text-base tracking-wide">
          Premium Luxury Prompt Vault & Curated AI Marketplace
        </p>
      </div>
    </div>
  );
}
