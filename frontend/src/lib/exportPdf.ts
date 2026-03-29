import jsPDF from 'jspdf'
import type { AnalysisResult } from '../types/analysis'

function clean(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014\u2015]/g, '-')
    .replace(/\u2026/g, '...')
    .replace(/\u2022/g, '-')
    .replace(/[\u2000-\u200F]/g, ' ')
    .replace(/[\u2028\u2029]/g, ' ')
    .replace(/[\u00A0]/g, ' ')
    .replace(/[^\x00-\xFF]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/  +/g, ' ')
    .trim()
}

const PW = 210
const PH = 297
const ML = 16
const MR = 16
const CW = PW - ML - MR
const FOOTER_Y = PH - 10

let pdf: jsPDF
let cy: number

function addPage() {
  pdf.addPage()
  cy = 18
}

function need(mm: number) {
  if (cy + mm > FOOTER_Y - 4) addPage()
}

function rule(color = 220) {
  pdf.setDrawColor(color, color, color)
  pdf.setLineWidth(0.25)
  pdf.line(ML, cy, ML + CW, cy)
  cy += 4
}

function pageTitle(text: string) {
  need(14)
  pdf.setFontSize(15)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(15, 15, 15)
  pdf.text(text, ML, cy)
  cy += 2
  rule(180)
}

function sectionHeading(text: string) {
  need(10)
  cy += 2
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(130, 130, 130)
  pdf.text(text.toUpperCase(), ML, cy)
  cy += 5
}

function paragraph(text: string, opts?: { size?: number; color?: number; indent?: number; style?: string }) {
  const size = opts?.size ?? 9
  const color = opts?.color ?? 60
  const indent = opts?.indent ?? 0
  const style = opts?.style ?? 'normal'
  const maxW = CW - indent

  pdf.setFontSize(size)
  pdf.setFont('helvetica', style)
  pdf.setTextColor(color, color, color)

  const lines = pdf.splitTextToSize(clean(text), maxW)
  need(lines.length * 5.2)
  pdf.text(lines, ML + indent, cy)
  cy += lines.length * 5.2 + 1
}

function bulletItem(text: string, opts?: { color?: number; indent?: number }) {
  const color = opts?.color ?? 60
  const indent = (opts?.indent ?? 0) + 4
  const maxW = CW - indent - 4

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(color, color, color)

  const lines = pdf.splitTextToSize(clean(text), maxW)
  need(lines.length * 5.2)
  pdf.text('•', ML + indent - 3, cy)
  pdf.text(lines, ML + indent, cy)
  cy += lines.length * 5.2 + 0.5
}

function tagList(items: string[]) {
  if (items.length === 0) return
  paragraph(items.map(clean).join('  ·  '), { size: 8.5, color: 80 })
}

function spacer(mm = 3) { cy += mm }

function statBoxRow(boxes: Array<{ label: string; value: string; sub?: string }>) {
  need(28)
  const boxW = CW / boxes.length
  const boxH = 24
  boxes.forEach((b, i) => {
    const x = ML + i * boxW
    const innerW = boxW - 8
    pdf.setFillColor(245, 245, 245)
    pdf.roundedRect(x, cy, boxW - 2, boxH, 1.5, 1.5, 'F')
    pdf.setFontSize(6.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(140, 140, 140)
    pdf.text(b.label.toUpperCase(), x + 4, cy + 5)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(20, 20, 20)
    const valLines = pdf.splitTextToSize(clean(b.value), innerW).slice(0, 2)
    valLines.forEach((line: string, li: number) => {
      pdf.text(line, x + 4, cy + 12 + li * 5)
    })
    if (b.sub) {
      pdf.setFontSize(6.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(150, 150, 150)
      const subLine = pdf.splitTextToSize(clean(b.sub), innerW)
      pdf.text(subLine[0], x + 4, cy + boxH - 2)
    }
  })
  cy += boxH + 4
}

function verdictHero(result: AnalysisResult) {
  const s = result.synthesis
  const COLORS: Record<string, [number,number,number]> = {
    GO:          [22, 163, 74],
    NO_GO:       [220, 38, 38],
    CONDITIONAL: [180, 100, 0],
  }
  const rgb = COLORS[s.recommendation] ?? [80, 80, 80]
  const label = s.recommendation.replace('_', ' ')

  need(28)
  pdf.setFillColor(248, 248, 248)
  pdf.roundedRect(ML, cy, CW, 26, 2, 2, 'F')
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(...rgb)
  pdf.text(label, ML + 6, cy + 16)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  const scoreLabel = `Score: ${s.opportunity_score} / 10`
  pdf.text(scoreLabel, ML + 6, cy + 23)
  const barX = PW - MR - 56
  const barY = cy + 18
  pdf.setFillColor(210, 210, 210)
  pdf.roundedRect(barX, barY, 52, 3.5, 1, 1, 'F')
  pdf.setFillColor(...rgb)
  pdf.roundedRect(barX, barY, 52 * (s.opportunity_score / 10), 3.5, 1, 1, 'F')

  cy += 30
}

function drawFooters(result: AnalysisResult) {
  const n = pdf.getNumberOfPages()
  for (let i = 1; i <= n; i++) {
    pdf.setPage(i)
    pdf.setFontSize(7)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(180, 180, 180)
    pdf.setDrawColor(220, 220, 220)
    pdf.setLineWidth(0.2)
    pdf.line(ML, FOOTER_Y - 3, ML + CW, FOOTER_Y - 3)
    pdf.text(`${result.company} — Competitive Intelligence`, ML, FOOTER_Y)
    const pg = `Page ${i} of ${n}`
    pdf.text(pg, PW - MR - pdf.getTextWidth(pg), FOOTER_Y)
  }
}

function coverPage(result: AnalysisResult) {
  pdf.setFillColor(16, 16, 16)
  pdf.rect(0, 0, PW, 44, 'F')

  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(240, 240, 240)
  pdf.text('Competitive Intelligence Report', ML, 18)

  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(160, 160, 160)
  pdf.text(`${result.company}`, ML, 28)
  pdf.text(`${result.market}`, ML, 35)

  pdf.setFontSize(8)
  pdf.setTextColor(100, 100, 100)
  const date = new Date(result.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
  pdf.text(date, ML, 42)

  cy = 56

  // Table of contents
  sectionHeading('Contents')
  const sections = ['1. Market Verdict & Synthesis', '2. Incumbent Analysis', '3. Emerging Competitors', '4. Market Sizing']
  sections.forEach((s) => {
    pdf.setFontSize(9.5)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(50, 50, 50)
    need(7)
    pdf.text(s, ML + 4, cy)
    cy += 7
  })
}

function renderSynthesis(result: AnalysisResult) {
  addPage()
  pageTitle('Market Verdict & Synthesis')
  verdictHero(result)

  const s = result.synthesis

  sectionHeading('Entry Strategy')
  paragraph(s.entry_strategy)

  sectionHeading('Opportunity / White Space')
  paragraph(s.white_space)

  if (s.risks.length > 0) {
    sectionHeading(`Key Risks  (${s.risks.length})`)
    s.risks.forEach(r => bulletItem(r, { color: 140 }))
  }

  if (s.conditions.length > 0) {
    spacer(2)
    sectionHeading(`Conditions  (${s.conditions.length})`)
    s.conditions.forEach(c => bulletItem(c, { color: 140 }))
  }

  sectionHeading('Reasoning')
  paragraph(s.reasoning, { color: 80 })
}

function renderIncumbents(result: AnalysisResult) {
  addPage()
  pageTitle('Incumbent Analysis')

  result.incumbents.competitors.forEach((c, idx) => {
    need(22)

    // Name + meta line
    pdf.setFontSize(10.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 15, 15)
    pdf.text(c.name, ML, cy)

    // right-align market share
    if (c.estimated_market_share != null) {
      const shareStr = `${c.estimated_market_share.toFixed(1)}%`
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(100, 60, 200)
      pdf.text(shareStr, ML + CW - pdf.getTextWidth(shareStr), cy)
    }
    cy += 5

    // Founded / revenue on one sub-line
    const meta: string[] = []
    if (c.founded_year) meta.push(`Est. ${c.founded_year}`)
    if (c.revenue_estimate) meta.push(clean(c.revenue_estimate))
    if (meta.length > 0) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(140, 140, 140)
      const metaLine = pdf.splitTextToSize(meta.join('  ·  '), CW)
      need(metaLine.length * 4.5)
      pdf.text(metaLine, ML, cy)
      cy += metaLine.length * 4.5 + 1
    }

    paragraph(c.positioning, { color: 70 })

    if (c.strengths.length > 0) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(40, 130, 70)
      pdf.text('Strengths:', ML, cy)
      cy += 4.5
      tagList(c.strengths)
    }

    if (c.weaknesses.length > 0) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(180, 50, 50)
      pdf.text('Weaknesses:', ML, cy)
      cy += 4.5
      tagList(c.weaknesses)
    }

    spacer(2)
    if (idx < result.incumbents.competitors.length - 1) rule(225)
  })

  if (result.incumbents.analysis_summary) {
    sectionHeading('Landscape Summary')
    paragraph(result.incumbents.analysis_summary, { color: 70 })
  }
  if (result.incumbents.consolidation_trend) {
    sectionHeading('M&A / Consolidation Activity')
    paragraph(result.incumbents.consolidation_trend, { color: 70 })
  }
}

function renderEmerging(result: AnalysisResult) {
  addPage()
  pageTitle('Emerging Competitors')

  statBoxRow([
    { label: 'Capital Velocity', value: result.emerging.capital_velocity },
    { label: 'Disruption Risk',  value: result.emerging.disruption_risk  },
  ])

  result.emerging.startups.forEach((s, idx) => {
    need(22)

    // Name (truncated to 60% width to leave room for stage)
    pdf.setFontSize(10.5)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(15, 15, 15)
    const nameMaxW = CW * 0.6
    const nameLine = pdf.splitTextToSize(clean(s.name), nameMaxW)[0]
    pdf.text(nameLine, ML, cy)

    // Stage badge right after name
    const stageX = ML + pdf.getTextWidth(nameLine) + 4
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 80, 180)
    pdf.text(`[${s.funding_stage}]`, stageX, cy)
    cy += 5

    // Amount raised on its own line
    if (s.amount_raised) {
      pdf.setFontSize(8.5)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(100, 100, 100)
      const amtLines = pdf.splitTextToSize(clean(s.amount_raised), CW)
      need(amtLines.length * 4.5)
      pdf.text(amtLines[0], ML, cy)
      cy += 5
    }

    paragraph(s.focus_area, { color: 70 })

    if (s.key_differentiator) {
      paragraph(s.key_differentiator, { color: 100, style: 'italic' })
    }

    if (s.investors.length > 0) {
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(150, 150, 150)
      const inv = pdf.splitTextToSize(clean(`Backed by: ${s.investors.join(', ')}`), CW)
      need(inv.length * 4.5)
      pdf.text(inv, ML, cy)
      cy += inv.length * 4.5 + 1
    }

    spacer(2)
    if (idx < result.emerging.startups.length - 1) rule(225)
  })

  sectionHeading('VC Thesis')
  paragraph(result.emerging.trend_summary, { color: 70 })
}

function renderMarketSizing(result: AnalysisResult) {
  addPage()
  pageTitle('Market Sizing')

  const ms = result.market_sizing
  statBoxRow([
    { label: 'TAM', value: ms.tam, sub: ms.growth_rate ?? undefined },
    { label: 'SAM', value: ms.sam },
    { label: 'SOM', value: ms.som },
  ])

  if (ms.key_drivers.length > 0) {
    sectionHeading('Growth Drivers')
    ms.key_drivers.forEach(d => bulletItem(d, { color: 60 }))
  }

  if (ms.key_barriers.length > 0) {
    sectionHeading('Barriers to Entry')
    ms.key_barriers.forEach(b => bulletItem(b, { color: 60 }))
  }

  if (ms.sources.length > 0) {
    spacer(4)
    sectionHeading('Sources')
    paragraph(ms.sources.map(clean).join('  ·  '), { size: 7.5, color: 150 })
  }
}

export function exportPdf(result: AnalysisResult) {
  pdf = new jsPDF({ unit: 'mm', format: 'a4' })
  cy = 20

  coverPage(result)
  renderSynthesis(result)
  renderIncumbents(result)
  renderEmerging(result)
  renderMarketSizing(result)
  drawFooters(result)

  const slug = result.company.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
  pdf.save(`${slug}_competitive_analysis.pdf`)
}
