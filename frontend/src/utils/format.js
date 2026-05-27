export const formatDate = (value) => value?.slice?.(0, 10) || "-";

export const statusLabel = {
  PLANNING: "계획중",
  IN_PROGRESS: "진행중",
  CLOSED: "종료",
};

export const statusTone = {
  PLANNING: "neutral",
  IN_PROGRESS: "blue",
  CLOSED: "green",
};

export const typeLabel = {
  NEW: "신규개발",
  RENEWAL: "리뉴얼",
  MAINTENANCE: "유지보수",
};

export const roleLabel = {
  PM: "PM",
  FRONT: "프론트엔드",
  BACK: "백엔드",
  PLANNER: "기획자",
  REVIEW: "검토",
  PLANNING: "기획",
  ETC: "기타",
};

export const reviewLabel = {
  APPROVED: "최종승인",
  REVISION: "수정요청",
  IN_REVIEW: "검토중",
};

export const reviewTone = {
  APPROVED: "green",
  REVISION: "red",
  IN_REVIEW: "blue",
};
