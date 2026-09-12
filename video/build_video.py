# -*- coding: utf-8 -*-
"""Porichoy NIC 3.0 demo video builder.

Assembles: 3 recorded app clips (clips/*.webm) + 3 deck slides (../deck/slideN.png)
with edge-tts narration (or his_voice/segN.mp3 override), burned subtitles in a
bottom letterbox bar, single MP4 out.

Run: python build_video.py
"""
import asyncio, os, subprocess, sys, json
import edge_tts
import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)  # cwd trick: subtitles filter gets a colon-free relative .srt

VOICE = 'en-IN-PrabhatNeural'  # placeholder; swap to his_voice/segN.mp3 when ready
HIS = os.path.join(HERE, 'his_voice')

SEGS = [
    ('01_landing.webm', 1,
     "From 2027, Europe's Digital Product Passport rules phase in — and EU customs will automatically check every imported garment's passport. If a Bangladeshi factory cannot produce that data, it loses the order."),
    ('02_dashboard.webm', 2,
     "The data already exists inside the factory — scattered across Excel sheets in mixed Bangla and English, legacy E R P exports, and paper records. Porichoy turns that chaos into compliance. Watch: we load a factory's messy files — every production order gets a D P P Readiness Score out of one hundred, with the exact gaps listed."),
    ('03_passport.webm', 3,
     "One click publishes a Q R code. Scan it, and the buyer sees the full Digital Product Passport — every attribute anchored to the exact EU regulation, and traced back to the exact source column it came from. No backend, and no data leaving the factory."),
    (None, 4,  # slide 4
     "The business model: factories subscribe from two to eight thousand taka a month; onboarding is a one-time fee; and brands pay to bring their own suppliers online before the deadline. The pollination grant funds a ten-factory pilot with certified women data stewards."),
    (None, 5,  # slide 5
     "Porichoy is built by Rudra Sarker, final-year Industrial and Production Engineering at SUST — the engineer behind AdalatAI, JolSetu and RippleUp. This is his full-time commitment."),
    (None, 6,  # slide 6
     "And at the center are women: two stewards per factory, trained and certified — new skilled jobs, and protected livelihoods for a majority-women workforce. The last mile of the Digital Product Passport runs through Bangladesh's factory floor — and it will be walked by its women."),
]

SLIDE = {4: '../deck/slide4.png', 5: '../deck/slide5.png', 6: '../deck/slide6.png'}


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print('CMD FAILED:', ' '.join(cmd)[:220])
        print(r.stderr[-1400:])
        sys.exit(1)


def duration_of(path):
    r = subprocess.run([FF, '-i', path], capture_output=True, text=True)
    for line in r.stderr.splitlines():
        if 'Duration:' in line:
            h, m, s = line.split('Duration:')[1].split(',')[0].strip().split(':')
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise RuntimeError('no duration for ' + path)


async def tts_all():
    os.makedirs('voice', exist_ok=True)
    for clip, n, text in SEGS:
        out = f'voice/seg{n}.mp3'
        if os.path.exists(os.path.join(HIS, f'seg{n}.mp3')):
            continue  # his voice overrides
        if not os.path.exists(out):
            await edge_tts.Communicate(text, VOICE, rate='-4%').save(out)
            print('tts', n)


def srt_time(t):
    ms = int(round(t * 1000))
    h, rem = divmod(ms, 3600000)
    m, rem = divmod(rem, 60000)
    s, ms2 = divmod(rem, 1000)
    return f'{h:02d}:{m:02d}:{s:02d},{ms2:03d}'


async def main():
    await tts_all()
    # 1) per-segment mp4 with audio
    seg_files = []
    for clip, n, _text in SEGS:
        audio = os.path.join(HIS, f'seg{n}.mp3')
        if not os.path.exists(audio):
            audio = f'voice/seg{n}.mp3'
        dur = duration_of(audio) + 0.7  # breathing room
        out = f'seg{n}.mp4'
        if clip:  # screen recording
            vf = (f"[0:v]scale=1280:720:force_original_aspect_ratio=decrease,"
                  f"pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1,"
                  f"tpad=stop_mode=clone:stop_duration=12[v]")
            cmd = [FF, '-y', '-i', f'clips/{clip}', '-i', audio,
                   '-filter_complex', vf, '-map', '[v]', '-map', '1:a',
                   '-t', f'{dur:.2f}', '-r', '30', '-c:v', 'libx264', '-preset', 'medium',
                   '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', out]
        else:  # deck slide with slow zoom (single frame in, zoompan d= generates all frames)
            frames = int(dur * 30)
            vf = (f"[0:v]scale=1600:900,zoompan=z='min(zoom+0.00045,1.09)'"
                  f":x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1280x720:fps=30,setsar=1,"
                  f"tpad=stop_mode=clone:stop_duration=0.5[v]")
            cmd = [FF, '-y', '-i', SLIDE[n], '-i', audio,
                   '-filter_complex', vf, '-map', '[v]', '-map', '1:a',
                   '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
                   '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', out]
        run(cmd)
        seg_files.append(out)
        print('segment', n, f'{dur:.1f}s')

    # 2) concat (re-encode for uniformity)
    with open('list.txt', 'w') as f:
        for sf in seg_files:
            f.write(f"file '{sf}'\n")
    run([FF, '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'vlibx264' if False else 'copy', 'concat_raw.mp4'])

    # 3) subtitles with timings + bottom letterbox burn
    t0 = 0.0
    entries = []
    for clip, n, text in SEGS:
        audio = os.path.join(HIS, f'seg{n}.mp3')
        if not os.path.exists(audio):
            audio = f'voice/seg{n}.mp3'
        d = duration_of(audio) + 0.7
        entries.append((t0, t0 + d, text))
        t0 += d
    with open('subs.srt', 'w', encoding='utf-8') as f:
        for i, (a, b, txt) in enumerate(entries, 1):
            f.write(f'{i}\n{srt_time(a)} --> {srt_time(b - 0.15)}\n{txt}\n\n')

    style = ("FontName=Arial,FontSize=17,PrimaryColour=&H00FFFFFF,"
             "BorderStyle=4,BackColour=&H96000000,Outline=0,Shadow=0,"
             "Alignment=2,MarginV=22")
    vf = f"pad=1280:826:0:0:black,subtitles=subs.srt:force_style='{style}'"
    run([FF, '-y', '-i', 'concat_raw.mp4', '-vf', vf, '-c:v', 'libx264', '-preset', 'medium',
         '-pix_fmt', 'yuv420p', '-c:a', 'copy', 'Porichoy_NIC3_Demo.mp4'])
    print('DONE →', os.path.join(HERE, 'Porichoy_NIC3_Demo.mp4'), f'total {t0:.0f}s')


asyncio.run(main())
