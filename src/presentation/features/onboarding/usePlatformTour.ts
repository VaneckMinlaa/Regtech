import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/react";
import { PLATFORM_TOUR_STORAGE_KEY } from "@/presentation/features/onboarding/platformTourSteps";

function storageKey(userId: string | undefined): string {
  return userId ? `${PLATFORM_TOUR_STORAGE_KEY}_${userId}` : PLATFORM_TOUR_STORAGE_KEY;
}

export function usePlatformTour() {
  const { user, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  const markCompleted = useCallback(() => {
    if (user?.id) {
      localStorage.setItem(storageKey(user.id), "completed");
    }
  }, [user?.id]);

  const startTour = useCallback((fromStep = 0) => {
    setStepIndex(fromStep);
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    setStepIndex(0);
    markCompleted();
  }, [markCompleted]);

  useEffect(() => {
    if (!isLoaded || hasCheckedStorage) return;
    setHasCheckedStorage(true);
    if (!user?.id) return;

    const done = localStorage.getItem(storageKey(user.id));
    if (!done) {
      const timer = window.setTimeout(() => startTour(0), 600);
      return () => window.clearTimeout(timer);
    }
  }, [isLoaded, user?.id, hasCheckedStorage, startTour]);

  const resetTour = useCallback(() => {
    if (user?.id) localStorage.removeItem(storageKey(user.id));
    startTour(0);
  }, [user?.id, startTour]);

  return {
    isOpen,
    stepIndex,
    setStepIndex,
    startTour,
    closeTour,
    resetTour,
  };
}
