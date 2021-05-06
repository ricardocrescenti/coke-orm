export type QueryOrder<T> = QueryOrderColumn<T> | QueryOrderGeneric;

type QueryOrderColumn<T> = { 
   [P in keyof T]?: ('ASC' | 'DESC') | QueryOrder<T[P]> 
}

type QueryOrderGeneric = { 
   [key: string]: ('ASC' | 'DESC' ) | QueryOrderGeneric
}