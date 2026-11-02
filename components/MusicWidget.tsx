"use client";

import { useState } from "react";
import type { MusicItem } from "@/lib/types";

// 网易云外链播放器（官方 outchain iframe，零注册、无需 key）
function playerUrl(id: string): string {
  return `https://music.163.com/outchain/player?type=2&id=${encodeURIComponent(id)}&auto=1&height=66&frame=borderless`;
}

export default function MusicWidget({ playlist }: { playlist: MusicItem[] }) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(0);

  if (playlist.length === 0) return null;
  const song = playlist[Math.min(current, playlist.length - 1)];

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col items-start gap-2">
      {open ? (
        <div className="glass w-72 p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">♪ 博主的歌单</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="关闭音乐"
              className="text-slate-400 transition hover:text-slate-600"
            >
              ✕
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto pr-1">
            {playlist.map((item, i) => (
              <button
                key={`${item.id}-${i}`}
                onClick={() => setCurrent(i)}
                className={`block w-full truncate rounded-lg px-2 py-1 text-left text-xs transition ${
                  i === current
                    ? "bg-sky-500/15 font-semibold text-sky-600 dark:text-sky-300"
                    : "text-slate-500 hover:bg-white/50 dark:text-slate-400 dark:hover:bg-white/10"
                }`}
              >
                {i + 1}. {item.title} - {item.artist}
              </button>
            ))}
          </div>
          <iframe
            key={song.id}
            src={playerUrl(song.id)}
            className="mt-2 w-full rounded-lg border-0"
            height="86"
            allow="autoplay; encrypted-media"
            loading="lazy"
            title={`正在播放 ${song.title}`}
          />
        </div>
      ) : null}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="打开音乐播放器"
        className="glass glass-hover flex h-11 w-11 items-center justify-center text-lg"
        title="博主的 BGM"
      >
        🎵
      </button>
    </div>
  );
}
