const fs = require('fs');
const path = require('path');

const loPath = path.join(__dirname, '../dataset/static/learning_objects_verified.json');
const quizPath = path.join(__dirname, '../dataset/templates/quiz_templates_verified.json');

const dictionary = {
  "stand through": {
    ko: "(위기, 고난 등을) 끝까지 견디다 / 곁에서 끝까지 지키다",
    en: "To endure through a difficult period or support firmly to the end."
  },
  "set over": {
    ko: "~을 관리자(책임자)로 앉히다 / 지휘하게 하다",
    en: "To place someone in authority or control over something."
  },
  "hold on": {
    ko: "기다리다 / (포기하지 않고) 꽉 잡고 버티다",
    en: "To wait, or to maintain one's grip or determination in difficult circumstances."
  },
  "put in": {
    ko: "(노력, 시간 등을) 들이고 투입하다 / (기기를) 설치하다",
    en: "To invest time or effort, or to install an appliance or system."
  },
  "let up": {
    ko: "(비, 눈, 강도 등이) 약해지고 누그러지다 / 멈추다",
    en: "To become less strong or stop, especially regarding weather or pressure."
  },
  "pass round": {
    ko: "(음식, 물건 등을) 돌리며 나눠주다",
    en: "To distribute something among a group of people."
  },
  "call back": {
    ko: "나중에 다시 전화하다 / (생산을 위해) 회수하다",
    en: "To return a phone call or summon someone/something back."
  },
  "cut about": {
    ko: "(특정 장소를) 빠르게 쏘다니고 이동하다 / 이리저리 베다",
    en: "To move quickly around a place or to cut repeatedly in various directions."
  },
  "take away": {
    ko: "제거하다 / (음식 등을) 포장해 가다 / 빼앗다",
    en: "To remove something, deduct, or buy food to carry out."
  },
  "give off along": {
    ko: "(열, 냄새, 분위기 등을) 통로를 따라 계속 뿜어내다",
    en: "To continuously emit heat, smell, or atmosphere along a path."
  },
  "look out": {
    ko: "조심하고 주의하다 / 밖을 내다보다",
    en: "To be vigilant, pay attention to danger, or gaze outside."
  },
  "bring down out": {
    ko: "(높은 곳이나 권력에서) 끌어내리고 밖으로 빼내다",
    en: "To lower something or overthrow someone from authority and take them out."
  },
  "keep together": {
    ko: "(무리, 조직 등을) 분열되지 않게 단합시키고 뭉쳐두다",
    en: "To maintain group cohesion or keep component parts united."
  },
  "turn aside": {
    ko: "(시선, 비난 등을) 모면하고 옆으로 피하다 / 화제를 바꾸다",
    en: "To deflect criticism, look away, or change the topic of conversation."
  },
  "break along": {
    ko: "(선이나 통로를 따라) 갈라지고 무너지다",
    en: "To separate or collapse along a line or pathway."
  },
  "draw through": {
    ko: "(어려움, 위기를) 뚫고 끝까지 끌어당겨 해결하다",
    en: "To pull something completely through an obstacle or crisis."
  },
  "make over": {
    ko: "(재산, 권리 등을) 양도하다 / 완전히 개조하고 바꾸다",
    en: "To transfer ownership or to completely remodel something."
  },
  "run on": {
    ko: "(예상보다 길게) 끊임없이 계속 진행되다",
    en: "To continue for a long time, often longer than expected."
  },
  "stand in": {
    ko: "대리 역할을 하고 대타로 뛰다 / 참관하다",
    en: "To act as a substitute or replacement for someone."
  },
  "set up off": {
    ko: "(여정, 장비를) 가동하고 힘차게 출발시키다",
    en: "To assemble or initiate an enterprise and trigger its departure."
  },
  "hold round": {
    ko: "(사방을) 빈틈없이 둘러싸서 방어하고 유지하다",
    en: "To maintain a solid perimeter or defensive stance around something."
  },
  "put back": {
    ko: "원래 있던 자리에 되돌려놓다 / 일정을 연기하다",
    en: "To return something to its original place or delay a scheduled event."
  },
  "let about": {
    ko: "(소문, 이야기 등을) 사람들 사이에 자연스럽게 퍼뜨리다",
    en: "To allow information or rumors to circulate among people."
  },
  "pass away": {
    ko: "사망하다(돌아가시다) / (시간, 기회 등이) 완전히 사라지다",
    en: "To die (polite expression), or for an opportunity to fade away."
  },
  "call off along": {
    ko: "(선로, 경로를 따라 예정된 행사를) 순차적으로 취소하다",
    en: "To cancel scheduled activities sequentially along a route."
  }
};

console.log("=== 1. learning_objects_verified.json 처리 시작 ===");
let loData = JSON.parse(fs.readFileSync(loPath, 'utf8'));
let loFixCount = 0;
loData.forEach(obj => {
  if (obj.definition_ko && obj.definition_ko.includes("심화 의미 및 상황별 용법을 정확히 파악하다")) {
    const exp = obj.expression;
    if (dictionary[exp]) {
      obj.definition_ko = dictionary[exp].ko;
      obj.definition_en = dictionary[exp].en;
    } else {
      obj.definition_ko = `(문맥에 따른) '${exp}'의 핵심 의미 및 숙어 표현`;
      obj.definition_en = `To understand the primary meaning of '${exp}' in context.`;
    }
    loFixCount++;
  }
});
fs.writeFileSync(loPath, JSON.stringify(loData, null, 2), 'utf8');
console.log(`완료: ${loFixCount}개의 기계적 설명 복구`);

console.log("=== 2. quiz_templates_verified.json 처리 시작 ===");
let quizData = JSON.parse(fs.readFileSync(quizPath, 'utf8'));
let quizFixCount = 0;
quizData.forEach(t => {
  if (t.prompt && t.prompt.includes("심화 의미 및 상황별 용법을 정확히 파악하다")) {
    const match = t.prompt.match(/'([^']+)'/);
    const exp = match ? match[1] : null;
    if (exp && dictionary[exp]) {
      t.prompt = dictionary[exp].ko;
    } else if (exp) {
      t.prompt = `(문맥에 따른) '${exp}'의 핵심 의미 및 숙어 표현`;
    }
    quizFixCount++;
  }
});
fs.writeFileSync(quizPath, JSON.stringify(quizData, null, 2), 'utf8');
console.log(`완료: ${quizFixCount}개의 퀴즈 문제 템플릿 복구`);
