/**
 * Helpers for deriving readable text colors from a pastel subject background.
 *
 * The Figma designs use per-subject text tinting where the foreground text
 * is a darker shade of the same hue as the card background (e.g. light blue
 * background → dark blue text). The DB only stores one `subject.color` value,
 * so we derive the text color via HSL lightness reduction at runtime.
 */

/**
 * Darken a hex color by lowering its HSL lightness, preserving the hue.
 *
 * @param hex      A 6-char hex color, with or without leading `#`
 * @param targetL  Target lightness in [0, 1]; default 0.3 for primary text
 */
export function darkenHexHsl(hex: string, targetL = 0.3): string {
    const h = (hex.startsWith('#') ? hex.slice(1) : hex).padStart(6, '0');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let hue = 0;
    let sat = 0;
    const light = (max + min) / 2;
    if (max !== min) {
        const d = max - min;
        sat = light > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                hue = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                hue = (b - r) / d + 2;
                break;
            case b:
                hue = (r - g) / d + 4;
                break;
        }
        hue /= 6;
    }
    const q = targetL < 0.5 ? targetL * (1 + sat) : targetL + sat - targetL * sat;
    const p = 2 * targetL - q;
    const hue2rgb = (pp: number, qq: number, tt: number): number => {
        let t = tt;
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return pp + (qq - pp) * 6 * t;
        if (t < 1 / 2) return qq;
        if (t < 2 / 3) return pp + (qq - pp) * (2 / 3 - t) * 6;
        return pp;
    };
    const rr = Math.round(hue2rgb(p, q, hue + 1 / 3) * 255);
    const gg = Math.round(hue2rgb(p, q, hue) * 255);
    const bb = Math.round(hue2rgb(p, q, hue - 1 / 3) * 255);
    return `#${rr.toString(16).padStart(2, '0')}${gg.toString(16).padStart(2, '0')}${bb.toString(16).padStart(2, '0')}`;
}

/**
 * Returns `{primary, secondary}` text colors derived from a subject's
 * background color hex. `primary` is the bold heading tone (~30% lightness),
 * `secondary` is the lighter sub-text tone (~45% lightness). Falls back to
 * the design's default English blue palette when no color is provided.
 */
export function subjectTextColors(rawColor: string | undefined | null): { primary: string; secondary: string } {
    if (!rawColor) return { primary: '#115FAB', secondary: '#2E7CC8' };
    const hex = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;
    return {
        primary: darkenHexHsl(hex, 0.3),
        secondary: darkenHexHsl(hex, 0.45),
    };
}
