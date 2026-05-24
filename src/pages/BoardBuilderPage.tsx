import { useState } from 'react';
import supabaseClient from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buildHoldsFromJson, RawHoldData } from '@/lib/utils';

export default function BoardBuilder() {
  const [boardName, setBoardName] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [parsedHolds, setParsedHolds] = useState<RawHoldData[] | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleJsonSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJsonError(null);
    setParsedHolds(null);

    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawData = JSON.parse(e.target?.result as string);

        // Basic validation: Is it an array, and does the first item have coords?
        if (!Array.isArray(rawData) || (rawData.length > 0 && !rawData[0].coords)) {
          throw new Error('Invalid JSON format. Expected an array of objects with "coords".');
        }

        setParsedHolds(rawData as RawHoldData[]);
      } catch (err) {
        setJsonError(err instanceof Error ? err.message : 'Failed to parse JSON file.');
        event.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!boardName || !imageFile || !parsedHolds) return;

    setIsSubmitting(true);
    setSubmitError(null);
    let createdBoardId: string | null = null;
    let uploadedImagePath: string | null = null;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: imgData, error: imgError } = await supabaseClient.storage
        .from('board-images')
        .upload(fileName, imageFile);

      if (imgError) throw new Error(`Image upload failed: ${imgError.message}`);
      uploadedImagePath = imgData.path;

      const { data: { publicUrl } } = supabaseClient.storage
        .from('board-images')
        .getPublicUrl(uploadedImagePath);

      const { data: boardData, error: boardError } = await supabaseClient
        .from('boards')
        .insert({ name: boardName, image_url: publicUrl })
        .select('id')
        .single();

      if (boardError) throw new Error(`Board creation failed: ${boardError.message}`);
      createdBoardId = boardData.id;

      const holdsToInsert = buildHoldsFromJson(parsedHolds, createdBoardId);
      const { error: holdsError } = await supabaseClient
        .from('holds')
        .insert(holdsToInsert);

      if (holdsError) throw new Error(`Holds creation failed: ${holdsError.message}`);

      setSuccess(true);

    } catch (error) {
      console.error("Submission failed, rolling back...", error);

      if (createdBoardId) {
        await supabaseClient.from('boards').delete().eq('id', createdBoardId);
      }
      if (uploadedImagePath) {
        await supabaseClient.storage.from('board-images').remove([uploadedImagePath]);
      }

      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = boardName.trim() !== '' && imageFile !== null && parsedHolds !== null;

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto mt-10">
        <CardContent className="pt-6 text-center text-green-600">
          <h2 className="text-xl font-bold mb-2">Board Created Successfully!</h2>
          <p>Your board and {parsedHolds?.length} holds have been saved.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle>Create New Board</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {submitError && (
          <Alert variant="destructive">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="board-name">Board Name</Label>
          <Input
            id="board-name"
            placeholder="e.g. Garage Kilter Clone"
            value={boardName}
            onChange={(e) => setBoardName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload">Board Image</Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="json-upload">JSON Data</Label>
          <Input
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleJsonSelect}
          />
          {jsonError && <p className="text-sm text-red-500 mt-1">{jsonError}</p>}
          {parsedHolds && (
            <p className="text-sm text-green-600 mt-1">
              ✓ Valid JSON: Found {parsedHolds.length} holds.
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={!isFormValid || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Creating Board...' : 'Create Board'}
        </Button>
      </CardFooter>
    </Card>
  );
}