# LLM Council Transcript — SliceUI: kill generation-time search?

**Timestamp:** 2026-08-29 13:27:56

## Original question

Lakukan LLM council pada case tersebut agar hasilnya maksimal, dan cari jalan keluar terbaik.

Context: SliceUI's `/sliceui` run took ~6.5 min, ~95% wasted on searching (graphify/repomix/grep, 10+ sibling reads, i18n dictionary greps, spec/karma config reads). The tool's value prop is speed. User wants: XML/design in → native-looking component out, fast, minimal context, mock data only, translation deferred.

## Framed question

Should SliceUI skip its generation-time "search existing code patterns" step and trust a pre-computed `project-context.json` (framework + capabilities map with sampleHtml/sampleTs) + the XML transcript? Is pattern-searching adding accuracy or just latency? Is the pre-computed context genuinely sufficient? Should generated data be mock-only and translation deferred?

---

## Advisor responses

### The Contrarian

The proposal has a category error: "search was wasteful" is evidence the search was *untargeted*, not that search is *useless*. Trusting project-context.json alone has a fatal flaw: staleness and representativeness. The map is a snapshot — one sample per category — but real codebases are heterogeneous (formControl vs ngModel vs reactive forms). A single sample encodes one idiomatic answer where the truth is a distribution; the agent will be confidently wrong everywhere else. The map records *which* library, not *how* it's used (import ordering, naming, error handling). Deferring i18n is a landmine: emitting literal text where translate pipes are mandatory produces a non-compiling or broken deliverable. The right fix is to *cache the search* — turn sibling reads into a machine-readable idiom digest appended to context, regenerated on file change.

### The First Principles Thinker

You're asking the wrong question. "Does searching improve accuracy or add latency?" assumes search is a legitimate source of truth — it isn't, it's sampling error dressed as diligence. Idiom is a property of the codebase, not the query. If the agent still needs 10 sibling components and two i18n dictionaries, the capabilities map is too thin — fix is to make the map richer, not re-run search. Needing 10 examples to infer a convention means you have noise, not a capability. Kill generation-time search; the fix is a richer precomputed map, not re-derived idiom per run. i18n deferral and mock-data are correct by the same argument: slicing is feed-forward transcription + idiom application.

### The Expansionist

The undervalued asset isn't speed — it's determinism. Stop searching, trust the context, and a run becomes a pure function (compiler, not chatbot). 6.5 min → ~10s is a 40x phase transition that makes batch mode the default (40 screens → 40 components). project-context.json is a portable project fingerprint — cacheable, versionable, shareable. It unlocks design→code diff/PR pipelines, conformance checking, deterministic replay (cheap small models generate the 80% that fit the template). The adjacent opportunity is SliceUI-as-CI, not SliceUI-as-editor. Deferred i18n + mock make output immediately previewable.

### The Outsider

The agent isn't confused — it's following an instruction that never told it to stop. The tool is described by mechanism (transcribe, detect, absorb idiom) not by definition-of-done. "Idiomatic" has no end state, so the agent keeps collecting evidence because it can't know it's finished. The sampleHtml/sampleTs already IS the idiom; every further search is redundant, but nothing declares it authoritative. The user wants: image in, component out, fast, looking native — not translations, mocks, or a rewritten test. Fix the stop condition, not the search budget. Declare project-context.json authoritative; define done as "files written from sample + transcript, everything else out of scope."

### The Executor

Doable this week — the 6.5 min is self-inflicted (the agent is told to search, so it searches). Fix is deleting instructions, not writing code. First commit — one file: rewrite SKILL.md with three hard rules: (1) project-context.json + transcript are the ONLY permitted inputs; (2) no grep/repomix/graphify/read of siblings/spec config; (3) if capability isn't in map, generate from sampleHtml/sampleTs and stop. Second commit — make context authoritative: add sampleHtml/sampleTs + `i18n: "defer"` and `data: "mock"` flags; detect writes once and caches. New flow = detect → transcribe → generate (reads exactly two files). Ship instruction change first, measure, then schema commit — don't bundle.

---

## Peer reviews

### Anonymization mapping

- Response A = First Principles Thinker
- Response B = Contrarian
- Response C = Outsider
- Response D = Expansionist
- Response E = Executor

### Review 1

Strongest = E (executable plan, correct sequencing). Biggest blind spot = B (its "cache the search" fix IS a richer map, i.e. A's proposal — refutes A while converging on A's solution). All missed: the question is empirical yet everyone reasons from first principles; none proposes measuring accuracy delta; none proposes a verification gate for correctness once search is gone.

### Review 2

Strongest = C (definition-of-done diagnosis). Blind spot = D (asserts determinism without engaging accuracy/sufficiency). All missed: empirical measurement (A/B accuracy delta), a cheap fallback (search only when capability absent/low-confidence), and a verification gate (build/typecheck).

### Review 3

Strongest = B (identifies category error + distribution flaw). Blind spot = A (circular on "richer map" mechanics). All missed: output verification/conformance feedback loop to catch confidently-wrong non-idiomatic output.

### Review 4

Strongest = A (correct reframe). Blind spot = D (silent staleness — frozen snapshot fails silently). All missed: how project-context.json gets generated/maintained/regenerated (no bootstrap/refresh/staleness trigger); no measured accuracy delta.

### Review 5

Strongest = C (missing definition-of-done). Blind spot = D (determinism≠correctness; a fast wrong answer is worse than slow right). All missed: empirical golden benchmark + a confidence signal/escalation path (flag when the map is insufficient).

---

## Chairman synthesis

### Where the Council Agrees

The 6.5-minute run is self-inflicted. Four of five advisors land on the same mechanism: the agent isn't confused or searching for real signal — it's executing an instruction with no stop condition. No advisor defends generation-time search as currently performed. There is deep convergence that the sampleHtml/sampleTs already *is* the idiom — the Contrarian refutes the proposal while converging on the same solution (a richer precomputed map). Mock-data-only and deferred translation are endorsed by four of five.

### Where the Council Clashes

**i18n deferral (Contrarian vs. everyone):** "defer translation" ≠ "defer the translate mechanism." In Angular where a translate pipe is mandatory, literal text breaks the deliverable. Resolution: defer the *values* (keys/dictionaries), never the *mechanism* (pipe-wrapping structure).

**Determinism vs. correctness:** the prize is determinism only if paired with a correctness gate — which nobody proposed in the first round.

### Blind Spots the Council Caught

1. No empirical measurement (A/B accuracy delta on a golden benchmark).
2. No verification gate once search is gone (typecheck/build/conformance must replace it).
3. No confidence signal / escalation path (trust the map when sufficient, flag + narrow targeted search when it isn't).
4. No bootstrap/refresh/staleness trigger ("detect once and cache" → "detect never").

### The Recommendation

Skip generation-time search. Declare project-context.json + the XML transcript the only permitted inputs, and make the map authoritative — but sufficient only under three conditions:
1. The map must be rich enough to *be* the answer (framework + capabilities + sampleHtml/sampleTs + flags `i18n:"defer"`, `data:"mock"`).
2. The safety net replaces search, it doesn't disappear: verification gate, confidence/escalation path, staleness trigger.
3. Mock data + deferred translation: yes — defer values, never the translate mechanism.

The 40× speedup is real and worth taking, but the claim should be "deterministic *and* verifiable," not "deterministic *instead of* correct."

### The One Thing to Do First

Rewrite SKILL.md with the three hard rules — (1) project-context.json + transcript are the only permitted inputs; (2) no grep/repomix/graphify/sibling/spec reads; (3) capability not in map → generate from sampleHtml/sampleTs and stop — then re-run the same 6.5-minute case and record the accuracy delta against a golden output before touching any schema.
