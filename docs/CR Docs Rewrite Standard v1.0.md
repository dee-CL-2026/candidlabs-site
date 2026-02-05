# **CR DOCS REWRITE STANDARD**

**v1.0 --- Foundation Phase**

## **1. Purpose**

This standard governs how legacy CR documents are rewritten to align
with **CANDID OS --- MANIFEST v1.0.1**.

Its purpose is to ensure that all rewritten documentation:

-   reflects current doctrine

-   preserves architectural intent

-   avoids accidental re-introduction of invalid assumptions

-   remains auditable, intentional, and reversible

This standard is **procedural**, not doctrinal.\
The Manifest remains the sole source of doctrine.

## **2. Authority Hierarchy (Non-Negotiable)**

When rewriting any document, authority is resolved in this order:

1.  **CANDID OS --- MANIFEST v1.0.1** (Doctrine)

2.  **Human instruction**

3.  **This Rewrite Standard**

4.  **Legacy document content**

5.  **AI interpretation**

If a conflict exists, the rewrite must defer **upward**, never downward.

## **3. Mandatory Conceptual Model**

All rewritten documents must conform to the following conceptual model.

### **3.1 Artefact Trichotomy (Required)**

Every document must clearly align with **one** of the following:

-   **Doctrine\
    > **Foundational intent, principles, invariants\
    > (Rare; generally limited to the Manifest)

-   **Executable Truth\
    > **What the system actually does\
    > (Authoritative source = repository / runtime systems)

-   **Derived Artefacts\
    > **Outputs, reports, decks, summaries\
    > (Disposable; regenerated from Executable Truth)

Documents must **not** blur these categories.

### **3.2 Hub / Spoke Assumptions (Required)**

Rewritten documents must assume:

-   **Hub\
    > **Centralised, pure logic and configuration\
    > No execution context, no UI, no environment coupling

-   **Spokes\
    > **Execution contexts only\
    > Thin, scoped, and dependent on Hub logic

Documents must **not**:

-   embed logic inside Spokes

-   describe behaviour as database-specific unless explicitly true

-   treat physical storage or file location as architectural truth

## **4. Rewrite Scope Rules**

### **4.1 What Rewrites MAY Do**

Rewrites may:

-   reframe structure to align with doctrine

-   rename concepts to reflect current intent

-   remove invalid assumptions

-   collapse redundant sections

-   introduce clarity where intent was implicit

### **4.2 What Rewrites MUST NOT Do**

Rewrites must not:

-   introduce new systems, tools, or invariants

-   invent implementation details

-   refactor for "best practice" or elegance

-   speculate about future features

-   override or reinterpret doctrine

If a rewrite would require any of the above, it must **stop** and
escalate.

## **5. Structural Expectations for Rewritten Docs**

Unless explicitly inappropriate, rewritten documents should follow this
order:

1.  **Purpose & Scope**

2.  **Role within Candid OS**

3.  **Conceptual Model (what this document describes)**

4.  **Boundaries & Non-Goals**

5.  **Operational / Procedural Content**

6.  **Dependencies & Interfaces**

7.  **Change & Versioning Notes**

Not all sections are mandatory, but **Purpose**, **Role**, and
**Boundaries** are.

## **6. Language & Tone Constraints**

Rewritten documents must be:

-   operational, not aspirational

-   explicit, not implied

-   deterministic, not permissive

Avoid:

-   "should", "ideally", "in the future"

-   tutorial tone

-   greenfield framing

Prefer:

-   "is", "must", "does not"

-   scoped statements

-   traceable intent

## **7. Treatment of Legacy Content**

Legacy content is treated as:

-   **input for intent**

-   **not authority**

During rewrite:

-   salvage intent where aligned

-   discard structure where misaligned

-   explicitly remove deprecated concepts

Silence is not preservation.\
If something disappears, it is assumed **intentionally removed**.

## **8. AI Usage Rule (Explicit)**

AI tools (including NotebookLM and ChatGPT):

-   assist with analysis, drafting, and consistency checks

-   do not decide structure

-   do not introduce rules

-   do not resolve ambiguity without human confirmation

All AI output is **advisory until accepted**.

## **9. Exit Criteria for a "Complete" Rewrite**

A rewritten document is considered complete only when:

-   it aligns with Manifest doctrine

-   it clearly fits one artefact class

-   it contains no implicit legacy assumptions

-   it does not duplicate Executable Truth

-   it can be read without reference to deprecated docs

**End of Rewrite Standard v1.0**
