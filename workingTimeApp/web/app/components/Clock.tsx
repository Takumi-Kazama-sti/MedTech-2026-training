"use client";

import { useSyncExternalStore } from "react";
import { Typography } from "@mui/material";

function changedClock(onChange: () => void) {
  const timer = setInterval(onChange, 1000);
  return () => clearInterval(timer);
}

// 現在時刻
function getSnapShot() {
  return Math.floor(Date.now() / 1000);
}

function getServerSnapShot() {
  return null;
}

// 表示形式
const dateFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const timeFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

export function Clock() {
  const seconds = useSyncExternalStore(changedClock, getSnapShot, getServerSnapShot);
  const now = seconds !== null ? new Date(seconds * 1000) : null;

  return (
    <div className="flex flex-col items-center">
      <Typography variant="h3">{now ? dateFormat.format(now) : "9999/99/99"}</Typography>
      <Typography variant="h1" className="tabular-nums">
        {now ? timeFormat.format(now) : "--:--:--"}
      </Typography>
    </div>
  );
}