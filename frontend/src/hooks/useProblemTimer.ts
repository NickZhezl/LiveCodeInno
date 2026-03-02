import { useEffect, useState, useRef } from "react";
import { submitLeaderboardEntry } from "../api/client";

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
        problemElapsedRef.current = 0;
      }

      // Reset for new problem
      problemStartTimeRef.current = Date.now();
      problemElapsedRef.current = 0;
      lastProblemIdRef.current = problemId;

      // Start timer locally
      setTimerState({
        isRunning: true,
        startTime: Date.now(),
        elapsed: 0,
      });
    }
  }, [problemId, roomId, userName]);

  // Save to leaderboard when problem is solved
  const recordSolve = async (
    problemTitle: string,
    language: string
  ): Promise<number> => {
    const finalTime = problemElapsedRef.current;

    // Stop the timer
    setTimerState({
      isRunning: false,
      startTime: null,
      elapsed: 0,
    });

    // Add to leaderboard via API
    await submitLeaderboardEntry(roomId, {
      user_name: userName,
      problem_id: problemId!,
      problem_title: problemTitle,
      time_seconds: finalTime,
      language,
    });

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
    };
  }, []);

  return {
    elapsedTime: problemElapsedRef.current,
    recordSolve,
  };
};
