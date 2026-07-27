# QA Test Document: SliceUI - Image to Code Converter

**Project:** SliceUI  
**Tech Stack:** React 18 + TypeScript + Vite, shadcn/ui, Tailwind CSS, Supabase Auth  
**Auth Method:** Supabase Auth (OAuth)  
**Target Browsers:** Chrome, Firefox, Safari, Edge - latest 2 versions  
**Screen Sizes:** 320px, 768px, 1024px, 1440px  
**Environment:** Local → Staging → Production  
**Feature:** All features (Image Upload, Framework Selection, Code Generation, Preview)

---

## 1. FUNCTIONAL & NEGATIVE TEST CASES

| Test ID | Title | Preconditions | Steps | Expected Result | Priority | Automation Potential |
|---------|-------|----------------|-------|-----------------|----------|---------------------|
| TC-001 | Upload image via drag-drop | User on homepage | Drag valid PNG file to upload zone | File preview appears, no error | P0 | High |
| TC-002 | Upload image via click browse | User on homepage | Click upload zone, select valid JPG file | File preview appears | P0 | High |
| TC-003 | Paste image from clipboard | User on homepage | Copy image, press Ctrl+V on page | File preview appears | P0 | High |
| TC-004 | Upload invalid file type | User on homepage | Try to upload .txt file | Error: "Invalid file type" | P1 | High |
| TC-005 | Upload file exceeding 10MB | User on homepage | Try to upload 11MB image | Error: "File too large (max 10MB)" | P1 | High |
| TC-006 | Select framework | Image uploaded | Click on any framework card | Framework card highlights/selected | P0 | High |
| TC-007 | Generate code without login | Image uploaded, framework selected | Click "Generate" without auth | Error/redirect to login | P0 | High |
| TC-008 | Generate code happy path | User logged in, image uploaded | Click "Generate" button | Loading state → Code displayed | P0 | High |
| TC-009 | Copy code to clipboard | Code generated | Click copy button | Success feedback, code in clipboard | P1 | Medium |
| TC-010 | Download code file | Code generated | Click download button | File downloaded with correct extension | P1 | Medium |
| TC-011 | Switch to Preview tab | Code generated for supported framework | Click Preview tab | Live preview renders in iframe | P1 | Medium |
| TC-012 | Clear uploaded image | Image uploaded | Click X button on preview | Image removed, state reset | P1 | Medium |
| TC-013 | Generate with all options enabled | User logged in | Enable all options, click Generate | Code includes responsive/dark/a11y features | P2 | Low |
| TC-014 | Empty image submission | No image uploaded | Click Generate button | Error: "Please upload an image" | P1 | High |
| TC-015 | No framework selected | Image uploaded | Click Generate without selecting framework | Error: "Please select a framework" | P1 | High |
| TC-016 | Gemini API rate limit | User logged in | Trigger multiple rapid conversions | Automatic fallback to Groq | P1 | Medium |
| TC-017 | Supabase auth failure | User not logged in | Attempt login with invalid credentials | Error message, no session created | P1 | Medium |
| TC-018 | Network timeout during generation | Slow connection | Click Generate, wait for timeout | Error message with retry option | P2 | Low |
| TC-019 | Corrupted image upload | User on homepage | Upload corrupted PNG file | Error: "Invalid image file" | P2 | Low |
| TC-020 | Multiple rapid uploads | User on homepage | Upload multiple files rapidly | Last file replaces previous, no crash | P2 | Medium |

---

## 2. ACCEPTANCE CRITERIA (GHERKIN)

### AC-001: Successful Image Upload and Code Generation

```gherkin
Given the user is on the SliceUI homepage
And the user is logged in with Supabase
When the user uploads a valid PNG/JPG/WebP image under 10MB
And the user selects a framework (e.g., "React TSX")
And the user clicks the "Generate" button
Then the system displays a loading state with "Generating code..."
And the system calls the Gemini API with the image and framework
And the system displays the generated code with syntax highlighting
And the code is self-contained and matches the selected framework format
And the user can copy or download the code
```

### AC-002: Invalid File Upload Rejection

```gherkin
Given the user is on the SliceUI homepage
When the user attempts to upload a file with invalid type (e.g., .txt, .pdf)
Then the system displays an error message: "Invalid file type. Please upload PNG, JPG, or WebP."
And the file is not accepted
And the upload zone remains unchanged
```

### AC-003: File Size Limit Validation

```gherkin
Given the user is on the SliceUI homepage
When the user attempts to upload an image larger than 10MB
Then the system displays an error message: "File too large. Maximum size is 10MB."
And the file is rejected
```

### AC-004: Unauthorized Code Generation Attempt

```gherkin
Given the user is NOT logged in
And the user has uploaded a valid image
And the user has selected a framework
When the user clicks the "Generate" button
Then the system prompts the user to log in
Or the system redirects to the Supabase auth page
And no API call is made to the AI service
```

### AC-005: API Fallback Behavior

```gherkin
Given the user is logged in and attempting to generate code
When the Gemini API returns a 429 rate limit error
Then the system automatically retries with the Groq API
And the user sees a warning: "Using backup AI service..."
And code generation continues without user intervention
```

### AC-006: Code Preview Functionality

```gherkin
Given the user has generated code for a supported framework (Tailwind, Bootstrap, React, Next.js, Vue)
When the user switches to the "Preview" tab
Then the system renders the code in a sandboxed iframe
And the preview displays the visual output of the generated code
And the preview is interactive (buttons work, hover states visible)
```

### AC-007: Clipboard Copy Functionality

```gherkin
Given the user has generated code
When the user clicks the "Copy" button
Then the code is copied to the system clipboard
And the button icon changes to a checkmark for 2 seconds
And the button tooltip shows "Copied!"
```

### AC-008: Session Expiry Handling

```gherkin
Given the user was previously logged in
And the user's Supabase session has expired
When the user attempts to generate code
Then the system detects the expired session
And the system prompts the user to re-authenticate
And no API calls are made until session is refreshed
```

---

## 3. CROSS-BROWSER & RESPONSIVENESS CHECKLIST

| Browser | Screen Size | Element | Expected Behavior | Status |
|---------|-------------|---------|-------------------|--------|
| Chrome | 320px | Upload zone | Full width, stacked layout | ⬜ Pass |
| Chrome | 320px | Framework picker | Single column, scrollable | ⬜ Pass |
| Chrome | 768px | Main layout | Side-by-side preview | ⬜ Pass |
| Chrome | 1440px | Code output | Full syntax highlighting visible | ⬜ Pass |
| Firefox | 320px | Drag-drop visual feedback | Blue border appears | ⬜ Pass |
| Firefox | 1024px | Preview iframe | Renders without scroll | ⬜ Pass |
| Safari | All sizes | Font rendering | System fonts, crisp | ⬜ Pass |
| Safari | 768px | Modal/dialog | Centered, backdrop blur | ⬜ Pass |
| Edge | 320px | Buttons | Touch-friendly (min 44px height) | ⬜ Pass |
| Edge | 1440px | Code line numbers | Aligned, readable | ⬜ Pass |
| All | 320px | Login button | Always visible, not hidden | ⬜ Pass |
| All | 768px+ | Two-column layout | Upload left, output right | ⬜ Pass |
| All | All | Dark mode toggle | Works across all themes | ⬜ Pass |

---

## 4. EXPLORATORY TESTING IDEAS

### Functional (4 ideas)

1. **Clipboard paste with mixed content** - Copy text + image together, paste into the app. Observe if only image is extracted.

2. **Framework switching during generation** - Start generation, quickly switch frameworks. Observe if state updates correctly or causes conflicts.

3. **Rapid successive uploads** - Upload 5+ images rapidly by drag-drop. Observe memory usage and if all previews render.

4. **Generated code with special characters** - Use image with unicode text, emojis. Observe if AI preserves characters correctly in output.

### UX/UI (4 ideas)

5. **Loading state perception** - Time how long "Generating code..." shows before user feels anxious. Test if progress indicator helps.

6. **Error message clarity** - Trigger various errors, observe if non-technical users understand what to do next.

7. **Mobile touch targets** - On 320px screen, tap all buttons. Observe if any are too small or misaligned.

8. **Code readability** - Generate long code (200+ lines), observe if syntax highlighting colors have enough contrast.

### Performance (3 ideas)

9. **Large image processing** - Upload 10MB image, measure time-to-preview and memory before/after.

10. **Preview iframe memory leak** - Switch between Code/Preview tabs 20 times, observe if memory grows unbounded.

11. **Converting without debouncing** - Click Generate rapidly 5 times. Observe if multiple API calls fire or if first is cancelled.

### Security (4 ideas)

12. **API key exposure in network tab** - Open DevTools Network tab during generation. Observe if API keys are visible in requests.

13. **Preview iframe escape** - In Preview mode, inspect if iframe has proper sandbox attributes (no scripts/forms).

14. **Stored XSS in generated code** - Generate code with `<script>alert(1)</script>`. Observe if it executes in Preview.

15. **Supabase session token storage** - Check localStorage/sessionStorage. Observe if tokens are stored with appropriate flags.

---

## 5. AUTOMATION SCRIPT (CYPRESS)

```javascript
// cypress/e2e/sliceui-main-flow.cy.js
// Page Object Model for SliceUI main happy path

// ===== Page Objects =====
class SliceUIHomePage {
  visit() {
    cy.visit('/')
  }

  getUploadZone() {
    return cy.get('[data-testid="upload-zone"]')
  }

  getFrameworkCard(frameworkName) {
    return cy.get(`[data-testid="framework-${frameworkName}"]`)
  }

  getGenerateButton() {
    return cy.get('[data-testid="generate-button"]')
  }

  getCodeOutput() {
    return cy.get('[data-testid="code-output"]')
  }

  getCopyButton() {
    return cy.get('[data-testid="copy-button"]')
  }

  getPreviewTab() {
    return cy.get('[data-testid="preview-tab"]')
  }

  getPreviewIframe() {
    return cy.get('[data-testid="preview-iframe"]')
  }

  uploadFile(filePath) {
    this.getUploadZone().selectFile(filePath, { action: 'drag-drop' })
  }

  selectFramework(frameworkName) {
    this.getFrameworkCard(frameworkName).click()
  }

  clickGenerate() {
    this.getGenerateButton().click()
  }

  waitForCodeGeneration() {
    cy.get('[data-testid="loading-state"]', { timeout: 30000 }).should('not.exist')
    this.getCodeOutput().should('be.visible')
  }
}

// ===== Test Suite =====
describe('SliceUI Image to Code Conversion', () => {
  const homePage = new SliceUIHomePage()
  const testImage = 'cypress/fixtures/test-screenshot.png'

  beforeEach(() => {
    // Mock Supabase auth session
    cy.window().then((win) => {
      win.localStorage.setItem('supabase-auth-token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user-123' }
      }))
    })
    
    // Mock Gemini API response
    cy.intercept('POST', '**/generativelanguage.googleapis.com/**', {
      statusCode: 200,
      body: {
        candidates: [{
          content: {
            parts: [{
              text: '// Generated by SliceUI\nexport default function Component() {\n  return <div>Hello World</div>\n}'
            }]
          }
        }]
      }
    }).as('geminiRequest')

    homePage.visit()
  })

  it('TC-001: Complete happy path - Upload, Select, Generate, Preview', () => {
    // Step 1: Upload image
    homePage.uploadFile(testImage)
    homePage.getUploadZone()
      .find('[data-testid="image-preview"]')
      .should('be.visible')
    
    // Step 2: Select framework
    homePage.selectFramework('react-tsx')
    homePage.getFrameworkCard('react-tsx')
      .should('have.class', 'selected')
    
    // Step 3: Generate code
    homePage.clickGenerate()
    cy.get('[data-testid="loading-state"]')
      .should('be.visible')
      .and('contain', 'Generating code...')
    
    // Wait for API call
    cy.wait('@geminiRequest')
    
    // Step 4: Verify code output
    homePage.waitForCodeGeneration()
    homePage.getCodeOutput()
      .should('be.visible')
      .and('contain', 'Hello World')
    
    // Step 5: Test copy functionality
    homePage.getCopyButton().click()
    cy.window().then((win) => {
      win.navigator.clipboard.readText().then((text) => {
        expect(text).to.include('Hello World')
      })
    })
    
    // Step 6: Test preview
    homePage.getPreviewTab().click()
    homePage.getPreviewIframe()
      .should('be.visible')
      .then(($iframe) => {
        const iframeBody = $iframe.contents().find('body')
        cy.wrap(iframeBody).should('contain', 'Hello World')
      })
  })

  it('TC-004: Reject invalid file type', () => {
    cy.fixture('test-file.txt', 'base64').then((fileContent) => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      
      homePage.getUploadZone().selectFile(file, { force: true })
      
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Invalid file type')
    })
  })

  it('TC-005: Reject file exceeding 10MB', () => {
    // Create a mock 11MB file
    const largeFile = new File([new ArrayBuffer(11 * 1024 * 1024)], 'large.png', { 
      type: 'image/png' 
    })
    
    homePage.getUploadZone().selectFile(largeFile, { force: true })
    
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'File too large')
  })

  it('TC-016: API fallback on rate limit', () => {
    // Mock Gemini 429 response
    cy.intercept('POST', '**/generativelanguage.googleapis.com/**', {
      statusCode: 429,
      body: { error: { status: 'RESOURCE_EXHAUSTED' } }
    }).as('geminiRateLimit')

    // Mock Groq fallback
    cy.intercept('POST', '**/api.groq.com/**', {
      statusCode: 200,
      body: {
        choices: [{
          message: {
            content: '// Generated by SliceUI (Groq fallback)\nexport default function Component() {\n  return <div>Fallback</div>\n}'
          }
        }]
      }
    }).as('groqFallback')

    homePage.uploadFile(testImage)
    homePage.selectFramework('react-tsx')
    homePage.clickGenerate()

    cy.wait('@geminiRateLimit')
    cy.wait('@groqFallback')

    cy.get('[data-testid="warning-message"]')
      .should('be.visible')
      .and('contain', 'Using backup AI')
  })
})
```

---

## 6. API TEST CASES

> **Note:** Current implementation has NO server-side API endpoint. These test cases are for the FUTURE `/api/convert` endpoint that should be implemented.

| Test ID | Method + Endpoint | Payload | Expected Status | Expected Response | Priority |
|---------|-------------------|---------|-----------------|-------------------|----------|
| API-001 | POST /api/convert | Valid image (base64), framework: "react-tsx", options: {} | 200 | `{ code: "...", success: true }` | P0 |
| API-002 | POST /api/convert | Missing image field | 400 | `{ error: "missing_image", message: "Image is required" }` | P0 |
| API-003 | POST /api/convert | Missing framework field | 400 | `{ error: "missing_framework", message: "Framework is required" }` | P0 |
| API-004 | POST /api/convert | Invalid framework: "invalid" | 400 | `{ error: "invalid_framework" }` | P1 |
| API-005 | POST /api/convert | Image not base64 string | 400 | `{ error: "invalid_image_format" }` | P1 |
| API-006 | POST /api/convert | No auth header | 401 | `{ error: "unauthorized" }` | P0 |
| API-007 | POST /api/convert | Expired JWT token | 401 | `{ error: "token_expired" }` | P1 |
| API-008 | POST /api/convert | Valid, daily limit exceeded (6th request) | 429 | `{ error: "daily_limit_reached", message: "5 free conversions per day" }` | P0 |
| API-009 | POST /api/convert | Gemini API timeout | 500 | `{ error: "generation_failed", message: "AI service timeout" }` | P1 |
| API-010 | POST /api/convert | Invalid base64 image data | 400 | `{ error: "invalid_image_data" }` | P1 |

---

## 7. SECURITY TESTING CHECKLIST

| Risk Category | Vulnerability Example | Test Method | Tool | Expected Result |
|---------------|----------------------|-------------|------|-----------------|
| A01: Broken Access Control | Unauthenticated user can generate code | Remove auth token, call generate | Burp Suite / DevTools | Request blocked, 401 response |
| A02: Cryptographic Failures | API keys in client-side bundle | Search bundle for API keys | grep / ripgrep on build output | No keys in client code |
| A03: Injection | XSS via generated code in Preview | Inject `<script>alert(1)</script>` | Manual, Browser DevTools | Script blocked by iframe sandbox |
| A04: Insecure Design | No rate limiting on free tier | Send 100 requests in 1 minute | Apache Bench / wrk | Requests throttled after 5/day |
| A05: Security Misconfiguration | CORS allows any origin | Check CORS headers | curl -I -H "Origin: evil.com" | Only allowed origins accepted |
| A06: Vulnerable Components | Outdated dependencies with CVEs | Run `npm audit` | npm audit / Snyk | No high/critical CVEs |
| A07: Auth Failures | Session fixation possible | Check session handling | OWASP ZAP | Session rotates on login |
| Sensitive Data Exposure | Supabase tokens in localStorage | Inspect browser storage | DevTools Application tab | Tokens stored securely (httpOnly cookies preferred) |
| Cookie Flags | Session cookies missing Secure/HttpOnly | Check cookie attributes | DevTools Application tab | Secure, HttpOnly, SameSite=Strict |
| CSRF | No CSRF token on state-changing operations | Send forged POST request | Burp Suite / CSRFTester | Request rejected without token |
| IDOR | Access another user's conversions | Try to access /conversions/{other-user-id} | Postman / curl | Access denied (403) |
| File Upload | Malicious file upload bypass | Upload .exe renamed as .png | Manual | File content validated |
| DoS | Large file causes memory exhaustion | Upload 10MB file repeatedly | Memory profiler | Request rejected or handled gracefully |
| SSRF | AI service URL can be manipulated | Try to change API endpoint | Burp Suite | Endpoint hardcoded/validated |

---

## 8. PERFORMANCE TEST SCENARIOS

### Scenario 1: Normal Load (Baseline)
- **Concurrency:** 10 concurrent users
- **Duration:** 5 minutes
- **Response Time Threshold:** P95 < 3s (AI generation)
- **KPIs:** CPU < 70%, Memory < 80%, Error rate < 1%

### Scenario 2: Peak Load (Traffic Spike)
- **Concurrency:** 50 concurrent users
- **Duration:** 2 minutes
- **Response Time Threshold:** P95 < 5s
- **KPIs:** No 500 errors, queue handling effective

### Scenario 3: Stress Test (Breaking Point)
- **Concurrency:** 100+ concurrent users
- **Duration:** Until failure
- **Goal:** Identify breaking point
- **KPIs:** Monitor graceful degradation, not hard crash

### Scenario 4: Endurance Test (Soak)
- **Concurrency:** 20 users
- **Duration:** 2 hours
- **Goal:** Detect memory leaks
- **KPIs:** Memory should not grow unbounded

### Scenario 5: Image Size Performance
- **Variants:** 100KB, 1MB, 5MB, 10MB
- **Measure:** Upload time, preview render time, API send time
- **Threshold:** All steps < 5s for 10MB file

---

## 9. TEST DATA (VALID & INVALID INPUTS)

| Field | Valid Input | Invalid Input | Expected Error Message |
|-------|-------------|---------------|------------------------|
| Image File Upload | screenshot.png (500KB, PNG) | document.txt | "Invalid file type. Please upload PNG, JPG, or WebP." |
| Image File Upload | photo.jpg (2MB, JPEG) | huge.png (11MB) | "File too large. Maximum size is 10MB." |
| Image File Upload | design.webp (1MB) | corrupted.png | "Invalid image file." |
| Image File Upload | blank.png (1x1 px) | (empty file) | "File is empty." |
| Framework Selection | "react-tsx" | (none selected) | "Please select a framework." |
| Framework Selection | "tailwind" | "invalid-framework" | "Invalid framework selected." |
| Option - Responsive | true (checked) | - | Code includes `@media` queries |
| Option - Dark Mode | true (checked) | - | Code includes dark mode CSS |
| Option - A11y | true (checked) | - | Code includes aria-labels |
| Auth - Email | user@example.com | invalid-email | "Invalid email address." |
| Auth - Password | SecurePass123! | (too short) | "Password must be at least 8 characters." |
| Clipboard Paste | Image from clipboard | Text-only paste | "No image detected in clipboard." |

---

## 10. BUG REPORT TEMPLATE

### Template

```
Bug ID: BUG-XXX
Title: [Short, descriptive title]
Environment: [Browser, OS, Version]
Severity: [Critical / High / Medium / Low]
Priority: [P0 / P1 / P2 / P3]
Reproducibility: [Always / Intermittent / Once]
Affected Component: [Component name]

Steps to Reproduce:
1. [Step 1]
2. [Step 2]
3. [Step 3]

Expected Result:
[What should happen]

Actual Result:
[What actually happens]

Attachments:
[Screenshots, videos, logs]
```

### Filled Example

```
Bug ID: BUG-001
Title: Preview iframe does not render React component with hooks
Environment: Chrome 120, macOS 14
Severity: Medium
Priority: P1
Reproducibility: Always
Affected Component: CodeOutput.tsx (Preview tab)

Steps to Reproduce:
1. Upload a screenshot
2. Select "React TSX" framework
3. Enable "Responsive" option
4. Click Generate
5. Switch to Preview tab

Expected Result:
React component with useState hooks renders in preview iframe

Actual Result:
Blank preview or error: "Hooks can only be called inside the body of a function component"

Attachments:
- screenshot_of_blank_preview.png
- generated_code.txt
```

---

## 11. TEST SUMMARY REPORT TEMPLATE

```
═══════════════════════════════════════════════════════════════════════════════
                    SLICEUI TEST SUMMARY REPORT
                         Sprint [X] Regression Cycle

  Date: [YYYY-MM-DD]
  Tester: [Name]
  Environment: [Staging / Production]
═══════════════════════════════════════════════════════════════════════════════

┌──────────────────────────────────────────────────────────────────────────────┐
│ 1. TEST EXECUTION SUMMARY                                                     │
└──────────────────────────────────────────────────────────────────────────────┘

Total Tests:      [XX]
Passed:           [XX] (XX%)
Failed:           [XX] (XX%)
Blocked:          [XX] (XX%)
Skipped:          [XX] (XX%)

┌──────────────────────────────────────────────────────────────────────────────┐
│ 2. CRITICAL BUGS (P0)                                                         │
└──────────────────────────────────────────────────────────────────────────────┘

Bug ID    Title                                  Severity    Status
───────── ──────────────────────────────────── ────────── ──────────
[BUG-XXX] [Bug title]                           [Critical]  [Open/Fixed]

┌──────────────────────────────────────────────────────────────────────────────┐
│ 3. HIGH PRIORITY BUGS (P1)                                                     │
└──────────────────────────────────────────────────────────────────────────────┘

Bug ID    Title                                  Severity    Status
───────── ──────────────────────────────────── ────────── ──────────
[BUG-XXX] [Bug title]                           [High]      [Open/Fixed]

┌──────────────────────────────────────────────────────────────────────────────┐
│ 4. KEY FINDINGS                                                               │
└──────────────────────────────────────────────────────────────────────────────┘

[Positive findings, improvements observed, areas of concern]

┌──────────────────────────────────────────────────────────────────────────────┐
│ 5. BLOCKERS                                                                   │
└──────────────────────────────────────────────────────────────────────────────┘

[Items blocking release, if any]

┌──────────────────────────────────────────────────────────────────────────────┐
│ 6. RELEASE READINESS                                                          │
└──────────────────────────────────────────────────────────────────────────────┘

Recommendation: [READY / NOT READY / READY WITH CONDITIONS]

Rationale:
[Explanation for recommendation]

┌──────────────────────────────────────────────────────────────────────────────┐
│ 7. NEXT STEPS                                                                 │
└──────────────────────────────────────────────────────────────────────────────┘

1. [Action item 1]
2. [Action item 2]
3. [Action item 3]

═══════════════════════════════════════════════════════════════════════════════
Report generated by: [Name]
Approved by: [QA Lead Name]
═══════════════════════════════════════════════════════════════════════════════
```

---

## Assumptions & Notes

1. **API Endpoint:** The `/api/convert` endpoint does not exist yet. API test cases are written for the planned implementation.

2. **Rate Limiting:** The 5/day per IP limit is NOT currently implemented. Test cases assume it will be added.

3. **Authentication:** Supabase Auth is used but session management details are assumed based on typical Supabase implementation.

4. **Preview Limitations:** Svelte and Flutter previews cannot render in-browser. Test cases account for informational messages.

5. **AI Fallback:** Gemini → Groq fallback is implemented but not fully testable without actual rate limiting.

6. **Client-Side Security:** Current implementation exposes API keys in client-side code. Security test cases highlight this as a critical issue requiring server-side refactoring.

---

*Document Version: 1.0*  
*Last Updated: 2026-05-13*
