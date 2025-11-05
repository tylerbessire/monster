(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const t of n)if(t.type==="childList")for(const o of t.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function a(n){const t={};return n.integrity&&(t.integrity=n.integrity),n.referrerPolicy&&(t.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?t.credentials="include":n.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(n){if(n.ep)return;n.ep=!0;const t=a(n);fetch(n.href,t)}})();const p={aiProvider:"llamacpp",llamacpp:{serverUrl:"http://localhost:8080",endpoint:"/completion",temperature:.9,maxTokens:150,topP:.9,topK:40,repeatPenalty:1.1,stop:[`

`,"User:","Human:",`
You:`]},maxContextMessages:10,memoryMaxSize:50,personalityTraits:["curious","playful","wise","energetic","calm","adventurous","caring","silly","serious","creative"]};class M{initializePersonality(e){return{dominantTraits:["curious","playful"],traitScores:{curious:10,playful:10,wise:0,energetic:8,calm:5,adventurous:5,caring:7,silly:8,serious:0,creative:5},mood:"happy",moodHistory:[],interactionCount:0}}updatePersonality(e,a,s){const n=e.personality||this.initializePersonality(e),t={...n.traitScores};switch(a){case"feed":t.caring+=1,t.calm+=1;break;case"play":t.playful+=2,t.energetic+=2,t.silly+=1;break;case"quest":t.adventurous+=2,t.curious+=2,t.wise+=1;break;case"chat":t.curious+=1,s==="positive"?(t.playful+=1,t.caring+=1):s==="negative"&&(t.caring+=2,t.calm+=1);break;case"learn":t.wise+=2,t.curious+=1,t.serious+=1;break;case"create":t.creative+=2,t.playful+=1;break}const o=e.evolutionStage||"baby";o==="teen"?(t.curious+=1,t.adventurous+=1):o==="adult"&&(t.wise+=1,t.calm+=1);const r=Object.entries(t).sort((d,u)=>u[1]-d[1]).slice(0,3).map(([d])=>d),l=this.calculateMood(e);return n.traitScores=t,n.dominantTraits=r,n.mood=l,n.interactionCount+=1,n.moodHistory.push({mood:l,timestamp:Date.now()}),n.moodHistory.length>20&&(n.moodHistory=n.moodHistory.slice(-20)),n}calculateMood(e){const a=e.happiness||50,s=e.energy||50,n=e.knowledge||50;return a>80&&s>70?"joyful":a>60&&s>50?"happy":a>40&&s>40?"content":a<30?"sad":s<20?"tired":n>80&&a>50?"enlightened":s>80&&a>60?"excited":"neutral"}getPersonalityDescription(e){const a=e.personality;if(!a)return"still developing their personality";const s=a.dominantTraits.join(", "),n=a.mood;return`${s} and feeling ${n}`}getMoodEmoji(e){return{joyful:"😄",happy:"😊",content:"🙂",neutral:"😐",sad:"😢",tired:"😴",enlightened:"🧠✨",excited:"🤩"}[e]||"🙂"}}const g=new M;class A{constructor(){this.stages={baby:{name:"Baby",minLevel:1,maxLevel:15,description:"A cute baby companion, full of wonder",sprite:"baby",statsMultiplier:1,unlocks:["basic chat","feed","play"]},teen:{name:"Teen",minLevel:16,maxLevel:35,description:"An energetic teen, eager to learn",sprite:"teen",statsMultiplier:1.3,unlocks:["quests","mini-games","deeper conversations"]},adult:{name:"Adult",minLevel:36,maxLevel:99,description:"A wise adult companion, your true friend",sprite:"adult",statsMultiplier:1.6,unlocks:["advanced quests","teaching","all features"]}}}getStageByLevel(e){return e>=36?"adult":e>=16?"teen":"baby"}getStageInfo(e){return this.stages[e]||this.stages.baby}checkEvolution(e){const a=e.evolutionStage||"baby",s=this.getStageByLevel(e.level);return a!==s?{shouldEvolve:!0,fromStage:a,toStage:s,message:this.getEvolutionMessage(e.name,a,s)}:{shouldEvolve:!1}}getEvolutionMessage(e,a,s){return{"baby-teen":`✨🌟 ${e} is evolving! 🌟✨

Your baby companion has grown into a curious teen! They're ready for new adventures and deeper conversations!`,"teen-adult":`✨🌟 ${e} is evolving! 🌟✨

Your teen companion has matured into a wise adult! Your bond has grown stronger, and they're ready to be your lifelong friend!`}[`${a}-${s}`]||`${e} is evolving!`}evolveCompanion(e,a){return this.getStageInfo(a),{...e,evolutionStage:a,happiness:Math.min(100,e.happiness+20),energy:Math.min(100,e.energy+20),knowledge:Math.min(100,e.knowledge+10),evolutionHistory:[...e.evolutionHistory||[],{stage:a,level:e.level,timestamp:Date.now()}]}}}class T{getXPForLevel(e){return Math.floor(100*Math.pow(1.5,e-1))}getTotalXPForLevel(e){let a=0;for(let s=1;s<e;s++)a+=this.getXPForLevel(s);return a}addExperience(e,a,s=""){const n=e.experience||0,t=e.level||1,o=n+a;let r=t,l=o,d=!1,u=0;for(;l>=this.getXPForLevel(r);)l-=this.getXPForLevel(r),r++,d=!0,u++;return{leveledUp:d,levelsGained:u,newLevel:r,newXP:l,xpGained:a,reason:s}}getActivityXP(e){return{chat:5,feed:3,play:8,quest:25,learn:15,achievement:50,minigame_win:20,minigame_play:10}[e]||5}getLevelUpBonus(e,a){const s=e.evolutionStage||"baby",n={happiness:5*a,energy:10*a,knowledge:3*a},o={baby:1,teen:1.2,adult:1.5}[s]||1;return{happiness:Math.floor(n.happiness*o),energy:Math.floor(n.energy*o),knowledge:Math.floor(n.knowledge*o)}}}const k=new A,h=new T;class q{constructor(){this.achievements={first_chat:{id:"first_chat",name:"First Words",description:"Have your first conversation",category:"friendship",icon:"💬",xpReward:10,unlocked:!1},chat_10:{id:"chat_10",name:"Chatty Friend",description:"Send 10 messages",category:"friendship",icon:"💭",xpReward:25,unlocked:!1},chat_100:{id:"chat_100",name:"Best Friends Forever",description:"Send 100 messages",category:"friendship",icon:"💕",xpReward:100,unlocked:!1},first_feed:{id:"first_feed",name:"First Meal",description:"Feed your companion for the first time",category:"care",icon:"🍎",xpReward:10,unlocked:!1},feed_50:{id:"feed_50",name:"Master Chef",description:"Feed your companion 50 times",category:"care",icon:"👨‍🍳",xpReward:75,unlocked:!1},max_happiness:{id:"max_happiness",name:"Pure Joy",description:"Reach 100 happiness",category:"care",icon:"😄",xpReward:50,unlocked:!1},first_quest:{id:"first_quest",name:"First Adventure",description:"Complete your first quest",category:"adventure",icon:"🗺️",xpReward:15,unlocked:!1},quest_10:{id:"quest_10",name:"Explorer",description:"Complete 10 quests",category:"adventure",icon:"🧭",xpReward:50,unlocked:!1},quest_50:{id:"quest_50",name:"Master Adventurer",description:"Complete 50 quests",category:"adventure",icon:"🏆",xpReward:150,unlocked:!1},max_knowledge:{id:"max_knowledge",name:"Wisdom Achieved",description:"Reach 100 knowledge",category:"adventure",icon:"🧠",xpReward:100,unlocked:!1},evolve_teen:{id:"evolve_teen",name:"Growing Up",description:"Evolve to teen stage",category:"evolution",icon:"🌱",xpReward:100,unlocked:!1},evolve_adult:{id:"evolve_adult",name:"Fully Grown",description:"Evolve to adult stage",category:"evolution",icon:"🌳",xpReward:200,unlocked:!1},level_10:{id:"level_10",name:"Rising Star",description:"Reach level 10",category:"evolution",icon:"⭐",xpReward:150,unlocked:!1},minigame_first:{id:"minigame_first",name:"Game Time",description:"Play your first mini-game",category:"games",icon:"🎮",xpReward:15,unlocked:!1},minigame_win_10:{id:"minigame_win_10",name:"Champion",description:"Win 10 mini-games",category:"games",icon:"🏅",xpReward:75,unlocked:!1},night_owl:{id:"night_owl",name:"Night Owl",description:"Play between midnight and 4 AM",category:"special",icon:"🦉",xpReward:25,unlocked:!1},early_bird:{id:"early_bird",name:"Early Bird",description:"Play between 5 AM and 7 AM",category:"special",icon:"🐦",xpReward:25,unlocked:!1},week_streak:{id:"week_streak",name:"Dedicated Friend",description:"Play for 7 days in a row",category:"special",icon:"🔥",xpReward:200,unlocked:!1}}}initializeAchievements(){return{unlocked:[],progress:{chats:0,feeds:0,plays:0,quests:0,minigamesPlayed:0,minigamesWon:0,daysPlayed:1,lastPlayDate:new Date().toDateString()},lastChecked:Date.now()}}checkAchievements(e,a,s=1){const n=e.achievements||this.initializeAchievements(),t=n.progress,o=[];switch(a){case"chat":t.chats+=s;break;case"feed":t.feeds+=s;break;case"play":t.plays+=s;break;case"quest":t.quests+=s;break;case"minigame_play":t.minigamesPlayed+=s;break;case"minigame_win":t.minigamesWon+=s;break}const r=new Date().toDateString();if(t.lastPlayDate!==r){const u=new Date(Date.now()-864e5).toDateString();t.lastPlayDate===u?t.daysPlayed+=1:t.daysPlayed=1,t.lastPlayDate=r}const l=new Date().getHours();l>=0&&l<4&&(n.unlocked.includes("night_owl")||o.push("night_owl")),l>=5&&l<7&&(n.unlocked.includes("early_bird")||o.push("early_bird"));const d=[["first_chat",t.chats>=1],["chat_10",t.chats>=10],["chat_100",t.chats>=100],["first_feed",t.feeds>=1],["feed_50",t.feeds>=50],["first_quest",t.quests>=1],["quest_10",t.quests>=10],["quest_50",t.quests>=50],["minigame_first",t.minigamesPlayed>=1],["minigame_win_10",t.minigamesWon>=10],["max_happiness",e.happiness>=100],["max_knowledge",e.knowledge>=100],["evolve_teen",e.evolutionStage==="teen"],["evolve_adult",e.evolutionStage==="adult"],["level_10",e.level>=10],["week_streak",t.daysPlayed>=7]];for(const[u,m]of d)m&&!n.unlocked.includes(u)&&o.push(u);return n.unlocked.push(...o),{achievements:n,newlyUnlocked:o.map(u=>this.achievements[u])}}getAchievement(e){return this.achievements[e]}getAchievementsByCategory(){const e={};for(const[a,s]of Object.entries(this.achievements)){const n=s.category;e[n]||(e[n]=[]),e[n].push(s)}return e}getCompletionPercentage(e){const a=e.achievements||this.initializeAchievements(),s=Object.keys(this.achievements).length,n=a.unlocked.length;return Math.floor(n/s*100)}}const S=new q;function E(){let i={stage:"egg",eggShaking:!1,selectedGender:null,companion:null,messages:[],currentTime:Date.now(),theme:"classic",currentMinigame:null,showAchievements:!1,showMinigames:!1,notifications:[]};const e=new Set,a={getState:()=>i,setState:s=>{i={...i,...s},e.forEach(n=>n(i))},subscribe:s=>(e.add(s),()=>e.delete(s)),addXP:(s,n="")=>{const t=i.companion;if(!t)return;const o=h.addExperience(t,s,n);if(o.leveledUp){const r=h.getLevelUpBonus(t,o.levelsGained),l={...t,level:o.newLevel,experience:o.newXP,happiness:Math.min(100,t.happiness+r.happiness),energy:Math.min(100,t.energy+r.energy),knowledge:Math.min(100,t.knowledge+r.knowledge)},d=k.checkEvolution(l);if(d.shouldEvolve){const u=k.evolveCompanion(l,d.toStage);a.addNotification({type:"evolution",message:d.message});const{achievements:m,newlyUnlocked:v}=S.checkAchievements(u,"evolve",1);u.achievements=m,v.length>0&&a.showNewAchievements(v),i.companion=u}else i.companion=l;a.addNotification({type:"levelup",message:`🎉 Level Up! ${t.name} is now level ${o.newLevel}!`})}else i.companion={...t,experience:o.newXP};a.setState({companion:i.companion})},updatePersonality:(s,n="neutral")=>{const t=i.companion;if(!t)return;const o=g.updatePersonality(t,s,n);a.setState({companion:{...t,personality:o,mood:o.mood}})},checkAchievements:(s,n=1)=>{const t=i.companion;if(!t)return;const{achievements:o,newlyUnlocked:r}=S.checkAchievements(t,s,n);if(a.setState({companion:{...t,achievements:o}}),r.length>0){a.showNewAchievements(r);const l=r.reduce((d,u)=>d+u.xpReward,0);l>0&&a.addXP(l,"Achievement rewards")}},showNewAchievements:s=>{s.forEach(n=>{a.addNotification({type:"achievement",message:`🏆 Achievement Unlocked!
${n.icon} ${n.name}
${n.description}`})})},addNotification:s=>{const n=[...i.notifications||[]],t=Date.now()+Math.random();n.push({...s,id:t,timestamp:Date.now()}),a.setState({notifications:n}),setTimeout(()=>{a.dismissNotification(t)},5e3)},dismissNotification:s=>{const n=Number(s),t=(i.notifications||[]).filter(o=>o.id!==n);a.setState({notifications:t})}};return a}function _(i){const{companion:e,messages:a}=i,s=e.status==="sleeping",n=e.status==="questing",t=e.evolutionStage||"baby",o=e.personality,r=(o==null?void 0:o.mood)||"happy",l=g.getMoodEmoji(r),d=h.getXPForLevel(e.level),u=Math.floor(e.experience/d*100),m=o?o.dominantTraits.slice(0,2).join(", "):"curious";return`
    <div class="companion-view">
      <div class="companion-header">
        <div class="companion-info">
          <div class="companion-name">${e.name}</div>
          <div class="companion-status">
            ${l} ${r} • ${t} • LV ${e.level}
          </div>
          <div class="companion-personality">${m}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">HAPPY</div>
            <div class="stat-bar">
              <div class="stat-fill happy" style="width: ${e.happiness}%"></div>
            </div>
            <div class="stat-value">${e.happiness}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">ENERGY</div>
            <div class="stat-bar">
              <div class="stat-fill energy" style="width: ${e.energy}%"></div>
            </div>
            <div class="stat-value">${e.energy}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">KNOWLEDGE</div>
            <div class="stat-bar">
              <div class="stat-fill knowledge" style="width: ${e.knowledge}%"></div>
            </div>
            <div class="stat-value">${e.knowledge}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">EXP</div>
            <div class="stat-bar">
              <div class="stat-fill exp" style="width: ${u}%"></div>
            </div>
            <div class="stat-value">${e.experience}/${d}</div>
          </div>
        </div>
      </div>

      <!-- 3D Canvas Stage -->
      <div class="companion-stage" id="arlo-stage">
        <canvas id="arlo-canvas"></canvas>
        <div class="loading-overlay" id="loading-3d" style="display: none;">
          <div class="loading-spinner">Loading 3D...</div>
        </div>
        <!-- Fallback 2D Sprite (shown if WebGL unavailable) -->
        <div class="companion-sprite fallback-2d" id="fallback-sprite" style="display: none;">
          <div class="sprite ${t} ${s?"sleeping":""} ${n?"questing":""}">
            <div class="sprite-body">
              <div class="sprite-ears">
                <div class="ear"></div>
                <div class="ear"></div>
              </div>
              <div class="sprite-eyes">
                <div class="eye ${s?"closed":""}"></div>
                <div class="eye ${s?"closed":""}"></div>
              </div>
              <div class="sprite-cheeks">
                <div class="cheek"></div>
                <div class="cheek"></div>
              </div>
              <div class="sprite-mouth"></div>
              ${t!=="baby"?'<div class="sprite-tail"></div>':""}
            </div>
            ${s?'<div class="sleep-indicator">zzz</div>':""}
            ${n?'<div class="quest-indicator">🗺️</div>':""}
          </div>
          <div class="stage-badge">${t}</div>
        </div>
      </div>
    </div>
  `}function L(i){const{companion:e,messages:a}=i;if(!e)return"";const s=e.status==="sleeping",n=e.status==="questing",t=!s&&!n?"active":"inactive";return`
    <aside class="chat-sidebar" data-theme="${i.theme}">
      <div class="chat-header">
        <div class="chat-title">Chat with ${e.name}</div>
        <div class="chat-status ${t}">
          ${s?"😴 Resting":n?"🗺️ On a quest":"💬 Ready"}
        </div>
      </div>
      <div class="chat-container">
        <div class="chat-messages">
          ${a.slice(-20).map(o=>`
            <div class="message-bubble ${o.type}">
              ${o.text}
              ${o.quest?`
                <div class="quest-report">
                  <div class="quest-title">📚 ${o.quest.topic}</div>
                  <div class="quest-content">${o.quest.fact}</div>
                </div>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>
      <div class="chat-footer">
        ${!s&&!n?`
          <form id="chat-form" class="input-container">
            <input 
              type="text" 
              id="chat-input"
              class="chat-input" 
              placeholder="Talk to ${e.name}..."
              maxlength="100"
            />
            <button type="submit" class="send-button">SEND</button>
          </form>
        `:`
          <div class="chat-disabled">
            ${s?`${e.name} is sleeping. Try again soon!`:`${e.name} is exploring. Wait for the quest to finish!`}
          </div>
        `}
      </div>
    </aside>
  `}class D{constructor(){this.isAvailable=!1,this.checkAvailability()}async checkAvailability(){try{const e=await fetch(`${p.llamacpp.serverUrl}/health`,{method:"GET",signal:AbortSignal.timeout(2e3)});this.isAvailable=e.ok,console.log("🦙 llama.cpp server:",this.isAvailable?"connected":"offline")}catch{this.isAvailable=!1,console.log("⚠️ llama.cpp server offline - using fallback responses")}}buildPrompt(e,a,s){const t=(e.personality||{}).dominantTraits||["curious","playful"],o=e.mood||"happy",r=e.evolutionStage||"baby",l=a.slice(-5).map(m=>`${m.type==="user"?"Friend":e.name}: ${m.text}`).join(`
`),d=t.join(", ");return`You are ${e.name}, a ${r} AI companion who is ${d}. You're currently feeling ${o}.

Your stats:
- Level: ${e.level}
- Happiness: ${e.happiness}/100
- Energy: ${e.energy}/100
- Knowledge: ${e.knowledge}/100

Recent conversation:
${l}
Friend: ${s}
${e.name}:`}async getCompletionFromLlamaCpp(e){var a,s;try{const n=await fetch(`${p.llamacpp.serverUrl}${p.llamacpp.endpoint}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e,temperature:p.llamacpp.temperature,top_p:p.llamacpp.topP,top_k:p.llamacpp.topK,repeat_penalty:p.llamacpp.repeatPenalty,n_predict:p.llamacpp.maxTokens,stop:p.llamacpp.stop,stream:!1}),signal:AbortSignal.timeout(1e4)});if(!n.ok)throw new Error(`HTTP ${n.status}`);const t=await n.json();return((a=t.content)==null?void 0:a.trim())||((s=t.text)==null?void 0:s.trim())||""}catch(n){return console.error("llama.cpp request failed:",n),null}}getFallbackResponse(e,a){const s=e.evolutionStage||"baby",n=e.happiness||50,t={baby:["Goo goo! *giggles* 👶","*looks at you curiously* Oo!","*makes happy baby sounds* ✨","Me happy! Play more? 🎈","*crawls towards you* Hehe!","Friend! Friend! *bounces* 💕"],teen:["That's really cool! Tell me more! 🌟","Wow, I'm learning so much from you! 📚","You always know how to make me smile! 😊","This is exactly what I needed to hear! ✨","I'm so glad we're friends! 🎉","Let's explore this idea together! 🚀"],adult:["That's a fascinating perspective. I appreciate you sharing that with me.","Your insights always help me grow. Thank you for that.","I've been reflecting on our conversations, and this adds depth to my understanding.","There's wisdom in what you're saying. Let me consider that further.","Our bond has taught me so much about connection and growth.","I value the depth of our friendship and these meaningful exchanges."]},o=t[s]||t.teen;return n<30?["*yawns* I'm feeling a bit tired... 😴","Maybe we could play or eat something? 🍎","I need some energy... *looks sad* 😢"][Math.floor(Math.random()*3)]:o[Math.floor(Math.random()*o.length)]}async getResponse(e,a,s){if(this.isAvailable||await this.checkAvailability(),this.isAvailable){const n=this.buildPrompt(e,a,s),t=await this.getCompletionFromLlamaCpp(n);if(t){let o=t.replace(/^[\s\n]+/,"").replace(/[\s\n]+$/,"").split(`
`)[0];if(o=o.replace(/^(Friend|User|Human|You):\s*/i,""),o=o.replace(new RegExp(`^${e.name}:\\s*`,"i"),""),o.length>10)return o}}return this.getFallbackResponse(e,s)}analyzeMessage(e){const a=e.toLowerCase(),s=["love","great","awesome","happy","wonderful","amazing","fantastic","excellent"],n=["sad","bad","terrible","awful","hate","angry","upset","frustrated"],t=s.some(m=>a.includes(m)),o=n.some(m=>a.includes(m));let r="neutral";t&&!o&&(r="positive"),o&&!t&&(r="negative");const l=[];a.match(/\b(like|love|enjoy)\b.*?\b(game|gaming|play)\b/)&&l.push("gaming"),a.match(/\b(music|song|listen)\b/)&&l.push("music"),a.match(/\b(book|read|story)\b/)&&l.push("books"),a.match(/\b(food|eat|cook|hungry)\b/)&&l.push("food"),a.match(/\b(work|job|school|study)\b/)&&l.push("work/school");const d=e.includes("?")||a.match(/^(what|how|why|when|where|who|can|could|would|should|do|does|is|are)/),u=a.match(/\b(my name is|i am|i'm|i feel|i think|i believe)\b/);return{sentiment:r,topics:l,isQuestion:!!d,isPersonal:!!u,importance:l.length>0||u||t||o?"high":"normal"}}extractMemory(e,a,s){return s.importance==="high"||s.isPersonal?{text:a,timestamp:Date.now(),sentiment:s.sentiment,topics:s.topics,emotionalWeight:s.sentiment==="positive"?1:s.sentiment==="negative"?-1:0}:null}}const y=new D;class C{constructor(){this.questTypes={knowledge:{name:"Knowledge Quest",icon:"📚",duration:8e3,xpReward:25,knowledgeGain:15},exploration:{name:"Exploration Quest",icon:"🗺️",duration:1e4,xpReward:30,knowledgeGain:10},adventure:{name:"Adventure Quest",icon:"⚔️",duration:12e3,xpReward:40,knowledgeGain:8},wisdom:{name:"Wisdom Quest",icon:"🧙",duration:15e3,xpReward:50,knowledgeGain:20}},this.questDatabase={space:{topic:"Space Exploration",facts:["A day on Venus is longer than its year! Venus takes 243 Earth days to rotate once, but only 225 Earth days to orbit the Sun.","Neutron stars are so dense that a teaspoon of their material would weigh about 6 billion tons on Earth!","The footprints left by Apollo astronauts on the Moon will likely last for millions of years since there's no wind to erode them.","Jupiter's Great Red Spot is a massive storm that has been raging for at least 400 years and is larger than Earth!","If you could drive to space at 60 mph, it would only take about an hour to reach the boundary of space (100 km).","Saturn's moon Titan has liquid methane lakes and rivers, making it the only place besides Earth with stable liquid on its surface."],difficulty:"medium"},ocean:{topic:"Ocean Mysteries",facts:["The ocean produces more than 50% of the world's oxygen through phytoplankton photosynthesis!","The Mariana Trench is so deep (36,000 feet) that if Mount Everest were placed inside it, there would still be over a mile of water above it.","Giant squids have eyes the size of dinner plates - the largest eyes in the animal kingdom!","The ocean contains nearly 20 million tons of gold, but it's extremely diluted and expensive to extract.","Some deep-sea creatures create their own light through bioluminescence, illuminating the dark ocean depths.","The blue whale, the largest animal ever known, can weigh as much as 200 tons - that's about 33 elephants!"],difficulty:"medium"},history:{topic:"Ancient History",facts:["The Great Pyramid of Giza was the tallest man-made structure for over 3,800 years!","Ancient Egyptians invented toothpaste, breath mints, and an early form of bowling.","The Library of Alexandria was said to hold over 700,000 scrolls at its peak, representing much of the ancient world's knowledge.","Vikings actually reached North America about 500 years before Columbus, establishing a settlement in Newfoundland.","The ancient city of Petra in Jordan was carved directly into rose-colored sandstone cliffs over 2,000 years ago.","Ancient Romans used urine as mouthwash because the ammonia it contains acts as a cleaning agent!"],difficulty:"hard"},nature:{topic:"Nature Wonders",facts:['Trees can communicate with each other through an underground network of fungi called the "Wood Wide Web"!',"A single tree can absorb as much carbon in a year as a car produces driving 26,000 miles.","Honey never spoils - archaeologists have found 3,000-year-old honey in Egyptian tombs that's still perfectly edible!","Bamboo is the fastest-growing plant on Earth, capable of growing up to 3 feet in just 24 hours!",'An octopus has three hearts, nine brains, and blue blood. Each arm has its own "mini-brain"!','Crows are so intelligent they can recognize human faces, use tools, and even hold "funerals" for their dead.'],difficulty:"easy"},technology:{topic:"Technology History",facts:["The first computer bug was an actual moth found trapped in a Harvard Mark II computer in 1947!","The first 1GB hard drive, released in 1980, weighed over 500 pounds and cost $40,000!","More computing power went into a single Game Boy than the computers that sent Apollo 11 to the Moon.","The first webcam was created at Cambridge University to monitor a coffee pot, so people would know when it was full!","CAPTCHA tests generate data that helps digitize books. By solving CAPTCHAs, you're helping preserve old texts!","The first photograph ever taken required an 8-hour exposure time. Today, cameras can capture images in microseconds!"],difficulty:"medium"},science:{topic:"Scientific Discoveries",facts:["Bananas are radioactive because they contain potassium-40, a naturally radioactive isotope!","If you could fold a piece of paper 42 times, it would be thick enough to reach the Moon.","Humans share about 60% of their DNA with bananas and about 90% with cats!","A bolt of lightning is five times hotter than the surface of the Sun, reaching temperatures of 30,000°C!","Your stomach acid is strong enough to dissolve metal, but your stomach lining regenerates completely every 3-4 days.","There are more stars in the universe than grains of sand on all of Earth's beaches combined!"],difficulty:"medium"},art:{topic:"Art & Culture",facts:["The Mona Lisa has no eyebrows because it was fashionable in Renaissance Italy to shave them off!","Van Gogh only sold one painting during his lifetime, but his works now sell for hundreds of millions of dollars.","The oldest known musical instrument is a 40,000-year-old flute made from a vulture's wing bone.",'Shakespeare invented over 1,700 words that we still use today, including "assassination" and "lonely".',"The world's oldest sculpture, the Venus of Hohle Fels, is over 40,000 years old and was carved from mammoth ivory.","Music can actually help plants grow faster! Studies show plants grow better when exposed to certain types of music."],difficulty:"easy"},animals:{topic:"Animal Behavior",facts:["Elephants are the only animals that can't jump, but they're excellent swimmers and can use their trunks as snorkels!","Dolphins have names for each other and call out to specific individuals using unique whistle patterns.",'A group of flamingos is called a "flamboyance," which perfectly describes their fabulous pink appearance!',"Penguins propose to their mates with a pebble. If accepted, the pair uses it to build their nest together.","Otters hold hands while sleeping to keep from drifting apart. They also have a favorite rock for breaking open shells!","Cows have best friends and become stressed when separated from them. They can also produce different moos for different situations!"],difficulty:"easy"}}}generateQuest(e){const a=e.level||1,s=e.evolutionStage||"baby";let n="knowledge";s==="adult"||a>=10?n="wisdom":s==="teen"||a>=5?n="adventure":a>=3&&(n="exploration");const t=this.questTypes[n],o=Object.keys(this.questDatabase),r=o[Math.floor(Math.random()*o.length)],l=this.questDatabase[r],d=l.facts[Math.floor(Math.random()*l.facts.length)];return{id:`quest_${Date.now()}`,type:n,topic:l.topic,topicKey:r,fact:d,difficulty:l.difficulty,duration:t.duration,xpReward:t.xpReward,knowledgeGain:t.knowledgeGain,startTime:Date.now(),status:"active"}}completeQuest(e,a){const s={xp:e.xpReward,knowledge:e.knowledgeGain,happiness:5},n=a.evolutionStage||"baby";return(e.difficulty==="hard"&&n==="adult"||e.difficulty==="medium"&&n==="teen")&&(s.xp=Math.floor(s.xp*1.5),s.knowledge=Math.floor(s.knowledge*1.3)),e.status="completed",e.completedTime=Date.now(),{quest:e,rewards:s,message:this.getCompletionMessage(a,e)}}getCompletionMessage(e,a){const s=e.evolutionStage||"baby",n={baby:["I'm back! Look what I learned! 🌟","*bounces excitedly* I found something cool!","Friend! Friend! I discovered something! ✨"],teen:["That quest was amazing! Check out what I discovered!","You won't believe what I found out there!","I learned something incredible on my adventure!"],adult:["I've returned from my journey with valuable knowledge.","The quest has yielded fascinating insights.","My travels have enriched my understanding of the world."]},t=n[s]||n.teen;return t[Math.floor(Math.random()*t.length)]}getQuestReport(e){return{topic:e.topic,fact:e.fact,duration:Math.floor((e.completedTime-e.startTime)/1e3),difficulty:e.difficulty}}getRecommendedTopics(e){const a=e.personality;if(!a)return Object.keys(this.questDatabase);const s={curious:["science","space","technology"],adventurous:["exploration","history","nature"],wise:["history","science","philosophy"],creative:["art","music","culture"],playful:["animals","nature","fun_facts"]},n=a.dominantTraits||["curious"],t=new Set;for(const o of n)(s[o]||[]).forEach(l=>t.add(l));return Array.from(t)}}const w=new C,c=E();function R(){const i=document.querySelector(".chat-messages");i&&requestAnimationFrame(()=>{i.scrollTop=i.scrollHeight})}const $=localStorage.getItem("companionState");if($)try{const i=JSON.parse($);c.setState(i)}catch(i){console.error("Failed to load saved state:",i)}setInterval(()=>{localStorage.setItem("companionState",JSON.stringify(c.getState()))},5e3);function N(){const i=["classic","ocean","sunset","forest","candy"],e=c.getState().theme;return`
    <div class="theme-selector">
      ${i.map(a=>`
        <button
          class="theme-button ${a===e?"active":""}"
          data-theme="${a}"
          aria-label="${a} theme"
          title="${a}"
        ></button>
      `).join("")}
    </div>
  `}function I(){return`
    <div class="notifications-container">
      ${(c.getState().notifications||[]).map(a=>`
        <div class="notification ${a.type}" data-id="${a.id}">
          <div class="notification-content">${a.message.replace(/\n/g,"<br/>")}</div>
          <button class="notification-close" data-id="${a.id}">×</button>
        </div>
      `).join("")}
    </div>
  `}function F(){const i=c.getState();return`
    <div class="egg-container">
      <div class="egg ${i.eggShaking?"shaking":""}">
        <div class="egg-pixel">
          <div class="crack crack-1 ${i.eggShaking?"visible":""}"></div>
          <div class="crack crack-2 ${i.eggShaking?"visible":""}"></div>
          <div class="crack crack-3 ${i.eggShaking?"visible":""}"></div>
        </div>
      </div>
      <div class="pixel-text">
        A mysterious egg...<br/>
        What could be inside?
      </div>
      <button class="hatch-button" id="hatch-btn">
        TAP TO HATCH
      </button>
    </div>
  `}function H(){const i=c.getState();return`
    <div class="signup-form">
      <div class="pixel-text">
        Your companion is<br/>
        about to hatch!
      </div>
      <form id="signup-form">
        <div class="form-group">
          <label class="form-label">NAME YOUR COMPANION</label>
          <input
            type="text"
            class="form-input"
            id="companion-name"
            placeholder="Enter name..."
            maxlength="12"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">CHOOSE GENDER</label>
          <div class="gender-options">
            <button
              type="button"
              class="gender-button ${i.selectedGender==="boy"?"selected":""}"
              data-gender="boy"
            >
              BOY
            </button>
            <button
              type="button"
              class="gender-button ${i.selectedGender==="girl"?"selected":""}"
              data-gender="girl"
            >
              GIRL
            </button>
          </div>
        </div>
        <button type="submit" class="hatch-button">
          COMPLETE HATCH
        </button>
      </form>
    </div>
  `}function x(){const i=c.getState(),e=document.querySelector("#app");let a="";i.stage==="egg"?a=F():i.stage==="signup"?a=H():i.stage==="companion"&&(a=_(i));const s=`
    <div class="gameboy-screen" data-theme="${i.theme}">
      ${N()}
      <div class="screen-inner">
        ${a}
      </div>
      ${i.stage==="companion"?`
        <div class="controls">
          <button class="control-button" id="feed-btn" title="Feed (${g.getMoodEmoji("happy")} +10, ⚡ +15)">🍎</button>
          <button class="control-button" id="play-btn" title="Play (${g.getMoodEmoji("joyful")} +15, 💡 XP +${h.getActivityXP("play")})">🎮</button>
          <button class="control-button" id="quest-btn" title="Quest (🧠 +10-20, 💡 XP +${h.getActivityXP("quest")})">🗺️</button>
          <button class="control-button" id="minigame-btn" title="Mini-Games">🎯</button>
          <button class="control-button" id="achievements-btn" title="Achievements">🏆</button>
        </div>
      `:""}
    </div>
  `,n=i.stage==="companion"?`<div class="app-layout">${s}${L(i)}</div>`:`<div class="single-layout">${s}</div>`;e.innerHTML=`
    ${I()}
    ${n}
  `,j(),i.stage==="companion"&&R()}function j(){const i=c.getState();if(document.querySelectorAll(".theme-button").forEach(e=>{e.addEventListener("click",()=>{const a=e.dataset.theme;c.setState({theme:a})})}),document.querySelectorAll(".notification-close").forEach(e=>{e.addEventListener("click",()=>{c.dismissNotification(Number(e.dataset.id))})}),i.stage==="egg"){const e=document.querySelector("#hatch-btn");e==null||e.addEventListener("click",()=>{c.setState({eggShaking:!0}),setTimeout(()=>{c.setState({stage:"signup",eggShaking:!1})},2e3)})}if(i.stage==="signup"){document.querySelectorAll(".gender-button").forEach(a=>{a.addEventListener("click",()=>{c.setState({selectedGender:a.dataset.gender})})});const e=document.querySelector("#signup-form");e==null||e.addEventListener("submit",a=>{a.preventDefault();const s=document.querySelector("#companion-name").value,n=i.selectedGender;if(!n){alert("Please choose a gender!");return}const t={name:s,gender:n,level:1,experience:0,happiness:80,energy:100,knowledge:10,status:"awake",bornAt:Date.now(),evolutionStage:"baby",personality:g.initializePersonality(),mood:"happy",achievements:{unlocked:[],progress:{chats:0,feeds:0,plays:0,quests:0,minigamesPlayed:0,minigamesWon:0,daysPlayed:1,lastPlayDate:new Date().toDateString()}},memories:[],questHistory:[]};c.setState({stage:"companion",companion:t,messages:[{type:"companion",text:`*hatches from egg* Goo goo! ${g.getMoodEmoji("joyful")}`,timestamp:Date.now()}]})})}i.stage==="companion"&&G()}function G(){var a,s,n,t,o;const i=c.getState(),e=document.querySelector("#chat-form");e==null||e.addEventListener("submit",async r=>{r.preventDefault();const l=document.querySelector("#chat-input"),d=l.value.trim();if(!d)return;const u=[...i.messages,{type:"user",text:d,timestamp:Date.now()}];c.setState({messages:u}),l.value="";const m=y.analyzeMessage(d),v=y.extractMemory(i.companion,d,m);if(v){const f={...c.getState().companion,memories:[...c.getState().companion.memories||[],v].slice(-50)};c.setState({companion:f})}const P=await y.getResponse(c.getState().companion,c.getState().messages.slice(-10),d);c.updatePersonality("chat",m.sentiment),setTimeout(()=>{const f=c.getState();c.setState({messages:[...f.messages,{type:"companion",text:P,timestamp:Date.now()}]});const b=f.companion;c.setState({companion:{...b,happiness:Math.min(100,b.happiness+(m.sentiment==="positive"?5:2)),knowledge:Math.min(100,b.knowledge+1)}}),c.addXP(h.getActivityXP("chat"),"Chatting"),c.checkAchievements("chat",1)},1e3)}),(a=document.querySelector("#feed-btn"))==null||a.addEventListener("click",()=>{const r=i.companion;if(r.energy>=95){c.addNotification({type:"info",message:`${r.name} is already full! 🍎`});return}c.updatePersonality("feed"),c.setState({companion:{...r,happiness:Math.min(100,r.happiness+10),energy:Math.min(100,r.energy+15)},messages:[...i.messages,{type:"companion",text:"*munch munch* Yummy! Thank you! 🍎✨",timestamp:Date.now()}]}),c.addXP(h.getActivityXP("feed"),"Feeding"),c.checkAchievements("feed",1)}),(s=document.querySelector("#play-btn"))==null||s.addEventListener("click",()=>{const r=i.companion;if(r.energy<10){c.addNotification({type:"warning",message:`${r.name} is too tired to play! Let them rest 😴`});return}c.updatePersonality("play"),c.setState({companion:{...r,happiness:Math.min(100,r.happiness+15),energy:Math.max(0,r.energy-10)},messages:[...i.messages,{type:"companion",text:"Yay! That was so fun! Let's play more! 🎮💫",timestamp:Date.now()}]}),c.addXP(h.getActivityXP("play"),"Playing"),c.checkAchievements("play",1)}),(n=document.querySelector("#quest-btn"))==null||n.addEventListener("click",()=>{const r=i.companion;if(r.status==="questing"){c.addNotification({type:"info",message:`${r.name} is already on a quest!`});return}if(r.energy<20){c.addNotification({type:"warning",message:`${r.name} needs more energy for a quest!`});return}const l=w.generateQuest(r);c.updatePersonality("quest"),c.setState({companion:{...r,status:"questing",energy:Math.max(0,r.energy-20),currentQuest:l},messages:[...i.messages,{type:"companion",text:`I'm going on a ${l.type} quest to learn about ${l.topic}! Be back soon! 🗺️✨`,timestamp:Date.now()}]}),setTimeout(()=>{O(l)},l.duration)}),(t=document.querySelector("#minigame-btn"))==null||t.addEventListener("click",()=>{c.setState({showMinigames:!i.showMinigames})}),(o=document.querySelector("#achievements-btn"))==null||o.addEventListener("click",()=>{c.setState({showAchievements:!i.showAchievements})})}function O(i){const e=c.getState(),a=e.companion,s=w.completeQuest(i,a);c.setState({companion:{...a,status:"awake",knowledge:Math.min(100,a.knowledge+s.rewards.knowledge),happiness:Math.min(100,a.happiness+s.rewards.happiness),currentQuest:null,questHistory:[...a.questHistory||[],s.quest].slice(-20)},messages:[...e.messages,{type:"companion",text:s.message,quest:w.getQuestReport(s.quest),timestamp:Date.now()}]}),c.addXP(s.rewards.xp,`Completed ${i.type} quest`),c.checkAchievements("quest",1)}c.subscribe(x);x();setTimeout(()=>{y.checkAvailability()},1e3);
