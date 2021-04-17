export type QueryOrder<T> = { 
   [P in keyof T]?: 'ASC' | 'DESC' } | { [key: string]: 'ASC' | 'DESC' 
}