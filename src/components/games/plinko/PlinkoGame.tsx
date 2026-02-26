"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { getMultipliers, PlinkoRisk } from "@/lib/plinko"
import Matter from "matter-js"
import { useBalance } from "@/context/BalanceContext"

interface BallData {
  payout: number
  targetPath: number[]
  currentStep: number
  processed: boolean
  targetIndex: number
}

interface BallBody extends Matter.Body {
  plugin: {
    data: BallData
  }
}

export default function PlinkoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  
  const { balance, updateBalance } = useBalance() // Use balance context
  const [wager, setWager] = useState("10")
  const [rows, setRows] = useState(16)
  const [risk, setRisk] = useState<PlinkoRisk>("MEDIUM")
  const { toast } = useToast()
  
  const multipliers = getMultipliers(rows, risk)
  
  // Audio refs
  const dropSound = useRef<HTMLAudioElement | null>(null)
  const winSound = useRef<HTMLAudioElement | null>(null)
  const landSound = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    dropSound.current = new Audio('/sounds/drop.mp3')
    winSound.current = new Audio('/sounds/win.mp3')
    landSound.current = new Audio('/sounds/land.mp3') // Add land sound if available
  }, [])

  const getMultiplierColor = (val: number) => {
    if (val < 1) return '#3f3f46' // zinc-700
    if (val < 3) return '#fbbf24' // amber-400
    if (val < 10) return '#f97316' // orange-500
    return '#ef4444' // red-500
  }

  const handleWin = useCallback((ballBody: Matter.Body, bucketIndex: number) => {
    // Validate with the data attached to the ball
    const ballWithData = ballBody as BallBody
    const ballData = ballWithData.plugin.data
    if (ballData.processed) return
    
    ballData.processed = true // Prevent double triggering
    
    // Delay removal slightly for visual effect? No, simple is better.
    if (engineRef.current) {
      Matter.World.remove(engineRef.current.world, ballBody)
    }
    
    // Trigger Balance Update HERE (Visual Freeze Effect)
    // We only add the payout. The wager was deducted at start.
    if (ballData.payout > 0) {
        updateBalance(ballData.payout, true)
        // Play win sound
        if (winSound.current) {
            winSound.current.currentTime = 0
            winSound.current.play().catch(() => {})
        }
        toast({
              title: `${multipliers[bucketIndex]}x Multiplier!`,
              description: `You won ${ballData.payout.toFixed(2)}`,
              className: "bg-green-600 text-white border-none"
          })
    } else {
      // Loss
      // No balance update needed (already deducted)
    }
  }, [multipliers, updateBalance, toast])

  const drawBoard = useCallback(() => {
    const engine = engineRef.current
    if (!engine) return

    const world = engine.world
    Matter.World.clear(world, false) // Keep balls (false = keep static? no, false = keep nothing? wait. false = clear everything)
    
    const width = 800
    const height = 600
    const gap = width / (rows + 2)
    const pegRadius = 4

    const pegs = []
    
    for (let r = 0; r < rows; r++) {
        const pegsInRow = r + 3
        // const y = 50 + r * gap // Old spacing
        const y = 80 + r * gap // Move down a bit
        const rowWidth = (pegsInRow - 1) * gap
        const startX = (width - rowWidth) / 2

        for (let c = 0; c < pegsInRow; c++) {
            const x = startX + c * gap
            // Using circle bodies for pegs
            const peg = Matter.Bodies.circle(x, y, pegRadius, {
                isStatic: true,
                label: 'peg',
                render: { fillStyle: 'rgba(255, 255, 255, 0.2)' },
                restitution: 0.5 // Bounciness
            })
            pegs.push(peg)
        }
    }

    // Buckets / Multipliers
    // We use static bodies (sensors) to detect landing
    const buckets = []
    const y = 80 + rows * gap
    const bucketCount = multipliers.length
    const startX = (width - ((bucketCount) * gap)) / 2 + (gap/2)

    for (let i = 0; i < bucketCount; i++) {
        const x = startX + i * gap
        // Invisible sensor for collision detection
        const sensor = Matter.Bodies.rectangle(x, y + 20, gap - 4, 10, {
            isStatic: true,
            isSensor: true, // Key: Trigger collision events without physical blocking
            label: `bucket-${i}`,
            render: { visible: false } 
        })

        // Visual bucket (we can draw this with Matter.js or separate, let's use Matter bodies for simplicity)
        // Actually, Matter bodies are good but we want text. 
        // We can use the 'afterRender' hook or just trust the standard loop if we wrote one.
        // Since we are using Matter.Render, we can't easily draw text unless we hook into it.
        // BUT, we can add a visual body for the bucket color.
        const bucketVisual = Matter.Bodies.rectangle(x, y + 20, gap - 4, 30, {
          isStatic: true,
          isSensor: true,
          render: { fillStyle: getMultiplierColor(multipliers[i]) }
        })

        buckets.push(sensor, bucketVisual)
    }

    // Add Walls slightly off screen to keep balls in bounds just in case
    const ground = Matter.Bodies.rectangle(width/2, height + 50, width, 100, { isStatic: true, label: 'ground' })
    const wallLeft = Matter.Bodies.rectangle(-20, height/2, 40, height, { isStatic: true })
    const wallRight = Matter.Bodies.rectangle(width + 20, height/2, 40, height, { isStatic: true })

    Matter.World.add(world, [...pegs, ...buckets, ground, wallLeft, wallRight])
    
    // Hook into collision events to detect win
    Matter.Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
            const { bodyA, bodyB } = pair
            const ball = bodyA.label.startsWith('ball') ? bodyA : bodyB.label.startsWith('ball') ? bodyB : null
            const bucket = bodyA.label.startsWith('bucket') ? bodyA : bodyB.label.startsWith('bucket') ? bodyB : null
            const ground = bodyA.label === 'ground' ? bodyA : bodyB.label === 'ground' ? bodyB : null

            if (ball && bucket) {
                // Ball hit a bucket sensor!
                const bucketIndex = parseInt(bucket.label.split('-')[1])
                handleWin(ball, bucketIndex)
            }
            
            if (ball && ground) {
                // Fallback: Remove ball if it hits ground without hitting bucket
                Matter.World.remove(world, ball)
            }
        })
    })
  }, [handleWin, multipliers, rows])

  // Initialize Matter.js Engine
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = Matter.Engine.create()
    const runner = Matter.Runner.create()
    
    // Disable gravity initially (or customize it)
    engine.gravity.y = 1.6 // Stronger gravity for satisfying drop
    engine.gravity.x = 0

    const render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: 800,
            height: 600,
            wireframes: false,
            background: 'transparent',
            pixelRatio: window.devicePixelRatio
        }
    })

    Matter.Render.run(render)
    Matter.Runner.run(runner, engine)

    engineRef.current = engine
    runnerRef.current = runner

    return () => {
        Matter.Render.stop(render)
        Matter.Runner.stop(runner)
        if (engineRef.current) Matter.Engine.clear(engineRef.current)
        render.canvas.remove()
        // @ts-expect-error - cleanup
        render.canvas = null
        // @ts-expect-error - cleanup
        render.context = null
        render.textures = {}
    }
  }, [])

  // Re-draw board when rows change
  useEffect(() => {
    if (!engineRef.current) return
    drawBoard()
  }, [drawBoard, rows, risk]) // Re-draw on risk change to update colors



  const dropBall = async () => {
    const amount = parseFloat(wager)
    if (!amount || isNaN(amount) || amount <= 0) {
        toast({ title: "Invalid Wager", variant: "destructive" })
        return
    }
    if (balance < amount) {
        toast({ title: "Insufficient Balance", variant: "destructive" })
        return
    }

    try {
        // 1. Optimistic Deduction (Freeze funds)
        await updateBalance(-amount, true)

        const res = await fetch('/api/games/plinko/play', {
            method: 'POST',
            body: JSON.stringify({
                wager: amount,
                risk,
                rows
            })
        })
        const data = await res.json()
        
        if (!data.success) {
            // Refund on error
            await updateBalance(amount, true)
            throw new Error(data.error)
        }

        // 2. Add Ball to Physics World
        const engine = engineRef.current
        if (!engine) return

        // Calculate random start position based on path? 
        // Real Plinko logic requires the ball to bounce specifically to land in the target.
        // Since physics is chaotic, we can't easily force it to land in index X using just physics 
        // unless we have a "rigged" physics engine or invisible guides.
        //
        // SOLUTION: "Guided" Physics or pure visual simulation?
        // User asked for "realistic ball movement" (Physics).
        // If we use real physics, the result is random. But the SERVER determined the result already.
        // Hybrid Approach: We spawn the ball and apply tiny forces to nudge it towards the target path? 
        // OR: We just let it drop and if it lands in the wrong bucket, we lie about the visual? No, that's bad.
        //
        // Standard Crypto Casino Approach:
        // The "physics" is often pre-calculated or faked visually to matching the path.
        // OR: We can simulate the path by adding invisible walls/forces.
        // 
        // For this task, to satisfy "Matter.js" and "Realistic":
        // We will drop the ball. We will NOT nudge it.
        // Wait, if we don't nudge it, it won't match the server result `data.result.index`.
        // This creates a discrepancy between "Proven Fair" result and "Visual" result.
        //
        // CRITICAL FIX: We must visual-only simulate the path provided by server `data.result.path`?
        // Actually, matching exact physics to a pre-determined path is VERY hard.
        // For this demo, and since user prioritized "Visuals/Physics", I will:
        // Spawn the ball with a specific offset/variable X velocity that statistically favors the target?
        // No, that's unreliable.
        // 
        // Alternative: The path is `[0, 1, 0, 1...]` (Left/Right).
        // We can nudge the ball left/right at each peg collision to match the path.
        // Events.on(engine, 'collisionStart') -> check if peg -> apply force based on current step in path.
        
        const ball = Matter.Bodies.circle(400 + (Math.random() - 0.5) * 10, 20, 6, {
            restitution: 0.5,
            friction: 0.5,
            label: 'ball',
            render: { fillStyle: '#ffff00' },
            plugin: {
                data: {
                    payout: data.result.payout,
                    targetPath: data.result.path, // [0, 1, 0, 1 (right)]
                    currentStep: 0,
                    processed: false,
                    targetIndex: data.result.index
                }
            }
        })
        
        // Add random jitter to ensure it doesn't get stuck
        Matter.Body.setVelocity(ball, { x: (Math.random() - 0.5), y: 0 })

        Matter.World.add(engine.world, ball)
        
        // Play drop sound
        if (dropSound.current) {
            dropSound.current.currentTime = 0
            dropSound.current.play().catch(() => {})
        }

    } catch (e) {
        const msg = e instanceof Error ? e.message : "An error occurred"
        toast({ title: "Error", description: msg, variant: "destructive" })
    }
  }
  
  // Custom Collision Logic to Guide Ball (Hybrid Physics)
  useEffect(() => {
      const engine = engineRef.current
      if (!engine) return
      
      const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
          event.pairs.forEach((pair) => {
              const { bodyA, bodyB } = pair
              const ball = bodyA.label === 'ball' ? bodyA : bodyB.label === 'ball' ? bodyB : null
              const peg = bodyA.label === 'peg' ? bodyA : bodyB.label === 'peg' ? bodyB : null
              
              if (ball && peg) {
                  const ballWithData = ball as BallBody
                  const ballData = ballWithData.plugin.data
                  const path = ballData.targetPath
                  const step = ballData.currentStep
                  
                  if (step < path.length) {
                      // 0 = Left, 1 = Right
                      const direction = path[step] === 1 ? 1 : -1
                      
                      // Nudge the ball in the target direction
                      // Applying a small force to override chaotic bounce
                      const forceMagnitude = 0.002 // Tweak this value
                      Matter.Body.applyForce(ball, ball.position, { x: direction * forceMagnitude, y: 0 })
                      
                      ballData.currentStep++
                  }
              }
          })
      }
      
      Matter.Events.on(engine, 'collisionStart', onCollision)
      
      return () => {
          Matter.Events.off(engine, 'collisionStart', onCollision)
      }
  }, []) // Bind once

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-4">
      {/* Controls Sidebar */}
      <Card className="w-full lg:w-80 p-6 space-y-6 h-fit bg-black/40 border-white/10 backdrop-blur-md">
        <div className="space-y-2">
            <Label>Wager Amount</Label>
            <div className="relative">
                <Input 
                    type="number" 
                    value={wager} 
                    onChange={e => setWager(e.target.value)}
                    className="bg-black/20 border-white/10"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                    <Button size="xs" variant="ghost" onClick={() => setWager((parseFloat(wager)/2).toString())}>½</Button>
                    <Button size="xs" variant="ghost" onClick={() => setWager((parseFloat(wager)*2).toString())}>2×</Button>
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Risk Level</Label>
            <Select value={risk} onValueChange={(v: PlinkoRisk) => setRisk(v)}>
                <SelectTrigger className="bg-black/20 border-white/10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="space-y-2">
            <Label>Rows: {rows}</Label>
            <Select value={rows.toString()} onValueChange={(v: string) => setRows(parseInt(v))}>
                <SelectTrigger className="bg-black/20 border-white/10">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {Array.from({length: 9}, (_, i) => i + 8).map(r => (
                        <SelectItem key={r} value={r.toString()}>{r}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Button 
            className="w-full h-12 text-lg font-bold bg-green-500 hover:bg-green-600 text-black"
            onClick={dropBall}
        >
            Bet
        </Button>
      </Card>

      {/* Game Canvas */}
      <div className="flex-1 flex justify-center bg-black/20 rounded-3xl p-8 border border-white/5 relative min-h-[600px] items-center">
         <canvas 
            ref={canvasRef}
            className="max-w-full h-auto rounded-xl"
         />

      </div>
    </div>
  )
}
