import { Subject, QuizQuestion, Flashcard, UserPreferences } from '../types/study';

// Helper to get formatted date string (YYYY-MM-DD) offset by days
export const getOffsetDateString = (offsetDays: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  dailyHoursWeekday: 3.5,
  dailyHoursWeekend: 6.0,
  preferredSlots: ['morning', 'evening', 'night'],
  studyPace: 'balanced',
  spacedRepetitionEnabled: true,
  sessionDurationMinutes: 45,
  breakDurationMinutes: 10,
  targetExamReadyDaysBefore: 2,
};

export const SAMPLE_CSE_SUBJECTS: Subject[] = [
  {
    id: 'subj-os',
    code: 'CS201',
    name: 'Operating Systems',
    color: '#3B82F6', // Blue
    examDate: getOffsetDateString(6), // Exam in 6 days
    targetGrade: 'A+ (90%+)',
    creditHours: 4,
    topics: [
      {
        id: 'os-top-1',
        subjectId: 'subj-os',
        chapter: 'Unit 1: Process Management',
        title: 'CPU Scheduling Algorithms (FCFS, SJF, SRTF, RR, Priority)',
        difficulty: 'medium',
        weightage: 'critical',
        currentConfidence: 75,
        estimatedHours: 2.5,
        completed: false,
        quizScore: 80,
        notes: 'Pay special attention to calculating Gantt charts, Average Waiting Time, and Turnaround Time for Round Robin with different time quantums.',
        keyFormulas: [
          'Turnaround Time (TAT) = Completion Time - Arrival Time',
          'Waiting Time (WT) = TAT - Burst Time',
          'Response Time = First CPU Allocation - Arrival Time'
        ]
      },
      {
        id: 'os-top-2',
        subjectId: 'subj-os',
        chapter: 'Unit 2: Concurrency & Synchronization',
        title: 'Process Synchronization, Semaphores & Dining Philosophers',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 40,
        estimatedHours: 3.5,
        completed: false,
        quizScore: 45, // Weak topic! AI will prioritize
        notes: 'Classic synchronization problems: Producer-Consumer using bounded buffer, Readers-Writers with mutex, and Dining Philosophers deadlock prevention.',
        keyFormulas: [
          'Wait(S): while(S <= 0); S--;',
          'Signal(S): S++;',
          'Critical Section 3 Conditions: Mutual Exclusion, Progress, Bounded Waiting'
        ]
      },
      {
        id: 'os-top-3',
        subjectId: 'subj-os',
        chapter: 'Unit 2: Deadlocks',
        title: 'Deadlock Detection, Prevention & Banker\'s Algorithm',
        difficulty: 'hard',
        weightage: 'high',
        currentConfidence: 55,
        estimatedHours: 3.0,
        completed: false,
        notes: 'Coffman 4 conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait. Practice Banker\'s Safety algorithm table questions.',
        keyFormulas: [
          'Need Matrix = Max Matrix - Allocation Matrix',
          'Safety Condition: Need[i] <= Available'
        ]
      },
      {
        id: 'os-top-4',
        subjectId: 'subj-os',
        chapter: 'Unit 3: Memory Management',
        title: 'Paging, Segmentation & TLB Translation',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 65,
        estimatedHours: 2.5,
        completed: false,
        notes: 'Logical to Physical address translation: Logical address = (Page Number p, Offset d). TLB hit ratio calculation.',
        keyFormulas: [
          'EAT = Hit_Ratio * (TLB_Time + Mem_Time) + (1 - Hit_Ratio) * (TLB_Time + 2 * Mem_Time)',
          'Physical Address = Frame Number (f) * Page Size + Offset (d)'
        ]
      },
      {
        id: 'os-top-5',
        subjectId: 'subj-os',
        chapter: 'Unit 3: Virtual Memory',
        title: 'Page Replacement Algorithms (FIFO, LRU, Optimal Belady Anomaly)',
        difficulty: 'medium',
        weightage: 'critical',
        currentConfidence: 80,
        estimatedHours: 2.0,
        completed: true,
        quizScore: 90,
        notes: 'Belady\'s Anomaly: FIFO page fault increase with more frame count. Optimal algorithm serves as benchmark.',
        keyFormulas: ['Page Fault Rate = Faults / Total References']
      },
      {
        id: 'os-top-6',
        subjectId: 'subj-os',
        chapter: 'Unit 4: Storage Management',
        title: 'Disk Scheduling Algorithms (FCFS, SSTF, SCAN, C-SCAN, LOOK)',
        difficulty: 'easy',
        weightage: 'medium',
        currentConfidence: 85,
        estimatedHours: 1.5,
        completed: true,
        notes: 'Calculate total head movement cylinders. Remember SCAN goes to the extreme end (0 or max cylinder), whereas LOOK only goes to the furthest request.',
      }
    ]
  },
  {
    id: 'subj-dbms',
    code: 'CS202',
    name: 'Database Management Systems',
    color: '#10B981', // Emerald Green
    examDate: getOffsetDateString(9), // Exam in 9 days
    targetGrade: 'A (85%+)',
    creditHours: 4,
    topics: [
      {
        id: 'dbms-top-1',
        subjectId: 'subj-dbms',
        chapter: 'Unit 1: Data Modeling',
        title: 'ER Diagrams, Relational Schema & Relational Algebra',
        difficulty: 'easy',
        weightage: 'medium',
        currentConfidence: 90,
        estimatedHours: 2.0,
        completed: true,
        notes: 'Entities, Weak entity identification keys, cardinality constraints (1:1, 1:N, M:N). Selection (σ), Projection (π), Join (⨝).',
      },
      {
        id: 'dbms-top-2',
        subjectId: 'subj-dbms',
        chapter: 'Unit 2: SQL & Advanced Queries',
        title: 'Nested SQL, Aggregations, GROUP BY/HAVING & Window Functions',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 70,
        estimatedHours: 2.5,
        completed: false,
        notes: 'Differences between WHERE and HAVING. Correlated subqueries and EXISTS vs IN clauses.',
      },
      {
        id: 'dbms-top-3',
        subjectId: 'subj-dbms',
        chapter: 'Unit 3: Relational Database Design',
        title: 'Functional Dependencies & Normalization (1NF, 2NF, 3NF, BCNF)',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 35,
        estimatedHours: 4.0,
        completed: false,
        quizScore: 40, // Weak topic
        notes: 'Canonical cover, finding candidate keys using attribute closure (X+), Lossless Join decomposition, and Dependency Preservation tests.',
        keyFormulas: [
          '2NF: No partial dependency (non-prime on part of candidate key)',
          '3NF: For X -> Y, either X is Super Key or Y is Prime attribute',
          'BCNF: For X -> Y, X must be a Super Key'
        ]
      },
      {
        id: 'dbms-top-4',
        subjectId: 'subj-dbms',
        chapter: 'Unit 4: Transaction & Concurrency',
        title: 'ACID Properties, Serializability & 2-Phase Locking (2PL)',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 50,
        estimatedHours: 3.5,
        completed: false,
        notes: 'Conflict serializability precedence graph (cycle = not conflict serializable). View serializability. Strict 2PL vs Rigorous 2PL.',
      },
      {
        id: 'dbms-top-5',
        subjectId: 'subj-dbms',
        chapter: 'Unit 5: Indexing & Storage',
        title: 'B-Trees and B+ Trees Index Structure & Query Optimization',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 60,
        estimatedHours: 2.5,
        completed: false,
        notes: 'B+ Tree node order, maximum/minimum keys per internal and leaf node, insertion overflow splits and deletion merges.',
      }
    ]
  },
  {
    id: 'subj-daa',
    code: 'CS203',
    name: 'Design & Analysis of Algorithms',
    color: '#8B5CF6', // Purple/Violet
    examDate: getOffsetDateString(3), // Exam in 3 days (CRITICAL URGENCY)
    targetGrade: 'A+ (90%+)',
    creditHours: 4,
    topics: [
      {
        id: 'daa-top-1',
        subjectId: 'subj-daa',
        chapter: 'Unit 1: Foundations & Recurrences',
        title: 'Asymptotic Notations (Big-O, Omega, Theta) & Master Theorem',
        difficulty: 'easy',
        weightage: 'high',
        currentConfidence: 85,
        estimatedHours: 2.0,
        completed: true,
        notes: 'Master theorem cases: T(n) = aT(n/b) + f(n). Comparison of log_b(a) with polynomial power k of f(n).',
        keyFormulas: [
          'Case 1: f(n) = O(n^(log_b(a) - ε)) => T(n) = Θ(n^log_b(a))',
          'Case 2: f(n) = Θ(n^(log_b(a)) * log^k(n)) => T(n) = Θ(n^log_b(a) * log^(k+1)(n))',
          'Case 3: f(n) = Ω(n^(log_b(a) + ε)) => T(n) = Θ(f(n))'
        ]
      },
      {
        id: 'daa-top-2',
        subjectId: 'subj-daa',
        chapter: 'Unit 2: Divide & Conquer',
        title: 'Divide & Conquer: Merge Sort, Quick Sort & Closest Pair of Points',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 75,
        estimatedHours: 2.5,
        completed: false,
        notes: 'QuickSort worst case O(n^2) vs average O(n log n). Randomized QuickSort. Closest pair in O(n log n) by strip sorting.',
      },
      {
        id: 'daa-top-3',
        subjectId: 'subj-daa',
        chapter: 'Unit 3: Greedy Algorithms',
        title: 'Greedy Technique: Huffman Coding, Fractional Knapsack, Prim/Kruskal',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 70,
        estimatedHours: 3.0,
        completed: false,
        notes: 'Greedy choice property & optimal substructure. Disjoint Set Union (DSU) for Kruskal\'s MST. Time complexity O(E log V).',
      },
      {
        id: 'daa-top-4',
        subjectId: 'subj-daa',
        chapter: 'Unit 4: Dynamic Programming',
        title: 'Dynamic Programming: 0/1 Knapsack, LCS, Matrix Chain Multiplication',
        difficulty: 'very_hard',
        weightage: 'critical',
        currentConfidence: 30, // Extremely weak topic + exam in 3 days!
        estimatedHours: 4.5,
        completed: false,
        quizScore: 35,
        notes: 'Tabulation vs Memoization. State transitions for Longest Common Subsequence: dp[i][j] = dp[i-1][j-1]+1 if match else max(dp[i-1][j], dp[i][j-1]).',
        keyFormulas: [
          '0/1 Knapsack: dp[i][w] = max(dp[i-1][w], val[i-1] + dp[i-1][w-wt[i-1]])',
          'Matrix Chain: m[i,j] = min { m[i,k] + m[k+1,j] + p_(i-1)*p_k*p_j } for i<=k<j'
        ]
      },
      {
        id: 'daa-top-5',
        subjectId: 'subj-daa',
        chapter: 'Unit 5: Graph Algorithms & NP-Completeness',
        title: 'Dijkstra, Bellman-Ford, Floyd-Warshall & P vs NP/NP-Complete',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 50,
        estimatedHours: 3.5,
        completed: false,
        notes: 'Single source shortest path: Dijkstra (non-negative edges, O((V+E)log V)), Bellman-Ford (detects negative weight cycles, O(VE)). 3-SAT, Vertex Cover, Clique.',
      }
    ]
  },
  {
    id: 'subj-cn',
    code: 'CS204',
    name: 'Computer Networks',
    color: '#F59E0B', // Amber
    examDate: getOffsetDateString(14), // Exam in 14 days
    targetGrade: 'A (85%+)',
    creditHours: 3,
    topics: [
      {
        id: 'cn-top-1',
        subjectId: 'subj-cn',
        chapter: 'Unit 1: Network Architectures',
        title: 'OSI 7-Layer vs TCP/IP Model & Encapsulation Protocols',
        difficulty: 'easy',
        weightage: 'medium',
        currentConfidence: 85,
        estimatedHours: 1.5,
        completed: true,
        notes: 'Functions of each layer: Physical, Data Link, Network, Transport, Session, Presentation, Application.',
      },
      {
        id: 'cn-top-2',
        subjectId: 'subj-cn',
        chapter: 'Unit 2: Data Link Layer',
        title: 'Sliding Window Protocols (Stop-and-Wait, Go-Back-N, Selective Repeat)',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 45,
        estimatedHours: 3.0,
        completed: false,
        quizScore: 50,
        notes: 'Efficiency calculations, sender window size (Ws) and receiver window size (Wr). GBN: Wr=1, Ws=2^n-1. SR: Wr=Ws=2^(n-1).',
        keyFormulas: [
          'Efficiency η = 1 / (1 + 2a) where a = Propagation_Delay / Transmission_Delay',
          'Throughput = η * Bandwidth'
        ]
      },
      {
        id: 'cn-top-3',
        subjectId: 'subj-cn',
        chapter: 'Unit 3: Network Layer & Addressing',
        title: 'IPv4 / IPv6 Addressing, Subnetting, CIDR & NAT',
        difficulty: 'medium',
        weightage: 'critical',
        currentConfidence: 60,
        estimatedHours: 3.0,
        completed: false,
        notes: 'Calculate network ID, broadcast address, valid host range from IP/mask like 192.168.10.45/27. Subnet masks.',
      },
      {
        id: 'cn-top-4',
        subjectId: 'subj-cn',
        chapter: 'Unit 4: Routing Protocols',
        title: 'Distance Vector Routing (RIP, Count-to-Infinity) & Link State (OSPF)',
        difficulty: 'medium',
        weightage: 'high',
        currentConfidence: 65,
        estimatedHours: 2.5,
        completed: false,
        notes: 'Bellman-Ford equation for RIP. Dijkstra shortest path tree for OSPF link-state advertisements (LSA).',
      },
      {
        id: 'cn-top-5',
        subjectId: 'subj-cn',
        chapter: 'Unit 5: Transport & Application Layers',
        title: 'TCP 3-Way Handshake, Flow/Congestion Control (AIMD) & DNS/HTTP',
        difficulty: 'hard',
        weightage: 'high',
        currentConfidence: 55,
        estimatedHours: 3.0,
        completed: false,
        notes: 'TCP connection establishment (SYN, SYN-ACK, ACK) and teardown (FIN, ACK). Slow Start, Congestion Avoidance, Fast Retransmit & Fast Recovery.',
      }
    ]
  },
  {
    id: 'subj-toc',
    code: 'CS205',
    name: 'Theory of Computation & Automata',
    color: '#EC4899', // Pink
    examDate: getOffsetDateString(18), // Exam in 18 days
    targetGrade: 'A+ (90%+)',
    creditHours: 4,
    topics: [
      {
        id: 'toc-top-1',
        subjectId: 'subj-toc',
        chapter: 'Unit 1: Finite Automata',
        title: 'DFA, NFA, ε-NFA Equivalence & Subset Construction Algorithm',
        difficulty: 'medium',
        weightage: 'critical',
        currentConfidence: 75,
        estimatedHours: 3.0,
        completed: false,
        notes: 'Converting NFA to equivalent DFA via power set method. DFA state minimization using Myhill-Nerode / Table Filling algorithm.',
      },
      {
        id: 'toc-top-2',
        subjectId: 'subj-toc',
        chapter: 'Unit 2: Regular Languages',
        title: 'Regular Expressions, Arden\'s Theorem & Pumping Lemma for Regular Languages',
        difficulty: 'hard',
        weightage: 'critical',
        currentConfidence: 40,
        estimatedHours: 3.5,
        completed: false,
        quizScore: 40,
        notes: 'Proving languages non-regular using Pumping Lemma (xyz conditions: |xy| <= p, |y| >= 1, xy^i z in L for all i >= 0).',
        keyFormulas: [
          'Arden\'s Rule: If R = Q + RP, then R = QP* (where P does not contain ε)'
        ]
      },
      {
        id: 'toc-top-3',
        subjectId: 'subj-toc',
        chapter: 'Unit 3: Context-Free Grammars',
        title: 'CFGs, Ambiguity, Chomsky Normal Form (CNF) & Pushdown Automata (PDA)',
        difficulty: 'hard',
        weightage: 'high',
        currentConfidence: 50,
        estimatedHours: 3.5,
        completed: false,
        notes: 'Eliminating useless symbols, null productions, and unit productions. Converting CFG to CNF (A -> BC or A -> a). Deterministic vs Non-deterministic PDA.',
      },
      {
        id: 'toc-top-4',
        subjectId: 'subj-toc',
        chapter: 'Unit 4: Turing Machines & Decidability',
        title: 'Turing Machine Formal Definition, Halting Problem & Undecidability',
        difficulty: 'very_hard',
        weightage: 'high',
        currentConfidence: 35,
        estimatedHours: 3.5,
        completed: false,
        notes: '7-tuple Turing machine definition: (Q, Σ, Γ, δ, q0, q_accept, q_reject). Proof of Halting Problem undecidability using diagonalization.',
      }
    ]
  }
];

export const SAMPLE_QUIZ_QUESTIONS: QuizQuestion[] = [
  // OS Questions
  {
    id: 'q-os-1',
    subjectId: 'subj-os',
    topicId: 'os-top-1',
    topicTitle: 'CPU Scheduling Algorithms',
    question: 'Which of the following CPU scheduling algorithms is guaranteed to yield the minimum average waiting time for a given set of processes?',
    options: [
      'First-Come, First-Served (FCFS)',
      'Shortest Job First / Shortest Remaining Time First (SRTF)',
      'Round Robin (RR)',
      'Priority Scheduling without preemption'
    ],
    correctIndex: 1,
    explanation: 'Shortest Job First (SJF) and its preemptive version SRTF are mathematically provable to be optimal in minimizing the average waiting time among all non-preemptive / preemptive scheduling algorithms.',
    difficulty: 'easy'
  },
  {
    id: 'q-os-2',
    subjectId: 'subj-os',
    topicId: 'os-top-2',
    topicTitle: 'Process Synchronization & Semaphores',
    question: 'In Dijkstra\'s counting semaphore implementation, what happens when a process invokes the wait() (or P()) operation on a semaphore S with value 0?',
    options: [
      'The semaphore value increments to 1 and the process continues',
      'The process enters the critical section immediately',
      'The process is blocked (placed in waiting queue) until another process signals S',
      'A system crash and deadlock occurs immediately'
    ],
    correctIndex: 2,
    explanation: 'When S <= 0, the wait() operation blocks the invoking process and places it into the semaphore\'s wait queue until another process calls signal() (V operation).',
    difficulty: 'medium'
  },
  {
    id: 'q-os-3',
    subjectId: 'subj-os',
    topicId: 'os-top-3',
    topicTitle: 'Banker\'s Algorithm',
    question: 'In Banker\'s Algorithm for Deadlock Avoidance, which condition must hold for an Allocation state to be classified as "SAFE"?',
    options: [
      'No processes currently hold any resources',
      'There exists at least one sequence <P1, P2, ... Pn> of processes where each Pi can satisfy its remaining maximum needs using available resources + already allocated resources of preceding processes',
      'Total allocated resources equal total system resources',
      'All processes are in running state simultaneously'
    ],
    correctIndex: 1,
    explanation: 'A system state is safe if there exists a safe sequence where every process can obtain its maximum needed resources, finish, and release its resources to subsequent processes without deadlocking.',
    difficulty: 'hard'
  },
  {
    id: 'q-os-4',
    subjectId: 'subj-os',
    topicId: 'os-top-5',
    topicTitle: 'Page Replacement & Belady Anomaly',
    question: 'Belady\'s Anomaly is a phenomenon where increasing the number of page frames results in an increased number of page faults. Which page replacement algorithm can suffer from Belady\'s Anomaly?',
    options: [
      'Least Recently Used (LRU)',
      'Optimal Page Replacement (OPT)',
      'First-In, First-Out (FIFO)',
      'Stack-based Page Replacement'
    ],
    correctIndex: 2,
    explanation: 'FIFO is not a stack algorithm, so increasing the number of allocated frames can paradoxically increase the number of page faults for certain reference strings (Belady\'s Anomaly). LRU and OPT belong to the class of stack algorithms and never suffer from this.',
    difficulty: 'medium'
  },

  // DBMS Questions
  {
    id: 'q-dbms-1',
    subjectId: 'subj-dbms',
    topicId: 'dbms-top-3',
    topicTitle: 'Functional Dependencies & Normalization',
    question: 'A relation R(A, B, C, D) has candidate key AB and functional dependencies: AB -> C, C -> D. In which highest normal form is relation R?',
    options: [
      '1NF',
      '2NF',
      '3NF',
      'BCNF'
    ],
    correctIndex: 1,
    explanation: '1. Prime attributes are {A, B}, non-prime are {C, D}. 2. AB is candidate key, no partial dependencies exist (C and D depend on whole AB), so it is in 2NF. 3. In C -> D, C is not a super key and D is non-prime, violating 3NF (transitive dependency). Thus the highest normal form is 2NF.',
    difficulty: 'hard'
  },
  {
    id: 'q-dbms-2',
    subjectId: 'subj-dbms',
    topicId: 'dbms-top-4',
    topicTitle: 'ACID Properties & 2PL',
    question: 'Which property of database transactions ensures that either all operations of the transaction are reflected properly in the database, or none are?',
    options: [
      'Atomicity',
      'Consistency',
      'Isolation',
      'Durability'
    ],
    correctIndex: 0,
    explanation: 'Atomicity (All-or-Nothing property) guarantees that a transaction is treated as a single atomic unit of work, so if any part fails, changes are rolled back.',
    difficulty: 'easy'
  },

  // DAA Questions
  {
    id: 'q-daa-1',
    subjectId: 'subj-daa',
    topicId: 'daa-top-1',
    topicTitle: 'Master Theorem',
    question: 'Given the recurrence relation T(n) = 4T(n/2) + n^2, what is the asymptotic time complexity of T(n) using Master Theorem?',
    options: [
      'Θ(n log n)',
      'Θ(n^2)',
      'Θ(n^2 log n)',
      'Θ(n^3)'
    ],
    correctIndex: 2,
    explanation: 'Here a=4, b=2, f(n)=n^2. log_b(a) = log_2(4) = 2. Since f(n) = Θ(n^(log_b(a)) * log^0(n)) where k=0, Master Theorem Case 2 applies: T(n) = Θ(n^(log_b(a)) * log^(k+1)(n)) = Θ(n^2 log n).',
    difficulty: 'medium'
  },
  {
    id: 'q-daa-2',
    subjectId: 'subj-daa',
    topicId: 'daa-top-4',
    topicTitle: 'Dynamic Programming (0/1 Knapsack)',
    question: 'Why can Fractional Knapsack be solved using a Greedy approach in O(n log n) time, while 0/1 Knapsack requires Dynamic Programming or Branch & Bound?',
    options: [
      '0/1 Knapsack items can be divided into arbitrary decimal weights',
      '0/1 Knapsack lacks the greedy-choice property because taking a local high value-to-weight ratio item might prevent taking a combination that fills capacity with higher total value',
      'Dynamic programming has lower asymptotic time complexity than Greedy algorithms',
      '0/1 Knapsack can only be solved on directed acyclic graphs'
    ],
    correctIndex: 1,
    explanation: 'In 0/1 Knapsack, you cannot take a fraction of an item. A greedy choice based on value-to-weight density may leave unused capacity that could have been filled with an optimal combination of other items.',
    difficulty: 'hard'
  },

  // CN Questions
  {
    id: 'q-cn-1',
    subjectId: 'subj-cn',
    topicId: 'cn-top-2',
    topicTitle: 'Sliding Window Protocols',
    question: 'In a Go-Back-N protocol with an n-bit sequence number field, what are the maximum allowable Sender Window Size (Ws) and Receiver Window Size (Wr)?',
    options: [
      'Ws = 2^n, Wr = 2^n',
      'Ws = 2^n - 1, Wr = 1',
      'Ws = 2^(n-1), Wr = 2^(n-1)',
      'Ws = 1, Wr = 2^n - 1'
    ],
    correctIndex: 1,
    explanation: 'In Go-Back-N ARQ, the receiver window size is always 1 (in-order delivery only). To prevent sequence number ambiguity upon lost ACKs, the sender window size cannot exceed 2^n - 1.',
    difficulty: 'medium'
  },

  // TOC Questions
  {
    id: 'q-toc-1',
    subjectId: 'subj-toc',
    topicId: 'toc-top-2',
    topicTitle: 'Pumping Lemma for Regular Languages',
    question: 'Which of the following formal languages is PROVABLY NOT regular by applying the Pumping Lemma?',
    options: [
      'L = { w in {0,1}* | w contains an even number of 0s }',
      'L = { 0^n 1^n | n >= 0 }',
      'L = { w in {a,b}* | w ends with substring "ab" }',
      'L = { (01)^n | n >= 1 }'
    ],
    correctIndex: 1,
    explanation: 'L = { 0^n 1^n | n >= 0 } requires unbounded memory (a counter/stack) to verify that the number of 0s equals the number of 1s, which a Finite Automaton cannot do. Pumping Lemma proves string 0^p 1^p cannot be pumped.',
    difficulty: 'hard'
  }
];

export const SAMPLE_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    subjectId: 'subj-os',
    topicId: 'os-top-2',
    topicTitle: 'Semaphores',
    front: 'What are the 3 mandatory criteria that every valid solution to the Critical Section problem must satisfy?',
    back: '1. Mutual Exclusion (Only one process at a time in critical section)\n2. Progress (Selection of next process cannot be postponed indefinitely)\n3. Bounded Waiting (A limit exists on number of times other processes enter before a waiting process)',
    mastered: false,
    tags: ['OS', 'Concurrency', 'Exam Must-Know']
  },
  {
    id: 'fc-2',
    subjectId: 'subj-os',
    topicId: 'os-top-3',
    topicTitle: 'Deadlocks',
    front: 'List the 4 Coffman Conditions necessary for Deadlock to occur.',
    back: '1. Mutual Exclusion\n2. Hold and Wait\n3. No Preemption\n4. Circular Wait\n(Breaking any ONE condition prevents deadlock!)',
    mastered: true,
    tags: ['OS', 'Deadlocks']
  },
  {
    id: 'fc-3',
    subjectId: 'subj-dbms',
    topicId: 'dbms-top-3',
    topicTitle: 'Normalization',
    front: 'What is the exact condition for a relation to be in Boyce-Codd Normal Form (BCNF)?',
    back: 'For every non-trivial functional dependency X -> Y in the relation, X must be a SUPER KEY of the relation.',
    mastered: false,
    tags: ['DBMS', 'Normalization', 'VIVA Favorite']
  },
  {
    id: 'fc-4',
    subjectId: 'subj-dbms',
    topicId: 'dbms-top-4',
    topicTitle: 'ACID Properties',
    front: 'What does each letter in ACID stand for in DBMS transactions?',
    back: 'A: Atomicity (All or nothing)\nC: Consistency (Preserves database integrity constraints)\nI: Isolation (Concurrent executions yield same state as serial)\nD: Durability (Committed updates persist across power/system crashes)',
    mastered: true,
    tags: ['DBMS', 'Transactions']
  },
  {
    id: 'fc-5',
    subjectId: 'subj-daa',
    topicId: 'daa-top-4',
    topicTitle: 'Dynamic Programming',
    front: 'What is the recurrence relation for the 0/1 Knapsack problem?',
    back: 'dp[i][w] = max(\n  dp[i-1][w], // Skip item\n  val[i-1] + dp[i-1][w - wt[i-1]] // Take item (if wt[i-1] <= w)\n)',
    mastered: false,
    tags: ['DAA', 'DP', 'Coding Interviews']
  },
  {
    id: 'fc-6',
    subjectId: 'subj-cn',
    topicId: 'cn-top-5',
    topicTitle: 'TCP Handshake',
    front: 'Draw & describe the TCP 3-Way Handshake connection sequence.',
    back: '1. Client -> Server: SYN (seq = x)\n2. Server -> Client: SYN + ACK (seq = y, ack = x + 1)\n3. Client -> Server: ACK (seq = x + 1, ack = y + 1)',
    mastered: true,
    tags: ['Networks', 'TCP', 'Protocols']
  }
];
