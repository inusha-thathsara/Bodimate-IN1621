'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
    const { theme, resolvedTheme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const currentTheme = theme === 'system' ? resolvedTheme : theme

    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative h-10 w-10 rounded-full border border-border bg-background text-foreground hover:bg-accent"
            onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
            aria-label={mounted && currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            {mounted && currentTheme === 'dark' ? (
                <Sun className="h-4.5 w-4.5" />
            ) : (
                <Moon className="h-4.5 w-4.5" />
            )}
        </Button>
    )
}