=== DOCUMENT: CLDoc --- Candid Labs Document Template ===

#### DOCUMENT INFORMATION

**Title:** Candid Labs Document Template**Document Code:**
CLDoc-000**Version:** v1.1**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### VERSION CONTROL

Version,Date,Author,Summary of Changes

v1.0,2025-11-15,DW,Initial release

v1.1,2026-01-02,System Assistant,Updated to align with Artefact
Trichotomy (Manifest v1.0.1)

#### 1. Purpose

This document standardises the visual and structural requirements for
all internal business operating system documentation 1. It ensures that
all artefacts are uniform, legible, and compatible with knowledge
synthesis layers 2.

#### 2. Scope

In-scope: SOPs, reference guides, templates, and
frameworks.Out-of-scope: Repository-level code (Executable Truth) and
raw external data exports.

#### 3. Role within Candid OS

This is a **Doctrine** artefact. It governs the interpretation and
presentation of all other documentation to maintain \"investor-ready
governance\" 3, 4.

#### 4. Mandatory Conceptual Classification

Every document must explicitly state its classification under the
**Artefact Trichotomy**:

-   **Doctrine:** Governs intent, interpretation, and invariants (e.g.,
    > Manifest).

-   **Executable Truth:** Governs behavior; authority resides in the
    > repository code and runtime.

-   **Derived Artefacts:** Disposable generated outputs (e.g., reports,
    > decks).

#### 5. Normative Formatting Rules 5-7

-   **Layout:** A4, Portrait, Standard Google Docs margins.

-   **Typography:** Google Sans (preferred) or Arial. Body: 11pt. H1:
    > 20pt (bold). Line spacing: 1.15.

-   **Colour Palette:** Candid Teal (#2EBCCF), Deep Navy (#0F1C2C),
    > Slate Grey (#738290).

-   **Tables:** Header row shaded light grey, text left-aligned (numeric
    > centred), no merged cells.

#### 6. Required Structure 6

1.  Document Information

2.  Version Control Table

3.  Purpose & Scope

4.  Role within Candid OS (Trichotomy)

5.  Conceptual Model / Operational Content

6.  Boundaries & Non-Goals

7.  Related Documents

8.  Change Log

#### 7. Related Documents

-   CANDID OS --- MANIFEST v1.0.1

-   CR Docs Rewrite Standard v1.0

=== DOCUMENT: CR Doc 1 --- Master Index & Documentation Map ===

#### DOCUMENT INFORMATION

**Title:** Master Index & Documentation Map**Document Code:** CR Doc
1**Version:** v1.1**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

This document provides a deterministic map of all active documentation
within the Candid OS ecosystem 8. It enforces traceability and
intentional design 9.

#### 2. Role within Candid OS

This is a **Doctrine** artefact. It defines the conceptual hierarchy and
source-of-truth locations for all other documents 4.

#### 3. System Map (Conceptual Hierarchy)

Documentation is organised by **Principles and Functions**, not physical
folder locations 10.

**3.1 Core Doctrine**

-   CANDID OS --- MANIFEST: Foundational intent and non-negotiable
    > invariants.

-   CR Docs Rewrite Standard: Procedural rules for documentation
    > hardening.

**3.2 Operational Spoke Guides**

-   CR Doc 2 --- SalesDB Spoke Guide: Configuration and schema for sales
    > data.

-   CR Doc 4 --- Data Governance: Release safety and mechanical
    > guardrails.

**3.3 Procedural Frameworks**

-   CR Doc 5 --- Manual Migration SOPs: Step-by-step enforcement of
    > system changes.

**3.4 Reference & Dictionary**

-   CR Doc 4A --- System Architecture Diagram: Visual mapping of intent.

-   CR Doc 4C --- Data Dictionary: Field definitions for deterministic
    > behavior.

**3.5 Derived Artefacts (Disposable)**

-   CLDoc 7 --- Monthly Partner Deck Template: Standards for generated
    > output.

#### 4. Boundaries

-   This map does not list individual scripts (Executable Truth).

-   Physical Drive locations are implementation details and do not
    > dictate the map 10.

#### 5. Related Documents

-   CANDID OS --- MANIFEST v1.0.1

=== DOCUMENT: CR Doc 2 --- SalesDB Spoke Guide ===

#### DOCUMENT INFORMATION

**Title:** SalesDB Spoke Guide**Document Code:** CR Doc 2**Version:**
v2.0**Owner:** Candid Labs**Maintainer:** Platform Lead**Last Updated:**
2026-01-02

#### 1. Purpose

This guide defines the data schema, configuration requirements, and
Spoke-specific interfaces for the Sales Database 11. It ensures raw
sales data is transformed into a normalised dataset 12.

#### 2. Role within Candid OS

This is an **Executable Truth Reference** artefact. It describes the
state and schema of a specific Spoke within the Hub-and-Spoke
architecture 10.

#### 3. Conceptual Model (The Spoke Interface)

The SalesDB Spoke exists as an execution context. **Pure Logic** is
centralised in the Hub; the Spoke holds the data and configuration 10,
13.

**3.1 Data Schema**

-   RECEIVABLE_DETAIL_RAW: Spoke entry point for external financial
    > data.

-   SALES_REVENUE_MASTER: Normalised output table used for Derived
    > Artefacts 14.

-   CONFIG_MAPPING: Local source of truth for venue/account
    > normalization.

**3.2 Spoke Utilities**Functionality is triggered via Spoke-specific
menus, which invoke Hub-centralised logic 9, 15.

-   Sales DB Tools: Orchestrates cleaning and master rebuild.

#### 4. Boundaries & Non-Goals

-   **Logic Isolation:** Logic must not be embedded in this Spoke; it
    > must reference the Hub 10.

-   **No Code Documentation:** This document describes the *schema and
    > role*, not the *code* 16.

#### 5. Non-Negotiable Invariants

-   **No-Strings Mandate:** Hardcoded identifiers for sheets or ranges
    > are forbidden 9.

-   **Determinism:** Rebuilds must be predictable and repeatable 9.

#### 6. Related Documents

-   CR Doc 4C --- Data Dictionary

-   CR Doc 5 --- SOP Library

=== DOCUMENT: CR Doc 3 --- System Architecture ===

#### STATUS: DEPRECATED / ABSORBED

**Reason for Deprecation:**The architectural intent, high-level
principles, and component definitions previously contained in CR Doc 3
have been consolidated into **CANDID OS --- MANIFEST v1.0.1**
(Doctrine). Maintaining a separate architecture document creates a risk
of duplicating Truth and violating the **Single Source of
Configuration** invariant 9, 17.

**Authority Location:**

-   **Doctrine & Principles:** CANDID OS --- MANIFEST v1.0.1.

-   **Visual Representation:** CR Doc 4A --- System Architecture
    > Diagram.

-   **Executable Logic:** The OS Repository (Executable Truth).

=== DOCUMENT: CR Doc 4 --- Data Governance & Release Safety ===

#### DOCUMENT INFORMATION

**Title:** Data Governance & Release Safety**Document Code:** CR Doc
4**Version:** v2.0**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

Defines the mechanical guardrails and environmental discipline required
to maintain system integrity 18. It governs how changes move from
development to production 19.

#### 2. Role within Candid OS

This is a **Doctrine** artefact. It defines the \"Release Safety &
Environment Discipline\" mandated by the Manifest 19.

#### 3. Release Safety Discipline

Candid OS enforces a strict separation between development activity and
production execution 19.

**3.1 Branch Discipline**

-   main: Represents the last known good, production-aligned state.

-   Development occurs on disposable **branches** only 19.

**3.2 Production Push Authority**

-   Only the main branch is permitted to push to production scriptIds.

-   Unauthorized pushes are invalid by definition 20.

**3.3 Mechanical Guardrails**Guardrails are used to make invalid states
unrepresentable 21.

-   Push blockers: Prevent execution outside the main branch 22.

-   .clasp.json: Authoritative bindings between repository code and
    > production runtime.

#### 4. Testing Protocols

-   Testing must be explicit, parameter-driven, and reversible 22.

-   Mutation of production systems during testing is strictly prohibited
    > 20.

#### 5. Boundaries & Non-Goals

-   This document does not define business rules (Sales/Production).

-   It does not list individual users; access is governed by mechanical
    > environment rules 23.

#### 6. Related Documents

-   CANDID OS --- MANIFEST v1.0.1 (Section 9)

=== DOCUMENT: CR Doc 4A --- System Architecture Diagram ===

#### DOCUMENT INFORMATION

**Title:** System Architecture Diagram**Document Code:** CR Doc
4A**Version:** v1.1**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

Provides a visual representation of the Candid OS data ecosystem and
logical flow 24.

#### 2. Role within Candid OS

This is an **Executable Truth Reference** artefact. It serves the
\"inspectable\" requirement of the system 9.

#### 3. Conceptual Model: Hub-and-Spoke

The system architecture is a **Hub-and-Spoke** model 10, 13.

-   **Hub (Pure Logic):** Centralised logic, configuration, and
    > invariants. No environment coupling.

-   **Spokes (Execution Contexts):** Isolated functional areas (e.g.,
    > Sales DB, Production DB) that depend on Hub logic.

#### 4. System Components 25, 26

1.  **Inputs:** Financial (Xero), Operational (KMI), and Manual
    > metadata.

2.  **Processing (Hub):** Standardised Apps Scripts for cleaning and
    > normalization.

3.  **Storage (Spokes):** Spoke-specific Google Sheets.

4.  **Output (Derived):** Looker Dashboards and Monthly Reporting Packs.

#### 5. Maintenance Rules

-   The diagram must be updated immediately upon any change to Spoke
    > interfaces or logical flow 27.

-   Icons and layers must follow the **Diagram Standards** defined in
    > CLDoc-000 7.

=== DOCUMENT: CR Doc 4B --- Script Index ===

#### STATUS: DEPRECATED / ABSORBED

**Reason for Deprecation:**Manual script indexing is a \"drive-by\"
summary that creates a redundant source of authority, violating the
**Single Source of Configuration** invariant 9. The Manifest defines
**Executable Truth** as the repository itself 4.

**Authority Location:**

-   **System Behavior:** Authoritative source is the code repository in
    > the IDX environment 28.

-   **Functional Intent:** Summarised in Spoke guides (e.g., CR Doc 2).

=== DOCUMENT: CR Doc 4C --- Data Dictionary ===

#### DOCUMENT INFORMATION

**Title:** Data Dictionary**Document Code:** CR Doc 4C**Version:**
v1.1**Owner:** Candid Labs**Maintainer:** Platform Lead**Last Updated:**
2026-01-02

#### 1. Purpose

Defines the standardised format and business rules for every field
within the ecosystem 29. It ensures determinism and alignment with the
No-Strings Mandate 9.

#### 2. Role within Candid OS

This is an **Executable Truth Reference** artefact. It describes the
data primitives used by the system logic 29.

#### 3. Operational Standards

-   **Naming:** Column headers must use PascalCase (e.g., Invoice_Date).

-   **Normalization:** All currency values must be normalised to IDR 30.

-   **Determinism:** Field definitions are static; changes require a
    > Manual Migration Protocol.

#### 4. Core Field Definitions (Reference) 30, 31

Field Name,Data Type,Source,Validation

Transaction_ID,Text,Derived,Regex \\d{8}-\\d{4}

Quantity_Cases,Number,Derived,Quantity_Cans / 24

Account_ID,Text,Derived,Hash-based unique key

#### 5. Boundaries

-   This document does not store data; it describes field metadata.

-   It does not decide logic; it documents the required inputs for
    > logic.

=== DOCUMENT: CR Doc 5 --- SOP Library (Manual Migration Protocol) ===

#### DOCUMENT INFORMATION

**Title:** SOP Library (Manual Migration Protocol)**Document Code:** CR
Doc 5**Version:** v1.0**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

Enforces the **Manual Migration Protocol** for all operational tasks and
system changes 28. It ensures all actions are intentional, reviewable,
and reversible 28.

#### 2. Role within Candid OS

This is a **Doctrine** artefact. It defines the procedural rigor
required to make the business operable and auditable 32.

#### 3. The Manual Migration Protocol

Every process follows three mandatory stages:

1.  **Audit:** Verify current system state and existing behavior.

2.  **Map:** Define intent, dependencies, and expected outcomes.

3.  **Refactor:** Apply changes deliberately and incrementally.

#### 4. Operational SOPs 33-36

**4.1 Spoke Refresh (Sales/Production)**

-   **Action:** Import raw data into the entry-point tab.

-   **Execution:** Run Hub-linked orchestrator via the Spoke menu.

-   **Verification:** Validate totals against source systems (Xero/KMI)
    > and run the TAB STRUCTURE checker.

**4.2 Reporting Update (Looker)**

-   **Action:** Trigger data refresh in the reporting environment.

-   **Verification:** Confirm that metrics match the validated Spoke
    > output 37.

**4.3 Change Control**

-   **Action:** All system updates must occur on branches and pass
    > through the mechanical guardrails defined in CR Doc 4 38.

#### 5. Non-Negotiable Invariants

-   **Intentional Change Only:** No \"drive-by\" optimisations or
    > cleanups 9.

-   **Determinism:** Predictable behavior is required; manual overrides
    > must be documented.

=== DOCUMENT: CR Doc 6 --- Script Library ===

#### STATUS: DEPRECATED / ABSORBED

**Reason for Deprecation:**Documentation of code logic and function
definitions is redundant with the **Executable Truth** found in the
system repository 4. The Manifest explicitly forbids ad-hoc collections
of scripts 39.

**Authority Location:**

-   **Executable Truth:** OS Repository in the IDX environment.

-   **System Logic:** Pure logic is centralised in the Hub;
    > environmental Spoke logic is isolated and inspectable via code
    > review.

=== DOCUMENT: CLDoc 7 --- Monthly Partner Deck Template ===

#### DOCUMENT INFORMATION

**Title:** Monthly Partner Deck Template**Document Code:** CLDoc
7**Version:** v1.1**Owner:** Candid Labs**Maintainer:** CEO / Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

Defines the structure for monthly partner reporting to ensure executive
consistency 40.

#### 2. Role within Candid OS

This is a **Derived Artefact Standard**. The template is doctrine, but
the resulting reports are **Disposable** 4.

#### 3. Slide Structure (10-Slide Format) 41-45

1.  Executive Summary

2.  Revenue Pulse

3.  SKU Mix Pulse

4.  Distributor Performance

5.  Key Account Movements

6.  Commercial Highlights

7.  Operations & Supply Chain

8.  Cash & Financial Position

9.  Strategic Priorities

10. Focus for Next Month

#### 4. Automation & Data Sourcing 46

-   Slides 2, 3, 4, 5, 7: Full automation from SALES_REVENUE_MASTER and
    > STOCK_SUMMARY.

-   Slides 1, 8: Partial automation from Spoke outputs.

-   Slides 6, 9, 10: Manual narrative entry by CEO.

#### 5. Boundaries & Non-Goals

-   This deck is for **strategic guidance**, not operational noise 40.

-   Visual density must be avoided; narrative takes precedence over
    > tables 46.

=== DOCUMENT: CR Doc X --- Development Priorities Log ===

#### DOCUMENT INFORMATION

**Title:** Development Priorities Log**Document Code:** CR Doc
X**Version:** v1.1**Owner:** Candid Labs**Maintainer:** Platform
Lead**Last Updated:** 2026-01-02

#### 1. Purpose

Enforces the **Intentional Change Only** invariant by logging and
sequencing all development tasks 9, 47.

#### 2. Role within Candid OS

This is a **Doctrine** artefact. It serves as the primary audit trail
for \"mapping intent\" under the Manual Migration Protocol 28.

#### 3. Operational Log Rules

-   **Traceability:** Every task must be linked to a core pillar or
    > invariant 48.

-   **Intentionality:** No development may begin without a logged
    > priority.

-   **Versioning:** New function creation constitutes a Major Update
    > (e.g., v1.0 -\> v2.0) 48.

#### 4. Current Phase: Foundation Build 39, 47

Immediate priorities:

-   Reporting Layer completion (Looker).

-   Finalisation of Manual Migration SOPs.

-   Implementation of Unleashed Ingestion Spoke.

#### 5. Non-Goals

-   This is not a feature wishlist.

-   Speculative \"best practice\" refactors are strictly prohibited 39.

### CONCISE CHANGE LOG

-   **CLDoc --- Template (v1.1):** Added \"Artefact Trichotomy\"
    > section. Formalised H1 size (20pt). 1, 5

-   **CR Doc 1 --- Master Index (v1.1):** Reframed hierarchy around
    > functions/principles rather than folders. 8, 10

-   **CR Doc 2 --- SalesDB (v2.0):** Complete structural rewrite.
    > Removed logic descriptions; reframed as a Spoke Interface. 11, 16

-   **CR Doc 3 --- System Architecture:** Deprecated. Absorbed by
    > Manifest and Architecture Diagram. 9, 17

-   **CR Doc 4 --- Data Governance (v2.0):** Complete structural
    > rewrite. Reframed around \"Release Safety\" and \"Environment
    > Discipline\". 18, 19

-   **CR Doc 4A --- Architecture Diagram (v1.1):** Updated narrative
    > overview to Hub-and-Spoke logic. 10, 24

-   **CR Doc 4B --- Script Index:** Deprecated. Authority moved to
    > Executable Truth (Repository). 4, 49

-   **CR Doc 4C --- Data Dictionary (v1.1):** Standardised column naming
    > to PascalCase. 29, 50

-   **CR Doc 5 --- SOP Library (v1.0):** Structural rewrite. Reframed as
    > \"Manual Migration Protocol\" enforcement. 28, 51

-   **CR Doc 6 --- Script Library:** Deprecated. Redundant with code
    > repository. 39, 52

-   **CLDoc 7 --- Partner Deck (v1.1):** Classed results as \"Disposable
    > Derived Artefacts\". 4, 40

-   **CR Doc X --- Priorities Log (v1.1):** Explicitly linked
    > development tasks to \"Intentional Change Only\". 9, 47

### LEGACY ASSUMPTIONS REMOVED

-   **Physical Folder Truth:** Removed assumption that file locations
    > define architecture. 10

-   **Spoke-Embedded Logic:** Removed descriptions of logic living
    > inside specific databases. 10

-   **Manual Logic Indexing:** Removed redundant function catalogues
    > that duplicate repository code. 4

-   **AI Authorisation:** Removed \"GPT/Sora\" workflows from formal
    > SOPs as AI is not a source of authority. 53, 54

-   **\"Should\" Language:** Removed permissive/tutorial-style
    > instructions in favour of deterministic mandates. 55

-   **Greenfield Framing:** Removed \"Future Development\" sections that
    > implied speculative feature creep. 39
