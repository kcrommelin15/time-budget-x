-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories" ON categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (auth.uid() = user_id);

-- Subcategories policies (inherit from categories)
CREATE POLICY "Users can view subcategories of their categories" ON subcategories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM categories 
      WHERE categories.id = subcategories.category_id 
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert subcategories to their categories" ON subcategories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM categories 
      WHERE categories.id = subcategories.category_id 
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update subcategories of their categories" ON subcategories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM categories 
      WHERE categories.id = subcategories.category_id 
      AND categories.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete subcategories of their categories" ON subcategories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM categories 
      WHERE categories.id = subcategories.category_id 
      AND categories.user_id = auth.uid()
    )
  );

-- Time entries policies
CREATE POLICY "Users can view their own time entries" ON time_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time entries" ON time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time entries" ON time_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time entries" ON time_entries
  FOR DELETE USING (auth.uid() = user_id);
