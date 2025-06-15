-- Function to get categories with subcategories and calculated time usage
CREATE OR REPLACE FUNCTION get_user_categories(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  weekly_budget DECIMAL(5,2),
  time_used DECIMAL(5,2),
  color TEXT,
  goal_direction TEXT,
  is_archived BOOLEAN,
  sort_order INTEGER,
  subcategories JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.weekly_budget,
    COALESCE(te.total_time, 0) as time_used,
    c.color,
    c.goal_direction,
    c.is_archived,
    c.sort_order,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'name', s.name,
          'budget', s.budget,
          'timeUsed', COALESCE(ste.subcategory_time, 0),
          'goalDirection', s.goal_direction,
          'goalConfig', s.goal_config,
          'isFixed', s.is_fixed
        ) ORDER BY s.sort_order
      ) FILTER (WHERE s.id IS NOT NULL),
      '[]'::jsonb
    ) as subcategories
  FROM categories c
  LEFT JOIN (
    -- Calculate total time used per category for current week
    SELECT 
      category_id,
      SUM(duration_hours) as total_time
    FROM time_entries
    WHERE user_id = user_uuid
      AND entry_date >= date_trunc('week', CURRENT_DATE)
      AND entry_date < date_trunc('week', CURRENT_DATE) + interval '1 week'
    GROUP BY category_id
  ) te ON c.id = te.category_id
  LEFT JOIN subcategories s ON c.id = s.category_id
  LEFT JOIN (
    -- Calculate time used per subcategory for current week
    SELECT 
      subcategory_id,
      SUM(duration_hours) as subcategory_time
    FROM time_entries
    WHERE user_id = user_uuid
      AND subcategory_id IS NOT NULL
      AND entry_date >= date_trunc('week', CURRENT_DATE)
      AND entry_date < date_trunc('week', CURRENT_DATE) + interval '1 week'
    GROUP BY subcategory_id
  ) ste ON s.id = ste.subcategory_id
  WHERE c.user_id = user_uuid
  GROUP BY c.id, c.name, c.weekly_budget, c.color, c.goal_direction, c.is_archived, c.sort_order, te.total_time
  ORDER BY c.sort_order, c.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update category time usage (called when time entries change)
CREATE OR REPLACE FUNCTION update_category_time_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update category time_used
  UPDATE categories 
  SET time_used = (
    SELECT COALESCE(SUM(duration_hours), 0)
    FROM time_entries
    WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
      AND entry_date >= date_trunc('week', CURRENT_DATE)
      AND entry_date < date_trunc('week', CURRENT_DATE) + interval '1 week'
  )
  WHERE id = COALESCE(NEW.category_id, OLD.category_id);

  -- Update subcategory time_used if applicable
  IF COALESCE(NEW.subcategory_id, OLD.subcategory_id) IS NOT NULL THEN
    UPDATE subcategories
    SET time_used = (
      SELECT COALESCE(SUM(duration_hours), 0)
      FROM time_entries
      WHERE subcategory_id = COALESCE(NEW.subcategory_id, OLD.subcategory_id)
        AND entry_date >= date_trunc('week', CURRENT_DATE)
        AND entry_date < date_trunc('week', CURRENT_DATE) + interval '1 week'
    )
    WHERE id = COALESCE(NEW.subcategory_id, OLD.subcategory_id);
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to update time usage
CREATE TRIGGER update_time_usage_on_insert
  AFTER INSERT ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_category_time_usage();

CREATE TRIGGER update_time_usage_on_update
  AFTER UPDATE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_category_time_usage();

CREATE TRIGGER update_time_usage_on_delete
  AFTER DELETE ON time_entries
  FOR EACH ROW EXECUTE FUNCTION update_category_time_usage();
