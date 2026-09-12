import re

md = open(r'E:\zcode-data\workspace\nic3\porichoy\docs\FORM_ANSWERS.md', encoding='utf-8').read()

def field(text_after):
    i = md.index(text_after)
    j = md.index('\n\n', i + 1)
    # take until next section heading '##' or blank-blank
    k = i + len(text_after)
    end = len(md)
    for m in re.finditer(r'\n## ', md[k:]):
        end = k + m.start()
        break
    return md[k:end].strip()

checks = [
    ('Problem', 150, '## Q: What specific problem are you trying to solve? (≤150 words)'),
    ('Solution', 100, '## Q: Briefly articulate your solution. (≤100 words)'),
    ('Business model', 150, '## Q: Describe the business model of your enterprise. (≤150 words)'),
    ('Revenue model', 100, '## Q: Revenue model — how do you generate income? (≤100 words)'),
]

ok = True
print('| Field | Limit | Count | Status |')
print('|---|---|---|---|')
for name, limit, anchor in checks:
    text = field(anchor)
    words = len(re.findall(r"\S+", text))
    status = 'PASS' if words <= limit else 'FAIL'
    if words > limit:
        ok = False
    print(f'| {name} | {limit} | {words} | {status} |')

print()
print('ALL WITHIN LIMITS' if ok else 'OVER LIMIT — trim required')
