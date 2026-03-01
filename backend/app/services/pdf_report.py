"""
PDF report generation service using fpdf2.
"""
from __future__ import annotations

import io
import re
import datetime as dt
from typing import Optional

from fpdf import FPDF

from app.schemas import RiskMetrics, Holding


def _sanitize_for_pdf(text: str) -> str:
    """
    Replace Unicode characters unsupported by Helvetica (latin-1 only)
    with safe ASCII equivalents so fpdf2 doesn't raise encoding errors.
    """
    # Markdown artefacts
    text = text.replace("##", "").replace("**", "")

    # Common emoji / symbol replacements
    replacements = {
        "\u2014": "-",     # em dash —
        "\u2013": "-",     # en dash –
        "\u2018": "'",     # left single curly quote
        "\u2019": "'",     # right single curly quote / apostrophe
        "\u201c": '"',     # left double curly quote
        "\u201d": '"',     # right double curly quote
        "\u2026": "...",   # ellipsis …
        "\u2022": "-",     # bullet •
        "\u2023": ">",     # triangular bullet ‣
        "\u00a0": " ",     # non-breaking space
        "\u200b": "",      # zero-width space
        "\u2212": "-",     # minus sign −
        "\u2248": "~",     # approximately ≈
        "\u2265": ">=",    # greater than or equal ≥
        "\u2264": "<=",    # less than or equal ≤
    }
    for old, new in replacements.items():
        text = text.replace(old, new)

    # Replace common emoji (warning sign, check mark, etc.) with text markers
    emoji_map = {
        "\u26a0\ufe0f": "[!]",   # ⚠️
        "\u26a0": "[!]",         # ⚠ (without variation selector)
        "\u2705": "[OK]",        # ✅
        "\u274c": "[X]",         # ❌
        "\u2b06": "[UP]",        # ⬆
        "\u2b07": "[DN]",        # ⬇
        "\u27a1": "->",          # ➡
        "\U0001f4c8": "[UP]",    # 📈
        "\U0001f4c9": "[DN]",    # 📉
        "\U0001f4a1": "[*]",     # 💡
        "\U0001f3af": "[*]",     # 🎯
        "\U0001f6e1": "[*]",     # 🛡
        "\U0001f525": "[!]",     # 🔥
    }
    for old, new in emoji_map.items():
        text = text.replace(old, new)

    # Strip any remaining characters outside latin-1 range
    text = text.encode("latin-1", errors="replace").decode("latin-1")

    return text


class PortfolioReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, "BlackRock Portfolio Risk Report", new_x="LMARGIN", new_y="NEXT", align="C")
        self.set_font("Helvetica", "", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 6, f"Generated: {dt.datetime.now().strftime('%B %d, %Y at %H:%M')}", new_x="LMARGIN", new_y="NEXT", align="C")
        self.ln(4)
        # Separator
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f"Page {self.page_no()}/{{nb}} | BlackRock Risk Dashboard", align="C")


def generate_pdf_report(
    holdings: list[Holding],
    risk_metrics: Optional[RiskMetrics],
    commentary: Optional[str],
    monte_carlo_stats: Optional[dict] = None,
) -> bytes:
    """Generate a PDF report and return bytes."""
    pdf = PortfolioReport()
    pdf.alias_nb_pages()
    pdf.set_auto_page_break(auto=True, margin=20)
    pdf.add_page()

    # ── Portfolio Allocation ──────────────────
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(30, 30, 30)
    pdf.cell(0, 10, "Portfolio Allocation", new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "B", 9)
    pdf.set_fill_color(240, 240, 240)
    pdf.cell(40, 8, "Ticker", border=1, fill=True)
    pdf.cell(80, 8, "Name", border=1, fill=True)
    pdf.cell(40, 8, "Weight", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

    pdf.set_font("Helvetica", "", 9)
    for h in holdings:
        pdf.cell(40, 7, h.ticker, border=1)
        pdf.cell(80, 7, h.name or h.ticker, border=1)
        pdf.cell(40, 7, f"{h.weight * 100:.1f}%", border=1, new_x="LMARGIN", new_y="NEXT")

    pdf.ln(6)

    # ── Risk Metrics ──────────────────────────
    if risk_metrics:
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 10, "Risk Metrics", new_x="LMARGIN", new_y="NEXT")

        metrics_data = [
            ("Sharpe Ratio", f"{risk_metrics.sharpe_ratio:.4f}"),
            ("Sortino Ratio", f"{risk_metrics.sortino_ratio:.4f}"),
            ("Annualized Return", f"{risk_metrics.annualized_return * 100:.2f}%"),
            ("Annualized Volatility", f"{risk_metrics.annualized_volatility * 100:.2f}%"),
            ("Max Drawdown", f"{risk_metrics.max_drawdown * 100:.2f}%"),
            ("VaR (95%)", f"{risk_metrics.var_95 * 100:.4f}%"),
            ("VaR (99%)", f"{risk_metrics.var_99 * 100:.4f}%"),
            ("CVaR (95%)", f"{risk_metrics.cvar_95 * 100:.4f}%"),
            ("Beta", f"{risk_metrics.beta:.4f}"),
            ("Alpha", f"{risk_metrics.alpha * 100:.2f}%"),
            ("Treynor Ratio", f"{risk_metrics.treynor_ratio:.4f}"),
            ("Information Ratio", f"{risk_metrics.information_ratio:.4f}"),
            ("Calmar Ratio", f"{risk_metrics.calmar_ratio:.4f}"),
        ]

        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(240, 240, 240)
        pdf.cell(80, 8, "Metric", border=1, fill=True)
        pdf.cell(60, 8, "Value", border=1, fill=True, new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 9)
        for name, val in metrics_data:
            pdf.cell(80, 7, name, border=1)
            pdf.cell(60, 7, val, border=1, new_x="LMARGIN", new_y="NEXT")

        pdf.ln(6)

    # ── Monte Carlo ───────────────────────────
    if monte_carlo_stats:
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 10, "Monte Carlo Simulation Results", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 9)
        for key, val in monte_carlo_stats.items():
            pdf.cell(0, 6, f"{key}: {val}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(6)

    # ── AI Commentary ─────────────────────────
    if commentary:
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 10, "AI-Generated Commentary", new_x="LMARGIN", new_y="NEXT")

        pdf.set_font("Helvetica", "", 9)
        # Sanitize markdown + unicode for Helvetica (latin-1 only font)
        clean = _sanitize_for_pdf(commentary)
        pdf.multi_cell(0, 5, clean)

    # Return bytes (fpdf2's output() returns bytearray; Starlette Response needs bytes)
    return bytes(pdf.output())
