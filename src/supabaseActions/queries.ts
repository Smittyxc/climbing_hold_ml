import { HoldInsert } from "@/lib/db_types"
import supabaseClient from "@/lib/supabaseClient"
import type { BoardWithHolds } from '@/lib/db_types';


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