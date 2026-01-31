// Font loading utilities
export type GoogleFont = {
    family: string
    variants: string[]
    files: Record<string, string>
    previewUrl?: string
    category?: string
}

export type LocalFont = {
    name: string
    displayName: string
    path: string
}

// Font loading class to manage Google Fonts
export class FontLoader {
    private loadedFonts = new Set<string>()
    private loadingPromises = new Map<string, Promise<void>>()

    /**
     * Load a Google Font dynamically
     */
    async loadGoogleFont(font: GoogleFont): Promise<void> {
        // Check if already loaded
        if (this.loadedFonts.has(font.family)) {
            return
        }

        // Check if currently loading
        if (this.loadingPromises.has(font.family)) {
            return this.loadingPromises.get(font.family)!
        }

        // Start loading
        const loadPromise = this._loadFont(font)
        this.loadingPromises.set(font.family, loadPromise)

        try {
            await loadPromise
            this.loadedFonts.add(font.family)
        } finally {
            this.loadingPromises.delete(font.family)
        }
    }

    private async _loadFont(font: GoogleFont): Promise<void> {
        const source = font.previewUrl || font.files?.['regular'] || font.files?.['400']
        if (!source) {
            throw new Error(`No font file available for ${font.family}`)
        }

        try {
            const fontFace = new FontFace(font.family, `url(${source})`)
            const loadedFont = await fontFace.load()
            document.fonts.add(loadedFont)
        } catch (error) {
            console.error(`Failed to load font ${font.family}:`, error)
            throw error
        }
    }

    /**
     * Load local font from file
     */
    async loadLocalFont(font: LocalFont, weight = "400"): Promise<void> {
        if (this.loadedFonts.has(font.name)) {
            return
        }

        try {
            const fontFace = new FontFace(font.name, `url(${font.path})`, { weight })
            const loadedFont = await fontFace.load()
            document.fonts.add(loadedFont)
            this.loadedFonts.add(font.name)
        } catch (error) {
            console.error(`Failed to load local font ${font.name}:`, error)
            throw error
        }
    }

    /**
     * Load custom font from file upload
     */
    async loadCustomFont(file: File, fontName?: string): Promise<string> {
        const fileName = fontName || file.name.replace(/\.(ttf|otf|woff2?)$/i, "") || "CustomFont"
        const uniqueName = `${fileName}_${Date.now()}`

        if (this.loadedFonts.has(uniqueName)) {
            return uniqueName
        }

        try {
            const arrayBuffer = await file.arrayBuffer()
            const fontFace = new FontFace(uniqueName, arrayBuffer)
            const loadedFont = await fontFace.load()

            document.fonts.add(loadedFont)
            this.loadedFonts.add(uniqueName)

            return uniqueName
        } catch (error) {
            console.error(`Failed to load custom font ${fileName}:`, error)
            throw error
        }
    }

    /**
     * Ensure fonts are loaded and ready for use
     */
    async ensureFontsReady(fontFamilies: string[]): Promise<void> {
        try {
            const loadPromises = fontFamilies.map(family => {
                const cleanFamily = family.split(',')[0].trim().replace(/['"]/g, '')
                if (!cleanFamily) return Promise.resolve()

                return Promise.allSettled([
                    this._loadFontWeight(cleanFamily, '400'),
                    this._loadFontWeight(cleanFamily, '500'),
                    this._loadFontWeight(cleanFamily, '700'),
                ])
            })

            await Promise.allSettled(loadPromises)

            // Wait for document fonts to be ready
            if (document.fonts && document.fonts.ready) {
                await document.fonts.ready
            }
        } catch (error) {
            console.error('Error ensuring fonts ready:', error)
        }
    }

    private async _loadFontWeight(family: string, weight: string): Promise<void> {
        if (document.fonts && document.fonts.load) {
            try {
                await document.fonts.load(`${weight} 24px "${family}"`)
            } catch {
                // Ignore font loading errors
            }
        }
    }

    /**
     * Check if a font is loaded
     */
    isFontLoaded(fontFamily: string): boolean {
        return this.loadedFonts.has(fontFamily)
    }

    /**
     * Get all loaded fonts
     */
    getLoadedFonts(): string[] {
        return Array.from(this.loadedFonts)
    }
}

// Singleton instance
export const fontLoader = new FontLoader()

/**
 * Sanitize font family for canvas usage
 */
export function sanitizeFontFamily(fontFamily: string): string {
    if (
        !fontFamily ||
        fontFamily.toLowerCase() === "default" ||
        fontFamily.toLowerCase() === "default (product sans)" ||
        fontFamily === "__default__"
    ) {
        return "ui-sans-serif, system-ui, -apple-system, sans-serif"
    }

    // Remove CSS variables that canvas can't resolve
    return fontFamily.replace(/var\([^)]*\)\s*,?/g, "").trim()
}

/**
 * Get appropriate font weight for specific fonts
 */
export function getFontWeight(fontFamily: string): string {
    if (fontFamily.includes("Montserrat")) return "500"
    if (fontFamily.includes("Doto")) return "700"
    return "400"
}
