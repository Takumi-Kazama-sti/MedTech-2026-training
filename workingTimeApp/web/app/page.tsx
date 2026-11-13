import { redirect } from "next/navigation";

// 「/」は打刻画面へ（未ログインなら proxy がログイン画面へ戻す）
export default function Home() {
  redirect("/attendance");
}