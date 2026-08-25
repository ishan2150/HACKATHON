import { QuizQuestion, Difficulty } from '../types/study';

export interface TopicExplanation {
  title: string;
  analogy: string;
  coreConcepts: string[];
  keyFormulasOrCode?: string[];
  examPitfalls: string[];
  vivaQuestion: { question: string; answer: string };
}

export interface CheatSheetData {
  topicTitle: string;
  subjectCode: string;
  summary: string;
  keyPoints: string[];
  timeOrSpaceComplexity?: string[];
  mustRememberFormulas: string[];
  sampleExamQuestion: { question: string; solution: string };
}

/**
 * Intelligent Academic CSE Knowledge Base and Heuristic Generator
 */
const CSE_KNOWLEDGE_BASE: Record<string, {
  analogy: string;
  coreConcepts: string[];
  formulasOrCode: string[];
  examPitfalls: string[];
  vivaQ: { question: string; answer: string };
  cheatSheetSummary: string;
  keyPoints: string[];
  complexities?: string[];
}> = {
  'cpu scheduling': {
    analogy: 'Think of a single chef in a busy restaurant kitchen (CPU) who has orders coming in (processes). Non-preemptive means the chef finishes cooking the entire dish before starting the next. Preemptive means the chef can pause a dish mid-way if a VIP order (high priority) arrives!',
    coreConcepts: [
      'FCFS: Non-preemptive, suffers from Convoy Effect (short processes stuck behind long CPU-bound process).',
      'SJF / SRTF: Optimal in minimizing average waiting time. Preemptive version is SRTF (Shortest Remaining Time First).',
      'Round Robin (RR): Time quantum based. Ideal for time-sharing systems. If time quantum q is very large -> behaves like FCFS; if q is too small -> heavy context switching overhead.',
      'Priority Scheduling: Starvation (indefinite blocking) solved by Aging (gradually increasing priority of waiting processes).'
    ],
    formulasOrCode: [
      'Turnaround Time (TAT) = Completion Time - Arrival Time',
      'Waiting Time (WT) = Turnaround Time - Burst Time',
      'Response Time = Time at which process gets CPU for the first time - Arrival Time'
    ],
    examPitfalls: [
      'Forgetting that Arrival Times are not always 0. Always draw the Gantt chart chronologically step-by-step.',
      'In Round Robin, remember to place newly arrived processes into the ready queue before re-inserting the preempted process.'
    ],
    vivaQ: {
      question: 'What is the Convoy Effect and which scheduling algorithm causes it?',
      answer: 'Convoy Effect occurs in FCFS when multiple I/O-bound short processes are forced to wait behind a single CPU-intensive long process, leading to low CPU and device utilization.'
    },
    cheatSheetSummary: 'CPU scheduling decides which process in ready state gets CPU allocation to maximize throughput and minimize latency.',
    keyPoints: [
      'Throughput: Number of processes completed per unit time.',
      'Turnaround Time: Total time elapsed from submission to completion.',
      'Waiting Time: Total time spent waiting in the ready queue.',
      'SJF is provably optimal for minimum average waiting time.'
    ],
    complexities: ['Gantt Chart Evaluation: O(N log N) with priority queue']
  },
  'process synchronization': {
    analogy: 'Imagine a single bathroom on an airplane with a lock. Mutual exclusion means only one passenger can be inside. A Semaphore is the green/red occupied sign outside. If two passengers rush in without locking, chaos (Race Condition) ensues!',
    coreConcepts: [
      'Race Condition: When multiple processes manipulate shared data concurrently and the outcome depends on the order of execution.',
      'Critical Section Problem: A section of code accessing shared resources. Must satisfy: Mutual Exclusion, Progress, and Bounded Waiting.',
      'Semaphores: Integer variable with atomic operations wait() (P) and signal() (V). Counting Semaphore (range -∞ to +∞) vs Binary Semaphore (Mutex, 0 or 1).',
      'Peterson\'s Solution: Two-process software solution satisfying all 3 critical section requirements using flag[] array and turn variable.'
    ],
    formulasOrCode: [
      'Wait(S): while (S <= 0); S = S - 1;',
      'Signal(S): S = S + 1;',
      'Peterson: flag[i] = true; turn = j; while (flag[j] && turn == j); /* Critical Section */ flag[i] = false;'
    ],
    examPitfalls: [
      'Confusing Counting Semaphore values: If initial semaphore S = 10, and 6 wait() and 2 signal() operations occur, the new value is S = 10 - 6 + 2 = 6.',
      'Forgetting that hardware atomic instructions like TestAndSet() and CompareAndSwap() prevent race conditions at CPU instruction level.'
    ],
    vivaQ: {
      question: 'What is the difference between a Binary Semaphore and a Mutex?',
      answer: 'A Mutex is a locking mechanism with ownership (only the thread that locked the mutex can unlock it), whereas a Binary Semaphore is a signaling mechanism (any thread can signal/wake up another thread).'
    },
    cheatSheetSummary: 'Process Synchronization coordinates concurrent execution to ensure data consistency and prevent race conditions.',
    keyPoints: [
      'Atomic Operations cannot be interrupted mid-execution.',
      'Producer-Consumer Problem uses Empty, Full, and Mutex semaphores.',
      'Dining Philosophers deadlock prevention: Pick left fork only if right fork is also available, or allow at most 4 philosophers to sit simultaneously.'
    ]
  },
  'normalization': {
    analogy: 'Think of database normalization like organizing a messy college backpack. Instead of stuffing books, gym clothes, wet bottles, and lunch together in one compartment (redundancy & anomaly disaster!), you separate them into dedicated labeled pouches with zippers (relational tables with keys).',
    coreConcepts: [
      '1NF: Atomic values only (no multi-valued or composite attributes in columns).',
      '2NF: Must be in 1NF + No Partial Dependency (no non-prime attribute depends on a proper subset of candidate key).',
      '3NF: Must be in 2NF + No Transitive Dependency (for X -> Y, X must be Super Key OR Y is Prime Attribute).',
      'BCNF (Boyce-Codd): Stricter 3NF. For every non-trivial functional dependency X -> Y, X MUST be a Super Key.'
    ],
    formulasOrCode: [
      'Attribute Closure (X+): Compute all attributes determinable by X using Armstrong Axioms.',
      'Lossless Join Test: R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2 (The intersection must be a candidate key of at least one table).',
      'Candidate Key: Minimal Super Key (X+ = all attributes in relation R, and no proper subset of X is a super key).'
    ],
    examPitfalls: [
      'In 3NF, students often forget the second clause: "OR Y is a prime attribute". Even if X is not super key, if Y is prime, it is 3NF!',
      'Assuming all 3NF decompositions are BCNF. BCNF does NOT allow Y to be prime if X is not super key.'
    ],
    vivaQ: {
      question: 'Why might a database designer choose 3NF over BCNF in production?',
      answer: 'While BCNF eliminates all redundancy based on functional dependencies, it may not always preserve all functional dependencies. 3NF always guarantees both lossless join AND dependency preservation.'
    },
    cheatSheetSummary: 'Normalization systematically decomposes relations with anomalies into structured tables minimizing redundancy.',
    keyPoints: [
      'Insertion Anomaly: Inability to record certain info without adding unrelated data.',
      'Deletion Anomaly: Unintended loss of important info when deleting unrelated record.',
      'Update Anomaly: Inconsistent duplicate data when updating only one row.'
    ],
    complexities: ['Candidate Key Discovery: O(2^N) worst-case, polynomial for small attribute sets']
  },
  'dynamic programming': {
    analogy: 'Suppose I write "1 + 1 + 1 + 1 + 1" on a board. You count and say "5". Now I write another "+ 1" at the end. You immediately say "6" without recounting from the beginning because you REMEMBERED the previous answer. That is Dynamic Programming (Memoization)!',
    coreConcepts: [
      'Two Essential Properties: 1. Optimal Substructure (optimal solution to problem contains optimal solutions to subproblems), 2. Overlapping Subproblems (subproblems are solved repeatedly).',
      'Memoization (Top-Down): Recursive with cached lookups in an array/map.',
      'Tabulation (Bottom-Up): Iterative table filling from base cases up to target N.',
      'Classic CSE Problems: 0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Floyd-Warshall.'
    ],
    formulasOrCode: [
      '0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w - wt[i-1]])',
      'LCS: if (X[i-1] == Y[j-1]) dp[i][j] = 1 + dp[i-1][j-1]; else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);',
      'Fibonacci: dp[n] = dp[n-1] + dp[n-2] with dp[0]=0, dp[1]=1'
    ],
    examPitfalls: [
      'Confusing Fractional Knapsack (Greedy O(N log N)) with 0/1 Knapsack (DP O(N * W) Pseudo-polynomial time).',
      'Off-by-one errors in DP table initialization dimensions: typically use size (N+1) x (W+1) to include base case 0.'
    ],
    vivaQ: {
      question: 'What is the difference between Divide & Conquer and Dynamic Programming?',
      answer: 'Both break problems into subproblems. Divide & Conquer works on disjoint (independent) subproblems (e.g. Merge Sort). Dynamic Programming is used when subproblems overlap and are solved repeatedly.'
    },
    cheatSheetSummary: 'Dynamic Programming solves optimization problems by breaking them into overlapping subproblems and caching intermediate solutions.',
    keyPoints: [
      '0/1 Knapsack: Pseudo-polynomial time O(N * W).',
      'LCS: Time O(M * N), Space O(M * N) reducible to O(min(M,N)).',
      'Matrix Chain Multiplication: Minimizes scalar multiplications using Catalan number parenthesis permutations.'
    ],
    complexities: ['0/1 Knapsack: Time O(N*W), Space O(N*W)', 'LCS: Time O(M*N), Space O(M*N)']
  },
  'sliding window protocols': {
    analogy: 'Imagine mailing 5 letters in advance before waiting for the postman to deliver the first reply receipt, instead of mailing 1 letter, waiting days for a receipt, and only then mailing the 2nd. The number of unacknowledged letters in flight is your Window Size!',
    coreConcepts: [
      'Stop-and-Wait ARQ: Sender transmits 1 frame and waits for ACK before sending next. Very low efficiency if propagation delay is high.',
      'Go-Back-N (GBN): Sender can send up to N frames without waiting. Receiver only accepts strictly in-order frames (Receiver window = 1). If frame k is lost, frames k, k+1, k+2... are all discarded and retransmitted.',
      'Selective Repeat (SR): Both sender and receiver maintain window size > 1. Receiver has buffer to store out-of-order frames. Only damaged/lost frames are retransmitted.'
    ],
    formulasOrCode: [
      'Efficiency η = 1 / (1 + 2a), where a = Propagation_Delay (Tp) / Transmission_Delay (Tt)',
      'Throughput = η * Bandwidth (B)',
      'Go-Back-N Window: Ws <= 2^n - 1, Wr = 1 (where n = number of bits in sequence number)',
      'Selective Repeat Window: Ws = Wr <= 2^(n - 1)'
    ],
    examPitfalls: [
      'Formula for Transmission Delay: Tt = Frame_Size (L) / Bandwidth (B). Propagation Delay: Tp = Distance (d) / Propagation_Speed (v). Keep units consistent (bits vs bytes, ms vs seconds)!',
      'In GBN, with 3-bit sequence numbers, max sender window is 2^3 - 1 = 7 (NOT 8, to prevent sequence number wrap-around ambiguity).'
    ],
    vivaQ: {
      question: 'Why does Go-Back-N discard out-of-order frames even if they arrive undamaged?',
      answer: 'Because the GBN receiver does not maintain buffering capacity for out-of-order frames (Wr = 1). It uses Cumulative ACKs and only expects the next in-sequence frame.'
    },
    cheatSheetSummary: 'Sliding window protocols achieve flow and error control over unreliable channels by pipelining frame transmissions.',
    keyPoints: [
      'Pipelining increases channel utilization dramatically compared to Stop-and-Wait.',
      'Piggybacking: Attaching ACKs to outgoing data frames in two-way communication.',
      'Timer: Sender starts a countdown timer for each transmitted frame.'
    ],
    complexities: ['Max GBN Window: 2^n - 1', 'Max SR Window: 2^(n-1)']
  }
};

/**
 * Generate a detailed concept explanation with analogies and exam tips
 */
export const generateTopicExplanation = async (topicTitle: string, subjectCode?: string): Promise<TopicExplanation> => {
  // Normalize title for lookup
  const lower = topicTitle.toLowerCase();
  
  // Find closest match in knowledge base
  let match = Object.keys(CSE_KNOWLEDGE_BASE).find(key => lower.includes(key));
  
  if (match && CSE_KNOWLEDGE_BASE[match]) {
    const data = CSE_KNOWLEDGE_BASE[match];
    return {
      title: topicTitle,
      analogy: data.analogy,
      coreConcepts: data.coreConcepts,
      keyFormulasOrCode: data.formulasOrCode,
      examPitfalls: data.examPitfalls,
      vivaQuestion: data.vivaQ
    };
  }

  // Generic intelligent academic generator for custom topics
  return {
    title: topicTitle,
    analogy: `Think of ${topicTitle} like a modular engine component in a larger computing system. Every input has defined constraints, transformation invariants, and verifiable outputs with distinct computational trade-offs.`,
    coreConcepts: [
      `Formal Definition: Core structural theory and properties governing ${topicTitle}.`,
      `Working Mechanism: State transitions, data transformations, or execution cycles.`,
      `Optimal Invariants: Boundary conditions, worst-case vs average-case efficiency considerations.`,
      `Real-world System Integration: How modern compilers, databases, or operating systems apply this concept in production.`
    ],
    keyFormulasOrCode: [
      `// Algorithm / Property schema for ${topicTitle}\nFunction Execute_${topicTitle.replace(/[^a-zA-Z]/g, '')}(Input D) {\n  ValidateConstraints(D);\n  ApplyCoreInvariant();\n  Return OptimizedResult;\n}`
    ],
    examPitfalls: [
      `Review edge cases: null pointers, zero boundary conditions, and cyclic dependencies.`,
      `Verify time and space complexity constraints when scaling input parameter N.`
    ],
    vivaQuestion: {
      question: `What is the primary trade-off when implementing ${topicTitle}?`,
      answer: `The primary trade-off typically involves balancing computational time complexity, space/memory overhead, and implementation simplicity under peak concurrent workloads.`
    }
  };
};

/**
 * Generate a One-Page High-Yield Cheat Sheet
 */
export const generateCheatSheet = async (topicTitle: string, subjectCode: string = 'CSE'): Promise<CheatSheetData> => {
  const lower = topicTitle.toLowerCase();
  const match = Object.keys(CSE_KNOWLEDGE_BASE).find(key => lower.includes(key));

  if (match && CSE_KNOWLEDGE_BASE[match]) {
    const data = CSE_KNOWLEDGE_BASE[match];
    return {
      topicTitle,
      subjectCode,
      summary: data.cheatSheetSummary,
      keyPoints: data.keyPoints,
      timeOrSpaceComplexity: data.complexities || ['Time: O(N log N) / O(N)', 'Space: O(1) auxiliary'],
      mustRememberFormulas: data.formulasOrCode,
      sampleExamQuestion: {
        question: `Explain ${topicTitle} with a neat diagram and state its time/space trade-offs. (10 Marks)`,
        solution: `1. Define the formal concept and prerequisites.\n2. State the key mathematical/algorithmic invariant:\n   ${data.formulasOrCode[0] || 'See formula sheet'}\n3. Walk through step-by-step example with boundary conditions.\n4. Conclude with complexity analysis and 2 practical use cases.`
      }
    };
  }

  return {
    topicTitle,
    subjectCode,
    summary: `Comprehensive summary and revision notes for ${topicTitle} in ${subjectCode}.`,
    keyPoints: [
      `Essential definition and architectural purpose in modern computer systems.`,
      `Step-by-step operational flow and lifecycle phases.`,
      `Key invariants, assumptions, and critical limitations.`,
      `Comparison with alternative approaches and hybrid optimizations.`
    ],
    timeOrSpaceComplexity: [
      `Average Time Complexity: O(N log N)`,
      `Worst Case Space: O(N) auxiliary space`
    ],
    mustRememberFormulas: [
      `Efficiency / Performance Ratio = (Useful Output / Total System Resources) * 100%`,
      `Invariant Condition: Pre-condition(I) -> Process(P) -> Post-condition(O)`
    ],
    sampleExamQuestion: {
      question: `Derive the analytical formulation of ${topicTitle} and discuss two common edge cases. (7 Marks)`,
      solution: `Provide the mathematical proof, state all assumptions clearly, and illustrate with a 3-element tracing table.`
    }
  };
};

/**
 * AI Chat Assistant for answering questions and giving personalized study tips
 */
export const getAiStudyAdvice = async (
  query: string, 
  userContext?: { subjectsCount: number; upcomingExam?: string; daysLeft?: number; weakTopicsCount?: number }
): Promise<string> => {
  const q = query.toLowerCase();

  if (q.includes('motivat') || q.includes('stressed') || q.includes('tired') || q.includes('burnout')) {
    return `Stay calm and take a deep breath! 🌟 

Here is your optimal battle plan:
1. **The 25-minute rule**: Don't think about the whole syllabus. Just commit to ONE 25-minute Pomodoro session on a single topic.
2. **Active Recall over passive reading**: Solve 3 quiz questions instead of re-reading 20 pages of slides.
3. **Hydrate & Rest**: Studies show 7 hours of sleep improves memory consolidation by over 40% before engineering exams!

You have all the tools in StudyBuddy. Let's conquer the highest-priority topic right now! 🚀`;
  }

  if (q.includes('schedule') || q.includes('plan') || q.includes('time management')) {
    return `💡 **Smart Strategy for 2nd Year CSE Exams**:
1. **Urgency-First Allocation**: Dedicate mornings (peak focus) to your hardest upcoming exam topics (e.g. Dynamic Programming, Semaphores, Normalization).
2. **Interleaving**: Never study the same subject for 6 hours straight. Alternate between algorithmic/math subjects (DAA/TOC) and systems subjects (OS/DBMS/CN).
3. **Spaced Repetition**: Day 1 Learn -> Day 3 Practice Quizzes -> Day 6 Quick Cheat Sheet Review.
Use the **Schedule** tab to auto-generate your daily time blocks!`;
  }

  if (q.includes('viva') || q.includes('interview') || q.includes('lab exam')) {
    return `🎯 **Top 3 Viva Survival Tips**:
1. **Know standard definitions verbatim** (e.g., ACID properties, Deadlock Coffman conditions, Master Theorem conditions).
2. **Always mention Time and Space Complexities** without the examiner asking.
3. **If you don't know an exact answer**, explain the foundational principle or trade-off instead of guessing blindly!`;
  }

  // Concept lookup check
  for (const key of Object.keys(CSE_KNOWLEDGE_BASE)) {
    if (q.includes(key)) {
      const item = CSE_KNOWLEDGE_BASE[key];
      return `### 💡 Quick Explainer: ${key.toUpperCase()}

**Analogy:**
${item.analogy}

**Key Exam Takeaways:**
${item.coreConcepts.map(c => `• ${c}`).join('\n')}

**Must-Know Formulas:**
${item.formulasOrCode.map(f => `\`${f}\``).join('\n')}

**Top Viva Question:**
*Q: ${item.vivaQ.question}*
*A: ${item.vivaQ.answer}*`;
    }
  }

  return `I'm your **StudyBuddy AI Copilot**! 🤖

I can help you:
- 📖 **Explain any CSE topic** with simple analogies & code (try asking: *"Explain Belady's Anomaly"* or *"How does 2-Phase Locking work?"*)
- 📝 **Generate 1-Page Cheat Sheets** with formulas and complexities.
- 🎯 **Create Viva & Exam Questions** for your upcoming mid-terms/finals.
- ⚡ **Optimize your daily study schedule** based on your quiz performance.

What concept or subject would you like to master today?`;
};
