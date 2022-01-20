import { config } from "dotenv";

config();

export const mnemonic = process.env.MNEMONIC as string;
export const nodeHTTP = process.env.NODE_HTTP as string;
