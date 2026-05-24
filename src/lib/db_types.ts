import { Database } from "../../database.types";

export type Board = Database['public']['Tables']['boards']['Row'];
export type BoardInsert = Database['public']['Tables']['boards']['Insert'];

export type Route = Database['public']['Tables']['routes']['Row'];
export type RouteInsert = Database['public']['Tables']['routes']['Insert'];

export type RouteHoldInsert = Database['public']['Tables']['route_holds']['Insert'];

export type Hold = Database['public']['Tables']['holds']['Row'];
export type HoldInsert = Database['public']['Tables']['holds']['Insert'];


export type HoldType = Database['public']['Enums']['hold_type'];



