import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

// ── Types ──────────────────────────────────────────────
type Page = 'home' | 'select' | 'generating' | 'result' | 'favorites'

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

interface User {
  nickname: string
  email: string
}

interface Favorite {
  id: string
  title: string
  plan: GamePlan
  selections: Selections
  timestamp: number
}

// ── Option definitions ─────────────────────────────────
const OPTIONS = {
  gameType: {
    label: '🎮 游戏类型',
    choices: [
      { value: 'openworld', label: '开放世界', desc: '无缝大地图，自由探索每一寸土地' },
      { value: 'folklore', label: '国风志怪', desc: '东方神话，妖怪传说，古典志怪美学' },
      { value: 'cyberpunk', label: '赛博都市', desc: '近未来科幻，霓虹都市，义体改造' },
      { value: 'wasteland', label: '末世废土', desc: '灾后世界，文明废墟，生存冒险' },
      { value: 'scifi', label: '星际远征', desc: '太空歌剧，外星文明，星河舰队' },
    ],
  },
  gameplayFocus: {
    label: '⚔️ 玩法重点',
    choices: [
      { value: 'narrative', label: '剧情探索', desc: '沉浸叙事，选择驱动，多线结局' },
      { value: 'combat', label: '战斗养成', desc: '动作连招，数值成长，极限挑战' },
      { value: 'exploration', label: '自由探索', desc: '隐藏秘密，环境叙事，无缝漫游' },
      { value: 'strategy', label: '策略经营', desc: '资源管理，阵营博弈，领土发展' },
      { value: 'puzzle', label: '解谜收集', desc: '机关破解，图鉴收集，隐藏成就' },
    ],
  },
  artStyle: {
    label: '🎨 美术风格',
    choices: [
      { value: 'eastern', label: '东方幻想', desc: '阴阳师式，和风幽玄，妖异美学' },
      { value: 'wasteland_tech', label: '末世机能', desc: '鸣潮式，废土科技，声骸武装' },
      { value: 'fantasy', label: '奇幻冒险', desc: '原神式，明亮二次元，元素世界' },
      { value: 'ink', label: '水墨国风', desc: '写意山水，丹青留白，古典意境' },
      { value: 'pixel', label: '像素复古', desc: '16-bit 美学，精致点阵，怀旧色彩' },
    ],
  },
  playerGoal: {
    label: '🏆 玩家目标',
    choices: [
      { value: 'growth', label: '角色成长', desc: '战力突破，装备进化，极限养成' },
      { value: 'story', label: '剧情体验', desc: '多线叙事，选择后果，情感共鸣' },
      { value: 'collect', label: '收集养成', desc: '全图鉴，稀有变体，外观衣橱' },
      { value: 'compete', label: '竞技挑战', desc: 'PVP天梯，赛季排名，荣誉殿堂' },
      { value: 'create', label: '创造建造', desc: '自定义领地，关卡编辑器，UGC生态' },
    ],
  },
}

// ── Mock AI Generation ─────────────────────────────────
const TYPE_NAMES: Record<string, string> = {
  openworld: '开放世界', folklore: '国风志怪', cyberpunk: '赛博都市',
  wasteland: '末世废土', scifi: '星际远征',
}
const FOCUS_NAMES: Record<string, string> = {
  narrative: '剧情探索', combat: '战斗养成', exploration: '自由探索',
  strategy: '策略经营', puzzle: '解谜收集',
}
const ART_NAMES: Record<string, string> = {
  eastern: '东方幻想', wasteland_tech: '末世机能', fantasy: '奇幻冒险',
  ink: '水墨国风', pixel: '像素复古',
}
const GOAL_NAMES: Record<string, string> = {
  growth: '角色成长', story: '剧情体验', collect: '收集养成',
  compete: '竞技挑战', create: '创造建造',
}

// ── Worldbuilding templates ──
const WORLDS: Record<string, string[]> = {
  openworld: [
    `在这片被称为「艾瑟兰」的广袤大陆上，七种元素之力维系着世界的平衡。从璃月港的繁华街市到蒙德城外的风起地，从层岩巨渊的地下矿脉到天穹岛上的天空神殿——每一寸土地都埋藏着被遗忘的历史，每一阵风中都飘荡着未完成的歌谣。\n\n大陆由七个元素国度组成，它们之间既有贸易与文化的纽带，也有因资源与信仰而起的纷争。而在这片大地的最深处，远古封印正在松动，沉睡的灾厄即将苏醒。\n\n• **风之国度** — 自由的城邦，吟游诗人的故乡\n• **岩之国度** — 契约与商业的中心，千岩军守护的繁华之都\n• **雷之国度** — 永恒的群岛，雷电将军守望的净土\n• **草之国度** — 智慧的殿堂，学者与贤者的学术之城\n• **水之国度** — 正义的法庭所在，审判与真相的国度\n• **火之国度** — 战争的熔炉，角斗士与烈焰的竞技场\n• **冰之国度** — 至冬的冰封王座，女皇的铁腕统治`,

    `「天穹大陆」由无数浮空岛屿与地表的破碎大陆共同构成。远古时期的一场被称为"天裂"的浩劫将完整的大陆撕成碎片，散落在无尽的云海之中。\n\n如今，人们依靠「空艇」与「传送门」在岛屿之间往来。每个浮空岛都有独特的生态、文明与秘密。而在云海的最深处，传说隐藏着天裂之前的完整大陆——「原初之地」，那里保存着改变世界命运的力量。\n\n• **上层空域** — 贵族与富商的天堂，浮空城邦林立\n• **中层空域** — 冒险者的主舞台，遍布遗迹与秘境\n• **下层云海** — 被遗忘者与流放者的栖息地\n• **原初之地** — 云海之底，传说中完整大陆的废墟`,
  ],

  folklore: [
    `大梁朝永和年间，人界与妖界之间的「结界」日渐稀薄。百鬼夜行不再只是传说，妖怪开始频繁出现在人间的村落与城郭。\n\n在这片东方大陆上，世间万物皆可成灵——古树历经千年化为木魅，山涧深潭中潜伏着蛟龙，废弃的古宅里寄居着付丧神。而掌管这一切秩序的，是已经消失千年的「阴阳寮」——直到最近，人们在一座荒废的神社中发现了一枚古老的式神令牌。\n\n世界由三界构成，彼此交错又各自独立：\n• **人间界** — 人类王朝与凡尘烟火，妖怪暗中出没\n• **妖界** — 百鬼夜行的异域，妖怪的故乡与狩猎场\n• **幽世** — 灵魂往生的过渡之地，神明与亡者共存的领域`,

    `在「九黎」这片东方奇幻大陆上，上古时期的神魔大战留下了数不清的秘境与遗物。山海经中记载的异兽并非虚构——它们只是沉睡了千年，如今正逐一苏醒。\n\n大陆分为九州，每州有其守护的「灵脉」，灵脉汇聚之处便是「灵域」——凡人无法踏足的神圣之地。而你所在的「青州」，灵脉正在枯竭，妖兽日益肆虐。一场席卷九州的浩劫即将降临，而解开这一切的钥匙，藏在上古神话与山海经卷之中。\n\n• **九州大地** — 每州有独特的地理风貌与灵兽族群\n• **灵域** — 灵脉汇聚的异次元空间，上古遗迹所在\n• **归墟** — 万灵归寂的深渊，被封印的神魔沉睡之地`,
  ],

  cyberpunk: [
    `公元 2087 年，「新东京-横滨超级都市圈」——简称 Neo-Yokohama ——是世界上最大的垂直城市。摩天大楼穿透云层，霓虹全息广告覆盖了每一寸天空。巨型企业取代了政府，生物芯片植入成为了公民身份的象征。\n\n在光鲜的表皮之下，90% 的人口生活在"下城"——永不见天日的街区，靠着企业的残羹冷炙过活。而控制这一切的，是三大超级企业：\n• **天命科技** — 主营义体改造与生物芯片，掌控公民身份数据\n• **神乐重工** — 军事科技与机甲制造，实际控制着城市的武装力量\n• **幻梦网络** — 虚拟现实与记忆植入，人们沉溺于他们制造的幻境\n\n而你，在这座吞噬灵魂的钢铁丛林中，收到了一条来自已故友人的加密信息。`,

    `「镜城」——一座被全息穹顶笼罩的实验性都市。企业联盟宣称这里是人类的乌托邦：没有犯罪、没有疾病、没有痛苦。每一个居民的记忆都在"云端"备份，死后可以通过意识上传获得"永生"。\n\n但完美的表象之下，镜城是一个巨大的社会实验。每个人的行为被「天眼系统」实时监控，思想被「情绪调节芯片」控制。所谓的"永生"不过是将意识困在无尽的虚拟循环中。而最近，开始有人"觉醒"——他们感知到了这个世界的虚假。\n\n• **上层穹顶** — 企业精英与纯种人类的乐园\n• **中层街区** — 普通市民的生活区，表面繁华\n• **底层暗区** — 觉醒者、黑客与反抗者的隐匿之地\n• **云端虚拟空间** — 意识上传后的数字牢笼`,
  ],

  wasteland: [
    `「大寂静」降临已过百年。那场被称为"共鸣灾难"的浩劫并非核战争——它来自深海，某种远古存在的苏醒释放出了足以撕裂现实的声波。文明在一夜之间崩塌，99% 的人类化为无声的"残响"——失去意识、只会重复生前最后动作的空壳。\n\n幸存者在废墟之上建立起移动城市——由巨型机甲平台承载的流浪聚落。而在这片废土上，最珍贵的资源不是食物与水，而是「声骸」——灾难中某些生物与人类结晶化后留下的、蕴含着特殊频率的遗物。声骸可以被共鸣者激活，化为武器、护甲，甚至同伴。\n\n• **移动城市** — 幸存者最后的家园，在废土上不断迁徙\n• **寂静区** — 残响聚集的危险区域，也是最丰富的声骸产地\n• **共鸣塔** — 散落各地的古代设施，据说能够平息残响\n• **深海原点** — 灾难的源头，至今无人能够靠近`,
  ],

  scifi: [
    `银河纪元 2477 年，「星际联邦」的版图横跨三千光年，涵盖 186 个可居住星系。人类早已不是孤独的智慧生命——银河议会中有 27 个智慧种族拥有席位。\n\n然而联邦并非铁板一块。边缘星系的独立运动愈演愈烈，外星文明「泽恩帝国」在联邦边境陈兵百万，而探索舰队在银河系边缘发现了一处比联邦还要古老的超文明遗迹——其科技水平领先联邦至少一千年。\n\n• **核心星系** — 联邦的政治经济中心，高度发达\n• **殖民星系** — 新兴的边疆世界，机会与危险并存\n• **边缘星域** — 法外之地，海盗、走私者与独立势力的乐园\n• **泽恩帝国边境** — 紧张的对峙前线，随时可能爆发战争\n• **先驱者遗迹** — 未知超文明的废墟，银河系最大的秘密`,

    `人类终于证明了我们不是宇宙中唯一的智慧生命——但代价是惨重的。「第一次接触战争」持续了三十年，在与外星种族「卡兰虫群」的战争中，人类失去了十二个殖民星球。\n\n如今，脆弱的和平协议已经签署。但你——「星界探索者」的成员——被派往银河系的未知区域，执行一项最高机密任务：寻找传说中能够与虫群意识沟通的「心灵之核」。\n\n• **人类联邦** — 战后重建中，内部政治分裂\n• **卡兰虫群** — 蜂巢意识的外星种族，并非纯粹的邪恶\n• **中立星域** — 其他外星文明的领空，外交的舞台\n• **深空未知区** — 从未被探索的黑暗星域`,
  ],
}

// ── Art style flavor modifiers ──
const ART_FLAVOR: Record<string, string> = {
  eastern: `\n\n🎨 **东方幻想美学**：整体视觉以阴阳师风格为基调——暗金色与紫藤色交织的色调，半透明的灵体在场景中飘荡，神社的鸟居在月光下投下长长的剪影。妖怪设计融合了浮世绘的线条感与现代渲染技术，每条妖纹都仿佛在呼吸。`,
  wasteland_tech: `\n\n🎨 **末世机能美学**：鸣潮式废土科幻的视觉基调——苍白的天空、锈蚀的金属与流动的蓝色声波能量形成强烈对比。声骸武装展开时，几何光纹在角色身上浮现，残响的轮廓由破碎的粒子构成，危险而美丽。`,
  fantasy: `\n\n🎨 **奇幻冒险美学**：明亮的二次元风格渲染——蓝天碧草与色彩饱和的元素特效，角色设计精致可爱，服装细节丰富。七种元素在视觉上有鲜明的颜色区分，元素爆发时伴随华丽的 2D 动画过场。`,
  ink: `\n\n🎨 **水墨国风美学**：以中国传统水墨画为灵魂——远山近水以写意笔法渲染，角色采用工笔线描勾勒。墨色浓淡干湿的变化营造出独特的空间感，留白处意境无穷。技能释放时墨迹飞溅如龙蛇游走，朱砂点缀其间。`,
  pixel: `\n\n🎨 **像素复古美学**：精致的 16-bit 点阵艺术——每一帧都像一幅可以行走的像素画卷。角色动画采用逐帧手绘，场景中隐藏着无数像素级的彩蛋。稀有物品的拾取动画带有 CRT 扫描线与色散特效，怀旧与精致并存。`,
}

// ── Protagonist templates ──
const PROTAGS: Record<string, string[]> = {
  openworld: [
    `**身份**：流浪者——不属于任何国度的自由冒险者\n**年龄**：未知（外表约 20 岁）\n**特殊之处**：天生能够同时操控多种元素之力——这在世界上极其罕见，被认为是上古"元素之主"转世的征兆。\n\n主角没有过去的记忆，只在一次苏醒时发现自己躺在某个国度的海滩上，身旁只有一把残破的剑和一枚无法辨识的徽章。在寻找记忆的旅途中，主角逐渐发现自己与千年前那场"元素战争"有着神秘的联系。\n\n性格由玩家塑造——每一个对话选择、每一次任务完成方式，都会定义主角在世界中的角色：\n• **英雄** — 为正义与和平而战，赢得万民敬仰\n• **冒险者** — 只为探索未知与宝藏，自由不羁\n• **谜题追寻者** — 执着于揭开自己身世的真相`,
  ],

  folklore: [
    `**身份**：见习阴阳师——阴阳寮的最后一位传人\n**年龄**：17 岁\n**出身**：某个被妖怪毁灭的村庄中唯一的幸存者\n**特殊能力**：天生拥有"灵视"——能够看到妖怪的真实形态与弱点。更罕见的是，主角能够与妖怪缔结「式神契约」，将妖怪收为同伴并肩作战。\n\n十年前，主角所在的村庄在一夜之间被强大的妖怪焚毁，唯有主角被一位路过的阴阳师救下。如今，那位阴阳师已经失踪，留给主角的只有一本残缺的《百鬼手札》和一枚褪色的式神令牌。为了寻找师父的下落，也为了揭开那场灾难的真相，主角踏上了前往平安京的旅途。\n\n式神羁绊由玩家选择塑造：\n• **守护者** — 与式神建立守护与信任的羁绊\n• **支配者** — 以力量压制妖怪，强迫服从\n• **理解者** — 深入妖怪的内心，化解怨念`,
  ],

  cyberpunk: [
    `**代号**：「Ghost」\n**身份**：前企业安全部门的精英黑客，现为自由佣兵\n**年龄**：24 岁\n**装备**：军用级神经接口、左臂为定制化义体（集成了解码器与等离子切割刀）\n**困境**：在一次针对天命科技的黑客行动中，Ghost 发现了一个名为「普罗米修斯」的秘密项目——企业正在批量制造被植入虚假记忆的"人造人"。而Ghost 自己的记忆，似乎也并不完整。\n\nGhost 游走于上城的霓虹与下城的阴影之间。没有固定的盟友，只有临时的交易。但在调查普罗米修斯项目的过程中，Ghost 逐渐被卷入了一场足以颠覆整个超级企业秩序的风暴。\n\n玩家可以选择 Ghost 的行事风格：\n• **无名者** — 隐匿于网络，以情报与诡计取胜\n• **破坏者** — 正面突入，用武力与火力说话\n• **变革者** — 唤醒大众，发起一场底层革命`,
  ],

  wasteland: [
    `**代号**：「共鸣者」\n**身份**：废土上罕见的能够激活「声骸」的觉醒者\n**年龄**：未知（废土上没有人在意年龄）\n**特征**：颈部有共鸣灾变留下的结晶化痕迹，在激活声骸时会发出微弱的蓝色荧光\n**装备**：能够共鸣并驱使多种声骸的「协调器」——一种由古代科技改造的腕部装置\n\n共鸣者没有关于灾难前生活的记忆——或许是被灾难抹去了，或许是自己选择遗忘。唯一随身携带的是一枚已经失去光泽的声骸碎片，里面残存着一段不完整的音频，是一个小女孩在呼唤某个名字。\n\n在废土上，共鸣者既是希望的象征，也是各势力争夺的武器。玩家必须在这片荒芜的世界中生存下去，同时追寻那枚声骸碎片中残存的记忆线索。\n\n共鸣者的道路：\n• **流浪者** — 独行于废土，只为自己而活\n• **守护者** — 保护移动城市，成为幸存者的希望\n• **追寻者** — 前往深海原点，揭开灾难的真相`,
  ],

  scifi: [
    `**身份**：「星界探索者」——星际联邦直属的精英探险队员\n**军衔**：中尉\n**专长**：异星考古学与外星语言学，同时接受过高级战斗训练\n**任务**：被派往银河系边缘调查先驱者遗迹的最新发现\n\n在最近的一次遗迹探索中，主角触碰了一件未知的先驱者遗物，从此开始看到无法解释的幻象——来自数十亿年前的画面片段。更令人不安的是，这些幻象似乎在传达某种警告信息：关于一个比泽恩帝国更古老、更危险的威胁。\n\n联邦高层对这些幻象半信半疑，但给了主角一艘侦察舰和一队小型船员，前往深空未知区域寻找答案。\n\n玩家的领导风格：\n• **外交官** — 以外交与文化交流为优先手段\n• **战术家** — 以军事力量与战略部署解决问题\n• **探索者** — 以科学研究与遗迹挖掘为主要方向`,
  ],
}

// ── Core gameplay mapped by game type × gameplay focus ──
const CORE_GAMEPLAY: Record<string, Record<string, string>> = {
  openworld: {
    narrative: `开放世界中的每一个角落都有一个故事等待被讲述。**动态叙事系统**让主线与支线紧密交织：\n\n🎭 **因果叙事网**\n• 完成某个区域的支线任务可能解锁主线中的隐藏对话选项\n• NPC 的命运会因为你的选择而走向截然不同的结局\n• 世界中的大事件会动态改变——错过激流勇退的时机，可能永远无法回头\n\n🎭 **同伴故事线**\n• 六位核心同伴各自拥有独立的背景故事与个人任务\n• 提升羁绊解锁新的元素共鸣技能\n• 同伴之间也有互动——有些人会成为挚友，有些人会因理念分歧而离开\n\n🎭 **抉择时刻**\n• 关键剧情节点没有"正确"选择，只有不同的后果\n• 每个选择都会在后续章节中产生回响`,

    combat: `**元素连携战斗系统**是核心战斗体验。利用七种元素之间的相互作用，创造出无限的战术可能：\n\n⚡ **元素反应网**\n• 火+水=蒸发（1.5x伤害）/ 水+火=蒸汽（AOE致盲）\n• 雷+水=感电（连锁伤害）/ 火+雷=超载（爆炸击退）\n• 冰+水=冻结（控制）/ 岩+任意元素=结晶（护盾）\n• 风+任意元素=扩散（范围附着）/ 草+雷=激化（持续伤害）\n\n⚡ **连携战斗**\n• 四名角色之间的元素技能可以叠加触发复合反应\n• 精准切换角色的时机决定了输出上限\n• 终极技能需要积攒元素能量，释放时伴随专属动画\n\n⚡ **养成深度**\n• 角色等级、武器、圣遗物、天赋——四维养成体系\n• 不同流派构建（物理流 / 元素流 / 反应流 / 盾奶流）`,

    exploration: `自由探索是这款游戏最核心的乐趣。无缝大地图上，任何你能看到的地方都可以到达：\n\n🗺️ **垂直探索**\n• 攀爬任何表面，滑翔穿越峡谷\n• 水域可以游泳、潜水，探索水下洞穴与沉船\n• 天空岛屿需要解谜解锁飞行路径\n\n🗺️ **发现机制**\n• 元素视野：切换后可看到隐藏的交互点与可破坏墙壁\n• 寻宝罗盘：指向最近的未发现宝箱\n• 秘境入口：散布在世界各处的副本入口，有些只在特定时间出现\n\n🗺️ **环境叙事**\n• 废墟中的日记碎片讲述战争往事\n• 路边的无名墓碑下埋葬着一段未完成的故事\n• 散布各地的壁画暗示着远古真相`,

    strategy: `在世界探索之上，叠加了深度的**领地经营与阵营博弈**：\n\n🏰 **家园建设**\n• 在世界各地获取地契，建造与装饰自己的领地\n• 领地生产资源、吸引商人、解锁特殊任务\n• 领地风格由建筑选择决定——可以是东方庭院，也可以是欧式城堡\n\n🏰 **声望网络**\n• 七大国度各有声望系统，影响可购买物品与可进入区域\n• 在两个对立阵营之间平衡声望是一门艺术\n• 声望达到一定程度解锁专属剧情线与外观\n\n🏰 **贸易路线**\n• 打通不同国度之间的贸易路线\n• 物价因区域供需关系而波动\n• 护送商队抵御沿途的怪物袭击`,

    puzzle: `开放世界的每一个角落都隐藏着精心设计的谜题：\n\n🧩 **元素机关**\n• 使用特定元素激活散布在世界各处的古代机关\n• 元素方碑需要按正确顺序点亮\n• 仙灵指引通往隐藏宝箱的路径\n\n🧩 **环境解谜**\n• 水位调节、光线折射、高低差利用——多种物理机制\n• 旋转拼接类谜题需要从环境线索中找到正确答案\n• 音乐谜题——记住旋律并在正确的乐器上复现\n\n🧩 **收集驱动**\n• 神瞳收集：散布全球的 200+ 个收集品，提升体力上限\n• 宝箱图鉴：记录各地发现的宝箱类型与数量\n• 成就系统：超过 500 个成就等待解锁`,
  },

  folklore: {
    narrative: `国风志怪的世界中，每一个妖怪背后都有一段值得被倾听的故事。**妖怪物语系统**：\n\n👻 **百鬼手札**\n• 每遭遇一种妖怪，自动记录在手札中\n• 深入了解妖怪的生前故事可以解锁"超度"或"契约"选项\n• 有些妖怪并非恶者——它们的怨念源于人类的伤害\n\n👻 **式神羁绊**\n• 与契约式神通过战斗与对话提升羁绊等级\n• 羁绊达到一定程度解锁式神的专属剧情任务\n• 式神的最终命运由你的选择决定——解放它们，还是永远契约\n\n👻 **章节式叙事**\n• 主线如同一部章回体小说，每章一个核心妖怪故事\n• 章节之间有时间流逝，世界状态随之变化\n• 某些章节的结局会影响后续章节的可选路线`,

    combat: `**符咒与式神双线战斗系统**：\n\n🔮 **符咒体系**\n• 五行符法：金木水火土，相生相克\n• 符咒可以组合使用——先以水符定身，再以雷符击破\n• 高级符咒需要绘制符阵，在战斗中需要走位与时间管理\n\n🔮 **式神召唤**\n• 战斗中可同时召唤 2 体式神协助作战\n• 每个式神有独特的技能与属性\n• 式神连携：特定式神组合出场触发特殊合体技能\n• 式神养成：通过供奉与战斗提升式神等级与技能\n\n🔮 **阴阳调和**\n• 战斗中阴阳值在阴阳之间动态变化\n• 阴状态下符咒伤害提升，阳状态下式神能力增强\n• 在合适的时机转换阴阳状态是制胜关键`,

    exploration: `古色古香的东方世界等待着探索：\n\n🏮 **和风场景**\n• 从繁华的平安京街市到荒凉的山间神社\n• 雪中的温泉乡、樱花下的古战场、迷雾笼罩的竹海\n• 昼夜与天气系统影响妖怪的出现种类\n\n🏮 **灵视探索**\n• 开启灵视可以看到隐藏的妖气痕迹\n• 追踪妖气找到隐藏的妖怪巢穴或宝物\n• 灵视状态下可以看到"此岸"与"彼岸"的重叠——两个世界在同一空间的映射\n\n🏮 **结界与封印**\n• 散布各处的被封印区域需要特定条件才能进入\n• 使用符咒与仪式解除封印\n• 封印背后往往隐藏着强大妖怪或古代遗物`,

    strategy: `策略经营体现在**阴阳寮的复兴**上：\n\n⛩️ **重建阴阳寮**\n• 收集资源重建曾经辉煌的阴阳寮\n• 招募有特殊能力的 NPC 加入\n• 阴阳寮的等级决定了可携带式神数量与符咒种类\n\n⛩️ **式神派遣**\n• 派遣式神执行区域任务，获取资源与情报\n• 式神之间的相性影响任务成功率\n• 某些稀有式神只在特定条件下出现\n\n⛩️ **势力关系**\n• 人类朝廷、妖怪势力、阴阳师组织——三方博弈\n• 你的决策影响三方对你的态度\n• 在夹缝中平衡各方利益，或者选择其中一方效忠`,

    puzzle: `解谜与志怪世界深度融合：\n\n📜 **符阵解谜**\n• 将正确的符咒放入符阵的对应位置\n• 符阵的线索隐藏在环境叙事与古籍描述中\n• 错误组合可能召唤出意想不到的妖怪\n\n📜 **妖怪谜题**\n• 某些妖怪不会直接攻击，而是提出谜题\n• 答对获得奖励与妖怪的尊重\n• 答错可能惹怒妖怪，触发强制战斗\n\n📜 **秘境探索**\n• 妖界秘境中充满了扭曲现实的谜题\n• 时间回溯、空间翻转、镜像世界——奇异机制\n• 秘境深处隐藏着上古妖王的宝藏`,
  },

  cyberpunk: {
    narrative: `赛博都市中，真相与谎言纠缠不清。**记忆叙事系统**：\n\n💾 **记忆碎片**\n• 通过入侵他人神经接口获取记忆片段\n• 不同人的记忆可能相互矛盾——真相需要玩家自己拼凑\n• 某些记忆是被人为植入的假象\n\n💾 **信任系统**\n• 在赛博世界，信任是最昂贵的货币\n• 每个关键 NPC 有独立的信任值\n• 高信任解锁隐藏情报与支援\n• 背叛会在整个关系网络中产生连锁反应\n\n💾 **多线结局**\n• 结局取决于你选择相信谁，以及你愿意为真相付出什么代价\n• 揭示了"真相"之后，还要选择：公之于众 / 以此勒索 / 永远埋葬`,

    combat: `**赛博格斗系统**将义体改造与战术黑客相结合：\n\n🔫 **义体战斗**\n• 手臂义体可切换多种模式：等离子刀刃、动能拳套、微型导弹\n• 腿部义体提供瞬移闪避与壁面行走能力\n• 眼部义体提供弹道预测与弱点分析\n\n🔫 **黑客入侵**\n• 战斗中实时入侵敌方义体——使其武器过热或视觉失灵\n• 入侵摄像头与自动防御系统，转化为己方战力\n• 高级黑客技能可以短时间内操控敌方机甲\n\n🔫 **时停系统**\n• 神经加速器激活后进入"子弹时间"\n• 在时停中规划连招路线、标记多个目标\n• 时停消耗神经能量，需要管理能量条`,

    exploration: `垂直生长的超级都市提供了前所未有的探索维度：\n\n🌆 **垂直分层**\n• 上城：企业大厦与空中花园，精英阶层的生活区\n• 中城：商业区与居民区，霓虹灯光的海洋\n• 下城：被遗忘的街区，黑市与觉醒者的藏身地\n• 管道层：城市底部的维护通道，最危险的区域\n\n🌆 **信息探索**\n• 扫描环境获取电子线索\n• 接入终端读取邮件、日志与监控录像\n• 追踪数据流找到隐藏服务器\n\n🌆 **义体能力探索**\n• 某些区域只能通过特定义体能力到达\n• 光学迷彩穿越监控区域\n• 强化跳跃到达高处入口`,

    strategy: `在超级企业的夹缝中建立自己的势力：\n\n🏢 **声望网络**\n• 三大企业各自有声望树\n• 同时取悦所有企业是不可能的——必须做出取舍\n• 声望影响可购买义体、武器与情报\n\n🏢 **据点建设**\n• 在城市的暗处建立安全屋\n• 升级设施：武器工坊、黑客工作站、情报网络\n• 据点也是招募同伴与承接委托的中心\n\n🏢 **委托系统**\n• 从各个势力接取高风险委托\n• 委托有多种完成方式——正面突入还是潜入暗杀\n• 委托结果影响势力格局与后续可接任务`,

    puzzle: `赛博空间中的数字解谜：\n\n🔐 **ICE 破解**\n• 企业网络被 ICE（入侵对抗电子系统）保护\n• 在虚拟空间中用代码与逻辑破解防护\n• 不同类型的 ICE 需要不同的破解策略\n\n🔐 **环境解谜**\n• 利用电路重连、激光反射、全息投影等机制\n• 时间限制的解谜增加紧张感\n• 某些房间本身就是复杂的机关箱\n\n🔐 **数据挖掘**\n• 在巨量数据中搜索关键信息\n• 使用关键词过滤与关联搜索\n• 发现被删除的隐藏文件与加密档案`,
  },

  wasteland: {
    narrative: `废土上的故事由幸存者们的记忆编织而成。**残响叙事系统**：\n\n📻 **声骸记忆**\n• 每枚声骸都承载着死者生前的最后一段记忆\n• 通过共鸣声骸，你可以看到灾难前后的碎片化画面\n• 拼凑这些片段，逐渐揭示灾难的真相\n\n📻 **移动城市故事**\n• 移动城市是废土上唯一的社会结构\n• 每个 NPC 都有在灾难前后的完整故事\n• 城市会因资源危机、内部分裂或外来威胁而面临重大选择\n\n📻 **残响日记**\n• 在废土各地收集残响留下的音频日志\n• 日志的作者身份逐步揭示——他们与你有着意想不到的关联\n• 某些日志中包含加密信息，需要特定声骸才能解码`,

    combat: `**声骸战斗系统**将收集与战斗深度结合：\n\n⚔️ **声骸装备**\n• 击败残响或完成特定条件获得声骸\n• 声骸可以装备在武器、防具、辅助三个槽位\n• 不同声骸组合激活不同的"共鸣套装"效果\n\n⚔️ **共鸣技能**\n• 每个声骸提供独特的主动技能\n• 战斗中可以在装备的声骸技能之间切换\n• 声骸之间存在连携——特定技能顺序触发额外效果\n\n⚔️ **残响狩猎**\n• 高级残响拥有复杂的攻击模式需要学习\n• 破坏残响的特定部位可以获得稀有掉落\n• 有些残响需要利用环境或特定声骸才能造成有效伤害`,

    exploration: `废土的每一寸土地都藏着秘密：\n\n🏜️ **区域解锁**\n• 废土分为多个生态区域：锈蚀平原、结晶森林、沉没都市、灰烬沙漠\n• 每个区域有推荐等级与独特的残响种类\n• 区域Boss击败后解锁新的移动城市停靠点\n\n🏜️ **声骸雷达**\n• 使用声骸雷达探测附近的残响与声骸矿脉\n• 不同频率的声波揭示不同类型的隐藏物\n• 稀有声骸在雷达上显示为金色信号\n\n🏜️ **据点解锁**\n• 在废土各地建立前哨站\n• 前哨站提供快速移动、物资补给与声骸存储\n• 升级前哨站扩大探测范围与物资产出`,

    strategy: `移动城市的生存与管理：\n\n🏚️ **城市经营**\n• 管理移动城市的资源：能源、食物、水、人口\n• 选择城市的迁徙路线——不同路线遭遇不同事件\n• 建造与升级城市设施：医院、工坊、声骸研究所\n\n🏚️ **派系管理**\n• 城市内部存在多个派系：生存主义者、科技复兴派、新秩序派\n• 每个派系有独立的诉求与声望\n• 平衡各派系或选择压制某些派系\n\n🏚️ **远征规划**\n• 组织远征队前往高危区域\n• 选择队员配置与携带物资\n• 远征成功带回稀有资源与声骸`,

    puzzle: `废土上的谜题与声骸机制紧密结合：\n\n🔊 **频率解谜**\n• 使用协调器发射特定频率激活古代装置\n• 频率线索隐藏在环境声音与残响记忆中\n• 正确频率组合可以解锁隐藏区域\n\n🔊 **声骸拼图**\n• 某些机关需要将声骸嵌入对应槽位\n• 声骸的形状、共鸣频率都需要匹配\n• 完成拼图获得稀有套装声骸\n\n🔊 **回声定位**\n• 在黑暗区域使用声波进行回声定位\n• 声波可以揭示隐藏的通道与陷阱\n• 不同频率的声波揭示不同类型的物体`,
  },

  scifi: {
    narrative: `星际尺度下的个人史诗。**银河叙事系统**：\n\n🚀 **星际事件链**\n• 银河系中的大事件会动态影响所有星系的状况\n• 战争爆发、新种族发现、遗迹解密——世界持续演进\n• 你的行动会产生跨星系的连锁反应\n\n🚀 **种族关系网**\n• 27 个智慧种族各有独立的文化与历史\n• 种族之间的关系错综复杂——盟友的敌人不一定是你的敌人\n• 深入了解每个种族的文化可以解锁独特的叙事线\n\n🚀 **先驱者之谜**\n• 主线围绕解开先驱者超文明的谜团\n• 他们的科技、他们的消亡、他们对未来的警告\n• 每一处遗迹都揭示一部分真相`,

    combat: `**星舰与单兵双重战斗系统**：\n\n🛸 **星舰战斗**\n• 指挥你的侦察舰在太空中作战\n• 能量分配：武器 / 护盾 / 引擎 ——三者不可兼得\n• 舰员技能影响战舰性能\n\n🛸 **地面战斗**\n• 使用能量武器与战术装备进行步兵作战\n• 环境重力、大气成分影响武器效果\n• 不同种族有不同的战斗风格与弱点\n\n🛸 **舰艇突击**\n• 两栖战斗：从舰对舰战无缝切换到登舰白刃战\n• 攻占敌方舰船获得情报与科技\n• 捕获外星舰船可以编入你的舰队`,

    exploration: `银河系的广阔超越了任何人的想象：\n\n🌌 **星际航行**\n• 在星图上规划航线，管理燃料与补给\n• 未知星域需要手动探测——你将命名新发现的星球\n• 虫洞跳跃至遥远星域，每次跳跃消耗大量能源\n\n🌌 **星球探索**\n• 每个星球有独特的生态、气候与地质\n• 在星球表面部署探测器\n• 发现矿脉、遗迹或外星生物\n\n🌌 **深空异常**\n• 太空中散布着奇异的现象：时间膨胀区、空间裂隙、能量风暴\n• 探索异常可能获得稀有科技，也可能遭遇毁灭性危险`,

    strategy: `在银河政治舞台上书写你的篇章：\n\n🌐 **银河外交**\n• 与外星文明建立外交关系\n• 签订贸易协定、军事同盟或科技共享协议\n• 在银河议会中投票影响联邦政策\n\n🌐 **舰队管理**\n• 建造、改装、指挥你的舰队\n• 每艘舰船有独特的属性与船员\n• 舰队的组成决定了你能执行的任务类型\n\n🌐 **殖民地发展**\n• 在边境星系建立新殖民地\n• 每个殖民地有其发展方向：矿业、科研、贸易、军事\n• 殖民地是资源收入与招募舰员的主要来源`,

    puzzle: `外星科技与远古谜题：\n\n👽 **先驱者科技解密**\n• 先驱者的科技远超人类理解——需要逆向工程\n• 使用考古学与语言学知识解读外星文本\n• 错误激活可能触发防御系统\n\n👽 **星系级谜题**\n• 某些谜题的线索分散在多个星系\n• 需要跨越光年收集信息碎片\n• 终极谜题的解答可能改变整个银河的命运\n\n👽 **异星生态分析**\n• 研究外星生物的生态位与行为模式\n• 利用生物特性解决环境障碍\n• 收集完整的生物图鉴`,
  },
}

// ── Quest flow templates ──
const QUEST_FLOWS: Record<string, string[]> = {
  openworld: [
    `**序章：异乡人**\n海滩苏醒，失去所有记忆 → 遇到第一位同伴 → 了解元素之力 → 击败第一个秘境守护者 → 获得"元素之主"的第一个线索\n\n**第一章：风与自由**\n前往风之国度 → 卷入一场关于龙灾的危机 → 在风龙巢穴中直面风暴 → 做出第一个重大选择：拯救龙还是消灭龙\n\n**第二章：岩与契约**\n穿越岩之国度 → 卷入商人与盗宝团之间的纷争 → 发现远古魔神即将复苏 → 在千岩军的帮助下封印魔神\n\n**第三章：雷与永恒**\n航行至雷之国 → 了解永恒之国的封闭历史 → 雷电将军的考验 → 选择：帮助将军维持永恒 / 劝说将军拥抱变化\n\n**第四章：草与智慧**\n深入草之国的学术殿堂 → 在图书馆的密室中发现关于"元素之主"的古老预言 → 被卷入学者派系之争\n\n**第五章：终焉之歌**\n七国集结 → 灾厄苏醒 → 在各国盟友的帮助下迎战最终敌人 → 结局取决于你在前四章的选择`,
  ],

  folklore: [
    `**第一章：犬神村**\n前往被犬神困扰的村庄 → 发现犬神曾是村庄的守护者，因村民背叛而化为怨灵 → 选择：驱逐 / 超度 / 重新契约\n\n**第二章：雪女之泪**\n穿越雪山 → 在山间神社遇见雪女 → 雪女请求主角帮助寻找她失踪的人类恋人 → 揭开一段跨越生死的爱情故事 → 选择影响雪女最终的命运\n\n**第三章：百鬼夜行**\n抵达平安京 → 正值一年一度的百鬼夜行之夜 → 在百鬼中遭遇强大的大妖怪「酒吞童子」→ 被卷入阴阳寮内部的权力斗争\n\n**第四章：结界之碑**\n各地结界开始崩溃 → 追踪源头 → 发现千年前封印的妖王正在苏醒 → 收集四神兽的式神令牌以加强封印\n\n**终章：百鬼之主**\n妖王苏醒 → 集结所有契约的式神 → 最终战役 → 结局取决于你与式神之间的羁绊深度`,
  ],

  cyberpunk: [
    `**第一章：Ghost in the Machine**\n调查普罗米修斯项目 → 潜入天命科技的数据中心 → 遭遇企业的精英安保义体 → 在数据深处发现人造人实验的完整档案\n\n**第二章：镜中之影**\n档案指向镜城 → 进入镜城调查 → 发现镜城的居民被情绪调节芯片控制 → 帮助觉醒者组织破坏芯片信号塔，还是将情报卖给企业？\n\n**第三章：记忆之渊**\n主角自己的记忆开始出现异常 → 追踪记忆源头 → 发现自己可能是普罗米修斯项目的实验体之一 → 身份认知的崩塌\n\n**第四章：天眼坠落**\n觉醒者组织准备发起总攻 → 企业联盟调动军队镇压 → 在全面冲突中选择你的立场 → 你的选择将决定整个超级都市圈的未来\n\n**终章：自由或秩序**\n天眼系统的核心服务器 → 最终选择：摧毁天眼以解放所有被控制者 / 控制天眼以按照自己的意志改造社会 / 与天眼融合以超越人类`,
  ],

  wasteland: [
    `**第一章：残响平原**\n移动城市抵达锈蚀平原 → 声骸雷达探测到异常强烈的共鸣信号 → 探索中发现一处未被记录的共鸣塔 → 塔中的声骸揭示灾难前夕的第一块真相碎片\n\n**第二章：灰烬沙漠**\n穿越灰烬沙漠 → 遭遇游荡的巨型残响 → 在沙漠深处发现一座完整的古代城市 → 城市中的声骸包含了关于灾难起因的关键信息\n\n**第三章：沉没都市**\n前往海滨的沉没都市 → 在都市深处遇到另一个共鸣者 → 合作还是对立？→ 海底的共鸣塔中隐藏着一个惊人的秘密\n\n**第四章：深海原点**\n所有线索指向灾难的源头 → 穿越最危险的寂静区 → 在深海原点面对引发灾难的古老存在 → 选择：封印 / 共鸣 / 献祭\n\n**终章：新生**\n废土的命运取决于你的选择 → 不同的结局带来不同的新世界 → 你的声骸将你的故事传递给下一个共鸣者`,
  ],

  scifi: [
    `**第一章：边疆的呼唤**\n抵达银河系边缘的前哨站 → 首次进入先驱者遗迹 → 触碰遗物并获得幻象 → 遗迹中的防御系统被激活\n\n**第二章：帝国的阴影**\n幻象的线索指向泽恩帝国边境 → 潜入帝国领空 → 发现帝国也在研究先驱者科技 → 与帝国特工之间亦敌亦友的关系\n\n**第三章：种族的盟约**\n前往银河议会寻求支持 → 在 27 个种族之间争取同盟 → 发现某些种族对先驱者有着更古老的认知 → 虫群并非纯粹的敌人\n\n**第四章：深渊之门**\n先驱者遗迹揭示了一个通往银河系之外的传送门 → 传送门正在开启 → 来自银河系之外的古老威胁\n\n**终章：星海抉择**\n在传送门处迎战远古威胁 → 选择：关闭传送门以保护银河 / 通过传送门探寻失落的真相 / 与远古存在达成某种协议`,
  ],
}

// ── Player branches ──
const BRANCHES: Record<string, string> = {
  openworld: `开放世界中的选择影响深远，每个决定都在书写不同的故事：\n\n🌿 **元素之路**\n• **火焰之心** — 以火元素为专精，性格热情果断，以战斗解决冲突\n• **流水之智** — 以水元素为专精，性格冷静理性，以智慧化解难题\n• **大地之坚** — 以岩元素为专精，性格坚韧可靠，以守护为核心信念\n• **风暴之魂** — 以风元素为专精，性格自由不羁，以探索为人生目标\n\n🌿 **关键分支点**\n• 在龙灾事件中选择拯救 / 消灭风龙 —— 影响后续剧情走向\n• 是否加入某个国度 —— 获得该国的专属任务线\n• 在终章中选择封印灾厄 / 与灾厄共存 / 牺牲自己\n\n🌿 **羁绊分支**\n六位同伴各自有独立的命运线，你的选择会让他们成为挚友、恋人，或是——最终的对手。`,

  folklore: `志怪世界中的选择不仅关乎命运，更关乎人性与妖性的边界：\n\n🌿 **阴阳之道**\n• **退魔师之路** — 以消灭妖怪为己任，获得人类朝廷的支持\n• **妖怪之友** — 与妖怪为善，在妖界建立声望与盟友\n• **平衡之道** — 在人妖两界之间斡旋，追寻共存的可能性\n\n🌿 **式神羁绊**\n• 每个式神都有独立的剧情线，完成后获得强化形态\n• 式神最终会面临各自的选择——有些希望被解放，有些愿意永远追随\n• 你对式神的选择会影响终章可用的战力\n\n🌿 **结局走向**\n• 成为新任大阴阳师，重建阴阳寮\n• 放弃人类的身份，成为妖界的一员\n• 牺牲自己，永久加固人妖两界的结界`,

  cyberpunk: `赛博世界中，自由意志本身就是一个问号：\n\n🌿 **觉醒之路**\n• **企业之犬** — 与天命科技合作，获得顶尖义体与无限资源\n• **幽灵黑客** — 隐匿于网络，以情报操控各方势力\n• **革命之火** — 与觉醒者并肩作战，推翻企业统治\n\n🌿 **记忆抉择**\n• 接受自己是人造人的事实，继续现在的身份\n• 寻找自己"原型"的真实身份与过往\n• 选择抹除关于真相的记忆，回到无知的生活\n\n🌿 **结局**\n• 摧毁天眼，解放全城——但混沌也随之而来\n• 控制天眼，成为新的统治者——屠龙者终成恶龙\n• 与天眼融合，超越人类——但这还是"你"吗？`,

  wasteland: `废土上没有绝对的正确，只有生存与代价：\n\n🌿 **共鸣者的选择**\n• **流浪者** — 独行废土，只服从自己的判断\n• **城市的守护者** — 保护移动城市，成为幸存者的希望\n• **真相追寻者** — 不惜一切代价前往深海原点\n\n🌿 **声骸的使用**\n• **共鸣** — 与声骸中的记忆共鸣，获得完整的真相\n• **吸收** — 将声骸能量化为己用，但可能承受其执念\n• **解放** — 释放声骸中的灵魂，但失去其力量\n\n🌿 **终局**\n• 封印深海原点，废土进入缓慢的恢复期\n• 完全共鸣，灾难被逆转——但你将承受所有声骸的记忆\n• 诞生新的存在——人类与残响的融合体`,

  scifi: `银河尺度之下，你的每一个决策都在重塑星际文明：\n\n🌿 **探索者之路**\n• **联邦忠诚者** — 以联邦的利益为最高准则\n• **银河公民** — 超越种族界限，为整个银河的福祉而行动\n• **独立势力** — 不被任何阵营束缚，建立属于你自己的势力\n\n🌿 **先驱者遗产**\n• **保守派** — 先驱者科技太危险，应当永久封印\n• **进取派** — 利用先驱者科技加速文明发展\n• **启蒙派** — 先驱者的警告需要被全银河知晓\n\n🌿 **终局**\n• 成为联邦的最高指挥官\n• 成为第一个与虫群建立联系的人类\n• 进入传送门，成为银河系与外部宇宙的桥梁`,
}

// ── Reward system templates ──
const REWARDS: Record<string, string[]> = {
  growth: [
    `**角色成长体系**驱动玩家的核心循环：\n\n📈 **多维养成**\n• 等级突破：每 20 级需要完成突破任务，解锁新技能层级\n• 装备进化：白 → 绿 → 蓝 → 紫 → 金 → 红（传说级，每服限量）\n• 天赋树：三大分支 × 各 15 节点，自由搭配build\n• 灵器/义体/声骸：根据游戏类型不同的专属养成线\n\n📈 **成长反馈**\n• 伤害数字风格可自定义\n• 战力里程碑达成时触发全屏特效\n• 养成到极致解锁角色专属外观\n\n📈 **终局挑战**\n• 周常世界Boss，全服协作挑战\n• 单人爬塔（层数无限，排行榜竞速）\n• 限时高难副本掉落专属传说级装备`,
  ],
  story: [
    `**叙事收集系统**让故事成为最珍贵的宝藏：\n\n📖 **故事图鉴**\n• 120+ 可解锁的故事片段，分为主线/角色/世界/隐藏四类\n• 完成特定条件解锁——不仅是推进主线，还包括探索特定地点、击败特定敌人\n\n📖 **回忆画廊**\n• 50+ 张全彩CG，在关键剧情节点获得\n• 支持回顾已解锁的剧情场景与对话\n• 二周目可跳过已看剧情，但保留所有收集\n\n📖 **多结局追踪**\n• 结局面板显示所有可能的结局路径与解锁条件\n• 解锁所有结局后揭示隐藏的"真·结局"\n• 每个结局解锁对应的独有CG与称号`,
  ],
  collect: [
    `**全收集系统**提供持续的目标驱动：\n\n💎 **图鉴系统**\n• 角色图鉴：全可操控角色及皮肤\n• 敌人图鉴：所有敌人及稀有变体\n• 物品图鉴：所有武器、装备、道具\n• 生物图鉴：世界中的所有生物与妖怪\n\n💎 **收集奖励**\n• 每达到图鉴的 25%/50%/75%/100% 获得阶梯奖励\n• 全图鉴完成获得绝版外观与称号\n• 限时联动活动提供绝版收集品\n\n💎 **展示与社交**\n• 个性展厅：自定义陈列你最骄傲的收集\n• 稀有度排行榜\n• 图鉴收藏家年度评选`,
  ],
  compete: [
    `**竞技生态**构建完整的 PvP 体验：\n\n🏅 **天梯排位**\n• 7 段位：青铜→白银→黄金→铂金→钻石→大师→传说\n• 每 3 个月一个赛季，赛季奖励绝版外观\n• 传说段位前 100 名进入「名人堂」永久展示\n\n🏅 **多种竞技模式**\n• 1v1 公平竞技（属性标准化）\n• 3v3 团队竞技（需要配合与策略）\n• 大乱斗（5+人混战，娱乐模式）\n\n🏅 **赛事体系**\n• 月度锦标赛：64 人淘汰制\n• 年度总决赛：全服冠军对决\n• 赛事观战系统：可观看高段位比赛直播`,
  ],
  create: [
    `**创造系统**让玩家成为世界的一部分：\n\n🔨 **领地建造**\n• 自由建造模式：无网格限制的立体建造系统\n• 500+ 种建筑与装饰组件\n• 参观/点赞/评论他人领地的社交功能\n\n🔨 **关卡编辑器**\n• 可视化关卡设计工具，门槛低上限高\n• 支持自定义脚本与事件触发器\n• 发布作品供全球玩家挑战\n\n🔨 **创作者生态**\n• 热门关卡获得官方首页推荐与游戏内货币奖励\n• 创作者商店：出售自制外观、蓝图、音乐\n• 年度创作者评选与线下聚会`,
  ],
}

function generatePlan(s: Selections, custom?: Record<string, string>): GamePlan {
  const g = s.gameType
  const f = s.gameplayFocus
  const a = s.artStyle
  const p = s.playerGoal

  const worldArr = WORLDS[g] ?? WORLDS.openworld
  const worldDesc = worldArr[Math.floor(Math.random() * worldArr.length)]
  const artFlavor = ART_FLAVOR[a] ?? ''

  const protagArr = PROTAGS[g] ?? PROTAGS.openworld
  const protag = protagArr[Math.floor(Math.random() * protagArr.length)]

  const coreForType = CORE_GAMEPLAY[g] ?? CORE_GAMEPLAY.openworld
  const coreSource = coreForType[f] ?? coreForType.narrative

  const questArr = QUEST_FLOWS[g] ?? QUEST_FLOWS.openworld
  const questFlow = questArr[Math.floor(Math.random() * questArr.length)]

  const branch = BRANCHES[g] ?? BRANCHES.openworld

  const rewardArr = REWARDS[p] ?? REWARDS.growth
  const reward = rewardArr[Math.floor(Math.random() * rewardArr.length)]
  const rewardArt = a === 'eastern' ? `\n\n🎨 东方幻想风格下，传说级物品以符咒与灵器的形式呈现——暗金色泽，妖纹流转，如同千年的古物重见天日。`
    : a === 'wasteland_tech' ? `\n\n🎨 末世机能风格下，稀有奖励呈现为高精尖的古代科技遗物——流动的蓝色声波能量在装备表面流转，每一次升级都会激活更多的光纹。`
    : a === 'fantasy' ? `\n\n🎨 奇幻冒险风格下，传说级武器拥有华丽的光效与专属的装备动画，每一件都仿佛从史诗中走出。`
    : a === 'ink' ? `\n\n🎨 水墨国风下，极品装备如同画卷中的珍宝——墨色氤氲中浮现金色铭文，朱砂点缀处是装备的核心所在。`
    : `\n\n🎨 像素风格让每一件稀有物品都如同从经典 RPG 中走出——精致的像素图标配上 CRT 扫描线拾取动画，怀旧与精致完美融合。`

  // Build custom descriptions addendum
  const customGameType = custom?.gameType?.trim()
  const customGameplay = custom?.gameplayFocus?.trim()
  const customArt = custom?.artStyle?.trim()
  const customGoal = custom?.playerGoal?.trim()

  const worldCustom = customGameType || customArt
    ? `\n\n✏️ **你的自定义设定**：${[customGameType, customArt].filter(Boolean).join('；')}`
    : ''

  const gameplayCustom = customGameplay
    ? `\n\n✏️ **你的自定义玩法**：${customGameplay}`
    : ''

  const rewardCustom = customGoal
    ? `\n\n✏️ **你的自定义目标**：${customGoal}`
    : ''

  return {
    worldbuilding: `## 🌍 世界观\n\n${worldDesc}${artFlavor}${worldCustom}`,
    protagonist: `## 👤 主角设定\n\n${protag}`,
    coreGameplay: `## 🎮 核心玩法\n\n${coreSource}${gameplayCustom}`,
    questFlow: `## 📜 任务流程\n\n${questFlow}`,
    playerBranches: `## 🌿 玩家分支\n\n${branch}`,
    rewardSystem: `## 🏆 奖励系统\n\n${reward}${rewardArt}${rewardCustom}`,
  }
}

// ── Utility functions ──────────────────────────────────

function formatTime(ts: number): string {
  const d = new Date(ts)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getSnippet(text: string, maxLen = 120): string {
  const plain = text
    .replace(/^## .+$/gm, '')
    .replace(/🎨 .+$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/\n+/g, ' ')
    .trim()
  if (plain.length <= maxLen) return plain
  return plain.slice(0, maxLen).trimEnd() + '…'
}

function generateFavoriteId(): string {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
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

// ── Toast ──────────────────────────────────────────────
function Toast({ message }: { message: string }) {
  return <div className="toast" key={message}>{message}</div>
}

// ── Navbar ─────────────────────────────────────────────
function Navbar({
  user,
  currentPage,
  onNavigate,
  onLoginClick,
  onLogout,
}: {
  user: User | null
  currentPage: Page
  onNavigate: (page: Page) => void
  onLoginClick: () => void
  onLogout: () => void
}) {
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <button className="nav-brand" onClick={() => onNavigate('home')}>
          <span className="nav-brand-icon">✦</span>
          <span className="nav-brand-text">AI 叙事游戏策划助手</span>
        </button>
        <div className="nav-right">
          <button
            className={`nav-link ${currentPage === 'favorites' ? 'active' : ''}`}
            onClick={() => onNavigate('favorites')}
          >
            <span className="nav-link-icon">⭐</span>
            <span className="nav-link-text">我的收藏</span>
          </button>
          {user ? (
            <div className="nav-user-area">
              <span className="nav-user-name" title={user.email}>{user.nickname}</span>
              <button className="nav-logout" onClick={onLogout}>退出</button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={onLoginClick}>
              登录
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

// ── Login Modal ────────────────────────────────────────
function LoginModal({
  onLogin,
  onClose,
}: {
  onLogin: (nickname: string, email: string) => void
  onClose: () => void
}) {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedNick = nickname.trim()
    const trimmedEmail = email.trim()

    if (!trimmedNick) {
      setError('请输入昵称')
      return
    }
    if (trimmedNick.length > 20) {
      setError('昵称不能超过 20 个字符')
      return
    }
    if (!trimmedEmail) {
      setError('请输入邮箱')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('请输入有效的邮箱地址')
      return
    }

    setError('')
    onLogin(trimmedNick, trimmedEmail)
  }

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="login-close" onClick={onClose} aria-label="关闭">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5l10 10M15 5l-10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <div className="login-header">
          <span className="login-icon">👤</span>
          <h2>登录</h2>
          <p>输入昵称和邮箱即可登录，无需注册</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-nickname">昵称</label>
            <input
              id="login-nickname"
              className="login-input"
              type="text"
              placeholder="你的昵称"
              value={nickname}
              onChange={(e) => { setNickname(e.target.value); setError('') }}
              autoFocus
              maxLength={20}
            />
          </div>
          <div className="login-field">
            <label htmlFor="login-email">邮箱</label>
            <input
              id="login-email"
              className="login-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
            />
          </div>
          {error && <p className="login-error">{error}</p>}
          <div className="login-actions">
            <button type="submit" className="btn-primary login-submit">
              登录
            </button>
            <button type="button" className="login-cancel" onClick={onClose}>
              取消
            </button>
          </div>
        </form>
        <p className="login-hint">登录信息仅保存在本地浏览器中</p>
      </div>
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
  customInputs,
  setCustomInputs,
  onGenerate,
  onBack,
}: {
  selections: Selections
  setSelections: (s: Selections) => void
  customInputs: Record<string, string>
  setCustomInputs: (c: Record<string, string>) => void
  onGenerate: () => void
  onBack: () => void
}) {
  const allSelected = Object.values(selections).every(Boolean)

  const placeholderMap: Record<string, string> = {
    gameType: '例如：我希望这个世界有漂浮的魔法学院，龙族与人类共存…',
    gameplayFocus: '例如：加入潜行暗杀玩法，或者增加宠物养成系统…',
    artStyle: '例如：希望角色设计偏写实风格，色彩以莫兰迪色系为主…',
    playerGoal: '例如：加入家园建设系统，玩家可以建造和经营自己的领地…',
  }

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
            <div className="custom-input-wrapper">
              <textarea
                className="custom-input"
                placeholder={placeholderMap[key] ?? '补充你的自定义描述…'}
                value={customInputs[key] ?? ''}
                onChange={(e) =>
                  setCustomInputs({ ...customInputs, [key]: e.target.value })
                }
                rows={2}
                maxLength={300}
              />
              <span className="custom-input-hint">
                💡 可选：补充自定义描述（{(customInputs[key] ?? '').length}/300）
              </span>
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
          <div className="spinner-ring" />
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
  isFavorited,
  onToggleFavorite,
  sourcePage,
  onDeleteFavorite,
}: {
  plan: GamePlan
  selections: Selections
  onRegenerate: () => void
  onBack: () => void
  isFavorited: boolean
  onToggleFavorite: () => void
  sourcePage: 'select' | 'favorites'
  onDeleteFavorite?: () => void
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
          {sourcePage === 'favorites' ? '返回收藏' : '重新选择'}
        </button>

        <div className="result-actions-right">
          {sourcePage === 'select' ? (
            <>
              <button
                className={`btn-favorite ${isFavorited ? 'favorited' : ''}`}
                onClick={onToggleFavorite}
              >
                {isFavorited ? '⭐ 已收藏' : '☆ 收藏方案'}
              </button>
              <button className="btn-primary btn-regenerate" onClick={onRegenerate}>
                🔄 重新生成
              </button>
            </>
          ) : (
            <button className="btn-fav-delete-large" onClick={onDeleteFavorite}>
              🗑️ 取消收藏
            </button>
          )}
        </div>
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
                return <h2 key={i}>{line.replace('## ', '')}</h2>
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

// ── Favorites Page ──
function FavoritesPage({
  favorites,
  user,
  onViewDetail,
  onDelete,
  onBack,
  onLoginClick,
}: {
  favorites: Favorite[]
  user: User | null
  onViewDetail: (fav: Favorite) => void
  onDelete: (id: string) => void
  onBack: () => void
  onLoginClick: () => void
}) {
  // Not logged in
  if (!user) {
    return (
      <div className="page favorites-page">
        <div className="favorites-empty">
          <span className="favorites-empty-icon">🔒</span>
          <h2 className="favorites-empty-title">请先登录后查看收藏</h2>
          <p className="favorites-empty-desc">登录后即可收藏和查看你的策划方案</p>
          <button className="btn-primary" onClick={onLoginClick}>
            登录
          </button>
        </div>
      </div>
    )
  }

  // Logged in but empty
  if (favorites.length === 0) {
    return (
      <div className="page favorites-page">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </button>
        <div className="favorites-empty">
          <span className="favorites-empty-icon">⭐</span>
          <h2 className="favorites-empty-title">还没有收藏过方案</h2>
          <p className="favorites-empty-desc">生成策划方案后，点击收藏按钮即可保存到这里</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page favorites-page">
      <div className="favorites-header-row">
        <button className="btn-back" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </button>
        <div className="favorites-title-area">
          <h2 className="favorites-title">⭐ 我的收藏</h2>
          <p className="favorites-count">共 {favorites.length} 个方案</p>
        </div>
      </div>

      <div className="favorites-grid">
        {favorites.map((fav) => (
          <article key={fav.id} className="favorite-card">
            <h3 className="fav-card-title">{fav.title}</h3>
            <div className="fav-card-tags">
              <span className="fav-tag">🎮 {TYPE_NAMES[fav.selections.gameType] ?? fav.selections.gameType}</span>
              <span className="fav-tag">⚔️ {FOCUS_NAMES[fav.selections.gameplayFocus] ?? fav.selections.gameplayFocus}</span>
              <span className="fav-tag">🎨 {ART_NAMES[fav.selections.artStyle] ?? fav.selections.artStyle}</span>
            </div>
            <p className="fav-card-snippet">{getSnippet(fav.plan.worldbuilding)}</p>
            <div className="fav-card-footer">
              <span className="fav-card-time">🕐 {formatTime(fav.timestamp)}</span>
              <div className="fav-card-actions">
                <button className="btn-fav-view" onClick={() => onViewDetail(fav)}>
                  查看详情
                </button>
                <button className="btn-fav-delete" onClick={() => onDelete(fav.id)}>
                  删除
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

// ── Footer ──
function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-divider" />
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">AI 叙事游戏策划助手</span>
          <span className="footer-badge">作品集项目</span>
        </div>
        <p className="footer-desc">
          面向游戏策划流程的 AI 辅助创意工具 —— 通过选择游戏类型、玩法重点、美术风格与玩家目标，
          模拟 AI 在游戏前期创意设计中的应用，自动生成包含世界观、主角设定、核心玩法、任务流程、
          玩家分支与奖励系统的完整策划方案。
        </p>
        <div className="footer-meta">
          <span>Built with React + TypeScript + Vite</span>
          <span className="footer-dot">·</span>
          <span>AI Product Design Portfolio</span>
        </div>
        <p className="footer-copy">© 2026 · Designed & Developed for Portfolio</p>
      </div>
    </footer>
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

  // Auth & favorites state
  const [user, setUser] = useState<User | null>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [viewingFavorite, setViewingFavorite] = useState<Favorite | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [backPage, setBackPage] = useState<'select' | 'favorites'>('select')

  // Custom text inputs for each dimension
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({
    gameType: '',
    gameplayFocus: '',
    artStyle: '',
    playerGoal: '',
  })

  // ── Load user from localStorage on mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_planner_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.nickname && parsed.email) {
          setUser(parsed)
        }
      }
    } catch { /* ignore corrupt data */ }
  }, [])

  // ── Load favorites when user changes ──
  useEffect(() => {
    if (user) {
      try {
        const saved = localStorage.getItem(`ai_planner_favs_${user.email}`)
        if (saved) {
          setFavorites(JSON.parse(saved))
        } else {
          setFavorites([])
        }
      } catch {
        setFavorites([])
      }
    } else {
      setFavorites([])
    }
  }, [user])

  // ── Auto-dismiss toast ──
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500)
      return () => clearTimeout(timer)
    }
  }, [toast])

  // ── Handlers ──
  const handleGenerate = useCallback(() => {
    setPage('generating')
  }, [])

  const handleComplete = useCallback(() => {
    const newPlan = generatePlan(selections, customInputs)
    setPlan(newPlan)
    setViewingFavorite(null)
    setBackPage('select')
    setPage('result')
  }, [selections, customInputs])

  const handleRegenerate = useCallback(() => {
    setPage('generating')
  }, [])

  const handleResetSelections = useCallback(() => {
    setSelections({ gameType: '', gameplayFocus: '', artStyle: '', playerGoal: '' })
    setCustomInputs({ gameType: '', gameplayFocus: '', artStyle: '', playerGoal: '' })
    setViewingFavorite(null)
    setBackPage('select')
    setPage('select')
  }, [])

  const handleLogin = useCallback((nickname: string, email: string) => {
    const u: User = { nickname, email }
    localStorage.setItem('ai_planner_user', JSON.stringify(u))
    setUser(u)
    setShowLogin(false)
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ai_planner_user')
    setUser(null)
    setFavorites([])
    setPage('home')
  }, [])

  const handleToggleFavorite = useCallback(() => {
    if (!user) {
      setToast('请先登录后再收藏方案')
      return
    }
    if (!plan) return

    const isFav = favorites.some(f => f.plan.worldbuilding === plan.worldbuilding)

    if (isFav) {
      const newFavs = favorites.filter(f => f.plan.worldbuilding !== plan.worldbuilding)
      setFavorites(newFavs)
      localStorage.setItem(`ai_planner_favs_${user.email}`, JSON.stringify(newFavs))
      setToast('已取消收藏')
    } else {
      const fav: Favorite = {
        id: generateFavoriteId(),
        title: `${TYPE_NAMES[selections.gameType] ?? selections.gameType} · ${FOCUS_NAMES[selections.gameplayFocus] ?? selections.gameplayFocus} · ${ART_NAMES[selections.artStyle] ?? selections.artStyle} 策划方案`,
        plan: plan,
        selections: { ...selections },
        timestamp: Date.now(),
      }
      const newFavs = [fav, ...favorites]
      setFavorites(newFavs)
      localStorage.setItem(`ai_planner_favs_${user.email}`, JSON.stringify(newFavs))
      setToast('已收藏方案 ⭐')
    }
  }, [user, plan, favorites, selections])

  const handleViewFavorite = useCallback((fav: Favorite) => {
    setViewingFavorite(fav)
    setPlan(fav.plan)
    setSelections(fav.selections)
    setBackPage('favorites')
    setPage('result')
  }, [])

  const handleDeleteFavorite = useCallback((id: string) => {
    const newFavs = favorites.filter(f => f.id !== id)
    setFavorites(newFavs)
    if (user) {
      localStorage.setItem(`ai_planner_favs_${user.email}`, JSON.stringify(newFavs))
    }
    // If we're viewing this favorite, go back to favorites page
    if (viewingFavorite && viewingFavorite.id === id) {
      setViewingFavorite(null)
      setPage('favorites')
    }
    setToast('已删除收藏')
  }, [favorites, user, viewingFavorite])

  const handleGoToFavorites = useCallback(() => {
    setPage('favorites')
  }, [])

  const handleResultBack = useCallback(() => {
    if (backPage === 'favorites') {
      setPage('favorites')
      setViewingFavorite(null)
    } else {
      handleResetSelections()
    }
  }, [backPage, handleResetSelections])

  const handleNavigate = useCallback((target: Page) => {
    if (target === 'favorites') {
      setPage('favorites')
    } else {
      setPage(target)
    }
    setViewingFavorite(null)
  }, [])

  // ── Derived state ──
  const isCurrentPlanFavorited = user
    ? favorites.some(f => plan && f.plan.worldbuilding === plan.worldbuilding)
    : false

  return (
    <div className="app">
      <div className="bg-layer">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <Navbar
        user={user}
        currentPage={page}
        onNavigate={handleNavigate}
        onLoginClick={() => setShowLogin(true)}
        onLogout={handleLogout}
      />

      {page === 'home' && <HomePage onStart={() => setPage('select')} />}
      {page === 'select' && (
        <SelectPage
          selections={selections}
          setSelections={setSelections}
          customInputs={customInputs}
          setCustomInputs={setCustomInputs}
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
          onBack={handleResultBack}
          isFavorited={isCurrentPlanFavorited}
          onToggleFavorite={handleToggleFavorite}
          sourcePage={backPage}
          onDeleteFavorite={viewingFavorite ? () => handleDeleteFavorite(viewingFavorite.id) : undefined}
        />
      )}
      {page === 'favorites' && (
        <FavoritesPage
          favorites={favorites}
          user={user}
          onViewDetail={handleViewFavorite}
          onDelete={handleDeleteFavorite}
          onBack={() => setPage('home')}
          onLoginClick={() => setShowLogin(true)}
        />
      )}

      {showLogin && (
        <LoginModal
          onLogin={handleLogin}
          onClose={() => setShowLogin(false)}
        />
      )}

      {toast && <Toast message={toast} />}

      <Footer />
    </div>
  )
}
