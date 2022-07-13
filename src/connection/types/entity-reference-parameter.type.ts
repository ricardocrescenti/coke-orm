import { EntityMetadata } from '../../metadata';
import { ConstructorTo } from '../../common/types/constructor-to.type';

export type EntityReferenceParameter<T> = EntityMetadata | ConstructorTo<T> | string;
