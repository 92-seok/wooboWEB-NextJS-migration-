"use client";

import React from "react";

interface DisplayRendererProps {
  htmlContent: string;
  size?: "small" | "large";
  className?: string;
}

interface CharData {
  char: string;
  color: string;
}

/**
 * HTML에서 글자와 색상 정보를 추출하는 함수
 */
const extractCharsWithColors = (html: string): CharData[] => {
  if (!html) return [];

  const result: CharData[] = [];

  // 임시 DOM 요소 생성
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // 모든 텍스트 노드와 색상 추출
  const extractFromNode = (node: Node): void => {
    if (node.nodeType === Node.TEXT_NODE) {
      // 텍스트 노드인 경우
      const text = node.textContent || "";
      const parent = node.parentElement;
      let color = "#ef4444"; // 기본 빨간색

      // 부모 요소에서 색상 추출
      if (parent) {
        const computedStyle = window.getComputedStyle(parent);
        const styleColor = parent.style.color || computedStyle.color;

        if (styleColor) {
          color = styleColor;
        }

        // HTML color 속성도 확인
        const colorAttr = parent.getAttribute("color");
        if (colorAttr) {
          color = colorAttr;
        }
      }

      // 각 글자를 개별적으로 추가 (공백 제외)
      for (const char of text) {
        if (char.trim()) {
          result.push({ char, color });
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // 요소 노드인 경우 자식 노드 재귀 처리
      node.childNodes.forEach(extractFromNode);
    }
  };

  extractFromNode(tempDiv);
  return result;
};

/**
 * 글자 배열을 여러 줄로 분할하는 함수
 */
const splitCharsToLines = (
  chars: CharData[],
  cols: number = 10,
  maxLines?: number
): CharData[][] => {
  const lines: CharData[][] = [];

  if (maxLines === undefined) {
    // 제한 없이 모든 데이터를 줄 단위로 분할
    for (let i = 0; i < chars.length; i += cols) {
      lines.push(chars.slice(i, i + cols));
    }
  } else {
    // 최대 줄 수 제한
    for (let i = 0; i < maxLines; i++) {
      const line = chars.slice(i * cols, (i + 1) * cols);
      if (line.length > 0) {
        lines.push(line);
      }
    }
  }

  return lines;
};

/**
 * 전광판 HTML 데이터를 2단 10열 LED 형식으로 렌더링하는 컴포넌트
 */
export const DisplayRenderer: React.FC<DisplayRendererProps> = ({
  htmlContent,
  size = "small",
  className = "",
}) => {
  if (!htmlContent) {
    return (
      <div className="bg-black rounded px-2 py-1 text-center">
        <span className="text-slate-400 text-xs">데이터 없음</span>
      </div>
    );
  }

  // HTML에서 글자와 색상 정보 추출
  const chars = extractCharsWithColors(htmlContent);

  // 크기별 스타일 및 설정
  const sizeStyles = {
    small: {
      containerClass: "px-1.5 py-1",
      fontSize: "6px",
      gap: "1px",
      charWidth: "6px",
      charHeight: "8px",
      cols: 10,
      maxLines: 2, // 2줄로 제한
    },
    large: {
      containerClass: "px-4 py-3",
      fontSize: "16px",
      gap: "2px",
      charWidth: "16px",
      charHeight: "22px",
      cols: 10,
      maxLines: undefined, // 제한 없음 - 모든 데이터 표시
    },
  };

  const currentSize = sizeStyles[size];

  // 줄 단위로 분할
  const lines = splitCharsToLines(chars, currentSize.cols, currentSize.maxLines);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`bg-black rounded border border-slate-700 ${currentSize.containerClass}`}
      >
        {/* LED 전광판 - 여러 줄 렌더링 */}
        <div className="flex flex-col" style={{ gap: currentSize.gap }}>
          {lines.map((lineChars, lineIdx) => (
            <div key={`line-${lineIdx}`} className="flex" style={{ gap: currentSize.gap }}>
              {lineChars.map((charData, charIdx) => (
                <div
                  key={`line${lineIdx}-char${charIdx}`}
                  className="flex items-center justify-center font-mono font-bold"
                  style={{
                    width: currentSize.charWidth,
                    height: currentSize.charHeight,
                    fontSize: currentSize.fontSize,
                    color: charData.color,
                    textShadow: `0 0 2px ${charData.color}`,
                  }}
                >
                  {charData.char}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
