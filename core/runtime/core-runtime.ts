
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { InMemoryEventBus } from "../communication/in-memory-event-bus";
import { CapabilityRegistry } from "../capabilities/capability-registry";
import { webSearchCapability } from "../capabilities/web-search/web-search";
import { LLMProviderRegistry } from "../models/llm-provider-registry";
import { DeepSeekProvider } from "../models/providers/deepseek-provider";
import { AgentRuntime } from "./agent-runtime";

export class CoreRuntime {
  readonly eventBus: InMemoryEventBus;
  readonly capabilities: CapabilityRegistry;
  readonly agents: AgentRuntime;
  readonly llmProviders: LLMProviderRegistry;

  constructor() {
    this.eventBus = new InMemoryEventBus();

    this.capabilities = new CapabilityRegistry();
    this.capabilities.register(webSearchCapability);

    this.llmProviders = new LLMProviderRegistry();
    this.llmProviders.register(new DeepSeekProvider());

    this.agents = new AgentRuntime();
  }
}
