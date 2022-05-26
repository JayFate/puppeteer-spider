let mm = `
IEG | 上海 | 技术 | 2022年05月12日

工作职责
- 参与针对gameplay需求的框架及功能设计；
- 实现gameplay相关系统以及编辑器工具等；
- 跟策划以及其他职能同事沟通协作，保障gameplay相关系统的研发以及交付；
- 参与gameplay相关系统的性能优化；
工作要求
- 扎实的编程基础，过硬的C++编程能力；
- 具有UE4或者Unity引擎使用经验（UE4优先）；
- 参与过一个或多个Gameplay相关系统的开发；
- 参与过gameplay相关的编辑器功能的开发；
- 参与过gameplay相关系统的性能优化者优先；
- 良好的团队协作能力，善于沟通；
~~~~~~~~~~~~~~~~~~~~15605-UE4射击游戏客户端开发工程师
 分享
分享
`;

let nn = mm.replace(/^- /gm, (substr, a, b, ...args) => {
  console.log(a);
  console.log(b);
  console.log(args);
  console.log(substr);
});
