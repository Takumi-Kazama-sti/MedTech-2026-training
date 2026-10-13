import styles from "./page.module.css";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';

// Fetch zero or more Meals
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
});
const meals = await prisma.meals.findMany();

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>
          Git+PostgreSQL テスト
        </h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>時間</th>
              <th>食事</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((temp) => (
              <tr key={temp.id}>
                <td>{temp.time}</td>
                <td>{temp.meal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
