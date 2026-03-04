import usersData from './users.json';

// globalThis를 사용하여 모든 API 라우트에서 동일한 데이터를 공유
// Next.js에서 각 route.ts가 별도 모듈로 번들되므로, global 변수로 공유 필요
const globalForStore = globalThis as unknown as {
  _mockUsers: typeof usersData;
};

if (!globalForStore._mockUsers) {
  globalForStore._mockUsers = JSON.parse(JSON.stringify(usersData));
}

export const users = globalForStore._mockUsers;
