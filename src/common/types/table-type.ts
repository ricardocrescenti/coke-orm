import { TableMetadata } from "../../metadata/tables/table-metadata";

export type TableConstructor<T = any> = { new (): T };

export type EntityParameter<T> = TableMetadata | TableConstructor<T> | string;