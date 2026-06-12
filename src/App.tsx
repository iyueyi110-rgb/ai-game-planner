import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

// ── Types ──────────────────────────────────────────────
type Page = 'home' | 'select' | 'generating' | 'result'

interface Selections {
  gameType: string
  gameplayFocus: string
  artStyle: string
  playerGoal: string
}

interface GamePlan {
  worldbuilding: string
  protagonist: string
  coreGameplay: string
  questFlow: string
  playerBranches: string
  rewardSystem: string
}

// ── Option definitions ─────────────────────────────────
const OPTIONS = {
  gameType: {
    label: '🎮 游戏类型',
    choices: [
      { value: 'rpg', label: '角色扮演 RPG', desc: '沉浸式故事，角色成长与选择' },
      { value: 'strategy', label: '策略战争', desc: '运筹帷幄，资源与领土的博弈' },
      { value: 'roguelike', label: 'Roguelike 肉鸽', desc: '随机生成，永久死亡，高重玩性' },
      { value: 'simulation', label: '模拟经营', desc: '建造、管理、发展你的世界' },
      { value: 'action', label: '动作冒险', desc: '快节奏战斗，开放世界探索' },
    ],
  },
  gameplayFocus: {
    label: '⚔️ 玩法重点',
    choices: [
      { value: 'narrative', label: '叙事驱动', desc: '深刻的故事线与角色弧光' },
      { value: 'combat', label: '战斗系统', desc: '深度连招、策略搭配与操作感' },
      { value: 'exploration', label: '探索发现', desc: '广袤地图，隐藏秘密与彩蛋' },
      { value: 'puzzle', label: '解谜推理', desc: '逻辑谜题，环境叙事与环境互动' },
      { value: 'social', label: '社交互动', desc: 'NPC 羁绊、阵营关系与多结局' },
    ],
  },
  artStyle: {
    label: '🎨 美术风格',
    choices: [
      { value: 'pixel', label: '像素复古', desc: '16-bit 美学，怀旧与精致的平衡' },
      { value: 'anime', label: '日系动画', desc: '赛璐璐渲染，绚丽的技能演出' },
      { value: 'realistic', label: '写实渲染', desc: 'PBR 材质，沉浸式光影氛围' },
      { value: 'lowpoly', label: '低多边形', desc: '简洁几何，风格化与性能兼顾' },
      { value: 'handdrawn', label: '手绘水彩', desc: '艺术化笔触，独特视觉辨识度' },
    ],
  },
  playerGoal: {
    label: '🏆 玩家目标',
    choices: [
      { value: 'power', label: '战力成长', desc: '数值提升，装备驱动，巅峰挑战' },
      { value: 'story', label: '剧情体验', desc: '多线叙事，选择后果，情感共鸣' },
      { value: 'collect', label: '收集养成', desc: '图鉴、宠物、外观与成就系统' },
      { value: 'compete', label: '竞技排名', desc: 'PVP 天梯，赛季奖励，荣誉殿堂' },
      { value: 'create', label: '创造建造', desc: '自定义领地、关卡编辑器与 UGC' },
    ],
  },
}

// ── Mock AI Generation ─────────────────────────────────
const TYPE_NAMES: Record<string, string> = {
  rpg: '角色扮演', strategy: '策略战争', roguelike: 'Roguelike',
  simulation: '模拟经营', action: '动作冒险',
}
const FOCUS_NAMES: Record<string, string> = {
  narrative: '叙事驱动', combat: '战斗系统', exploration: '探索发现',
  puzzle: '解谜推理', social: '社交互动',
}
const ART_NAMES: Record<string, string> = {
  pixel: '像素复古', anime: '日系动画', realistic: '写实渲染',
  lowpoly: '低多边形', handdrawn: '手绘水彩',
}
const GOAL_NAMES: Record<string, string> = {
  power: '战力成长', story: '剧情体验', collect: '收集养成',
  compete: '竞技排名', create: '创造建造',
}

// Template fragments keyed by combination — each returns a complete GamePlan
function generatePlan(s: Selections): GamePlan {
  const g = s.gameType
  const f = s.gameplayFocus
  const a = s.artStyle
  const p = s.playerGoal

  // ── Worldbuilding ──
  const worlds: Record<string, string[]> = {
    rpg: [
      `在创世之战后的第三纪元，诸神遗弃了这片名为「艾瑟兰」的大陆。魔法与钢铁共存，六个王国在脆弱的盟约下维持着表面的和平。然而，深渊裂隙正在悄然扩张——那是上一次诸神之战留下的伤痕，从中涌出的虚空能量正在腐蚀一切生灵。\n\n世界由三层结构组成：\n• **天穹层** — 浮空岛屿与云中城邦，贵族与学者居住之地\n• **地表层** — 广阔的艾瑟兰大陆，六大王国与无数遗迹\n• **深渊层** — 地下暗域，虚空裂隙的源头，隐藏着被遗忘的真相`,
      `「永夜纪元」降临已过百年——那场被称为"星陨"的灾难摧毁了旧文明，也带来了名为"星辉"的神秘能量。幸存者在废土之上建立起新的城邦，以星辉科技驱动着文明的复兴。\n\n但星辉并非无穷无尽。大陆深处的「核心熔炉」正在逐渐冷却，各方势力为了争夺最后的星辉矿脉，即将点燃新的战火。而你，一个在边境小镇长大的年轻人，意外获得了与星辉共鸣的能力。`,
    ],
    strategy: [
      `在这片名为「千屿」的破碎大陆上，浮空岛屿是唯一可居住的土地。古老的天空航道连接着各个岛屿，而控制航道的城邦便掌握了贸易与战争的命脉。\n\n大陆正处在「诸城时代」——没有统一的帝国，七十六座浮空城邦形成了错综复杂的联盟与敌对网络。而你将成为其中一座城邦的领主，在风云变幻的格局中书写属于自己的传奇。`,
      `帝国已经腐朽。曾经横跨三块大陆的「奥瑞利安帝国」在内战与瘟疫的双重打击下分崩离析。四方诸侯蠢蠢欲动，草原上的游牧部落蓄势待发，而旧都中的皇帝只剩下一个空虚的头衔。\n\n乱世出英雄——你将从一个郡县之主开始，在这片群雄逐鹿的大地上，走出一条属于自己的王者之路。`,
    ],
    roguelike: [
      `「无尽回廊」——一座活着的迷宫，它存在于时间与空间的夹缝之中，每一层都扭曲着现实的法则。有人说它是上古文明的实验场，有人说它是神明留下的试炼之地。\n\n唯一可以确定的是：无数冒险者进入其中，却几乎无人能够抵达回廊的尽头。每当有人踏入回廊，它会重新编织自己的构造，确保每个挑战者面对的都是一次独一无二的旅程。`,
      `在「镜像位面」中，现实世界的每一寸土地都有着扭曲的对应物。这里的时间是断裂的，空间是可折叠的，而主宰这一切的，是被称为「织镜者」的古老存在。\n\n每个进入镜像位面的人都会发现：这里既是熟悉的，又是完全陌生的。每一次踏入，它都会以不同的面貌呈现——仿佛一面破碎的镜子，每次折射出的景象都不相同。`,
    ],
    simulation: [
      `欢迎来到「星露纪元」——一颗位于银河边缘、刚刚被发现的可居住星球。星际联邦启动了"新世界计划"，而你被选为殖民地的总规划师。\n\n这片土地充满了未知：奇异的原生生物、古老的遗迹、复杂的气候系统……你将带领殖民者们从零开始，在这片处女地上建立起人类的新家园。`,
      `「浮空城·阿尔卡迪亚」是人类最后的希望。在地面世界被污染吞噬之后，这座由古代科技驱动的浮空城市承载着仅存的人类文明。\n\n作为新上任的城市管理者，你需要平衡有限的资源、不断增长的人口压力，以及来自浮空城内部不同派系的诉求。而更令人担忧的是——浮空城的核心能源正在衰减。`,
    ],
    action: [
      `「破碎边境」——这是人类王国与暗影领域交界的无人地带。两个世界的法则在此处碰撞，创造出危险而美丽的奇异景观。\n\n百年前，暗影大军从这里涌入人类世界，发动了一场几乎毁灭一切的战争。如今，边境虽已相对平静，但暗影领主们从未放弃入侵的野心。而你，将成为穿越破碎边境的冒险者，在两个世界的夹缝中寻找自己的命运。`,
      `「机械纪元 2187」——人类已经完成了全身机械化改造，意识可以通过网络在不同义体之间传输。城市垂直生长至云层之上，霓虹灯光照亮了永不停歇的街道。\n\n但在光鲜的表象之下，巨型企业控制着一切——包括你的记忆。一个名为「觉醒者」的地下组织正在暗中活动，他们相信：真正的自由始于摆脱被植入的记忆。`,
    ],
  }

  const worldDesc = worlds[g] ?? worlds.rpg
  const worldModifier = a === 'pixel' ? `\n\n整个世界以精致的 2D 像素艺术呈现，每一帧都像一幅可以行走的画卷。角色动画采用逐帧手绘，场景中隐藏着无数像素级的彩蛋等待玩家发现。`
    : a === 'anime' ? `\n\n美术采用日式赛璐璐渲染风格，光影柔和，角色线条流畅。技能释放时伴随华丽的 2D 动画演出，关键剧情场景以动画过场呈现。`
    : a === 'realistic' ? `\n\n采用虚幻引擎的 PBR 渲染管线与动态全局光照，环境的每一个细节都力求真实——从雨后湿润的街道到夕阳下飞扬的尘土。`
    : a === 'lowpoly' ? `\n\n低多边形风格赋予世界独特的几何美感。简洁的造型配合柔和的调色板，营造出静谧而富有诗意的氛围。`
    : `\n\n手绘水彩风格让整个世界如同一本会呼吸的绘本。墨线勾勒轮廓，淡彩渲染氛围，每一幕场景都值得截图收藏。`

  // ── Protagonist ──
  const protags: Record<string, string[]> = {
    rpg: [
      `**姓名**（玩家自定义）\n**年龄**：22 岁\n**出身**：边境小镇的药师学徒\n**特殊能力**：能够感知并引导虚空能量——这是一种被视为诅咒的力量，但也是对抗深渊侵蚀的唯一手段。\n\n主角自幼由镇上的老药师抚养长大，对自己的身世一无所知。直到深渊裂隙在镇外突然扩张，体内的虚空之力首次觉醒，命运的齿轮开始转动。\n\n性格设定上为玩家提供了三个基调方向：\n• **仁慈之心** — 以拯救与治愈为信念\n• **钢铁意志** — 以力量与秩序为追求\n• **自由之魂** — 以探索与真相为目标`,
      `**姓名**（玩家自定义）\n**年龄**：19 岁\n**出身**：旧文明遗迹中的孤儿\n**特殊能力**：星辉共鸣——能够激活沉睡的古代遗物，是这个世界唯一的"共鸣者"。\n\n主角在一次意外中触碰了古遗迹中的核心水晶，从此与星辉能量建立了无法割舍的联系。这项能力让她/他成为了各方势力争夺的焦点，也成为了复兴文明的最后希望。\n\n主角的成长路线将取决于玩家的选择：成为一个**救世主**、一个**探索者**，还是一个**变革者**。`,
    ],
    strategy: [
      `**身份**：玩家将扮演一位继承边疆领土的年轻领主。\n**初始领土**：一座资源匮乏但地理位置关键的小型城邦。\n**核心挑战**：在列强环伺中生存并壮大。\n\n领主拥有三项核心属性，决策将影响其成长方向：\n• **谋略** — 影响外交、计策与情报能力\n• **武勇** — 影响军事指挥与个人战斗力\n• **仁德** — 影响民心、人才吸引与文化发展`,
      `**身份**：没落贵族家族的唯一继承人。\n**起始**：仅有一座破败的庄园和几名忠诚的老仆。\n**崛起之路**：通过贸易、联姻、战争或谋略，在乱世中重建家族的荣耀。\n\n玩家可以自由定义领主的人格与处世哲学——是冷酷精明的商人领主，还是仁义宽厚的仁君，亦或是铁血征伐的征服者。`,
    ],
    roguelike: [
      `**身份**：被选中的"回廊行者"——每百年会有一位拥有穿越回廊能力的人诞生。\n**特征**：左手掌心有一个不断变化的印记，记录着当前在回廊中的层数和状态。\n**动力**：每个回廊行者进入迷宫的原因各不相同——有人为了传说中的许愿机，有人为了找回失去的挚爱，有人只是为了证明自己。\n\n在回廊中，主角的职业与能力会随获得的"记忆碎片"而变化——上一轮可能是挥舞巨剑的战士，下一轮可能是操控元素法术的法师。`,
      `**身份**：一位"织镜旅人"——能够在镜像位面与现实世界之间穿梭的特殊存在。\n**能力**："镜面折射"——可以从镜子中抽取不同版本的自己，每个版本拥有不同的技能组合。\n**困境**：每次使用镜面折射，都会在记忆中留下另一个"自己"的经历。累积过多，可能导致人格分裂。\n\n旅人在每次冒险开始时可以选择一个"起源镜片"，决定初始的能力倾向。`,
    ],
    simulation: [
      `**身份**：新殖民地的总规划师，由星际联邦直接任命。\n**背景**：拥有城市规划、生态学和星际管理三重学位，但实际经验为零——这次任务是证明自己的唯一机会。\n**初始资源**：一艘殖民船、200 名殖民者、有限的基础物资。\n\n规划师的决策风格将由玩家决定：\n• **效率优先型** — 快速扩张，最大化产出\n• **和谐共生型** — 与星球生态平衡发展\n• **人文关怀型** — 优先提升殖民者幸福感`,
      `**身份**：浮空城·阿尔卡迪亚的新任管理者。\n**背景**：前任管理者在神秘情况下失踪，你在紧急选举中被推上这个位置。\n**核心矛盾**：浮空城的能源核心正在衰减，按当前速度，只剩下 365 天。\n\n管理者的每一个决策都会影响城市的社会结构、资源分配和最终命运。`,
    ],
    action: [
      `**代号**：「渡鸦」\n**职业**：边境行者——专门在破碎边境中执行任务的自由佣兵。\n**装备**：一把能够切换近战/远程模式的"变形武装"，以及一套轻型动力外骨骼。\n**背景**：曾是王国精锐部队的成员，在一次任务中遭遇暗影领主，全队覆没，唯有她/他幸存。从那以后，渡鸦选择了独行，在破碎边境中接取高风险委托，同时追查当年事件的真相。`,
      `**代号**：「零号」（Zero）\n**身份**：被企业除名的前精英特工，现在以雇佣兵的身份在霓虹都市的底层生存。\n**特殊之处**：体内植入了非法军用级别的战斗 AI——「赫尔」，这让她/他在战斗中拥有超乎常人的反应速度，但也让她/他成为了企业追捕的目标。\n\n在光鲜的摩天大楼与阴暗的地下街区之间，「零号」游走于灰色地带，只接自己认为"正确"的委托。`,
    ],
  }

  const protag = (protags[g] ?? protags.rpg)[Math.floor(Math.random() * (protags[g]?.length ?? 2))]

  // ── Core Gameplay ──
  const coreMap: Record<string, Record<string, string>> = {
    rpg: {
      narrative: `本作以**叙事选择系统**为核心。对话不再是简单的信息获取——每一个选择都可能改变故事走向、角色关系甚至世界格局。\n\n核心机制包括：\n• **信念三角** — 仁慈/意志/自由三个维度，玩家的选择会累积对应数值，达到阈值后解锁专属对话选项与结局路线\n• **羁绊系统** — 与六位核心队友的关系将影响战斗中的连携技能，以及每个人的个人任务线\n• **关键抉择时刻** — 在剧情的关键节点，玩家将面对没有"正确"答案的选择，每个选择都有其代价与回报`,
      combat: `战斗系统采用**半即时制指令战斗**——并非传统的回合制，而是基于行动条的实时决策系统。\n\n• **连携打击** — 队友之间可以触发组合技，需要合理安排行动顺序以最大化伤害\n• **弱点破坏** — 每个敌人有多层护盾与属性弱点，需要先破盾再输出\n• **战场环境** — 地形高低差、可破坏物与场景机关提供了策略深度\n• **极限闪避** — 在敌人攻击命中的瞬间闪避可触发"时空裂隙"，获得额外行动回合`,
      exploration: `开放世界探索是本作的核心乐趣。艾瑟兰大陆的每一个角落都隐藏着秘密：\n\n• **三层世界探索** — 天穹层使用飞行载具、地表层骑马或步行、深渊层需要特殊装备抵抗虚空侵蚀\n• **动态事件系统** — 世界中的事件会随时间推移而变化，错过的事件可能触发不同的后果\n• **环境解谜** — 使用不同的角色能力与环境互动，开启隐藏区域`,
      puzzle: `本作将推理与探索深度融合，创造了独特的**线索串联系统**：\n\n• **证物收集** — 在场景中搜集线索与物证，存储于"推理手札"中\n• **思维殿堂** — 将收集到的线索进行组合与推理，形成新的结论\n• **质询系统** — 在对话中利用已推理出的结论进行质询，揭开真相\n• **环境叙事** — 不是所有故事都被直接讲述，有些秘密隐藏在地图的布局与物品的描述中`,
      social: `**阵营声望系统**是社交玩法的核心。六大王国各有独立的声望值，影响可接取的任务、可进入的区域以及商店中的物品。\n\n社交机制包括：\n• **送礼与信物** — 每个 NPC 都有偏好的礼物类型，送对礼物大幅提升好感\n• **宴会与集会** — 定期举办的社交活动，是获取情报与建立人脉的关键场合\n• **承诺与背叛** — 对 NPC 做出的承诺必须兑现，失信将导致声望断崖式下跌\n• **阵营博弈** — 两个阵营之间的声望往往此消彼长，你必须在夹缝中做出选择`,
    },
    strategy: {
      narrative: `在策略层面之上，本作构建了深度的**历史叙事引擎**。世界中的事件并非预设的剧本，而是由各个势力的 AI 行为与玩家的决策共同推动的。\n\n• **动态历史线** — 没有固定剧情，世界的历史由每一局的势力互动重新书写\n• **传奇人物** — 世界中出现的关键人物拥有自己的性格、目标与记忆，他们的命运与玩家紧密交织\n• **编年史系统** — 游戏自动记录每一局的关键事件，形成一部独一无二的编年史`,
      combat: `**军团指挥系统**是本作战术层面的核心。战场从宏观的战略地图无缝缩放至微观的战术视图：\n\n• **兵种克制** — 步/骑/弓/器械四大兵种形成完整的克制循环\n• **将领技能** — 每位将领拥有独特的战术技能，在关键时刻释放可以扭转战局\n• **地形博弈** — 山地、河流、森林、城池——地形决定战术选择\n• **士气系统** — 部队士气受补给、战局与将领魅力影响，士气崩溃的部队会溃散`,
      exploration: `战争迷雾之下是一个充满未知的世界。**战略侦察**是制胜的关键：\n\n• **间谍网络** — 派遣间谍潜入敌城，获得敌军布防、资源储备等关键情报\n• **遗迹探索** — 派遣探险队进入古遗迹，可能获得上古遗物或先进科技\n• **外交出使** — 亲自出使其他势力，在谈判桌上获得地图上无法获得的东西`,
      puzzle: `策略的本质就是一场宏大的解谜——如何在有限的资源与时间内，达成你的战略目标？\n\n• **资源谜题** — 每回合的资源配置如同在解一道多变量的优化问题\n• **外交棋局** — 联盟、背叛、威胁与妥协构成的复杂博弈\n• **历史推理** — 通过散布在世界各地的碎片化信息，拼凑出远古文明灭亡的真相`,
      social: `在外交舞台上，**人际关系网络**比军队更重要：\n\n• **信任值** — 每个势力对你的信任值决定了合作的可能性\n• **联姻政治** — 通过联姻建立牢不可破的同盟\n• **朝堂博弈** — 在你的宫廷内部，不同派系在争夺影响力\n• **背盟与复仇** — 背叛盟友会获得短期利益，但会永久损害声望并招致复仇`,
    },
  }

  // Fallback patterns for types not explicitly mapped
  const fallbackCore: Record<string, Record<string, string>> = {
    roguelike: {
      narrative: `每次进入迷宫都是一次新的故事。**碎片叙事系统**让玩家在一次次冒险中拼凑出世界的真相：\n\n• **记忆碎片** — 在迷宫中收集的记忆碎片包含过去冒险者的故事片段\n• **回廊日志** — 自动记录每次冒险中的关键事件，形成连续的叙事线\n• **永久 NPC** — 在安全据点中出现的 NPC 拥有独立的故事线，跨越单次冒险`,
      combat: `战斗系统强调**技能组合自由度**。每次冒险中获得的技能可以自由搭配，创造出无限的战斗风格：\n\n• **技能矩阵** — 技能之间存在协同、冲突与进化关系\n• **Risk / Reward 机制** — 在低血量时可以选择触发"绝境之力"，获得强大增益但承受永久风险\n• **环境利用** — 将敌人引入陷阱、利用地形造成额外伤害`,
      exploration: `迷宫每一层的布局在每次进入时完全重制。**房间类型系统**确保了探索的多样性：\n\n• 战斗房、宝藏房、商店、事件房、Boss 房……超过 20 种房间类型\n• **隐藏墙壁与密道** — 最珍贵的奖励往往藏在最隐蔽的位置\n• **层数主题** — 每 10 层切换一个主题，环境、敌人类型与美术风格都会变化`,
      puzzle: `迷宫本身就充满了谜题。从简单的机关解锁到需要跨层信息的环境谜题：\n\n• **符文序列** — 收集散布在各层的符文，按正确顺序激活以解锁隐藏Boss\n• **回廊谜语** — 迷宫中的石像会给出谜语，解谜后获得丰厚奖励\n• **时间悖论** — 某些房间中存在时间回溯机制，需要在不同时间线中寻找答案`,
      social: `安全据点「篝火酒馆」是冒险者们的避风港。在这里可以：\n\n• 与其他冒险者交流，获取迷宫深处的秘密情报\n• 与酒馆老板建立友谊，解锁特殊物品与隐藏任务\n• 组建临时队伍——邀请 NPC 冒险者一同探索特定层数`,
    },
    simulation: {
      narrative: `殖民地的故事由居民的日常生活构成。**市民故事系统**为每位居民赋予了独特的性格、梦想与秘密：\n\n• 每个居民有独立的好感度、心情值与个人剧情线\n• 居民之间会自发产生互动——友谊、恋情、冲突\n• 重大事件（如危机、节日）中，居民的集体反应会影响城市走向`,
      combat: `虽然不是传统的战斗游戏，但殖民地面对的**危机应对**同样需要策略：\n\n• **自然灾害** — 地震、暴风、外星生物入侵，需要组织防御与救援\n• **内部冲突** — 资源短缺时，不同群体之间可能爆发冲突\n• **外交危机** — 与外星文明或邻近殖民地的关系可能变得紧张`,
      exploration: `新星球充满了等待发现的秘密：\n\n• **生物图鉴** — 发现并记录星球上的独特生物\n• **古文明遗迹** — 星球上似乎有过更早的来访者……\n• **资源勘探** — 派出勘探队寻找稀缺矿脉与能量源`,
      puzzle: `城市管理本身就是一个不断变化的谜题——如何让一个脆弱的新殖民地繁荣发展？\n\n• **产消平衡** — 每个建筑消耗一种资源，产出另一种，需要精心规划产业链\n• **空间谜题** — 有限的土地如何分配？建筑布局影响效率与美观\n• **人才匹配** — 每个建筑需要特定技能的居民才能高效运转`,
      social: `社会动态是模拟经营中最丰富的系统之一：\n\n• **公共舆论** — 居民对各项政策的满意度实时变化\n• **派系政治** — 不同职业群体的利益诉求不同\n• **节庆系统** — 组织节日活动提升民心，创造独特的城市文化`,
    },
    action: {
      narrative: `开放世界中的主线与支线以**任务链**形式呈现，每个任务链都是一个完整的小故事。\n\n• **声望叙事** — 在不同区域的声望解锁不同的任务链\n• **后果系统** — 完成任务的方式会影响后续剧情\n• **隐藏叙事** — 不是所有故事都有任务标记，有些需要玩家自己发现`,
      combat: `战斗系统强调**高速动作与华丽连招**：\n\n• **架势切换** — 在多种战斗架势之间无缝切换，每个架势有不同的连招链\n• **完美格挡** — 在敌人攻击命中的瞬间格挡，触发"子弹时间"\n• **终结技** — 敌人进入虚弱状态时可触发独特的终结动画\n• **环境击杀** — 利用场景中的危险物消灭敌人`,
      exploration: `无缝连接的开放世界等待着你去探索：\n\n• **攀爬与跑酷** — 任何可见之处都可以到达\n• **动态天气** — 天气影响能见度、敌人行为与可探索区域\n• **地下城** — 散布在世界各处的副本，每个都有独特的设计与Boss`,
      puzzle: `环境谜题与跑酷挑战交织：\n\n• **遗迹解谜** — 古代文明留下的机关需要观察与推理\n• **路径谜题** — 如何利用跑酷能力到达看似不可能的位置\n• **光学谜题** — 利用光线反射与折射来激活古代装置`,
      social: `在世界各地的城镇中，与 NPC 的互动超越了简单的对话：\n\n• **好感度任务** — 提升与关键 NPC 的关系解锁专属剧情\n• **情报网络** — 从 NPC 口中获取隐藏宝藏与秘密区域的情报\n• **阵营选择** — 加入不同阵营将彻底改变你的冒险路线`,
    },
  }

  const coreSource = coreMap[g]?.[f] ?? fallbackCore[g]?.[f] ?? coreMap.rpg.narrative

  // ── Quest Flow ──
  const questTemplates: Record<string, string[]> = {
    rpg: [
      `**第一章：觉醒之刻**\n小镇外的深渊裂隙突然扩张 → 主角体内虚空之力觉醒 → 击退裂隙中涌出的虚空生物 → 神秘旅人出现，揭示主角身世的第一个线索\n\n**第二章：王国的召唤**\n前往王国首都寻求答案 → 卷入王位继承的政治旋涡 → 在三个继承候选人之间做出选择 → 解锁第二个虚空之力形态\n\n**第三章：深渊之旅**\n为寻找真相深入深渊层 → 发现上古文明的废墟 → 揭开虚空裂隙与诸神之战的关联 → 面对第一个深渊领主\n\n**第四章：抉择之刻**\n六大王国之间脆弱的和平彻底破裂 → 玩家必须在阵营之间做出最终选择 → 集结盟友 → 最终决战前夕\n\n**终章：命运的尽头**\n进入最深处的虚空裂隙 → 发现创世的真相 → 最终抉择——封印虚空 / 控制虚空 / 释放虚空 → 三种截然不同的结局`,
      `**序章：星陨之夜**\n边境小镇的宁静被星辉矿脉的突然爆发打破 → 主角首次展现共鸣能力 → 被星辉骑士团发现并带走\n\n**第一幕：学徒之路**\n在骑士团总部接受训练 → 学习掌控星辉之力 → 首次任务中遭遇"星辉猎人"——一个以掠夺星辉为生的神秘组织\n\n**第二幕：真相浮现**\n追踪星辉猎人的线索 → 发现骑士团内部存在腐败势力 → 核心熔炉冷却的真正原因浮出水面\n\n**第三幕：抉择**\n面对真相，选择站在骑士团一方进行改革 / 加入星辉猎人以更激进的方式拯救世界 / 寻找第三条路\n\n**终局**\n进入核心熔炉深处 → 面对导致冷却的古老存在 → 主角的最终选择将决定世界未来的形态`,
    ],
    strategy: [
      `**阶段一：立足（第 1-20 回合）**\n巩固领土 → 发展基础经济 → 建立第一支军队 → 与邻邦建立初步外交关系\n\n**阶段二：崛起（第 21-50 回合）**\n选择一个发展方向（军事 / 经济 / 外交）→ 吞并或联合周边小势力 → 遭遇第一个大国的注意\n\n**阶段三：争霸（第 51-80 回合）**\n与其他主要势力正面交锋 → 合纵连横的外交博弈 → 关键战役决定势力版图\n\n**阶段四：统一（第 81-100 回合）**\n最终战役 → 统一大陆或建立新的秩序 → 多结局取决于统一的方式`,
    ],
    roguelike: [
      `**每次冒险流程**：\n层数 1-5：初始探索，收集基础技能与装备\n层数 6-10：遭遇第一个中Boss，解锁第一个记忆碎片\n层数 11-20：主题区域深化，获得进阶技能\n层数 21-25：遭遇区域Boss，揭示核心叙事线索\n层数 26+：最终区域，面对回廊守护者\n\n**跨轮次进度**：\n• 收集的记忆碎片永久保留，拼凑出完整故事\n• 解锁的新角色与起始装备可以在新一轮中使用\n• 安全据点的 NPC 故事线跨轮次推进`,
    ],
    simulation: [
      `**第一年：开拓期**\n建立基础设施 → 保障食物与水源 → 探索周边区域 → 第一批殖民者到达\n\n**第二年：发展期**\n建设专业设施 → 建立贸易路线 → 解决第一次重大危机 → 与外星邻居的首次接触\n\n**第三年：繁荣期**\n城市初具规模 → 文化与社会结构成型 → 面对长期的战略挑战（能源 / 环境 / 人口）\n\n**最终评估**：根据殖民地的发展情况，获得不同的结局评价`,
    ],
    action: [
      `**第一幕：边境行者**\n在破碎边境的各据点接取委托 → 结识关键NPC → 获得进入暗影领域的资格\n\n**第二幕：暗影深处**\n深入暗影领域 → 揭开暗影领主真正的计划 → 发现王国与暗影之间的秘密联系\n\n**第三幕：终局抉择**\n面对最终Boss → 决定两个世界的命运 → 多个结局取决于选择与声望`,
    ],
  }

  const questFlow = (questTemplates[g] ?? questTemplates.rpg)[
    Math.floor(Math.random() * (questTemplates[g]?.length ?? 1))
  ]

  // ── Player Branches ──
  const branches: Record<string, string> = {
    rpg: `玩家的选择将以多种方式影响故事走向：\n\n**🌿 道德分支**\n• **秩序之路** — 维护王国现有的秩序，获得贵族与教会的支持\n• **变革之路** — 打破旧制度，获得平民与革命者的支持\n• **中立之路** — 不选边站队，以雇佣兵或自由冒险者的身份影响世界\n\n**🌿 力量分支**\n• **掌控虚空** — 深入掌握虚空之力，获得强大力量但面临被侵蚀的风险\n• **净化虚空** — 寻找彻底封印虚空的方法，获得神圣阵营的认可\n• **融合之道** — 在虚空与圣光之间寻找平衡，开创全新的力量体系\n\n**🌿 羁绊分支**\n六位队友各自有独立的故事线，完成好感度任务后，他们会在终章做出不同的选择——有些人可能离开，有些人会为你牺牲，有些人会成为终局的对手。`,
    strategy: `战略选择决定了你的势力走向：\n\n**🏰 扩张方式**\n• **军事征服** — 以武力统一，效率最高但统治成本也最高\n• **外交联盟** — 通过联姻与条约扩大影响力\n• **经济控制** — 以贸易与资源垄断实现不流血的征服\n\n**🏰 治理理念**\n• **集权帝国** — 高度集中的权力带来高效但易引发叛乱\n• **联邦共治** — 给予各城邦自治权，稳定但决策缓慢\n• **神权统治** — 以宗教为纽带凝聚人心\n\n**🏰 结局走向**\n• 统一大陆的征服者 / 维持均势的平衡者 / 幕后操控的影之支配者`,
    roguelike: `每次冒险中的关键选择：\n\n**🌀 路径分支**\n在迷宫的特定层数，玩家将面对选择不同的路线——每条路线有不同的敌人配置、奖励类型和叙事线索。\n\n**🌀 力量分支**\n• **回廊守护者之路** — 试图净化迷宫，获得光系技能\n• **回廊征服者之路** — 试图掌控迷宫的力量，获得暗系技能\n• **回廊探索者之路** — 只求真相，获得独特的探索能力\n\n**🌀 结局**\n迷宫有超过 10 种不同结局，取决于玩家累计的记忆碎片类型与最终选择。`,
    simulation: `城市的发展方向由管理风格决定：\n\n**🏗️ 发展哲学**\n• **科技至上** — 快速推进科技树，但可能造成生态失衡\n• **生态和谐** — 与星球环境共生，发展较慢但更可持续\n• **文化繁荣** — 优先发展艺术与教育，打造独特的城市文化\n\n**🏗️ 社会形态**\n• 平等主义集体 / 精英管理 / 自由市场\n\n**🏗️ 终局**\n殖民地可能成为星际联邦的明珠 / 独立的新文明 / 与外星种族融合的独特社会`,
    action: `冒险者的道路由声望与选择塑造：\n\n**⚡ 声望分支**\n在各大阵营中积累的声望解锁不同的技能树与装备线\n\n**⚡ 道德抉择**\n关键任务中的选择会影响结局——拯救 vs 复仇 vs 放手\n\n**⚡ 结局**\n• 王国守护者 / 暗影统治者 / 自由流浪者 / 真相揭示者`,
  }

  // ── Reward System ──
  const rewardFactors: Record<string, string[]> = {
    power: [
      `奖励系统围绕**战力提升**构建多层循环：\n\n🎯 **装备进阶**\n• 品质分级：普通 → 稀有 → 史诗 → 传说 → 神话（共 6 级）\n• 强化系统：+1 ~ +15，每 5 级有一次突破，失败不降级但消耗材料翻倍\n• 套装效果：2件/4件/6件触发不同强度的套装技能\n• 外观幻化：同部位装备可自由幻化为已拥有的外观\n\n🎯 **技能树**\n• 三大分支，每个分支 15 个节点，总计 45 个可解锁技能\n• 技能点通过升级与关键任务获得\n• 终极技能需要投入大量技能点并完成专属挑战\n\n🎯 **巅峰挑战**\n• 世界Boss：每周刷新，全服共同挑战\n• 深渊天梯：单人爬塔，每层奖励递增\n• 时空裂隙：高难度限时副本，掉落专属传说装备`,
    ],
    story: [
      `奖励系统以**叙事收集**为核心驱动力：\n\n📖 **故事图鉴**\n• 共 120+ 个可解锁的故事片段\n• 分类为：主线剧情、角色故事、世界秘闻、隐藏传说\n• 完成特定条件后解锁对应的故事章节\n\n📖 **CG 画廊**\n• 超过 50 张全彩剧情插图\n• 在关键剧情节点获得\n• 支持回顾已解锁的剧情场景\n\n📖 **多结局进度**\n• 结局收集面板显示所有可能的结局与解锁条件\n• 二周目继承图鉴与画廊进度\n• 解锁所有结局后揭示"真·结局"`,
    ],
    collect: [
      `**收藏系统**提供持续的目标感：\n\n💎 **全收集挑战**\n• **装备图鉴** — 200+ 件装备等你发现\n• **宠物图鉴** — 60+ 种可捕捉宠物，每种有3种稀有变体\n• **外观衣橱** — 100+ 套角色外观\n• **成就系统** — 300+ 成就，分为探索/战斗/收集/社交四大类\n\n💎 **收集奖励**\n• 每完成一个图鉴的 25%/50%/75%/100% 获得阶梯奖励\n• 全收集图鉴获得专属称号与特效\n• 限时活动提供绝版收集品`,
    ],
    compete: [
      `**竞技系统**构建完整的 PvP 生态：\n\n🏅 **天梯排位**\n• 7 个段位：青铜 → 白银 → 黄金 → 铂金 → 钻石 → 大师 → 传说\n• 赛季制，每 3 个月重置，根据上赛季段位获得荣耀奖励\n• 传说段位前 100 名进入「名人堂」\n\n🏅 **竞技场**\n• 1v1 公平竞技（平衡属性）\n• 3v3 团队竞技（需要配合）\n• 大乱斗（5+人混战，娱乐模式）\n\n🏅 **赛事系统**\n• 月度锦标赛，64 人淘汰制\n• 年度总决赛，全服冠军对决`,
    ],
    create: [
      `**创造系统**让玩家成为内容生产者：\n\n🔨 **领地建造**\n• 自由建造模式：无网格限制的 3D 建造\n• 500+ 种建筑组件\n• 参观他人领地的社交功能\n\n🔨 **关卡编辑器**\n• 可视化关卡设计工具\n• 支持脚本逻辑与自定义规则\n• 发布作品供其他玩家挑战\n\n🔨 **创作者激励**\n• 热门关卡获得官方推荐与奖励\n• 创作者商店——出售自制外观与蓝图\n• 年度创作者评选`,
    ],
  }

  const reward = (rewardFactors[p] ?? rewardFactors.power)[
    Math.floor(Math.random() * (rewardFactors[p]?.length ?? 1))
  ]

  const rewardModifier = a === 'pixel' ? `\n\n🎨 像素风格为奖励界面增添了独特的复古魅力——收集品以精致的像素图标呈现，稀有物品带有闪烁的 CRT 扫描线特效。`
    : a === 'anime' ? `\n\n🎨 日系动画风格下，稀有奖励获得时伴随华丽的变身动画演出，传说级物品拥有专属的 2D 过场展示。`
    : a === 'realistic' ? `\n\n🎨 写实渲染让每一件传说装备都精细到可以看到磨损的痕迹与流转的魔法光泽。`
    : a === 'lowpoly' ? `\n\n🎨 低多边形风格赋予奖励品独特的几何之美——简洁的造型配合柔和的粒子特效。`
    : `\n\n🎨 手绘水彩风格下，每一件稀有收藏品都如同一幅精美的小插画，值得在画廊中细细品味。`

  return {
    worldbuilding: `## 🌍 世界观\n\n${worldDesc}${worldModifier}`,
    protagonist: `## 👤 主角设定\n\n${protag}`,
    coreGameplay: `## 🎮 核心玩法\n\n${coreSource}`,
    questFlow: `## 📜 任务流程\n\n${questFlow}`,
    playerBranches: `## 🌿 玩家分支\n\n${branches[g] ?? branches.rpg}`,
    rewardSystem: `## 🏆 奖励系统\n\n${reward}${rewardModifier}`,
  }
}

// ── Cute loading messages ──
const LOADING_MESSAGES = [
  '正在构思世界观维度…',
  '生成主角人物弧光…',
  '设计核心玩法循环…',
  '编排任务流程结构…',
  '计算玩家分支路径…',
  '平衡奖励经济系统…',
  '润色最终策划文档…',
]

// ── Particle component ──
function FloatingParticles() {
  return (
    <div className="particles">
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${6 + Math.random() * 10}s`,
            fontSize: `${10 + Math.random() * 18}px`,
            opacity: 0.08 + Math.random() * 0.12,
          }}
        >
          {['✦', '◈', '◆', '◇', '▣', '◉'][i % 6]}
        </span>
      ))}
    </div>
  )
}

// ── Home Page ──
function HomePage({ onStart }: { onStart: () => void }) {
  return (
    <div className="page home-page">
      <FloatingParticles />
      <div className="home-content">
        <div className="home-badge">AI-Powered Game Design</div>
        <h1 className="home-title">
          <span className="gradient-text">AI 叙事游戏</span>
          <br />
          策划助手
        </h1>
        <p className="home-subtitle">
          选择游戏基因，AI 即刻生成完整的游戏策划方案——
          <br />
          包含世界观、主角、核心玩法、任务流程、分支系统与奖励设计。
        </p>
        <div className="home-features">
          <div className="feature-chip">🌍 世界观构建</div>
          <div className="feature-chip">⚔️ 核心玩法</div>
          <div className="feature-chip">📜 任务设计</div>
          <div className="feature-chip">🌿 分支系统</div>
          <div className="feature-chip">🏆 奖励体系</div>
        </div>
        <button className="btn-primary btn-start" onClick={onStart}>
          <span>开始生成</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Select Page ──
function SelectPage({
  selections,
  setSelections,
  onGenerate,
  onBack,
}: {
  selections: Selections
  setSelections: (s: Selections) => void
  onGenerate: () => void
  onBack: () => void
}) {
  const allSelected = Object.values(selections).every(Boolean)

  return (
    <div className="page select-page">
      <button className="btn-back" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        返回
      </button>

      <div className="select-header">
        <h2 className="select-title">配置你的游戏基因</h2>
        <p className="select-subtitle">选择四个维度，AI 将为你量身生成策划方案</p>
      </div>

      <div className="select-grid">
        {(Object.keys(OPTIONS) as (keyof typeof OPTIONS)[]).map((key) => (
          <div key={key} className="select-category">
            <h3 className="category-label">{OPTIONS[key].label}</h3>
            <div className="options-list">
              {OPTIONS[key].choices.map((choice) => (
                <button
                  key={choice.value}
                  className={`option-card ${selections[key] === choice.value ? 'selected' : ''}`}
                  onClick={() =>
                    setSelections({ ...selections, [key]: choice.value })
                  }
                >
                  <div className="option-radio">
                    {selections[key] === choice.value && (
                      <span className="radio-dot" />
                    )}
                  </div>
                  <div className="option-text">
                    <span className="option-name">{choice.label}</span>
                    <span className="option-desc">{choice.desc}</span>
                  </div>
                  {selections[key] === choice.value && (
                    <span className="option-check">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className={`btn-primary btn-generate ${allSelected ? '' : 'disabled'}`}
        disabled={!allSelected}
        onClick={onGenerate}
      >
        <span>✨ 生成方案</span>
      </button>
      {!allSelected && (
        <p className="hint-text">
          请完成全部 4 项选择以生成方案
        </p>
      )}
    </div>
  )
}

// ── Generating Page ──
function GeneratingPage({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0)
  const [visibleMessages, setVisibleMessages] = useState<string[]>([])

  useEffect(() => {
    if (step < LOADING_MESSAGES.length) {
      const timer = setTimeout(() => {
        setVisibleMessages((prev) => [...prev, LOADING_MESSAGES[step]])
        setStep(step + 1)
      }, 400 + Math.random() * 300)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(onComplete, 600)
      return () => clearTimeout(timer)
    }
  }, [step, onComplete])

  return (
    <div className="page generating-page">
      <FloatingParticles />
      <div className="generating-content">
        <div className="generating-spinner">
          <div className="spinner-ring" />
          <div className="spinner-core">AI</div>
        </div>
        <h2 className="generating-title">AI 正在生成策划方案…</h2>
        <div className="generating-log">
          {visibleMessages.map((msg, i) => (
            <p key={i} className="log-line">
              <span className="log-dot">●</span> {msg}
            </p>
          ))}
          {step < LOADING_MESSAGES.length && <span className="log-cursor">▌</span>}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${(step / LOADING_MESSAGES.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ── Result Page ──
function ResultPage({
  plan,
  selections,
  onRegenerate,
  onBack,
}: {
  plan: GamePlan
  selections: Selections
  onRegenerate: () => void
  onBack: () => void
}) {
  const [visibleSections, setVisibleSections] = useState(0)
  const sections = Object.entries(plan)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleSections(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    sections.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleSections(i + 1), i * 250))
    })
    return () => timers.forEach(clearTimeout)
  }, [plan])

  const configSummary = `${TYPE_NAMES[selections.gameType] ?? selections.gameType} · ${FOCUS_NAMES[selections.gameplayFocus] ?? selections.gameplayFocus} · ${ART_NAMES[selections.artStyle] ?? selections.artStyle} · ${GOAL_NAMES[selections.playerGoal] ?? selections.playerGoal}`

  return (
    <div className="page result-page">
      <div className="result-actions-top">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          重新选择
        </button>
        <button className="btn-primary btn-regenerate" onClick={onRegenerate}>
          <span>🔄 重新生成</span>
        </button>
      </div>

      <div className="result-header">
        <h2 className="result-title">📋 游戏策划方案</h2>
        <p className="result-config">{configSummary}</p>
      </div>

      <div className="result-document" ref={resultRef}>
        {sections.slice(0, visibleSections).map(([key, content]) => (
          <section key={key} className={`doc-section fade-in`}>
            {content.split('\n').map((line, i) => {
              if (line.startsWith('## ')) {
                return null // Already rendered by the first section header approach — actually we render the h2 and then the rest
              }
              if (line.startsWith('### ')) {
                return <h3 key={i} className="doc-h3">{line.replace('### ', '')}</h3>
              }
              if (line.startsWith('**') && line.endsWith('**')) {
                return <p key={i} className="doc-bold">{line.replace(/\*\*/g, '')}</p>
              }
              if (line.startsWith('• ') || line.startsWith('- ')) {
                return <li key={i} className="doc-li">{line.replace(/^[•\-] /, '')}</li>
              }
              if (line.trim() === '') {
                return <br key={i} />
              }
              return <p key={i} className="doc-p">{line}</p>
            })}
          </section>
        ))}
      </div>
    </div>
  )
}

// ── Main App ──
export default function App() {
  const [page, setPage] = useState<Page>('home')
  const [selections, setSelections] = useState<Selections>({
    gameType: '',
    gameplayFocus: '',
    artStyle: '',
    playerGoal: '',
  })
  const [plan, setPlan] = useState<GamePlan | null>(null)

  const handleGenerate = useCallback(() => {
    setPage('generating')
  }, [])

  const handleComplete = useCallback(() => {
    const newPlan = generatePlan(selections)
    setPlan(newPlan)
    setPage('result')
  }, [selections])

  const handleRegenerate = useCallback(() => {
    setPage('generating')
  }, [])

  const handleResetSelections = useCallback(() => {
    setSelections({ gameType: '', gameplayFocus: '', artStyle: '', playerGoal: '' })
    setPage('select')
  }, [])

  return (
    <div className="app">
      {page === 'home' && <HomePage onStart={() => setPage('select')} />}
      {page === 'select' && (
        <SelectPage
          selections={selections}
          setSelections={setSelections}
          onGenerate={handleGenerate}
          onBack={() => setPage('home')}
        />
      )}
      {page === 'generating' && <GeneratingPage onComplete={handleComplete} />}
      {page === 'result' && plan && (
        <ResultPage
          plan={plan}
          selections={selections}
          onRegenerate={handleRegenerate}
          onBack={handleResetSelections}
        />
      )}
    </div>
  )
}
