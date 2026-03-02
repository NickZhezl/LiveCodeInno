import { useEffect, useState, useRef } from "react";
import { firestore } from "../main";
import { doc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

interface ProblemTimerState {
  isRunning: boolean;
  startTime: number | null;
  elapsed: number;
}

interface UseProblemTimerProps {
  roomId: string;
  userName: string;
  problemId: string | null;
}

export const useProblemTimer = ({
  roomId,
  userName,
  problemId,
}: UseProblemTimerProps) => {
  const [timerState, setTimerState] = useState<ProblemTimerState>({
    isRunning: false,
    startTime: null,
    elapsed: 0,
  });

  const problemStartTimeRef = useRef<number | null>(null);
  const problemElapsedRef = useRef<number>(0);
  const lastProblemIdRef = useRef<string | null>(null);
  const intervalRef = useRef<any>(null);

  // Listen to timer updates from Firebase
  useEffect(() => {
    if (!roomId || !problemId) return;

    const timerRef = doc(firestore, `rooms/${roomId}/timers/${problemId}`);
    const unsubscribe = onSnapshot(timerRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.[userName]) {
          const userTimer = data[userName];
          setTimerState({
            isRunning: userTimer.isRunning || false,
            startTime: userTimer.startTime || null,
            elapsed: userTimer.elapsed || 0,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [roomId, problemId, userName]);

  // Start/stop local timer counter
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (timerState.isRunning && timerState.startTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = Math.floor((now - timerState.startTime!) / 1000);
        problemElapsedRef.current = timerState.elapsed + diff;
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.startTime]);

  // Handle problem change - start new timer
  useEffect(() => {
    if (!roomId || !problemId || !userName) return;

    // If switching to a different problem
    if (problemId !== lastProblemIdRef.current) {
      // Save previous problem time if was running
      if (lastProblemIdRef.current && problemStartTimeRef.current) {
        saveProblemTime(lastProblemIdRef.current, problemElapsedRef.current);
      }

      // Reset for new problem
      problemStartTimeRef.current = Date.now();
      problemElapsedRef.current = 0;
      lastProblemIdRef.current = problemId;

      // Start timer in Firebase
      startProblemTimer(problemId);
    }
  }, [problemId, roomId, userName]);

  const startProblemTimer = async (pid: string) => {
    const timerRef = doc(firestore, `rooms/${roomId}/timers/${pid}`);
    await setDoc(
      timerRef,
      {
        [userName]: {
          isRunning: true,
          startTime: Date.now(),
          elapsed: 0,
          startedAt: serverTimestamp(),
        },
      },
      { merge: true }
    );
  };

  const saveProblemTime = async (pid: string, elapsed: number) => {
    const timerRef = doc(firestore, `rooms/${roomId}/timers/${pid}`);
    await setDoc(
      timerRef,
      {
        [userName]: {
          isRunning: false,
          startTime: null,
          elapsed: elapsed,
          lastSaved: serverTimestamp(),
        },
      },
      { merge: true }
    );
  };

  // Save to leaderboard when problem is solved
  const recordSolve = async (
    problemTitle: string,
    language: string
  ): Promise<number> => {
    const finalTime = problemElapsedRef.current;

    // Stop the timer
    await saveProblemTime(problemId!, finalTime);

    // Add to leaderboard
    const leaderboardRef = doc(
      firestore,
      `rooms/${roomId}/leaderboard/${userName}_${problemId}`
    );
    await setDoc(
      leaderboardRef,
      {
        userName,
        problemId: problemId!,
        problemTitle,
        timeSeconds: finalTime,
        timestamp: serverTimestamp(),
        language,
      },
      { merge: true }
    );

    // Reset timer state
    problemElapsedRef.current = 0;
    problemStartTimeRef.current = null;

    return finalTime;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (lastProblemIdRef.current && problemElapsedRef.current > 0) {
        saveProblemTime(lastProblemIdRef.current, problemElapsedRef.current);
      }
    };
  }, []);

  return {
    elapsedTime: problemElapsedRef.current,
    isRunning: timerState.isRunning,
    recordSolve,
  };
};
