# Owly Labs: The Zero-Budget Startup Guide

This document outlines the technical and operational stack for running Owly Labs with **$0 funding** while maintaining a professional appearance.

## 1. The Tech Stack (Zero Cost)

### A. Email & Identity

**Goal:** Professional email (`name@owly-labs.com`) without paying Google Workspace fees ($6/user/mo).

- **Provider:** **Zoho Mail (Forever Free Plan)**
  - **Includes:** 5 Mailboxes, 5GB per user.
  - **Limit:** Web access & Mobile App only (No IMAP/POP for Outlook desktop).
  - **Setup:**
    1.  Sign up at [Zoho Mail Free](https://www.zoho.com/mail/zohomail-pricing.html) (Scroll down to "Forever Free Plan").
    2.  Verify domain ownership with **Namecheap** (Add TXT record).
    3.  Update **MX Records** in Namecheap Advanced DNS to point to Zoho.

### B. Hosting & Infrastructure

**Goal:** Fast, secure, global website hosting.

- **Provider:** **Vercel** (or Netlify/Render)
  - **Why:** Optimized for Astro/Next.js static sites.
  - **Features:** Global Edge Network, unlimited bandwidth for personal/non-commercial.
  - **Action:** Connect your GitHub repository to Vercel for automatic deployments.

### C. Collaboration & Knowledge

**Goal:** Internal wiki and project management.

- **Provider:** **Notion**
  - **Why:** The free plan is powerful enough to run an entire startup.
  - **Usage:** Build your "Operating System" here (Tasks, CRM, Docs).

### D. Communication

**Goal:** Team chat.

- **Provider:** **Discord**
  - **Why:** Slack's free plan deletes message history after 90 days. Discord keeps it forever.

### E. Artificial Intelligence

**Goal:** Smart features without backend costs.

- **Provider:** **Google AI Studio (Gemini)**
  - **Cost:** Free (currently) for prototyping.
  - **Usage:** Powering the "Digital Concierge" chatbot.

---

## 2. Financial & Legal Roadmap

### Phase 1: The "Unincorporated" Stage (Current)

- **Status:** You are an individual or loose association.
- **Donations:** **NOT Tax-Deductible.**
- **Language:** Do not use the word "Donate" in a legal sense. Use "Support," "Crowdfund," or "Gift."
- **Action:** Remove "501(c)(3)" claims from website.

### Phase 2: Fiscal Sponsorship (Recommended Next Step)

- **What:** Partnering with an existing 501(c)(3) to accept money on your behalf.
- **Pros:** Immediate tax-deductibility, eligibility for grants (Google Ad Grants, etc.).
- **Cons:** 5-10% fee on income.
- **Providers to Research:**
  - Fractured Atlas (Arts focus)
  - CharityVest
  - Open Collective
  - Local Community Foundations

### Phase 3: Incorporation

- **What:** Forming your own Legal Entity (LLC or Nonprofit Corp).
- **Cost:** Varies by state ($50 - $800).
- **Note:** This is required before you can open a business bank account.

---

## 3. Immediate Action Checklist

- [ ] **Website:** Remove "Tax-Deductible" claims (In Progress).
- [ ] **Email:** Set up Zoho Mail MX Records in Namecheap.
- [ ] **Bank:** If accepting personal funds, open a separate personal checking account _solely_ for business use to keep clear records.
- [ ] **Sponsor:** Apply for Fiscal Sponsorship if you want to offer tax deductions.
