// Mock phrases organized by topic
export const phrasesByTopic: Record<
  string,
  Array<{
    id: string;
    chinese: string;
    english: string;
    romanization: string;
  }>
> = {
  transit: [
    {
      id: 't1',
      chinese: '边度有巴士?',
      english: 'Where is the bus?',
      romanization: 'Bin1 dou6 yau5 ba1 si2?',
    },
    {
      id: 't2',
      chinese: '我喺巴士站。',
      english: 'I am at the bus stop.',
      romanization: 'Ngo5 hai2 ba1 si2 zaam6.',
    },
    {
      id: 't3',
      chinese: '呢架巴士去唔去唐人街?',
      english: 'Does this bus go to Chinatown?',
      romanization: 'Ni1 ga3 ba1 si2 heoi3 m4 heoi3 tong4 jan4 gaai1?',
    },
    {
      id: 't4',
      chinese: '下一班三十号巴士几时嚟?',
      english: 'When is the next 30 Stockton coming?',
      romanization: 'Haa6 jat1 baan1 saam1 sap6 hou6 ba1 si2 gei2 si4 lai4?',
    },
    {
      id: 't5',
      chinese: '嚟咗未呀?',
      english: 'Is it here yet?',
      romanization: 'Lai4 zo2 mei6 aa3?',
    },
    {
      id: 't6',
      chinese: '我要落车。',
      english: 'I need to get off.',
      romanization: 'Ngo5 jiu3 lok6 ce1.',
    },
    {
      id: 't7',
      chinese: '请问去机场点搭车?',
      english: 'How do I get to the airport?',
      romanization: 'Cing2 man6 heoi3 gei1 coeng4 dim2 daap3 ce1?',
    },
    {
      id: 't8',
      chinese: '车费几多钱?',
      english: 'How much is the fare?',
      romanization: 'Ce1 fai3 gei2 do1 cin2?',
    },
  ],
  medical: [
    {
      id: 'm1',
      chinese: '我唔舒服。',
      english: "I don't feel well.",
      romanization: 'Ngo5 m4 syu1 fuk6.',
    },
    {
      id: 'm2',
      chinese: '我要睇医生。',
      english: 'I need to see a doctor.',
      romanization: 'Ngo5 jiu3 tai2 ji1 sang1.',
    },
    {
      id: 'm3',
      chinese: '边度痛?',
      english: 'Where does it hurt?',
      romanization: 'Bin1 dou6 tung3?',
    },
    {
      id: 'm4',
      chinese: '我头痛。',
      english: 'I have a headache.',
      romanization: 'Ngo5 tau4 tung3.',
    },
    {
      id: 'm5',
      chinese: '我肚痛。',
      english: 'I have a stomachache.',
      romanization: 'Ngo5 tou5 tung3.',
    },
    {
      id: 'm6',
      chinese: '我发烧。',
      english: 'I have a fever.',
      romanization: 'Ngo5 faat3 siu1.',
    },
    {
      id: 'm7',
      chinese: '药房喺边?',
      english: 'Where is the pharmacy?',
      romanization: 'Joek6 fong2 hai2 bin1?',
    },
    {
      id: 'm8',
      chinese: '呢只药食几多粒?',
      english: 'How many of these pills should I take?',
      romanization: 'Ni1 zek3 joek6 sik6 gei2 do1 nap1?',
    },
  ],
  banking: [
    {
      id: 'b1',
      chinese: '我想开户口。',
      english: 'I want to open an account.',
      romanization: 'Ngo5 soeng2 hoi1 wu6 hau2.',
    },
    {
      id: 'b2',
      chinese: '我想攞钱。',
      english: 'I want to withdraw money.',
      romanization: 'Ngo5 soeng2 lo2 cin2.',
    },
    {
      id: 'b3',
      chinese: '我想存钱。',
      english: 'I want to deposit money.',
      romanization: 'Ngo5 soeng2 cyun4 cin2.',
    },
    {
      id: 'b4',
      chinese: '我想转账。',
      english: 'I want to transfer money.',
      romanization: 'Ngo5 soeng2 zyun2 zoeng3.',
    },
    {
      id: 'b5',
      chinese: '我嘅户口有几多钱?',
      english: 'How much money is in my account?',
      romanization: 'Ngo5 ge3 wu6 hau2 jau5 gei2 do1 cin2?',
    },
    {
      id: 'b6',
      chinese: 'ATM喺边度?',
      english: 'Where is the ATM?',
      romanization: 'ATM hai2 bin1 dou6?',
    },
  ],
  shopping: [
    {
      id: 's1',
      chinese: '呢个几多钱?',
      english: 'How much is this?',
      romanization: 'Ni1 go3 gei2 do1 cin2?',
    },
    {
      id: 's2',
      chinese: '太贵喇!',
      english: "That's too expensive!",
      romanization: 'Taai3 gwai3 laa3!',
    },
    {
      id: 's3',
      chinese: '可唔可以平啲?',
      english: 'Can you give a discount?',
      romanization: 'Ho2 m4 ho2 ji5 peng4 di1?',
    },
    {
      id: 's4',
      chinese: '我要买呢个。',
      english: 'I want to buy this.',
      romanization: 'Ngo5 jiu3 maai5 ni1 go3.',
    },
    {
      id: 's5',
      chinese: '有冇细码?',
      english: 'Do you have a smaller size?',
      romanization: 'Jau5 mou5 sai3 maa5?',
    },
    {
      id: 's6',
      chinese: '收唔收信用卡?',
      english: 'Do you accept credit cards?',
      romanization: 'Sau1 m4 sau1 seon3 jung6 kaat1?',
    },
  ],
  family: [
    {
      id: 'f1',
      chinese: '你食咗饭未?',
      english: 'Have you eaten yet?',
      romanization: 'Nei5 sik6 zo2 faan6 mei6?',
    },
    {
      id: 'f2',
      chinese: '阿妈,我返嚟喇!',
      english: "Mom, I'm home!",
      romanization: 'Aa3 maa1, ngo5 faan1 lai4 laa3!',
    },
    {
      id: 'f3',
      chinese: '爷爷嬷嬷好吗?',
      english: 'How are grandpa and grandma?',
      romanization: 'Je4 je2 maa4 maa2 hou2 maa3?',
    },
    {
      id: 'f4',
      chinese: '几时过嚟食饭?',
      english: 'When are you coming over for dinner?',
      romanization: 'Gei2 si4 gwo3 lai4 sik6 faan6?',
    },
    {
      id: 'f5',
      chinese: '细佬喺边?',
      english: 'Where is little brother?',
      romanization: 'Sai3 lou2 hai2 bin1?',
    },
    {
      id: 'f6',
      chinese: '阿姐结婚喇!',
      english: 'Big sister is getting married!',
      romanization: 'Aa3 ze2 git3 fan1 laa3!',
    },
  ],
  food: [
    {
      id: 'fd1',
      chinese: '好味!',
      english: 'Delicious!',
      romanization: 'Hou2 mei6!',
    },
    {
      id: 'fd2',
      chinese: '我想食点心。',
      english: 'I want to eat dim sum.',
      romanization: 'Ngo5 soeng2 sik6 dim2 sam1.',
    },
    {
      id: 'fd3',
      chinese: '唔该,埋单!',
      english: 'Excuse me, the bill please!',
      romanization: 'M4 goi1, maai4 daan1!',
    },
    {
      id: 'fd4',
      chinese: '呢道菜辣唔辣?',
      english: 'Is this dish spicy?',
      romanization: 'Ni1 dou6 coi3 laat6 m4 laat6?',
    },
    {
      id: 'fd5',
      chinese: '我唔食猪肉。',
      english: "I don't eat pork.",
      romanization: 'Ngo5 m4 sik6 zyu1 juk6.',
    },
    {
      id: 'fd6',
      chinese: '再嚟一碗饭。',
      english: 'Another bowl of rice, please.',
      romanization: 'Zoi3 lai4 jat1 wun2 faan6.',
    },
  ],
  phone: [
    {
      id: 'p1',
      chinese: '喂?',
      english: 'Hello?',
      romanization: 'Wai2?',
    },
    {
      id: 'p2',
      chinese: '请问边位?',
      english: 'Who is calling?',
      romanization: 'Cing2 man6 bin1 wai2?',
    },
    {
      id: 'p3',
      chinese: '佢唔喺度。',
      english: "He/she isn't here.",
      romanization: 'Keoi5 m4 hai2 dou6.',
    },
    {
      id: 'p4',
      chinese: '我等阵再打嚟。',
      english: "I'll call back later.",
      romanization: 'Ngo5 dang2 zan6 zoi3 daa2 lai4.',
    },
    {
      id: 'p5',
      chinese: '你嘅电话号码系几多?',
      english: 'What is your phone number?',
      romanization: 'Nei5 ge3 din6 waa2 hou6 maa5 hai6 gei2 do1?',
    },
    {
      id: 'p6',
      chinese: '听唔清楚,再讲多一次。',
      english: "I can't hear you clearly, please say it again.",
      romanization: 'Teng1 m4 cing1 co2, zoi3 gong2 do1 jat1 ci3.',
    },
  ],
  home: [
    {
      id: 'h1',
      chinese: '我返到屋企喇。',
      english: "I'm home.",
      romanization: 'Ngo5 faan1 dou3 uk1 kei2 laa3.',
    },
    {
      id: 'h2',
      chinese: '冷气开咗未?',
      english: 'Is the air conditioning on?',
      romanization: 'Laang5 hei3 hoi1 zo2 mei6?',
    },
    {
      id: 'h3',
      chinese: '门锁咗未?',
      english: 'Is the door locked?',
      romanization: 'Mun4 so2 zo2 mei6?',
    },
    {
      id: 'h4',
      chinese: '帮我攞杯水。',
      english: 'Get me a glass of water.',
      romanization: 'Bong1 ngo5 lo2 bui1 seoi2.',
    },
    {
      id: 'h5',
      chinese: '电视坏咗。',
      english: 'The TV is broken.',
      romanization: 'Din6 si6 waai6 zo2.',
    },
    {
      id: 'h6',
      chinese: '我要瞓觉喇。',
      english: "I'm going to sleep.",
      romanization: 'Ngo5 jiu3 fan3 gaau3 laa3.',
    },
  ],
};

// Badge definitions
export const badges = [
  {
    id: 'first-recording',
    name: 'First Steps',
    description: 'Made your first recording',
    icon: 'mic',
    requirement: 1,
    type: 'recording',
  },
  {
    id: 'ten-recordings',
    name: 'Getting Started',
    description: 'Completed 10 recordings',
    icon: 'award',
    requirement: 10,
    type: 'recording',
  },
  {
    id: 'fifty-recordings',
    name: 'Dedicated Contributor',
    description: 'Completed 50 recordings',
    icon: 'star',
    requirement: 50,
    type: 'recording',
  },
  {
    id: 'hundred-recordings',
    name: 'Voice Champion',
    description: 'Completed 100 recordings',
    icon: 'trophy',
    requirement: 100,
    type: 'recording',
  },
  {
    id: 'first-validation',
    name: 'Quality Guardian',
    description: 'Validated your first recording',
    icon: 'check-circle',
    requirement: 1,
    type: 'validation',
  },
  {
    id: 'fifty-validations',
    name: 'Trusted Reviewer',
    description: 'Validated 50 recordings',
    icon: 'shield',
    requirement: 50,
    type: 'validation',
  },
  {
    id: 'all-topics',
    name: 'Well-Rounded',
    description: 'Recorded in all 8 topic categories',
    icon: 'grid',
    requirement: 8,
    type: 'special',
  },
  {
    id: 'streak-7',
    name: 'Weekly Warrior',
    description: 'Contributed 7 days in a row',
    icon: 'flame',
    requirement: 7,
    type: 'streak',
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Contributed 30 days in a row',
    icon: 'zap',
    requirement: 30,
    type: 'streak',
  },
  {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined during beta',
    icon: 'rocket',
    requirement: 1,
    type: 'special',
  },
];

// Mock user stats
export const mockUserStats = {
  recordings: 47,
  validations: 23,
  serviceHours: 2.5,
  currentStreak: 5,
  longestStreak: 12,
  topicsCompleted: ['transit', 'family', 'food'],
  earnedBadges: ['first-recording', 'ten-recordings', 'first-validation', 'streak-7'],
};

// Mock leaderboard
export const mockLeaderboard = [
  { rank: 1, name: 'Amy L.', recordings: 234, validations: 156, hours: 12.3 },
  { rank: 2, name: 'David C.', recordings: 189, validations: 201, hours: 10.8 },
  { rank: 3, name: 'Michelle W.', recordings: 167, validations: 89, hours: 8.2 },
  { rank: 4, name: 'Kevin T.', recordings: 145, validations: 112, hours: 7.5 },
  { rank: 5, name: 'You', recordings: 47, validations: 23, hours: 2.5, isCurrentUser: true },
];

// Topic coverage data for heatmap (recordings per phrase)
// Target: 10 recordings per phrase for a balanced dataset
export const topicCoverage: Record<string, { phraseId: string; recordings: number; validated: number }[]> = {
  transit: [
    { phraseId: 't1', recordings: 12, validated: 8 },
    { phraseId: 't2', recordings: 8, validated: 5 },
    { phraseId: 't3', recordings: 3, validated: 1 },
    { phraseId: 't4', recordings: 0, validated: 0 },
    { phraseId: 't5', recordings: 6, validated: 4 },
    { phraseId: 't6', recordings: 2, validated: 0 },
    { phraseId: 't7', recordings: 1, validated: 0 },
    { phraseId: 't8', recordings: 0, validated: 0 },
  ],
  medical: [
    { phraseId: 'm1', recordings: 15, validated: 12 },
    { phraseId: 'm2', recordings: 10, validated: 7 },
    { phraseId: 'm3', recordings: 5, validated: 3 },
    { phraseId: 'm4', recordings: 8, validated: 6 },
    { phraseId: 'm5', recordings: 4, validated: 2 },
    { phraseId: 'm6', recordings: 0, validated: 0 },
    { phraseId: 'm7', recordings: 2, validated: 1 },
    { phraseId: 'm8', recordings: 1, validated: 0 },
  ],
  banking: [
    { phraseId: 'b1', recordings: 6, validated: 4 },
    { phraseId: 'b2', recordings: 4, validated: 2 },
    { phraseId: 'b3', recordings: 2, validated: 1 },
    { phraseId: 'b4', recordings: 0, validated: 0 },
    { phraseId: 'b5', recordings: 1, validated: 0 },
    { phraseId: 'b6', recordings: 3, validated: 2 },
  ],
  shopping: [
    { phraseId: 's1', recordings: 10, validated: 8 },
    { phraseId: 's2', recordings: 7, validated: 5 },
    { phraseId: 's3', recordings: 4, validated: 2 },
    { phraseId: 's4', recordings: 2, validated: 1 },
    { phraseId: 's5', recordings: 0, validated: 0 },
    { phraseId: 's6', recordings: 3, validated: 2 },
  ],
  family: [
    { phraseId: 'f1', recordings: 18, validated: 15 },
    { phraseId: 'f2', recordings: 12, validated: 9 },
    { phraseId: 'f3', recordings: 8, validated: 6 },
    { phraseId: 'f4', recordings: 5, validated: 3 },
    { phraseId: 'f5', recordings: 3, validated: 1 },
    { phraseId: 'f6', recordings: 6, validated: 4 },
  ],
  food: [
    { phraseId: 'fd1', recordings: 20, validated: 16 },
    { phraseId: 'fd2', recordings: 14, validated: 10 },
    { phraseId: 'fd3', recordings: 9, validated: 7 },
    { phraseId: 'fd4', recordings: 5, validated: 3 },
    { phraseId: 'fd5', recordings: 2, validated: 1 },
    { phraseId: 'fd6', recordings: 4, validated: 2 },
  ],
  phone: [
    { phraseId: 'p1', recordings: 8, validated: 6 },
    { phraseId: 'p2', recordings: 4, validated: 2 },
    { phraseId: 'p3', recordings: 3, validated: 1 },
    { phraseId: 'p4', recordings: 1, validated: 0 },
    { phraseId: 'p5', recordings: 0, validated: 0 },
    { phraseId: 'p6', recordings: 2, validated: 1 },
  ],
  home: [
    { phraseId: 'h1', recordings: 11, validated: 8 },
    { phraseId: 'h2', recordings: 7, validated: 5 },
    { phraseId: 'h3', recordings: 5, validated: 3 },
    { phraseId: 'h4', recordings: 3, validated: 1 },
    { phraseId: 'h5', recordings: 1, validated: 0 },
    { phraseId: 'h6', recordings: 2, validated: 1 },
  ],
};

// Helper to get topic coverage summary
export function getTopicCoverageSummary(topicId: string) {
  const coverage = topicCoverage[topicId] || [];
  const totalPhrases = coverage.length;
  const completePhrases = coverage.filter((p) => p.recordings >= 10).length;
  const totalRecordings = coverage.reduce((sum, p) => sum + p.recordings, 0);
  const totalValidated = coverage.reduce((sum, p) => sum + p.validated, 0);
  const needsRecordings = coverage.filter((p) => p.recordings < 5).length;

  return {
    totalPhrases,
    completePhrases,
    totalRecordings,
    totalValidated,
    needsRecordings,
    percentComplete: totalPhrases > 0 ? Math.round((completePhrases / totalPhrases) * 100) : 0,
  };
}
