// axios
const posts = [
  {id: 1, title: '제목 1', content: '내용1', createAt: '2021-01-01'},
  {id: 2, title: '제목 2', content: '내용2', createAt: '2022-02-02'},
  {id: 3, title: '제목 3', content: '내용3', createAt: '2023-03-03'},
  {id: 4, title: '제목 4', content: '내용4', createAt: '2024-04-04'},
  {id: 5, title: '제목 5', content: '내용5', createAt: '2025-05-05'},

];

export function getPosts() {
  return posts;
}