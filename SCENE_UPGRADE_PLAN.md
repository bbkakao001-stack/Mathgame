# Scene upgrade plan — Cambridge Stage 7 Maths (Chapters 12–14)

The deck will remain at 126 slides. No slide content, question, answer, or
teach → question order will be removed or changed. All added object art will
be locally drawn SVG; no generated or third-party image assets will be used.

| Scene / slide topic | Current visual gap | Planned object context | Icon source |
|---|---|---|---|
| Three averages | Mostly data dots and abstract marks | Open book beside the data set | `book-2` SVG symbol |
| Mean definition (fair share) | Equal-share dot piles read as geometry | Coins redistributed among five groups | `coin` SVG symbol |
| Median | Number circles and a line without a real measuring context | Ruler under the ordered values | `ruler` SVG symbol |
| Mode | Abstract value tags and clusters | Shoe-size tag/footwear context retained and refined | `shoe` SVG symbol |
| Range (endpoint span) | Number line and endpoint markers only | Ruler spanning the minimum and maximum | `ruler` SVG symbol |
| Frequency tables (objects to bars) | Repeated dots and bars | Dice observations become object-based counts | `dice-5` SVG symbol |
| Order of operations (BODMAS) | Expression and highlight strokes only | Open workbook beside the expression | `book-2` SVG symbol |
| Multiplying fractions | Partitioned rectangle only | Chocolate bar alongside the fraction area | Locally drawn `chocolate` SVG symbol |
| Percentage of amount | Several numerical cards and imported/missing icons | Basket, price receipt, coins, and shopping items | `basket`, `receipt`, `coin`, `shopping-bag` SVG symbols |
| Rounding | Number line as the only context | Measuring ruler aligned with the rounding interval | `ruler-2` SVG symbol |
| Solving equations (balance) | Thin balance beam and strings | Detailed scale with chains, pans, shadow, and solid stand | Locally drawn SVG; no external icon |
| Real-life formulae | Car and clock intended to anchor the formula | Reliable locally drawn car and analog clock | `car`, `clock` SVG symbols |
| Real-life graphs | Bottle icon may fail when external object files are absent | Bottle remains a locally drawn object next to the graph | `bottle` SVG symbol |
| All other `STORYBOARD` scenes | Several scenes use only mathematical marks and number cards | Add one small, topic-matched contextual object in the scene margin; use a locally drawn book only for unmapped storyboard visuals | Relevant symbol from the inline icon set |
| All generated fallback diagrams | Non-storyboard diagrams are mostly cards, grids, points, and lines | Add an object matching the generated visual kind (for example, dice for frequency, chocolate for fractions, ruler for decimals/coordinates, cart for estimation) | Relevant symbol from the inline icon set |
| All existing `O(name, …)` call sites | Relative external SVG paths can render blank | Replace every call with a same-document SVG `<use>` symbol | Inline symbol set in the HTML `<defs>` |

## Playback and slide motion

| Surface | Planned behavior |
|---|---|
| Presentation controls | Add Play/Pause and a speed selector beside the existing navigation controls |
| Story beats | Advance the current scene's existing build levels first, then slide; use each `STORYBOARD.builds[n]` string as the live caption |
| Questions | Pause playback on every question and resume only after the existing answer checker confirms a correct answer |
| Camera movement | In Play mode, translate the shared slide track continuously; keep `.slide.active` for manual navigation |
| User input | Any manual navigation, click, or touch stops playback before applying the user's action |
| Reduced motion | Disable automatic playback and track animation; retain ordinary immediate manual slide switching |

## Acceptance checks

- Confirm exactly 126 slides and unchanged question/answer/order data.
- Confirm all former `O()` calls resolve to non-empty local symbols.
- Exercise Play across at least 10 consecutive slides and verify each question blocks until correct.
- Verify reduced-motion behavior and user-input interruption.
- Capture browser screenshots for visual comparison; all artwork is local SVG, so no network-image fallback test is needed.
