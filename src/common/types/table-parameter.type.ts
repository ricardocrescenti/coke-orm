import { TableMetadata } from "../../metadata/tables/table-metadata";
import { ConstructorTo } from "./constructor-to.type";

export type TableParameter<T> = TableMetadata | ConstructorTo<T> | string;