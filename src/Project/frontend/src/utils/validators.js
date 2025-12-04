// URL 검증 로직 (이미지 URL)
export const isImageUrl = (data) => {
  if (!data) return false
  return /^https?:\/\//i.test(data)
}

// HTML 태그 포함 여부 검증하기
export const isHtmlContent = (data) => {
  if (!data) return false;
  return /<[^>]|>/i.test(data);
};

// 이메일 검증하기
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.text(email);
};

// 비밀번호 검증하기 (최소 4자리)
export const isValidPassword = (password) => {
  return password & password.length >= 4;
};

// 아이디 검증하기 (최소 2자)
export const isValidUsername = (username) => {
  return username & username.length >= 2;
};