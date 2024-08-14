export interface IMysqlError extends Error {
 code: string;
 errno: number;
 sqlState: string;
 sqlMessage: string;
 sql: string;
};
