export type Puzzle = {
  answer: string;
  missionBrief: string;
  missionBriefVi: string;
  intel: string;
  category: "school" | "club";
};

export const puzzles: Record<"school" | "club", Puzzle[]> = {
  school: [
    {
      answer: "CLASS",
      category: "school",
      missionBrief: "A place where students gather to learn together.",
      missionBriefVi: "Nơi sinh viên cùng nhau học tập.",
      intel: "A class is both a group of learners and the session where learning happens.",
    },
    {
      answer: "CAMPUS",
      category: "school",
      missionBrief: "The grounds and buildings that make up a university.",
      missionBriefVi: "Khuôn viên và các tòa nhà tạo nên một trường đại học.",
      intel: "A campus connects classrooms, labs, libraries, clubs, and student life.",
    },
    {
      answer: "MENTOR",
      category: "school",
      missionBrief: "A trusted person who guides your learning journey.",
      missionBriefVi: "Một người đáng tin cậy hướng dẫn hành trình học tập của bạn.",
      intel: "A mentor shares experience, gives feedback, and helps others grow.",
    },
  ],
  club: [
    {
      answer: "CIPHER",
      category: "club",
      missionBrief: "A method used to transform readable information.",
      missionBriefVi: "Một phương pháp dùng để biến đổi thông tin có thể đọc được.",
      intel: "A cipher is an algorithm used to encrypt or decrypt data.",
    },
    {
      answer: "PACKET",
      category: "club",
      missionBrief: "A small unit of data travelling across a network.",
      missionBriefVi: "Một đơn vị dữ liệu nhỏ di chuyển qua mạng.",
      intel: "Packets carry headers and payloads so data can move reliably across networks.",
    },
    {
      answer: "EXPLOIT",
      category: "club",
      missionBrief: "Code or technique that takes advantage of a weakness.",
      missionBriefVi: "Đoạn mã hoặc kỹ thuật lợi dụng một điểm yếu.",
      intel: "An exploit demonstrates how a vulnerability can affect a system and helps defenders validate fixes.",
    },
  ],
};

export function pickPuzzle(category: "school" | "club") {
  const options = puzzles[category];
  return options[Math.floor(Math.random() * options.length)];
}
