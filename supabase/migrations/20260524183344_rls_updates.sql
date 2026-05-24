CREATE POLICY "Anyone can view routes" 
ON routes FOR SELECT 
TO public 
USING (true);

CREATE POLICY "Anyone can view route holds" 
ON route_holds FOR SELECT 
TO public 
USING (true);

-- ==========================================
-- ROUTES TABLE POLICIES (INSERT/UPDATE/DELETE)
-- ==========================================
-- Users can only insert routes if they attach their own user ID
CREATE POLICY "Authenticated users can create routes"
ON routes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own routes
CREATE POLICY "Users can update their own routes"
ON routes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can only delete their own routes
CREATE POLICY "Users can delete their own routes"
ON routes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ==========================================
-- ROUTE_HOLDS TABLE POLICIES (INSERT/DELETE)
-- ==========================================
-- Users can only insert holds if they own the parent route
CREATE POLICY "Users can insert holds for their own routes"
ON route_holds FOR INSERT
TO authenticated
WITH CHECK (
  route_id IN (
    SELECT id FROM routes WHERE user_id = auth.uid()
  )
);

-- Users can only delete holds if they own the parent route
CREATE POLICY "Users can delete holds for their own routes"
ON route_holds FOR DELETE
TO authenticated
USING (
  route_id IN (
    SELECT id FROM routes WHERE user_id = auth.uid()
  )
);