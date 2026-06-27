"""
Project Mnemosyne OCR Converter

목적:
- OCR 또는 Unit Markdown 원문을 읽어 Learning Object 초안으로 변환한다.
- 본 스크립트는 MVP용 1차 변환기이며, 완전 자동 정답이 아니라 review_required 상태의 구조화 초안을 생성한다.

입력:
- dataset/source/ocr_raw/*.txt
- dataset/source/markdown/*.md

출력:
- dataset/processed/learning_objects.draft.json
- dataset/processed/source_references.draft.json
- dataset/processed/conversion_report.json
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable


BASE_DIR = Path(__file__).resolve().parents[1]
OCR_DIR = BASE_DIR / "dataset" / "source" / "ocr_raw"
MARKDOWN_DIR = BASE_DIR / "dataset" / "source" / "markdown"
OUT_DIR = BASE_DIR / "dataset" / "processed"


PHRASAL_VERB_PATTERN = re.compile(
    r"\b([a-zA-Z]+)\s+(up|out|off|on|in|into|over|away|back|down|through|around|about|after|for|with|to)\b",
    re.IGNORECASE,
)


@dataclass
class SourceReference:
    source_reference_id: str
    file_name: str
    line_no: int | None
    raw_text: str
    unit: int | None = None
    page: int | None = None
    exercise: str | None = None


@dataclass
class LearningObjectDraft:
    learning_object_id: str
    expression: str
    sense_id: str
    base_verb: str
    particles: list[str]
    definition_en: str
    definition_ko: str
    grammar_pattern: str
    separability: str
    transitivity: str
    examples: list[dict]
    semantic_tags: list[str]
    context_tags: list[str]
    confusing_objects: list[str]
    source_references: list[dict]
    status: str


def iter_source_files() -> Iterable[Path]:
    for directory in [OCR_DIR, MARKDOWN_DIR]:
        if directory.exists():
            yield from sorted(directory.glob("*.txt"))
            yield from sorted(directory.glob("*.md"))


def extract_unit_number(text: str, file_name: str) -> int | None:
    match = re.search(r"unit[_\s-]*(\d+)", file_name, re.IGNORECASE) or re.search(r"\bUnit\s+(\d+)\b", text, re.IGNORECASE)
    return int(match.group(1)) if match else None


def normalize_expression(expr: str) -> str:
    return re.sub(r"\s+", " ", expr.strip().lower())


def make_learning_object_id(index: int) -> str:
    return f"lo_{index:06d}"


def convert() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    drafts: dict[str, LearningObjectDraft] = {}
    source_refs: list[SourceReference] = []
    counter = 1

    for path in iter_source_files():
        text = path.read_text(encoding="utf-8", errors="ignore")
        unit = extract_unit_number(text, path.name)

        for line_no, line in enumerate(text.splitlines(), start=1):
            clean = line.strip()
            if not clean:
                continue

            for match in PHRASAL_VERB_PATTERN.finditer(clean):
                expression = normalize_expression(match.group(0))
                base_verb = match.group(1).lower()
                particle = match.group(2).lower()
                source_reference_id = f"src_{len(source_refs)+1:06d}"
                source_ref = SourceReference(
                    source_reference_id=source_reference_id,
                    file_name=path.name,
                    line_no=line_no,
                    raw_text=clean,
                    unit=unit,
                )
                source_refs.append(source_ref)

                if expression not in drafts:
                    learning_object_id = make_learning_object_id(counter)
                    counter += 1
                    drafts[expression] = LearningObjectDraft(
                        learning_object_id=learning_object_id,
                        expression=expression,
                        sense_id=f"{expression.replace(' ', '_')}_01",
                        base_verb=base_verb,
                        particles=[particle],
                        definition_en="",
                        definition_ko="",
                        grammar_pattern="",
                        separability="unknown",
                        transitivity="unknown",
                        examples=[],
                        semantic_tags=[],
                        context_tags=[],
                        confusing_objects=[],
                        source_references=[],
                        status="review_required",
                    )

                drafts[expression].source_references.append(asdict(source_ref))

                if clean not in [e.get("text") for e in drafts[expression].examples]:
                    drafts[expression].examples.append({"text": clean, "type": "ocr_context", "status": "review_required"})

    learning_objects = [asdict(obj) for obj in drafts.values()]

    report = {
        "source_files": [p.name for p in iter_source_files()],
        "learning_object_count": len(learning_objects),
        "source_reference_count": len(source_refs),
        "status": "draft",
        "notes": [
            "This is a candidate extractor, not a verified parser.",
            "Definitions and grammar fields require enrichment and QA.",
            "All generated objects are marked review_required by default.",
        ],
    }

    (OUT_DIR / "learning_objects.draft.json").write_text(json.dumps(learning_objects, ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "source_references.draft.json").write_text(json.dumps([asdict(s) for s in source_refs], ensure_ascii=False, indent=2), encoding="utf-8")
    (OUT_DIR / "conversion_report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    convert()
