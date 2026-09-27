# Security Architecture & Vulnerability Disclosure — KakshaSahay

## 1. Threat Model for Rural Primary Education

KakshaSahay is engineered specifically for low-resource, rural educational settings. The threat model accounts for specific real-world security and privacy constraints:

1. **Shared & Communal Devices:** A teacher's personal phone or a shared school tablet may be handled by multiple staff members, headmasters, or visiting officials.
2. **Hostile or Untrusted Networks:** Rural Wi-Fi hotspots, public cell towers, or shared dongles may be subject to packet inspection, DNS spoofing, or SSL interception.
3. **Child Privacy & Data Protection:** Strict adherence to India's **Digital Personal Data Protection Act (DPDPA 2023)** regarding children's data: zero identifiable student information may be exfiltrated to commercial clouds.
4. **Physical Tampering / Accidental Deletion:** Accidental browser cache clearing by non-technical users must not corrupt educational state or leak third-party application data.

---

## 2. Security Architecture Safeguards

### 2.1. Strict Content Security Policy (CSP)
KakshaSahay enforces a strict, lockdown CSP header and `<meta>` policy:
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://generativelanguage.googleapis.com;
  frame-src https://drive.google.com;
  media-src 'self' blob:;
  img-src 'self' data:;
" />
```
- **Zero Third-Party CDNs:** All JavaScript, stylesheets, and fonts are self-hosted within the application repository or generated via native Web APIs.
- **Strict Framing Boundary:** Only authorized Google Drive field video documentation is allowed to frame; clickjacking protection is enforced on all other surfaces.

### 2.2. Zero DOM XSS Posture
All dynamic user inputs (student names, copilot search queries, custom notes) are sanitized through a two-layer defense:
1. **Safe DOM API Usage:** All dynamic text rendering uses `element.textContent` or `element.replaceChildren()`, entirely avoiding insecure `element.innerHTML` injection.
2. **Explicit Input Sanitizer:** Where HTML rendering is strictly necessary for formatted output, all markup passes through `Sanitizer.escapeHtml()`:
   ```javascript
   function escapeHtml(str) {
     return String(str)
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#39;');
   }
   ```

### 2.3. Cryptographic Storage Vault (Web Crypto API)
Identifiable student records (names, days absent, remediation diagnostic scores) are protected at rest in browser `localStorage`:
- **Algorithm:** PBKDF2 key derivation (SHA-256, 1,000 iterations) generating a 256-bit AES-GCM encryption key.
- **Obfuscation Fallback:** In environments lacking `crypto.subtle` (e.g. legacy WebViews), a UTF-8 XOR cipher prevents casual plaintext inspection.
- **Namespace Isolation:** All storage keys are strictly isolated under the `kakshasahay_*` prefix. Application data resets NEVER touch third-party cookies or host session keys.

### 2.4. Zero Telemetry & Privacy by Default
- **No Cloud Tracking:** KakshaSahay contains **zero** Google Analytics, Facebook Pixels, Sentry beacons, or background phone-home pings.
- **Offline Sovereignty:** Core classroom solvers operate 100% disconnected from the internet.

### 2.5. Developer Edge AI Key Handling
- For optional developer evaluation of Gemini Flash, API keys entered in the developer modal are kept in volatile browser memory or developer localStorage.
- Clear in-app warnings inform developers: *"Developer evaluation only. Do NOT deploy production client-side master keys."*

---

## 3. Reporting a Vulnerability

If you identify a security vulnerability or privacy defect within KakshaSahay:
1. **Do NOT open a public GitHub issue.**
2. Send a detailed report to the maintainer via private security advisory on GitHub or email: `purangsrijan91@gmail.com`.
3. Please include:
   - Steps to reproduce
   - Potential impact
   - Suggested remediation (if known)
4. We aim to acknowledge reports within 48 hours and provide a remediation patch within 7 business days.
