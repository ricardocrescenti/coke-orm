export type QueryValues<T> = { 
   [P in keyof T]?: any; } | { [key: string]: any; 
}