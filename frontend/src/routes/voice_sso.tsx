import { createFileRoute } from "@tanstack/react-router";
import { SSOPage } from "./voice-sso";

export const Route = createFileRoute("/voice_sso")({
  component: SSOPage,
});
