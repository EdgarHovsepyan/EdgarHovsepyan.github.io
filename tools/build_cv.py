"""Builds the ATS CV as .docx and .pdf from one content definition.

Run from the repo root:  python3 tools/build_cv.py
Single column, standard headings, no tables, icons or text boxes.
"""

from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

OUT = "public/cv/Edgar_Hovsepyan_CV_ATS"

NAME = "Edgar Hovsepyan"
HEADLINE = "Senior iGaming Engineer | Games, Platform and Tooling | PixiJS / Three.js, TypeScript, C#/.NET, Kubernetes"
CONTACT = [
    "Yerevan, Armenia. Remote worldwide or on site | +374 94 276 656 | edgarhovsepyan94@gmail.com",
    "linkedin.com/in/edgar-hovsepyan-03044117b | github.com/EdgarHovsepyan | edgarhovsepyan.github.io",
]

SUMMARY = (
    "I build casino games and the services they run on. At RedCore (RC Games) I ship games (Plinko, Dice, "
    "Mines) and the platform under them: a standalone RNG service with verifiable fairness, bet history on "
    "ClickHouse, Keycloak-based auth and GitOps delivery on Kubernetes across dev, preprod and prod. Before "
    "that I spent seven years shipping 50+ casino titles in PixiJS, Three.js and WebGL, and four years leading "
    "a 10-person Unity team. I work test-first and leave teams with docs and reusable AI agent skills."
)

EXPERIENCE = [
    (
        "Senior Software Engineer, Game Platform",
        "RedCore (RC Games), RC Research team | Yerevan",
        "Aug 2026 – Present",
        [
            "Built a standalone random-number service for real-money games from design to production: a token-verified generation API, a version-pinned algorithm with golden-vector parity, no partial results under overload or interruption, recovery after a lost response, a CI performance gate, soak tests and deploy smoke checks on every environment.",
            "Delivered the Plinko game with the team: tech design and test plan, provably fair round verification by round ID, checksummed configurations (8 to 16 rows, three volatilities), \"My Bets\", and ball paths drawn from the RNG service. Wrote the shared skill other games use to integrate it.",
            "Shipped game work beyond Plinko: Dice (assets, controls, layout, gated deploy), the autoplay epic for Mines, and contributions to the mini-games line.",
            "Set up the bet-history stack on Kubernetes: ClickHouse provisioning, service and client deployment per environment, session-token handoff to the game client and service-to-service catalog lookups.",
            "Built platform pieces on dev, preprod and prod: greenfield Keycloak, IRSA, SSM and External Secrets for Consul, Keycloak and Redis, an EFS storage class, and Helm chart templates promoted through environments with Argo CD.",
            "Drove the migration off a legacy platform: decommissioned three games' Kubernetes workloads, moved Cloudflare zones and ran the DNS cutover with end-to-end checks on all three environments.",
            "Tightened delivery for the group: merge trains on every repository, environment-specific runners, a version gate before post-deploy checks, canary and rollback with smoke checks on prod, and promotion blocked on missing or failed gates.",
            "Team tooling: wrote the engineering handbook (about 65 pages, CI-built private site), the group MR template, and a shared library of AI agent skills (authored 10 of 19, six other contributors) with security scanning of every changed skill in CI.",
        ],
    ),
    (
        "Senior Game Developer",
        "Pascal Gaming / BetConstruct | Yerevan",
        "Mar 2024 – Aug 2026",
        [
            "Shipped Pascal Gaming's casino catalogue full cycle in PixiJS v8 and TypeScript across 14+ game verticals: slots (free spins, bonus rounds, cluster pays, cascades, expanding wilds, multiplier math), live and 3D roulette, blackjack, baccarat, Hi-Lo, crash, Plinko, Mines, poker and Hold'em, Deal-or-No-Deal, arcade and branded titles.",
            "Co-developed Non-Stop Roulette as part of the game team: SBC Awards Americas 2025, Game of the Year shortlist (team credit; certified in Colombia, Peru and Brazil).",
            "Built the studio's Spine and particle VFX web editor, used daily by 15 people on the 21-animator art team, and an AI animation-benchmark and QA tool that flags off-spec animations before integration.",
            "Built and ran the team's Claude Code and MCP build pipeline: asset packing, atlas generation and prototyping.",
            "Held win-ceremony rendering at 120 fps on mid-tier mobile with draw-call batching, GPU instancing and zero-GC object pooling.",
            "Mentored mid and junior developers through code reviews, pairing and onboarding.",
            "Selected titles with public fun-mode demos: Flaming Heart, Golden Tree, Sugar Balloon, Franken Alive, Juicy Storm, Super Blaize, Multiplier Blackjack, Bet on Poker, Mega Plinko.",
        ],
    ),
    (
        "Team Lead, Metaverse Platform Engineer",
        "Fastexverse / PandaMR",
        "2020 – Mar 2024",
        [
            "Led 10 Unity developers plus front-end, back-end and QA, taking the metaverse platform from prototype to production as founding engineer.",
            "Shipped live in-world events and ticketing, 3D worlds for VR, AR and WebXR, and in-world casino and iGaming brand integrations.",
            "Delivered wallet and on-chain payment integrations inside the platform.",
            "Introduced the team's first AI tooling and led its adoption.",
        ],
    ),
    (
        "Game Developer (Freelance)",
        "Extra Studio LLC | alongside the Fastexverse role",
        "2019 – 2023",
        [
            "Built 40+ mini games, mini table games and playable ads, the studio's highest-volume line, from concept to art integration.",
            "Tuned gameplay in Three.js and PlayCanvas for desktop and mobile; mentored junior developers.",
        ],
    ),
    (
        "Three.js Developer",
        "Arakssys",
        "2018 – 2019",
        ["Built virtual rooms and computer-vision measurement for apartment renovation and visualization in Three.js and React."],
    ),
    (
        "Front-End Developer",
        "WebApricot",
        "2017 – 2018",
        ["Delivered responsive cross-browser pages and early Three.js and WebGL builds."],
    ),
]

PROJECTS = [
    "AI agents command center (personal initiative): a twice-daily agent pipeline over GitLab, Jira, Slack, calendar and mail that builds a prioritized briefing, a searchable case memory and deterministic alerts, packaged as a self-updating tool with backups and rollback.",
    "Interactive 3D portfolio, edgarhovsepyan.github.io: Three.js and WebGL site with a scroll-driven 3D corridor, a particle portrait and a hand-written raymarched GLSL background.",
    "SART Gallery (personal build): an English and Arabic commerce platform for a contemporary art gallery, in Next.js and TypeScript, with timed viewing rooms and server-authoritative reservations.",
    "3D bet-on games: 3D Roulette, 3D Hi-Lo, 3D Baccarat, Blackjack and Deal-or-No-Deal.",
    "Side projects: a WhatsApp AI sales agent (RAG, Pinecone), an indie slot studio on Stake Engine, and an EV-charging platform on NestJS and OCPP.",
]

SKILLS = [
    ("Game Platform & Backend", "C# / .NET services, RNG and provably fair design, idempotent bet and wallet flows, ClickHouse, PostgreSQL, Redis, REST, SignalR, WebSockets"),
    ("Cloud & Delivery", "Kubernetes, Helm, Argo CD (GitOps), Terraform, AWS (IRSA, SSM, EFS), Cloudflare, Keycloak (OIDC), Consul, GitLab CI (merge trains)"),
    ("Quality", "test-first, BDD / Gherkin, system and contract tests, Playwright, load and soak tests, golden vectors"),
    ("Front-End & Rendering", "TypeScript, PixiJS v7/v8, Three.js, WebGL / WebGPU, GLSL / WGSL, Spine, 120 fps mobile targets"),
    ("AI Engineering", "Claude Code, agent skills and harness, MCP, RAG (Pinecone), security scanning of AI tooling"),
    ("Leadership", "led a 10-developer Unity team, mentoring, engineering documentation"),
    ("Languages", "Armenian (native), Russian (full professional), English (professional working)"),
]

EDUCATION = [
    "Anthropic, AI Engineering: Claude, MCP and Agents. Self-directed course (not a degree), 2024 – 2025",
    "Polytechnic University of Armenia, Electrical Energy, 2014 – 2018",
    "TT-Soft and LevelUp, Web Programming (JS / React), 2017 – 2018",
]

AWARDS = [
    "SBC Awards Americas 2025, Game of the Year shortlist: Non-Stop Roulette, Pascal Gaming (team credit)",
    "B.F.T.H. Arena Awards 2024, Finalist",
]


def build_docx() -> None:
    doc = Document()
    section = doc.sections[0]
    section.left_margin = section.right_margin = Cm(1.7)
    section.top_margin = section.bottom_margin = Cm(1.4)
    base = doc.styles["Normal"]
    base.font.name = "Calibri"
    base.font.size = Pt(10)
    base.paragraph_format.space_after = Pt(2)

    def para(text="", bold=False, size=None, after=2, align=None):
        p = doc.add_paragraph()
        run = p.add_run(text)
        run.bold = bold
        if size:
            run.font.size = Pt(size)
        p.paragraph_format.space_after = Pt(after)
        if align:
            p.alignment = align
        return p

    def heading(text):
        p = doc.add_heading(text, level=1)
        for run in p.runs:
            run.font.size = Pt(12)
            run.font.name = "Calibri"
            run.font.color.rgb = RGBColor(0, 0, 0)
        p.paragraph_format.space_before = Pt(8)
        p.paragraph_format.space_after = Pt(3)

    def bullet(text):
        p = doc.add_paragraph(text, style="List Bullet")
        p.paragraph_format.space_after = Pt(1.5)

    para(NAME, bold=True, size=20, after=1)
    para(HEADLINE, bold=True, size=10.5, after=2)
    for line in CONTACT:
        para(line, size=9.5, after=0)

    heading("Summary")
    para(SUMMARY)
    heading("Experience")
    for role, org, dates, bullets in EXPERIENCE:
        para(f"{role}, {org}", bold=True, after=0)
        para(dates, after=1)
        for item in bullets:
            bullet(item)
    heading("Selected Projects")
    for item in PROJECTS:
        bullet(item)
    heading("Skills")
    for label, text in SKILLS:
        p = doc.add_paragraph()
        p.add_run(f"{label}: ").bold = True
        p.add_run(text)
        p.paragraph_format.space_after = Pt(1.5)
    heading("Education")
    for item in EDUCATION:
        bullet(item)
    heading("Awards")
    for item in AWARDS:
        bullet(item)
    doc.core_properties.author = NAME
    doc.core_properties.title = f"{NAME}, CV"
    doc.save(OUT + ".docx")


def build_pdf() -> None:
    body = ParagraphStyle("body", fontName="Helvetica", fontSize=9.3, leading=11.6, spaceAfter=2)
    styles = {
        "name": ParagraphStyle("name", fontName="Helvetica-Bold", fontSize=19, leading=22, spaceAfter=2),
        "headline": ParagraphStyle("headline", fontName="Helvetica-Bold", fontSize=9.8, leading=12, spaceAfter=3),
        "contact": ParagraphStyle("contact", parent=body, fontSize=8.8, leading=11, spaceAfter=0),
        "h": ParagraphStyle("h", fontName="Helvetica-Bold", fontSize=11, leading=13, spaceBefore=7, spaceAfter=3),
        "role": ParagraphStyle("role", fontName="Helvetica-Bold", fontSize=9.6, leading=12, spaceBefore=3, spaceAfter=0),
        "dates": ParagraphStyle("dates", parent=body, spaceAfter=1),
        "bullet": ParagraphStyle("bullet", parent=body, leftIndent=10, bulletIndent=0, spaceAfter=1.2),
    }
    esc = lambda text: text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    flow = [Paragraph(esc(NAME), styles["name"]), Paragraph(esc(HEADLINE), styles["headline"])]
    flow += [Paragraph(esc(line), styles["contact"]) for line in CONTACT]

    def heading(text):
        flow.append(Paragraph(text, styles["h"]))

    def bullets(items):
        for item in items:
            flow.append(Paragraph(esc(item), styles["bullet"], bulletText="-"))

    heading("Summary")
    flow.append(Paragraph(esc(SUMMARY), body))
    heading("Experience")
    for role, org, dates, items in EXPERIENCE:
        flow.append(Paragraph(esc(f"{role}, {org}"), styles["role"]))
        flow.append(Paragraph(esc(dates), styles["dates"]))
        bullets(items)
    heading("Selected Projects")
    bullets(PROJECTS)
    heading("Skills")
    for label, text in SKILLS:
        flow.append(Paragraph(f"<b>{esc(label)}:</b> {esc(text)}", body))
    heading("Education")
    bullets(EDUCATION)
    heading("Awards")
    bullets(AWARDS)
    flow.append(Spacer(1, 1))

    SimpleDocTemplate(
        OUT + ".pdf",
        pagesize=A4,
        leftMargin=16 * mm,
        rightMargin=16 * mm,
        topMargin=13 * mm,
        bottomMargin=12 * mm,
        title=f"{NAME}, CV",
        author=NAME,
    ).build(flow)


def build_markdown() -> None:
    lines = [f"# {NAME}", f"## {HEADLINE}", "", *CONTACT, "",
             "> Generated from `tools/build_cv.py`, the single source for the ATS CV (`.docx` and `.pdf`).",
             "> Edit the script, then run `python3 tools/build_cv.py`; do not edit this file by hand.",
             "", "## Summary", "", SUMMARY, "", "## Experience", ""]
    for role, org, dates, bullets in EXPERIENCE:
        lines += [f"### {role}, {org}", dates, ""] + [f"- {item}" for item in bullets] + [""]
    lines += ["## Selected Projects", ""] + [f"- {item}" for item in PROJECTS]
    lines += ["", "## Skills", ""] + [f"- **{label}:** {text}" for label, text in SKILLS]
    lines += ["", "## Education", ""] + [f"- {item}" for item in EDUCATION]
    lines += ["", "## Awards", ""] + [f"- {item}" for item in AWARDS] + [""]
    with open("CV-2026.md", "w", encoding="utf-8") as handle:
        handle.write("\n".join(lines))


if __name__ == "__main__":
    build_docx()
    build_pdf()
    build_markdown()
    print("built", OUT + ".docx", OUT + ".pdf")
