import { createContext, use } from "react";
import type { Messenger } from "../messenger.ts";

export const MessengerContext = createContext<Messenger | null>(null);

export function useMessenger(): Messenger {
  const messenger = use(MessengerContext);

  if (!messenger) throw new Error("MessengerContext.Provider is missing");

  return messenger;
}
