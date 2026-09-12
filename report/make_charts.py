# -*- coding: utf-8 -*-
"""Report figures (matplotlib, high-DPI PNGs) — data all from the live app/verified sources."""
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

INK, PINK, INDIGO, GREY, LINE = '#1E1B4B', '#E11D74', '#4F46E5', '#4B4877', '#E5E4F0'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 11, 'axes.edgecolor': LINE,
                     'axes.labelcolor': INK, 'text.color': INK, 'xtick.color': GREY, 'ytick.color': GREY})

# 1) Readiness scores of the sample POs (live app demo data; PO-1003 after steward fix)
fig, ax = plt.subplots(figsize=(7.2, 3.4), dpi=170)
pos = ['PO-1001\nMens Polo', 'PO-1002\nDenim Jacket', 'PO-1003\nKids T-shirt\n(after steward fix)', 'PO-1003\nbefore steward entry', 'PO-1004\nCompliance only']
vals = [90, 90, 60, 45, 35]
cols = ['#15803D', '#15803D', INDIGO, '#D97706', '#DC2626']
bars = ax.barh(pos[::-1], vals[::-1], color=cols[::-1], height=0.62)
for b, v in zip(bars, vals[::-1]):
    ax.text(v + 1.5, b.get_y() + b.get_height() / 2, str(v), va='center', fontweight='bold', fontsize=12)
ax.set_xlim(0, 104)
ax.set_xlabel('DPP Readiness Score (0–100, weight = ESPR Art. 8 categories)')
ax.spines[['top', 'right']].set_visible(False)
ax.set_title('Live demo: messy sample files → per-order readiness scores', fontsize=12, fontweight='bold', loc='left')
fig.tight_layout()
fig.savefig('chart_scores.png', bbox_inches='tight')
plt.close(fig)

# 2) Grant allocation doughnut
fig, ax = plt.subplots(figsize=(5.6, 3.6), dpi=170)
vals = [220, 180, 150, 100]
labels = ['10-factory pilot &\nsteward training', 'OCR for paper\ntrim cards', 'Mapping corpus\n(Bangla + ERP)', 'Legal entity &\ncompliance']
wedges, texts, autotexts = ax.pie(vals, labels=labels, colors=[PINK, INDIGO, '#7C3AED', '#94A3B8'],
                                  autopct=lambda p: f'{int(round(p * 6.5))}k', startangle=90,
                                  wedgeprops=dict(width=0.42, edgecolor='white'), textprops={'fontsize': 9})
for t in autotexts:
    t.set_color('white'); t.set_fontweight('bold')
ax.text(0, 0, 'BDT\n650,000', ha='center', va='center', fontweight='bold', fontsize=13, color=INK)
ax.set_title('Pollination grant allocation', fontsize=12, fontweight='bold')
fig.tight_layout()
fig.savefig('chart_grant.png', bbox_inches='tight')
plt.close(fig)

# 3) Women steward ramp (roadmap targets)
fig, ax = plt.subplots(figsize=(6.4, 3.2), dpi=170)
years = ['Year 1\n(pilot)', 'Year 2\n(scale)', 'Year 3\n(partnerships)']
factories = [10, 40, 100]
stewards = [20, 80, 200]
x = range(3)
w = 0.36
b1 = ax.bar([i - w / 2 for i in x], factories, w, color=INDIGO, label='Factories onboarded')
b2 = ax.bar([i + w / 2 for i in x], stewards, w, color=PINK, label='Women DPP Data Stewards certified')
for bs in (b1, b2):
    for b in bs:
        ax.text(b.get_x() + b.get_width() / 2, b.get_height() + 4, str(int(b.get_height())), ha='center', fontweight='bold', fontsize=11)
ax.set_xticks(list(x)); ax.set_xticklabels(years, fontsize=10)
ax.set_ylim(0, 230)
ax.legend(frameon=False, fontsize=10, loc='upper left')
ax.spines[['top', 'right']].set_visible(False)
ax.set_title('Women-steward ramp-up (roadmap targets)', fontsize=12, fontweight='bold', loc='left')
fig.tight_layout()
fig.savefig('chart_women.png', bbox_inches='tight')
plt.close(fig)

# 4) EU regulatory timeline
fig, ax = plt.subplots(figsize=(9.2, 2.3), dpi=170)
miles = [('18 Jul 2024', 'ESPR in force\n(EU 2024/1781)'), ('Apr 2025', '1st Working Plan —\ntextiles priority'),
         ('~2027', 'Textile delegated act\n(expected)'), ('2027–30', 'DPP obligations phase in;\ncustoms auto-checks')]
xs = [0.06, 0.36, 0.64, 0.9]
ax.axhline(0.5, color=LINE, lw=3, zorder=1)
for (d, t), x in zip(miles, xs):
    ax.scatter([x], [0.5], s=260, color=PINK if x in (xs[2], xs[3]) else INDIGO, zorder=3)
    ax.text(x, 0.62, d, ha='center', fontweight='bold', fontsize=11.5, color=INK)
    ax.text(x, 0.3, t, ha='center', va='top', fontsize = 9.5, color=GREY)
ax.set_xlim(0, 1); ax.set_ylim(0, 1); ax.axis('off')
ax.set_title('The dated wall: EU Digital Product Passport timeline (European Commission)', fontsize=12, fontweight='bold', loc='left')
fig.tight_layout()
fig.savefig('chart_timeline.png', bbox_inches='tight')
plt.close(fig)

print('charts done')
