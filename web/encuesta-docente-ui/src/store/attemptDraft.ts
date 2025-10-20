// src/store/attemptDraft.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type LikertMap = Record<string, number>; // question_id -> 1..5
type Texts = { positivos?: string; mejorar?: string; comentarios?: string };

type Draft = {
  step1: LikertMap;
  step2: LikertMap;
  textos: Texts;
};

type State = {
  drafts: Record<string, Draft>; // attemptId -> Draft

  // setters
  setLikert: (
    attemptId: string,
    step: 1 | 2,
    qid: string,
    value: number
  ) => void;
  setText: (attemptId: string, key: keyof Texts, value: string) => void;

  // getters/helpers
  getStepLikerts: (attemptId: string, step: 1 | 2) => LikertMap;
  getTexts: (attemptId: string) => Texts;

  /** Migra datos guardados con las claves antiguas de localStorage si existen */
  hydrateFromLocalLegacy: (attemptId: string) => void;

  /** Limpia el borrador del intento (tras enviar) */
  clearAttempt: (attemptId: string) => void;
};

export const useAttemptDraft = create<State>()(
  persist(
    (set, get) => ({
      drafts: {},

      setLikert: (attemptId, step, qid, value) =>
        set((s) => {
          const d: Draft = s.drafts[attemptId] ?? {
            step1: {},
            step2: {},
            textos: {},
          };
          const which = step === 1 ? "step1" : "step2";
          return {
            drafts: {
              ...s.drafts,
              [attemptId]: {
                ...d,
                [which]: { ...d[which], [qid]: value },
              },
            },
          };
        }),

      setText: (attemptId, key, value) =>
        set((s) => {
          const d: Draft = s.drafts[attemptId] ?? {
            step1: {},
            step2: {},
            textos: {},
          };
          return {
            drafts: {
              ...s.drafts,
              [attemptId]: { ...d, textos: { ...d.textos, [key]: value } },
            },
          };
        }),

      getStepLikerts: (attemptId, step) => {
        const d = get().drafts[attemptId];
        if (!d) return {};
        return step === 1 ? d.step1 : d.step2;
      },

      getTexts: (attemptId) => {
        const d = get().drafts[attemptId];
        return d?.textos ?? {};
      },

      hydrateFromLocalLegacy: (attemptId) => {
        // step1 (antes era un objeto {question_id: value})
        const s1 = localStorage.getItem(`attempt:${attemptId}:step1`);
        // step2 (antes era { vals, positivos, mejorar, comentarios })
        const s2 = localStorage.getItem(`attempt:${attemptId}:step2`);

        if (s1) {
          try {
            const obj = JSON.parse(s1);
            const step1: LikertMap = Array.isArray(obj)
              ? Object.fromEntries(
                  obj.map((a: any) => [a.question_id, a.value])
                )
              : obj ?? {};
            set((s) => {
              const d: Draft = s.drafts[attemptId] ?? {
                step1: {},
                step2: {},
                textos: {},
              };
              return { drafts: { ...s.drafts, [attemptId]: { ...d, step1 } } };
            });
          } catch {}
        }

        if (s2) {
          try {
            const obj = JSON.parse(s2);
            const step2: LikertMap = obj?.vals ?? {};
            const textos: Texts = {
              positivos: obj?.positivos || "",
              mejorar: obj?.mejorar || "",
              comentarios: obj?.comentarios || "",
            };
            set((s) => {
              const d: Draft = s.drafts[attemptId] ?? {
                step1: {},
                step2: {},
                textos: {},
              };
              return {
                drafts: { ...s.drafts, [attemptId]: { ...d, step2, textos } },
              };
            });
          } catch {}
        }
      },

      clearAttempt: (attemptId) =>
        set((s) => {
          const next = { ...s.drafts };
          delete next[attemptId];
          return { drafts: next };
        }),
    }),
    {
      name: "attempt-drafts",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
