// React hook for Google Fonts
import { GoogleFont, fontLoader } from '@/lib/font-utils'
import { useEffect, useMemo, useState } from 'react'

export interface UseGoogleFontsOptions {
    apiEndpoint?: string
    limit?: number
    enableSearch?: boolean
}

export interface UseGoogleFontsReturn {
    fonts: GoogleFont[]
    filteredFonts: GoogleFont[]
    isLoading: boolean
    error: string | null
    searchQuery: string
    setSearchQuery: (query: string) => void
    loadFont: (font: GoogleFont) => Promise<void>
    isLoadingFont: (fontFamily: string) => boolean
}

export function useGoogleFonts(options: UseGoogleFontsOptions = {}): UseGoogleFontsReturn {
    const {
        apiEndpoint = '/api/google-fonts',
        limit = 50,
        enableSearch = true
    } = options

    const [fonts, setFonts] = useState<GoogleFont[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set())

    // Fetch Google Fonts on mount
    useEffect(() => {
        let canceled = false

        async function fetchGoogleFonts() {
            setIsLoading(true)
            setError(null)

            try {
                const response = await fetch(apiEndpoint)
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
                }

                const data = await response.json()

                if (!canceled) {
                    if (Array.isArray(data?.fonts)) {
                        setFonts(data.fonts)
                    } else {
                        throw new Error('Invalid response format')
                    }
                }
            } catch (err) {
                console.error('Failed to fetch Google Fonts:', err)
                if (!canceled) {
                    setError(err instanceof Error ? err.message : 'Failed to load Google Fonts')
                }
            } finally {
                if (!canceled) {
                    setIsLoading(false)
                }
            }
        }

        fetchGoogleFonts()

        return () => {
            canceled = true
        }
    }, [apiEndpoint])

    // Filter fonts based on search query
    const filteredFonts = useMemo(() => {
        if (!enableSearch || !searchQuery.trim()) {
            return fonts.slice(0, limit)
        }

        const query = searchQuery.trim().toLowerCase()
        const filtered = fonts.filter(font =>
            font.family.toLowerCase().includes(query)
        )

        return filtered.slice(0, limit)
    }, [fonts, searchQuery, limit, enableSearch])

    // Load a specific font
    const loadFont = async (font: GoogleFont): Promise<void> => {
        if (fontLoader.isFontLoaded(font.family)) {
            return
        }

        setLoadingFonts(prev => new Set(prev).add(font.family))

        try {
            await fontLoader.loadGoogleFont(font)
        } catch (error) {
            console.error(`Failed to load font ${font.family}:`, error)
            throw error
        } finally {
            setLoadingFonts(prev => {
                const next = new Set(prev)
                next.delete(font.family)
                return next
            })
        }
    }

    // Check if a font is currently loading
    const isLoadingFont = (fontFamily: string): boolean => {
        return loadingFonts.has(fontFamily)
    }

    return {
        fonts,
        filteredFonts,
        isLoading,
        error,
        searchQuery,
        setSearchQuery,
        loadFont,
        isLoadingFont
    }
}
