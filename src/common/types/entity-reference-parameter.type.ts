import { EntityMetadata } from "../../metadata";
import { ConstructorTo } from "./constructor-to.type";

export type EntityReferenceParameter<T> = EntityMetadata | ConstructorTo<T> | string;