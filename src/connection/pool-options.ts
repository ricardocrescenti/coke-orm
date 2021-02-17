export class PoolOptions {

   public readonly max: number;
   public readonly min: number;
   public readonly connectionTimeout: number;

   constructor(options?: PoolOptions) {
      this.max = options?.max ?? 10;
      this.min = options?.min ?? 0;
      this.connectionTimeout = options?.connectionTimeout ?? 15000;
   }
}