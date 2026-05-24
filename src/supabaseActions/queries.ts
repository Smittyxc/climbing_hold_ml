import { HoldInsert } from "@/lib/db_types"
import supabaseClient from "@/lib/supabaseClient"
import type { BoardWithHolds, RouteHoldInsert } from '@/lib/db_types';


export async function getBoardsByUserId(id: string | undefined) {
  if (!id) {
    return []
  }
  const { data, error } = await supabaseClient
    .from('boards')
    .select('*')
    .eq('user_id', id)

  if (error) {
    console.error('Error retreiving board:', error.message)
  }

  return data
}

export async function getBoardById(id: string) {
  const { data, error } = await supabaseClient
    .from('boards')
    .select(`*,
      holds(*)  
    `)
    .eq('id', id)

  if (error) {
    console.error('Error retreiving board:', error.message)
  }

  return data
}

export async function uploadBoard(
  name: string,
  imageUrl: string,
  userId: string
) {
  const response = await supabaseClient
    .from('boards')
    .insert({
      name: name,
      image_url: imageUrl,
      user_id: userId
    })
    .select('id')
    .single();

  return response
}

// export async function getBoardImageByUserId(
//   imageUrl: string,
//   userId: string
// ) {
//   const response = await supabaseClient
//     .storage
//     .from('board-images')
//     .getPublicUrl()
//     .eq();

//   return response
// }

export async function uploadBoardImage(fileName: string, imageFile: File) {
  const response = await supabaseClient.storage
    .from('board-images')
    .upload(fileName, imageFile);

  return response
}

export async function uploadHolds(holds: HoldInsert[]) {
  const response = await supabaseClient
    .from('holds')
    .insert(holds);

  return response
}

export async function getBoardWithHolds(boardId: string): Promise<BoardWithHolds | null> {
  const { data, error } = await supabaseClient
    .from('boards')
    .select(`
      *,
      holds ( * )
    `)
    .eq('id', boardId)
    .single();

  if (error) {
    console.error('Error retrieving board details:', error.message);
    return null;
  }

  return data;
}

export async function getRouteHoldsById(id: string | undefined) {
  if (!id) return []

  const { data, error } = await supabaseClient
    .from('route_holds')
    .select('*')
    .eq('route_id', id);

  if (error) {
    console.error('Error retrieving board details:', error.message);
    return null;
  }

  return data;
}

export async function getRouteDetailsById(routeId: string | undefined) {
  if (!routeId) return null

  const { data, error } = await supabaseClient
    .from('routes')
    .select('name, grade')
    .eq('id', routeId)
    .single();

  if (error) {
    console.error('Error retrieving board details:', error.message);
    return null;
  }

  return data;
}

export async function saveRoute(
  boardId: string,
  routeName: string,
  routeGrade: string,
  userId: string

) {

  const { data: routeData, error: routeError } = await supabaseClient
    .from('routes')
    .insert({
      board_id: boardId,
      user_id: userId,
      name: routeName,
      grade: routeGrade,
    })
    .select('*')
    .single();

  if (routeError) throw routeError;

  return routeData
}

export async function updateRoute(
  routeId: string,
  routeName: string,
  routeGrade: string,
) {

  const { error: routeError } = await supabaseClient
    .from('routes')
    .update({
      name: routeName,
      grade: routeGrade,
    })
    .eq('id', routeId);

  if (routeError) throw routeError;
}

export async function deleteRouteHolds(routeId: string) {
  const { error: deleteError } = await supabaseClient
    .from('route_holds')
    .delete()
    .eq('route_id', routeId);

  if (deleteError) throw deleteError;
}

export async function addRouteHolds(payload: RouteHoldInsert[]) {
  const { error: holdsError } = await supabaseClient
    .from('route_holds')
    .insert(payload);

  if (holdsError) throw holdsError;

}

export async function getRoutesByUserId(userId: string) {
  const { data, error } = await supabaseClient
    .from('routes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false }); // Show newest routes first

  if (error) {
    console.error('Error retrieving routes:', error.message);
    return [];
  }

  return data;
}

