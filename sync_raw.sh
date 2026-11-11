#!/bin/bash
# Aside 세션 shots → ~/dev/sam/shots_raw 복사 (세션 폴더가 지워져도 원본이 남게)
for d in ~/.aside/u/0/sessions/2026-11-11_llElBPqhKabFh3Zo/shots; do
  [ -d "$d" ] && rsync -a --exclude '._*' "$d/" ~/dev/sam/shots_raw/
done
