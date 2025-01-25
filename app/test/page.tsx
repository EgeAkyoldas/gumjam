"use client"

import { GumPhysicsTest } from "@/components/GumPhysicsTest/GumPhysicsTest"

export default function TestPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-pink-100 p-8">
      <div className="space-y-8">
        <h1 className="text-2xl font-bold text-pink-500 text-center">Sakız Fiziği Test Ortamı</h1>
        <GumPhysicsTest />
      </div>
    </main>
  )
} 