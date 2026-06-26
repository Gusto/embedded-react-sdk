/**
 * Color tokens that can be overridden to customize the SDK's visual theme.
 * Pass a `Partial<GustoSDKThemeColors>` when constructing a `Partial<GustoSDKTheme>`
 * to supply to `ThemeProvider`.
 *
 * @public
 */
export interface GustoSDKThemeColors {
  /** Background color of the main content area. */
  colorBody: string
  /** Subtle accent background, used for hover states and alternating rows. */
  colorBodyAccent: string
  /** Primary text color rendered on body backgrounds. */
  colorBodyContent: string
  /** Secondary/muted text color for supporting copy and labels. */
  colorBodySubContent: string
  /** Brand primary color, used for primary buttons and active states. */
  colorPrimary: string
  /** Hover/pressed tint for primary elements. */
  colorPrimaryAccent: string
  /** Text or icon color rendered on primary backgrounds. */
  colorPrimaryContent: string
  /** Brand secondary color, used for secondary buttons and surfaces. */
  colorSecondary: string
  /** Hover/pressed tint for secondary elements. */
  colorSecondaryAccent: string
  /** Text or icon color rendered on secondary backgrounds. */
  colorSecondaryContent: string
  /** Background for informational banners and callouts. */
  colorInfo: string
  /** Border or icon accent inside informational surfaces. */
  colorInfoAccent: string
  /** Text color rendered on informational surfaces. */
  colorInfoContent: string
  /** Background for warning banners and callouts. */
  colorWarning: string
  /** Border or icon accent inside warning surfaces. */
  colorWarningAccent: string
  /** Text color rendered on warning surfaces. */
  colorWarningContent: string
  /** Background for error banners and inline validation states. */
  colorError: string
  /** Border, icon accent, and field error indicator inside error surfaces. */
  colorErrorAccent: string
  /** Text color rendered on error surfaces. */
  colorErrorContent: string
  /** Background for success banners and confirmation states. */
  colorSuccess: string
  /** Border or icon accent inside success surfaces. */
  colorSuccessAccent: string
  /** Text color rendered on success surfaces. */
  colorSuccessContent: string
  /** Color of primary borders (inputs, cards, dividers). */
  colorBorderPrimary: string
  /** Color of secondary/subtle borders. */
  colorBorderSecondary: string
  /** Color of icon-only buttons. */
  colorButtonIcon: string
}

/**
 * Complete set of design tokens that control the SDK's visual theme. Pass a
 * `Partial<GustoSDKTheme>` to `ThemeProvider` to override specific tokens; any
 * token not supplied falls back to the SDK default.
 *
 * @public
 *
 * @example
 * ```tsx
 * import { GustoProvider } from '@gusto/embedded-react-sdk'
 *
 * function App() {
 *   return (
 *     <GustoProvider
 *       theme={{
 *         colorPrimary: '#007bff',
 *         fontSizeRegular: '18px',
 *         inputRadius: '12px',
 *       }}
 *     >
 *       {/* your app *\/}
 *     </GustoProvider>
 *   )
 * }
 * ```
 */
export interface GustoSDKTheme extends GustoSDKThemeColors {
  /**
   * Background color of text inputs and selects.
   * @defaultValue `colorBody`
   */
  inputBackgroundColor: string
  /** Border color of text inputs and selects. */
  inputBorderColor: string
  /**
   * Text color inside text inputs and selects.
   * @defaultValue `colorBodyContent`
   */
  inputContentColor: string
  /** Border width of text inputs and selects. */
  inputBorderWidth: string
  /**
   * Placeholder text color inside inputs.
   * @defaultValue `colorBodySubContent`
   */
  inputPlaceholderColor: string
  /**
   * Color of leading/trailing adornment icons in inputs.
   * @defaultValue `colorBodySubContent`
   */
  inputAdornmentColor: string
  /**
   * Background color of disabled inputs.
   * @defaultValue `colorBodyAccent`
   */
  inputDisabledBackgroundColor: string
  /**
   * Color of form field labels.
   * @defaultValue `colorBodyContent`
   */
  inputLabelColor: string
  /** Font size of form field labels. */
  inputLabelFontSize: string
  /** Font weight of form field labels. */
  inputLabelFontWeight: string
  /**
   * Color of form field description/hint text.
   * @defaultValue `colorBodySubContent`
   */
  inputDescriptionColor: string
  /**
   * Color of inline field error messages.
   * @defaultValue `colorErrorAccent`
   */
  inputErrorColor: string
  /** Border radius of text inputs and selects. */
  inputRadius: string
  /** Border radius of buttons. */
  buttonRadius: string
  /** Border radius of card surfaces. */
  cardRadius: string
  /** Border radius of badges. */
  badgeRadius: string
  /** Border radius of banners. */
  bannerRadius: string
  /** Border radius of box/panel surfaces. */
  boxRadius: string
  /** Root document font size as a numeric string (no `px` suffix). Used as the rem base. */
  fontSizeRoot: string
  /** Font family stack applied to all SDK text. */
  fontFamily: string
  /** Line height for large text. */
  fontLineHeightLarge: string
  /** Line height for regular/body text. */
  fontLineHeightRegular: string
  /** Line height for small text. */
  fontLineHeightSmall: string
  /** Line height for extra-small text. */
  fontLineHeightExtraSmall: string
  /** Font size for extra-small text. */
  fontSizeExtraSmall: string
  /** Font size for small text. */
  fontSizeSmall: string
  /** Font size for regular/body text. */
  fontSizeRegular: string
  /** Font size for large text. */
  fontSizeLarge: string
  /** Font size for H1 headings. */
  fontSizeHeading1: string
  /** Font size for H2 headings. */
  fontSizeHeading2: string
  /** Font size for H3 headings. */
  fontSizeHeading3: string
  /** Font size for H4 headings. */
  fontSizeHeading4: string
  /** Font size for H5 headings. */
  fontSizeHeading5: string
  /** Font size for H6 headings. */
  fontSizeHeading6: string
  /** Font weight for regular text. */
  fontWeightRegular: string
  /** Font weight for medium-emphasis text. */
  fontWeightMedium: string
  /** Font weight for semibold text. */
  fontWeightSemibold: string
  /** Font weight for bold text. */
  fontWeightBold: string
  /** Duration of UI transitions, e.g. `"200ms"`. */
  transitionDuration: string
  /** Box shadow for resting/default elevation. */
  shadowResting: string
  /** Box shadow for elevated/topmost surfaces such as dropdowns and modals. */
  shadowTopmost: string
  /**
   * Color of the keyboard focus ring.
   * @defaultValue `colorPrimary`
   */
  focusRingColor: string
  /** Width of the keyboard focus ring. */
  focusRingWidth: string
}
