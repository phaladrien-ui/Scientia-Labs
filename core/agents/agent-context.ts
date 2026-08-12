import type { EventBus } from "../communication/event-bus";
import type { CapabilityRegistry } from "../capabilities/capability-registry";
import type { LLMProviderRegistry } from "../models/llm-provider-registry";
import type { Mission } from "../missions/mission";
import type { Task } from "../missions/task";

export interface AgentContext {
  readonly eventBus: EventBus;
  readonly capabilities: CapabilityRegistry;
  readonly llmProviders: LLMProviderRegistry;
  readonly mission: Mission;
  readonly task: Task;
}