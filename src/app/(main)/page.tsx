"use client";

import { useStore } from "@/store/useStore";


export default function Page() {
  const { name, setName } = useStore();
  return (
    <main>
      <h1>{name}</h1>
      <button onClick={() => setName("dasdasdas")}>Set Name</button>
    </main>
  );
}