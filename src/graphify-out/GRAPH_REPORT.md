# Graph Report - D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src  (2026-04-27)

## Corpus Check
- 43 files · ~15,308 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 146 nodes · 158 edges · 27 communities detected
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]

## God Nodes (most connected - your core abstractions)
1. `Dashboard()` - 8 edges
2. `safeGetItem()` - 7 edges
3. `safeGetJson()` - 7 edges
4. `useAI()` - 6 edges
5. `generateSprintBlocks()` - 6 edges
6. `emitWarning()` - 6 edges
7. `App()` - 5 edges
8. `ErrorBoundary` - 5 edges
9. `daysUntil()` - 5 edges
10. `getStudyStreak()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Dashboard()` --calls--> `greeting()`  [INFERRED]
  D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\components\dashboard\Dashboard.jsx → D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\utils\dateHelpers.js
- `readStorage()` --calls--> `safeGetJson()`  [INFERRED]
  D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\hooks\useChatHistory.js → D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\utils\storage.js
- `readStorage()` --calls--> `safeGetJson()`  [INFERRED]
  D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\hooks\useExams.js → D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\utils\storage.js
- `readStorage()` --calls--> `safeGetJson()`  [INFERRED]
  D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\hooks\useSocialStudy.js → D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\utils\storage.js
- `readStorage()` --calls--> `safeGetJson()`  [INFERRED]
  D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\hooks\useStudyLog.js → D:\Masters Automation Engineering\MemorAIz\exam-sprint-planner\src\utils\storage.js

## Communities

### Community 0 - "Community 0"
Cohesion: 0.12
Nodes (9): App(), readStorage(), useChatHistory(), readStorage(), useExams(), readStorage(), useSocialStudy(), readStorage() (+1 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (7): FlashcardTab(), MindmapTab(), QuizTab(), AIRequestError, callAnthropic(), getApiKey(), useAI()

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (6): SprintPlanner(), dateKey(), getAchievements(), getMissedStudyDays(), getSmartReminders(), getStudyStreak()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (9): daysUntil(), DaysRemaining(), SprintBlock(), addDays(), blockStats(), formatShort(), generateSprintBlocks(), startOfDay() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.28
Nodes (9): AICompanion(), SettingsPage(), emitWarning(), getStorage(), safeClear(), safeGetItem(), safeGetJson(), safeSetItem() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.2
Nodes (5): Dashboard(), metric(), recommendTodaysTopics(), calculateOverallReadiness(), masteryCount()

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (5): dateISO(), formatDate(), getWeekRange(), greeting(), TopicRow()

### Community 7 - "Community 7"
Cohesion: 0.33
Nodes (6): ExplainTab(), escapeHtml(), safeMarkdownSource(), safeTopicPayload(), sanitizeMultilineInput(), sanitizeTextInput()

### Community 8 - "Community 8"
Cohesion: 0.33
Nodes (1): ErrorBoundary

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 1.0
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 10`** (2 nodes): `ChatTab()`, `ChatTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 11`** (2 nodes): `TopicSelector.jsx`, `TopicSelector()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 12`** (2 nodes): `ReadinessOverview.jsx`, `ReadinessOverview()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `TodaysSprint.jsx`, `TodaysSprint()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `AddExamModal()`, `AddExamModal.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `ExamCard.jsx`, `ExamCard()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `ExamList.jsx`, `ExamList()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `Sidebar.jsx`, `Sidebar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `TopBar.jsx`, `TopBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (2 nodes): `ConfidencePill()`, `ConfidencePill.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (2 nodes): `LoadingSkeleton.jsx`, `LoadingSkeleton()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (2 nodes): `ReadinessBar.jsx`, `ReadinessBar()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (2 nodes): `StatsPage.jsx`, `StatsPage()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `VelocityScore.jsx`, `VelocityScore()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `FocusTimer.jsx`, `FocusTimer()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `PomodoroRing.jsx`, `PomodoroRing()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `safeGetItem()` connect `Community 4` to `Community 1`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `Dashboard()` connect `Community 5` to `Community 2`, `Community 3`, `Community 6`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `getApiKey()` connect `Community 1` to `Community 4`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Dashboard()` (e.g. with `recommendTodaysTopics()` and `calculateOverallReadiness()`) actually correct?**
  _`Dashboard()` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `safeGetItem()` (e.g. with `AICompanion()` and `SettingsPage()`) actually correct?**
  _`safeGetItem()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `safeGetJson()` (e.g. with `readStorage()` and `readStorage()`) actually correct?**
  _`safeGetJson()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `useAI()` (e.g. with `ExplainTab()` and `FlashcardTab()`) actually correct?**
  _`useAI()` has 4 INFERRED edges - model-reasoned connections that need verification._