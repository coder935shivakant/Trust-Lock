import React, { useState, useEffect } from 'react';
import { sha256 } from '../services/crypto';
import confetti from 'canvas-confetti';
import { useBlockchain } from '../context/BlockchainContext';
import {
  Sparkles,
  Lock,
  Boxes,
  Shield,
  HelpCircle,
  Award,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Key,
  ShieldCheck,
  Check,
  X,
  FileCheck,
  Star,
} from 'lucide-react';

interface StudentBadge {
  id: 'cryptographer' | 'blockchain_expert' | 'cadet';
  name: string;
  description: string;
  icon: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  unlocked: boolean;
  unlockedAt?: number;
  verificationHash?: string;
  lessonRequired: string;
}

export const KidsAcademyView: React.FC = () => {
  const { currentWallet } = useBlockchain();

  // Badges State with localStorage persistence
  const [badges, setBadges] = useState<Record<string, StudentBadge>>(() => {
    const saved = localStorage.getItem('trustlock_student_badges');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      cryptographer: {
        id: 'cryptographer',
        name: 'Cryptographer',
        description: 'Mastered SHA-256 one-way hashing, digital fingerprints, and the cryptographic Avalanche Effect.',
        icon: '🔐',
        color: 'text-amber-400',
        borderColor: 'border-amber-500/40',
        bgGradient: 'from-amber-950/40 via-slate-900 to-amber-950/20',
        unlocked: false,
        lessonRequired: 'Lesson 2: Interactive Hash Lab & Avalanche Challenge',
      },
      blockchain_expert: {
        id: 'blockchain_expert',
        name: 'Blockchain Expert',
        description: 'Successfully constructed and cryptographically chained blocks using parent hash pointers.',
        icon: '⚡',
        color: 'text-sky-400',
        borderColor: 'border-sky-500/40',
        bgGradient: 'from-sky-950/40 via-slate-900 to-indigo-950/20',
        unlocked: false,
        lessonRequired: 'Lesson 3: The Block Linker & Consensus Simulation',
      },
      cadet: {
        id: 'cadet',
        name: 'Escrow Cadet',
        description: 'Completed the full Escrow and Smart Contract safety challenge with 100% accuracy.',
        icon: '🛡️',
        color: 'text-emerald-400',
        borderColor: 'border-emerald-500/40',
        bgGradient: 'from-emerald-950/40 via-slate-900 to-emerald-950/20',
        unlocked: false,
        lessonRequired: 'Lesson 4: Academy Challenge Quiz',
      },
    };
  });

  // Certificate Modal State
  const [activeCertificate, setActiveCertificate] = useState<StudentBadge | null>(null);

  // --- Lesson 2: Cryptographer Interactive Lab State ---
  const [inputText, setInputText] = useState('Hello Blockchain!');
  const [hashOutput, setHashOutput] = useState('');
  const [avalancheSampleA, setAvalancheSampleA] = useState('MagicKey');
  const [avalancheSampleB, setAvalancheSampleB] = useState('MagicKey!');
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');
  const [avalancheCompleted, setAvalancheCompleted] = useState(false);
  const [customTyped, setCustomTyped] = useState(false);

  // --- Lesson 3: Blockchain Expert Interactive Block Assembly State ---
  const [assemblyStep, setAssemblyStep] = useState<1 | 2 | 3>(1);
  const [builderSender, setBuilderSender] = useState('Alice');
  const [builderRecipient, setBuilderRecipient] = useState('Bob');
  const [builderAmount, setBuilderAmount] = useState('2.5');
  const [selectedParentHash, setSelectedParentHash] = useState('');
  const [minedBlockOutput, setMinedBlockOutput] = useState<{
    hash: string;
    merkleRoot: string;
    nonce: number;
    prevHash: string;
  } | null>(null);
  const [isMiningAssembly, setIsMiningAssembly] = useState(false);

  // --- Lesson 4: Quiz State ---
  const [quizAnswers, setQuizAnswers] = useState<{ [q: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Save badges whenever changed
  useEffect(() => {
    localStorage.setItem('trustlock_student_badges', JSON.stringify(badges));
  }, [badges]);

  // Compute live hash for lesson 2
  useEffect(() => {
    async function updateHash() {
      if (!inputText) {
        setHashOutput('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      } else {
        const computed = await sha256(inputText);
        setHashOutput(computed);
      }
    }
    updateHash();
  }, [inputText]);

  // Compute Avalanche effect sample hashes
  useEffect(() => {
    async function updateAvalanche() {
      const hA = await sha256(avalancheSampleA);
      const hB = await sha256(avalancheSampleB);
      setHashA(hA);
      setHashB(hB);
    }
    updateAvalanche();
  }, [avalancheSampleA, avalancheSampleB]);

  // Helper to unlock badge
  const unlockBadge = async (badgeId: 'cryptographer' | 'blockchain_expert' | 'cadet') => {
    if (badges[badgeId]?.unlocked) return;

    const vHash = '0x' + (await sha256(`${badgeId}:${currentWallet.address}:${Date.now()}`)).substring(0, 36);

    setBadges(prev => ({
      ...prev,
      [badgeId]: {
        ...prev[badgeId],
        unlocked: true,
        unlockedAt: Date.now(),
        verificationHash: vHash,
      },
    }));

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });
  };

  // Lesson 2 Handler: Complete Cryptographer requirement
  const handleCompleteAvalanche = async () => {
    setAvalancheCompleted(true);
    await unlockBadge('cryptographer');
  };

  // Lesson 3 Handler: Mine Block to earn Blockchain Expert badge
  const validPrevHash = '0x0000a891fcb88204194c7b892a019488b172a...block#2';
  const handleMineAssemblyBlock = async () => {
    if (!selectedParentHash) return;
    setIsMiningAssembly(true);

    const txPayload = `${builderSender}->${builderRecipient}:${builderAmount} ETH`;
    const merkle = await sha256(txPayload);
    const nonce = 142;
    const finalHash = await sha256(`3:${selectedParentHash}:${merkle}:${nonce}`);

    setTimeout(async () => {
      setMinedBlockOutput({
        hash: finalHash,
        merkleRoot: merkle,
        nonce,
        prevHash: selectedParentHash,
      });
      setIsMiningAssembly(false);
      setAssemblyStep(3);
      await unlockBadge('blockchain_expert');
    }, 800);
  };

  // Lesson 4 Quiz Questions
  const quizQuestions = [
    {
      id: 1,
      question: 'What is an escrow in simple words?',
      options: [
        'A magical locked vault that holds money until both buyer and seller are happy',
        'A big bank building with long lines and paper forms',
        'A secret video game cheat code',
      ],
      correct: 0,
      explanation: 'Correct! An escrow holds funds safely in code so unknown strangers can trade without worrying.',
    },
    {
      id: 2,
      question: 'What happens if someone changes just one letter in a blockchain message?',
      options: [
        'Nothing happens at all',
        'The entire SHA-256 digital fingerprint scrambles completely (Avalanche Effect)',
        'The computer shuts down',
      ],
      correct: 1,
      explanation: 'Spot on! This is called the Avalanche Effect, making it impossible to secretly tamper with past blocks.',
    },
    {
      id: 3,
      question: 'What happens if a seller does not deliver before the deadline timer runs out?',
      options: [
        'The buyer loses their money forever',
        'The smart contract allows the buyer to claim a 100% refund',
        'The computer creates a million new coins',
      ],
      correct: 1,
      explanation: 'Exactly! The smart contract code automatically protects buyers with a deadline timeout refund.',
    },
  ];

  const handleSelectAnswer = (qId: number, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleGradeQuiz = async () => {
    let score = 0;
    quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correct) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score === quizQuestions.length) {
      await unlockBadge('cadet');
    }
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const earnedCount = Object.values(badges).filter(b => b.unlocked).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Welcome with Blocky */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-950 via-indigo-900 to-purple-950 border border-indigo-700/50 p-6 sm:p-8 shadow-2xl text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kids &amp; Students Interactive Academy</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Earn Verified Badges With Blocky!
            </h1>
            <p className="text-sm text-indigo-200 max-w-xl leading-relaxed">
              Complete interactive cryptographic experiments and block chaining simulations below to earn official, verifiable <strong className="text-amber-300 font-semibold">'Cryptographer'</strong> and <strong className="text-sky-300 font-semibold">'Blockchain Expert'</strong> student badges!
            </p>
          </div>

          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-4 border-amber-400/60 shadow-2xl shadow-amber-500/20 shrink-0 bg-indigo-950">
            <img
              src="/src/assets/images/escrow_vault_mascot_1791113025713.jpg"
              alt="Blocky the Vault Guardian"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* STUDENT BADGES TROPHY SHELF */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span>Student Explorer Trophy Shelf</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete the interactive lessons to unlock and display each cryptographic achievement
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
              {earnedCount} / {Object.keys(badges).length} Badges Earned
            </span>
          </div>
        </div>

        {/* Badge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(badges).map(badge => (
            <div
              key={badge.id}
              onClick={() => badge.unlocked && setActiveCertificate(badge)}
              className={`relative p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                badge.unlocked
                  ? `bg-gradient-to-br ${badge.bgGradient} ${badge.borderColor} cursor-pointer hover:scale-[1.02] shadow-lg`
                  : 'bg-slate-950/60 border-slate-800/80 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center text-2xl shadow">
                    {badge.icon}
                  </div>
                  {badge.unlocked ? (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Unlocked!
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded-full">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className={`text-base font-bold ${badge.unlocked ? 'text-white' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                {badge.unlocked ? (
                  <span className="text-sky-300 font-medium hover:underline flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" /> View Certificate &rarr;
                  </span>
                ) : (
                  <span className="text-slate-400 italic">
                    {badge.lessonRequired}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lesson 1: The Magic Treasure Chest Story */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Lesson 1</span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              The Magic Treasure Chest (What is Escrow?)
            </h2>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Imagine <strong className="text-sky-300">Alice</strong> wants to buy a custom hand-built robot toy from <strong className="text-emerald-300">Bob</strong>.
          They live thousands of miles apart and don't know each other.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-1">
            <div className="text-sm font-bold text-rose-400">The Big Problem:</div>
            <p className="text-xs text-slate-300">
              If Alice sends her coins first, Bob might run away with the money and never send the toy!
              If Bob sends the toy first, Alice might keep the toy and never pay Bob!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 space-y-1">
            <div className="text-sm font-bold text-emerald-400">The Escrow Solution:</div>
            <p className="text-xs text-slate-300">
              Alice puts the coins into <strong className="text-white">Blocky's Magic Chest (Smart Contract)</strong>.
              The coins are safely locked! Bob sees the coins are guaranteed, builds the robot, and delivers it.
              Once Alice verifies the toy, the chest unlocks and gives the coins to Bob!
            </p>
          </div>
        </div>
      </div>

      {/* LESSON 2: Hands-On Cryptographer Lab -> Earn 'Cryptographer' Badge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Lesson 2</span>
                <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Earns 'Cryptographer' Badge
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                The Digital Fingerprint Lab (SHA-256 Hashing)
              </h2>
            </div>
          </div>

          {badges.cryptographer.unlocked && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              🔐 Cryptographer Earned!
            </span>
          )}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          In cryptography, a <strong>Hash Function</strong> turns any message into a fixed 64-character digital fingerprint. Complete the two experiments below to earn your <strong>Cryptographer Badge</strong>:
        </p>

        {/* Experiment 1: Live Hash Generator */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-200">Step 1: Test any custom text fingerprint</span>
            <span className="text-slate-400 font-mono">Algorithm: SHA-256</span>
          </div>

          <input
            type="text"
            value={inputText}
            onChange={e => {
              setInputText(e.target.value);
              setCustomTyped(true);
            }}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm font-medium text-white focus:outline-none focus:border-amber-400 transition-colors"
            placeholder="Type anything (e.g. Robot, Dragon, Alice)..."
          />

          <div className="flex flex-wrap gap-2 pt-0.5">
            {['Alice', 'Bob', 'Alice.', 'Toy Robot', '999 ETH'].map(sample => (
              <button
                key={sample}
                onClick={() => {
                  setInputText(sample);
                  setCustomTyped(true);
                }}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors font-mono"
              >
                "{sample}"
              </button>
            ))}
          </div>

          <div className="pt-2">
            <div className="text-[11px] text-slate-400 mb-1 font-semibold flex items-center justify-between">
              <span>SHA-256 Output Digest:</span>
              <span className="text-emerald-400">256-bit hexadecimal string</span>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/30 font-mono text-xs sm:text-sm text-emerald-300 break-all shadow-inner">
              {hashOutput}
            </div>
          </div>
        </div>

        {/* Experiment 2: The Avalanche Effect Challenge */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/20 border border-amber-600/30 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Step 2: Witness The Avalanche Effect (1 Character Difference)</span>
            </span>
            <span className="text-[11px] text-slate-400">Look at how radically different both hashes are!</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono">Input A: <strong className="text-white">"{avalancheSampleA}"</strong></span>
              <div className="font-mono text-[11px] text-amber-300 break-all p-2 rounded bg-slate-900 border border-slate-850">
                {hashA}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 font-mono">Input B: <strong className="text-amber-400">"{avalancheSampleB}"</strong> (added one '!')</span>
              <div className="font-mono text-[11px] text-sky-300 break-all p-2 rounded bg-slate-900 border border-slate-850">
                {hashB}
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-300">
              Even a tiny 1-letter change completely randomizes the entire 64-character hash. This mathematical rule prevents anyone from falsifying escrow agreements!
            </p>

            {!badges.cryptographer.unlocked ? (
              <button
                onClick={handleCompleteAvalanche}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Award className="w-4 h-4" />
                <span>Claim 'Cryptographer' Badge</span>
              </button>
            ) : (
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                <span>Badge Claimed &amp; Stored in Trophy Shelf!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LESSON 3: The Blockchain Train & Block Assembly -> Earn 'Blockchain Expert' Badge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Lesson 3</span>
                <span className="text-[11px] font-semibold text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  Earns 'Blockchain Expert' Badge
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                The Block Linker &amp; Consensus Simulator
              </h2>
            </div>
          </div>

          {badges.blockchain_expert.unlocked && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-500/30">
              ⚡ Blockchain Expert Earned!
            </span>
          )}
        </div>

        <p className="text-sm text-slate-300 leading-relaxed">
          Blocks don't just sit alone—they are chained together. A new block MUST embed the exact hash of the preceding block to become valid across all computers.
          Assemble and link Block #3 below to earn your <strong>Blockchain Expert Badge</strong>!
        </p>

        {/* Interactive Block Builder Sandbox */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
            <span className="font-bold text-white flex items-center gap-2">
              <span>Assembling Carriage: Block #3</span>
            </span>
            <span className="text-slate-400">Step {assemblyStep} of 3</span>
          </div>

          {assemblyStep === 1 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 font-semibold">
                1. Choose the genuine Parent Hash pointer from Block #2:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedParentHash(validPrevHash)}
                  className={`p-3 rounded-xl border text-left transition-colors font-mono ${
                    selectedParentHash === validPrevHash
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                      : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] text-emerald-400 mb-0.5 font-sans font-semibold">Option A (Valid Block #2 Hash):</div>
                  <div className="truncate">{validPrevHash}</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedParentHash('0x9999_fake_unverified_hash_break_chain')}
                  className={`p-3 rounded-xl border text-left transition-colors font-mono ${
                    selectedParentHash === '0x9999_fake_unverified_hash_break_chain'
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-855 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-[10px] text-rose-400 mb-0.5 font-sans font-semibold">Option B (Forged Random Hash):</div>
                  <div className="truncate">0x9999_fake_unverified_hash_break_chain</div>
                </button>
              </div>

              {selectedParentHash && selectedParentHash !== validPrevHash && (
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
                  ⚠️ Warning: If you choose an unverified parent hash, the cryptographic link will sever! Pick Option A.
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  disabled={selectedParentHash !== validPrevHash}
                  onClick={() => setAssemblyStep(2)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <span>Next: Configure Escrow Transaction</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {assemblyStep === 2 && (
            <div className="space-y-3">
              <div className="text-xs text-slate-300 font-semibold">
                2. Pack an Escrow Transaction into Block #3:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Buyer (From):</label>
                  <input
                    type="text"
                    value={builderSender}
                    onChange={e => setBuilderSender(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Seller (To):</label>
                  <input
                    type="text"
                    value={builderRecipient}
                    onChange={e => setBuilderRecipient(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Escrow Amount (ETH):</label>
                  <input
                    type="text"
                    value={builderAmount}
                    onChange={e => setBuilderAmount(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setAssemblyStep(1)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  &larr; Back to Parent Hash
                </button>

                <button
                  onClick={handleMineAssemblyBlock}
                  disabled={isMiningAssembly}
                  className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isMiningAssembly ? 'animate-spin' : ''}`} />
                  <span>{isMiningAssembly ? 'Computing SHA-256 Link...' : 'Mine & Seal Block #3'}</span>
                </button>
              </div>
            </div>
          )}

          {assemblyStep === 3 && minedBlockOutput && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Block #3 Sealed into Ledger Consensus!
                  </span>
                  <span className="font-mono">Nonce: {minedBlockOutput.nonce}</span>
                </div>
                <div className="font-mono text-slate-300 text-[11px] break-all bg-slate-900/80 p-2 rounded border border-slate-800">
                  New Block Hash: {minedBlockOutput.hash}
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Parent Link: {minedBlockOutput.prevHash}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <p className="text-xs text-slate-300">
                  🎉 Congratulations! You created a cryptographically unbroken blockchain link.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssemblyStep(1);
                      setMinedBlockOutput(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Build Another Block
                  </button>
                  <button
                    onClick={() => setActiveCertificate(badges.blockchain_expert)}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Blockchain Expert Badge</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lesson 4: Mini Quiz & Cadet Badge Challenge */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">Lesson 4</span>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Earns 'Escrow Cadet' Badge
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Blockchain Cadet Quiz
              </h2>
            </div>
          </div>
          {quizSubmitted && (
            <button
              onClick={handleResetQuiz}
              className="text-xs text-sky-400 hover:text-white flex items-center gap-1 font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>

        <div className="space-y-5">
          {quizQuestions.map(q => {
            const chosen = quizAnswers[q.id];
            const isCorrect = chosen === q.correct;
            return (
              <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">
                  {q.id}. {q.question}
                </div>
                <div className="space-y-1.5 pt-1">
                  {q.options.map((opt, idx) => {
                    const isSelected = chosen === idx;
                    let style = 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700';

                    if (quizSubmitted) {
                      if (idx === q.correct) {
                        style = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                      } else if (isSelected && !isCorrect) {
                        style = 'bg-rose-500/20 border-rose-500 text-rose-300';
                      }
                    } else if (isSelected) {
                      style = 'bg-sky-500/20 border-sky-400 text-white font-semibold';
                    }

                    return (
                      <button
                        key={idx}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectAnswer(q.id, idx)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-colors flex items-center justify-between ${style}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && idx === q.correct && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {quizSubmitted && (
                  <p className="text-[11px] text-slate-400 pt-1 italic">
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!quizSubmitted ? (
          <button
            onClick={handleGradeQuiz}
            disabled={Object.keys(quizAnswers).length < quizQuestions.length}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4" />
            <span>Check My Answers &amp; Earn Cadet Badge</span>
          </button>
        ) : (
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 text-center space-y-3">
            <div className="text-3xl">🏆</div>
            <h3 className="text-lg font-bold text-white">
              You Scored {quizScore} / {quizQuestions.length}!
            </h3>
            <p className="text-xs text-indigo-200 max-w-md mx-auto">
              {quizScore === quizQuestions.length
                ? 'Outstanding! You understand cryptographic hashing, smart contracts, and decentralized escrow security!'
                : 'Great effort! Review the explanations above and try again to get a perfect score.'}
            </p>
            {quizScore === quizQuestions.length && (
              <button
                onClick={() => setActiveCertificate(badges.cadet)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-400/30 transition-colors"
              >
                <span>🛡️ View Escrow Cadet Certificate &rarr;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* VERIFIABLE CERTIFICATE MODAL */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border-2 border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-center space-y-4">
            <button
              onClick={() => setActiveCertificate(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 mx-auto flex items-center justify-center text-4xl shadow-lg">
              {activeCertificate.icon}
            </div>

            <div>
              <div className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">
                TrustLock Blockchain Academy
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                Certificate of Achievement
              </h2>
              <div className="text-xs text-slate-400 mt-0.5">
                Official Student Cryptographic Credential
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-slate-400">This certifies that</div>
              <div className="text-base font-bold text-sky-300 font-sans">
                {currentWallet.name} ({currentWallet.address.slice(0, 6)}...{currentWallet.address.slice(-4)})
              </div>
              <div className="text-slate-300">
                has successfully fulfilled all interactive requirements for the
              </div>
              <div className="text-sm font-bold text-amber-400 uppercase tracking-wide">
                '{activeCertificate.name}' Badge
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                {activeCertificate.description}
              </p>
            </div>

            <div className="text-[10px] font-mono text-slate-500 break-all p-2 rounded bg-slate-950/60 border border-slate-850">
              SHA-256 Credential Seal: {activeCertificate.verificationHash || '0x498a3b819e01...verified'}
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => setActiveCertificate(null)}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-colors"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
