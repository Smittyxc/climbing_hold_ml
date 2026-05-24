import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { HoldInsert } from '@/lib/db_types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface RawHoldData {
  coords: [number, number, number, number]; // [x, y, width, height]
}

export function buildHoldsFromJson(jsonData: RawHoldData[], boardId: string): HoldInsert[] {
  return jsonData.map((item) => ({
    board_id: boardId,
    coord_a: item.coords[0], // x
    coord_b: item.coords[1], // y
    coord_c: item.coords[2], // width
    coord_d: item.coords[3], // height
  }));
}